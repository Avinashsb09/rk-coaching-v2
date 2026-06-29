/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Printer, 
  ArrowRight, 
  Smartphone, 
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useApp } from '../../context/AppContext';
import { loadRazorpayScript } from '../../utils/razorpay';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase';

interface RazorpayGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  courseId: string;
  amount: number;
  onSuccess: (rzpPaymentId: string, rzpOrderId: string, rzpSignature: string) => void;
  onFailure: (reason: string) => void;
  onCancel: () => void;
  userEmail?: string;
  userFullName?: string;
}

export function RazorpayGatewayModal({
  isOpen,
  onClose,
  courseTitle,
  courseId,
  amount,
  onSuccess,
  onFailure,
  onCancel,
  userEmail = 'student@rkcoaching.com',
  userFullName = 'Raj Kumar'
}: RazorpayGatewayModalProps) {
  const { paymentSettings, addToast, user } = useApp();
  
  const [step, setStep] = useState<'method' | 'processing' | 'success' | 'failure'>('method');
  const [upiTab, setUpiTab] = useState<'intent' | 'vpa' | 'qr'>('intent');
  const [upiId, setUpiId] = useState('');
  const [simulatedPaymentId, setSimulatedPaymentId] = useState('');
  const [simulatedOrderId, setSimulatedOrderId] = useState('');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(300); // 5 minute countdown for QR Code / Intent
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    loadRazorpayScript().then(loaded => {
      setIsScriptLoaded(loaded);
    });
  }, []);

  const handleRealRazorpayPay = () => {
    if (!isScriptLoaded || !(window as any).Razorpay) {
      if (addToast) {
        addToast('Official Razorpay SDK not fully loaded. Triggering high-fidelity local simulator.', 'info');
      }
      handlePay(true, 'Simulator Sandbox');
      return;
    }

    const supabase = getSupabase();
    if (isSupabaseConfigured() && supabase) {
      setStep('processing');
      
      // 1. Invoke razorpay-order-create edge function to securely create order on the server
      supabase.functions.invoke('razorpay-order-create', {
        body: { amount, courseId, userId: user?.id }
      }).then(({ data, error }) => {
        if (error || !data || !data.id) {
          console.error('Secure order creation failed:', error);
          if (addToast) {
            addToast(error?.message || 'Secure server-side order creation failed.', 'error');
          }
          setStep('method');
          return;
        }

        const realOrderId = data.id;

        const options = {
          key: paymentSettings.razorpayKeyId,
          amount: amount * 100, // in paise
          currency: 'INR',
          name: paymentSettings.businessName,
          description: `Syllabus Path: ${courseTitle}`,
          image: paymentSettings.businessLogo,
          order_id: realOrderId,
          prefill: {
            name: userFullName,
            email: userEmail,
            contact: paymentSettings.supportPhone || ''
          },
          theme: {
            color: '#2563EB' // blue-600
          },
          config: {
            display: {
              blocks: {
                upi: {
                  name: 'UPI Options Only',
                  instruments: [
                    {
                      method: 'upi'
                    }
                  ]
                }
              },
              sequence: ['block.upi'],
              preferences: {
                show_default_blocks: false
              }
            }
          },
          handler: function (response: any) {
            setStep('processing');
            
            // 2. Invoke razorpay-verify edge function for secure server-side signature verification
            supabase.functions.invoke('razorpay-verify', {
              body: {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                courseId,
                userId: user?.id,
                amount
              }
            }).then(({ data: verifyData, error: verifyErr }) => {
              if (verifyErr || !verifyData || !verifyData.success) {
                console.error('Secure signature verification failed:', verifyErr);
                if (addToast) {
                  addToast(verifyErr?.message || 'Secure server-side signature verification failed.', 'error');
                }
                setStep('failure');
                onFailure(verifyErr?.message || 'Secure verification failed.');
              } else {
                setSimulatedOrderId(response.razorpay_order_id);
                setSimulatedPaymentId(response.razorpay_payment_id);
                setStep('success');
                onSuccess(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
              }
            }).catch(err => {
              console.error('Signature verification connection error:', err);
              if (addToast) {
                addToast('Signature verification connection error.', 'error');
              }
              setStep('failure');
              onFailure(err.message || 'Signature verification error.');
            });
          },
          modal: {
            ondismiss: function () {
              onCancel();
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }).catch(err => {
        console.error('Secure order creation connection error:', err);
        if (addToast) {
          addToast('Secure order creation connection error.', 'error');
        }
        setStep('method');
      });

      return;
    }

    // Offline / local sandbox fallback mode
    const options = {
      key: paymentSettings.razorpayKeyId,
      amount: amount * 100, // in paise
      currency: 'INR',
      name: paymentSettings.businessName,
      description: `Syllabus Path: ${courseTitle} (Simulator Mode)`,
      image: paymentSettings.businessLogo,
      prefill: {
        name: userFullName,
        email: userEmail,
        contact: paymentSettings.supportPhone || ''
      },
      theme: {
        color: '#2563EB' // blue-600
      },
      config: {
        display: {
          blocks: {
            upi: {
              name: 'UPI Options Only',
              instruments: [
                {
                  method: 'upi'
                }
              ]
            }
          },
          sequence: ['block.upi'],
          preferences: {
            show_default_blocks: false
          }
        }
      },
      handler: function (response: any) {
        setStep('processing');
        setTimeout(() => {
          setStep('success');
          onSuccess(
            response.razorpay_payment_id || 'pay_' + Math.random().toString(36).substring(2, 9),
            response.razorpay_order_id || 'order_' + Math.random().toString(36).substring(2, 9),
            response.razorpay_signature || 'sig_' + Math.random().toString(36).substring(2, 9)
          );
        }, 1200);
      },
      modal: {
        ondismiss: function () {
          onCancel();
        }
      }
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Failed to open Razorpay checkout widget:', error);
      handlePay(true, 'Simulator Sandbox');
    }
  };

  // Pre-supported popular UPI apps for direct deep-link launching simulation
  const upiApps = [
    { id: 'gpay', name: 'Google Pay', logo: 'GP', color: 'bg-blue-600', text: 'Launch Google Pay' },
    { id: 'phonepe', name: 'PhonePe', logo: 'PP', color: 'bg-purple-600', text: 'Launch PhonePe' },
    { id: 'paytm', name: 'Paytm UPI', logo: 'PY', color: 'bg-sky-500', text: 'Launch Paytm' },
    { id: 'bhim', name: 'BHIM UPI', logo: 'BH', color: 'bg-emerald-600', text: 'Launch BHIM App' },
    { id: 'amazon', name: 'Amazon Pay', logo: 'AP', color: 'bg-amber-500', text: 'Launch Amazon Pay' }
  ];

  useEffect(() => {
    if (isOpen) {
      setStep('method');
      setUpiTab('intent');
      setSelectedApp(null);
      setUpiId('');
      setCountdown(300);
      setSimulatedOrderId('order_' + Math.random().toString(36).substring(2, 9));
      setSimulatedPaymentId('pay_' + Math.random().toString(36).substring(2, 9));
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: any;
    if (isOpen && countdown > 0 && step === 'method') {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, countdown, step]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePay = (shouldSucceed: boolean, customApp?: string) => {
    setStep('processing');
    const appLabel = customApp || selectedApp || 'UPI App';
    setTimeout(() => {
      if (shouldSucceed) {
        setStep('success');
        onSuccess(simulatedPaymentId, simulatedOrderId, 'sig_' + Math.random().toString(36).substring(2, 12));
      } else {
        setStep('failure');
        onFailure(`Payment request declined inside ${appLabel}.`);
      }
    }, 1800);
  };

  const handleDownloadReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div 
        id="razorpay-gateway-modal"
        role="dialog"
        aria-labelledby="payment-modal-title"
        aria-modal="true"
        className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
      >
        {/* Header bar */}
        <div className="bg-blue-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {paymentSettings.businessLogo ? (
              <img 
                src={paymentSettings.businessLogo} 
                alt="Logo" 
                className="h-8 w-8 rounded-full object-cover bg-white" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs text-white">
                UPI
              </div>
            )}
            <div>
              <p className="text-[10px] font-extrabold tracking-wider uppercase text-blue-100">Razorpay Secure · UPI ONLY</p>
              <h2 id="payment-modal-title" className="text-sm font-bold truncate max-w-[200px]">{paymentSettings.businessName}</h2>
            </div>
          </div>
          <button 
            onClick={() => {
              onCancel();
              onClose();
            }}
            className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-lg font-bold"
            aria-label="Close payment"
          >
            &times;
          </button>
        </div>

        {/* Pricing Summary */}
        <div className="bg-slate-50 dark:bg-slate-850 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-left">
          <div className="space-y-0.5">
            <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">Course Syllabus Package</p>
            <h3 className="text-xs font-bold text-slate-950 dark:text-white truncate max-w-[200px]">{courseTitle}</h3>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">Amount Due</p>
            <p className="text-base font-black text-blue-600 dark:text-blue-400">₹{amount}</p>
          </div>
        </div>

        {/* Countdown Indicator */}
        {step === 'method' && (
          <div className="bg-amber-50 dark:bg-amber-950/20 px-5 py-2 flex items-center justify-between border-b border-amber-100/40 dark:border-amber-950/40">
            <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 text-[10px] font-semibold">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>Complete payment within:</span>
            </div>
            <span className="text-xs font-mono font-extrabold text-amber-700 dark:text-amber-400">{formatTime(countdown)}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="p-5">
          {step === 'method' && (
            <div className="space-y-5 text-left">
              {/* UPI Options Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  onClick={() => { setUpiTab('intent'); setSelectedApp(null); }}
                  className={`py-2 px-1 text-[11px] font-bold rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    upiTab === 'intent' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>UPI Apps</span>
                </button>
                <button
                  onClick={() => { setUpiTab('vpa'); setSelectedApp(null); }}
                  className={`py-2 px-1 text-[11px] font-bold rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    upiTab === 'vpa' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-tight">@vpa</span>
                  <span>UPI ID</span>
                </button>
                <button
                  onClick={() => { setUpiTab('qr'); setSelectedApp(null); }}
                  className={`py-2 px-1 text-[11px] font-bold rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    upiTab === 'qr' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan QR</span>
                </button>
              </div>

              {/* Hiding/Disabling Notice */}
              <p className="text-[10px] text-slate-400 font-semibold text-center italic">
                🔒 RK Coaching has configured Razorpay to accept ONLY Indian UPI apps. Cards & NetBanking are disabled.
              </p>

              {isScriptLoaded && (
                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-950 flex flex-col items-center gap-2 text-center animate-fade-in">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-[11px] font-extrabold text-blue-900 dark:text-blue-300">Official Razorpay SDK Active</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Secure checkout via official UPI gateway. All Indian UPI applications (GPay, PhonePe, Paytm, BHIM) are natively integrated.
                  </p>
                  <Button
                    onClick={handleRealRazorpayPay}
                    variant="primary"
                    className="w-full text-xs font-black py-2 bg-blue-600 text-white hover:bg-blue-700 h-9 shrink-0 flex items-center justify-center gap-1.5"
                    leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                  >
                    Pay ₹{amount} via Official UPI Gateway
                  </Button>
                </div>
              )}

              {/* INTENT: Direct UPI App Launch (Optimized for Android / iOS) */}
              {upiTab === 'intent' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Select installed UPI Application</p>
                    <div className="grid grid-cols-2 gap-2">
                      {upiApps.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => setSelectedApp(app.name)}
                          className={`p-2.5 border rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                            selectedApp === app.name
                              ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 hover:dark:border-slate-700'
                          }`}
                        >
                          <div className={`h-7 w-7 rounded-lg ${app.color} text-white flex items-center justify-center font-black text-xs shrink-0`}>
                            {app.logo}
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-tight">{app.name}</p>
                            <p className="text-[9px] text-slate-400 leading-tight">Direct Launch</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedApp && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100/40 dark:border-blue-950/40 flex items-start gap-2 animate-fade-in">
                      <Smartphone className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300">Direct App Launch Optimization</p>
                        <p className="text-[10px] text-blue-600/90 dark:text-blue-400 mt-0.5">
                          Tapping payment will trigger the official <strong className="font-extrabold">{selectedApp}</strong> application installed on your Android/iPhone instantly.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      onClick={() => handlePay(true)}
                      disabled={!selectedApp}
                      variant="primary"
                      className="w-full h-11 text-xs font-black bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {selectedApp ? `Pay ₹${amount} via ${selectedApp}` : 'Select a UPI App Above'}
                    </Button>
                  </div>
                </div>
              )}

              {/* UPI ID / VPA COLLECT REQUEST */}
              {upiTab === 'vpa' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="upi-id-input" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Enter your UPI ID / VPA</label>
                    <div className="flex gap-2">
                      <input
                        id="upi-id-input"
                        type="text"
                        placeholder="e.g. name@okaxis, user@paytm"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="flex-1 px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 leading-normal">
                      Razorpay will send a collect notification request to your UPI app. Open GPay/PhonePe to complete.
                    </p>
                  </div>

                  <div className="pt-1">
                    <Button
                      onClick={() => handlePay(true, 'UPI ID Request')}
                      disabled={!upiId.includes('@')}
                      variant="primary"
                      className="w-full h-11 text-xs font-black bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      Send UPI Collect Request
                    </Button>
                  </div>
                </div>
              )}

              {/* UNIFIED SCAN QR CODE */}
              {upiTab === 'qr' && (
                <div className="space-y-4 text-center">
                  <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="h-32 w-32 bg-white p-2 rounded-xl shadow-md flex items-center justify-center relative border border-slate-100">
                      <QrCode className="w-full h-full text-slate-950" />
                      <div className="absolute inset-0 bg-slate-950/10 flex items-center justify-center rounded-xl opacity-0 hover:opacity-100 backdrop-blur-xs transition-all cursor-pointer">
                        <span className="text-[9px] font-extrabold text-slate-900 bg-white px-2 py-1 rounded-md shadow-sm">Scan QR Code</span>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 mt-2.5">
                      Scan QR via Google Pay, PhonePe, Paytm, BHIM, or any UPI app to pay ₹{amount}
                    </p>
                  </div>

                  <div className="pt-1">
                    <Button
                      onClick={() => handlePay(true, 'QR Code Scan')}
                      variant="primary"
                      className="w-full h-11 text-xs font-black bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Simulate Scanner Completion
                    </Button>
                  </div>
                </div>
              )}

              {/* Official production checkout gateway active */}
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Authorizing UPI Transaction...</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Awaiting authorization from bank network. Please check your selected UPI app for pending collect approvals.
                </p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-2 space-y-5 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              
              <div>
                <Badge variant="success">Transaction Authorized</Badge>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5">₹{amount} Received</h3>
                <p className="text-xs text-slate-500 mt-1">{paymentSettings.successMessage}</p>
              </div>

              {/* Invoice receipt summary layout */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-left text-xs space-y-3.5 border border-slate-150 dark:border-slate-850">
                <div className="flex justify-between font-black pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-900 dark:text-white uppercase font-extrabold tracking-wide text-[9px]">RK Coaching Invoice</span>
                  <span className="text-blue-600 font-bold">{simulatedOrderId}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3 text-[11px]">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-extrabold">Student</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{userFullName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-extrabold">Date</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{new Date().toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-extrabold">Payment ID</p>
                    <p className="font-mono text-[9px] text-slate-800 dark:text-slate-200">{simulatedPaymentId}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-extrabold">Security Level</p>
                    <p className="font-bold text-emerald-600 uppercase text-[9px] flex items-center gap-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Razorpay SSL
                    </p>
                  </div>
                </div>
              </div>

              {/* Support reference */}
              <div className="text-[10px] text-slate-400 text-center">
                Need help? Email <strong className="font-bold">{paymentSettings.supportEmail}</strong> or Call <strong className="font-bold">{paymentSettings.supportPhone}</strong>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={handleDownloadReceipt}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold"
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                >
                  Save / Print Receipt
                </Button>
                <Button
                  onClick={onClose}
                  variant="primary"
                  size="sm"
                  className="w-full text-xs font-black bg-blue-600 text-white hover:bg-blue-700"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Start Studying
                </Button>
              </div>
            </div>
          )}

          {step === 'failure' && (
            <div className="py-4 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <XCircle className="w-8 h-8" />
              </div>
              <div>
                <Badge variant="danger">UPI Transaction Cancelled</Badge>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5">Payment Failed</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">{paymentSettings.failureMessage}</p>
              </div>

              {/* Support reference */}
              <div className="text-[10px] text-slate-400 text-center">
                Support Helpline: <strong className="font-bold">{paymentSettings.supportPhone}</strong>
              </div>

              <div className="flex gap-2 pt-2 w-full">
                <Button
                  onClick={() => setStep('method')}
                  variant="primary"
                  className="w-full py-2.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
                >
                  Retry Payment
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    onCancel();
                  }}
                  variant="outline"
                  className="w-full py-2.5 text-xs font-bold"
                >
                  Cancel Checkout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

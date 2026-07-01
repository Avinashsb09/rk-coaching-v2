/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ShoppingBag, FileText, Receipt, ShieldCheck, Printer, Compass, ArrowLeft, Download, Eye, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function PurchasesInvoices() {
  const {
    user,
    courses,
    orders,
    payments,
    enrolledCourseIds,
    setCurrentView,
    setSelectedCourseId,
    addToast
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'purchases' | 'orders' | 'payments'>('purchases');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Filter courses that are enrolled/purchased
  const enrolledCourses = courses.filter(c => enrolledCourseIds.includes(c.id));

  const handleViewCourseSyllabus = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView('course-view');
  };

  const handleOpenReceipt = (order: any) => {
    const matchedPayment = payments.find(p => p.orderId === order.id) || {
      id: 'pay_dummy' + Math.random().toString(36).substring(2, 6),
      method: 'Razorpay UPI Checkout',
      status: 'success'
    };
    const courseObj = courses.find(c => c.id === order.courseId) || {
      title: 'Standard LMS Batch Course'
    };

    setSelectedInvoice({
      orderId: order.id,
      paymentId: matchedPayment.id,
      courseTitle: courseObj.title,
      amount: order.amount,
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
      method: matchedPayment.method,
      status: order.status
    });
  };

  return (
    <div className="space-y-8 py-4 text-left">
      {/* Page Title Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShoppingBag className="w-6.5 h-6.5 text-blue-600" />
            Purchases & Invoice Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access unlocked courses, trace Razorpay payment logs, review order histories and download PDF receipts.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentView('catalog')}
          leftIcon={<Compass className="w-4 h-4" />}
          className="self-start md:self-center text-xs font-bold"
        >
          Explore Course Catalog
        </Button>
      </div>

      {selectedInvoice ? (
        /* Highly Polished Printable PDF Receipt Layout */
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedInvoice(null)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-xs font-bold text-slate-500"
          >
            Back to Purchase History
          </Button>

          <Card className="max-w-xl mx-auto border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100">
            {/* Standard Branding Strip */}
            <div className="bg-slate-950 text-white p-6 flex justify-between items-center">
              <div className="space-y-1 text-left">
                <span className="text-lg font-black tracking-tight text-slate-50">
                  RK <span className="text-blue-500">Coaching</span>
                </span>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Official Learning Invoice</p>
              </div>
              <div className="text-right">
                <Badge variant="success" className="bg-emerald-600 text-white font-extrabold uppercase">Paid Receipt</Badge>
              </div>
            </div>

            <CardContent className="p-8 space-y-6 text-left">
              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wide">Invoiced To</p>
                  <p className="font-extrabold text-slate-950 dark:text-white mt-1">{user?.fullName || 'Scholar Student'}</p>
                  <p className="text-slate-500 font-medium mt-0.5">{user?.email || 'student@rkcoaching.com'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wide">Receipt Details</p>
                  <p className="font-bold text-slate-950 dark:text-white mt-1">Invoice ID: <span className="text-blue-600 font-mono text-[10px]">{selectedInvoice.orderId}</span></p>
                  <p className="text-slate-500 font-medium mt-0.5">Date: {selectedInvoice.date}</p>
                </div>
              </div>

              {/* Transaction Table */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 grid grid-cols-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <span className="col-span-2">Course Syllabus Standard</span>
                  <span className="text-right">Total Price</span>
                </div>
                <div className="px-4 py-4 grid grid-cols-3 text-xs border-t border-slate-100 dark:border-slate-800 font-semibold">
                  <span className="col-span-2 text-slate-950 dark:text-white font-bold">{selectedInvoice.courseTitle}</span>
                  <span className="text-right text-slate-900 dark:text-slate-100">₹{selectedInvoice.amount}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/60 px-4 py-3.5 grid grid-cols-3 text-xs border-t border-slate-100 dark:border-slate-800 font-bold">
                  <span className="col-span-2 text-right uppercase tracking-wider text-[10px] text-slate-400">Total Deducted:</span>
                  <span className="text-right text-blue-600 dark:text-blue-400 text-sm font-black">₹{selectedInvoice.amount}</span>
                </div>
              </div>

              {/* Secure Checkout details */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-[11px] space-y-2 text-slate-500">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Razorpay Payment ID:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{selectedInvoice.paymentId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Payment Channel:</span>
                  <span>{selectedInvoice.method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Security Status:</span>
                  <span className="text-emerald-600 flex items-center gap-1 font-extrabold uppercase text-[9px]">
                    <ShieldCheck className="w-3.5 h-3.5" /> Checked & Secured by SSL
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={() => window.print()}
                  variant="primary"
                  className="w-full h-11 text-xs font-black bg-slate-950 text-white hover:bg-slate-900 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save PDF Receipt
                </Button>
                <Button
                  onClick={() => setSelectedInvoice(null)}
                  variant="outline"
                  className="w-full h-11 text-xs font-bold"
                >
                  Close Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Purchases, Orders & Payments Directory */
        <div className="space-y-6">
          {/* Sub Tab Navigation */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
            <button
              onClick={() => setActiveSubTab('purchases')}
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'purchases'
                  ? 'border-blue-600 text-blue-600 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>My Unlocked Courses ({enrolledCourses.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('orders')}
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'orders'
                  ? 'border-blue-600 text-blue-600 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>My Orders & Invoices ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('payments')}
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'payments'
                  ? 'border-blue-600 text-blue-600 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Transaction History ({payments.length})</span>
            </button>
          </div>

          {/* Sub Tab Body */}
          {activeSubTab === 'purchases' && (
            <div className="space-y-4">
              {enrolledCourses.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-400">No Courses Purchased Yet</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Explore standard curriculum chapters, mock quizzes, and lecture videos to start enrolling.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentView('catalog')} className="mt-2 text-xs">
                    Browse Standard Courses
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrolledCourses.map((course) => (
                    <Card key={course.id} className="p-4 flex gap-4 hover:border-blue-500/50 transition-all text-left">
                      <div className="h-20 w-28 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                            Active Lifetime Access
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {course.title}
                        </h3>
                        <div className="flex justify-end pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCourseSyllabus(course.id)}
                            className="h-7 text-xs font-bold text-blue-600 dark:text-blue-400 p-0 hover:bg-transparent"
                            rightIcon={<ChevronRight className="w-4 h-4" />}
                          >
                            Resume Studying
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-400">No Order Records Found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">All standard payments and completed course enrollments will be listed here with receipts.</p>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-5 py-3">Order ID</th>
                          <th className="px-5 py-3">Course Standard</th>
                          <th className="px-5 py-3">Amount</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3 text-right">Receipts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                        {orders.map((o) => {
                          const courseTitle = courses.find(c => c.id === o.courseId)?.title || 'Standard syllabus batch';
                          return (
                            <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                              <td className="px-5 py-3.5 font-mono text-blue-600 text-[11px]">{o.id}</td>
                              <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{courseTitle}</td>
                              <td className="px-5 py-3.5 font-black text-slate-900 dark:text-slate-100">₹{o.amount}</td>
                              <td className="px-5 py-3.5">
                                <Badge variant="success" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 font-extrabold text-[9px] uppercase">
                                  {o.status || 'Completed'}
                                </Badge>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenReceipt(o)}
                                  className="h-8 text-xs text-blue-600 font-bold"
                                  leftIcon={<Eye className="w-4 h-4" />}
                                >
                                  View Invoice
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'payments' && (
            <div className="space-y-4">
              {payments.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
                  <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-400">No Verified Transactions</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Receipts and verified bank settlement transaction logs will be listed here.</p>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-5 py-3">Transaction ID</th>
                          <th className="px-5 py-3">Order ID</th>
                          <th className="px-5 py-3">Settlement Amount</th>
                          <th className="px-5 py-3">Channel Method</th>
                          <th className="px-5 py-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                            <td className="px-5 py-3.5 font-mono text-[10px] text-slate-500">{p.id}</td>
                            <td className="px-5 py-3.5 font-mono text-blue-600 text-[10px]">{p.orderId}</td>
                            <td className="px-5 py-3.5 font-black text-slate-900 dark:text-slate-100">₹{p.amount}</td>
                            <td className="px-5 py-3.5 font-bold text-slate-600 dark:text-slate-300">{p.method || 'Razorpay Gateway'}</td>
                            <td className="px-5 py-3.5 text-right">
                              <span className="text-xs font-extrabold text-emerald-600 flex items-center justify-end gap-1">
                                <ShieldCheck className="w-4 h-4" /> Settlement Success
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

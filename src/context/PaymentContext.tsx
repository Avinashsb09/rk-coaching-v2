/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { Order, Payment, PaymentSettings, PurchaseRecord, SubjectPricing } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { PaymentService } from '../services/payment.service';

export interface PaymentContextType {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  paymentSettings: PaymentSettings;
  setPaymentSettings: React.Dispatch<React.SetStateAction<PaymentSettings>>;
  loadPaymentData: (userId: string) => Promise<void>;
  
  // New Enterprise Subject Access Methods
  hasSubjectAccess: (subjectId: string) => boolean;
  initiatePayment: (subjectId: string, amount: number) => Promise<string>;
  verifyPayment: (subjectId: string, transactionDetails: any) => Promise<boolean>;
  grantSubjectAccess: (subjectId: string, transactionId: string, purchaseType?: any, provider?: string) => Promise<void>;
  getPurchaseHistory: () => PurchaseRecord[];
  getSubjectPricing: (subjectId: string) => Promise<SubjectPricing | null>;
}

export const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const lastLoadedUserIdRef = useRef<string | null>(null);
  const loadingUserIdRef = useRef<string | null>(null);

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rk_payment_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return {
      razorpayKeyId: 'rzp_live_rkcoaching2026',
      businessName: 'RK Coaching Institute',
      businessLogo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=80&h=80&q=80',
      supportEmail: 'support@rkcoaching.com',
      supportPhone: '+91 98765 43210',
      successMessage: 'Congratulations! Payment verified and subject content unlocked instantly.',
      failureMessage: 'Your bank declined the UPI transaction or session timed out. Please try again.'
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rk_payment_settings', JSON.stringify(paymentSettings));
    }
  }, [paymentSettings]);

  const loadPaymentData = async (userId: string) => {
    if (!userId) {
      lastLoadedUserIdRef.current = null;
      loadingUserIdRef.current = null;
      setActiveStudentId(null);
      setOrders([]);
      setPayments([]);
      setPurchaseHistory([]);
      return;
    }
    if (lastLoadedUserIdRef.current === userId || loadingUserIdRef.current === userId) {
      return;
    }
    loadingUserIdRef.current = userId;

    setActiveStudentId(userId);
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      try {
        const { data: oData } = await supabase.from('orders').select('*').eq('userId', userId);
        if (oData) setOrders(oData as any);

        const { data: payData } = await supabase.from('payments').select('*').eq('userId', userId);
        if (payData) setPayments(payData as any);
      } catch (err) {
        console.error('Failed to load payments details:', err);
      }
    } else {
      const savedOrders = localStorage.getItem(`rk_orders_${userId}`);
      const savedPayments = localStorage.getItem(`rk_payments_${userId}`);
      setOrders(savedOrders ? JSON.parse(savedOrders) : []);
      setPayments(savedPayments ? JSON.parse(savedPayments) : []);
    }
    
    try {
      // Load new Enterprise Purchases
      const history = await PaymentService.getPurchaseHistory(userId);
      setPurchaseHistory(history);
      lastLoadedUserIdRef.current = userId;
    } catch (err) {
      console.error('Failed to load purchase history:', err);
      lastLoadedUserIdRef.current = userId;
    } finally {
      loadingUserIdRef.current = null;
    }
  };

  const hasSubjectAccess = useCallback((subjectId: string) => {
    return purchaseHistory.some(p => p.subjectId === subjectId && p.status === 'success');
  }, [purchaseHistory]);

  const initiatePayment = async (subjectId: string, amount: number) => {
    if (!activeStudentId) throw new Error('User not authenticated');
    return PaymentService.initiatePayment(activeStudentId, subjectId, amount);
  };

  const verifyPayment = async (subjectId: string, transactionDetails: any) => {
    if (!activeStudentId) throw new Error('User not authenticated');
    return PaymentService.verifyPayment(activeStudentId, subjectId, transactionDetails);
  };

  const grantSubjectAccess = async (subjectId: string, transactionId: string, purchaseType: any = 'Lifetime', provider: string = 'Razorpay') => {
    if (!activeStudentId) throw new Error('User not authenticated');
    await PaymentService.grantSubjectAccess(activeStudentId, subjectId, transactionId, purchaseType, provider);
    // Reload state
    const history = await PaymentService.getPurchaseHistory(activeStudentId);
    setPurchaseHistory(history);
  };

  const getPurchaseHistoryContext = () => purchaseHistory;
  
  const getSubjectPricing = async (subjectId: string) => {
    return PaymentService.getSubjectPricing(subjectId);
  };

  return (
    <PaymentContext.Provider
      value={{
        orders,
        setOrders,
        payments,
        setPayments,
        paymentSettings,
        setPaymentSettings,
        loadPaymentData,
        hasSubjectAccess,
        initiatePayment,
        verifyPayment,
        grantSubjectAccess,
        getPurchaseHistory: getPurchaseHistoryContext,
        getSubjectPricing
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayments() {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error('usePayments must be used within PaymentProvider');
  return ctx;
}

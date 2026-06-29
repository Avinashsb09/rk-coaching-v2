/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, Payment, PaymentSettings } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export interface PaymentContextType {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  paymentSettings: PaymentSettings;
  setPaymentSettings: React.Dispatch<React.SetStateAction<PaymentSettings>>;
  loadPaymentData: (userId: string) => Promise<void>;
}

export const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

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
      successMessage: 'Congratulations! Payment verified and course content unlocked instantly.',
      failureMessage: 'Your bank declined the UPI transaction or session timed out. Please try again.'
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rk_payment_settings', JSON.stringify(paymentSettings));
    }
  }, [paymentSettings]);

  const loadPaymentData = async (userId: string) => {
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
        loadPaymentData
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

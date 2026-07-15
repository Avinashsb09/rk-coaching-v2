/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabase, isSupabaseConfigured, deduplicateRequest } from '../lib/supabase';
import { SubjectPricing, PurchaseRecord } from '../types';
import { mockSubjectPricing } from '../lib/mockData';
import { DEMO_STUDENT_ID } from '../config/dataMode';

export class PaymentService {
  /**
   * Retrieves pricing for a specific subject
   */
  static async getSubjectPricing(subjectId: string): Promise<SubjectPricing | null> {
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      const { data, error } = await supabase
        .from('subject_pricing')
        .select('*')
        .eq('subjectId', subjectId)
        .eq('isActive', true)
        .single();
      
      if (!error && data) {
        return data as SubjectPricing;
      }
    }
    
    // Fallback to mock data
    const pricing = mockSubjectPricing.find(p => p.subjectId === subjectId && p.isActive);
    return pricing || null;
  }

  /**
   * Checks if a student has purchased a specific subject
   */
  static async hasSubjectAccess(studentId: string, subjectId: string): Promise<boolean> {
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      const { data, error } = await supabase
        .from('purchase_records')
        .select('*')
        .eq('studentId', studentId)
        .eq('subjectId', subjectId)
        .eq('status', 'success');

      if (!error && data && data.length > 0) {
        return true;
      }
    }

    // Local Storage Mock Fallback
    const saved = localStorage.getItem(`rk_subject_purchases_${studentId}`);
    if (saved) {
      const purchases: string[] = JSON.parse(saved);
      return purchases.includes(subjectId);
    }
    return false;
  }

  /**
   * Retrieves the full purchase history for a student
   */
  static async getPurchaseHistory(studentId: string): Promise<PurchaseRecord[]> {
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      const { data, error } = await deduplicateRequest(`purchase_history_${studentId}`, async () =>
        await supabase
          .from('purchase_records')
          .select('*')
          .eq('studentId', studentId)
          .order('purchaseDate', { ascending: false })
      );

      if (!error && data) {
        return data as PurchaseRecord[];
      }
    }

    const saved = localStorage.getItem(`rk_purchase_history_${studentId}`);
    if (saved !== null) {
      return JSON.parse(saved);
    }

    if (studentId === DEMO_STUDENT_ID) {
      const demoRecords: PurchaseRecord[] = [
        {
          id: 'pr_demo_1',
          studentId,
          subjectId: 'sub_neet_biology',
          purchaseType: 'Lifetime',
          purchaseDate: new Date(Date.now() - 10 * 86400000).toISOString(),
          transactionId: 'pay_demo_1',
          status: 'success',
          provider: 'Razorpay'
        },
        {
          id: 'pr_demo_2',
          studentId,
          subjectId: 'sub_neet_chemistry',
          purchaseType: 'Lifetime',
          purchaseDate: new Date(Date.now() - 5 * 86400000).toISOString(),
          transactionId: 'pay_demo_2',
          status: 'success',
          provider: 'Razorpay'
        }
      ];
      localStorage.setItem(`rk_purchase_history_${studentId}`, JSON.stringify(demoRecords));

      const savedPurchases = localStorage.getItem(`rk_subject_purchases_${studentId}`);
      if (savedPurchases === null) {
        localStorage.setItem(`rk_subject_purchases_${studentId}`, JSON.stringify(['sub_neet_biology', 'sub_neet_chemistry']));
      }

      const savedNotes = localStorage.getItem(`rk_subject_notes_${studentId}`);
      if (savedNotes === null) {
        localStorage.setItem(`rk_subject_notes_${studentId}`, JSON.stringify(['sub_neet_biology', 'sub_neet_chemistry']));
      }

      return demoRecords;
    }

    return [];
  }

  /**
   * Initiates payment logic securely via Edge Functions or mock adapter
   */
  static async initiatePayment(studentId: string, subjectId: string, amount: number): Promise<string> {
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      const { data, error } = await supabase.functions.invoke('payment-initiate', {
        body: { studentId, subjectId, amount }
      });
      if (error || !data || !data.orderId) {
        throw new Error(error?.message || 'Secure payment initiation failed');
      }
      return data.orderId;
    }
    // Mock simulation
    return `sim_order_${Date.now()}`;
  }

  /**
   * Verifies the payment transaction securely
   */
  static async verifyPayment(studentId: string, subjectId: string, transactionDetails: any): Promise<boolean> {
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      const { data, error } = await supabase.functions.invoke('payment-verify', {
        body: { studentId, subjectId, transactionDetails }
      });
      if (error || !data || !data.success) {
        throw new Error(error?.message || 'Payment verification failed');
      }
      return true;
    }
    // Mock simulation
    return transactionDetails?.paymentId?.startsWith('pay_') || transactionDetails?.paymentId?.startsWith('sim_pay_');
  }

  /**
   * Grants ownership to the subject after successful verification
   */
  static async grantSubjectAccess(studentId: string, subjectId: string, transactionId: string, purchaseType: 'Lifetime' | 'Monthly' | 'Yearly' | 'Trial' = 'Lifetime', provider: string = 'Razorpay'): Promise<void> {
    const record: PurchaseRecord = {
      id: `pr_${Date.now()}`,
      studentId,
      subjectId,
      purchaseType,
      purchaseDate: new Date().toISOString(),
      transactionId,
      status: 'success',
      provider
    };

    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase() as any;
      await supabase.from('purchase_records').insert([record]);
    } else {
      // Local Storage Fallback for access list
      const savedPurchases = localStorage.getItem(`rk_subject_purchases_${studentId}`);
      const purchases = savedPurchases ? JSON.parse(savedPurchases) : [];
      if (!purchases.includes(subjectId)) {
        purchases.push(subjectId);
        localStorage.setItem(`rk_subject_purchases_${studentId}`, JSON.stringify(purchases));
      }

      // Local Storage Fallback for detailed history
      const savedHistory = localStorage.getItem(`rk_purchase_history_${studentId}`);
      const history: PurchaseRecord[] = savedHistory ? JSON.parse(savedHistory) : [];
      history.push(record);
      localStorage.setItem(`rk_purchase_history_${studentId}`, JSON.stringify(history));
    }
  }
}

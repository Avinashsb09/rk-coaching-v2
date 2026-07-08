/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { CreditCard, History, Settings, IndianRupee } from 'lucide-react';
import { usePayments } from '../../../../context/PaymentContext';
import { useApp } from '../../../../context/AppContext';

export default function PaymentManagement() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'pricing' | 'settings'>('transactions');
  const { paymentSettings, setPaymentSettings, getPurchaseHistory } = usePayments();
  const { subjects, addToast } = useApp();
  
  const purchases = getPurchaseHistory();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Payment Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage Subject Pricing, Transactions, and API Keys.</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button onClick={() => setActiveTab('transactions')} className={`px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition-colors ${activeTab === 'transactions' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
          <History className="w-4 h-4 inline-block mr-2" /> Transactions
        </button>
        <button onClick={() => setActiveTab('pricing')} className={`px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition-colors ${activeTab === 'pricing' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
          <IndianRupee className="w-4 h-4 inline-block mr-2" /> Subject Pricing
        </button>
        <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition-colors ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
          <Settings className="w-4 h-4 inline-block mr-2" /> API Settings
        </button>
      </div>

      {activeTab === 'transactions' && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <h3 className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              <History className="w-5 h-5 text-indigo-500" /> Recent Transactions
            </h3>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <div className="text-center py-10 text-slate-500">No transactions recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Transaction ID</th>
                      <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Subject ID</th>
                      <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                      <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Provider</th>
                      <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {purchases.map(p => (
                      <tr key={p.id}>
                        <td className="p-4 text-xs font-mono">{p.transactionId}</td>
                        <td className="p-4">{p.subjectId}</td>
                        <td className="p-4">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                        <td className="p-4">{p.provider}</td>
                        <td className="p-4">
                          <Badge variant={p.status === 'success' ? 'success' : 'secondary'}>{p.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'pricing' && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <h3 className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              <IndianRupee className="w-5 h-5 text-indigo-500" /> Premium Subject Pricing
            </h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Subject</th>
                    <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Class</th>
                    <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Premium Price (₹)</th>
                    <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Type</th>
                    <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {subjects.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="p-4 font-bold">{s.name}</td>
                      <td className="p-4 text-slate-500">{s.classId}</td>
                      <td className="p-4 text-emerald-600 font-bold">₹99</td>
                      <td className="p-4"><Badge variant="info">Lifetime</Badge></td>
                      <td className="p-4">
                        <Button variant="secondary" size="sm" onClick={() => addToast('Pricing update API not simulated yet', 'info')}>Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card className="border-slate-200 dark:border-slate-800 max-w-2xl">
          <CardHeader>
            <h3 className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              <CreditCard className="w-5 h-5 text-indigo-500" /> Gateway Configuration
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Razorpay Key ID</label>
              <input 
                type="text" 
                value={paymentSettings.razorpayKeyId} 
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm font-mono text-slate-500" 
                disabled 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Success Message</label>
              <textarea 
                value={paymentSettings.successMessage}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-500 h-20"
                disabled
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">API configuration requires .env changes for security.</p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export default function ContactPage() {
  const { addToast, homepageConfig } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !msg) {
      addToast('Please fill out all required form elements', 'error');
      return;
    }
    addToast('Message delivered! Our admissions helpdesk will reply within 24 hours.', 'success');
    setName('');
    setEmail('');
    setSubject('');
    setMsg('');
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-12 text-left">
      {/* Intro Header */}
      <section className="text-center space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Contact Support & Admissions Office
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          Submit queries regarding online admission guides, premium subject bundles, previous year keys, or custom coaching plans.
        </p>
      </section>

      {/* Grid: Address details vs Contact Form */}
      <section className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Left pane: contact details */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-5 space-y-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {homepageConfig.heroTitle || "RK Coaching"}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 text-xs text-slate-500">
                  <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Main Office Coordinates</p>
                    <p className="mt-1">{homepageConfig.contactAddress || "Sector 15, Dwarka, New Delhi, India - 110075"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 text-xs text-slate-500">
                  <Phone className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Admissions Hotlines</p>
                    <p className="mt-1">{homepageConfig.contactPhone || "+91 98765 43210"}</p>
                    <p className="text-[10px] text-slate-400">Available Mon-Sat (9 AM - 6 PM)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 text-xs text-slate-500">
                  <Mail className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Support Mailboxes</p>
                    <p className="mt-1">{homepageConfig.contactEmail || "admissions@rkcoaching.com"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right pane: Contact Form */}
        <div className="md:col-span-3">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Name *"
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Your Email *"
                  type="email"
                  placeholder="e.g. aarav@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Inquiry Subject"
                placeholder="e.g., Board Mathematics coupon code issues"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Message Content *
                </label>
                <textarea
                  placeholder="Please write down your admissions inquiry or support message clearly..."
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm p-3 h-28 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <Button variant="primary" type="submit" className="w-full" rightIcon={<Send className="w-4 h-4" />}>
                Deliver Message
              </Button>
            </form>
          </Card>
        </div>

      </section>
    </div>
  );
}

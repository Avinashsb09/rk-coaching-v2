/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Facebook, Twitter, Youtube, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Footer() {
  const { setCurrentView, setGlobalSearch, addToast, homepageConfig } = useApp();

  const handleLinkClick = (view: string, searchTag?: string) => {
    setCurrentView(view);
    if (searchTag) {
      setGlobalSearch(searchTag);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 text-left">
          
          {/* Brand segment */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleLinkClick('home')}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                {homepageConfig.heroTitle || "RK Coaching"}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              India's premium serverless LMS for CBSE Classes 6-12 and NEET (Biology & Chemistry) competitive coaching. Secure your rank with elite notes and quizzes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-xl bg-slate-850 hover:bg-blue-600 hover:text-white text-slate-400 transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-850 hover:bg-blue-600 hover:text-white text-slate-400 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-850 hover:bg-blue-600 hover:text-white text-slate-400 transition-all">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Core Classes Links */}
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">
              Explore Streams
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'NEET (Biology & Chemistry) Pre-Medical', slug: 'neet-prep' },
                { label: 'Class 12 Science', slug: 'class-12-science' },
                { label: 'Class 11 Science', slug: 'class-11-science' },
                { label: 'Class 10 General', slug: 'class-10' },
                { label: 'Class 6-9 Foundations', slug: 'class-6' }
              ].map((link) => (
                <li key={link.slug}>
                  <button
                    onClick={() => handleLinkClick('home', link.slug)}
                    className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Help Links */}
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">
              Support Channels
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => handleLinkClick('faq')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact Helpdesk
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Refund Policy (Razorpay)
                </a>
              </li>
            </ul>
          </div>

          {/* Physical Address contact details */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              {homepageConfig.heroTitle || "RK Coaching"} Head Office
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span>{homepageConfig.contactAddress || "Sector 15, Dwarka, New Delhi, India - 110075"}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <span>{homepageConfig.contactPhone || "+91 98765 43210"}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <span>{homepageConfig.contactEmail || "admissions@rkcoaching.com"}</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>{homepageConfig.footerText || "© 2026 RK Coaching LMS Private Limited. All rights reserved."}</p>
          <p className="mt-4 sm:mt-0 flex gap-4">
            <span>Powered by Supabase Serverless</span>
            <span>·</span>
            <span>Razorpay Standard Secure Checkout</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

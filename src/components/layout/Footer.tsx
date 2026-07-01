import { BookOpen, Facebook, Instagram, Youtube, Mail, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Footer() {
  const { setCurrentView, setSelectedClassSlug, homepageConfig } = useApp();

  const handleStreamClick = (slug: string) => {
    setSelectedClassSlug(slug);
    setCurrentView('class-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (view: string) => {
    setCurrentView(view);
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
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-xl bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400 transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400 transition-all">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Core Classes Links */}
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">
              Explore Streams
            </h3>
            <ul className="space-y-2.5 text-sm text-left">
              {[
                { label: 'NEET Dashboard', slug: 'neet' },
                { label: 'Class 12', slug: 'class-12-science' },
                { label: 'Class 11', slug: 'class-11-science' },
                { label: 'Class 10', slug: 'class-10' },
                { label: 'Open Class Selector', slug: 'class-6-9' }
              ].map((link) => (
                <li key={link.slug}>
                  <button
                    onClick={() => handleStreamClick(link.slug)}
                    className="hover:text-white transition-colors cursor-pointer text-left font-medium"
                  >
                    {link.label}
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
            <ul className="space-y-2.5 text-sm text-left">
              <li>
                <button
                  onClick={() => handleLinkClick('faq')}
                  className="hover:text-white transition-colors cursor-pointer text-left font-medium"
                >
                  FAQs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('contact')}
                  className="hover:text-white transition-colors cursor-pointer text-left font-medium"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Physical Address contact details */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              RK Coaching Contact
            </h3>
            <ul className="space-y-3 text-sm text-left">
              <li className="flex items-center gap-2.5">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <span>+91 88220 91760</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <span>ravikantjnv18@gmail.com</span>
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

import React from 'react';
import { Heart, Mail, Phone, Twitter, Facebook, Linkedin, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#0B0F19] border-t border-slate-200 dark:border-white/5 pt-20 pb-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="relative">
                <Heart className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full border border-white dark:border-[#0B0F19]"></div>
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">DigosHealth</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              The centralized healthcare OS for Digos City. Connecting patients, providers, and clinics in real-time.
            </p>
            <div className="flex gap-4">
              {[Twitter, Facebook, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-cyan-100 hover:text-cyan-600 dark:hover:bg-cyan-900/30 dark:hover:text-cyan-400 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Find a Doctor</a></li>
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Hospitals Map</a></li>
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Success Stories</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">For Providers</a></li>
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <a href="mailto:support@digoshealth.com" className="hover:text-slate-900 dark:hover:text-white">support@digoshealth.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <a href="tel:+630825550123" className="hover:text-slate-900 dark:hover:text-white">+63 (082) 555-0123</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 dark:text-slate-500 text-xs">© 2025 DigosHealth Inc. All rights reserved.</p>
          <div className="flex gap-8 text-xs text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
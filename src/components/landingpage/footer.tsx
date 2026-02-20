import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Find a Provider", href: "/browse-services" },
    { label: "Healthcare Map", href: "/map" },
    { label: "How It Works", href: "/how-it-works" },
  ],
  Company: [
    { label: "About Us", href: "/about-us" },
    { label: "For Providers", href: "/auth/choose-role" },
    { label: "Contact", href: "#" },
  ],
};

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/70 dark:border-white/5 pt-16 pb-8 transition-colors duration-300 bg-white/40 dark:bg-[#0A0D14]/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12 mb-14">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <Image
                src="/logo.png"
                alt="Himsog"
                width={28}
                height={28}
                className="transition-opacity group-hover:opacity-80"
              />
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                Himsog
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5 max-w-xs">
              The centralized healthcare platform for Digos City. Connecting
              patients with verified providers in real-time.
            </p>
            <div className="flex flex-col gap-2.5">
              <a
                href="mailto:support@himsog.app"
                className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0" />
                support@himsog.app
              </a>
              <a
                href="tel:+630825550123"
                className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                +63 (082) 555-0123
              </a>
              <div className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                <MapPin className="w-4 h-4 shrink-0" />
                Digos City, Davao del Sur
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">
                {heading}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter / Quick Access */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">
              Get Started
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Find healthcare providers near you and book your first
              appointment.
            </p>
            <Link
              href="/auth/choose-role"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
            >
              Sign Up Free
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200/70 dark:border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 dark:text-slate-500 text-xs">
            &copy; {new Date().getFullYear()} Himsog. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-400 dark:text-slate-500">
            <a
              href="#"
              className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

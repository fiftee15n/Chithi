'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Feather, Heart, Mail, Compass, HelpCircle, PenTool } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/letters', label: 'চিঠিগুলো', icon: Mail },
    { href: '/unsent', label: 'কাউকে পাঠাতে পারিনি', icon: Heart },
    { href: '/my-letters', label: 'আমার চিঠি', icon: Feather },
    { href: '/about', label: 'সম্পর্কে', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-40 bg-paper-50/90 backdrop-blur-md border-b border-paper-200 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-crimson-800 text-paper-50 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
            <span className="text-xl">✉️</span>
          </div>
          <div>
            <span className="font-serif font-bold text-2xl text-ink-950 tracking-tight block leading-none">
              চিঠি
            </span>
            <span className="text-[11px] text-ink-500 font-sans tracking-wide block mt-1">
              না-বলা কথার ঠিকানা
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-paper-200 text-crimson-800 font-semibold'
                    : 'text-ink-700 hover:text-ink-950 hover:bg-paper-100'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/write"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-crimson-800 hover:bg-crimson-900 text-paper-50 text-sm font-medium shadow-paper hover:shadow-paper-lg transition-all duration-200 active:scale-95 group"
          >
            <PenTool className="w-4 h-4 text-crimson-200 group-hover:rotate-12 transition-transform duration-300" />
            <span>চিঠি লিখুন</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

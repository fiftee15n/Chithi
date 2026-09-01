'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, PenTool, Sparkles, Feather, HelpCircle } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const items = [
    { href: '/', label: 'হোম', icon: Mail },
    { href: '/letters', label: 'চিঠিগুলো', icon: Sparkles },
    { href: '/write', label: 'লিখুন', icon: PenTool, highlight: true },
    { href: '/my-letters', label: 'আমার চিঠি', icon: Feather },
    { href: '/about', label: 'সম্পর্কে', icon: HelpCircle },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper-50/95 backdrop-blur-lg border-t border-paper-200 px-2 py-2 safe-area-pb shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-crimson-800 text-paper-50 flex items-center justify-center shadow-paper-lg active:scale-95 transition-transform">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-crimson-900 mt-1 font-sans">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
                isActive ? 'text-crimson-800 font-semibold' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

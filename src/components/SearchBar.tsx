'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'কোনো নাম, প্রাপক অথবা শব্দ খুঁজুন...',
}: SearchBarProps) {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-ink-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-paper-300 rounded-full text-xs sm:text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-crimson-800/20 focus:border-crimson-800 shadow-paper-sm transition-all"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 p-1 rounded-full text-ink-400 hover:text-ink-900 hover:bg-paper-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

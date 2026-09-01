'use client';

import React from 'react';
import { LetterCategory, SortOption } from '@/types/letter';
import { Sparkles, Clock, Flame, Shuffle } from 'lucide-react';

interface LetterFilterBarProps {
  selectedCategory: LetterCategory;
  onSelectCategory: (category: LetterCategory) => void;
  selectedSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  onOpenRandom?: () => void;
}

const CATEGORIES: LetterCategory[] = [
  'সব',
  'ভালোবাসা',
  'বন্ধুত্ব',
  'বিচ্ছেদ',
  'ক্ষমা',
  'পরিবার',
  'স্মৃতি',
  'না বলা কথা',
  'কাউকে পাঠাতে পারিনি',
];

export default function LetterFilterBar({
  selectedCategory,
  onSelectCategory,
  selectedSort,
  onSelectSort,
  onOpenRandom,
}: LetterFilterBarProps) {
  return (
    <div className="space-y-4 my-6">
      {/* Category Pills (Horizontal scrolling on small screens) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                isSelected
                  ? 'bg-crimson-800 text-white shadow-sm font-semibold'
                  : 'bg-white border border-paper-200 text-ink-700 hover:bg-paper-100 hover:text-ink-950'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Sorting & Random Action Row */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 bg-paper-100 p-1 rounded-lg border border-paper-200">
          <button
            onClick={() => onSelectSort('latest')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              selectedSort === 'latest'
                ? 'bg-white text-crimson-900 font-semibold shadow-xs'
                : 'text-ink-600 hover:text-ink-950'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>নতুন চিঠি</span>
          </button>

          <button
            onClick={() => onSelectSort('popular')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              selectedSort === 'popular'
                ? 'bg-white text-crimson-900 font-semibold shadow-xs'
                : 'text-ink-600 hover:text-ink-950'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>জনপ্রিয় চিঠি</span>
          </button>
        </div>

        {onOpenRandom && (
          <button
            onClick={onOpenRandom}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-paper-300 hover:border-crimson-300 rounded-lg text-ink-700 hover:text-crimson-900 font-medium transition-all shadow-paper-sm active:scale-95"
          >
            <Shuffle className="w-3.5 h-3.5 text-crimson-700" />
            <span>🎲 একটি চিঠি খুলুন</span>
          </button>
        )}
      </div>
    </div>
  );
}

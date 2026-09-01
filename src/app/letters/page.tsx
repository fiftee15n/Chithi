'use client';

import React, { useState, useEffect } from 'react';
import { Mail, PenTool, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Letter, LetterCategory, SortOption } from '@/types/letter';
import { getStoredLetters, filterLetters, syncLettersFromCloud } from '@/lib/storage';
import LetterCard from '@/components/LetterCard';
import LetterFilterBar from '@/components/LetterFilterBar';
import SearchBar from '@/components/SearchBar';
import RandomLetterModal from '@/components/RandomLetterModal';
import ShareLetterModal from '@/components/ShareLetterModal';

export default function AllLettersPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<LetterCategory>('সব');
  const [selectedSort, setSelectedSort] = useState<SortOption>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRandomOpen, setIsRandomOpen] = useState(false);
  const [shareLetter, setShareLetter] = useState<Letter | null>(null);

  const refreshLetters = async () => {
    setLetters(getStoredLetters());
    const cloudLetters = await syncLettersFromCloud();
    if (cloudLetters && cloudLetters.length > 0) {
      setLetters(cloudLetters);
    }
  };

  useEffect(() => {
    refreshLetters();
    window.addEventListener('chithi_letters_updated', refreshLetters);
    window.addEventListener('focus', refreshLetters);
    document.addEventListener('visibilitychange', refreshLetters);
    return () => {
      window.removeEventListener('chithi_letters_updated', refreshLetters);
      window.removeEventListener('focus', refreshLetters);
      document.removeEventListener('visibilitychange', refreshLetters);
    };
  }, []);

  const displayedLetters = filterLetters(letters, selectedCategory, selectedSort, searchQuery);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="font-serif font-bold text-2xl sm:text-4xl text-ink-950 mb-2">
          চিঠির মহাফেজখানা
        </h1>
        <p className="text-xs sm:text-sm text-ink-600 font-sans">
          অগণিত অচেনা মানুষের না-বলা কথা, ভালোবাসা, ক্ষোভ ও স্মৃতির সমাহার
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <LetterFilterBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedSort={selectedSort}
        onSelectSort={setSelectedSort}
        onOpenRandom={() => setIsRandomOpen(true)}
      />

      {/* Grid */}
      {displayedLetters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          {displayedLetters.map((letter) => (
            <LetterCard
              key={letter.id}
              letter={letter}
              onShare={(l) => setShareLetter(l)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 my-8 rounded-2xl bg-white border border-paper-200 shadow-paper-sm max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-paper-100 text-ink-400 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-ink-900 mb-1">
            কোনো চিঠি পাওয়া যায়নি
          </h3>
          <p className="text-xs text-ink-500 font-sans mb-6">
            অনুসন্ধান বা ফিল্টারের সাথে মিলে এমন কোনো চিঠি সংরক্ষিত নেই।
          </p>
          <Link
            href="/write"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-crimson-800 text-white text-xs font-semibold hover:bg-crimson-900 transition-colors shadow-paper"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>একটি চিঠি লিখুন</span>
          </Link>
        </div>
      )}

      {/* Modals */}
      <RandomLetterModal
        isOpen={isRandomOpen}
        onClose={() => setIsRandomOpen(false)}
      />

      <ShareLetterModal
        letter={shareLetter}
        isOpen={!!shareLetter}
        onClose={() => setShareLetter(null)}
      />
    </div>
  );
}

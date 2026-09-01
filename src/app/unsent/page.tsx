'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, PenTool, Heart, Shield } from 'lucide-react';
import { Letter } from '@/types/letter';
import { getStoredLetters } from '@/lib/storage';
import LetterCard from '@/components/LetterCard';
import ShareLetterModal from '@/components/ShareLetterModal';

export default function UnsentLettersPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [shareLetter, setShareLetter] = useState<Letter | null>(null);

  const loadData = () => {
    const all = getStoredLetters();
    const unsentList = all.filter(
      (l) => l.isUnsent || l.category === 'কাউকে পাঠাতে পারিনি' || l.recipientType === 'unsent'
    );
    setLetters(unsentList);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('chithi_letters_updated', loadData);
    return () => {
      window.removeEventListener('chithi_letters_updated', loadData);
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header Sanctuary Banner */}
      <section className="text-center py-10 sm:py-14 rounded-2xl bg-gradient-to-b from-rose-50/70 via-paper-50 to-paper-100 border border-crimson-100 shadow-paper-sm mb-10 px-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-crimson-100/80 text-crimson-900 text-xs font-serif font-semibold mb-4 border border-crimson-200">
          <Sparkles className="w-3.5 h-3.5 text-crimson-700" />
          <span>বিশেষ সংকলন</span>
        </div>

        <h1 className="font-serif font-bold text-3xl sm:text-5xl text-ink-950 mb-3 tracking-tight">
          কাউকে পাঠাতে পারিনি
        </h1>

        <p className="font-serif italic text-ink-700 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-6">
          “যে চিঠিগুলোর কোনো ডাকটিকিট জোড়েনি, কোনো ঠিকানায় পাঠানো যায়নি—অথচ যার ভার সারা জীবন বয়ে বেড়াতে হয়।”
        </p>

        <Link
          href="/write"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-crimson-800 hover:bg-crimson-900 text-white text-xs sm:text-sm font-semibold shadow-paper transition-all active:scale-95"
        >
          <PenTool className="w-4 h-4" />
          <span>আপনার না-পাঠানো চিঠিটি লিখুন</span>
        </Link>
      </section>

      {/* Grid of Unsent Letters */}
      {letters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          {letters.map((letter) => (
            <LetterCard
              key={letter.id}
              letter={letter}
              onShare={(l) => setShareLetter(l)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-paper-200 shadow-paper-sm max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-crimson-700 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-ink-900 mb-1">
            এখানে এখনো কোনো চিঠি আসেনি
          </h3>
          <p className="text-xs text-ink-500 font-sans mb-6">
            কাউকে বলতে না পারা কোনো অনুভূতির প্রথম পৃষ্ঠাটি আপনিই লিখুন।
          </p>
          <Link
            href="/write"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-crimson-800 text-white text-xs font-semibold hover:bg-crimson-900"
          >
            <span>একটি চিঠি লিখুন</span>
          </Link>
        </div>
      )}

      <ShareLetterModal
        letter={shareLetter}
        isOpen={!!shareLetter}
        onClose={() => setShareLetter(null)}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PenTool, Mail, Heart, Sparkles, BookOpen, Search } from 'lucide-react';
import { Letter, LetterCategory, SortOption } from '@/types/letter';
import { getStoredLetters, filterLetters } from '@/lib/storage';
import LetterCard from '@/components/LetterCard';
import DailyLetterCard from '@/components/DailyLetterCard';
import LetterFilterBar from '@/components/LetterFilterBar';
import SearchBar from '@/components/SearchBar';
import RandomLetterModal from '@/components/RandomLetterModal';
import ShareLetterModal from '@/components/ShareLetterModal';

export default function HomePage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<LetterCategory>('সব');
  const [selectedSort, setSelectedSort] = useState<SortOption>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRandomOpen, setIsRandomOpen] = useState(false);
  const [shareLetter, setShareLetter] = useState<Letter | null>(null);

  // Sync state
  const refreshLetters = () => {
    setLetters(getStoredLetters());
  };

  useEffect(() => {
    refreshLetters();
    window.addEventListener('chithi_letters_updated', refreshLetters);
    return () => {
      window.removeEventListener('chithi_letters_updated', refreshLetters);
    };
  }, []);

  const featuredLetter = letters.find((l) => l.isDailyFeatured) || letters[0];
  const displayedLetters = filterLetters(letters, selectedCategory, selectedSort, searchQuery);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="text-center py-10 sm:py-16 max-w-3xl mx-auto relative">
        <h1 className="font-serif font-bold text-3xl sm:text-5xl text-ink-950 tracking-tight leading-tight sm:leading-snug mb-4">
          “কিছু কথা বলা হয় না, <br className="hidden sm:inline" />
          <span className="text-crimson-800">শুধু লেখা হয়।</span>”
        </h1>

        <p className="text-ink-600 text-sm sm:text-base max-w-xl mx-auto font-sans leading-relaxed mb-8">
          কিছু কথা নামহীন থাকলেই হয়তো বেশি সুন্দর। আপনার না-বলা দীর্ঘশ্বাস আর অনুভূতির গল্পগুলো নির্দ্বিধায় রেখে যান চিঠির ভাঁজে।
        </p>

        {/* Primary CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/write"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-crimson-800 hover:bg-crimson-900 text-paper-50 font-medium text-sm sm:text-base shadow-paper hover:shadow-paper-lg transition-all active:scale-95 group"
          >
            <PenTool className="w-4 h-4 text-crimson-200 group-hover:rotate-12 transition-transform" />
            <span>একটি চিঠি লিখুন</span>
          </Link>

          <button
            onClick={() => setIsRandomOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-paper-100 text-ink-800 border border-paper-300 font-medium text-sm sm:text-base shadow-paper-sm transition-all active:scale-95"
          >
            <span>🎲 অচেনা চিঠি খুলুন</span>
          </button>
        </div>
      </section>

      {/* Featured Daily Letter */}
      {featuredLetter && !searchQuery && selectedCategory === 'সব' && (
        <DailyLetterCard letter={featuredLetter} />
      )}

      {/* Main Letter Feed Header */}
      <section className="mt-10 sm:mt-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-200">
          <div>
            <h2 className="font-serif font-bold text-2xl text-ink-950">
              চিঠির বাক্স
            </h2>
            <p className="text-xs text-ink-500 font-sans mt-0.5">
              অন্যের মনের কথা পড়ুন, অনুভূতি স্পর্শ করুন
            </p>
          </div>

          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Filters */}
        <LetterFilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedSort={selectedSort}
          onSelectSort={setSelectedSort}
          onOpenRandom={() => setIsRandomOpen(true)}
        />

        {/* Letters Grid */}
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
          /* Empty state */
          <div className="text-center py-16 px-4 my-8 rounded-2xl bg-white border border-paper-200 shadow-paper-sm max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-paper-100 text-ink-400 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-ink-900 mb-1">
              এখানে এখনো কোনো চিঠি আসেনি
            </h3>
            <p className="text-xs text-ink-500 font-sans mb-6">
              হয়তো আপনার না-বলা কথা দিয়ে এই পাতার সূচনা হতে পারে।
            </p>
            <Link
              href="/write"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-crimson-800 text-white text-xs font-semibold hover:bg-crimson-900 transition-colors shadow-paper"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>প্রথম চিঠিটি লিখুন</span>
            </Link>
          </div>
        )}
      </section>

      {/* Special Unsent section teaser */}
      <section className="my-16 rounded-2xl bg-paper-100/80 p-8 border border-paper-300 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="max-w-md">
          <div className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-crimson-800 mb-2">
            <Sparkles className="w-4 h-4 text-crimson-700" />
            <span>বিশেষ সংকলন</span>
          </div>
          <h3 className="font-serif font-bold text-xl text-ink-950 mb-2">
            কাউকে পাঠাতে পারিনি
          </h3>
          <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
            যে চিঠিগুলো হয়তো ডাকঘরে জমা পড়েনি, কোনো ইনবক্সে যায়নি—কিন্তু মনের ভেতরে আজীবন অম্লান রয়ে গেছে।
          </p>
        </div>

        <Link
          href="/unsent"
          className="px-5 py-2.5 rounded-full bg-white hover:bg-paper-50 text-crimson-900 border border-crimson-200 font-serif font-semibold text-xs sm:text-sm shadow-paper-sm hover:shadow-paper transition-all shrink-0"
        >
          সেই চিঠিগুলো পড়ুন →
        </Link>
      </section>

      {/* Bottom CTA */}
      <section className="text-center py-12 px-6 my-10 rounded-2xl bg-gradient-to-b from-paper-50 to-paper-100 border border-paper-200">
        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-ink-950 mb-2">
          আপনারও কি কিছু বলা বাকি আছে?
        </h2>
        <p className="text-xs sm:text-sm text-ink-600 font-sans max-w-md mx-auto mb-6">
          যাকে কোনোদিন বলতে পারেননি, তাকে একটি বেনামী চিঠিতে রেখে যান।
        </p>
        <Link
          href="/write"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-crimson-800 hover:bg-crimson-900 text-white text-sm font-medium shadow-paper hover:shadow-paper-lg transition-all"
        >
          <PenTool className="w-4 h-4" />
          <span>চিঠি লিখতে শুরু করুন</span>
        </Link>
      </section>

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

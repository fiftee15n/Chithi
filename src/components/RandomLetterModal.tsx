'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Dices, ArrowRight, Heart } from 'lucide-react';
import { Letter } from '@/types/letter';
import { getStoredLetters } from '@/lib/storage';
import { formatBengaliRelativeDate, toBengaliNumber } from '@/lib/utils';

interface RandomLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RandomLetterModal({ isOpen, onClose }: RandomLetterModalProps) {
  const [randomLetter, setRandomLetter] = useState<Letter | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  // Pick a random letter
  const pickRandom = () => {
    setIsShuffling(true);
    const letters = getStoredLetters();
    if (letters.length > 0) {
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * letters.length);
        setRandomLetter(letters[randomIndex]);
        setIsShuffling(false);
      }, 300);
    }
  };

  // Initialize random letter on open if not already set
  React.useEffect(() => {
    if (isOpen && !randomLetter) {
      pickRandom();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/65 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-paper-50 rounded-2xl p-6 sm:p-8 border border-paper-300 shadow-paper-float overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-paper-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-crimson-100 text-crimson-800 flex items-center justify-center">
              <Dices className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-ink-950">
                অচেনা একটি চিঠি
              </h3>
              <p className="text-xs text-ink-500 font-sans">
                পৃথিবীর কোনো এক অচেনা মানুষের গোপন অনুভূতি
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-ink-400 hover:text-ink-900 hover:bg-paper-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Letter Card Area */}
        {randomLetter && (
          <div className={`my-6 transition-all duration-300 ${isShuffling ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="rounded-xl p-6 bg-white border border-paper-300 shadow-paper relative">
              <div className="flex items-center justify-between text-xs text-ink-500 mb-3">
                <span className="font-semibold text-crimson-800 bg-crimson-50 px-2 py-0.5 rounded">
                  {randomLetter.category}
                </span>
                <span>{formatBengaliRelativeDate(randomLetter.createdAt)}</span>
              </div>

              <div className="text-xs text-ink-400 font-medium">প্রাপক:</div>
              <h4 className="font-serif font-bold text-xl text-ink-950 mb-3">
                {randomLetter.recipient}
              </h4>

              <p className="text-ink-800 text-sm sm:text-base leading-relaxed font-sans line-clamp-6 whitespace-pre-line mb-4">
                {randomLetter.body}
              </p>

              <div className="pt-3 border-t border-paper-100 flex items-center justify-between text-xs">
                <div className="font-serif italic text-ink-600">
                  ইতি, <span className="font-semibold text-ink-900">{randomLetter.senderName}</span>
                </div>
                <div className="flex items-center gap-1 text-crimson-700 font-semibold">
                  <Heart className="w-3.5 h-3.5 fill-crimson-700" />
                  <span>{toBengaliNumber(randomLetter.likes)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={pickRandom}
            disabled={isShuffling}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-paper-200 hover:bg-paper-300 text-ink-800 rounded-lg transition-colors active:scale-95"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>অন্য একটি চিঠি খুলুন</span>
          </button>

          {randomLetter && (
            <Link
              href={`/letters/${randomLetter.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-crimson-800 hover:bg-crimson-900 text-white rounded-lg transition-colors active:scale-95"
            >
              <span>সম্পূর্ণ পড়ুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

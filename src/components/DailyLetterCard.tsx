'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Quote } from 'lucide-react';
import { Letter } from '@/types/letter';
import { formatBengaliRelativeDate, toBengaliNumber } from '@/lib/utils';

interface DailyLetterCardProps {
  letter: Letter;
}

export default function DailyLetterCard({ letter }: DailyLetterCardProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-paper-100 via-paper-50 to-sepia-50 p-6 sm:p-10 border border-paper-300 shadow-paper-lg my-8">
      {/* Decorative Stamp Element */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 bg-paper-50 px-3 py-1.5 rounded-full border border-paper-300 text-xs font-serif text-crimson-800 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-crimson-700 animate-pulse" />
        <span>আজকের নির্বাচিত চিঠি</span>
      </div>

      <div className="max-w-2xl">
        <div className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          <span>প্রাপক:</span>
          <span className="text-crimson-900 font-serif font-bold text-base">{letter.recipient}</span>
        </div>

        <div className="relative my-4">
          <Quote className="w-8 h-8 text-paper-300 absolute -top-4 -left-3 rotate-180 -z-0 opacity-60" />
          <p className="font-serif text-lg sm:text-2xl text-ink-900 leading-relaxed italic z-10 relative pl-4 border-l-2 border-crimson-700/40">
            {letter.body.length > 200 ? `${letter.body.substring(0, 200)}...` : letter.body}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-paper-200">
          <div className="text-sm font-serif">
            <span className="text-ink-500 italic">ইতি, </span>
            <span className="font-bold text-ink-900">{letter.senderName}</span>
            <span className="text-xs text-ink-400 font-sans ml-2">
              ({formatBengaliRelativeDate(letter.createdAt)})
            </span>
          </div>

          <Link
            href={`/letters/${letter.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-crimson-800 hover:text-crimson-950 group"
          >
            <span>সম্পূর্ণ চিঠি পড়ুন</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageSquare, Share2, Sparkles } from 'lucide-react';
import { Letter } from '@/types/letter';
import { formatBengaliRelativeDate, toBengaliNumber } from '@/lib/utils';
import { toggleLetterLike, isLetterLiked } from '@/lib/storage';

interface LetterCardProps {
  letter: Letter;
  onShare?: (letter: Letter) => void;
}

export default function LetterCard({ letter, onShare }: LetterCardProps) {
  const [liked, setLiked] = useState(() => isLetterLiked(letter.id));
  const [likeCount, setLikeCount] = useState(letter.likes);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiking(true);
    const result = toggleLetterLike(letter.id);
    setLiked(result.isLiked);
    setLikeCount(result.count);
    setTimeout(() => setIsLiking(false), 300);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(letter);
    }
  };

  const paperStyles = {
    white: 'bg-[#FFFEFD] border-[#E8DFD5]',
    cream: 'bg-[#FCF9F2] border-[#E5DAC7]',
    sepia: 'bg-[#F9F4EB] border-[#DFCFAF]',
    rose: 'bg-[#FCF7F8] border-[#EAD5DA]',
  };

  const currentPaperClass = paperStyles[letter.paperColor || 'cream'];

  return (
    <div className="group relative transition-all duration-300">
      <Link href={`/letters/${letter.id}`} className="block">
        <article
          className={`relative rounded-xl p-6 sm:p-7 border shadow-paper hover:shadow-paper-float hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[300px] ${currentPaperClass}`}
        >
          {/* Top Stamp / Category Row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-semibold text-ink-700 bg-paper-200/70 px-2.5 py-0.5 rounded-md">
                {letter.category}
              </span>
              {letter.isUnsent && (
                <span className="text-[11px] font-sans text-crimson-800 bg-crimson-50 border border-crimson-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-crimson-700" />
                  কাউকে পাঠাতে পারিনি
                </span>
              )}
            </div>

            <span className="text-[11px] text-ink-500 font-sans">
              {formatBengaliRelativeDate(letter.createdAt)}
            </span>
          </div>

          {/* Letter Header */}
          <div className="mb-3">
            <div className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-0.5">
              প্রাপক:
            </div>
            <h3 className="font-serif font-bold text-xl text-ink-950 group-hover:text-crimson-900 transition-colors">
              {letter.recipient}
            </h3>
          </div>

          {/* Body Snippet */}
          <div className="flex-1 my-2">
            <p className="text-ink-800 text-[15px] leading-relaxed font-sans line-clamp-4 whitespace-pre-line">
              {letter.body}
            </p>
          </div>

          {/* Sender Sign-off */}
          <div className="mt-4 pt-3 border-t border-paper-200/80 flex items-center justify-between">
            <div className="text-sm">
              <span className="text-xs text-ink-500 font-serif italic">ইতি, </span>
              <span className="font-semibold text-ink-900 font-serif">
                {letter.senderName}
              </span>
            </div>

            {/* Interaction Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all active:scale-90 ${
                  liked
                    ? 'text-crimson-700 font-semibold bg-crimson-50'
                    : 'text-ink-600 hover:text-crimson-700 hover:bg-paper-200/60'
                }`}
                title="ভালো লেগেছে"
              >
                <Heart
                  className={`w-4 h-4 transition-transform duration-200 ${
                    liked ? 'fill-crimson-700 text-crimson-700' : ''
                  } ${isLiking ? 'scale-125' : ''}`}
                />
                <span>{toBengaliNumber(likeCount)}</span>
              </button>

              {letter.replyCount > 0 && (
                <div
                  className="flex items-center gap-1 text-xs text-ink-600 bg-paper-200/50 px-2 py-1 rounded-full"
                  title="উত্তরসমূহ"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-ink-500" />
                  <span>{toBengaliNumber(letter.replyCount)}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleShareClick}
                className="text-ink-400 hover:text-ink-800 p-1 rounded-full hover:bg-paper-200/50 transition-colors"
                title="শেয়ার করুন"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}

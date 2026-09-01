'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { Letter } from '@/types/letter';

interface ShareLetterModalProps {
  letter: Letter | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareLetterModal({ letter, isOpen, onClose }: ShareLetterModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen || !letter) return null;

  const letterUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/letters/${letter.id}`
    : `/letters/${letter.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(letterUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(letter.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        url: letterUrl,
      }).catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-paper-50 rounded-2xl p-6 sm:p-7 border border-paper-300 shadow-paper-float"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-ink-400 hover:text-ink-900 hover:bg-paper-200/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-crimson-800 mb-1">
          <Share2 className="w-5 h-5" />
          <h3 className="font-serif font-bold text-lg text-ink-950">
            চিঠি শেয়ার করুন
          </h3>
        </div>
        <p className="text-xs text-ink-500 mb-5 font-sans">
          কাউকে এই না-বলা কথাটি পড়ার সুযোগ করে দিন।
        </p>

        {/* Letter Mini Preview */}
        <div className="p-4 rounded-xl bg-white border border-paper-200 mb-5 font-serif text-sm text-ink-800 shadow-sm">
          <div className="text-xs text-ink-500 mb-1">প্রাপক: {letter.recipient}</div>
          <div className="italic line-clamp-2">
            “{letter.body.substring(0, 120)}...”
          </div>
          <div className="text-right text-xs text-ink-600 mt-2 font-semibold">
            — {letter.senderName}
          </div>
        </div>

        {/* Link Copy Box */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-ink-700 block mb-1.5">
              সরাসরি লিংক
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={letterUrl}
                className="w-full text-xs bg-paper-100/70 border border-paper-300 rounded-lg px-3 py-2 text-ink-800 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium bg-paper-200 hover:bg-paper-300 text-ink-900 rounded-lg transition-colors shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-700" />
                    <span>কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>কপি</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Letter Code */}
          <div>
            <label className="text-xs font-semibold text-ink-700 block mb-1.5">
              চিঠির কোড (অনুসন্ধানের জন্য)
            </label>
            <div className="flex items-center justify-between p-3 rounded-lg bg-paper-100 border border-paper-300">
              <span className="font-mono font-bold text-sm tracking-wider text-crimson-900">
                {letter.code}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-xs text-crimson-800 hover:text-crimson-950 font-medium flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'কপি হয়েছে' : 'কোড কপি'}</span>
              </button>
            </div>
          </div>

          {/* Native Share button if available */}
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-crimson-800 hover:bg-crimson-900 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-paper"
            >
              <Sparkles className="w-4 h-4 text-crimson-200" />
              <span>অন্য অ্যাপে শেয়ার করুন</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

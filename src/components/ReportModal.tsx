'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Check } from 'lucide-react';
import { reportLetter } from '@/lib/storage';

interface ReportModalProps {
  letterId: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  'অশালীন বা অশ্লীল বিষয়বস্তু',
  'হয়রানি বা ব্যক্তিগত আক্রমণ',
  'ব্যক্তিগত গোপন তথ্য প্রকাশ (ফোন, ঠিকানা, NID)',
  'হুমকি বা ভীতি প্রদর্শন',
  'প্রতারণা বা বিভ্রান্তিকর তথ্য',
  'ঘৃণামূলক বক্তব্য (Hate speech)',
  'অন্য কোনো কারণ',
];

export default function ReportModal({ letterId, isOpen, onClose }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;

    reportLetter(letterId, selectedReason);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setSelectedReason('');
      onClose();
    }, 1800);
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

        {isSubmitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-ink-900">
              প্রতিবেদন জমা দেওয়া হয়েছে
            </h3>
            <p className="text-sm text-ink-600 mt-2 font-sans">
              আপনার সতর্কতার জন্য ধন্যবাদ। আমাদের মডারেশন টিম এটি খতিয়ে দেখবে।
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 text-crimson-800 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-serif font-bold text-lg text-ink-950">
                চিঠিটি প্রতিবেদন করুন
              </h3>
            </div>
            <p className="text-xs text-ink-500 mb-4">
              কোনো চিঠি যদি প্ল্যাটফর্মের নিয়ম ভঙ্গ করে তবে কারণ নির্বাচন করুন:
            </p>

            <div className="space-y-2 mb-6">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'border-crimson-700 bg-crimson-50/60 text-crimson-950 font-medium'
                      : 'border-paper-200 bg-white hover:bg-paper-100/50 text-ink-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-crimson-800"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-ink-600 hover:text-ink-900 rounded-lg"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={!selectedReason}
                className="px-4 py-2 text-xs font-semibold bg-crimson-800 hover:bg-crimson-900 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                প্রতিবেদন পাঠান
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Feather,
  Search,
  Bookmark,
  Trash2,
  ExternalLink,
  Plus,
  Key,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Letter } from '@/types/letter';
import {
  getMyAuthoredLetters,
  getBookmarkedLetters,
  getLetterByCode,
  saveMyLetterCode,
  deleteLetter,
} from '@/lib/storage';
import { formatBengaliRelativeDate, toBengaliNumber } from '@/lib/utils';
import LetterCard from '@/components/LetterCard';

export default function MyLettersPage() {
  const [activeTab, setActiveTab] = useState<'authored' | 'lookup' | 'bookmarked'>('authored');
  const [authoredLetters, setAuthoredLetters] = useState<Letter[]>([]);
  const [bookmarkedLetters, setBookmarkedLetters] = useState<Letter[]>([]);

  // Lookup state
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState<Letter | null | undefined>(undefined);

  // Delete modal state
  const [letterToDelete, setLetterToDelete] = useState<Letter | null>(null);
  const [deleteConfirmCode, setDeleteConfirmCode] = useState('');
  const [deleteError, setDeleteError] = useState(false);

  const loadData = () => {
    setAuthoredLetters(getMyAuthoredLetters());
    setBookmarkedLetters(getBookmarkedLetters());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('chithi_letters_updated', loadData);
    window.addEventListener('chithi_my_codes_updated', loadData);
    window.addEventListener('chithi_bookmarks_updated', loadData);
    return () => {
      window.removeEventListener('chithi_letters_updated', loadData);
      window.removeEventListener('chithi_my_codes_updated', loadData);
      window.removeEventListener('chithi_bookmarks_updated', loadData);
    };
  }, []);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupCode.trim()) return;
    const found = getLetterByCode(lookupCode.trim());
    setLookupResult(found || null);
    if (found) {
      // Save code to local collection so it remembers
      saveMyLetterCode(found.code);
      loadData();
    }
  };

  const handleDelete = () => {
    if (!letterToDelete) return;
    const success = deleteLetter(letterToDelete.id, deleteConfirmCode.trim());
    if (success) {
      setLetterToDelete(null);
      setDeleteConfirmCode('');
      setDeleteError(false);
      loadData();
    } else {
      setDeleteError(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-crimson-800 bg-crimson-50 px-3 py-1 rounded-full border border-crimson-200 mb-2">
          <Feather className="w-3.5 h-3.5" />
          <span>চিঠির সংরক্ষণাগার</span>
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-4xl text-ink-950 mb-2">
          আমার চিঠি
        </h1>
        <p className="text-xs sm:text-sm text-ink-600 font-sans">
          কোনো পাসওয়ার্ড বা অ্যাকাউন্ট ছাড়াই সংরক্ষণ কোড দিয়ে আপনার চিঠি খুঁজুন
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 border-b border-paper-200 pb-3 mb-8">
        <button
          onClick={() => setActiveTab('authored')}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
            activeTab === 'authored'
              ? 'bg-crimson-800 text-white font-semibold shadow-xs'
              : 'bg-white border border-paper-200 text-ink-700 hover:bg-paper-100'
          }`}
        >
          আমার লেখা চিঠি ({toBengaliNumber(authoredLetters.length)})
        </button>

        <button
          onClick={() => setActiveTab('lookup')}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
            activeTab === 'lookup'
              ? 'bg-crimson-800 text-white font-semibold shadow-xs'
              : 'bg-white border border-paper-200 text-ink-700 hover:bg-paper-100'
          }`}
        >
          কোড দিয়ে খুঁজুন
        </button>

        <button
          onClick={() => setActiveTab('bookmarked')}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
            activeTab === 'bookmarked'
              ? 'bg-crimson-800 text-white font-semibold shadow-xs'
              : 'bg-white border border-paper-200 text-ink-700 hover:bg-paper-100'
          }`}
        >
          হৃদয়ে রাখা চিঠি ({toBengaliNumber(bookmarkedLetters.length)})
        </button>
      </div>

      {/* Tab 1: Authored Letters */}
      {activeTab === 'authored' && (
        <div>
          {authoredLetters.length > 0 ? (
            <div className="space-y-4">
              {authoredLetters.map((letter) => (
                <div
                  key={letter.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-paper-200 shadow-paper-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-ink-500 mb-1">
                      <span className="font-mono font-bold text-crimson-900 bg-crimson-50 px-2 py-0.5 rounded border border-crimson-100">
                        {letter.code}
                      </span>
                      <span>•</span>
                      <span>প্রাপক: <strong>{letter.recipient}</strong></span>
                      <span>•</span>
                      <span>{formatBengaliRelativeDate(letter.createdAt)}</span>
                    </div>

                    <p className="font-serif text-sm sm:text-base text-ink-900 line-clamp-2 my-1">
                      {letter.body}
                    </p>

                    <div className="text-xs text-ink-500 font-serif italic">
                      ইতি, {letter.senderName} ({letter.category})
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/letters/${letter.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-paper-100 hover:bg-paper-200 text-ink-800 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <span>দেখুন</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setLetterToDelete(letter);
                        setDeleteConfirmCode('');
                        setDeleteError(false);
                      }}
                      className="p-2 rounded-lg text-ink-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="চিঠি মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-paper-200 shadow-paper-sm max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-paper-100 text-ink-400 flex items-center justify-center mx-auto mb-4">
                <Feather className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-ink-900 mb-1">
                এখানে এখনো আপনার কোনো চিঠি নেই
              </h3>
              <p className="text-xs text-ink-500 font-sans mb-6">
                আপনার ব্রাউজারে সংরক্ষিত কোনো চিঠি পাওয়া যায়নি। আপনার কাছে কি সংরক্ষণ কোড আছে?
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/write"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-crimson-800 text-white text-xs font-semibold hover:bg-crimson-900"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>একটি চিঠি লিখুন</span>
                </Link>
                <button
                  onClick={() => setActiveTab('lookup')}
                  className="px-4 py-2 rounded-full bg-paper-100 hover:bg-paper-200 text-ink-800 text-xs font-semibold"
                >
                  কোড দিয়ে খুঁজুন
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Lookup by Code */}
      {activeTab === 'lookup' && (
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleLookup} className="p-6 rounded-2xl bg-white border border-paper-200 shadow-paper-sm mb-6">
            <div className="flex items-center gap-2 text-crimson-800 mb-2 font-serif font-bold">
              <Key className="w-4 h-4" />
              <span>চিঠির সংরক্ষণ কোড লিখুন</span>
            </div>
            <p className="text-xs text-ink-500 mb-4">
              চিঠি পোস্ট করার সময় প্রাপ্ত সংরক্ষণ কোডটি লিখুন (যেমন: <strong>চিঠি-০১</strong> বা <strong>চিঠি-০২</strong>)।
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value)}
                placeholder="যেমন: চিঠি-০১ বা 01"
                className="w-full font-sans text-sm px-4 py-2.5 bg-paper-50 border border-paper-300 rounded-lg text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-crimson-800/20 focus:border-crimson-800"
              />
              <button
                type="submit"
                disabled={!lookupCode.trim()}
                className="px-5 py-2.5 bg-crimson-800 hover:bg-crimson-900 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors disabled:opacity-50"
              >
                খুঁজুন
              </button>
            </div>
          </form>

          {/* Lookup Results */}
          {lookupResult !== undefined && (
            <div>
              {lookupResult ? (
                <div className="p-5 rounded-2xl bg-white border border-paper-200 shadow-paper animate-fadeIn">
                  <div className="flex items-center gap-2 text-xs text-green-700 mb-3 font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    <span>চিঠিটি খুঁজে পাওয়া গেছে! এটি আপনার সংগ্রহে যুক্ত হলো।</span>
                  </div>
                  <LetterCard letter={lookupResult} />
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-paper-50 border border-paper-200 text-center text-xs text-ink-600">
                  <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <p className="font-serif font-bold text-sm text-ink-900 mb-1">
                    এই কোডের কোনো চিঠি খুঁজে পাওয়া যায়নি
                  </p>
                  <p>দয়া করে কোডের বানান ও ফরম্যাট (যেমন: CHT-XXXXX) যাচাই করুন।</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Bookmarked Letters */}
      {activeTab === 'bookmarked' && (
        <div>
          {bookmarkedLetters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookmarkedLetters.map((letter) => (
                <LetterCard key={letter.id} letter={letter} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-paper-200 shadow-paper-sm max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-paper-100 text-ink-400 flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-ink-900 mb-1">
                কোনো সংরক্ষিত চিঠি নেই
              </h3>
              <p className="text-xs text-ink-500 font-sans mb-6">
                চিঠি পড়ার সময় &quot;সংরক্ষণ করুন&quot; বাটনে চাপলে সেগুলো এখানে পাওয়া যাবে।
              </p>
              <Link
                href="/letters"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-crimson-800 text-white text-xs font-semibold hover:bg-crimson-900"
              >
                <span>চিঠিগুলো পড়ুন</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal (Bengali Microcopy) */}
      {letterToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-sm animate-fadeIn">
          <div
            className="relative w-full max-w-md bg-paper-50 rounded-2xl p-6 sm:p-7 border border-paper-300 shadow-paper-float"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-red-700 mb-2 font-serif font-bold text-lg">
              <Trash2 className="w-5 h-5" />
              <span>চিঠিটি সত্যিই মুছে ফেলতে চান?</span>
            </div>

            <p className="text-xs text-ink-600 mb-4 leading-relaxed">
              চিঠি মুছে ফেললে তা স্থায়ীভাবে প্ল্যাটফর্ম থেকে মুছে যাবে এবং কেউ আর পড়তে পারবে না।
            </p>

            <div className="p-3 rounded-lg bg-white border border-paper-200 text-xs mb-4">
              <div className="text-ink-500 mb-1">প্রাপক: <strong>{letterToDelete.recipient}</strong></div>
              <div className="line-clamp-2 italic text-ink-800">“{letterToDelete.body}”</div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-ink-700 block mb-1">
                নিশ্চিত করতে এই চিঠির কোডটি লিখুন:
              </label>
              <input
                type="text"
                value={deleteConfirmCode}
                onChange={(e) => {
                  setDeleteConfirmCode(e.target.value);
                  setDeleteError(false);
                }}
                placeholder={letterToDelete.code}
                className="w-full text-xs font-mono px-3 py-2 bg-white border border-paper-300 rounded-lg uppercase text-ink-900 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              {deleteError && (
                <p className="text-[11px] text-red-600 mt-1">
                  সঠিক সংরক্ষণ কোডটি প্রদান করুন।
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLetterToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-ink-600 hover:text-ink-900"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-semibold bg-red-700 hover:bg-red-800 text-white rounded-lg transition-colors"
              >
                চিঠিটি মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

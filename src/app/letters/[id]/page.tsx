'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Bookmark,
  Share2,
  AlertTriangle,
  ArrowLeft,
  MessageSquare,
  PenTool,
  Check,
  Sparkles,
  Calendar,
  Tag,
  ShieldAlert
} from 'lucide-react';
import { Letter, LetterReply, SenderType } from '@/types/letter';
import {
  getLetterById,
  getRepliesForLetter,
  createReply,
  toggleLetterLike,
  isLetterLiked,
  toggleLetterBookmark,
  isLetterBookmarked,
} from '@/lib/storage';
import { formatBengaliFullDate, formatBengaliRelativeDate, toBengaliNumber } from '@/lib/utils';
import ReportModal from '@/components/ReportModal';
import ShareLetterModal from '@/components/ShareLetterModal';

export default function LetterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const letterId = resolvedParams.id;
  const router = useRouter();

  const [letter, setLetter] = useState<Letter | undefined>(undefined);
  const [replies, setReplies] = useState<LetterReply[]>([]);
  const [loading, setLoading] = useState(true);

  // Reaction states
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);

  // Reply Composer state
  const [isReplying, setIsReplying] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [replySenderType, setReplySenderType] = useState<SenderType>('anonymous');
  const [replyCustomName, setReplyCustomName] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Modals
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Load letter and replies
  const loadData = () => {
    const found = getLetterById(letterId);
    setLetter(found);
    if (found) {
      setLiked(isLetterLiked(found.id));
      setLikeCount(found.likes);
      setBookmarked(isLetterBookmarked(found.id));
      setReplies(getRepliesForLetter(found.id));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('chithi_replies_updated', loadData);
    return () => {
      window.removeEventListener('chithi_replies_updated', loadData);
    };
  }, [letterId]);

  const handleLike = () => {
    if (!letter) return;
    const res = toggleLetterLike(letter.id);
    setLiked(res.isLiked);
    setLikeCount(res.count);
  };

  const handleBookmark = () => {
    if (!letter) return;
    const isNowBookmarked = toggleLetterBookmark(letter.id);
    setBookmarked(isNowBookmarked);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!letter || !replyBody.trim()) return;

    setIsSubmittingReply(true);
    const senderName =
      replySenderType === 'anonymous'
        ? 'অজ্ঞাতনামা এক পাঠক'
        : replyCustomName.trim() || 'এক শুভাকাঙ্ক্ষী';

    createReply(letter.id, {
      body: replyBody.trim(),
      senderName,
      senderType: replySenderType,
    });

    setReplyBody('');
    setReplyCustomName('');
    setIsReplying(false);
    setIsSubmittingReply(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-crimson-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-ink-500 font-sans">চিঠির খাম খোলা হচ্ছে...</p>
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="font-serif font-bold text-2xl text-ink-900 mb-2">
          চিঠিটি পাওয়া যায়নি
        </h2>
        <p className="text-xs text-ink-500 font-sans mb-6">
          হয়তো চিঠিটি সরিয়ে নেওয়া হয়েছে কিংবা কোডটি সঠিক নয়।
        </p>
        <Link
          href="/letters"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-crimson-800 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>চিঠির তালিকায় ফিরুন</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-600 hover:text-ink-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>পেছনে ফিরুন</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-ink-500 bg-paper-200/60 px-2 py-0.5 rounded">
            {letter.code}
          </span>
          <span className="font-serif text-crimson-900 bg-crimson-50 px-2.5 py-0.5 rounded-md font-semibold border border-crimson-100">
            {letter.category}
          </span>
        </div>
      </div>

      {/* The Tactile Paper Letter Sheet */}
      <article
        className={`rounded-2xl p-7 sm:p-12 border shadow-paper-lg mb-8 relative ${
          letter.paperColor === 'cream'
            ? 'bg-[#FCF9F2] border-[#E5DAC7]'
            : letter.paperColor === 'sepia'
            ? 'bg-[#F9F4EB] border-[#DFCFAF]'
            : letter.paperColor === 'rose'
            ? 'bg-[#FCF7F8] border-[#EAD5DA]'
            : 'bg-[#FFFEFD] border-[#E8DFD5]'
        }`}
      >
        {/* Recipient & Metadata Header */}
        <div className="border-b border-paper-300/70 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-medium text-ink-500 uppercase tracking-widest block">
              প্রাপক:
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink-950 mt-0.5">
              {letter.recipient}
            </h1>
          </div>

          <div className="text-xs text-ink-500 font-sans flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-ink-400" />
            <span>{formatBengaliFullDate(letter.createdAt)}</span>
          </div>
        </div>

        {/* Salutation */}
        {letter.salutation && (
          <div className="font-serif font-bold text-lg text-ink-900 mb-4">
            {letter.salutation}
          </div>
        )}

        {/* Full Letter Body */}
        <div className="my-6">
          <p className="font-sans text-base sm:text-lg text-ink-900 leading-[1.9] whitespace-pre-line">
            {letter.body}
          </p>
        </div>

        {/* Sign-off */}
        <div className="mt-10 pt-6 border-t border-paper-300/70 flex items-center justify-between">
          <div className="font-serif">
            <span className="text-xs text-ink-500 italic block">ইতি,</span>
            <span className="font-bold text-base sm:text-lg text-ink-950">
              {letter.senderName}
            </span>
          </div>

          {/* Postal Wax Motif Seal */}
          <div className="w-10 h-10 rounded-full bg-crimson-800/90 text-paper-50 flex items-center justify-center font-serif text-xs font-bold shadow-wax">
            চিঠি
          </div>
        </div>
      </article>

      {/* Interaction Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white border border-paper-200 shadow-paper-sm mb-10">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
              liked
                ? 'bg-crimson-50 text-crimson-800 font-semibold border border-crimson-200'
                : 'bg-paper-100 text-ink-700 hover:bg-paper-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-crimson-700 text-crimson-700' : ''}`} />
            <span>{liked ? 'ভালো লেগেছে' : 'ভালো লাগলো'}</span>
            <span className="ml-1 opacity-80">({toBengaliNumber(likeCount)})</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
              bookmarked
                ? 'bg-paper-300 text-ink-950 font-semibold'
                : 'bg-paper-100 text-ink-700 hover:bg-paper-200'
            }`}
            title="চিঠিটি হৃদয়ে রাখুন"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-ink-950' : ''}`} />
            <span className="hidden sm:inline">{bookmarked ? 'সংরক্ষিত' : 'সংরক্ষণ করুন'}</span>
          </button>

          {/* Share */}
          <button
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-paper-100 text-ink-700 hover:bg-paper-200 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>শেয়ার</span>
          </button>
        </div>

        {/* Report */}
        <button
          onClick={() => setIsReportOpen(true)}
          className="text-xs text-ink-400 hover:text-crimson-800 flex items-center gap-1 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>প্রতিবেদন</span>
        </button>
      </div>

      {/* Letter Replies Thread (চিঠির উত্তর) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-paper-300 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-crimson-800" />
            <h2 className="font-serif font-bold text-lg text-ink-950">
              চিঠির উত্তরসমূহ ({toBengaliNumber(replies.length)})
            </h2>
          </div>

          {!isReplying && (
            <button
              onClick={() => setIsReplying(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-crimson-800 hover:bg-crimson-900 text-white text-xs font-semibold shadow-paper transition-colors active:scale-95"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>এই চিঠির উত্তর লিখুন</span>
            </button>
          )}
        </div>

        {/* Reply Composer */}
        {isReplying && (
          <form
            onSubmit={handleSendReply}
            className="p-5 sm:p-6 rounded-2xl bg-paper-100 border border-paper-300 shadow-paper animate-fadeIn"
          >
            <div className="flex items-center justify-between mb-3 text-xs text-ink-600">
              <span className="font-serif font-bold text-ink-900">
                উত্তর লিখছেন: {letter.senderName}-কে উদ্দেশ্য করে
              </span>
              <button
                type="button"
                onClick={() => setIsReplying(false)}
                className="text-ink-400 hover:text-ink-800"
              >
                বাতিল
              </button>
            </div>

            <textarea
              rows={4}
              required
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="আপনার উত্তরের চিঠিটি লিখুন... যেমন: তোমার চিঠিটা পড়লাম, মনের অনুভূতি স্পর্শ করল।"
              className="w-full text-xs sm:text-sm p-3.5 rounded-xl bg-white border border-paper-300 text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-crimson-800/20 focus:border-crimson-800 mb-3 resize-y"
            />

            {/* Sender selection for reply */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="replySender"
                    value="anonymous"
                    checked={replySenderType === 'anonymous'}
                    onChange={() => setReplySenderType('anonymous')}
                    className="accent-crimson-800"
                  />
                  <span>অজ্ঞাতনামা পাঠক</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="replySender"
                    value="pseudonym"
                    checked={replySenderType === 'pseudonym'}
                    onChange={() => setReplySenderType('pseudonym')}
                    className="accent-crimson-800"
                  />
                  <span>নাম লিখব</span>
                </label>
              </div>

              {replySenderType === 'pseudonym' && (
                <input
                  type="text"
                  value={replyCustomName}
                  onChange={(e) => setReplyCustomName(e.target.value)}
                  placeholder="আপনার নাম / ছদ্মনাম"
                  className="text-xs px-3 py-1.5 rounded-lg bg-white border border-paper-300 text-ink-800 focus:outline-none focus:ring-1 focus:ring-crimson-800"
                />
              )}

              <button
                type="submit"
                disabled={!replyBody.trim() || isSubmittingReply}
                className="px-5 py-2 rounded-full bg-crimson-800 hover:bg-crimson-900 text-white text-xs font-semibold shadow-paper transition-colors disabled:opacity-50"
              >
                উত্তর পাঠান ✉️
              </button>
            </div>
          </form>
        )}

        {/* Existing Replies List */}
        {replies.length > 0 ? (
          <div className="space-y-4">
            {replies.map((reply) => (
              <div
                key={reply.id}
                className="rounded-xl p-5 bg-white border border-paper-200 shadow-paper-sm"
              >
                <div className="flex items-center justify-between text-xs text-ink-500 mb-2">
                  <span className="font-serif font-semibold text-crimson-900 bg-crimson-50 px-2 py-0.5 rounded">
                    উত্তর #{toBengaliNumber(reply.replyIndex)}
                  </span>
                  <span>{formatBengaliRelativeDate(reply.createdAt)}</span>
                </div>

                <p className="text-ink-800 text-xs sm:text-sm leading-relaxed font-sans whitespace-pre-line mb-3">
                  {reply.body}
                </p>

                <div className="pt-2 border-t border-paper-100 flex items-center justify-between text-xs text-ink-600">
                  <div className="font-serif">
                    <span className="italic text-ink-400">ইতি, </span>
                    <span className="font-semibold text-ink-900">{reply.senderName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4 rounded-xl bg-paper-50 border border-paper-200 text-xs text-ink-500">
            <p className="mb-2">এই চিঠির এখনো কোনো উত্তর আসেনি।</p>
            <p className="font-serif italic text-ink-600">
              আপনি চাইলে প্রথম উত্তরটি লিখে পাঠাতে পারেন।
            </p>
          </div>
        )}
      </section>

      {/* Modals */}
      <ReportModal
        letterId={letter.id}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      <ShareLetterModal
        letter={letter}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}

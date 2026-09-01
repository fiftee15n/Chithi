'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PenTool,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';
import { RecipientType, SenderType, LetterCategory } from '@/types/letter';
import { detectPII } from '@/lib/moderation';
import { createLetter } from '@/lib/storage';
import { toBengaliNumber } from '@/lib/utils';
import confetti from 'canvas-confetti';

const RECIPIENT_OPTIONS: { id: RecipientType; label: string; placeholder: string; defaultSalutation: string }[] = [
  { id: 'specific_person', label: 'নির্দিষ্ট একজনকে', placeholder: 'যেমন: নীলা', defaultSalutation: 'প্রিয় ' },
  { id: 'special_someone', label: 'একজন বিশেষ মানুষকে', placeholder: 'যেমন: ভালোবাসার মানুষ', defaultSalutation: 'আমার বিশেষ মানুষ,' },
  { id: 'friend', label: 'বন্ধুকে', placeholder: 'যেমন: পুরোনো বন্ধু', defaultSalutation: 'প্রিয় বন্ধু,' },
  { id: 'family', label: 'পরিবারের কাউকে', placeholder: 'যেমন: মা / বাবা / বোন', defaultSalutation: 'শ্রদ্ধেয় ' },
  { id: 'myself', label: 'নিজেকে', placeholder: 'ভবিষ্যতের আমি', defaultSalutation: 'প্রিয় আমি,' },
  { id: 'past_someone', label: 'পুরোনো কাউকে', placeholder: 'হারিয়ে যাওয়া মানুষটি', defaultSalutation: 'অচেনা হয়ে যাওয়া মানুষটি,' },
  { id: 'unsent', label: 'কাউকে পাঠাতে পারিনি', placeholder: 'যার কাছে পৌঁছাবে না চিঠিটি', defaultSalutation: 'তোমাকে,' },
  { id: 'anyone', label: 'কাউকে না, শুধু লিখতে চাই', placeholder: 'শূন্যতা / আকাশ / পৃথিবী', defaultSalutation: '' },
];

const CATEGORIES: LetterCategory[] = [
  'ভালোবাসা',
  'বন্ধুত্ব',
  'বিচ্ছেদ',
  'ক্ষমা',
  'পরিবার',
  'স্মৃতি',
  'না বলা কথা',
  'কাউকে পাঠাতে পারিনি',
];

export default function WriteLetterPage() {
  const router = useRouter();

  // Form State
  const [recipientType, setRecipientType] = useState<RecipientType>('specific_person');
  const [recipientName, setRecipientName] = useState('নীলা');
  const [salutation, setSalutation] = useState('প্রিয় নীলা,');
  const [body, setBody] = useState('');
  const [senderType, setSenderType] = useState<SenderType>('anonymous');
  const [customSenderName, setCustomSenderName] = useState('');
  const [category, setCategory] = useState<LetterCategory>('ভালোবাসা');
  const [paperColor, setPaperColor] = useState<'white' | 'cream' | 'sepia' | 'rose'>('cream');

  // Preview & Submission states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [agreePublic, setAgreePublic] = useState(false);
  const [agreeNoPII, setAgreeNoPII] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [createdLetterId, setCreatedLetterId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Live PII Detection
  const piiResult = useMemo(() => {
    return detectPII(body + ' ' + recipientName + ' ' + customSenderName);
  }, [body, recipientName, customSenderName]);

  // Derived effective sender name
  const effectiveSenderName = useMemo(() => {
    if (senderType === 'anonymous') return 'অজ্ঞাতনামা';
    return customSenderName.trim() || (senderType === 'pseudonym' ? 'ছদ্মনাম' : 'বেনামী লেখক');
  }, [senderType, customSenderName]);

  const handleRecipientTypeChange = (type: RecipientType) => {
    setRecipientType(type);
    const config = RECIPIENT_OPTIONS.find((r) => r.id === type);
    if (config) {
      if (type === 'anyone') {
        setRecipientName('কাউকে না');
        setSalutation('');
      } else if (type === 'myself') {
        setRecipientName('ভবিষ্যতের আমি');
        setSalutation('প্রিয় আমি,');
      } else if (type === 'unsent') {
        setCategory('কাউকে পাঠাতে পারিনি');
      }
    }
  };

  const handlePublish = () => {
    if (!agreePublic || !agreeNoPII) return;

    const newLetter = createLetter({
      recipient: recipientName.trim() || 'অজ্ঞাত প্রাপক',
      recipientType,
      salutation: salutation.trim(),
      body: body.trim(),
      senderName: effectiveSenderName,
      senderType,
      category,
      paperColor,
      isUnsent: recipientType === 'unsent' || category === 'কাউকে পাঠাতে পারিনি',
    });

    setCreatedCode(newLetter.code);
    setCreatedLetterId(newLetter.id);
    setIsPreviewOpen(false);

    // Trigger subtle confetti
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#A02135', '#E6D7B4', '#544940'],
      });
    } catch {
      // ignore
    }
  };

  const handleCopyCode = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const charCount = body.length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Page Heading */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-crimson-800 bg-crimson-50 px-3 py-1 rounded-full border border-crimson-200 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>চিঠি লেখার ঘর</span>
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-4xl text-ink-950">
          একটি চিঠি লিখুন
        </h1>
        <p className="text-xs sm:text-sm text-ink-600 font-sans mt-1">
          বলা হয়নি এমন কথাগুলো কাগজের পাতায় নামিয়ে রাখুন
        </p>
      </div>

      {/* Main Composition Form */}
      <div className="space-y-6">
        {/* Step 1: Who is this letter for? */}
        <section className="bg-white rounded-2xl p-5 sm:p-7 border border-paper-200 shadow-paper-sm">
          <label className="font-serif font-bold text-sm sm:text-base text-ink-950 block mb-3">
            ১. এই চিঠি কাকে লিখছেন?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {RECIPIENT_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleRecipientTypeChange(option.id)}
                className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                  recipientType === option.id
                    ? 'border-crimson-700 bg-crimson-50/70 text-crimson-900 font-semibold shadow-xs'
                    : 'border-paper-200 bg-paper-50/50 hover:bg-paper-100 text-ink-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-ink-700 block mb-1">
                প্রাপকের নাম বা সম্বোধন
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="যেমন: নীলা, মা, প্রিয় বন্ধু..."
                className="w-full text-xs sm:text-sm bg-paper-50 border border-paper-300 rounded-lg px-3 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-crimson-800/20 focus:border-crimson-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-700 block mb-1">
                চিঠির শুরুর সম্বোধন (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={salutation}
                onChange={(e) => setSalutation(e.target.value)}
                placeholder="যেমন: প্রিয় নীলা,"
                className="w-full text-xs sm:text-sm bg-paper-50 border border-paper-300 rounded-lg px-3 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-crimson-800/20 focus:border-crimson-800"
              />
            </div>
          </div>
        </section>

        {/* Step 2: Category & Paper Texture */}
        <section className="bg-white rounded-2xl p-5 sm:p-7 border border-paper-200 shadow-paper-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="font-serif font-bold text-sm text-ink-950 block mb-2">
                ২. অনুভূতি বা ক্যাটাগরি
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      category === cat
                        ? 'bg-crimson-800 text-white font-semibold'
                        : 'bg-paper-100 border border-paper-200 text-ink-700 hover:bg-paper-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-serif font-bold text-sm text-ink-950 block mb-2">
                কাগজের ধরন
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'cream', name: 'ক্রিম', bg: 'bg-[#FCF9F2] border-[#E5DAC7]' },
                  { id: 'white', name: 'সাদা', bg: 'bg-[#FFFEFD] border-[#E8DFD5]' },
                  { id: 'sepia', name: 'সেপিয়া', bg: 'bg-[#F9F4EB] border-[#DFCFAF]' },
                  { id: 'rose', name: 'গোলাপি', bg: 'bg-[#FCF7F8] border-[#EAD5DA]' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaperColor(p.id as any)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${p.bg} ${
                      paperColor === p.id ? 'ring-2 ring-crimson-800 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={p.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: Tactile Letter Paper Writing Canvas */}
        <section
          className={`rounded-2xl p-6 sm:p-10 border shadow-paper transition-all duration-300 relative ${
            paperColor === 'cream'
              ? 'bg-[#FCF9F2] border-[#E5DAC7]'
              : paperColor === 'sepia'
              ? 'bg-[#F9F4EB] border-[#DFCFAF]'
              : paperColor === 'rose'
              ? 'bg-[#FCF7F8] border-[#EAD5DA]'
              : 'bg-[#FFFEFD] border-[#E8DFD5]'
          }`}
        >
          {/* Top of letter */}
          <div className="border-b border-paper-300/60 pb-3 mb-6 flex items-center justify-between">
            <span className="font-serif font-semibold text-xs sm:text-sm text-ink-500">
              প্রাপক: <strong className="text-ink-900">{recipientName || '—'}</strong>
            </span>
            <span className="text-[11px] text-ink-400 font-sans">
              তারিখ: আজ
            </span>
          </div>

          {/* Salutation preview if entered */}
          {salutation && (
            <div className="font-serif font-bold text-base sm:text-lg text-ink-950 mb-3">
              {salutation}
            </div>
          )}

          {/* Letter Body Textarea */}
          <div className="relative">
            <textarea
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="এখানে আপনার মনের না-বলা কথাগুলো লিখুন... কোনো তাড়া নেই, ধীরে ধীরে লিখুন।"
              className="w-full bg-transparent border-none focus:outline-none font-sans text-sm sm:text-base text-ink-900 leading-relaxed placeholder:text-ink-400 resize-y"
            />
          </div>

          {/* Sign-off footer inside paper */}
          <div className="mt-8 pt-4 border-t border-paper-300/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="font-serif">
              <span className="text-xs text-ink-500 italic">ইতি, </span>
              <span className="font-bold text-ink-900 text-sm sm:text-base">
                {effectiveSenderName}
              </span>
            </div>

            <div className="text-[11px] text-ink-500 font-sans">
              {toBengaliNumber(wordCount)} টি শব্দ | {toBengaliNumber(charCount)} টি অক্ষর
            </div>
          </div>
        </section>

        {/* Step 4: Sender Identity & Anonymity Settings */}
        <section className="bg-white rounded-2xl p-5 sm:p-7 border border-paper-200 shadow-paper-sm">
          <label className="font-serif font-bold text-sm sm:text-base text-ink-950 block mb-2">
            ৩. প্রেরকের পরিচয় ও গোপনীয়তা
          </label>
          <p className="text-xs text-ink-500 mb-4">
            চিঠিতে আপনার নাম থাকবে কি না, সম্পূর্ণ আপনার ইচ্ছার ওপর নির্ভর করে।
          </p>

          <div className="space-y-2 mb-4">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-paper-200 bg-paper-50/50 hover:bg-paper-100/60 cursor-pointer transition-colors">
              <input
                type="radio"
                name="senderType"
                value="anonymous"
                checked={senderType === 'anonymous'}
                onChange={() => setSenderType('anonymous')}
                className="accent-crimson-800"
              />
              <div>
                <span className="text-xs sm:text-sm font-semibold text-ink-900 block">
                  অজ্ঞাতনামা থাকতে চাই (Anonymous)
                </span>
                <span className="text-[11px] text-ink-500 block">
                  চিঠিতে প্রেরক হিসেবে শুধু &quot;অজ্ঞাতনামা&quot; প্রদর্শিত হবে।
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-paper-200 bg-paper-50/50 hover:bg-paper-100/60 cursor-pointer transition-colors">
              <input
                type="radio"
                name="senderType"
                value="pseudonym"
                checked={senderType === 'pseudonym'}
                onChange={() => setSenderType('pseudonym')}
                className="accent-crimson-800"
              />
              <div className="flex-1">
                <span className="text-xs sm:text-sm font-semibold text-ink-900 block">
                  একটি ছদ্মনাম ব্যবহার করব
                </span>
                <span className="text-[11px] text-ink-500 block">
                  যেমন: &quot;দূর আকাশের তারা&quot;, &quot;একজন পথিক&quot; ইত্যাদি।
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-paper-200 bg-paper-50/50 hover:bg-paper-100/60 cursor-pointer transition-colors">
              <input
                type="radio"
                name="senderType"
                value="real_name"
                checked={senderType === 'real_name'}
                onChange={() => setSenderType('real_name')}
                className="accent-crimson-800"
              />
              <div className="flex-1">
                <span className="text-xs sm:text-sm font-semibold text-ink-900 block">
                  আমার নাম বা ডাকনাম প্রকাশ করব
                </span>
              </div>
            </label>
          </div>

          {senderType !== 'anonymous' && (
            <div className="mt-3">
              <label className="text-xs font-semibold text-ink-700 block mb-1">
                {senderType === 'pseudonym' ? 'ছদ্মনামটি লিখুন' : 'আপনার নাম লিখুন'}
              </label>
              <input
                type="text"
                value={customSenderName}
                onChange={(e) => setCustomSenderName(e.target.value)}
                placeholder={senderType === 'pseudonym' ? 'যেমন: একজন অচেনা মানুষ' : 'যেমন: তামাল'}
                className="w-full text-xs sm:text-sm bg-paper-50 border border-paper-300 rounded-lg px-3 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-crimson-800/20 focus:border-crimson-800"
              />
            </div>
          )}
        </section>

        {/* PII Safety Warning Banner if triggered */}
        {piiResult.hasPII && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-1">গোপনীয়তা সতর্কতা:</span>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-amber-800">
                {piiResult.warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
              <p className="text-[11px] text-amber-700 mt-2">
                অন্যের বা নিজের ব্যক্তিগত নিরাপত্তা বজায় রাখতে নম্বর বা ঠিকানা মুছে দেওয়ার পরামর্শ দেওয়া হচ্ছে।
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            disabled={!body.trim()}
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-crimson-800 hover:bg-crimson-900 text-white font-medium text-sm shadow-paper hover:shadow-paper-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
            <span>চিঠিটি প্রকাশের আগে দেখুন</span>
          </button>
        </div>
      </div>

      {/* Preview & Confirmation Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div
            className="relative w-full max-w-xl bg-paper-50 rounded-2xl p-6 sm:p-8 border border-paper-300 shadow-paper-float my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-paper-200 mb-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-crimson-800" />
                <h3 className="font-serif font-bold text-lg text-ink-950">
                  আপনার চিঠি প্রকাশের আগে দেখে নিন
                </h3>
              </div>
            </div>

            {/* Paper Preview */}
            <div className="p-6 rounded-xl bg-white border border-paper-200 font-serif shadow-paper-sm mb-6">
              <div className="flex items-center justify-between text-xs text-ink-500 mb-3">
                <span className="font-semibold text-crimson-800 bg-crimson-50 px-2 py-0.5 rounded">
                  {category}
                </span>
                <span>প্রাপক: <strong>{recipientName}</strong></span>
              </div>

              {salutation && (
                <div className="font-bold text-ink-950 text-base mb-2">
                  {salutation}
                </div>
              )}

              <p className="text-ink-900 text-sm leading-relaxed font-sans whitespace-pre-line my-3">
                {body}
              </p>

              <div className="pt-3 border-t border-paper-100 text-right text-xs text-ink-700">
                <span className="italic">ইতি, </span>
                <span className="font-bold text-ink-950">{effectiveSenderName}</span>
              </div>
            </div>

            {/* Verification Checkboxes */}
            <div className="space-y-3 mb-6 p-4 rounded-xl bg-paper-100/70 border border-paper-200 text-xs text-ink-800">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreePublic}
                  onChange={(e) => setAgreePublic(e.target.checked)}
                  className="mt-0.5 accent-crimson-800"
                />
                <span>আমি বুঝতে পারছি যে এই চিঠি প্রকাশ্যে দেখা যাবে।</span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeNoPII}
                  onChange={(e) => setAgreeNoPII(e.target.checked)}
                  className="mt-0.5 accent-crimson-800"
                />
                <span>আমি অন্য কারও অনিচ্ছাকৃত ব্যক্তিগত তথ্য বা গোপনীয়তা লঙ্ঘন করছি না।</span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 text-xs font-medium text-ink-600 hover:text-ink-900"
              >
                আরেকটু সংশোধন করি
              </button>

              <button
                type="button"
                disabled={!agreePublic || !agreeNoPII}
                onClick={handlePublish}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-crimson-800 hover:bg-crimson-900 text-white font-semibold text-xs transition-colors shadow-paper disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>চিঠি রেখে দিন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-publish Code Modal */}
      {createdCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/75 backdrop-blur-md animate-fadeIn">
          <div
            className="relative w-full max-w-md bg-paper-50 rounded-2xl p-6 sm:p-8 border border-paper-300 shadow-paper-float text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="font-serif font-bold text-xl sm:text-2xl text-ink-950 mb-1">
              আপনার চিঠিটি রেখে দেওয়া হয়েছে 💌
            </h3>

            <p className="text-xs sm:text-sm text-ink-600 font-sans mb-6">
              হয়তো কোনো একদিন উপযুক্ত মানুষটির চোখে আপনার এই না-বলা কথাটি পড়বে।
            </p>

            {/* Retrieval Code Box */}
            <div className="p-4 rounded-xl bg-white border border-paper-300 mb-6 shadow-paper-sm text-left">
              <div className="text-xs font-semibold text-ink-600 mb-1">
                আপনার চিঠির সংরক্ষণ কোড:
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-lg text-crimson-900 tracking-wider">
                  {createdCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-paper-100 hover:bg-paper-200 text-ink-800 text-xs font-medium transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'কপি হয়েছে' : 'কোড কপি'}</span>
                </button>
              </div>
              <p className="text-[11px] text-ink-400 mt-2 font-sans">
                এই কোডটি দিয়ে আপনি পরবর্তীতে &quot;আমার চিঠি&quot; পেজ থেকে এই চিঠি খুঁজে পেতে ও পরিচালনা করতে পারবেন।
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Link
                href={`/letters/${createdLetterId}`}
                className="flex-1 py-2.5 px-4 rounded-full bg-crimson-800 hover:bg-crimson-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-paper"
              >
                <span>চিঠিটি দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/my-letters"
                className="flex-1 py-2.5 px-4 rounded-full bg-white hover:bg-paper-100 text-ink-800 border border-paper-300 text-xs font-semibold flex items-center justify-center transition-colors"
              >
                <span>আমার চিঠি তালিকা</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

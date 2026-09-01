import React from 'react';
import Link from 'next/link';
import { PenTool, ShieldCheck, Heart, Sparkles, Feather, Lock, EyeOff } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      {/* Manifesto Header */}
      <div className="text-center mb-12">
        <div className="w-12 h-12 rounded-2xl bg-crimson-800 text-paper-50 flex items-center justify-center mx-auto mb-4 shadow-paper">
          <span className="text-2xl">✉️</span>
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-5xl text-ink-950 mb-3">
          চিঠি কেন?
        </h1>
        <p className="font-serif italic text-crimson-900 text-base sm:text-xl max-w-xl mx-auto">
          “যে কথাগুলো বলা হয়নি, সেগুলো চিঠিতে থাক।”
        </p>
      </div>

      {/* Poetic Core Manifesto */}
      <article className="paper-sheet rounded-2xl p-8 sm:p-12 mb-10 text-ink-900 leading-relaxed font-serif text-base sm:text-lg space-y-5">
        <p>
          কারণ কিছু কথা মুখে বলা যায় না।
        </p>
        <p>
          কিছু মানুষকে বলা যায় না।
        </p>
        <p>
          কিছু অনুভূতি প্রকাশ করার মতো সাহস সবার একজীবনে হয়ে ওঠে না।
        </p>
        <p>
          আর কিছু কথা হয়তো কাউকে বলার জন্যও নয়—শুধু লিখে রেখে মনটাকে হালকা করার জন্য।
        </p>
        <div className="pt-4 border-t border-paper-200 font-bold text-crimson-950 text-lg sm:text-xl">
          চিঠি সেই না-বলা কথাগুলোর নিরাপদ ঠিকানা।
        </div>
      </article>

      {/* Principles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
        <div className="p-6 rounded-2xl bg-white border border-paper-200 shadow-paper-sm">
          <div className="w-10 h-10 rounded-xl bg-paper-100 text-crimson-800 flex items-center justify-center mb-3">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-ink-950 mb-1.5">
            আপনার পরিচয় আপনারই
          </h3>
          <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
            চিঠি লিখতে কাউকে অ্যাকাউন্ট তৈরি করতে হবে না। আপনি চাইলে সম্পূর্ণ অজ্ঞাতনামা হিসেবে চিঠি লিখে রেখে যেতে পারেন।
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-paper-200 shadow-paper-sm">
          <div className="w-10 h-10 rounded-xl bg-paper-100 text-crimson-800 flex items-center justify-center mb-3">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-ink-950 mb-1.5">
            কোনো সোশ্যাল মিডিয়া প্রতিযোগিতা নেই
          </h3>
          <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
            এখানে কোনো ফলোয়ার কাউন্ট নেই, ইনফ্লুয়েন্সার কালচার নেই, লাইকের জন্য ট্রোলিং নেই। শুধু নির্ভেজাল মানুষের অনুভূতি।
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-paper-200 shadow-paper-sm">
          <div className="w-10 h-10 rounded-xl bg-paper-100 text-crimson-800 flex items-center justify-center mb-3">
            <Feather className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-ink-950 mb-1.5">
            চিঠির উত্তর (Letter Threads)
          </h3>
          <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
            চিঠি পড়ার পর সাধারণ কমেন্ট নয়, বরং আরেকটি চিঠির মাধ্যমে আপনি উত্তর রেখে যেতে পারেন। তৈরি হয় বেনামী চিঠির মিতালী।
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-paper-200 shadow-paper-sm">
          <div className="w-10 h-10 rounded-xl bg-paper-100 text-crimson-800 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-ink-950 mb-1.5">
            নিরাপত্তা ও মডারেশন
          </h3>
          <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
            কারও ফোন নম্বর, ঠিকানা বা গোপন তথ্য প্রকাশ রোধে রয়েছে অটোমেটেড সতর্কতা ব্যবস্থা ও সহজ প্রতিবেদন পদ্ধতি।
          </p>
        </div>
      </div>

      {/* Postal Messenger / Piyon Note */}
      <div className="p-6 sm:p-8 rounded-2xl bg-paper-100/80 border border-paper-300 shadow-paper-sm mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-crimson-900 text-paper-50 flex items-center justify-center text-xl shadow-wax flex-shrink-0">
            📮
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-bold text-crimson-900 bg-crimson-100/70 px-2 py-0.5 rounded">
                চিঠির পিয়ন (Piyon)
              </span>
              <span className="text-xs font-serif italic text-ink-500">ডাকঘরের কারিগর</span>
            </div>
            <p className="font-serif text-sm sm:text-base text-ink-900 font-medium mt-1">
              ডিজিটাল যুগেও মানুষের না-বলা কথাগুলোকে অক্ষরের ঠিকানায় নিরাপদে বাঁচিয়ে রাখার এক নিভৃত প্রয়াস।
            </p>
          </div>
        </div>
        <a
          href="https://www.facebook.com/tamal.ehmad15/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-serif font-semibold px-4 py-2 rounded-full bg-white border border-paper-300 text-ink-900 hover:text-crimson-900 hover:border-crimson-300 shadow-paper-sm transition-all self-end sm:self-center flex-shrink-0"
        >
          <span>ডাকহরকরা: জাহাঙ্গীর আলম তমাল</span>
          <span className="text-crimson-700">↗</span>
        </a>
      </div>

      {/* CTA Box */}
      <div className="text-center p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-paper-100 to-sepia-50 border border-paper-300 shadow-paper">
        <h2 className="font-serif font-bold text-2xl text-ink-950 mb-2">
          আজই আপনার মনের কথাটি লিখে ফেলুন
        </h2>
        <p className="text-xs sm:text-sm text-ink-600 font-sans max-w-md mx-auto mb-6">
          পৃথিবীর অন্য প্রান্তের কোনো একজন মানুষ হয়তো আপনার চিঠিটি পড়ে খুঁজে পাবে বেঁচে থাকার নতুন প্রেরণা।
        </p>
        <Link
          href="/write"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-crimson-800 hover:bg-crimson-900 text-white font-semibold text-xs sm:text-sm shadow-paper transition-all"
        >
          <PenTool className="w-4 h-4" />
          <span>চিঠির পাতায় লিখুন</span>
        </Link>
      </div>
    </div>
  );
}

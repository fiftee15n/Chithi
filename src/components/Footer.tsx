import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-paper-200 bg-paper-100/60 mt-auto py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="text-xl">✉️</span>
            <span className="font-serif font-bold text-xl text-ink-950">চিঠি</span>
          </div>
          <p className="text-sm text-ink-600 font-serif italic max-w-md">
            “যে কথাগুলো মুখে বলা যায় না, সেগুলো চিঠিতে লিখে রেখে যান।”
          </p>
          <p className="text-xs text-ink-500 mt-1">
            কোনো ফলোয়ার নেই, কোনো লাইকের প্রতিযোগিতা নেই। শুধু নির্ভেজাল অনুভূতি।
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-ink-600">
          <Link href="/letters" className="hover:text-crimson-800 transition-colors">
            চিঠিগুলো
          </Link>
          <span className="text-paper-300">•</span>
          <Link href="/unsent" className="hover:text-crimson-800 transition-colors">
            কাউকে পাঠাতে পারিনি
          </Link>
          <span className="text-paper-300">•</span>
          <Link href="/my-letters" className="hover:text-crimson-800 transition-colors">
            আমার চিঠি
          </Link>
          <span className="text-paper-300">•</span>
          <Link href="/about" className="hover:text-crimson-800 transition-colors">
            চিঠি কেন?
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-paper-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-500">
        <p>© ২০২৬ চিঠি — একটি নিরাপদ ও মুক্ত বাংলা প্ল্যাটফর্ম।</p>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
          <a
            href="https://www.facebook.com/tamal.ehmad15/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-crimson-800 transition-colors font-serif"
          >
            <span>📮 চিঠির ডাকপিয়ন:</span>
            <span className="font-serif font-bold text-ink-800 hover:text-crimson-800 underline decoration-dotted">
              জাহাঙ্গীর আলম তমাল
            </span>
          </a>
          <span className="text-paper-300 hidden sm:inline">•</span>
          <p className="flex items-center gap-1">
            হৃদয় থেকে লেখা প্রতিটি চিঠির জন্য <Heart className="w-3.5 h-3.5 text-crimson-700 fill-crimson-700 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}

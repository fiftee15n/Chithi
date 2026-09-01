import type { Metadata } from 'next';
import { Noto_Serif_Bengali, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';

const serifBengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['400', '600', '700'],
  variable: '--font-serif-bengali',
  display: 'swap',
});

const sansBengali = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-bengali',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'চিঠি — একটি Anonymous Bangla Letter Platform',
  description: 'যে কথাগুলো বলা হয়নি, সেগুলো চিঠিতে থাক। সম্পূর্ণ অজ্ঞাতনামা বা ছদ্মনামে বাংলায় না-বলা কথার ডিজিটাল প্ল্যাটফর্ম।',
  keywords: ['চিঠি', 'Chithi', 'Bangla Letter', 'Anonymous Bangla', 'মনের কথা', 'বাংলা সাহিত্য', 'না বলা কথা'],
  openGraph: {
    title: 'চিঠি — বলা হয়নি এমন কথার ঠিকানা',
    description: 'আপনার না বলা কথাগুলো একটি চিঠিতে রেখে যান। নাম প্রকাশ করবেন কি না, সিদ্ধান্ত আপনার।',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${serifBengali.variable} ${sansBengali.variable}`}>
      <body className="font-sans antialiased bg-paper-50 text-ink-900 flex flex-col min-h-screen selection:bg-crimson-100 selection:text-crimson-900">
        <Navbar />
        <main className="flex-1 pb-20 md:pb-12">
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}

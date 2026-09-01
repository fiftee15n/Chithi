import type { Metadata } from 'next';
import { Noto_Serif_Bengali, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VisitorTracker from '@/components/VisitorTracker';
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://chithi-likhun-seven.vercel.app'
  ),
  title: 'চিঠি — একটি Anonymous Bangla Letter Platform',
  description: 'যে কথাগুলো বলা হয়নি, সেগুলো চিঠিতে থাক। সম্পূর্ণ অজ্ঞাতনামা বা ছদ্মনামে বাংলায় না-বলা কথার ডিজিটাল প্ল্যাটফর্ম।',
  keywords: ['চিঠি', 'Chithi', 'Bangla Letter', 'Anonymous Bangla', 'মনের কথা', 'বাংলা সাহিত্য', 'না বলা কথা'],
  openGraph: {
    title: 'চিঠি — বলা হয়নি এমন কথার ঠিকানা',
    description: 'কিছু কথা নামহীন থাকলেই হয়তো বেশি সুন্দর। আপনার না-বলা দীর্ঘশ্বাস আর অনুভূতির গল্পগুলো নির্দ্বিধায় রেখে যান চিঠির ভাঁজে।',
    type: 'website',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'চিঠি — একটি Anonymous Bangla Letter Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'চিঠি — বলা হয়নি এমন কথার ঠিকানা',
    description: 'কিছু কথা নামহীন থাকলেই হয়তো বেশি সুন্দর। আপনার না-বলা দীর্ঘশ্বাস আর অনুভূতির গল্পগুলো নির্দ্বিধায় রেখে যান চিঠির ভাঁজে।',
    images: ['/api/og'],
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
        <VisitorTracker />
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

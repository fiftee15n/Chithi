import React from 'react';
import { Metadata } from 'next';
import LetterDetailView from '@/components/LetterDetailView';
import { INITIAL_LETTERS } from '@/lib/seedData';

interface LetterPageProps {
  params: Promise<{ id: string }>;
}

async function getLetterForMetadata(rawId: string) {
  try {
    const cleanId = decodeURIComponent(rawId).trim();

    // 1. Check local seedData
    const seed = INITIAL_LETTERS.find(
      (l) => l.id.toLowerCase() === cleanId.toLowerCase() || l.code.toLowerCase() === cleanId.toLowerCase()
    );
    if (seed) return seed;

    // 2. Fetch from Firestore REST API (serverless, no client-bundle overhead)
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'chithi-64bf6';
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/letters/${cleanId}`,
      { next: { revalidate: 60 } }
    );

    if (res.ok) {
      const data = await res.json();
      const fields = data.fields;
      if (fields) {
        return {
          id: cleanId,
          recipient: fields.recipient?.stringValue || 'অজ্ঞাত প্রাপক',
          body: fields.body?.stringValue || '',
          senderName: fields.senderName?.stringValue || 'অজ্ঞাতনামা',
          category: fields.category?.stringValue || 'চিঠি',
          salutation: fields.salutation?.stringValue || '',
        };
      }
    }
  } catch (error) {
    console.error('Error fetching letter metadata:', error);
  }
  return null;
}

export async function generateMetadata({ params }: LetterPageProps): Promise<Metadata> {
  const resolved = await params;
  const letter = await getLetterForMetadata(resolved.id);

  if (!letter) {
    return {
      title: 'চিঠি — একটি নিরাপদ বাংলা প্ল্যাটফর্ম',
      description: 'কিছু কথা নামহীন থাকলেই হয়তো বেশি সুন্দর। আপনার না-বলা দীর্ঘশ্বাস আর অনুভূতির গল্পগুলো রেখে যান চিঠির ভাঁজে।',
    };
  }

  // Clean body snippet (max 150 chars for crisp preview)
  const cleanBody = letter.body.replace(/\s+/g, ' ').trim();
  const shortSnippet = cleanBody.length > 140 ? `${cleanBody.slice(0, 137)}...` : cleanBody;

  const dynamicTitle = `প্রাপক: ${letter.recipient} — চিঠি (${letter.category})`;
  const dynamicDescription = `“${shortSnippet}” — ইতি, ${letter.senderName}`;

  const ogImageUrl = `/api/og/letter?id=${encodeURIComponent(resolved.id)}`;

  return {
    title: `${dynamicTitle} | চিঠি`,
    description: dynamicDescription,
    openGraph: {
      title: dynamicTitle,
      description: dynamicDescription,
      type: 'article',
      siteName: 'চিঠি',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: dynamicTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: dynamicTitle,
      description: dynamicDescription,
      images: [ogImageUrl],
    },
  };
}

export default async function LetterDetailPage({ params }: LetterPageProps) {
  const resolvedParams = await params;
  return <LetterDetailView letterId={resolvedParams.id} />;
}

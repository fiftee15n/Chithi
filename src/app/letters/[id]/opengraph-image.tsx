import { ImageResponse } from 'next/og';
import { INITIAL_LETTERS } from '@/lib/seedData';

export const alt = 'চিঠি — প্রাপকের উদ্দেশ্যে লেখা চিঠি';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

async function getLetter(rawId: string) {
  try {
    const cleanId = decodeURIComponent(rawId).trim();
    const seed = INITIAL_LETTERS.find(
      (l) => l.id.toLowerCase() === cleanId.toLowerCase() || l.code.toLowerCase() === cleanId.toLowerCase()
    );
    if (seed) return seed;

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
        };
      }
    }
  } catch (e) {
    console.error('Error fetching letter for OG image:', e);
  }
  return null;
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  const letter = await getLetter(resolved.id);

  const recipient = letter?.recipient || 'অজ্ঞাত প্রাপক';
  const sender = letter?.senderName || 'অজ্ঞাতনামা';
  const category = letter?.category || 'চিঠি';
  const rawBody = letter?.body ? letter.body.replace(/\s+/g, ' ').trim() : 'যে কথাগুলো বলা হয়নি, সেগুলো চিঠিতে থাক।';
  const bodyText = rawBody.length > 170 ? `${rawBody.slice(0, 167)}...` : rawBody;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F2E8DC',
          padding: '36px',
        }}
      >
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#FCF9F2',
            border: '3px solid #D8C6AE',
            borderRadius: '24px',
            padding: '44px 52px',
            boxShadow: '0 16px 36px rgba(78, 59, 42, 0.15)',
            position: 'relative',
          }}
        >
          {/* Top Row: Logo & Category */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #E5D5C2',
              paddingBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#8C1D2F',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 'bold',
                }}
              >
                ✉
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '26px', fontWeight: 'bold', color: '#2B1E19' }}>
                  চিঠি
                </span>
                <span style={{ fontSize: '14px', color: '#7A6455' }}>
                  বলা হয়নি এমন কথার ঠিকানা
                </span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#F7EBEB',
                border: '1.5px solid #D8B0B6',
                color: '#8C1D2F',
                padding: '6px 18px',
                borderRadius: '999px',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              {category}
            </div>
          </div>

          {/* Middle: Recipient and Body */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '12px' }}>
            <span style={{ fontSize: '15px', color: '#8A7A6E', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
              প্রাপক:
            </span>
            <span style={{ fontSize: '34px', fontWeight: 'bold', color: '#8C1D2F', marginTop: '2px', marginBottom: '14px' }}>
              {recipient}
            </span>

            <div
              style={{
                fontSize: '22px',
                lineHeight: '1.6',
                color: '#32251F',
                fontStyle: 'italic',
                paddingLeft: '18px',
                borderLeft: '4px solid #8C1D2F',
                display: 'flex',
              }}
            >
              “{bodyText}”
            </div>
          </div>

          {/* Bottom: Sign-off & Watermark */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '2px solid #E5D5C2',
              paddingTop: '16px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', color: '#8A7A6E', fontStyle: 'italic' }}>
                ইতি,
              </span>
              <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#2B1E19' }}>
                {sender}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                color: '#8C1D2F',
                fontWeight: 'bold',
              }}
            >
              <span>চিঠির খামে পড়ুন</span>
              <span>📮</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

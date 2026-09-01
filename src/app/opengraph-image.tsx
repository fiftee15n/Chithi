import { ImageResponse } from 'next/og';

export const alt = 'চিঠি — একটি Anonymous Bangla Letter Platform';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
          padding: '40px',
        }}
      >
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FCF9F2',
            border: '3px solid #D8C6AE',
            borderRadius: '24px',
            padding: '48px 56px',
            boxShadow: '0 20px 40px rgba(78, 59, 42, 0.15)',
            textAlign: 'center',
          }}
        >
          {/* Logo icon */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#8C1D2F',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              fontWeight: 'bold',
              boxShadow: '0 8px 16px rgba(140, 29, 47, 0.3)',
            }}
          >
            ✉
          </div>

          {/* Titles */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '56px', fontWeight: 'bold', color: '#8C1D2F', marginBottom: '8px' }}>
              চিঠি (Chithi)
            </span>
            <span style={{ fontSize: '26px', color: '#2B1E19', fontWeight: 'bold', marginBottom: '12px' }}>
              “কিছু কথা বলা হয় না, শুধু লেখা হয়।”
            </span>
            <span style={{ fontSize: '18px', color: '#6E5C50', maxWidth: '780px', lineHeight: '1.5' }}>
              আপনার না-বলা দীর্ঘশ্বাস আর অনুভূতির গল্পগুলো নির্দ্বিধায় রেখে যান চিঠির ভাঁজে। সম্পূর্ণ নিরাপদ ও মুক্ত বাংলা প্ল্যাটফর্ম।
            </span>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div
              style={{
                backgroundColor: '#F7EBEB',
                border: '1.5px solid #D8B0B6',
                color: '#8C1D2F',
                padding: '6px 20px',
                borderRadius: '999px',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              📮 বেনামী চিঠি
            </div>
            <div
              style={{
                backgroundColor: '#F7EBEB',
                border: '1.5px solid #D8B0B6',
                color: '#8C1D2F',
                padding: '6px 20px',
                borderRadius: '999px',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              💌 চিঠির উত্তর
            </div>
            <div
              style={{
                backgroundColor: '#F7EBEB',
                border: '1.5px solid #D8B0B6',
                color: '#8C1D2F',
                padding: '6px 20px',
                borderRadius: '999px',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              🕊️ কোনো পরিচয় প্রকাশ নয়
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

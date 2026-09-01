import { NextRequest, NextResponse } from 'next/server';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';

let fontLoaded = false;

async function ensureFont() {
  if (fontLoaded) return;
  try {
    const boldRes = await fetch(
      'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-bengali@latest/bengali-700-normal.ttf'
    );
    if (boldRes.ok) {
      GlobalFonts.register(Buffer.from(await boldRes.arrayBuffer()), 'Noto Sans Bengali');
      fontLoaded = true;
    }
  } catch (e) {
    console.error('Error loading font in canvas:', e);
  }
}

export async function GET(req: NextRequest) {
  await ensureFont();

  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const bengaliFont = fontLoaded ? '"Noto Sans Bengali", Arial, sans-serif' : 'Arial, sans-serif';

  // 1. Background
  ctx.fillStyle = '#F0E5D8';
  ctx.fillRect(0, 0, width, height);

  // 2. Card Background
  const cardX = 40;
  const cardY = 40;
  const cardW = width - 80;
  const cardH = height - 80;
  const radius = 24;

  ctx.save();
  ctx.shadowColor = 'rgba(78, 59, 42, 0.16)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;

  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = '#FCF9F2';
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.strokeStyle = '#D8C6AE';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 3. Logo Wax Stamp
  const stampCenterX = width / 2;
  const stampCenterY = 130;
  ctx.beginPath();
  ctx.arc(stampCenterX, stampCenterY, 36, 0, Math.PI * 2);
  ctx.fillStyle = '#8C1D2F';
  ctx.fill();

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(stampCenterX - 18, stampCenterY - 13, 36, 26, 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(stampCenterX - 18, stampCenterY - 12);
  ctx.lineTo(stampCenterX, stampCenterY + 4);
  ctx.lineTo(stampCenterX + 18, stampCenterY - 12);
  ctx.stroke();

  // 4. Titles
  ctx.textAlign = 'center';
  ctx.fillStyle = '#8C1D2F';
  ctx.font = `bold 52px ${bengaliFont}`;
  ctx.fillText('চিঠি (Chithi)', width / 2, 230);

  ctx.fillStyle = '#2B1E19';
  ctx.font = `bold 28px ${bengaliFont}`;
  ctx.fillText('“কিছু কথা বলা হয় না, শুধু লেখা হয়।”', width / 2, 285);

  ctx.fillStyle = '#6E5C50';
  ctx.font = `20px ${bengaliFont}`;
  ctx.fillText(
    'আপনার না-বলা দীর্ঘশ্বাস আর অনুভূতির গল্পগুলো নির্দ্বিধায় রেখে যান চিঠির ভাঁজে।',
    width / 2,
    345
  );

  // 5. Badges
  const badges = ['বেনামী চিঠি', 'চিঠির উত্তর', 'সম্পূর্ণ গোপন ও মুক্ত'];
  const badgeW = 220;
  const badgeH = 50;
  const startX = width / 2 - (badges.length * (badgeW + 20) - 20) / 2;

  badges.forEach((b, i) => {
    const bx = startX + i * (badgeW + 20);
    const by = 440;
    ctx.beginPath();
    ctx.roundRect(bx, by, badgeW, badgeH, 25);
    ctx.fillStyle = '#F7EBEB';
    ctx.fill();
    ctx.strokeStyle = '#D8B0B6';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#8C1D2F';
    ctx.font = `bold 18px ${bengaliFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b, bx + badgeW / 2, by + badgeH / 2);
  });

  const pngBuffer = canvas.toBuffer('image/png');

  return new NextResponse(pngBuffer as any, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
    },
  });
}

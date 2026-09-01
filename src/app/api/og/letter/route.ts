import { NextRequest, NextResponse } from 'next/server';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { INITIAL_LETTERS } from '@/lib/seedData';

let fontLoaded = false;

async function ensureFont() {
  if (fontLoaded) return;
  try {
    const [boldRes, regRes] = await Promise.all([
      fetch('https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-bengali@latest/bengali-700-normal.ttf'),
      fetch('https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-bengali@latest/bengali-400-normal.ttf'),
    ]);
    if (boldRes.ok) {
      GlobalFonts.register(Buffer.from(await boldRes.arrayBuffer()), 'Noto Sans Bengali');
    }
    if (regRes.ok) {
      GlobalFonts.register(Buffer.from(await regRes.arrayBuffer()), 'Noto Sans Bengali Regular');
    }
    fontLoaded = true;
  } catch (e) {
    console.error('Error loading font in canvas:', e);
  }
}

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
    console.error('Error fetching letter for canvas OG:', e);
  }
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || 'letter-1';

  await ensureFont();
  const letter = await getLetter(id);

  const recipient = letter?.recipient || 'অজ্ঞাত প্রাপক';
  const sender = letter?.senderName || 'অজ্ঞাতনামা';
  const category = letter?.category || 'চিঠি';
  const rawBody = letter?.body
    ? letter.body.replace(/\s+/g, ' ').trim()
    : 'যে কথাগুলো বলা হয়নি, সেগুলো চিঠিতে থাক।';

  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const bengaliFont = fontLoaded ? '"Noto Sans Bengali", Arial, sans-serif' : 'Arial, sans-serif';

  // 1. Background (Warm parchment outer)
  ctx.fillStyle = '#F0E5D8';
  ctx.fillRect(0, 0, width, height);

  // 2. Card Background (Parchment letter sheet)
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

  // Card Border
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.strokeStyle = '#D8C6AE';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 3. Header Logo & Title
  // Wax circle stamp
  const stampX = cardX + 50;
  const stampY = cardY + 45;
  const stampRadius = 26;
  const stampCenterX = stampX + stampRadius;
  const stampCenterY = stampY + stampRadius;

  ctx.beginPath();
  ctx.arc(stampCenterX, stampCenterY, stampRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#8C1D2F';
  ctx.fill();

  // Draw clean vector envelope inside wax stamp
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(stampCenterX - 14, stampCenterY - 10, 28, 20, 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(stampCenterX - 14, stampCenterY - 9);
  ctx.lineTo(stampCenterX, stampCenterY + 3);
  ctx.lineTo(stampCenterX + 14, stampCenterY - 9);
  ctx.stroke();

  // Platform title & Subtitle
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#2B1E19';
  ctx.font = `bold 32px ${bengaliFont}`;
  ctx.fillText('চিঠি', stampX + 66, stampY + 26);

  ctx.fillStyle = '#7A6455';
  ctx.font = `17px ${bengaliFont}`;
  ctx.fillText('বলা হয়নি এমন কথার ঠিকানা', stampX + 66, stampY + 52);

  // Category Badge (Top Right)
  const badgeText = category;
  ctx.font = `bold 20px ${bengaliFont}`;
  const badgeMetrics = ctx.measureText(badgeText);
  const badgeW = Math.max(120, badgeMetrics.width + 44);
  const badgeH = 44;
  const badgeX = cardX + cardW - 50 - badgeW;
  const badgeY = stampY + 4;

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 22);
  ctx.fillStyle = '#F7EBEB';
  ctx.fill();
  ctx.strokeStyle = '#D8B0B6';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#8C1D2F';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2);

  // Horizontal Divider 1
  ctx.beginPath();
  ctx.moveTo(cardX + 50, cardY + 120);
  ctx.lineTo(cardX + cardW - 50, cardY + 120);
  ctx.strokeStyle = '#EADBCC';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 4. Recipient Section
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#8A7A6E';
  ctx.font = `bold 16px ${bengaliFont}`;
  ctx.fillText('প্রাপক:', cardX + 50, cardY + 160);

  ctx.fillStyle = '#8C1D2F';
  ctx.font = `bold 38px ${bengaliFont}`;
  ctx.fillText(recipient, cardX + 50, cardY + 204);

  // 5. Letter Body (with left accent bar & word wrapping)
  const quoteX = cardX + 72;
  const quoteY = cardY + 258;
  const maxQuoteWidth = cardW - 144;

  // Draw red vertical quotation border
  ctx.fillStyle = '#8C1D2F';
  ctx.fillRect(cardX + 50, quoteY - 26, 5, 140);

  // Word wrap body
  ctx.fillStyle = '#32251F';
  ctx.font = `23px ${bengaliFont}`;

  const words = rawBody.split(' ');
  let line = '"';
  let currentY = quoteY;
  const lineHeight = 38;
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxQuoteWidth && n > 0) {
      ctx.fillText(line, quoteX, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
      lineCount++;
      if (lineCount >= 3) {
        line += '...';
        break;
      }
    } else {
      line = testLine;
    }
  }
  if (!line.endsWith('"') && !line.endsWith('..."')) {
    line = line.trim() + '..."';
  }
  ctx.fillText(line, quoteX, currentY);

  // Horizontal Divider 2
  ctx.beginPath();
  ctx.moveTo(cardX + 50, cardY + cardH - 100);
  ctx.lineTo(cardX + cardW - 50, cardY + cardH - 100);
  ctx.strokeStyle = '#EADBCC';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 6. Sign-off & Watermark (Bottom)
  ctx.fillStyle = '#8A7A6E';
  ctx.font = `16px ${bengaliFont}`;
  ctx.fillText('ইতি,', cardX + 50, cardY + cardH - 68);

  ctx.fillStyle = '#2B1E19';
  ctx.font = `bold 28px ${bengaliFont}`;
  ctx.fillText(sender, cardX + 50, cardY + cardH - 34);

  // Watermark (Bottom Right)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#8C1D2F';
  ctx.font = `bold 20px ${bengaliFont}`;
  ctx.fillText('চিঠির খামে পড়ুন', cardX + cardW - 50, cardY + cardH - 46);

  const pngBuffer = canvas.toBuffer('image/png');

  return new NextResponse(pngBuffer as any, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
    },
  });
}

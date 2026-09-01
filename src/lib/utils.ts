export const BANGLA_DIGITS: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

export const ENGLISH_DIGITS: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

export function toBengaliNumber(num: number | string): string {
  return num.toString().replace(/[0-9]/g, (digit) => BANGLA_DIGITS[digit] || digit);
}

export function toEnglishNumber(str: string): string {
  return str.replace(/[০-৯]/g, (digit) => ENGLISH_DIGITS[digit] || digit);
}

export function normalizeLetterCode(code: string): string {
  if (!code) return '';
  let cleaned = code.trim().toLowerCase();
  
  // Replace prefixes
  cleaned = cleaned
    .replace(/^chithi[\s\-_]*/i, '')
    .replace(/^cht[\s\-_]*/i, '')
    .replace(/^চিঠি[\s\-_]*/i, '');
  
  // Convert any Bengali digits to English for easy canonical comparison
  cleaned = toEnglishNumber(cleaned).toUpperCase();
  
  return cleaned;
}

export function generateLetterCode(existingCount: number = 0): string {
  const nextNum = existingCount + 1;
  // If small, format like চিঠি-০১, চিঠি-০২
  if (nextNum < 10) {
    return `চিঠি-০${toBengaliNumber(nextNum)}`;
  } else if (nextNum < 100) {
    return `চিঠি-${toBengaliNumber(nextNum)}`;
  } else {
    // Or generate a random 4-digit Bengali code e.g. চিঠি-১০২৪
    const randNum = Math.floor(1000 + Math.random() * 9000);
    return `চিঠি-${toBengaliNumber(randNum)}`;
  }
}

export function formatBengaliRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'এইমাত্র';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${toBengaliNumber(diffInMinutes)} মিনিট আগে`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${toBengaliNumber(diffInHours)} ঘণ্টা আগে`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'গতকাল';
  }
  if (diffInDays < 30) {
    return `${toBengaliNumber(diffInDays)} দিন আগে`;
  }
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${toBengaliNumber(diffInMonths)} মাস আগে`;
  }
  const diffInYears = Math.floor(diffInDays / 365);
  return `${toBengaliNumber(diffInYears)} বছর আগে`;
}

export function formatBengaliFullDate(dateString: string): string {
  const date = new Date(dateString);
  const monthsInBangla = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  
  const day = toBengaliNumber(date.getDate());
  const month = monthsInBangla[date.getMonth()];
  const year = toBengaliNumber(date.getFullYear());
  
  return `${day} ${month}, ${year}`;
}

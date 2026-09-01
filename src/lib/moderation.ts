import { PIIDetectionResult } from '@/types/letter';

// Regular expressions to detect phone numbers in BD formats (Bangla digits and English digits)
const BD_PHONE_REGEX = /(?:\+?880|0)?1[3-9]\d{8}|(?:\+?৮৮০|০)?১[৩-৯][০-৯]{8}/g;

// Email regex
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// NID / Identification regex (10, 13, 17 digits)
const NID_REGEX = /\b(?:\d{10}|\d{13}|\d{17}|[০-৯]{10}|[০-৯]{13}|[০-৯]{17})\b/g;

// Obvious address indicators in Bengali
const ADDRESS_KEYWORDS = [
  'বাড়ি নম্বর', 'বাসা নং', 'রোড নং', 'হোল্ডিং নং', 'গ্রাম:', 'ডাকঘর:', 'থানা:', 'জেলা:', 'পোস্ট কোড'
];

export function detectPII(text: string): PIIDetectionResult {
  const warnings: string[] = [];

  if (BD_PHONE_REGEX.test(text)) {
    warnings.push('চিঠিতে কোনো মোবাইল বা ফোন নম্বর দেওয়া থেকে বিরত থাকুন।');
  }

  if (EMAIL_REGEX.test(text)) {
    warnings.push('চিঠিতে ব্যক্তিগত ইমেইল ঠিকানা দেখতে পাওয়া গেছে।');
  }

  if (NID_REGEX.test(text)) {
    warnings.push('চিঠিতে জাতীয় পরিচয়পত্র বা কোনো গোপন সংখ্যাক্রম থাকতে পারে।');
  }

  for (const keyword of ADDRESS_KEYWORDS) {
    if (text.includes(keyword)) {
      warnings.push('চিঠিতে সুনির্দিষ্ট বাসস্থানের ঠিকানা উল্লেখ করা নিরাপদ নয়।');
      break;
    }
  }

  return {
    hasPII: warnings.length > 0,
    warnings,
  };
}

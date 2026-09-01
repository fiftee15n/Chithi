export type RecipientType =
  | 'specific_person'     // নির্দিষ্ট একজনকে
  | 'special_someone'     // একজন বিশেষ মানুষকে
  | 'friend'              // বন্ধুকে
  | 'family'              // পরিবারের কাউকে
  | 'myself'              // নিজেকে
  | 'past_someone'        // পুরোনো কাউকে
  | 'anyone'              // কাউকে না, শুধু লিখতে চাই
  | 'unsent';             // কাউকে পাঠাতে পারিনি

export type SenderType =
  | 'anonymous'           // অজ্ঞাতনামা
  | 'pseudonym'           // ছদ্মনাম
  | 'real_name';          // আমার নাম

export type LetterCategory =
  | 'সব'
  | 'ভালোবাসা'
  | 'বন্ধুত্ব'
  | 'বিচ্ছেদ'
  | 'ক্ষমা'
  | 'পরিবার'
  | 'স্মৃতি'
  | 'না বলা কথা'
  | 'কাউকে পাঠাতে পারিনি';

export type SortOption = 'latest' | 'popular' | 'random';

export interface Letter {
  id: string;
  code: string;               // e.g. "CHT-8F29K"
  recipient: string;          // e.g. "নীলা", "মা", "আমার পুরোনো বন্ধু"
  recipientType: RecipientType;
  salutation?: string;        // e.g. "প্রিয় নীলা,"
  body: string;
  senderName: string;         // e.g. "অজ্ঞাতনামা", "তামাল", "একজন পথিক"
  senderType: SenderType;
  category: LetterCategory;
  createdAt: string;          // ISO string
  likes: number;
  replyToId?: string;         // If it is a reply to another letter
  replyCount: number;
  isDailyFeatured?: boolean;
  isUnsent?: boolean;
  paperColor?: 'white' | 'cream' | 'sepia' | 'rose';
  isReported?: boolean;
  reportReasons?: string[];
  reportCount?: number;
  isHidden?: boolean;
}

export interface ReportItem {
  id: string;
  letterId: string;
  letterCode?: string;
  recipient?: string;
  letterBody?: string;
  senderName?: string;
  reason: string;
  reportedAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface LetterReply {
  id: string;
  letterId: string;
  replyIndex: number;
  body: string;
  senderName: string;
  senderType: SenderType;
  createdAt: string;
  likes: number;
}

export interface PIIDetectionResult {
  hasPII: boolean;
  warnings: string[];
}


'use client';

import { Letter, LetterReply, LetterCategory, SortOption } from '@/types/letter';
import { INITIAL_LETTERS, INITIAL_REPLIES } from './seedData';
import { generateLetterCode, normalizeLetterCode } from './utils';

const STORAGE_KEYS = {
  LETTERS: 'chithi_letters_v2',
  REPLIES: 'chithi_replies_v2',
  MY_CODES: 'chithi_my_letter_codes_v2',
  LIKED_LETTERS: 'chithi_liked_letters_v2',
  LIKED_REPLIES: 'chithi_liked_replies_v2',
  BOOKMARKS: 'chithi_bookmarked_letters_v2',
  REPORTS: 'chithi_reported_letters_v2',
};

// Check if window is defined (browser environment)
const isBrowser = typeof window !== 'undefined';

export function getStoredLetters(): Letter[] {
  if (!isBrowser) return INITIAL_LETTERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LETTERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(INITIAL_LETTERS));
      return INITIAL_LETTERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading letters from storage', e);
    return INITIAL_LETTERS;
  }
}

export function saveLetters(letters: Letter[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(letters));
    window.dispatchEvent(new CustomEvent('chithi_letters_updated'));
  } catch (e) {
    console.error('Error saving letters to storage', e);
  }
}

export function getStoredReplies(): LetterReply[] {
  if (!isBrowser) return INITIAL_REPLIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPLIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REPLIES, JSON.stringify(INITIAL_REPLIES));
      return INITIAL_REPLIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading replies from storage', e);
    return INITIAL_REPLIES;
  }
}

export function saveReplies(replies: LetterReply[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEYS.REPLIES, JSON.stringify(replies));
    window.dispatchEvent(new CustomEvent('chithi_replies_updated'));
  } catch (e) {
    console.error('Error saving replies to storage', e);
  }
}

export function getLetterById(id: string): Letter | undefined {
  const letters = getStoredLetters();
  return letters.find((l) => l.id === id);
}

export function getLetterByCode(code: string): Letter | undefined {
  const letters = getStoredLetters();
  const searchNormalized = normalizeLetterCode(code);
  const cleanCode = code.trim().toLowerCase();
  
  return letters.find((l) => {
    const letterNormalized = normalizeLetterCode(l.code);
    return (
      l.code.toLowerCase() === cleanCode ||
      letterNormalized === searchNormalized ||
      letterNormalized.endsWith(searchNormalized)
    );
  });
}

export function getRepliesForLetter(letterId: string): LetterReply[] {
  const replies = getStoredReplies();
  return replies
    .filter((r) => r.letterId === letterId)
    .sort((a, b) => a.replyIndex - b.replyIndex);
}

export function createLetter(letterData: Omit<Letter, 'id' | 'code' | 'createdAt' | 'likes' | 'replyCount'>): Letter {
  const letters = getStoredLetters();
  const newCode = generateLetterCode(letters.length);
  const newId = `letter-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  const newLetter: Letter = {
    ...letterData,
    id: newId,
    code: newCode,
    createdAt: new Date().toISOString(),
    likes: 0,
    replyCount: 0,
    paperColor: letterData.paperColor || 'cream',
  };

  const updatedLetters = [newLetter, ...letters];
  saveLetters(updatedLetters);

  // Save to authored codes
  saveMyLetterCode(newCode);

  return newLetter;
}

export function createReply(letterId: string, replyData: Omit<LetterReply, 'id' | 'letterId' | 'replyIndex' | 'createdAt' | 'likes'>): LetterReply {
  const existingReplies = getRepliesForLetter(letterId);
  const nextIndex = existingReplies.length + 1;
  const newId = `reply-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const newReply: LetterReply = {
    ...replyData,
    id: newId,
    letterId,
    replyIndex: nextIndex,
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  const allReplies = [...getStoredReplies(), newReply];
  saveReplies(allReplies);

  // Update reply count on parent letter
  const letters = getStoredLetters();
  const updatedLetters = letters.map((l) => {
    if (l.id === letterId) {
      return { ...l, replyCount: l.replyCount + 1 };
    }
    return l;
  });
  saveLetters(updatedLetters);

  return newReply;
}

export function getMyLetterCodes(): string[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MY_CODES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMyLetterCode(code: string): void {
  if (!isBrowser) return;
  const current = getMyLetterCodes();
  if (!current.includes(code)) {
    const updated = [code, ...current];
    localStorage.setItem(STORAGE_KEYS.MY_CODES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('chithi_my_codes_updated'));
  }
}

export function getMyAuthoredLetters(): Letter[] {
  const codes = getMyLetterCodes();
  const letters = getStoredLetters();
  return letters.filter((l) => codes.includes(l.code));
}

export function getLikedLetterIds(): string[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LIKED_LETTERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isLetterLiked(letterId: string): boolean {
  return getLikedLetterIds().includes(letterId);
}

export function toggleLetterLike(letterId: string): { isLiked: boolean; count: number } {
  if (!isBrowser) return { isLiked: false, count: 0 };
  const liked = getLikedLetterIds();
  const isAlreadyLiked = liked.includes(letterId);
  
  let newLiked: string[];
  if (isAlreadyLiked) {
    newLiked = liked.filter((id) => id !== letterId);
  } else {
    newLiked = [...liked, letterId];
  }
  localStorage.setItem(STORAGE_KEYS.LIKED_LETTERS, JSON.stringify(newLiked));

  const letters = getStoredLetters();
  let updatedCount = 0;
  const updatedLetters = letters.map((l) => {
    if (l.id === letterId) {
      const count = isAlreadyLiked ? Math.max(0, l.likes - 1) : l.likes + 1;
      updatedCount = count;
      return { ...l, likes: count };
    }
    return l;
  });
  saveLetters(updatedLetters);

  return { isLiked: !isAlreadyLiked, count: updatedCount };
}

export function getBookmarkedLetterIds(): string[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isLetterBookmarked(letterId: string): boolean {
  return getBookmarkedLetterIds().includes(letterId);
}

export function toggleLetterBookmark(letterId: string): boolean {
  if (!isBrowser) return false;
  const bookmarked = getBookmarkedLetterIds();
  const exists = bookmarked.includes(letterId);
  const updated = exists
    ? bookmarked.filter((id) => id !== letterId)
    : [...bookmarked, letterId];
  
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('chithi_bookmarks_updated'));
  return !exists;
}

export function getBookmarkedLetters(): Letter[] {
  const ids = getBookmarkedLetterIds();
  const letters = getStoredLetters();
  return letters.filter((l) => ids.includes(l.id));
}

export function reportLetter(letterId: string, reason: string): void {
  if (!isBrowser) return;
  const letters = getStoredLetters();
  const updatedLetters = letters.map((l) => {
    if (l.id === letterId) {
      const reasons = l.reportReasons || [];
      return {
        ...l,
        isReported: true,
        reportReasons: [...reasons, reason],
      };
    }
    return l;
  });
  saveLetters(updatedLetters);
}

export function deleteLetter(letterId: string, code: string): boolean {
  const letters = getStoredLetters();
  const letter = letters.find((l) => l.id === letterId);
  if (!letter) return false;

  const letterNormalized = normalizeLetterCode(letter.code);
  const inputNormalized = normalizeLetterCode(code);
  const isMatch =
    letter.code.trim().toLowerCase() === code.trim().toLowerCase() ||
    letterNormalized === inputNormalized;

  if (!isMatch) {
    return false;
  }

  const updatedLetters = letters.filter((l) => l.id !== letterId);
  saveLetters(updatedLetters);

  // Remove from my codes
  if (isBrowser) {
    const myCodes = getMyLetterCodes().filter(
      (c) => normalizeLetterCode(c) !== inputNormalized
    );
    localStorage.setItem(STORAGE_KEYS.MY_CODES, JSON.stringify(myCodes));
    window.dispatchEvent(new CustomEvent('chithi_my_codes_updated'));
  }

  return true;
}

export function filterLetters(
  letters: Letter[],
  category: LetterCategory,
  sort: SortOption,
  searchQuery: string = ''
): Letter[] {
  let result = [...letters];

  // Category filter
  if (category !== 'সব') {
    if (category === 'কাউকে পাঠাতে পারিনি') {
      result = result.filter((l) => l.isUnsent || l.category === 'কাউকে পাঠাতে পারিনি');
    } else {
      result = result.filter((l) => l.category === category);
    }
  }

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(
      (l) =>
        l.recipient.toLowerCase().includes(q) ||
        l.senderName.toLowerCase().includes(q) ||
        l.body.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sort === 'popular') {
    result.sort((a, b) => b.likes - a.likes);
  } else if (sort === 'latest') {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === 'random') {
    result.sort(() => Math.random() - 0.5);
  }

  return result;
}

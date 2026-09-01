'use client';

import { Letter, LetterReply, LetterCategory, SortOption, ReportItem } from '@/types/letter';
import { INITIAL_LETTERS, INITIAL_REPLIES } from './seedData';
import { generateLetterCode, normalizeLetterCode } from './utils';
import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  increment,
} from 'firebase/firestore';

const STORAGE_KEYS = {
  LETTERS: 'chithi_letters_v2',
  REPLIES: 'chithi_replies_v2',
  MY_CODES: 'chithi_my_letter_codes_v2',
  LIKED_LETTERS: 'chithi_liked_letters_v2',
  LIKED_REPLIES: 'chithi_liked_replies_v2',
  BOOKMARKS: 'chithi_bookmarked_letters_v2',
  REPORTS: 'chithi_reported_letters_v2',
};

const isBrowser = typeof window !== 'undefined';

// -------------------------------------------------------------
// LOCAL STORAGE LAYER (Fast initial load & optimistic cache)
// -------------------------------------------------------------

export function getStoredLetters(): Letter[] {
  if (!isBrowser) return INITIAL_LETTERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LETTERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(INITIAL_LETTERS));
      return INITIAL_LETTERS;
    }
    const parsed: Letter[] = JSON.parse(raw);
    return parsed.length > 0 ? parsed : INITIAL_LETTERS;
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

export function getStoredReports(): ReportItem[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReports(reports: ReportItem[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    window.dispatchEvent(new CustomEvent('chithi_reports_updated'));
  } catch (e) {
    console.error('Error saving reports', e);
  }
}

// -------------------------------------------------------------
// HYBRID / FIRESTORE SYNC LAYER
// -------------------------------------------------------------

export async function syncLettersFromCloud(): Promise<Letter[]> {
  if (!db || !isFirebaseConfigured) {
    return getStoredLetters();
  }

  try {
    const lettersRef = collection(db, 'letters');
    const q = query(lettersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const cloudLetters: Letter[] = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Letter),
        id: docSnap.id,
      }));

      const seenIds = new Set(cloudLetters.map((l) => l.id));
      const combined = [...cloudLetters, ...INITIAL_LETTERS.filter((l) => !seenIds.has(l.id))];

      saveLetters(combined);
      return combined;
    }
  } catch (error) {
    console.warn('Could not fetch letters from Firestore, using local cache:', error);
  }

  return getStoredLetters();
}

export async function fetchLetterByIdOrCode(idOrCode: string): Promise<Letter | undefined> {
  const localFound = getLetterById(idOrCode);
  if (localFound) return localFound;

  if (!db || !isFirebaseConfigured || !idOrCode) {
    return undefined;
  }

  let clean = idOrCode;
  try {
    clean = decodeURIComponent(idOrCode).trim();
  } catch {
    clean = idOrCode.trim();
  }

  try {
    const docRef = doc(db, 'letters', clean);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const letter = { ...(docSnap.data() as Letter), id: docSnap.id };
      saveLetters([letter, ...getStoredLetters().filter((l) => l.id !== letter.id)]);
      return letter;
    }

    const lettersRef = collection(db, 'letters');
    const q = query(lettersRef, where('code', '==', clean));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const docData = querySnap.docs[0];
      const letter = { ...(docData.data() as Letter), id: docData.id };
      saveLetters([letter, ...getStoredLetters().filter((l) => l.id !== letter.id)]);
      return letter;
    }
  } catch (error) {
    console.warn('Error fetching letter from Firestore:', error);
  }

  return undefined;
}

export async function syncRepliesForLetter(letterId: string): Promise<LetterReply[]> {
  if (!db || !isFirebaseConfigured || !letterId) {
    return getRepliesForLetter(letterId);
  }

  try {
    const repliesRef = collection(db, 'replies');
    const q = query(repliesRef, where('letterId', '==', letterId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const cloudReplies: LetterReply[] = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as LetterReply),
        id: docSnap.id,
      }));

      const otherReplies = getStoredReplies().filter((r) => r.letterId !== letterId);
      const all = [...otherReplies, ...cloudReplies];
      saveReplies(all);
      return cloudReplies.sort((a, b) => a.replyIndex - b.replyIndex);
    }
  } catch (error) {
    console.warn('Error syncing replies from Firestore:', error);
  }

  return getRepliesForLetter(letterId);
}

// -------------------------------------------------------------
// CORE READ & WRITE FUNCTIONS
// -------------------------------------------------------------

export function getLetterById(idOrCode: string): Letter | undefined {
  if (!idOrCode) return undefined;
  let clean = idOrCode;
  try {
    clean = decodeURIComponent(idOrCode).trim();
  } catch {
    clean = idOrCode.trim();
  }

  const letters = getStoredLetters();
  
  const byId = letters.find(
    (l) => l.id === clean || l.id.toLowerCase() === clean.toLowerCase()
  );
  if (byId) return byId;

  return getLetterByCode(clean);
}

export function getLetterByCode(code: string): Letter | undefined {
  if (!code) return undefined;
  let clean = code;
  try {
    clean = decodeURIComponent(code).trim();
  } catch {
    clean = code.trim();
  }

  const letters = getStoredLetters();
  const searchNormalized = normalizeLetterCode(clean);
  const cleanLower = clean.toLowerCase();
  
  return letters.find((l) => {
    const letterNormalized = normalizeLetterCode(l.code);
    return (
      l.code.toLowerCase() === cleanLower ||
      l.id.toLowerCase() === cleanLower ||
      letterNormalized === searchNormalized ||
      (searchNormalized.length > 0 && letterNormalized.endsWith(searchNormalized))
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
    isHidden: false,
    isReported: false,
  };

  const updatedLetters = [newLetter, ...letters];
  saveLetters(updatedLetters);
  saveMyLetterCode(newCode);

  if (db && isFirebaseConfigured) {
    setDoc(doc(db, 'letters', newId), newLetter).catch((err) => {
      console.error('Failed to save letter to Firestore:', err);
    });
  }

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

  const letters = getStoredLetters();
  const updatedLetters = letters.map((l) => {
    if (l.id === letterId) {
      return { ...l, replyCount: l.replyCount + 1 };
    }
    return l;
  });
  saveLetters(updatedLetters);

  if (db && isFirebaseConfigured) {
    setDoc(doc(db, 'replies', newId), newReply).catch((err) => {
      console.error('Failed to save reply to Firestore:', err);
    });
    updateDoc(doc(db, 'letters', letterId), {
      replyCount: increment(1),
    }).catch(() => {});
  }

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

  if (db && isFirebaseConfigured) {
    updateDoc(doc(db, 'letters', letterId), {
      likes: increment(isAlreadyLiked ? -1 : 1),
    }).catch(() => {});
  }

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

// -------------------------------------------------------------
// REPORTING & MODERATION LAYER
// -------------------------------------------------------------

export function reportLetter(letterId: string, reason: string): void {
  const letters = getStoredLetters();
  const letter = letters.find((l) => l.id === letterId);

  const newReport: ReportItem = {
    id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    letterId,
    letterCode: letter?.code || '',
    recipient: letter?.recipient || '',
    letterBody: letter?.body || '',
    senderName: letter?.senderName || '',
    reason,
    reportedAt: new Date().toISOString(),
    status: 'pending',
  };

  const existingReports = getStoredReports();
  saveReports([newReport, ...existingReports]);

  const updatedLetters = letters.map((l) => {
    if (l.id === letterId) {
      const reasons = l.reportReasons || [];
      const currentCount = l.reportCount || 0;
      return {
        ...l,
        isReported: true,
        reportCount: currentCount + 1,
        reportReasons: [...reasons, reason],
      };
    }
    return l;
  });
  saveLetters(updatedLetters);

  if (db && isFirebaseConfigured) {
    setDoc(doc(db, 'reports', newReport.id), newReport).catch((e) => {
      console.warn('Error saving report to Firestore:', e);
    });
    updateDoc(doc(db, 'letters', letterId), {
      isReported: true,
      reportCount: increment(1),
    }).catch(() => {});
  }
}

export async function fetchReportsFromCloud(): Promise<ReportItem[]> {
  if (!db || !isFirebaseConfigured) {
    return getStoredReports();
  }

  try {
    const reportsRef = collection(db, 'reports');
    const q = query(reportsRef, orderBy('reportedAt', 'desc'));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const cloudReports: ReportItem[] = snap.docs.map((d) => ({
        ...(d.data() as ReportItem),
        id: d.id,
      }));
      saveReports(cloudReports);
      return cloudReports;
    }
  } catch (error) {
    console.warn('Error fetching reports from Firestore:', error);
  }

  return getStoredReports();
}

export async function dismissReport(reportId: string, letterId: string): Promise<void> {
  const reports = getStoredReports().map((r) => {
    if (r.id === reportId) {
      return { ...r, status: 'dismissed' as const };
    }
    return r;
  });
  saveReports(reports);

  if (db && isFirebaseConfigured) {
    updateDoc(doc(db, 'reports', reportId), { status: 'dismissed' }).catch(() => {});
  }
}

export async function toggleHideLetterByAdmin(letterId: string, isHidden: boolean): Promise<void> {
  const letters = getStoredLetters().map((l) => {
    if (l.id === letterId) {
      return { ...l, isHidden };
    }
    return l;
  });
  saveLetters(letters);

  if (db && isFirebaseConfigured) {
    updateDoc(doc(db, 'letters', letterId), { isHidden }).catch(() => {});
  }
}

export async function deleteLetterByAdmin(letterId: string): Promise<void> {
  const letters = getStoredLetters().filter((l) => l.id !== letterId);
  saveLetters(letters);

  const reports = getStoredReports().map((r) => {
    if (r.letterId === letterId) {
      return { ...r, status: 'resolved' as const };
    }
    return r;
  });
  saveReports(reports);

  if (db && isFirebaseConfigured) {
    deleteDoc(doc(db, 'letters', letterId)).catch(() => {});
  }
}

export async function setDailyFeaturedLetter(letterId: string): Promise<void> {
  const letters = getStoredLetters().map((l) => ({
    ...l,
    isDailyFeatured: l.id === letterId,
  }));
  saveLetters(letters);

  if (db && isFirebaseConfigured) {
    const firestore = db;
    const lettersRef = collection(firestore, 'letters');
    const snap = await getDocs(lettersRef);
    snap.docs.forEach((d) => {
      updateDoc(doc(firestore, 'letters', d.id), {
        isDailyFeatured: d.id === letterId,
      }).catch(() => {});
    });
  }
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

  if (isBrowser) {
    const myCodes = getMyLetterCodes().filter(
      (c) => normalizeLetterCode(c) !== inputNormalized
    );
    localStorage.setItem(STORAGE_KEYS.MY_CODES, JSON.stringify(myCodes));
    window.dispatchEvent(new CustomEvent('chithi_my_codes_updated'));
  }

  if (db && isFirebaseConfigured) {
    deleteDoc(doc(db, 'letters', letterId)).catch(() => {});
  }

  return true;
}

export function filterLetters(
  letters: Letter[],
  category: LetterCategory,
  sort: SortOption,
  searchQuery: string = '',
  includeHidden: boolean = false
): Letter[] {
  let result = [...letters];

  // Exclude hidden letters from public feeds unless requested by admin
  if (!includeHidden) {
    result = result.filter((l) => !l.isHidden);
  }

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

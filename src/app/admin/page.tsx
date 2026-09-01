'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  Trash2,
  EyeOff,
  Eye,
  CheckCircle,
  AlertTriangle,
  Star,
  Search,
  RefreshCw,
  Lock,
  ArrowLeft,
  Mail,
  Heart,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Users,
  BarChart3,
  TrendingUp,
  Activity,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { Letter, ReportItem, SiteAnalytics } from '@/types/letter';
import {
  getStoredLetters,
  getStoredReports,
  syncLettersFromCloud,
  fetchReportsFromCloud,
  fetchSiteAnalytics,
  deleteLetterByAdmin,
  toggleHideLetterByAdmin,
  dismissReport,
  setDailyFeaturedLetter,
} from '@/lib/storage';
import { formatBengaliFullDate, formatBengaliRelativeDate, toBengaliNumber } from '@/lib/utils';

const ADMIN_PASSCODE = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || 'Tamal156@@';

export default function AdminPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'reports' | 'all-letters' | 'analytics'>('reports');
  const [letters, setLetters] = useState<Letter[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [analytics, setAnalytics] = useState<SiteAnalytics>({
    totalPageViews: 0,
    totalUniqueVisitors: 0,
    todayPageViews: 0,
    todayUniqueVisitors: 0,
    totalLettersRead: 0,
    dailyStats: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter in letters tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('সব');
  const [filterReportedOnly, setFilterReportedOnly] = useState(false);

  // Action toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    setIsLoading(true);
    setLetters(getStoredLetters());
    setReports(getStoredReports());

    try {
      const [cloudLetters, cloudReports, analyticsData] = await Promise.all([
        syncLettersFromCloud(),
        fetchReportsFromCloud(),
        fetchSiteAnalytics(),
      ]);
      if (cloudLetters) setLetters(cloudLetters);
      if (cloudReports) setReports(cloudReports);
      if (analyticsData) setAnalytics(analyticsData);
    } catch (e) {
      console.warn('Error syncing admin data', e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleDelete = async (letterId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই চিঠিটি পুরোপুরি মুছে ফেলতে চান?')) return;
    await deleteLetterByAdmin(letterId);
    await loadData();
    showToast('চিঠিটি স্থায়ীভাবে মুছে ফেলা হয়েছে।');
  };

  const handleToggleHide = async (letterId: string, currentHidden: boolean) => {
    await toggleHideLetterByAdmin(letterId, !currentHidden);
    await loadData();
    showToast(
      currentHidden
        ? 'চিঠিটি আবার সবার জন্য দৃশ্যমান করা হয়েছে।'
        : 'চিঠিটি পাবলিক ফিড থেকে লুকিয়ে রাখা হয়েছে।'
    );
  };

  const handleDismissReport = async (reportId: string, letterId: string) => {
    await dismissReport(reportId, letterId);
    await loadData();
    showToast('প্রতিবেদনটি খারিজ (Dismiss) করা হয়েছে।');
  };

  const handleSetFeatured = async (letterId: string) => {
    await setDailyFeaturedLetter(letterId);
    await loadData();
    showToast('আজকের নির্বাচিত চিঠি হিসেবে নির্ধারণ করা হয়েছে! ⭐');
  };

  // Stats
  const totalLetters = letters.length;
  const pendingReports = reports.filter((r) => r.status === 'pending');
  const hiddenLettersCount = letters.filter((l) => l.isHidden).length;
  const totalLikes = letters.reduce((sum, l) => sum + (l.likes || 0), 0);

  // Filtered letters list
  const filteredLetters = letters.filter((l) => {
    if (filterReportedOnly && !l.isReported) return false;
    if (selectedCategory !== 'সব' && l.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        l.recipient.toLowerCase().includes(q) ||
        l.senderName.toLowerCase().includes(q) ||
        l.body.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-paper-50 rounded-2xl p-8 border border-paper-300 shadow-paper-lg text-center">
          <div className="w-14 h-14 rounded-2xl bg-crimson-900 text-paper-50 flex items-center justify-center mx-auto mb-4 text-2xl shadow-wax">
            📮
          </div>
          <h1 className="font-serif font-bold text-2xl text-ink-950 mb-1">
            প্রধান ডাকঘর — নিয়ন্ত্রণকক্ষ
          </h1>
          <p className="text-xs text-ink-600 font-sans mb-6">
            মডারেশন, চিঠি ও ভিজিটর পর্যবেক্ষণ করতে অ্যাডমিন পাসকোড প্রবেশ করান
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="অ্যাডমিন পাসকোড লিখুন..."
                className="w-full text-center tracking-widest text-sm p-3 rounded-xl bg-white border border-paper-300 text-ink-900 focus:outline-none focus:ring-2 focus:ring-crimson-800 focus:border-crimson-800"
              />
            </div>

            {authError && (
              <p className="text-xs text-crimson-800 font-semibold animate-pulse">
                পাসকোডটি সঠিক নয়। পুনরায় সঠিক পাসকোড দিয়ে চেষ্টা করুন।
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-crimson-800 hover:bg-crimson-900 text-white font-serif font-bold text-sm shadow-paper transition-all"
            >
              প্রবেশ করুন 🗝️
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-paper-200 text-xs text-ink-500">
            <Link href="/" className="hover:text-crimson-800 flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>হোমপেজে ফিরে যান</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-ink-900 text-white px-5 py-3 rounded-xl shadow-paper-float text-xs font-medium flex items-center gap-2 animate-fadeIn border border-paper-700">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-paper-300 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📮</span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink-950">
              প্রধান ডাকঘর — নিয়ন্ত্রণকক্ষ
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-ink-600 font-sans">
            রিয়েল-টাইম ভিজিটর ট্র্যাকিং, চিঠি পর্যবেক্ষণ ও নিরাপত্তা মডারেশন
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-paper-300 text-ink-800 hover:text-crimson-800 text-xs font-semibold shadow-paper-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ ডেটা</span>
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 rounded-full bg-paper-200 hover:bg-paper-300 text-ink-700 text-xs font-semibold transition-colors"
          >
            লগআউট
          </button>
        </div>
      </div>

      {/* Live Visitor Analytics Cards (Featured Top) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif font-bold text-base text-ink-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-crimson-800" />
            <span>লাইভ ভিজিটর ও রিডার অ্যানালিটিক্স</span>
          </h2>
          <span className="text-[11px] text-ink-500 font-sans">
            ক্লাউড ডেটাবেজে স্বয়ংক্রিয়ভাবে সংরক্ষিত
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-crimson-900 to-crimson-950 text-white shadow-paper">
            <div className="flex items-center justify-between text-xs text-crimson-200 font-sans mb-2">
              <span>মোট ইউনিক ভিজিটর</span>
              <Users className="w-4 h-4 text-crimson-300" />
            </div>
            <div className="font-serif font-bold text-3xl text-white">
              {toBengaliNumber(analytics.totalUniqueVisitors || 0)}
            </div>
            <div className="text-[11px] text-crimson-200/80 mt-1">
              আজকের ভিজিটর: {toBengaliNumber(analytics.todayUniqueVisitors || 0)} জন
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-paper-300 shadow-paper-sm">
            <div className="flex items-center justify-between text-xs text-ink-500 font-sans mb-2">
              <span>মোট পেইজ ভিউ</span>
              <Eye className="w-4 h-4 text-ink-400" />
            </div>
            <div className="font-serif font-bold text-3xl text-ink-950">
              {toBengaliNumber(analytics.totalPageViews || 0)}
            </div>
            <div className="text-[11px] text-ink-600 mt-1">
              আজকের ভিউ: {toBengaliNumber(analytics.todayPageViews || 0)} বার
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-paper-300 shadow-paper-sm">
            <div className="flex items-center justify-between text-xs text-ink-500 font-sans mb-2">
              <span>চিঠি পড়ার সংখ্যা (Letter Reads)</span>
              <BookOpen className="w-4 h-4 text-amber-600" />
            </div>
            <div className="font-serif font-bold text-3xl text-amber-900">
              {toBengaliNumber(analytics.totalLettersRead || 0)}
            </div>
            <div className="text-[11px] text-ink-500 mt-1">
              সরাসরি খাম খুলে পড়া
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-paper-300 shadow-paper-sm">
            <div className="flex items-center justify-between text-xs text-ink-500 font-sans mb-2">
              <span>মোট চিঠি ও ভালোবাসা</span>
              <Heart className="w-4 h-4 text-crimson-700 fill-crimson-700" />
            </div>
            <div className="font-serif font-bold text-3xl text-crimson-900">
              {toBengaliNumber(totalLetters)}
            </div>
            <div className="text-[11px] text-ink-600 mt-1">
              {toBengaliNumber(totalLikes)} টি মোট লাইক
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-paper-300 mb-6">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-4 font-serif font-bold text-sm sm:text-base border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-crimson-800 text-crimson-900'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>চিঠির প্রতিবেদনসমূহ ({toBengaliNumber(pendingReports.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('all-letters')}
          className={`pb-3 px-4 font-serif font-bold text-sm sm:text-base border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'all-letters'
              ? 'border-crimson-800 text-crimson-900'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>সব চিঠি পরিচালনা ({toBengaliNumber(letters.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-4 font-serif font-bold text-sm sm:text-base border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-crimson-800 text-crimson-900'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>৭ দিনের ভিজিটর ট্রেন্ড</span>
        </button>
      </div>

      {/* TAB 1: Reports Moderation */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {pendingReports.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-white border border-paper-200 shadow-paper-sm max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-ink-900 mb-1">
                কোনো অনিষ্পন্ন প্রতিবেদন নেই!
              </h3>
              <p className="text-xs text-ink-500 font-sans">
                প্ল্যাটফর্মের সব চিঠি নিরাপদ ও পরিচ্ছন্ন রয়েছে।
              </p>
            </div>
          ) : (
            pendingReports.map((report) => {
              const matchedLetter = letters.find((l) => l.id === report.letterId);
              return (
                <div
                  key={report.id}
                  className="rounded-2xl p-6 bg-white border border-crimson-200 shadow-paper-sm flex flex-col lg:flex-row lg:items-start justify-between gap-6"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                      <span className="font-bold text-crimson-900 bg-crimson-100 px-2.5 py-0.5 rounded-md">
                        কারণ: {report.reason}
                      </span>
                      {report.letterCode && (
                        <span className="font-mono text-ink-500 bg-paper-200 px-2 py-0.5 rounded">
                          {report.letterCode}
                        </span>
                      )}
                      <span className="text-ink-400">
                        {formatBengaliRelativeDate(report.reportedAt)}
                      </span>
                    </div>

                    <div className="font-serif text-ink-900 mb-2">
                      <span className="text-xs font-semibold text-ink-500 uppercase">
                        প্রাপক:{' '}
                      </span>
                      <strong className="text-base">
                        {report.recipient || matchedLetter?.recipient || 'অজ্ঞাত'}
                      </strong>
                      <span className="text-xs text-ink-400 ml-2">
                        (প্রেরক: {report.senderName || matchedLetter?.senderName || 'অজ্ঞাত'})
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-paper-50 border border-paper-200 font-sans text-xs sm:text-sm text-ink-800 whitespace-pre-line leading-relaxed mb-3">
                      {matchedLetter?.body || report.letterBody || 'চিঠিটির বিষয়বস্তু পাওয়া যায়নি।'}
                    </div>

                    {matchedLetter?.isHidden && (
                      <div className="inline-flex items-center gap-1 text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                        <EyeOff className="w-3 h-3" />
                        <span>বর্তমানে ফিড থেকে লুকানো রয়েছে</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col items-center lg:items-stretch gap-2 lg:w-48 shrink-0">
                    <Link
                      href={`/letters/${report.letterId}`}
                      target="_blank"
                      className="flex-1 lg:flex-none py-2 px-3 rounded-lg bg-paper-100 hover:bg-paper-200 text-ink-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>চিঠিটি দেখুন</span>
                    </Link>

                    {matchedLetter && (
                      <button
                        onClick={() =>
                          handleToggleHide(matchedLetter.id, Boolean(matchedLetter.isHidden))
                        }
                        className={`flex-1 lg:flex-none py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                          matchedLetter.isHidden
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                            : 'bg-paper-200 hover:bg-paper-300 text-ink-800'
                        }`}
                      >
                        {matchedLetter.isHidden ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {matchedLetter.isHidden ? 'লুকানো খুলুন' : 'ফিড থেকে লুকান'}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(report.letterId)}
                      className="flex-1 lg:flex-none py-2 px-3 rounded-lg bg-crimson-50 hover:bg-crimson-100 text-crimson-800 text-xs font-semibold flex items-center justify-center gap-1.5 border border-crimson-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-crimson-700" />
                      <span>চিঠি মুছে ফেলুন</span>
                    </button>

                    <button
                      onClick={() => handleDismissReport(report.id, report.letterId)}
                      className="flex-1 lg:flex-none py-2 px-3 rounded-lg bg-green-50 hover:bg-green-100 text-green-800 text-xs font-medium flex items-center justify-center gap-1.5 border border-green-200 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-green-700" />
                      <span>খারিজ করুন</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: All Letters Manager */}
      {activeTab === 'all-letters' && (
        <div>
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-paper-200 shadow-paper-sm mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রাপক, প্রেরক, কোড বা চিঠি খুঁজুন..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-paper-50 border border-paper-300 text-ink-900 focus:outline-none focus:ring-1 focus:ring-crimson-800"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-ink-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterReportedOnly}
                  onChange={(e) => setFilterReportedOnly(e.target.checked)}
                  className="accent-crimson-800"
                />
                <span>
                  শুধু রিপোর্ট করা (
                  {toBengaliNumber(letters.filter((l) => l.isReported).length)})
                </span>
              </label>

              <span className="text-xs text-ink-500">
                মোট: {toBengaliNumber(filteredLetters.length)} টি
              </span>
            </div>
          </div>

          {/* Letters Table / Cards */}
          <div className="space-y-3">
            {filteredLetters.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-paper-200 text-xs text-ink-500">
                কোনো চিঠি খুঁজে পাওয়া যায়নি।
              </div>
            ) : (
              filteredLetters.map((l) => (
                <div
                  key={l.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    l.isReported
                      ? 'bg-crimson-50/40 border-crimson-200'
                      : l.isHidden
                      ? 'bg-paper-100/60 border-paper-300 opacity-75'
                      : 'bg-white border-paper-200 shadow-paper-sm'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-crimson-900 bg-paper-100 px-2 py-0.5 rounded">
                        {l.code}
                      </span>
                      <span className="text-xs text-ink-500 font-serif font-semibold">
                        {l.category}
                      </span>
                      {l.isDailyFeatured && (
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-600 text-amber-600" />
                          <span>নির্বাচিত চিঠি</span>
                        </span>
                      )}
                      {l.isReported && (
                        <span className="text-[11px] font-semibold text-crimson-800 bg-crimson-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>রিপোর্ট করা</span>
                        </span>
                      )}
                      {l.isHidden && (
                        <span className="text-[11px] font-semibold text-ink-600 bg-paper-300 px-2 py-0.5 rounded flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          <span>লুকানো</span>
                        </span>
                      )}
                    </div>

                    <div className="font-serif text-sm text-ink-950 mb-1">
                      প্রাপক: <strong>{l.recipient}</strong> | প্রেরক: <em>{l.senderName}</em>
                    </div>

                    <p className="text-xs text-ink-600 font-sans line-clamp-2">{l.body}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleSetFeatured(l.id)}
                      title="আজকের নির্বাচিত চিঠি বানাবেন"
                      className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                        l.isDailyFeatured
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-paper-100 hover:bg-amber-50 text-ink-600 hover:text-amber-800'
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          l.isDailyFeatured ? 'fill-amber-600 text-amber-600' : ''
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => handleToggleHide(l.id, Boolean(l.isHidden))}
                      title={l.isHidden ? 'ফিডে উন্মুক্ত করুন' : 'ফিড থেকে লুকান'}
                      className="p-2 rounded-lg bg-paper-100 hover:bg-paper-200 text-ink-700 text-xs transition-colors"
                    >
                      {l.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <Link
                      href={`/letters/${l.id}`}
                      target="_blank"
                      title="চিঠিটি দেখুন"
                      className="p-2 rounded-lg bg-paper-100 hover:bg-paper-200 text-ink-700 text-xs transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDelete(l.id)}
                      title="চিঠি মুছে ফেলুন"
                      className="p-2 rounded-lg bg-crimson-50 hover:bg-crimson-100 text-crimson-800 text-xs transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Analytics & Visitor Trend */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-paper-300 shadow-paper-sm">
            <h3 className="font-serif font-bold text-lg text-ink-950 mb-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-crimson-800" />
              <span>বিগত ৭ দিনের ভিজিটর ইতিহাস</span>
            </h3>
            <p className="text-xs text-ink-500 font-sans mb-6">
              প্রতিদিনের ইউনিক ভিজিটর ও পেইজ ভিউ পরিসংখ্যান
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
              {analytics.dailyStats && analytics.dailyStats.length > 0 ? (
                analytics.dailyStats.map((d, i) => (
                  <div
                    key={d.date}
                    className="p-4 rounded-xl bg-paper-50 border border-paper-200 text-center flex flex-col justify-between"
                  >
                    <div className="text-[11px] font-mono text-ink-500 font-semibold mb-2">
                      {d.date.slice(5)} {/* MM-DD */}
                    </div>
                    <div className="my-2">
                      <div className="font-serif font-bold text-xl text-crimson-900">
                        {toBengaliNumber(d.visitors)}
                      </div>
                      <div className="text-[10px] text-ink-500 uppercase tracking-wider">
                        ভিজিটর
                      </div>
                    </div>
                    <div className="text-xs text-ink-700 border-t border-paper-200 pt-2 font-sans">
                      {toBengaliNumber(d.views)} ভিউ
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-7 text-center py-8 text-xs text-ink-500">
                  এখনো কোনো ঐতিহাসিক ডেটা সংরক্ষিত হয়নি। ওয়েবসাইট ভিজিট করার সাথে সাথে এটি পূরণ হবে।
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

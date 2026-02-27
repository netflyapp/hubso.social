'use client';

export const dynamic = 'force-dynamic'

import { Icon } from '@iconify/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { postsApi, communitiesApi, type PostItem, type CommunityItem } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { PostCard } from '@/components/feed/PostCard';

const PLACEHOLDER_AVATAR =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80';

const MAX_POST_LENGTH = 500;

export default function ChannelPage() {
  const { setTheme, theme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Auth
  const user = useAuthStore((s) => s.user);
  const authorAvatar = user?.avatarUrl ?? PLACEHOLDER_AVATAR;
  const authorDisplayName = user?.displayName ?? user?.username ?? 'Ty';

  // Composer state
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityItem | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Load communities when composer opens for the first time
  useEffect(() => {
    if (!composerOpen || communities.length > 0) return;
    communitiesApi.list().then((list) => {
      setCommunities(list);
      if (!selectedCommunity && list.length > 0) setSelectedCommunity(list[0] ?? null);
    }).catch(() => {});
  }, [composerOpen, communities.length, selectedCommunity]);

  function openComposer() {
    setComposerOpen(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function closeComposer() {
    setComposerOpen(false);
    setComposerText('');
  }

  // Feed state
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postsApi
      .feed()
      .then((res) => setPosts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Pinned post local like (demo only)
  const [pinnedLiked, setPinnedLiked] = useState(false);

  async function submitPost() {
    if (!composerText.trim() || submitting) return;
    const slug = selectedCommunity?.slug ?? posts[0]?.communitySlug ?? 'programisci-indie';
    setSubmitting(true);
    try {
      const created = await postsApi.create(slug, { content: composerText.trim(), type: 'TEXT' });
      setPosts((prev) => [created, ...prev]);
      toast.success(`Post opublikowany w „${created.communityName ?? slug}"!`);
      closeComposer();
    } catch {
      toast.error('Nie udało się opublikować posta. Spróbuj ponownie.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* LEFT COLUMN - Articles + Following (lg only) */}
        <div className="hidden lg:block col-span-3 space-y-6">
          {/* Blog / Articles */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-5 transition-colors">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Artykuły
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: 'Jak stworzyć skuteczny onboarding dla nowych członków',
                  time: '3 godz. temu',
                  img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=80&h=60&fit=crop',
                },
                {
                  title: '5 sposobów na budowanie zaangażowania',
                  time: 'wczoraj',
                  img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=80&h=60&fit=crop',
                },
                {
                  title: 'Monetyzacja społeczności — kompletny przewodnik',
                  time: '2 dni temu',
                  img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=80&h=60&fit=crop',
                },
                {
                  title: 'Najlepsze narzędzia dla community builderów w 2026',
                  time: '3 dni temu',
                  img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&h=60&fit=crop',
                },
              ].map((article, i) => (
                <a key={i} href="#" className="flex gap-3 group">
                  <img
                    src={article.img}
                    alt=""
                    className="w-14 h-10 rounded-md object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                    <span className="text-[10px] text-slate-400">{article.time}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Following */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-5 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Obserwujesz
              </h3>
              <span className="text-[10px] text-slate-400">16 osób</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(8)].map((_, i) => (
                <a key={i} href="#" className="group text-center">
                  <div className="w-10 h-10 rounded-full mx-auto bg-slate-200 dark:bg-slate-700 group-hover:ring-2 ring-indigo-400 transition-all" />
                  <span className="text-[9px] text-slate-400 mt-0.5 block truncate">Członek</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="col-span-12 lg:col-span-6 space-y-5">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-5 shadow-lg">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/3"></div>
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Witamy!
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">Witaj w społeczności!</h2>
              <p className="text-indigo-100/80 text-xs mt-1 max-w-md">
                Tutaj znajdziesz kursy, dyskusje, wydarzenia i mnóstwo inspiracji. Zacznij od
                przedstawienia się na forum!
              </p>
              <a
                href="/forums"
                className="inline-flex items-center gap-2 mt-3 h-8 px-4 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition-colors backdrop-blur-sm"
              >
                <Icon icon="solar:arrow-right-bold" width={14} height={14} />
                Przedstaw się
              </a>
            </div>
          </div>

          {/* Feed Heading */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Kanał aktywności
            </h2>
          </div>

          {/* Composer */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-4 transition-colors">
            <div className="flex items-start gap-3">
              <img
                src={authorAvatar}
                alt={authorDisplayName}
                className="w-9 h-9 rounded-full shrink-0 object-cover"
              />
              <div className="flex-1">
                {!composerOpen ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={openComposer}
                    onKeyDown={(e) => { if (e.key === 'Enter') openComposer(); }}
                    className="bg-gray-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-text hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors select-none"
                  >
                    O czym myślisz, {authorDisplayName}?
                  </div>
                ) : (
                  <div>
                    {/* Community selector — shows when multiple communities loaded */}
                    {communities.length > 1 && (
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[11px] text-slate-400 shrink-0">Gdzie:</span>
                        {communities.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setSelectedCommunity(c)}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-colors ${
                              selectedCommunity?.id === c.id
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'text-slate-500 dark:text-slate-400 border-gray-200 dark:border-dark-border hover:border-indigo-300 dark:hover:border-indigo-500/50'
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <textarea
                      ref={textareaRef}
                      value={composerText}
                      maxLength={MAX_POST_LENGTH}
                      onChange={(e) => {
                        setComposerText(e.target.value);
                        autoResize();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') { closeComposer(); return; }
                        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                          e.preventDefault();
                          submitPost();
                        }
                      }}
                      placeholder="O czym myślisz?"
                      rows={3}
                      className="w-full bg-gray-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none overflow-hidden transition-colors"
                      style={{ minHeight: '80px' }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[11px] transition-colors ${
                        composerText.length >= MAX_POST_LENGTH
                          ? 'text-red-500 font-semibold'
                          : composerText.length > MAX_POST_LENGTH * 0.8
                          ? 'text-amber-500'
                          : 'text-slate-400'
                      }`}>
                        {composerText.length}/{MAX_POST_LENGTH}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="hidden sm:inline text-[10px] text-slate-300 dark:text-slate-600">
                          ⌘↵ aby wysłać
                        </span>
                        <button
                          onClick={closeComposer}
                          className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                          Anuluj
                        </button>
                        <button
                          onClick={submitPost}
                          disabled={!composerText.trim() || submitting || composerText.length > MAX_POST_LENGTH}
                          className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          {submitting ? 'Wysyłanie…' : 'Opublikuj'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-1 mt-3">
                  <button
                    onClick={openComposer}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <Icon icon="solar:gallery-linear" width={16} height={16} className="text-emerald-500" />
                    Zdjęcie
                  </button>
                  <button
                    onClick={openComposer}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <Icon icon="solar:videocamera-linear" width={16} height={16} className="text-blue-500" />
                    Video
                  </button>
                  <button
                    onClick={openComposer}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <Icon icon="solar:link-round-linear" width={16} height={16} className="text-orange-500" />
                    Link
                  </button>
                  <button
                    onClick={openComposer}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <Icon icon="solar:chart-2-linear" width={16} height={16} className="text-purple-500" />
                    Ankieta
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {['Wszystko', 'Ogłoszenie', 'Dyskusja', 'Zdjęcia'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter.toLowerCase())}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                  selectedFilter === filter.toLowerCase() || (selectedFilter === 'all' && filter === 'Wszystko')
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-dark-border hover:border-indigo-300 dark:hover:border-indigo-500/50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Pinned Post */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-indigo-200 dark:border-indigo-500/30 p-4 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Icon icon="solar:pin-bold" width={12} height={12} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                Przypięty post
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Icon icon="solar:users-group-rounded-bold" width={18} height={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Zespół społeczności
                  </span>
                  <span className="text-[10px] text-slate-400">· 1 dzień temu</span>
                </div>
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  <p>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Witamy wszystkich nowych członków!
                    </span>{' '}
                    Przeczytaj
                    <a href="#" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                      regulamin społeczności
                    </a>{' '}
                    i przedstaw się w sekcji
                    <a href="/forums" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                      Dyskusje
                    </a>
                    .
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                  <button
                    onClick={() => setPinnedLiked((v) => !v)}
                    className={`flex items-center gap-1 transition-colors ${pinnedLiked ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                  >
                    <Icon icon={pinnedLiked ? 'solar:like-bold' : 'solar:like-linear'} width={16} height={16} />
                    {24 + (pinnedLiked ? 1 : 0)}
                  </button>
                  <button className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <Icon icon="solar:chat-round-dots-linear" width={16} height={16} />
                    8
                  </button>
                  <button className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <Icon icon="solar:share-linear" width={16} height={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          {loading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-4 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Icon icon="solar:chat-round-dots-linear" width={40} height={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Brak postów. Bądź pierwszym który coś napisze!</p>
            </div>
          )}

          {!loading && posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
            />
          ))}
        </div>

        {/* RIGHT COLUMN - Stats + Activity (lg only) */}
        <div className="hidden lg:block col-span-3 space-y-6">
          {/* Profile Completion */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-5 transition-colors">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Uzupełnij profil
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3"></path>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4262F0" strokeWidth="3" strokeDasharray="73, 100" strokeLinecap="round"></path>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-800 dark:text-white">
                  73%
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Prawie gotowe!
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Dodaj zdjęcie i bio</div>
              </div>
            </div>
          </div>

          {/* Latest Activity */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-5 transition-colors">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Ostatnia aktywność
            </h3>
            <div className="space-y-4">
              {[
                { icon: 'solar:user-plus-bold', text: 'Piotr M. dołączył do grupy „Technologia i AI"', time: '15 min temu', color: 'text-indigo-500' },
                { icon: 'solar:diploma-bold', text: 'Kasia L. ukończyła kurs „Produktywność"', time: '1 godz. temu', color: 'text-emerald-500' },
                { icon: 'solar:calendar-bold', text: 'Community Summit 2026 — już 156 zapisanych!', time: '2 godz. temu', color: 'text-purple-500' },
                { icon: 'solar:chat-round-dots-bold', text: 'Anna N. nowy wątek w „Ogólne dyskusje"', time: '3 godz. temu', color: 'text-sky-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Icon icon={item.icon} width={16} height={16} className={`${item.color} mt-0.5 shrink-0`} />
                  <div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">{item.text}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Challenge */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-xl p-5 border border-amber-200 dark:border-amber-500/20 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Icon icon="solar:fire-bold" width={18} height={18} className="text-orange-500" />
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Wyzwanie tygodnia
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Napisz 3 posty w tym tygodniu
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Dziel się wiedzą i inspiruj innych. Nagroda: badge „Aktywny twórca"!
            </p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Twój postęp</span>
                <span>1/3</span>
              </div>
              <div className="w-full bg-white/60 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full" style={{ width: '33%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

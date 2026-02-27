'use client';

import { useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi, communitiesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { TiptapEditor } from '@/components/editor/TiptapEditor';

const PLACEHOLDER_AVATAR =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80';

interface PostComposerProps {
  fixedCommunitySlug?: string
}

export function PostComposer({ fixedCommunitySlug }: PostComposerProps = {}) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState(fixedCommunitySlug ?? '');

  // Fetch communities list for the selector
  const { data: communities } = useQuery({
    queryKey: ['communities'],
    queryFn: () => communitiesApi.list(),
    staleTime: 1000 * 60 * 5,
  });

  // Create post mutation
  const createPost = useMutation({
    mutationFn: async () => {
      if (!selectedCommunity) throw new Error('Wybierz społeczność');
      if (!content) throw new Error('Treść posta nie może być pusta');

      return postsApi.create(selectedCommunity, {
        content,
        type: 'TEXT',
      });
    },
    onSuccess: () => {
      toast.success('Post opublikowany!');
      setContent(null);
      setIsOpen(false);
      // Refresh feed
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Nie udało się opublikować posta.');
    },
  });

  const handleContentChange = useCallback((json: Record<string, unknown>) => {
    setContent(json);
  }, []);

  const isContentEmpty = !content || JSON.stringify(content) === '{"type":"doc","content":[{"type":"paragraph"}]}';

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border transition-colors overflow-hidden">
      {/* Collapsed state — click to expand */}
      {!isOpen && (
        <div className="p-4">
          <div className="flex items-start gap-3">
            <img
              src={user.avatarUrl ?? PLACEHOLDER_AVATAR}
              alt=""
              className="w-10 h-10 rounded-full shrink-0 object-cover"
            />
            <button
              onClick={() => setIsOpen(true)}
              className="flex-1 text-left bg-gray-50 dark:bg-slate-800/50 rounded-xl px-4 py-3.5 text-sm text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              O czym myślisz, {user.displayName?.split(' ')[0] ?? user.username}?
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3 ml-[52px]">
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <Icon icon="solar:gallery-linear" width={16} height={16} className="text-emerald-500" />
              Zdjęcie
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <Icon icon="solar:videocamera-linear" width={16} height={16} className="text-blue-500" />
              Video
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <Icon icon="solar:link-round-linear" width={16} height={16} className="text-orange-500" />
              Link
            </button>
          </div>
        </div>
      )}

      {/* Expanded state — full composer with Tiptap */}
      {isOpen && (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl ?? PLACEHOLDER_AVATAR}
                alt=""
                className="w-9 h-9 rounded-full shrink-0 object-cover"
              />
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {user.displayName ?? user.username}
                </span>
                {/* Community selector */}
                {!fixedCommunitySlug && (
                <div className="mt-0.5">
                  <select
                    value={selectedCommunity}
                    onChange={(e) => setSelectedCommunity(e.target.value)}
                    className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-0 rounded-full px-2 py-0.5 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="">Wybierz społeczność…</option>
                    {communities?.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <Icon icon="solar:close-circle-linear" width={20} height={20} />
            </button>
          </div>

          {/* Tiptap Editor */}
          <div className="px-4 py-2">
            <TiptapEditor
              onChange={handleContentChange}
              placeholder={`O czym myślisz, ${user.displayName?.split(' ')[0] ?? user.username}?`}
              autoFocus
              minHeight="min-h-[100px]"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-700/50">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-emerald-500 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                title="Dodaj zdjęcie"
              >
                <Icon icon="solar:gallery-linear" width={18} height={18} />
              </button>
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-blue-500 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                title="Dodaj video"
              >
                <Icon icon="solar:videocamera-linear" width={18} height={18} />
              </button>
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-orange-500 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                title="Dodaj link"
              >
                <Icon icon="solar:link-round-linear" width={18} height={18} />
              </button>
            </div>

            <button
              onClick={() => createPost.mutate()}
              disabled={createPost.isPending || isContentEmpty || !selectedCommunity}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
            >
              {createPost.isPending && (
                <Icon icon="solar:refresh-linear" width={16} height={16} className="animate-spin" />
              )}
              Publikuj
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostComposer;

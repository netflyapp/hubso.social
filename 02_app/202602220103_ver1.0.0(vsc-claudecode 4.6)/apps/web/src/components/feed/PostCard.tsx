'use client';

import { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { commentsApi, reactionsApi, type CommentItem, type ReactionType } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import type { PostItem } from '@/lib/api';
import { TiptapRenderer } from '@/components/editor/TiptapEditor';

const PLACEHOLDER_AVATAR =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80';

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'LIKE', emoji: '👍', label: 'Lubię to' },
  { type: 'LOVE', emoji: '❤️', label: 'Uwielbiam' },
  { type: 'WOW', emoji: '😮', label: 'Wow' },
  { type: 'FIRE', emoji: '🔥', label: 'Ogiń' },
  { type: 'SAD', emoji: '😢', label: 'Smutne' },
  { type: 'ANGRY', emoji: '😡', label: 'Złość' },
];

const REACTION_EMOJI: Record<string, string> = Object.fromEntries(
  REACTIONS.map((r) => [r.type, r.emoji]),
);

function getContentText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (content && typeof content === 'object') {
    const obj = content as Record<string, unknown>;
    if (Array.isArray(obj.content)) {
      return (obj.content as Array<{ content?: Array<{ text?: string }> }>)
        .flatMap((n) => n.content ?? [])
        .map((n) => n.text ?? '')
        .join('');
    }
  }
  return '';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'przed chwilą';
  if (m < 60) return `${m} min temu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} godz. temu`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} dni temu`;
  return new Date(dateStr).toLocaleDateString('pl');
}

interface PostCardProps {
  post: PostItem;
}

export function PostCard({ post }: PostCardProps) {
  const user = useAuthStore((s) => s.user);

  // Reactions state
  const [localReactions, setLocalReactions] = useState<Record<string, number>>(
    (post.reactionsCount as Record<string, number>) ?? {},
  );
  const [localUserReaction, setLocalUserReaction] = useState<string | null>(post.userReaction ?? null);
  const [reactionLoading, setReactionLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Comments state
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.commentsCount);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const postAuthorName = post.author.displayName ?? post.author.username;
  const postAuthorAvatar = post.author.avatarUrl ?? PLACEHOLDER_AVATAR;
  const contentText = getContentText(post.content);
  const totalReactions = Object.values(localReactions).reduce((a, b) => a + b, 0);

  async function handleReact(type: ReactionType) {
    if (!user) { toast.error('Musisz być zalogowany, aby reagować.'); return; }
    if (reactionLoading) return;
    const prevReactions = { ...localReactions };
    const prevUserReaction = localUserReaction;
    const next = { ...localReactions };
    if (localUserReaction && localUserReaction !== type) {
      next[localUserReaction] = Math.max(0, (next[localUserReaction] ?? 0) - 1);
      if (next[localUserReaction] === 0) delete next[localUserReaction];
    }
    if (localUserReaction === type) {
      next[type] = Math.max(0, (next[type] ?? 0) - 1);
      if (next[type] === 0) delete next[type];
      setLocalUserReaction(null);
    } else {
      next[type] = (next[type] ?? 0) + 1;
      setLocalUserReaction(type);
    }
    setLocalReactions(next);
    setReactionLoading(true);
    try {
      const result = await reactionsApi.toggle({ targetType: 'Post', targetId: post.id, type });
      setLocalReactions(result.reactions);
      setLocalUserReaction(result.userReaction);
    } catch {
      setLocalReactions(prevReactions);
      setLocalUserReaction(prevUserReaction);
      toast.error('Nie udało się dodać reakcji.');
    } finally {
      setReactionLoading(false);
    }
  }

  async function openComments() {
    if (commentsOpen) {
      setCommentsOpen(false);
      return;
    }
    setCommentsOpen(true);
    if (comments.length > 0) return;
    setCommentsLoading(true);
    try {
      const list = await commentsApi.list(post.id);
      setComments(list);
    } catch {
      toast.error('Nie udało się wczytać komentarzy.');
    } finally {
      setCommentsLoading(false);
    }
  }

  async function submitComment() {
    if (!commentInput.trim() || submitting) return;
    if (!user) { toast.error('Musisz być zalogowany, aby skomentować.'); return; }
    setSubmitting(true);
    try {
      const payload: { content: string; parentId?: string } = { content: commentInput.trim() };
      if (replyingTo) payload.parentId = replyingTo.id;
      const created = await commentsApi.create(post.id, payload);
      if (replyingTo) {
        // Insert as reply inside parent comment
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyingTo.id
              ? { ...c, replies: [...(c.replies ?? []), created], repliesCount: c.repliesCount + 1 }
              : c
          )
        );
      } else {
        setComments((prev) => [...prev, created]);
      }
      setLocalCommentsCount((n) => n + 1);
      setCommentInput('');
      setReplyingTo(null);
    } catch {
      toast.error('Nie udało się dodać komentarza.');
    } finally {
      setSubmitting(false);
    }
  }

  function startReply(commentId: string, authorName: string) {
    setReplyingTo({ id: commentId, name: authorName });
    commentInputRef.current?.focus();
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border transition-colors overflow-hidden">
      {/* Post body */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <img src={postAuthorAvatar} alt={postAuthorName} className="w-9 h-9 rounded-full shrink-0 object-cover" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {postAuthorName}
              </span>
              <span className="text-[10px] text-slate-400">· {timeAgo(post.createdAt)}</span>
              {post.communityName && (
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium">
                  {post.communityName}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
              <TiptapRenderer content={post.content} />
            </p>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-1 px-4 pb-3 text-xs text-slate-400">
        {/* Reaction button + hover picker */}
        <div className="relative group/reactions">
          <button
            onClick={() => handleReact('LIKE')}
            disabled={reactionLoading}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
              localUserReaction
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                : 'hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            {localUserReaction ? (
              <span className="text-base leading-none select-none">{REACTION_EMOJI[localUserReaction]}</span>
            ) : (
              <Icon icon="solar:like-linear" width={15} height={15} />
            )}
            {totalReactions > 0 && <span>{totalReactions}</span>}
          </button>
          {/* Hover picker popup */}
          <div className="absolute bottom-full left-0 mb-2 opacity-0 invisible group-hover/reactions:opacity-100 group-hover/reactions:visible transition-all duration-150 z-20 pointer-events-none group-hover/reactions:pointer-events-auto">
            <div className="flex gap-0.5 bg-white dark:bg-slate-800 rounded-full shadow-xl border border-gray-100 dark:border-slate-700 px-2.5 py-2">
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  onClick={(e) => { e.stopPropagation(); handleReact(r.type); }}
                  title={r.label}
                  className={`text-xl leading-none px-1 py-0.5 rounded-full transition-transform hover:scale-125 hover:bg-gray-100 dark:hover:bg-slate-700 ${
                    localUserReaction === r.type ? 'scale-125 bg-indigo-50 dark:bg-indigo-500/10' : ''
                  }`}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={openComments}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${commentsOpen ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
        >
          <Icon icon={commentsOpen ? 'solar:chat-round-dots-bold' : 'solar:chat-round-dots-linear'} width={15} height={15} />
          <span>{localCommentsCount > 0 ? localCommentsCount : 'Komentuj'}</span>
        </button>
        <button
          onClick={() => { navigator.clipboard.writeText(window.location.origin + '/post/' + post.id); toast.success('Link skopiowany do schowka'); }}
          aria-label="Udostępnij"
          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <Icon icon="solar:share-linear" width={15} height={15} />
        </button>
        <button
          onClick={() => setBookmarked((b) => !b)}
          aria-label={bookmarked ? 'Usuń z zapisanych' : 'Zapisz'}
          className={`ml-auto flex items-center px-2 py-1 rounded-md transition-colors ${
            bookmarked
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
              : 'hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-white/5'
          }`}
        >
          <Icon icon={bookmarked ? 'solar:bookmark-bold' : 'solar:bookmark-linear'} width={15} height={15} />
        </button>
      </div>

      {/* Comments section */}
      {commentsOpen && (
        <div className="border-t border-gray-100 dark:border-dark-border">
          {/* Loading skeleton */}
          {commentsLoading && (
            <div className="p-4 space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-2.5 animate-pulse">
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment list */}
          {!commentsLoading && comments.length > 0 && (
            <div className="px-4 pt-3 space-y-3">
              {comments.map((comment) => (
                <CommentRow
                  key={comment.id}
                  comment={comment}
                  onReply={startReply}
                  currentUserId={user?.id}
                  onDelete={async (id) => {
                    try {
                      await commentsApi.remove(id);
                      setComments((prev) => prev.filter((c) => c.id !== id));
                      setLocalCommentsCount((n) => Math.max(0, n - 1));
                    } catch {
                      toast.error('Nie można usunąć komentarza.');
                    }
                  }}
                />
              ))}
            </div>
          )}

          {!commentsLoading && comments.length === 0 && (
            <p className="px-4 py-3 text-xs text-slate-400 text-center">
              Brak komentarzy. Bądź pierwszy!
            </p>
          )}

          {/* Comment composer */}
          {user && (
            <div className="flex items-center gap-2 px-4 py-3">
              <img
                src={user.avatarUrl ?? PLACEHOLDER_AVATAR}
                alt={user.displayName ?? user.username ?? 'Twój avatar'}
                className="w-7 h-7 rounded-full shrink-0 object-cover"
              />
              <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-slate-800/50 rounded-full pl-3 pr-1.5 py-1">
                {replyingTo && (
                  <span className="text-[10px] text-indigo-500 font-semibold shrink-0">
                    @{replyingTo.name}
                  </span>
                )}
                <input
                  ref={commentInputRef}
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); submitComment(); }
                    if (e.key === 'Escape') { setReplyingTo(null); setCommentInput(''); }
                  }}
                  placeholder={replyingTo ? `Odpowiedz @${replyingTo.name}…` : 'Napisz komentarz…'}
                  maxLength={2000}
                  className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none min-w-0"
                />
                <button
                  onClick={submitComment}
                  disabled={!commentInput.trim() || submitting}
                  aria-label="Wyślij komentarz"
                  className="shrink-0 w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <Icon icon="solar:arrow-up-linear" width={14} height={14} className="text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Single comment row
interface CommentRowProps {
  comment: CommentItem;
  onReply: (id: string, name: string) => void;
  currentUserId?: string;
  onDelete: (id: string) => void;
  depth?: number;
}

function CommentRow({ comment, onReply, currentUserId, onDelete, depth = 0 }: CommentRowProps) {
  const authorName = comment.author.displayName ?? comment.author.username;
  const authorAvatar = comment.author.avatarUrl ?? PLACEHOLDER_AVATAR;
  const isOwn = comment.author.id === currentUserId;

  return (
    <div className={depth > 0 ? 'pl-8 border-l-2 border-gray-100 dark:border-dark-border' : ''}>
      <div className="flex items-start gap-2.5">
        <img src={authorAvatar} alt={authorName} className="w-7 h-7 rounded-full shrink-0 object-cover mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl px-3 py-2">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mr-1.5">
              {authorName}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
              {comment.content}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 pl-1 text-[10px] text-slate-400">
            <span>{timeAgo(comment.createdAt)}</span>
            {depth === 0 && (
              <button
                onClick={() => onReply(comment.id, authorName)}
                className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Odpowiedz
              </button>
            )}
            {isOwn && (
              <button
                onClick={() => onDelete(comment.id)}
                className="hover:text-red-500 transition-colors"
              >
                Usuń
              </button>
            )}
          </div>
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 space-y-2">
              {comment.replies.map((reply) => (
                <CommentRow
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  currentUserId={currentUserId}
                  onDelete={onDelete}
                  depth={1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

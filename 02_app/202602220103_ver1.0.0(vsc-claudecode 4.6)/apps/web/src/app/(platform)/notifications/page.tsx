'use client';

export const dynamic = 'force-dynamic'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { notificationsApi, type NotificationItem } from '@/lib/api';
import { useSocket } from '@/lib/hooks/useSocket';

// ─── Notification icons & labels ──────────────────────────────────────────────

const NOTIF_META: Record<string, { icon: string; label: string; color: string }> = {
  FOLLOW: { icon: 'solar:user-plus-rounded-bold', label: 'Nowy obserwujący', color: 'text-indigo-500' },
  POST_LIKE: { icon: 'solar:like-bold', label: 'Polubił Twój post', color: 'text-rose-500' },
  POST_COMMENT: { icon: 'solar:chat-round-dots-bold', label: 'Skomentował Twój post', color: 'text-emerald-500' },
  MENTION: { icon: 'solar:at-sign-bold', label: 'Oznaczył Cię', color: 'text-violet-500' },
  MESSAGE: { icon: 'solar:chat-line-bold', label: 'Nowa wiadomość', color: 'text-sky-500' },
  EVENT_INVITE: { icon: 'solar:calendar-mark-bold', label: 'Zaproszenie na wydarzenie', color: 'text-amber-500' },
  MEMBER_JOIN: { icon: 'solar:users-group-rounded-bold', label: 'Nowy członek', color: 'text-teal-500' },
  SPACE_UPDATE: { icon: 'solar:layers-bold', label: 'Aktualizacja przestrzeni', color: 'text-slate-500' },
  COMMUNITY_JOIN: { icon: 'solar:buildings-3-bold', label: 'Ktoś dołączył do społeczności', color: 'text-orange-500' },
};

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'przed chwilą';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min temu`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} godz. temu`;
  return new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
}

// ─── Single Notification Row ──────────────────────────────────────────────────

function NotifRow({ notif, onRead }: { notif: NotificationItem; onRead: (id: string) => void }) {
  const meta = NOTIF_META[notif.type] ?? { icon: 'solar:bell-bold', label: notif.type, color: 'text-slate-500' };
  const data = notif.data as Record<string, string>;

  const actorName = data.followerDisplayName ?? data.newMemberId ?? 'Ktoś';
  const isUnread = !notif.readAt;

  return (
    <button
      onClick={() => isUnread && onRead(notif.id)}
      className={`w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-gray-100 dark:border-slate-800 last:border-0 ${
        isUnread ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : ''
      }`}
    >
      <div className={`mt-0.5 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 ${meta.color}`}>
        <Icon icon={meta.icon} width={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-800 dark:text-slate-200">
          <span className="font-medium">{actorName}</span>{' '}
          <span className="text-slate-500 dark:text-slate-400">{meta.label.toLowerCase()}</span>
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          {formatRelative(notif.createdAt)}
        </p>
      </div>
      {isUnread && (
        <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  // Real-time: listen for new notifications via WebSocket
  useSocket({
    onNotificationReceived: (notification: NotificationItem) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      const meta = NOTIF_META[notification.type];
      if (meta) {
        toast.info(meta.label, { icon: '🔔' });
      }
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
    refetchInterval: 30_000, // poll every 30s
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(`Oznaczono ${result.updated} powiadomień jako przeczytane`);
    },
  });

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Powiadomienia</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {unreadCount} nieprzeczytanych
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium disabled:opacity-60"
            >
              {markAllRead.isPending ? 'Oznaczanie...' : 'Oznacz wszystkie'}
            </button>
          )}
        </div>

        {/* List */}
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-transparent dark:border-dark-border overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Icon icon="solar:spinner-linear" className="text-indigo-500 animate-spin" width={32} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Icon icon="solar:bell-off-linear" className="text-slate-300 dark:text-slate-600 mb-4" width={48} />
              <p className="text-slate-500 dark:text-slate-400 text-sm">Brak powiadomień.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <NotifRow
                key={notif.id}
                notif={notif}
                onRead={(id) => markRead.mutate(id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

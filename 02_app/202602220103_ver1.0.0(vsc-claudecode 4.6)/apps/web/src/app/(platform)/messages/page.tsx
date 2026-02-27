'use client';

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import { socketService } from '@/lib/socket';
import {
  conversationsApi,
  type ConversationItem,
  type MessageItem,
} from '@/lib/api';
import { Send, MessageCircle, Loader2 } from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

function getConvTitle(conv: ConversationItem, myId: string | undefined) {
  if (conv.name) return conv.name;
  const other = conv.otherParticipants?.find((p) => p.id !== myId);
  return other?.displayName ?? other?.username ?? 'Unknown';
}

function getConvAvatar(conv: ConversationItem, myId: string | undefined) {
  const other = conv.otherParticipants?.find((p) => p.id !== myId);
  return other?.avatarUrl ?? null;
}

// ─── component ───────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const myId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // conversations list
  const { data: conversations, isLoading: convsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: conversationsApi.list,
    refetchInterval: 15_000,
  });

  // messages for selected conversation
  const { data: msgsData, isLoading: msgsLoading } = useQuery({
    queryKey: ['messages', selectedId],
    queryFn: () => conversationsApi.getMessages(selectedId!),
    enabled: !!selectedId,
  });

  // send via REST
  const sendMutation = useMutation({
    mutationFn: ({ content }: { content: string }) =>
      conversationsApi.sendMessage(selectedId!, content),
    onSuccess: (msg) => {
      queryClient.setQueryData<{
        messages: MessageItem[];
        hasMore: boolean;
        nextCursor: string | null;
      }>(['messages', selectedId], (old) =>
        old
          ? { ...old, messages: [...old.messages, msg] }
          : { messages: [msg], hasMore: false, nextCursor: null },
      );
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // join/leave conversation room + socket events
  useEffect(() => {
    if (!selectedId) return;
    const token = useAuthStore.getState().accessToken;
    if (!token) return;
    const socket = socketService.connect(token);
    if (socket) {
      socket.emit('conversation:join', { conversationId: selectedId });
    }
    return () => {
      if (socket) {
        socket.emit('conversation:leave', { conversationId: selectedId });
      }
    };
  }, [selectedId]);

  useEffect(() => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;
    const socket = socketService.connect(token);
    if (!socket) return;

    const onMsg = (msg: MessageItem) => {
      queryClient.setQueryData<{
        messages: MessageItem[];
        hasMore: boolean;
        nextCursor: string | null;
      }>(['messages', msg.conversationId], (old) =>
        old
          ? { ...old, messages: [...old.messages, msg] }
          : { messages: [msg], hasMore: false, nextCursor: null },
      );
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const onTyping = ({
      conversationId,
      userId,
      isTyping: t,
    }: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (conversationId === selectedId && userId !== myId) {
        setIsTyping(t);
      }
    };

    socketService.on('messages:receive', onMsg);
    socketService.on('messages:typing-indicator', onTyping);

    return () => {
      socket.off('messages:receive', onMsg);
      socket.off('messages:typing-indicator', onTyping);
    };
  }, [selectedId, myId, queryClient]);

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgsData?.messages]);

  const handleSend = () => {
    const content = draft.trim();
    if (!content || !selectedId) return;
    setDraft('');
    const connected = socketService.isConnected();
    if (connected) {
      socketService.sendMessage(selectedId, content);
    } else {
      sendMutation.mutate({ content });
    }
  };

  const messages = msgsData?.messages ?? [];

  // ── render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* sidebar */}
      <aside className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">Wiadomości</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-center animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 w-3/4" />
                    <div className="h-2.5 rounded bg-slate-200 dark:bg-slate-700 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !conversations?.length ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500 dark:text-slate-400">
              <MessageCircle className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">Brak rozmów</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const title = getConvTitle(conv, myId);
              const avatar = getConvAvatar(conv, myId);
              const isActive = conv.id === selectedId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full flex gap-3 items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left ${
                    isActive ? 'bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0 overflow-hidden flex items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-200">
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      title.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">{title}</p>
                    {conv.lastMessage && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-3">
            <MessageCircle className="w-12 h-12 opacity-30" />
            <p>Wybierz rozmowę</p>
          </div>
        ) : (
          <>
            {/* messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgsLoading ? (
                <div className="flex justify-center pt-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === myId;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-50 rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isMine ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm italic">
                    pisze...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-2 items-end">
                <textarea
                  rows={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Napisz wiadomość…"
                  className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!draft.trim() || sendMutation.isPending}
                  className="shrink-0 w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

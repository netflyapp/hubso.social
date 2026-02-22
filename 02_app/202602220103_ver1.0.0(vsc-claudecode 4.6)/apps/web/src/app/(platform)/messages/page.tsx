'use client';

import { Icon } from '@iconify/react';
import { useState, useEffect, useRef } from 'react';
import { mockUsers, mockConversations, mockMessages } from '@/lib/mock-data';
import { useSocket } from '@/lib/hooks/useSocket';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image';
  timestamp: Date;
  read: boolean;
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [socketConnected, setSocketConnected] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  const activeConv = mockConversations[selectedConversation] || mockConversations[0];
  // Get the other participant (not the current user)
  const otherParticipant = activeConv?.participants?.find((p: any) => p.id !== 'user-1') || activeConv?.participants?.[0];
  const otherUser = mockUsers.find(u => u.id === otherParticipant?.id) || mockUsers[0];
  const currentUserId = 'user-1'; // Mock current user (would come from useAuthStore)

  // Socket.io integration
  const { isConnected, sendMessage, sendTyping, joinConversation, leaveConversation } = useSocket({
    onMessageReceived: (message: Message) => {
      if (message.conversationId === activeConv?.id) {
        setMessages((prev) => [...prev, message]);
      }
    },
    onTypingIndicator: (data: any) => {
      if (data.conversationId === activeConv?.id && data.userId !== currentUserId) {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          if (data.isTyping) {
            updated.add(data.userId);
          } else {
            updated.delete(data.userId);
          }
          return updated;
        });
      }
    },
    onConnected: () => {
      setSocketConnected(true);
    },
    onDisconnected: () => {
      setSocketConnected(false);
    },
  });

  // Join/leave conversation on selection change
  useEffect(() => {
    if (!activeConv?.id) return;

    // Filter messages for this conversation from mock data
    const convMessages = mockMessages
      .filter((msg: any) => msg.conversationId === activeConv.id)
      .map((msg: any) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.authorId,
        content: msg.content,
        type: (msg.type === 'TEXT' ? 'text' : 'image') as 'text' | 'image',
        timestamp: new Date(msg.timestamp),
        read: true,
      }));

    setMessages(convMessages);

    // Join socket.io room
    joinConversation(activeConv.id);

    return () => {
      leaveConversation(activeConv.id);
    };
  }, [selectedConversation, activeConv?.id, joinConversation, leaveConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message send
  const handleSendMessage = () => {
    if (!inputValue.trim() || !activeConv?.id) return;

    // Send through Socket.io
    sendMessage(activeConv.id, inputValue.trim());

    // Optimistic update
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: activeConv.id,
      senderId: currentUserId,
      content: inputValue.trim(),
      type: 'text',
      timestamp: new Date(),
      read: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
  };

  // Handle typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (activeConv?.id && e.target.value.length > 0) {
      sendTyping(activeConv.id);
    }
  };

  return (
    <main className="flex-1 flex overflow-hidden">
      {/* Conversations List */}
      <div className="w-full sm:w-[340px] bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Wiadomości</h2>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
              <Icon icon="solar:pen-new-square-linear" width={18} height={18} />
            </button>
          </div>
          <div className="relative">
            <Icon 
              icon="solar:magnifer-linear" 
              width={16} 
              height={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input 
              type="text" 
              placeholder="Szukaj rozmów..." 
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockConversations.map((conv, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedConversation(idx)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-l-2 transition-colors ${
                idx === selectedConversation
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-600 dark:border-indigo-400'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'
              }`}
            >
              <div className="relative shrink-0">
                <img 
                  src={otherUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80'} 
                  className="w-11 h-11 rounded-full" 
                  alt="" 
                />
                <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-dark-surface rounded-full ${
                  idx % 2 === 0 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {otherUser?.name || 'Użytkownik'}
                  </p>
                  <span className="text-[10px] text-slate-400 shrink-0">{conv.lastMessage?.timestamp ? new Date(conv.lastMessage.timestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : 'wczoraj'}</span>
                </div>
                <p className={`text-xs truncate ${
                  idx === selectedConversation 
                    ? 'text-indigo-600 dark:text-indigo-400 font-medium' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {conv.lastMessage?.content || 'Brak wiadomości'}
                </p>
              </div>
              {idx % 3 === 0 && (
                <span className="w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shrink-0">
                  2
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-bg hidden sm:flex">
        {/* Chat Header */}
        <div className="h-16 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={otherUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80'} 
                className="w-10 h-10 rounded-full" 
                alt="" 
              />
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${socketConnected ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white dark:border-dark-surface rounded-full`}></span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{otherUser?.name || 'Użytkownik'}</p>
              <p className={`text-xs font-medium ${socketConnected ? 'text-green-500' : 'text-slate-400'}`}>
                {socketConnected ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <Icon icon="solar:phone-linear" width={20} height={20} />
            </button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <Icon icon="solar:videocamera-linear" width={20} height={20} />
            </button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <Icon icon="solar:menu-dots-bold" width={20} height={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-slate-400 text-sm">Brak wiadomości. Zacznij rozmowę! 💬</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const isSent = msg.senderId === currentUserId;
                const sender = mockUsers.find(u => u.id === msg.senderId) || otherUser;

                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isSent ? 'ml-auto flex-row-reverse max-w-[70%]' : 'max-w-[70%]'}`}>
                    {!isSent && (
                      <img 
                        src={sender?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80'} 
                        className="w-7 h-7 rounded-full shrink-0" 
                        alt="" 
                      />
                    )}
                    <div>
                      <div className={`${
                        isSent
                          ? 'bg-indigo-600 rounded-2xl rounded-br-md text-white'
                          : 'bg-white dark:bg-dark-surface rounded-2xl rounded-bl-md shadow-sm border border-gray-100 dark:border-dark-border'
                      } px-4 py-2.5`}>
                        <p className={`text-sm ${isSent ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                          {msg.content}
                        </p>
                      </div>
                      <p className={`text-[10px] text-slate-400 mt-1 ${isSent ? 'mr-2 text-right' : 'ml-2'}`}>
                        {msg.timestamp.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {typingUsers.size > 0 && (
                <div className="flex items-end gap-2 max-w-[70%]">
                  <img 
                    src={otherUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80'} 
                    className="w-7 h-7 rounded-full shrink-0" 
                    alt="" 
                  />
                  <div className="bg-white dark:bg-dark-surface rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100 dark:border-dark-border">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messageEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border px-6 py-4">
          <div className="flex items-center gap-2 mb-2">
            {!socketConnected && (
              <span className="text-xs text-amber-500 flex items-center gap-1">
                <Icon icon="solar:info-circle-linear" width={14} height={14} />
                Łączenie...
              </span>
            )}
            {socketConnected && (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <Icon icon="solar:check-circle-bold" width={14} height={14} />
                Połączono
              </span>
            )}
          </div>
          <div className="flex items-end gap-3">
            <div className="flex items-center gap-1">
              <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <Icon icon="solar:add-circle-linear" width={22} height={22} />
              </button>
              <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <Icon icon="solar:gallery-linear" width={20} height={20} />
              </button>
            </div>
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Napisz wiadomość..." 
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={!socketConnected}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                <Icon icon="solar:face-scan-circle-linear" width={20} height={20} />
              </button>
            </div>
            <button 
              onClick={handleSendMessage}
              disabled={!socketConnected || !inputValue.trim()}
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon icon="solar:plain-2-bold" width={20} height={20} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import { Icon } from '@iconify/react';
import { useState } from 'react';
import { mockUsers, mockConversations } from '@/lib/mock-data';

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(0);
  const activeConv = mockConversations[selectedConversation] || mockConversations[0];
  const otherUser = mockUsers.find(u => u.id === activeConv?.participantIds?.[0]) || mockUsers[0];

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
                  src={otherUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
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
                  <span className="text-[10px] text-slate-400 shrink-0">{conv.lastMessageTime || 'wczoraj'}</span>
                </div>
                <p className={`text-xs truncate ${
                  idx === selectedConversation 
                    ? 'text-indigo-600 dark:text-indigo-400 font-medium' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {conv.lastMessage || 'Brak wiadomości'}
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
                src={otherUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                className="w-10 h-10 rounded-full" 
                alt="" 
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-dark-surface rounded-full"></span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{otherUser?.name || 'Użytkownik'}</p>
              <p className="text-xs text-green-500 font-medium">Online</p>
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
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gray-200 dark:bg-dark-border"></div>
            <span className="text-xs text-slate-400 font-medium">Dzisiaj</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-dark-border"></div>
          </div>

          {/* Received */}
          <div className="flex items-end gap-2 max-w-[70%]">
            <img 
              src={otherUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
              className="w-7 h-7 rounded-full shrink-0" 
              alt="" 
            />
            <div>
              <div className="bg-white dark:bg-dark-surface rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm border border-gray-100 dark:border-dark-border">
                <p className="text-sm text-slate-700 dark:text-slate-200">Cześć! Jak tam? 😊</p>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 ml-2">10:15</p>
            </div>
          </div>

          {/* Sent */}
          <div className="flex items-end gap-2 max-w-[70%] ml-auto flex-row-reverse">
            <div>
              <div className="bg-indigo-600 rounded-2xl rounded-br-md px-4 py-2.5">
                <p className="text-sm text-white">Cześć! Wszystko dobrze 👋</p>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 mr-2 text-right">10:18</p>
            </div>
          </div>

          {/* Received with image */}
          <div className="flex items-end gap-2 max-w-[70%]">
            <img 
              src={otherUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
              className="w-7 h-7 rounded-full shrink-0" 
              alt="" 
            />
            <div>
              <div className="bg-white dark:bg-dark-surface rounded-2xl rounded-bl-md overflow-hidden shadow-sm border border-gray-100 dark:border-dark-border">
                <img 
                  src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop" 
                  alt="" 
                  className="w-full max-w-[280px]" 
                />
                <p className="text-sm text-slate-700 dark:text-slate-200 px-4 py-2.5">Fajny widok! 😍</p>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 ml-2">10:35</p>
            </div>
          </div>

          {/* Typing indicator */}
          <div className="flex items-end gap-2 max-w-[70%]">
            <img 
              src={otherUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
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
        </div>

        {/* Input */}
        <div className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border px-6 py-4">
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
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow pr-10"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                <Icon icon="solar:face-scan-circle-linear" width={20} height={20} />
              </button>
            </div>
            <button className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors shrink-0">
              <Icon icon="solar:plain-2-bold" width={20} height={20} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

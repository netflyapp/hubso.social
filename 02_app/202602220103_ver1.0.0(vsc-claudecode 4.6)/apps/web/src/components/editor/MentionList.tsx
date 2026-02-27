'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

export interface MentionUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

interface MentionListProps {
  items: MentionUser[];
  command: (item: { id: string; label: string }) => void;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => setSelectedIndex(0), [items]);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command({ id: item.id, label: item.displayName || item.username });
        }
      },
      [items, command],
    );

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((i) => (i + items.length - 1) % items.length);
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (!items.length) {
      return (
        <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-dark-surface shadow-lg p-2 text-xs text-slate-500 dark:text-slate-400">
          Brak wyników
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-dark-surface shadow-lg overflow-hidden min-w-[200px] max-w-[280px]">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectItem(index)}
            className={`flex items-center gap-2.5 w-full px-3 py-2 text-left text-sm transition-colors ${
              index === selectedIndex
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            {item.avatarUrl ? (
              <img
                src={item.avatarUrl}
                alt=""
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {(item.displayName || item.username).charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {item.displayName || item.username}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                @{item.username}
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  },
);

MentionList.displayName = 'MentionList';

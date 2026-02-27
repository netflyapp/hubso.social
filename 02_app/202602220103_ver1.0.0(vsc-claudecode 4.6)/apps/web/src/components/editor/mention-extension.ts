import { ReactRenderer } from '@tiptap/react';
import tippy, { type Instance as TippyInstance } from 'tippy.js';
import Mention from '@tiptap/extension-mention';
import { MentionList, type MentionListRef, type MentionUser } from './MentionList';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Fetch mention suggestions from the search/suggestions endpoint.
 */
async function fetchSuggestions(query: string): Promise<MentionUser[]> {
  try {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('hubso_access_token')
      : null;
    const res = await fetch(
      `${API_URL}/search/suggestions?q=${encodeURIComponent(query)}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.users ?? []) as MentionUser[];
  } catch {
    return [];
  }
}

/**
 * Pre-configured Tiptap Mention extension with suggestion popup.
 */
export const MentionExtension = Mention.configure({
  HTMLAttributes: {
    class: 'mention',
  },
  suggestion: {
    items: async ({ query }: { query: string }) => {
      if (!query || query.length < 1) return [];
      return fetchSuggestions(query);
    },

    render: () => {
      let component: ReactRenderer<MentionListRef> | null = null;
      let popup: TippyInstance[] | null = null;

      return {
        onStart: (props: any) => {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) return;

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          });
        },

        onUpdate(props: any) {
          component?.updateProps(props);
          if (popup?.[0] && props.clientRect) {
            popup[0].setProps({
              getReferenceClientRect: props.clientRect,
            });
          }
        },

        onKeyDown(props: any) {
          if (props.event.key === 'Escape') {
            popup?.[0]?.hide();
            return true;
          }
          return component?.ref?.onKeyDown(props) ?? false;
        },

        onExit() {
          popup?.[0]?.destroy();
          component?.destroy();
        },
      };
    },
  },
});

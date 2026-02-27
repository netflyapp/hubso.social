'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { MentionExtension } from './mention-extension';
import { Icon } from '@iconify/react';

// ─── Toolbar ──────────────────────────────────────────────────────────────────

interface MenuBarProps {
  editor: Editor;
}

function MenuBar({ editor }: MenuBarProps) {
  const btn = (active: boolean) =>
    `p-1.5 rounded-md transition-colors ${
      active
        ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
        : 'text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200'
    }`;

  return (
    <div className="flex items-center gap-0.5 flex-wrap px-3 py-2 border-b border-gray-100 dark:border-slate-700/50">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive('bold'))}
        title="Pogrubienie"
      >
        <Icon icon="solar:text-bold-linear" width={16} height={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive('italic'))}
        title="Kursywa"
      >
        <Icon icon="solar:text-italic-linear" width={16} height={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btn(editor.isActive('strike'))}
        title="Przekreślenie"
      >
        <Icon icon="solar:text-cross-linear" width={16} height={16} />
      </button>

      <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btn(editor.isActive('heading', { level: 2 }))}
        title="Nagłówek"
      >
        <Icon icon="solar:text-linear" width={16} height={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive('bulletList'))}
        title="Lista punktowana"
      >
        <Icon icon="solar:list-linear" width={16} height={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive('orderedList'))}
        title="Lista numerowana"
      >
        <Icon icon="solar:sort-from-top-to-bottom-linear" width={16} height={16} />
      </button>

      <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btn(editor.isActive('blockquote'))}
        title="Cytat"
      >
        <Icon icon="solar:quote-down-square-linear" width={16} height={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={btn(editor.isActive('codeBlock'))}
        title="Blok kodu"
      >
        <Icon icon="solar:code-linear" width={16} height={16} />
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt('Podaj URL linku:');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        className={btn(editor.isActive('link'))}
        title="Wstaw link"
      >
        <Icon icon="solar:link-round-linear" width={16} height={16} />
      </button>
    </div>
  );
}

// ─── Editor ───────────────────────────────────────────────────────────────────

interface TiptapEditorProps {
  /** Controlled JSON content — set to restore state */
  content?: Record<string, unknown>;
  /** Called when content changes — receives Tiptap JSON */
  onChange?: (json: Record<string, unknown>) => void;
  /** Placeholder text */
  placeholder?: string;
  /** If true, editor is read-only (for displaying content) */
  editable?: boolean;
  /** Hide toolbar */
  hideToolbar?: boolean;
  /** Min-height class */
  minHeight?: string;
  /** Auto focus on mount */
  autoFocus?: boolean;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Napisz coś…',
  editable = true,
  hideToolbar = false,
  minHeight = 'min-h-[80px]',
  autoFocus = false,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false }),
      MentionExtension,
    ],
    content: content ?? '',
    editable,
    autofocus: autoFocus,
    editorProps: {
      attributes: {
        class: `prose prose-sm dark:prose-invert max-w-none focus:outline-none px-4 py-3 ${minHeight} text-slate-700 dark:text-slate-200`,
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getJSON() as Record<string, unknown>);
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700/50 bg-white dark:bg-dark-surface overflow-hidden transition-colors focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300 dark:focus-within:border-indigo-500/40">
      {editable && !hideToolbar && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

// ─── Read-only renderer ───────────────────────────────────────────────────────

interface TiptapRendererProps {
  content: unknown;
}

/** Renders Tiptap JSON as read-only rich text */
export function TiptapRenderer({ content }: TiptapRendererProps) {
  // Fallback for plain strings
  if (typeof content === 'string') {
    return (
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    );
  }

  return (
    <TiptapEditor
      content={content as Record<string, unknown>}
      editable={false}
      hideToolbar
      minHeight="min-h-0"
    />
  );
}

export default TiptapEditor;

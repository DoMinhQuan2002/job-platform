"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Bold, Italic, Underline as UnderlineIcon, List } from "lucide-react";

export interface RichTextEditorProps {
  content?: string;
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
  minHeight?: string;
}

export function RichTextEditor({
  content,
  value,
  onChange,
  placeholder,
  editable = true,
  disabled = false,
  className = "",
  label,
  required,
  error,
  minHeight = "min-h-[8rem]",
}: RichTextEditorProps) {
  const initialContent = content ?? value ?? "";
  const isEditable = editable && !disabled;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: "list-disc pl-5 my-2 space-y-1",
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: "list-decimal pl-5 my-2 space-y-1",
          },
        },
      }),
      Underline,
    ],
    content: initialContent,
    editable: isEditable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `outline-none text-xs text-text leading-relaxed p-3 ${minHeight} focus:outline-none`,
        "data-placeholder": placeholder || "",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      // If editor is empty (e.g. <p></p>), pass empty string if preferred, or the html
      const isEmpty = currentEditor.isEmpty;
      onChange?.(isEmpty ? "" : html);
    },
  });

  // Sync external content changes (e.g. when fetching detail in edit mode)
  useEffect(() => {
    if (!editor) return;
    const incoming = content ?? value;
    if (incoming !== undefined && incoming !== editor.getHTML()) {
      editor.commands.setContent(incoming || "", { emitUpdate: false });
    }
  }, [editor, content, value]);

  // Sync editable state
  useEffect(() => {
    if (editor && editor.isEditable !== isEditable) {
      editor.setEditable(isEditable);
    }
  }, [editor, isEditable]);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="mb-1.5 block text-xs font-semibold text-text">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div
        className={`overflow-hidden rounded-lg border bg-surface transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 ${
          error ? "border-danger" : "border-border"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-background" : ""}`}
      >
        {/* Toolbar - 4 buttons: Bold, Italic, Underline, Bullet List */}
        {editor && isEditable && (
          <div className="flex h-9 items-center gap-1 border-b border-border bg-background/60 px-2">
            {/* 1. Bold */}
            <button
              type="button"
              title="In đậm (Bold)"
              aria-label="Bold"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleBold().run();
              }}
              className={`grid size-7 place-items-center rounded transition active:scale-95 ${
                editor.isActive("bold")
                  ? "bg-primary/15 text-primary font-bold shadow-xs"
                  : "text-muted hover:bg-muted/15 hover:text-text"
              }`}
            >
              <Bold className="size-3.5 stroke-[2.5]" />
            </button>

            {/* 2. Italic */}
            <button
              type="button"
              title="In nghiêng (Italic)"
              aria-label="Italic"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleItalic().run();
              }}
              className={`grid size-7 place-items-center rounded transition active:scale-95 ${
                editor.isActive("italic")
                  ? "bg-primary/15 text-primary font-bold shadow-xs"
                  : "text-muted hover:bg-muted/15 hover:text-text"
              }`}
            >
              <Italic className="size-3.5" />
            </button>

            {/* 3. Underline */}
            <button
              type="button"
              title="Gạch chân (Underline)"
              aria-label="Underline"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleUnderline().run();
              }}
              className={`grid size-7 place-items-center rounded transition active:scale-95 ${
                editor.isActive("underline")
                  ? "bg-primary/15 text-primary font-bold shadow-xs"
                  : "text-muted hover:bg-muted/15 hover:text-text"
              }`}
            >
              <UnderlineIcon className="size-3.5" />
            </button>

            {/* 4. Bullet List */}
            <button
              type="button"
              title="Danh sách gạch đầu dòng (Bullet List)"
              aria-label="Bullet List"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleBulletList().run();
              }}
              className={`grid size-7 place-items-center rounded transition active:scale-95 ${
                editor.isActive("bulletList")
                  ? "bg-primary/15 text-primary font-bold shadow-xs"
                  : "text-muted hover:bg-muted/15 hover:text-text"
              }`}
            >
              <List className="size-3.5" />
            </button>
          </div>
        )}

        {/* Content Area */}
        <div
          className={`prose prose-xs max-w-none text-xs leading-relaxed text-text ${minHeight} [&_.tiptap]:min-h-[8rem] [&_.tiptap]:outline-none [&_.tiptap_p]:my-1.5 [&_.tiptap_p.is-editor-empty:first-child::before]:text-muted/60 [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ul]:my-2 [&_.tiptap_ul_li]:my-1 [&_.tiptap_ul_li]:leading-relaxed [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5 [&_.tiptap_ol]:my-2 [&_.tiptap_ol_li]:my-1`}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {error && <p className="mt-1 text-[10px] text-danger">{error}</p>}
    </div>
  );
}

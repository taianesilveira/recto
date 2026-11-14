"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { saveDocumentContent } from "@/lib/documents/actions";
import { Toolbar } from "./toolbar";

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

const SAVE_DEBOUNCE_MS = 800;

function StatusLabel({ status }: { status: SaveStatus }) {
  const text = {
    saved: "Saved",
    saving: "Saving…",
    unsaved: "Unsaved changes",
    error: "Couldn't save — retrying",
  }[status];

  return (
    <span
      className={`text-xs ${status === "error" ? "text-accent" : "text-ink-faint"}`}
    >
      {text}
    </span>
  );
}

export function DocumentEditor({
  documentId,
  initialContent,
  editable,
}: {
  documentId: string;
  initialContent: JSONContent;
  editable: boolean;
}) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestContentRef = useRef<JSONContent>(initialContent);

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: editable ? "Start writing…" : "",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "tiptap-content focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      if (!editable) return;
      latestContentRef.current = editor.getJSON();
      setStatus("unsaved");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(save, SAVE_DEBOUNCE_MS);
    },
  });

  async function save() {
    setStatus("saving");
    const result = await saveDocumentContent(
      documentId,
      latestContentRef.current,
    );
    setStatus(result.ok ? "saved" : "error");
    if (!result.ok && timerRef.current === null) {
      // Retry once after a pause rather than losing the edit silently.
      timerRef.current = setTimeout(save, SAVE_DEBOUNCE_MS * 2);
    }
  }

  // Flush a pending save if the user navigates away mid-debounce.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!editor) {
    return (
      <div className="mt-8 h-40 animate-pulse border border-line bg-line/20" />
    );
  }

  return (
    <div className="mt-6">
      {editable ? (
        <div className="flex items-start justify-between gap-4">
          <Toolbar editor={editor} />
          <div className="shrink-0 pt-1">
            <StatusLabel status={status} />
          </div>
        </div>
      ) : (
        <p className="border-b border-line pb-2 text-xs text-ink-faint">
          View only — you don&apos;t have edit access to this document.
        </p>
      )}
      <EditorContent editor={editor} className="mt-4" />
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { renameDocument, deleteDocument } from "@/lib/documents/actions";

type Props = {
  id: string;
  title: string;
  role: "owner" | "editor" | "viewer";
};

export function DocumentHeader({ id, title, role }: Props) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const canEdit = role === "owner" || role === "editor";
  const canDelete = role === "owner";

  return (
    <header className="border-b border-line pb-4">
      <Link href="/documents" className="text-xs text-ink-muted hover:text-ink">
        ← All documents
      </Link>
      <div className="mt-2 flex items-center gap-3">
        <form
          action={renameDocument}
          onSubmit={() => setIsRenaming(false)}
          className={isRenaming ? "flex flex-1 items-center gap-2" : "hidden"}
        >
          <input type="hidden" name="documentId" value={id} />
          <input
            type="text"
            name="title"
            defaultValue={title}
            maxLength={200}
            className="flex-1 border border-line bg-paper px-2 py-1 text-lg font-semibold outline-none focus-visible:border-accent"
          />
          <button type="submit" className="text-sm text-accent hover:underline">
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsRenaming(false)}
            className="text-sm text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
        </form>

        {!isRenaming && (
          <>
            <h1 className="flex-1 truncate text-lg font-semibold">{title}</h1>
            <span className="shrink-0 border border-line px-1.5 py-0.5 text-xs text-ink-muted">
              {role}
            </span>
            {canEdit && (
              <button
                type="button"
                onClick={() => setIsRenaming(true)}
                className="shrink-0 text-xs text-ink-muted hover:text-ink"
              >
                Rename
              </button>
            )}
            {canDelete && !confirmingDelete && (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="shrink-0 text-xs text-ink-muted hover:text-ink"
              >
                Delete
              </button>
            )}
          </>
        )}

        <form
          action={deleteDocument}
          className={
            canDelete && confirmingDelete && !isRenaming
              ? "flex shrink-0 items-center gap-2"
              : "hidden"
          }
        >
          <input type="hidden" name="documentId" value={id} />
          <button type="submit" className="text-xs text-accent">
            Confirm delete
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="text-xs text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
        </form>
      </div>
    </header>
  );
}

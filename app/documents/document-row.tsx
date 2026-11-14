"use client";

import { useState } from "react";
import Link from "next/link";
import { renameDocument, deleteDocument } from "@/lib/documents/actions";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

type Props = {
  id: string;
  title: string;
  updatedAt: Date;
  canEdit: boolean;
  canDelete: boolean;
  role?: "editor" | "viewer";
  ownerName?: string;
};

export function DocumentRow({
  id,
  title,
  updatedAt,
  canEdit,
  canDelete,
  role,
  ownerName,
}: Props) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <li className="flex items-center gap-3 border-b border-line py-3">
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
          className="flex-1 border border-line bg-paper px-2 py-1 text-sm outline-none focus-visible:border-accent"
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
          <Link href={`/documents/${id}`} className="flex-1 truncate text-sm">
            {title}
          </Link>
          {role && (
            <span className="shrink-0 border border-line px-1.5 py-0.5 text-xs text-ink-muted">
              {role}
            </span>
          )}
          {ownerName && (
            <span className="shrink-0 text-xs text-ink-faint">{ownerName}</span>
          )}
          <span className="shrink-0 text-xs text-ink-faint">
            {formatDate(updatedAt)}
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
    </li>
  );
}

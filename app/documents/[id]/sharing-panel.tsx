import { shareDocument, revokeShare } from "@/lib/documents/actions";
import type { ShareRow } from "@/lib/documents/sharing";

const SHARE_ERROR_MESSAGES: Record<string, string> = {
  invalid: "Enter a valid email and pick a role.",
  forbidden: "Only the owner can manage sharing.",
  "no-account": "No account with that email.",
  "is-owner": "That's already the owner.",
};

export function SharingPanel({
  documentId,
  shares,
  error,
}: {
  documentId: string;
  shares: ShareRow[];
  error?: string;
}) {
  return (
    <div className="mt-10 border-t border-line pt-6">
      <h2 className="text-sm font-medium text-ink-muted">Shared with</h2>

      {error && (
        <p className="mt-2 text-sm text-accent">
          {SHARE_ERROR_MESSAGES[error] ?? "Couldn't update sharing."}
        </p>
      )}

      {shares.length === 0 ? (
        <p className="mt-3 text-sm text-ink-faint">
          Only you have access to this document.
        </p>
      ) : (
        <ul className="mt-3">
          {shares.map((share) => (
            <li
              key={share.shareId}
              className="flex items-center gap-3 border-b border-line py-2 text-sm"
            >
              <span className="flex-1 truncate">
                {share.name}
                <span className="ml-2 text-ink-faint">{share.email}</span>
              </span>
              <span className="shrink-0 border border-line px-1.5 py-0.5 text-xs text-ink-muted">
                {share.role}
              </span>
              <form action={revokeShare} className="shrink-0">
                <input type="hidden" name="documentId" value={documentId} />
                <input type="hidden" name="shareId" value={share.shareId} />
                <button
                  type="submit"
                  className="text-xs text-ink-muted hover:text-ink"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form
        action={shareDocument}
        className="mt-4 flex items-center gap-2 text-sm"
      >
        <input type="hidden" name="documentId" value={documentId} />
        <input
          type="email"
          name="email"
          placeholder="person@recto.app"
          required
          className="flex-1 border border-line bg-paper px-2 py-1.5 outline-none focus-visible:border-accent"
        />
        <select
          name="role"
          defaultValue="viewer"
          className="border border-line bg-paper px-2 py-1.5 text-sm"
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </select>
        <button
          type="submit"
          className="shrink-0 border border-ink px-3 py-1.5 hover:bg-ink hover:text-paper"
        >
          Share
        </button>
      </form>
    </div>
  );
}

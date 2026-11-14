import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { getDocumentsForUser } from "@/lib/documents/queries";
import { signOut } from "@/app/sign-in/actions";
import { DocumentRow } from "./document-row";
import { NewDocumentButton } from "./new-document-button";
import { ImportButton } from "./import-button";

const IMPORT_ERROR_MESSAGES: Record<string, string> = {
  "missing-file": "Choose a file before importing.",
  "unsupported-type": "That file type isn't supported. Use .txt, .md, or .docx.",
  "too-large": "That file is larger than the 5MB import limit.",
  "conversion-failed": "Couldn't read that file. It may be corrupted.",
};

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ importError?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { importError } = await searchParams;
  const { owned, shared } = await getDocumentsForUser(user.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="flex items-center justify-between border-b border-line pb-4">
        <h1 className="text-lg font-semibold">
          <span className="text-accent">r</span>ecto
        </h1>
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <span>{user.name}</span>
          <form action={signOut}>
            <button type="submit" className="underline hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
      </header>

      {importError && (
        <p className="mt-4 border border-line px-3 py-2 text-sm text-accent">
          {IMPORT_ERROR_MESSAGES[importError] ?? "Couldn't import that file."}
        </p>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium text-ink-muted">
            Your documents
          </h2>
          <div className="flex items-center gap-2">
            <ImportButton />
            <NewDocumentButton />
          </div>
        </div>
        <p className="mt-1 text-xs text-ink-faint">
          Import accepts .txt, .md, or .docx (up to 5MB) and creates a new
          document.
        </p>
        {owned.length === 0 ? (
          <p className="mt-4 border border-line px-4 py-6 text-center text-sm text-ink-muted">
            No documents yet. Create one to get started.
          </p>
        ) : (
          <ul className="mt-2">
            {owned.map((doc) => (
              <DocumentRow
                key={doc.id}
                id={doc.id}
                title={doc.title}
                updatedAt={doc.updatedAt}
                canEdit
                canDelete
              />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-ink-muted">
          Shared with you
        </h2>
        {shared.length === 0 ? (
          <p className="mt-4 border border-line px-4 py-6 text-center text-sm text-ink-muted">
            Nothing has been shared with you yet.
          </p>
        ) : (
          <ul className="mt-2">
            {shared.map((doc) => (
              <DocumentRow
                key={doc.id}
                id={doc.id}
                title={doc.title}
                updatedAt={doc.updatedAt}
                role={doc.role}
                ownerName={doc.ownerName}
                canEdit={doc.role === "editor"}
                canDelete={false}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

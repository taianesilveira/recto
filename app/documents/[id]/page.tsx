import { notFound, redirect } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import {
  getCurrentUser,
  getDocumentForUser,
  canWrite,
  canManageSharing,
} from "@/lib/auth/dal";
import { getSharesForDocument } from "@/lib/documents/sharing";
import { DocumentHeader } from "./document-header";
import { DocumentEditor } from "./document-editor";
import { SharingPanel } from "./sharing-panel";

export default async function DocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ shareError?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;
  const { shareError } = await searchParams;
  const access = await getDocumentForUser(id, user.id);
  // null covers both "does not exist" and "exists but you can't see it" —
  // see .kiro/skills/authz-boundary. Either way, a 404.
  if (!access) notFound();

  const shares = canManageSharing(access.role)
    ? await getSharesForDocument(id)
    : [];

  return (
    <main className="mx-auto w-full max-w-[680px] px-6 py-10">
      <DocumentHeader id={id} title={access.document.title} role={access.role} />
      <DocumentEditor
        documentId={id}
        initialContent={access.document.content as JSONContent}
        editable={canWrite(access.role)}
      />
      {canManageSharing(access.role) && (
        <SharingPanel documentId={id} shares={shares} error={shareError} />
      )}
    </main>
  );
}

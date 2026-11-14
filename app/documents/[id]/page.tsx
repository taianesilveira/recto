import { notFound, redirect } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { getCurrentUser, getDocumentForUser, canWrite } from "@/lib/auth/dal";
import { DocumentHeader } from "./document-header";
import { DocumentEditor } from "./document-editor";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;
  const access = await getDocumentForUser(id, user.id);
  // null covers both "does not exist" and "exists but you can't see it" —
  // see .kiro/skills/authz-boundary. Either way, a 404.
  if (!access) notFound();

  return (
    <main className="mx-auto w-full max-w-[680px] px-6 py-10">
      <DocumentHeader id={id} title={access.document.title} role={access.role} />
      <DocumentEditor
        documentId={id}
        initialContent={access.document.content as JSONContent}
        editable={canWrite(access.role)}
      />
    </main>
  );
}

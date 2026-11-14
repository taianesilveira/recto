import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getDocumentForUser } from "@/lib/auth/dal";
import { DocumentHeader } from "./document-header";

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
      <div className="mt-8 border border-line px-6 py-10 text-center text-sm text-ink-muted">
        The editor arrives in the next step. Content is stored, just not
        editable yet.
      </div>
    </main>
  );
}

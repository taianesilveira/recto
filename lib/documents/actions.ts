"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { getCurrentUser, getDocumentForUser, canWrite } from "@/lib/auth/dal";

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

export async function createDocument() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const db = await getDb();
  const [doc] = await db
    .insert(documents)
    .values({ title: "Untitled", ownerId: user.id, content: EMPTY_DOC })
    .returning();

  revalidatePath("/documents");
  redirect(`/documents/${doc.id}`);
}

const renameSchema = z.object({
  documentId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
});

export async function renameDocument(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const parsed = renameSchema.safeParse({
    documentId: formData.get("documentId"),
    title: formData.get("title"),
  });
  if (!parsed.success) return;

  // See .kiro/skills/authz-boundary: never trust a role sent from the
  // client, always re-check against the database for this request.
  const access = await getDocumentForUser(parsed.data.documentId, user.id);
  if (!access || !canWrite(access.role)) return;

  const db = await getDb();
  await db
    .update(documents)
    .set({ title: parsed.data.title, updatedAt: new Date() })
    .where(eq(documents.id, parsed.data.documentId));

  revalidatePath("/documents");
  revalidatePath(`/documents/${parsed.data.documentId}`);
}

const deleteSchema = z.object({ documentId: z.string().uuid() });

export async function deleteDocument(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const parsed = deleteSchema.safeParse({
    documentId: formData.get("documentId"),
  });
  if (!parsed.success) return;

  const access = await getDocumentForUser(parsed.data.documentId, user.id);
  // Deleting is an ownership action, not a write action: an editor can
  // change content but not destroy the document.
  if (!access || access.role !== "owner") return;

  const db = await getDb();
  await db.delete(documents).where(eq(documents.id, parsed.data.documentId));

  revalidatePath("/documents");
  redirect("/documents");
}

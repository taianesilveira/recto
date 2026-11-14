"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { JSONContent } from "@tiptap/react";
import { getDb } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { getCurrentUser, getDocumentForUser, canWrite } from "@/lib/auth/dal";
import {
  convertFileToDocumentJSON,
  titleFromFileName,
  SUPPORTED_IMPORT_EXTENSIONS,
  UnsupportedFileTypeError,
} from "@/lib/documents/import";

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

// ProseMirror JSON can nest arbitrarily; z.unknown() with a manual size
// check is cheaper and more honest than trying to fully type it here.
const MAX_CONTENT_BYTES = 2_000_000;

const saveContentSchema = z.object({
  documentId: z.string().uuid(),
  content: z.unknown(),
});

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function saveDocumentContent(
  documentId: string,
  content: unknown,
): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const parsed = saveContentSchema.safeParse({ documentId, content });
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const size = JSON.stringify(parsed.data.content).length;
  if (size > MAX_CONTENT_BYTES) {
    return { ok: false, error: "Document is too large to save." };
  }

  const access = await getDocumentForUser(parsed.data.documentId, user.id);
  if (!access || !canWrite(access.role)) {
    return { ok: false, error: "You don't have permission to edit this." };
  }

  const db = await getDb();
  await db
    .update(documents)
    .set({ content: parsed.data.content, updatedAt: new Date() })
    .where(eq(documents.id, parsed.data.documentId));

  revalidatePath("/documents");
  return { ok: true };
}

const MAX_IMPORT_BYTES = 5_000_000;

function extensionOf(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

// Imports always create a new document. Inserting into an already-open
// draft was in scope for this exercise but cut to keep the feature
// predictable within the timebox -- see ARCHITECTURE.md.
export async function importDocument(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/documents?importError=missing-file");
  }

  const ext = extensionOf(file.name);
  if (!SUPPORTED_IMPORT_EXTENSIONS.includes(ext)) {
    redirect("/documents?importError=unsupported-type");
  }

  if (file.size > MAX_IMPORT_BYTES) {
    redirect("/documents?importError=too-large");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let content: JSONContent;
  try {
    content = await convertFileToDocumentJSON(file.name, buffer);
  } catch (error) {
    redirect(
      error instanceof UnsupportedFileTypeError
        ? "/documents?importError=unsupported-type"
        : "/documents?importError=conversion-failed",
    );
  }

  const db = await getDb();
  const [doc] = await db
    .insert(documents)
    .values({ title: titleFromFileName(file.name), ownerId: user.id, content })
    .returning();

  revalidatePath("/documents");
  redirect(`/documents/${doc.id}`);
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

import "server-only";
import { generateJSON } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { marked } from "marked";
import * as mammoth from "mammoth";
import type { JSONContent } from "@tiptap/react";

// Same node set the editor itself uses (see document-editor.tsx), so a
// heading or list that survives conversion renders identically to one
// typed directly in the app.
const EXTENSIONS = [StarterKit.configure({ heading: { levels: [1, 2, 3] } })];

export const SUPPORTED_IMPORT_EXTENSIONS = ["txt", "md", "markdown", "docx"];

export class UnsupportedFileTypeError extends Error {
  constructor(extension: string) {
    super(`Unsupported file type: .${extension}`);
  }
}

function extensionOf(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

function plainTextToJSON(text: string): JSONContent {
  const paragraphs = text
    .split(/\r?\n\r?\n+/)
    .map((block) => block.replace(/\r?\n/g, " ").trim())
    .filter(Boolean);

  return {
    type: "doc",
    content:
      paragraphs.length > 0
        ? paragraphs.map((p) => ({
            type: "paragraph",
            content: [{ type: "text", text: p }],
          }))
        : [{ type: "paragraph" }],
  };
}

export async function convertFileToDocumentJSON(
  fileName: string,
  buffer: Buffer,
): Promise<JSONContent> {
  const ext = extensionOf(fileName);

  if (ext === "docx") {
    const { value: html } = await mammoth.convertToHtml({ buffer });
    return generateJSON(html, EXTENSIONS);
  }

  if (ext === "md" || ext === "markdown") {
    const html = await marked.parse(buffer.toString("utf-8"));
    return generateJSON(html, EXTENSIONS);
  }

  if (ext === "txt") {
    return plainTextToJSON(buffer.toString("utf-8"));
  }

  throw new UnsupportedFileTypeError(ext);
}

export function titleFromFileName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "").trim();
  return withoutExtension || "Untitled";
}

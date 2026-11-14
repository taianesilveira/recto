import { describe, it, expect } from "vitest";
import {
  convertFileToDocumentJSON,
  titleFromFileName,
  UnsupportedFileTypeError,
} from "@/lib/documents/import";

function findNodeTypes(doc: { content?: Array<{ type?: string }> }) {
  return (doc.content ?? []).map((node) => node.type);
}

describe("convertFileToDocumentJSON", () => {
  it("splits a .txt file into one paragraph per blank-line-separated block", async () => {
    const buffer = Buffer.from(
      "First paragraph.\n\nSecond paragraph, on its own block.\n",
    );
    const doc = await convertFileToDocumentJSON("notes.txt", buffer);

    expect(doc.type).toBe("doc");
    expect(findNodeTypes(doc)).toEqual(["paragraph", "paragraph"]);
    expect(JSON.stringify(doc)).toContain("First paragraph.");
    expect(JSON.stringify(doc)).toContain("Second paragraph, on its own block.");
  });

  it("gives an empty .txt file a single empty paragraph rather than an empty doc", async () => {
    const doc = await convertFileToDocumentJSON("empty.txt", Buffer.from(""));
    expect(findNodeTypes(doc)).toEqual(["paragraph"]);
  });

  it("converts markdown headings, bold, italic, and lists to the matching node types", async () => {
    const buffer = Buffer.from(
      "# Title\n\nSome **bold** and *italic* text.\n\n- one\n- two\n",
    );
    const doc = await convertFileToDocumentJSON("notes.md", buffer);
    const json = JSON.stringify(doc);

    expect(findNodeTypes(doc)).toEqual(["heading", "paragraph", "bulletList"]);
    expect(json).toContain('"type":"bold"');
    expect(json).toContain('"type":"italic"');
    expect(json).toContain('"type":"listItem"');
  });

  it("treats .markdown the same as .md", async () => {
    const doc = await convertFileToDocumentJSON(
      "notes.markdown",
      Buffer.from("# Heading\n"),
    );
    expect(findNodeTypes(doc)).toEqual(["heading"]);
  });

  it("rejects an unsupported extension instead of guessing", async () => {
    await expect(
      convertFileToDocumentJSON("report.pdf", Buffer.from("whatever")),
    ).rejects.toBeInstanceOf(UnsupportedFileTypeError);
  });

  it("rejects a file with no extension", async () => {
    await expect(
      convertFileToDocumentJSON("README", Buffer.from("text")),
    ).rejects.toBeInstanceOf(UnsupportedFileTypeError);
  });
});

describe("titleFromFileName", () => {
  it("strips the extension", () => {
    expect(titleFromFileName("Quarterly Report.docx")).toBe(
      "Quarterly Report",
    );
  });

  it("only strips the last extension", () => {
    expect(titleFromFileName("notes.v2.md")).toBe("notes.v2");
  });

  it("falls back to Untitled for a name that is only an extension", () => {
    expect(titleFromFileName(".md")).toBe("Untitled");
  });
});

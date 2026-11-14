import { createDocument } from "@/lib/documents/actions";

export function NewDocumentButton() {
  return (
    <form action={createDocument}>
      <button
        type="submit"
        className="border border-ink px-3 py-1.5 text-sm hover:bg-ink hover:text-paper"
      >
        New document
      </button>
    </form>
  );
}

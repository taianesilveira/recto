import { importDocument } from "@/lib/documents/actions";

export function ImportButton() {
  return (
    <form
      action={importDocument}
      className="flex items-center gap-2 text-sm text-ink-muted"
    >
      <input
        type="file"
        name="file"
        accept=".txt,.md,.markdown,.docx"
        required
        className="max-w-[160px] text-xs"
      />
      <button
        type="submit"
        className="border border-line px-3 py-1.5 hover:border-ink hover:text-ink"
      >
        Import
      </button>
    </form>
  );
}

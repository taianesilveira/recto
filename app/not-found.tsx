import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-lg font-semibold">
          <span className="text-accent">r</span>ecto
        </h1>
        <p className="mt-4 text-sm text-ink-muted">
          This page doesn&apos;t exist, or you don&apos;t have access to it.
        </p>
        <Link
          href="/documents"
          className="mt-6 inline-block border border-ink px-4 py-2 text-sm hover:bg-ink hover:text-paper"
        >
          Back to your documents
        </Link>
      </div>
    </main>
  );
}

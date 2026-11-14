"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-lg font-semibold">
          <span className="text-accent">r</span>ecto
        </h1>
        <p className="mt-4 text-sm text-ink-muted">
          Something went wrong loading this page.
        </p>
        {error.digest && (
          <p className="mt-1 text-xs text-ink-faint">
            Reference: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-6 border border-ink px-4 py-2 text-sm hover:bg-ink hover:text-paper"
        >
          Try again
        </button>
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { signOut } from "@/app/sign-in/actions";

export default async function DocumentsPage() {
  const user = await getCurrentUser();

  // Belt and suspenders: proxy.ts already redirects unauthenticated
  // requests, but this route does not trust that — it checks again.
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="flex items-center justify-between border-b border-line pb-4">
        <h1 className="text-lg font-semibold">
          <span className="text-accent">r</span>ecto
        </h1>
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <span>{user.name}</span>
          <form action={signOut}>
            <button type="submit" className="underline hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <p className="mt-6 text-sm text-ink-muted">
        Document list, creation, and sharing land in the next step.
      </p>
    </main>
  );
}

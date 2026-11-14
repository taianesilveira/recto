import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { signIn } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Something about that request didn't look right. Try again.",
  "unknown-account": "That account no longer exists. Pick another one.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const db = await getDb();
  const accounts = await db.select().from(users).orderBy(users.name);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold">
          <span className="text-accent">r</span>ecto
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          This is a demo. Pick an account to continue — there is no
          password.
        </p>

        {error && (
          <p className="mt-4 border border-line bg-paper px-3 py-2 text-sm text-accent">
            {ERROR_MESSAGES[error] ?? "Could not sign in."}
          </p>
        )}

        <ul className="mt-6 flex flex-col gap-2">
          {accounts.length === 0 && (
            <li className="border border-line px-3 py-3 text-sm text-ink-muted">
              No accounts yet. Run <code>npm run db:seed</code> first.
            </li>
          )}
          {accounts.map((account) => (
            <li key={account.id}>
              <form action={signIn}>
                <input type="hidden" name="userId" value={account.id} />
                {next && <input type="hidden" name="next" value={next} />}
                <button
                  type="submit"
                  className="flex w-full items-center justify-between border border-line px-4 py-3 text-left text-sm transition-colors hover:border-ink"
                >
                  <span>
                    <span className="font-medium">{account.name}</span>
                    <span className="ml-2 text-ink-faint">
                      {account.email}
                    </span>
                  </span>
                  <span aria-hidden className="text-ink-faint">
                    →
                  </span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session";

const signInSchema = z.object({
  userId: z.string().uuid(),
  next: z.string().startsWith("/").optional(),
});

export async function signIn(formData: FormData) {
  const parsed = signInSchema.safeParse({
    userId: formData.get("userId"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    redirect("/sign-in?error=invalid");
  }

  const db = await getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, parsed.data.userId))
    .limit(1);

  if (!user) {
    redirect("/sign-in?error=unknown-account");
  }

  const token = await createSessionToken({ userId: user.id });

  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  redirect(parsed.data.next ?? "/documents");
}

export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
  redirect("/sign-in");
}

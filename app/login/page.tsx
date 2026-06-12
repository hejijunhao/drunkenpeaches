import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-semibold tracking-tight text-lg">
          🍑 Drunken Peaches
        </Link>
        <h1 className="mt-8 text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-stone-500">
          Sign in to see your club&apos;s lunches.
        </p>
        {error && (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mt-8">
          <LoginForm next={next} />
        </div>
        <p className="mt-4 text-sm text-stone-500">
          <Link href="/auth/forgot" className="underline underline-offset-4">
            Forgot your password?
          </Link>
        </p>
        <p className="mt-6 text-sm text-stone-500">
          Starting a new club?{" "}
          <Link href="/signup" className="underline underline-offset-4">
            Create it here
          </Link>
          . Members join by committee invitation only.
        </p>
      </div>
    </main>
  );
}

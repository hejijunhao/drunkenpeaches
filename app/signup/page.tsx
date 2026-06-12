import Link from "next/link";
import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Create your club" };

export default function SignupPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-semibold tracking-tight text-lg">
          🍑 Drunken Peaches
        </Link>
        <h1 className="mt-8 text-2xl font-semibold">Create your club</h1>
        <p className="mt-1 text-sm text-stone-500">
          You&apos;ll become the first committee admin and can invite members
          right away.
        </p>
        <div className="mt-8">
          <SignupForm />
        </div>
        <p className="mt-6 text-sm text-stone-500">
          Already a member?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

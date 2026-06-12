import Link from "next/link";
import type { Metadata } from "next";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-semibold tracking-tight text-lg">
          🍑 Drunken Peaches
        </Link>
        <h1 className="mt-8 text-2xl font-semibold">Forgot your password?</h1>
        <p className="mt-1 text-sm text-stone-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
        <div className="mt-8">
          <ForgotForm />
        </div>
        <p className="mt-6 text-sm text-stone-500">
          <Link href="/login" className="underline underline-offset-4">
            Back to log in
          </Link>
        </p>
      </div>
    </main>
  );
}

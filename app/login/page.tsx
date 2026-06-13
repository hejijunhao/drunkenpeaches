import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { FormError } from "@/components/form-error";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to see your club's lunches."
      footer={
        <>
          <p>
            <Link
              href="/auth/forgot"
              className="text-foreground underline underline-offset-4 hover:text-primary"
            >
              Forgot your password?
            </Link>
          </p>
          <p>
            Starting a new club?{" "}
            <Link
              href="/signup"
              className="text-foreground underline underline-offset-4 hover:text-primary"
            >
              Create it here
            </Link>
            . Members join by committee invitation only.
          </p>
        </>
      }
    >
      {error ? <FormError message={error} className="mb-4" /> : null}
      <LoginForm next={next} />
    </AuthShell>
  );
}

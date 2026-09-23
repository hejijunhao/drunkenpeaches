import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { FormError } from "@/components/form-error";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Members' entrance" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <AuthShell
      title="Members' entrance"
      description="Sign in to consult the book and the forthcoming luncheons."
      footer={
        <>
          <p>
            <Link
              href="/auth/forgot"
              className="text-foreground underline underline-offset-4 hover:text-primary"
            >
              Forgotten your password?
            </Link>
          </p>
          <p>
            Opening a new chapter?{" "}
            <Link
              href="/signup"
              className="text-foreground underline underline-offset-4 hover:text-primary"
            >
              Establish it here
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

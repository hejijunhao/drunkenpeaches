import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Create your club" };

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your club"
      description="You'll become the first committee admin and can invite members right away."
      footer={
        <p>
          Already a member?{" "}
          <Link
            href="/login"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            Log in
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}

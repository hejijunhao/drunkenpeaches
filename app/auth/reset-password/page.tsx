import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/forgot");

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <span className="font-semibold tracking-tight text-lg">
          🍑 Drunken Peaches
        </span>
        <h1 className="mt-8 text-2xl font-semibold">Choose a new password</h1>
        <div className="mt-8">
          <ResetPasswordForm />
        </div>
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SetPasswordForm } from "./set-password-form";

export const metadata: Metadata = { title: "Complete your profile" };

export default async function SetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("memberships")
    .select("full_name, clubs(name)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const clubName =
    (membership?.clubs as unknown as { name: string } | null)?.name ?? "your club";

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <span className="font-semibold tracking-tight text-lg">
          🍑 Drunken Peaches
        </span>
        <h1 className="mt-8 text-2xl font-semibold">Welcome to {clubName}</h1>
        <p className="mt-1 text-sm text-stone-500">
          Set a password and tell us a little about yourself.
        </p>
        <div className="mt-8">
          <SetPasswordForm defaultName={membership?.full_name ?? ""} />
        </div>
      </div>
    </main>
  );
}

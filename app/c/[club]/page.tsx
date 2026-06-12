import { redirect } from "next/navigation";

export default async function ClubRootPage({
  params,
}: {
  params: Promise<{ club: string }>;
}) {
  const { club } = await params;
  redirect(`/c/${club}/dashboard`);
}

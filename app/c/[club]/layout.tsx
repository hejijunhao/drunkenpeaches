import { AppNav } from "@/components/app-nav";
import { getClubContext } from "@/lib/club-context";

export default async function ClubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ club: string }>;
}) {
  const { club } = await params;
  const ctx = await getClubContext(club);

  return (
    <div className="flex-1 flex flex-col">
      <AppNav
        clubSlug={ctx.club.slug}
        clubName={ctx.club.name}
        memberName={ctx.membership.full_name}
        isCommittee={ctx.isCommittee}
        isWineMaster={ctx.isWineMaster}
      />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}

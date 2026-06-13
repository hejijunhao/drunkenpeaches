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
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}

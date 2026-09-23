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
    <div className="flex flex-1 flex-col">
      <AppNav
        clubSlug={ctx.club.slug}
        clubName={ctx.club.name}
        memberName={ctx.membership.full_name}
        isCommittee={ctx.isCommittee}
        isWineMaster={ctx.isWineMaster}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:px-6 md:pt-12 md:pb-16">
        {children}
      </main>
      <footer className="hidden md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between border-t border-border px-6 py-6 text-[0.625rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          <span>Drunken Peaches</span>
          <span>The book is kept.</span>
        </div>
      </footer>
    </div>
  );
}

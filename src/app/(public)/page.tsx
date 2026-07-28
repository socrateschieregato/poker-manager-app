import { RankingTable } from "@/components/ranking-table";
import { TournamentHistory } from "@/components/tournament-history";
import { getActiveSeasonRanking } from "@/lib/queries/rankings";
import { getActiveSeason, getSeasons } from "@/lib/queries/seasons";
import { getTournamentsWithResultsPage } from "@/lib/queries/tournaments";
import type { TournamentWithResults } from "@/types/database";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const { ranking, seasonName, seasonPot } = await getActiveSeasonRanking();
  const seasons = await getSeasons();
  const activeSeason = await getActiveSeason();

  const requestedPage = Math.max(1, Number(params.page) || 1);

  let tournaments: TournamentWithResults[] = [];
  let page = requestedPage;
  let totalPages = 1;

  if (activeSeason) {
    const result = await getTournamentsWithResultsPage(
      activeSeason.id,
      requestedPage,
      PAGE_SIZE
    );
    totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
    page = Math.min(requestedPage, totalPages);

    if (page !== requestedPage) {
      const clamped = await getTournamentsWithResultsPage(
        activeSeason.id,
        page,
        PAGE_SIZE
      );
      tournaments = clamped.tournaments;
    } else {
      tournaments = result.tournaments;
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ranking</h1>
          {seasonName && (
            <p className="text-muted-foreground mt-1">
              Temporada: <span className="text-foreground font-medium">{seasonName}</span>
            </p>
          )}
        </div>
        {seasons.length > 1 && (
          <Link
            href="/ranking"
            className="text-sm text-primary hover:underline"
          >
            Ver outras temporadas →
          </Link>
        )}
      </div>

      <RankingTable
        ranking={ranking}
        seasonPot={seasonPot}
      />

      <TournamentHistory
        tournaments={tournaments}
        page={page}
        totalPages={totalPages}
        buildPageHref={(p) => (p <= 1 ? "/" : `/?page=${p}`)}
      />
    </div>
  );
}

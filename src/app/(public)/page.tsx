import { RankingTable } from "@/components/ranking-table";
import { TournamentHistory } from "@/components/tournament-history";
import { getActiveSeasonRanking } from "@/lib/queries/rankings";
import { getActiveSeason, getSeasons } from "@/lib/queries/seasons";
import { getRecentTournamentsWithResults } from "@/lib/queries/tournaments";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { ranking, seasonName, seasonPot, seasonId } = await getActiveSeasonRanking();
  const seasons = await getSeasons();
  const activeSeason = await getActiveSeason();

  const recentTournaments = activeSeason
    ? await getRecentTournamentsWithResults(activeSeason.id, 5)
    : [];

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
        previewLimit={9}
        fullRankingHref={seasonId ? `/ranking?season=${seasonId}` : "/ranking"}
      />

      <TournamentHistory tournaments={recentTournaments} />
    </div>
  );
}

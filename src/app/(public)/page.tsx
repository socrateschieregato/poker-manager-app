import { RankingTable } from "@/components/ranking-table";
import { getActiveSeasonRanking } from "@/lib/queries/rankings";
import { getSeasons } from "@/lib/queries/seasons";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { ranking, seasonName } = await getActiveSeasonRanking();
  const seasons = await getSeasons();

  return (
    <div className="space-y-6">
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

      <RankingTable ranking={ranking} />
    </div>
  );
}

import { RankingTable } from "@/components/ranking-table";
import { getSeasonRanking } from "@/lib/queries/rankings";
import { getSeasons } from "@/lib/queries/seasons";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ season?: string }>;
}

export default async function RankingPage({ searchParams }: Props) {
  const params = await searchParams;
  const seasons = await getSeasons();
  const selectedSeasonId = params.season || seasons.find((s) => s.is_active)?.id || seasons[0]?.id;
  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId);
  const ranking = selectedSeasonId ? await getSeasonRanking(selectedSeasonId) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Ranking por Temporada</h1>
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Voltar
        </Link>
      </div>

      {seasons.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma temporada cadastrada.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {seasons.map((season) => (
              <Link
                key={season.id}
                href={`/ranking?season=${season.id}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  season.id === selectedSeasonId
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
              >
                {season.name}
                {season.is_active && " (Ativa)"}
              </Link>
            ))}
          </div>

          <RankingTable
            ranking={ranking}
            title={`Classificação Geral — ${selectedSeason?.name ?? ""}`}
          />
        </>
      )}
    </div>
  );
}

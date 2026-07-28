import { RankingTable } from "@/components/ranking-table";
import { TournamentHistory } from "@/components/tournament-history";
import { getSeasonRanking, getSeasonPot } from "@/lib/queries/rankings";
import { getSeasons } from "@/lib/queries/seasons";
import { getTournamentsWithResultsPage } from "@/lib/queries/tournaments";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

interface Props {
  searchParams: Promise<{ season?: string; page?: string }>;
}

export default async function RankingPage({ searchParams }: Props) {
  const params = await searchParams;
  const seasons = await getSeasons();
  const selectedSeasonId = params.season || seasons.find((s) => s.is_active)?.id || seasons[0]?.id;
  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId);
  const requestedPage = Math.max(1, Number(params.page) || 1);

  const [ranking, seasonPot, tournamentsPage] = await Promise.all([
    selectedSeasonId ? getSeasonRanking(selectedSeasonId) : Promise.resolve([]),
    selectedSeasonId ? getSeasonPot(selectedSeasonId) : Promise.resolve(0),
    selectedSeasonId
      ? getTournamentsWithResultsPage(selectedSeasonId, requestedPage, PAGE_SIZE)
      : Promise.resolve({ tournaments: [], total: 0 }),
  ]);

  let totalPages = Math.max(1, Math.ceil(tournamentsPage.total / PAGE_SIZE));
  let page = Math.min(requestedPage, totalPages);
  let tournaments = tournamentsPage.tournaments;

  if (selectedSeasonId && page !== requestedPage) {
    const clamped = await getTournamentsWithResultsPage(
      selectedSeasonId,
      page,
      PAGE_SIZE
    );
    tournaments = clamped.tournaments;
    totalPages = Math.max(1, Math.ceil(clamped.total / PAGE_SIZE));
  }

  return (
    <div className="space-y-8">
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
            seasonPot={seasonPot}
          />

          <TournamentHistory
            tournaments={tournaments}
            page={page}
            totalPages={totalPages}
            buildPageHref={(p) => {
              const qs = new URLSearchParams();
              if (selectedSeasonId) qs.set("season", selectedSeasonId);
              if (p > 1) qs.set("page", String(p));
              const query = qs.toString();
              return query ? `/ranking?${query}` : "/ranking";
            }}
          />
        </>
      )}
    </div>
  );
}

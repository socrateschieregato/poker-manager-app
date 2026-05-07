import { RankingTable } from "@/components/ranking-table";
import { getSeasonRanking, getSeasonPot } from "@/lib/queries/rankings";
import { getSeasons } from "@/lib/queries/seasons";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ season?: string }>;
}

export default async function ClassificacaoCompletaPage({ searchParams }: Props) {
  const params = await searchParams;
  const seasons = await getSeasons();
  const selectedSeasonId =
    params.season || seasons.find((s) => s.is_active)?.id || seasons[0]?.id;
  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId);

  if (seasons.length === 0 || !selectedSeasonId) {
    return (
      <div className="space-y-4">
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Voltar
        </Link>
        <p className="text-muted-foreground">Nenhuma temporada cadastrada.</p>
      </div>
    );
  }

  const [ranking, seasonPot] = await Promise.all([
    getSeasonRanking(selectedSeasonId),
    getSeasonPot(selectedSeasonId),
  ]);

  return (
    <div className="space-y-4">
      <Link href="/" className="text-sm text-primary hover:underline inline-block">
        ← Voltar ao início
      </Link>
      <RankingTable
        ranking={ranking}
        title={`Classificação Geral — ${selectedSeason?.name ?? ""}`}
        seasonPot={seasonPot}
      />
    </div>
  );
}

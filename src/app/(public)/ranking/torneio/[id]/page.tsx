import { TournamentResultsTable } from "@/components/tournament-results-table";
import { getTournament } from "@/lib/queries/tournaments";
import { getTournamentResults } from "@/lib/queries/results";
import { formatCurrency } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, DollarSign, Trophy, Users } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export default async function TournamentDetailPage({ params }: Props) {
  const { id } = await params;
  const tournament = await getTournament(id);

  if (!tournament) {
    notFound();
  }

  const results = await getTournamentResults(id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {tournament.name}
          </h1>
          {tournament.season && (
            <p className="text-muted-foreground mt-1">
              Temporada:{" "}
              <span className="text-foreground font-medium">
                {tournament.season.name}
              </span>
            </p>
          )}
        </div>
        <Link
          href={
            tournament.season_id
              ? `/ranking?season=${tournament.season_id}`
              : "/ranking"
          }
          className="text-sm text-primary hover:underline"
        >
          ← Voltar ao ranking
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
            <Calendar className="h-3.5 w-3.5" />
            Data
          </div>
          <p className="font-semibold">{formatDate(tournament.date)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
            <DollarSign className="h-3.5 w-3.5" />
            Buy-in
          </div>
          <p className="font-semibold">
            {formatCurrency(Number(tournament.buy_in))}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
            <Trophy className="h-3.5 w-3.5" />
            Premiação
          </div>
          <p className="font-semibold text-[#22C55E]">
            {formatCurrency(Number(tournament.prize_pool))}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
            <Users className="h-3.5 w-3.5" />
            Jogadores
          </div>
          <p className="font-semibold">{results.length}</p>
        </div>
      </div>

      <TournamentResultsTable
        results={results}
        title={`Classificação — ${tournament.name}`}
      />
    </div>
  );
}

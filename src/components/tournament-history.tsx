import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PositionBadge } from "@/components/position-badge";
import { formatCurrency } from "@/lib/utils";
import type { TournamentWithResults } from "@/types/database";
import { Calendar, ChevronRight } from "lucide-react";

interface TournamentHistoryProps {
  tournaments: TournamentWithResults[];
  /** Máximo de classificados exibidos por torneio na prévia (padrão: 9). */
  maxResultsPerTournament?: number;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export function TournamentHistory({
  tournaments,
  maxResultsPerTournament = 9,
}: TournamentHistoryProps) {
  if (tournaments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-[#38BDF8]">
        Histórico Semanal
      </h2>

      <div className="space-y-4">
        {tournaments.map((tournament) => {
          const previewResults = tournament.results.slice(0, maxResultsPerTournament);

          return (
          <Link
            key={tournament.id}
            href={`/ranking/torneio/${tournament.id}`}
            className="block group"
          >
            <div className="rounded-xl border border-border bg-card overflow-hidden transition-colors hover:border-primary/50">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">
                    {tournament.name}
                    <span className="text-muted-foreground font-normal ml-2 text-sm">
                      {formatDate(tournament.date)}
                    </span>
                  </h3>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              {/* Desktop */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="w-16 text-xs uppercase tracking-wider text-muted-foreground">
                        Pos.
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                        Jogador
                      </TableHead>
                      <TableHead className="text-center text-xs uppercase tracking-wider text-muted-foreground">
                        Pontos
                      </TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">
                        Premiação
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewResults.map((result) => (
                      <TableRow
                        key={result.id}
                        className="border-border hover:bg-white/[0.02] transition-colors"
                      >
                        <TableCell>
                          <PositionBadge position={result.position} />
                        </TableCell>
                        <TableCell className="font-medium text-[#38BDF8]">
                          {result.player?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {result.points}
                        </TableCell>
                        <TableCell className="text-right font-medium text-[#22C55E]">
                          {Number(result.prize_won) > 0
                            ? formatCurrency(Number(result.prize_won))
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile */}
              <div className="md:hidden divide-y divide-border">
                {previewResults.map((result) => (
                  <div
                    key={result.id}
                    className="px-4 py-2.5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <PositionBadge position={result.position} />
                      <span className="font-medium text-[#38BDF8]">
                        {result.player?.name ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-bold">{result.points} pts</span>
                      {Number(result.prize_won) > 0 && (
                        <span className="text-[#22C55E] font-medium">
                          {formatCurrency(Number(result.prize_won))}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Link>
          );
        })}
      </div>
    </div>
  );
}

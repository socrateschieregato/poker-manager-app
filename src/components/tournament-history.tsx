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
import type { Result, TournamentWithResults } from "@/types/database";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface TournamentHistoryProps {
  tournaments: TournamentWithResults[];
  /** Máximo de classificados exibidos por torneio na prévia (padrão: 9). */
  maxResultsPerTournament?: number;
  page?: number;
  totalPages?: number;
  buildPageHref?: (page: number) => string;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function resultTotal(result: Result): number {
  return result.points + (result.participation_points ?? 0);
}

export function TournamentHistory({
  tournaments,
  maxResultsPerTournament = 9,
  page = 1,
  totalPages = 1,
  buildPageHref,
}: TournamentHistoryProps) {
  if (tournaments.length === 0) {
    return null;
  }

  const showPagination = Boolean(buildPageHref) && totalPages > 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

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
                        Pontuação
                      </TableHead>
                      <TableHead className="text-center text-xs uppercase tracking-wider text-muted-foreground">
                        Participação
                      </TableHead>
                      <TableHead className="text-center text-xs uppercase tracking-wider text-muted-foreground">
                        Total
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
                        <TableCell className="text-center">
                          {result.points}
                        </TableCell>
                        <TableCell className="text-center">
                          {result.participation_points ?? 0}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {resultTotal(result)}
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
                      <span className="font-bold">{resultTotal(result)} pts</span>
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

      {showPagination && buildPageHref && (
        <div className="flex items-center justify-center gap-4 pt-2">
          {hasPrev ? (
            <Link
              href={buildPageHref(page - 1)}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground opacity-50">
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </span>
          )}

          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>

          {hasNext ? (
            <Link
              href={buildPageHref(page + 1)}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground opacity-50">
              Próxima
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

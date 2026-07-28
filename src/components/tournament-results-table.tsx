import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PositionBadge } from "@/components/position-badge";
import { formatCurrency } from "@/lib/utils";
import type { Result } from "@/types/database";

interface TournamentResultsTableProps {
  results: Result[];
  title?: string;
}

function resultTotal(result: Result): number {
  return result.points + (result.participation_points ?? 0);
}

export function TournamentResultsTable({
  results,
  title = "Resultado do Torneio",
}: TournamentResultsTableProps) {
  const totalPrize = results.reduce(
    (sum, r) => sum + Number(r.prize_won),
    0
  );

  return (
    <div className="w-full rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-xl font-semibold italic tracking-wide">{title}</h2>
      </div>

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
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
            {results.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum resultado cadastrado ainda.
                </TableCell>
              </TableRow>
            )}
            {results.map((result) => (
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
                <TableCell className="text-center font-bold text-lg">
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
          {results.length > 0 && totalPrize > 0 && (
            <TableFooter className="bg-card border-t border-border">
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="text-right font-bold uppercase tracking-wider text-sm"
                >
                  Total Premiação:
                </TableCell>
                <TableCell className="text-right font-bold text-[#22C55E] text-lg">
                  {formatCurrency(totalPrize)}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-border">
        {results.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">
            Nenhum resultado cadastrado ainda.
          </div>
        )}
        {results.map((result) => (
          <div key={result.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PositionBadge position={result.position} />
                <span className="font-medium text-[#38BDF8]">
                  {result.player?.name ?? "—"}
                </span>
              </div>
              <span className="text-lg font-bold">{resultTotal(result)} pts</span>
            </div>
            <div className="pl-6 text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
              <span>
                Pontuação: <span className="text-foreground">{result.points}</span>
              </span>
              <span>
                Participação:{" "}
                <span className="text-foreground">
                  {result.participation_points ?? 0}
                </span>
              </span>
            </div>
            {Number(result.prize_won) > 0 && (
              <div className="pl-6 text-sm">
                <span className="text-muted-foreground">Premiação: </span>
                <span className="text-[#22C55E] font-medium">
                  {formatCurrency(Number(result.prize_won))}
                </span>
              </div>
            )}
          </div>
        ))}
        {results.length > 0 && totalPrize > 0 && (
          <div className="p-4 flex justify-between items-center">
            <span className="font-bold uppercase tracking-wider text-sm">
              Total Premiação:
            </span>
            <span className="font-bold text-[#22C55E] text-lg">
              {formatCurrency(totalPrize)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

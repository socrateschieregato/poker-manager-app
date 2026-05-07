import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PositionBadge } from "@/components/position-badge";
import { formatCurrency, formatPoints } from "@/lib/utils";
import type { RankingEntry } from "@/types/database";

interface RankingTableProps {
  ranking: RankingEntry[];
  title?: string;
  seasonPot?: number;
}

export function RankingTable({ ranking, title = "Classificação Geral", seasonPot = 0 }: RankingTableProps) {
  return (
    <div className="w-full rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-semibold italic tracking-wide">{title}</h2>
        {seasonPot > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-[#FACC15]/10 border border-[#FACC15]/30 px-4 py-1.5">
            <span className="text-sm font-medium text-[#FACC15] uppercase tracking-wider">POT do Ranking:</span>
            <span className="text-lg font-bold text-[#FACC15]">{formatCurrency(seasonPot)}</span>
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-16 text-xs uppercase tracking-wider text-muted-foreground">Pos.</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Nome</TableHead>
              <TableHead className="text-center text-xs uppercase tracking-wider text-muted-foreground">Pontos Totais</TableHead>
              <TableHead className="text-center text-xs uppercase tracking-wider text-muted-foreground">Pontos (Anterior)</TableHead>
              <TableHead className="text-center text-xs uppercase tracking-wider text-muted-foreground">Presenças</TableHead>
              <TableHead className="text-center text-xs uppercase tracking-wider text-muted-foreground">Vitórias</TableHead>
              <TableHead className="text-center text-xs uppercase tracking-wider text-muted-foreground">Pontos no Dia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranking.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nenhum resultado cadastrado ainda.
                </TableCell>
              </TableRow>
            )}
            {ranking.map((entry, index) => (
              <TableRow
                key={entry.player_id}
                className="border-border hover:bg-white/[0.02] transition-colors"
              >
                <TableCell>
                  <PositionBadge position={index + 1} />
                </TableCell>
                <TableCell className="font-medium text-[#38BDF8]">
                  {entry.player_name}
                </TableCell>
                <TableCell className="text-center font-bold text-lg">
                  {entry.total_points}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {entry.previous_points}
                </TableCell>
                <TableCell className="text-center">
                  {entry.attendances}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {entry.victories}
                </TableCell>
                <TableCell className="text-center">
                  <span className={Number(entry.points_today) > 0 ? "text-[#22C55E] font-medium" : "text-muted-foreground"}>
                    {Number(entry.points_today) > 0 ? formatPoints(Number(entry.points_today)) : "0"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-border">
        {seasonPot > 0 && (
          <div className="p-4 flex justify-between items-center bg-[#FACC15]/5">
            <span className="font-bold uppercase tracking-wider text-sm text-[#FACC15]">POT do Ranking:</span>
            <span className="font-bold text-[#FACC15] text-lg">{formatCurrency(seasonPot)}</span>
          </div>
        )}
        {ranking.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">
            Nenhum resultado cadastrado ainda.
          </div>
        )}
        {ranking.map((entry, index) => (
          <div key={entry.player_id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PositionBadge position={index + 1} />
                <span className="font-medium text-[#38BDF8]">{entry.player_name}</span>
              </div>
              <span className="text-xl font-bold">{entry.total_points} pts</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm pl-6">
              <div className="text-muted-foreground">Anterior:</div>
              <div>{entry.previous_points}</div>
              <div className="text-muted-foreground">Presenças:</div>
              <div>{entry.attendances}</div>
              <div className="text-muted-foreground">Vitórias:</div>
              <div className="font-semibold">{entry.victories}</div>
              <div className="text-muted-foreground">Pontos no dia:</div>
              <div className={Number(entry.points_today) > 0 ? "text-[#22C55E] font-medium" : ""}>
                {Number(entry.points_today) > 0 ? formatPoints(Number(entry.points_today)) : "0"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

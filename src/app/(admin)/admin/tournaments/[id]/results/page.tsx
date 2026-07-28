"use client";

import { useEffect, useState, useTransition, use, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveResults } from "@/lib/actions/results";
import {
  getDefaultParticipationPoints,
  getDefaultPositionPoints,
} from "@/lib/scoring";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, Loader2, ArrowLeft, Trophy } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import type { Player, Tournament, Result, TournamentPrize } from "@/types/database";

interface ResultRow {
  key: string;
  player_id: string;
  position: number;
  points: number;
  participation_points: number;
  prize_won: number;
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tournamentId } = use(params);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [prizesMap, setPrizesMap] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const getPrizeForPosition = useCallback(
    (position: number) => prizesMap.get(position) ?? 0,
    [prizesMap]
  );

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const [tournamentRes, playersRes, resultsRes, prizesRes] = await Promise.all([
        supabase.from("tournaments").select("*, season:seasons(*)").eq("id", tournamentId).single(),
        supabase.from("players").select("*").order("name"),
        supabase
          .from("results")
          .select("*, player:players(*)")
          .eq("tournament_id", tournamentId)
          .order("position"),
        supabase
          .from("tournament_prizes")
          .select("*")
          .eq("tournament_id", tournamentId)
          .order("position"),
      ]);

      setTournament(tournamentRes.data);
      setPlayers(playersRes.data ?? []);

      const prizeMap = new Map<number, number>();
      (prizesRes.data ?? []).forEach((p: TournamentPrize) => {
        prizeMap.set(p.position, Number(p.amount));
      });
      setPrizesMap(prizeMap);

      if (resultsRes.data && resultsRes.data.length > 0) {
        setRows(
          resultsRes.data.map((r: Result) => ({
            key: crypto.randomUUID(),
            player_id: r.player_id,
            position: r.position,
            points: r.points,
            participation_points: r.participation_points ?? getDefaultParticipationPoints(),
            prize_won: Number(r.prize_won),
          }))
        );
      }
      setLoading(false);
    }
    load();
  }, [tournamentId]);

  function addRow() {
    const nextPosition = rows.length + 1;
    setRows([
      ...rows,
      {
        key: crypto.randomUUID(),
        player_id: "",
        position: nextPosition,
        points: getDefaultPositionPoints(nextPosition),
        participation_points: getDefaultParticipationPoints(),
        prize_won: getPrizeForPosition(nextPosition),
      },
    ]);
  }

  function removeRow(key: string) {
    const updated = rows.filter((r) => r.key !== key);
    setRows(
      updated.map((r, i) => {
        const position = i + 1;
        return {
          ...r,
          position,
          points: getDefaultPositionPoints(position),
          participation_points: getDefaultParticipationPoints(),
          prize_won: r.prize_won,
        };
      })
    );
  }

  function updateRow(key: string, field: keyof ResultRow, value: string | number | null) {
    setRows(
      rows.map((r) => (r.key === key ? { ...r, [field]: value ?? "" } : r))
    );
  }

  async function handleSave() {
    if (rows.length === 0) {
      toast.error("Adicione pelo menos um resultado");
      return;
    }

    const invalid = rows.find((r) => !r.player_id);
    if (invalid) {
      toast.error("Selecione um jogador para cada posição");
      return;
    }

    const playerIds = rows.map((r) => r.player_id);
    const hasDuplicate = new Set(playerIds).size !== playerIds.length;
    if (hasDuplicate) {
      toast.error("Um jogador não pode aparecer mais de uma vez");
      return;
    }

    startTransition(async () => {
      const result = await saveResults(
        tournamentId,
        rows.map((r) => ({
          player_id: r.player_id,
          position: r.position,
          points: r.points,
          participation_points: r.participation_points,
          prize_won: r.prize_won,
        }))
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Resultados salvos com sucesso!");
    });
  }

  const usedPlayerIds = rows.map((r) => r.player_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Torneio não encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/admin/tournaments" />}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            Resultados
          </h1>
          <p className="text-muted-foreground mt-1">
            {tournament.name} — {new Date(tournament.date + "T00:00:00").toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      {prizesMap.size > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Premiação Definida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Array.from(prizesMap.entries())
                .sort(([a], [b]) => a - b)
                .map(([position, amount]) => (
                  <div
                    key={position}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm"
                  >
                    <span className="font-bold">{position}º</span>
                    <span className="text-[#22C55E]">{formatCurrency(amount)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Classificação do Torneio</CardTitle>
          <Button onClick={addRow} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum resultado adicionado.</p>
              <p className="text-sm mt-1">Clique em &quot;Adicionar&quot; para começar.</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="w-20 text-xs uppercase">Pos.</TableHead>
                      <TableHead className="text-xs uppercase">Jogador</TableHead>
                      <TableHead className="w-28 text-xs uppercase">Pontuação</TableHead>
                      <TableHead className="w-28 text-xs uppercase">Participação</TableHead>
                      <TableHead className="w-20 text-xs uppercase">Total</TableHead>
                      <TableHead className="w-36 text-xs uppercase">Prêmio (R$)</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.key} className="border-border">
                        <TableCell className="font-bold text-lg">
                          {row.position}º
                        </TableCell>
                        <TableCell>
                          <Select
                            value={row.player_id}
                            onValueChange={(v) => updateRow(row.key, "player_id", v)}
                          >
                            <SelectTrigger className="bg-input border-border">
                              <SelectValue placeholder="Selecionar jogador">
                                {players.find((p) => p.id === row.player_id)?.name}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              {players
                                .filter(
                                  (p) =>
                                    p.id === row.player_id ||
                                    !usedPlayerIds.includes(p.id)
                                )
                                .map((player) => (
                                  <SelectItem key={player.id} value={player.id}>
                                    {player.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={row.points}
                            onChange={(e) =>
                              updateRow(row.key, "points", parseInt(e.target.value) || 0)
                            }
                            className="bg-input border-border w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={row.participation_points}
                            onChange={(e) =>
                              updateRow(
                                row.key,
                                "participation_points",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="bg-input border-border w-24"
                          />
                        </TableCell>
                        <TableCell className="font-bold">
                          {row.points + row.participation_points}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.prize_won}
                            onChange={(e) =>
                              updateRow(
                                row.key,
                                "prize_won",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="bg-input border-border w-32"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRow(row.key)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile */}
              <div className="md:hidden space-y-4">
                {rows.map((row) => (
                  <div
                    key={row.key}
                    className="p-4 rounded-lg border border-border bg-background space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">{row.position}º lugar</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(row.key)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Jogador</Label>
                      <Select
                        value={row.player_id}
                        onValueChange={(v) => updateRow(row.key, "player_id", v)}
                      >
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue placeholder="Selecionar jogador">
                            {players.find((p) => p.id === row.player_id)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {players
                            .filter(
                              (p) =>
                                p.id === row.player_id ||
                                !usedPlayerIds.includes(p.id)
                            )
                            .map((player) => (
                              <SelectItem key={player.id} value={player.id}>
                                {player.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Pontuação</Label>
                        <Input
                          type="number"
                          min="0"
                          value={row.points}
                          onChange={(e) =>
                            updateRow(row.key, "points", parseInt(e.target.value) || 0)
                          }
                          className="bg-input border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Participação</Label>
                        <Input
                          type="number"
                          min="0"
                          value={row.participation_points}
                          onChange={(e) =>
                            updateRow(
                              row.key,
                              "participation_points",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="bg-input border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Total</Label>
                        <p className="h-9 flex items-center font-bold">
                          {row.points + row.participation_points}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Prêmio (R$)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.prize_won}
                          onChange={(e) =>
                            updateRow(
                              row.key,
                              "prize_won",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="bg-input border-border"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {rows.length > 0 && (
            <div className="flex justify-end mt-6">
              <Button onClick={handleSave} disabled={isPending} size="lg">
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Resultados
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createTournament,
  updateTournament,
  deleteTournament,
} from "@/lib/actions/tournaments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Trophy, Loader2, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import type { Tournament, Season } from "@/types/database";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<(Tournament & { season?: Season })[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  async function loadData() {
    const supabase = createClient();
    const [tournamentsRes, seasonsRes] = await Promise.all([
      supabase
        .from("tournaments")
        .select("*, season:seasons(*)")
        .order("date", { ascending: false }),
      supabase.from("seasons").select("*").order("start_date", { ascending: false }),
    ]);
    setTournaments(tournamentsRes.data ?? []);
    setSeasons(seasonsRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleEdit(tournament: Tournament) {
    setEditingTournament(tournament);
    setSelectedSeasonId(tournament.season_id);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditingTournament(null);
    const activeSeason = seasons.find((s) => s.is_active);
    setSelectedSeasonId(activeSeason?.id ?? seasons[0]?.id ?? "");
    setDialogOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    formData.set("season_id", selectedSeasonId);

    startTransition(async () => {
      const result = editingTournament
        ? await updateTournament(editingTournament.id, formData)
        : await createTournament(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(editingTournament ? "Torneio atualizado!" : "Torneio criado!");
      setDialogOpen(false);
      setEditingTournament(null);
      loadData();
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza? Os resultados deste torneio serão excluídos.")) return;

    startTransition(async () => {
      const result = await deleteTournament(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Torneio excluído!");
      loadData();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            Torneios
          </h1>
          <p className="text-muted-foreground mt-1">{tournaments.length} torneios</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            onClick={handleNew}
            disabled={seasons.length === 0}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-8 gap-1.5 px-2.5 transition-all hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Novo Torneio
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>
                {editingTournament ? "Editar Torneio" : "Novo Torneio"}
              </DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingTournament?.name ?? ""}
                  placeholder="Ex: Torneio #1"
                  required
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Temporada</Label>
                <Select value={selectedSeasonId} onValueChange={(v) => setSelectedSeasonId(v ?? "")}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Selecione a temporada">
                      {(() => {
                        const s = seasons.find((s) => s.id === selectedSeasonId);
                        return s ? `${s.name}${s.is_active ? " (Ativa)" : ""}` : undefined;
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {seasons.map((season) => (
                      <SelectItem key={season.id} value={season.id}>
                        {season.name} {season.is_active ? "(Ativa)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={editingTournament?.date ?? ""}
                  required
                  className="bg-input border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buy_in">Buy-in (R$)</Label>
                  <Input
                    id="buy_in"
                    name="buy_in"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingTournament?.buy_in ?? 0}
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prize_pool">Premiação (R$)</Label>
                  <Input
                    id="prize_pool"
                    name="prize_pool"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingTournament?.prize_pool ?? 0}
                    className="bg-input border-border"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingTournament ? (
                    "Salvar"
                  ) : (
                    "Criar"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {seasons.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
          Crie uma temporada primeiro antes de adicionar torneios.
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Nome</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Temporada</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Data</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Buy-in</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Premiação</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground w-40">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : tournaments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum torneio cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              tournaments.map((tournament) => (
                <TableRow key={tournament.id} className="border-border">
                  <TableCell className="font-medium">{tournament.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {tournament.season?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(tournament.date + "T00:00:00").toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>{formatCurrency(tournament.buy_in)}</TableCell>
                  <TableCell className="text-[#22C55E]">
                    {formatCurrency(tournament.prize_pool)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        render={<Link href={`/admin/tournaments/${tournament.id}/results`} />}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                      >
                        <ClipboardList className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(tournament)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tournament.id)}
                        disabled={isPending}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

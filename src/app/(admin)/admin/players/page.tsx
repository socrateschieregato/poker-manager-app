"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createPlayer, updatePlayer, deletePlayer } from "@/lib/actions/players";
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
import { Plus, Pencil, Trash2, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Player } from "@/types/database";

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isPending, startTransition] = useTransition();

  async function loadPlayers() {
    const supabase = createClient();
    const { data } = await supabase.from("players").select("*").order("name");
    setPlayers(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadPlayers();
  }, []);

  function handleEdit(player: Player) {
    setEditingPlayer(player);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditingPlayer(null);
    setDialogOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = editingPlayer
        ? await updatePlayer(editingPlayer.id, formData)
        : await createPlayer(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(editingPlayer ? "Jogador atualizado!" : "Jogador criado!");
      setDialogOpen(false);
      setEditingPlayer(null);
      loadPlayers();
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este jogador?")) return;

    startTransition(async () => {
      const result = await deletePlayer(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Jogador excluído!");
      loadPlayers();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Jogadores
          </h1>
          <p className="text-muted-foreground mt-1">{players.length} jogadores cadastrados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            onClick={handleNew}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-8 gap-1.5 px-2.5 transition-all hover:bg-primary/80"
          >
            <Plus className="h-4 w-4" />
            Novo Jogador
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>
                {editingPlayer ? "Editar Jogador" : "Novo Jogador"}
              </DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingPlayer?.name ?? ""}
                  placeholder="Nome do jogador"
                  required
                  className="bg-input border-border"
                />
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
                  ) : editingPlayer ? (
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

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Nome</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                  Nenhum jogador cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              players.map((player) => (
                <TableRow key={player.id} className="border-border">
                  <TableCell className="font-medium text-[#38BDF8]">{player.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(player)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(player.id)}
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

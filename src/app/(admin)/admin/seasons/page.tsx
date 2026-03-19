"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createSeason, updateSeason, deleteSeason } from "@/lib/actions/seasons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Pencil, Trash2, CalendarDays, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Season } from "@/types/database";

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [isPending, startTransition] = useTransition();

  async function loadSeasons() {
    const supabase = createClient();
    const { data } = await supabase
      .from("seasons")
      .select("*")
      .order("start_date", { ascending: false });
    setSeasons(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadSeasons();
  }, []);

  function handleEdit(season: Season) {
    setEditingSeason(season);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditingSeason(null);
    setDialogOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = editingSeason
        ? await updateSeason(editingSeason.id, formData)
        : await createSeason(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(editingSeason ? "Temporada atualizada!" : "Temporada criada!");
      setDialogOpen(false);
      setEditingSeason(null);
      loadSeasons();
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza? Todos os torneios e resultados desta temporada serão excluídos.")) return;

    startTransition(async () => {
      const result = await deleteSeason(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Temporada excluída!");
      loadSeasons();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            Temporadas
          </h1>
          <p className="text-muted-foreground mt-1">{seasons.length} temporadas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            onClick={handleNew}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-8 gap-1.5 px-2.5 transition-all hover:bg-primary/80"
          >
            <Plus className="h-4 w-4" />
            Nova Temporada
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>
                {editingSeason ? "Editar Temporada" : "Nova Temporada"}
              </DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingSeason?.name ?? ""}
                  placeholder="Ex: Temporada 2026"
                  required
                  className="bg-input border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Início</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    defaultValue={editingSeason?.start_date ?? ""}
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Fim (opcional)</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    defaultValue={editingSeason?.end_date ?? ""}
                    className="bg-input border-border"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  value="true"
                  defaultChecked={editingSeason?.is_active ?? true}
                  className="rounded border-border"
                />
                <Label htmlFor="is_active" className="text-sm font-normal cursor-pointer">
                  Temporada ativa (aparece na página principal)
                </Label>
              </div>
              <input type="hidden" name="is_active" value="false" />
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
                  ) : editingSeason ? (
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
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Período</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : seasons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Nenhuma temporada cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              seasons.map((season) => (
                <TableRow key={season.id} className="border-border">
                  <TableCell className="font-medium">{season.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(season.start_date + "T00:00:00").toLocaleDateString("pt-BR")}
                    {season.end_date &&
                      ` — ${new Date(season.end_date + "T00:00:00").toLocaleDateString("pt-BR")}`}
                  </TableCell>
                  <TableCell>
                    {season.is_active ? (
                      <Badge className="bg-[#22C55E]/15 text-[#22C55E] hover:bg-[#22C55E]/20 border-0">
                        Ativa
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="border-0">
                        Inativa
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(season)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(season.id)}
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

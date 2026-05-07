"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface PrizeInput {
  position: number;
  amount: number;
}

export async function createTournament(formData: FormData) {
  const name = formData.get("name") as string;
  const seasonId = formData.get("season_id") as string;
  const date = formData.get("date") as string;
  const buyIn = parseFloat(formData.get("buy_in") as string) || 0;
  const prizePool = parseFloat(formData.get("prize_pool") as string) || 0;
  const potContribution = parseFloat(formData.get("pot_contribution") as string) || 0;
  const prizesJson = formData.get("prizes") as string;

  if (!name?.trim()) return { error: "Nome é obrigatório" };
  if (!seasonId) return { error: "Temporada é obrigatória" };
  if (!date) return { error: "Data é obrigatória" };

  const supabase = await createClient();
  const { data: tournament, error } = await supabase
    .from("tournaments")
    .insert({
      name: name.trim(),
      season_id: seasonId,
      date,
      buy_in: buyIn,
      prize_pool: prizePool,
      pot_contribution: potContribution,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (prizesJson && tournament) {
    const prizes: PrizeInput[] = JSON.parse(prizesJson);
    if (prizes.length > 0) {
      const rows = prizes.map((p) => ({
        tournament_id: tournament.id,
        position: p.position,
        amount: p.amount,
      }));
      const { error: prizesError } = await supabase
        .from("tournament_prizes")
        .insert(rows);
      if (prizesError) return { error: prizesError.message };
    }
  }

  revalidatePath("/admin/tournaments");
  revalidatePath("/");
  return { success: true };
}

export async function updateTournament(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const seasonId = formData.get("season_id") as string;
  const date = formData.get("date") as string;
  const buyIn = parseFloat(formData.get("buy_in") as string) || 0;
  const prizePool = parseFloat(formData.get("prize_pool") as string) || 0;
  const potContribution = parseFloat(formData.get("pot_contribution") as string) || 0;
  const prizesJson = formData.get("prizes") as string;

  if (!name?.trim()) return { error: "Nome é obrigatório" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("tournaments")
    .update({
      name: name.trim(),
      season_id: seasonId,
      date,
      buy_in: buyIn,
      prize_pool: prizePool,
      pot_contribution: potContribution,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  if (prizesJson) {
    const { error: deleteError } = await supabase
      .from("tournament_prizes")
      .delete()
      .eq("tournament_id", id);
    if (deleteError) return { error: deleteError.message };

    const prizes: PrizeInput[] = JSON.parse(prizesJson);
    if (prizes.length > 0) {
      const rows = prizes.map((p) => ({
        tournament_id: id,
        position: p.position,
        amount: p.amount,
      }));
      const { error: prizesError } = await supabase
        .from("tournament_prizes")
        .insert(rows);
      if (prizesError) return { error: prizesError.message };
    }
  }

  revalidatePath("/admin/tournaments");
  revalidatePath("/");
  return { success: true };
}

export async function deleteTournament(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tournaments").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/tournaments");
  revalidatePath("/");
  return { success: true };
}

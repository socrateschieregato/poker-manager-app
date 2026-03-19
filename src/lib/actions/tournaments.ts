"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTournament(formData: FormData) {
  const name = formData.get("name") as string;
  const seasonId = formData.get("season_id") as string;
  const date = formData.get("date") as string;
  const buyIn = parseFloat(formData.get("buy_in") as string) || 0;
  const prizePool = parseFloat(formData.get("prize_pool") as string) || 0;

  if (!name?.trim()) return { error: "Nome é obrigatório" };
  if (!seasonId) return { error: "Temporada é obrigatória" };
  if (!date) return { error: "Data é obrigatória" };

  const supabase = await createClient();
  const { error } = await supabase.from("tournaments").insert({
    name: name.trim(),
    season_id: seasonId,
    date,
    buy_in: buyIn,
    prize_pool: prizePool,
  });

  if (error) return { error: error.message };
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
    })
    .eq("id", id);

  if (error) return { error: error.message };
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

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface ResultInput {
  player_id: string;
  position: number;
  points: number;
  prize_won: number;
}

export async function saveResults(tournamentId: string, results: ResultInput[]) {
  if (!results.length) return { error: "Adicione pelo menos um resultado" };

  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("results")
    .delete()
    .eq("tournament_id", tournamentId);

  if (deleteError) return { error: deleteError.message };

  const rows = results.map((r) => ({
    tournament_id: tournamentId,
    player_id: r.player_id,
    position: r.position,
    points: r.points,
    prize_won: r.prize_won,
  }));

  const { error } = await supabase.from("results").insert(rows);

  if (error) return { error: error.message };

  revalidatePath(`/admin/tournaments/${tournamentId}/results`);
  revalidatePath("/admin/tournaments");
  revalidatePath("/");
  return { success: true };
}

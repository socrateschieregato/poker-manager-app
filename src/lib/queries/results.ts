import { createClient } from "@/lib/supabase/server";
import type { Result } from "@/types/database";

export async function getTournamentResults(tournamentId: string): Promise<Result[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("results")
    .select("*, player:players(*)")
    .eq("tournament_id", tournamentId)
    .order("position");
  if (error) throw error;
  return data ?? [];
}

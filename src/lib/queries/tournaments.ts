import { createClient } from "@/lib/supabase/server";
import type { Tournament, TournamentWithResults } from "@/types/database";

export async function getTournaments(seasonId?: string): Promise<Tournament[]> {
  const supabase = await createClient();
  let query = supabase
    .from("tournaments")
    .select("*, season:seasons(*)")
    .order("date", { ascending: false });

  if (seasonId) {
    query = query.eq("season_id", seasonId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getTournament(id: string): Promise<Tournament | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("*, season:seasons(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getRecentTournamentsWithResults(
  seasonId: string,
  limit = 5
): Promise<TournamentWithResults[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("*, season:seasons(*), results(*, player:players(*))")
    .eq("season_id", seasonId)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((t) => ({
    ...t,
    results: (t.results ?? []).sort(
      (a: { position: number }, b: { position: number }) => a.position - b.position
    ),
  })) as TournamentWithResults[];
}

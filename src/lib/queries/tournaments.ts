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

function mapTournamentsWithResults(
  data: TournamentWithResults[] | null
): TournamentWithResults[] {
  return (data ?? []).map((t) => ({
    ...t,
    results: (t.results ?? []).sort(
      (a: { position: number }, b: { position: number }) => a.position - b.position
    ),
  })) as TournamentWithResults[];
}

export async function getRecentTournamentsWithResults(
  seasonId: string,
  limit = 5
): Promise<TournamentWithResults[]> {
  const { tournaments } = await getTournamentsWithResultsPage(seasonId, 1, limit);
  return tournaments;
}

export async function getTournamentsWithResultsPage(
  seasonId: string,
  page = 1,
  pageSize = 5
): Promise<{ tournaments: TournamentWithResults[]; total: number }> {
  const supabase = await createClient();
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("tournaments")
    .select("*, season:seasons(*), results(*, player:players(*))", {
      count: "exact",
    })
    .eq("season_id", seasonId)
    .order("date", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    tournaments: mapTournamentsWithResults(data as TournamentWithResults[] | null),
    total: count ?? 0,
  };
}

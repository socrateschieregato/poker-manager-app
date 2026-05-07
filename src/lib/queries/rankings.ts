import { createClient } from "@/lib/supabase/server";
import type { RankingEntry } from "@/types/database";

export async function getSeasonRanking(seasonId: string): Promise<RankingEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_season_ranking", {
    p_season_id: seasonId,
  });
  if (error) throw error;
  return (data ?? []) as RankingEntry[];
}

export async function getSeasonPot(seasonId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("pot_contribution")
    .eq("season_id", seasonId);

  if (error) throw error;
  return (data ?? []).reduce((sum, t) => sum + Number(t.pot_contribution), 0);
}

export async function getActiveSeasonRanking(): Promise<{
  ranking: RankingEntry[];
  seasonName: string | null;
  seasonId: string | null;
  seasonPot: number;
}> {
  const supabase = await createClient();
  const { data: season } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .single();

  if (!season) return { ranking: [], seasonName: null, seasonId: null, seasonPot: 0 };

  const [ranking, seasonPot] = await Promise.all([
    getSeasonRanking(season.id),
    getSeasonPot(season.id),
  ]);
  return { ranking, seasonName: season.name, seasonId: season.id, seasonPot };
}

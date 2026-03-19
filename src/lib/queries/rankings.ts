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

export async function getActiveSeasonRanking(): Promise<{ ranking: RankingEntry[]; seasonName: string | null }> {
  const supabase = await createClient();
  const { data: season } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .single();

  if (!season) return { ranking: [], seasonName: null };

  const ranking = await getSeasonRanking(season.id);
  return { ranking, seasonName: season.name };
}

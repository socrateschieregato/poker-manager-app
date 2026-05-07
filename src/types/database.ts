export interface Player {
  id: string;
  name: string;
  created_at: string;
}

export interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Tournament {
  id: string;
  season_id: string;
  name: string;
  date: string;
  buy_in: number;
  prize_pool: number;
  pot_contribution: number;
  created_at: string;
  season?: Season;
}

export interface TournamentPrize {
  id: string;
  tournament_id: string;
  position: number;
  amount: number;
}

export interface Result {
  id: string;
  tournament_id: string;
  player_id: string;
  position: number;
  points: number;
  prize_won: number;
  player?: Player;
  tournament?: Tournament;
}

export interface TournamentWithResults extends Tournament {
  results: Result[];
}

export interface RankingEntry {
  player_id: string;
  player_name: string;
  total_points: number;
  previous_points: number;
  attendances: number;
  victories: number;
  points_today: number;
  accumulated_prize: number;
}

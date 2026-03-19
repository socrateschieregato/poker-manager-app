-- ============================================
-- Poker Ranking Manager - Schema Inicial
-- ============================================

-- Tabela de jogadores
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabela de temporadas
CREATE TABLE seasons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabela de torneios
CREATE TABLE tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  buy_in DECIMAL(10,2) DEFAULT 0 NOT NULL,
  prize_pool DECIMAL(10,2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabela de resultados
CREATE TABLE results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  points INTEGER DEFAULT 0 NOT NULL,
  prize_won DECIMAL(10,2) DEFAULT 0 NOT NULL,
  UNIQUE(tournament_id, player_id),
  UNIQUE(tournament_id, position)
);

-- Indices para performance
CREATE INDEX idx_tournaments_season ON tournaments(season_id);
CREATE INDEX idx_tournaments_date ON tournaments(date DESC);
CREATE INDEX idx_results_tournament ON results(tournament_id);
CREATE INDEX idx_results_player ON results(player_id);
CREATE INDEX idx_seasons_active ON seasons(is_active) WHERE is_active = true;

-- Apenas uma temporada ativa por vez
CREATE UNIQUE INDEX idx_one_active_season ON seasons(is_active) WHERE is_active = true;

-- RLS (Row Level Security)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Leitura publica para todos
CREATE POLICY "Leitura publica de jogadores" ON players FOR SELECT USING (true);
CREATE POLICY "Leitura publica de temporadas" ON seasons FOR SELECT USING (true);
CREATE POLICY "Leitura publica de torneios" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Leitura publica de resultados" ON results FOR SELECT USING (true);

-- Escrita apenas para usuarios autenticados (admin)
CREATE POLICY "Admin gerencia jogadores" ON players FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin gerencia temporadas" ON seasons FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin gerencia torneios" ON tournaments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin gerencia resultados" ON results FOR ALL USING (auth.role() = 'authenticated');

-- Funcao para calcular o ranking de uma temporada
CREATE OR REPLACE FUNCTION get_season_ranking(p_season_id UUID)
RETURNS TABLE (
  player_id UUID,
  player_name TEXT,
  total_points BIGINT,
  previous_points BIGINT,
  attendances BIGINT,
  victories BIGINT,
  points_today BIGINT,
  accumulated_prize DECIMAL
) AS $$
DECLARE
  v_latest_tournament_id UUID;
BEGIN
  -- Encontrar o torneio mais recente da temporada
  SELECT t.id INTO v_latest_tournament_id
  FROM tournaments t
  WHERE t.season_id = p_season_id
  ORDER BY t.date DESC, t.created_at DESC
  LIMIT 1;

  RETURN QUERY
  SELECT
    p.id AS player_id,
    p.name AS player_name,
    COALESCE(SUM(r.points), 0)::BIGINT AS total_points,
    COALESCE(SUM(r.points) FILTER (WHERE r.tournament_id != v_latest_tournament_id), 0)::BIGINT AS previous_points,
    COUNT(r.id)::BIGINT AS attendances,
    COUNT(r.id) FILTER (WHERE r.position = 1)::BIGINT AS victories,
    COALESCE(SUM(r.points) FILTER (WHERE r.tournament_id = v_latest_tournament_id), 0)::BIGINT AS points_today,
    COALESCE(SUM(r.prize_won), 0) AS accumulated_prize
  FROM players p
  INNER JOIN results r ON r.player_id = p.id
  INNER JOIN tournaments t ON t.id = r.tournament_id AND t.season_id = p_season_id
  GROUP BY p.id, p.name
  ORDER BY total_points DESC, victories DESC, attendances DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

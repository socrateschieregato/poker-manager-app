-- ============================================
-- Premiacao por Torneio e POT do Ranking
-- ============================================

-- Tabela de premios por torneio (N premios por posicao)
CREATE TABLE tournament_prizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  UNIQUE(tournament_id, position)
);

-- Contribuicao de cada torneio para o POT do ranking da temporada
ALTER TABLE tournaments ADD COLUMN pot_contribution DECIMAL(10,2) DEFAULT 0 NOT NULL;

-- Indices
CREATE INDEX idx_tournament_prizes_tournament ON tournament_prizes(tournament_id);

-- RLS
ALTER TABLE tournament_prizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura publica de premios" ON tournament_prizes FOR SELECT USING (true);
CREATE POLICY "Admin gerencia premios" ON tournament_prizes FOR ALL USING (auth.role() = 'authenticated');

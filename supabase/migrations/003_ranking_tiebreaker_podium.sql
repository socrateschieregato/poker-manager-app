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
  v_max_position INTEGER;
BEGIN
  SELECT t.id INTO v_latest_tournament_id
  FROM tournaments t
  WHERE t.season_id = p_season_id
  ORDER BY t.date DESC, t.created_at DESC
  LIMIT 1;

  SELECT COALESCE(MAX(r.position), 1) INTO v_max_position
  FROM results r
  INNER JOIN tournaments t ON t.id = r.tournament_id
  WHERE t.season_id = p_season_id;

  RETURN QUERY
  WITH ranked AS (
    SELECT
      p.id AS player_id,
      p.name AS player_name,
      COALESCE(SUM(r.points), 0)::BIGINT AS total_points,
      COALESCE(SUM(r.points) FILTER (WHERE r.tournament_id != v_latest_tournament_id), 0)::BIGINT AS previous_points,
      COUNT(r.id)::BIGINT AS attendances,
      COUNT(r.id) FILTER (WHERE r.position = 1)::BIGINT AS victories,
      COALESCE(SUM(r.points) FILTER (WHERE r.tournament_id = v_latest_tournament_id), 0)::BIGINT AS points_today,
      COALESCE(SUM(r.prize_won), 0) AS accumulated_prize,
      (
        SELECT string_agg(lpad(COALESCE(c.cnt, 0)::text, 4, '0'), '' ORDER BY gs.pos)
        FROM generate_series(2, v_max_position) AS gs(pos)
        LEFT JOIN LATERAL (
          SELECT COUNT(*)::bigint AS cnt
          FROM results r2
          INNER JOIN tournaments t2 ON t2.id = r2.tournament_id AND t2.season_id = p_season_id
          WHERE r2.player_id = p.id AND r2.position = gs.pos
        ) c ON true
      ) AS podium_tiebreak
    FROM players p
    INNER JOIN results r ON r.player_id = p.id
    INNER JOIN tournaments t ON t.id = r.tournament_id AND t.season_id = p_season_id
    GROUP BY p.id, p.name
  )
  SELECT
    ranked.player_id,
    ranked.player_name,
    ranked.total_points,
    ranked.previous_points,
    ranked.attendances,
    ranked.victories,
    ranked.points_today,
    ranked.accumulated_prize
  FROM ranked
  ORDER BY
    ranked.total_points DESC,
    ranked.victories DESC,
    ranked.attendances DESC,
    ranked.podium_tiebreak DESC NULLS LAST,
    ranked.player_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

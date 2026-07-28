export const PARTICIPATION_POINTS = 20;

/** Pontuação por posição (1º–20º). Do 21º em diante: 0. */
export const DEFAULT_POSITION_POINTS: Record<number, number> = {
  1: 150,
  2: 120,
  3: 100,
  4: 85,
  5: 70,
  6: 60,
  7: 50,
  8: 45,
  9: 40,
  10: 35,
  11: 33,
  12: 31,
  13: 29,
  14: 27,
  15: 25,
  16: 24,
  17: 23,
  18: 22,
  19: 21,
  20: 20,
};

export function getDefaultPositionPoints(position: number): number {
  return DEFAULT_POSITION_POINTS[position] ?? 0;
}

export function getDefaultParticipationPoints(): number {
  return PARTICIPATION_POINTS;
}

export function getDefaultTotalPoints(position: number): number {
  return getDefaultPositionPoints(position) + getDefaultParticipationPoints();
}

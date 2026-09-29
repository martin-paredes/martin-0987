import type { BetStatistics, SnailWinStatistic } from '../types/dashboard';

// Datos de demostración fijos; no proceden de una API ni de carreras reales.
export const betStatistics: BetStatistics = { won: 8, lost: 4 };
export const DAILY_RACE_COUNT = 6;
export const snailWins: SnailWinStatistic[] = [
  { name: 'Turbo', wins: 2 },
  { name: 'Flash', wins: 1 },
  { name: 'Rocket', wins: 1 },
  { name: 'Speedy', wins: 1 },
  { name: 'Shelly', wins: 0 },
  { name: 'Bolt', wins: 1 },
];

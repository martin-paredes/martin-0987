import { expect, test } from 'vitest';
import { betStatistics, DAILY_RACE_COUNT, snailWins } from './dashboardData';

test('demo data describes six snails and six wins with nonnegative integer counts', () => {
  expect(DAILY_RACE_COUNT).toBe(6);
  expect(snailWins).toHaveLength(6);
  expect(new Set(snailWins.map((snail) => snail.name)).size).toBe(6);
  expect(snailWins.reduce((total, snail) => total + snail.wins, 0)).toBe(DAILY_RACE_COUNT);
  const counts = [betStatistics.won, betStatistics.lost, ...snailWins.map((snail) => snail.wins)];
  expect(counts.every((count) => Number.isInteger(count) && count >= 0)).toBe(true);
  expect(betStatistics.won + betStatistics.lost).toBeGreaterThan(0);
});

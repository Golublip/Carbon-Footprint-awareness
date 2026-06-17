import { describe, it, expect } from 'vitest';
import { aiCoachService } from '../services/aiCoachService';
import { reportService } from '../services/reportService';
import type { LogEntry, UserProfile } from '../models/types';

const MOCK_PROFILE: UserProfile = {
  name: 'Eco Champion',
  dailyGoalKg: 15.0,
  joinedAt: '2026-06-17',
  streak: 3
};

const MOCK_LOGS: LogEntry[] = [
  {
    id: 'log-1',
    date: '2026-06-17',
    emissions: { transportation: 10, electricity: 5, water: 1, food: 2, shopping: 2, total: 20 }
  },
  {
    id: 'log-2',
    date: '2026-06-16',
    emissions: { transportation: 8, electricity: 4, water: 1, food: 2, shopping: 0, total: 15 }
  }
];

describe('AI Coach & Report Services Tests', () => {
  describe('AI Coach Service Heuristics', () => {
    it('calculates averages correctly', () => {
      const averages = aiCoachService.getCategoryAverages(MOCK_LOGS);
      expect(averages.transportation).toBe(9); // (10+8)/2
      expect(averages.electricity).toBe(4.5); // (5+4)/2
      expect(averages.shopping).toBe(1); // (2+0)/2
    });

    it('identifies top contributor correctly', () => {
      const averages = aiCoachService.getCategoryAverages(MOCK_LOGS);
      const top = aiCoachService.getTopEmissionCategory(averages);
      expect(top.category).toBe('transportation');
      expect(top.value).toBe(9);
    });

    it('returns custom coach answers based on message query', () => {
      const averages = aiCoachService.getCategoryAverages(MOCK_LOGS);
      const top = aiCoachService.getTopEmissionCategory(averages);
      
      const helpReply = aiCoachService.getLocalCoachHeuristics('help', averages, top, 16.5, MOCK_PROFILE);
      expect(helpReply).toContain('Hello! I am your AI Sustainability Coach');

      const biggestReply = aiCoachService.getLocalCoachHeuristics('biggest contributor', averages, top, 16.5, MOCK_PROFILE);
      expect(biggestReply.toLowerCase()).toContain('your highest daily carbon contributor is **transportation**');
    });
  });

  describe('Report Service Analytics', () => {
    it('aggregates weekly summaries and compares performance', () => {
      const summary = reportService.getWeeklySummary(MOCK_LOGS);
      expect(summary.currentWeekEmissions.total).toBe(35); // 20 + 15
      expect(summary.previousWeekEmissions.total).toBe(0); // empty previous week
      expect(summary.co2SavedKg).toBe(0);
    });

    it('projects future savings in 6-month forecast', () => {
      const forecast = reportService.get6MonthForecast(MOCK_LOGS, 15.0);
      expect(forecast.length).toBe(6);
      expect(forecast[0].month).toBeDefined();
      expect(forecast[5].cumulativeSavings).toBeGreaterThan(0);
    });
  });
});

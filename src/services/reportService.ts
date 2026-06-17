/**
 * @file reportService.ts
 * @description Generates analytical weekly carbon reports, forecasts future carbon footprint
 * reductions based on progressive optimization, and handles print-to-PDF export triggers.
 */

import type { LogEntry } from '../models/types';
import { aiCoachService } from './aiCoachService';

export interface WeeklySummary {
  currentWeekEmissions: {
    transportation: number;
    electricity: number;
    water: number;
    food: number;
    shopping: number;
    total: number;
  };
  previousWeekEmissions: {
    transportation: number;
    electricity: number;
    water: number;
    food: number;
    shopping: number;
    total: number;
  };
  percentChange: number;
  status: 'better' | 'worse' | 'stable';
  co2SavedKg: number;
}

export interface ForecastPoint {
  month: string;
  businessAsUsual: number; // projected emissions under normal habits
  optimized: number;       // projected emissions with reduction actions
  cumulativeSavings: number;
}

export const reportService = {
  /**
   * Generates a comparative summary between the current week (most recent 7 logs)
   * and the previous week (subsequent 7 logs).
   * @param history - The sorted list of user log entries
   * @returns A WeeklySummary report with totals, changes, and savings
   */
  getWeeklySummary(history: LogEntry[]): WeeklySummary {
    const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
    
    const currentWeekLogs = sorted.slice(0, 7);
    const previousWeekLogs = sorted.slice(7, 14);

    const getSums = (logs: LogEntry[]) => {
      const totals = { transportation: 0, electricity: 0, water: 0, food: 0, shopping: 0, total: 0 };
      if (logs.length === 0) return totals;

      logs.forEach(log => {
        totals.transportation += log.emissions.transportation;
        totals.electricity += log.emissions.electricity;
        totals.water += log.emissions.water;
        totals.food += log.emissions.food;
        totals.shopping += log.emissions.shopping;
        totals.total += log.emissions.total;
      });

      return {
        transportation: parseFloat(totals.transportation.toFixed(1)),
        electricity: parseFloat(totals.electricity.toFixed(1)),
        water: parseFloat(totals.water.toFixed(1)),
        food: parseFloat(totals.food.toFixed(1)),
        shopping: parseFloat(totals.shopping.toFixed(1)),
        total: parseFloat(totals.total.toFixed(1)),
      };
    };

    const currentSums = getSums(currentWeekLogs);
    const previousSums = getSums(previousWeekLogs);

    const diff = currentSums.total - previousSums.total;
    const percentChange = previousSums.total > 0 
      ? parseFloat(((diff / previousSums.total) * 100).toFixed(1)) 
      : 0;

    let status: WeeklySummary['status'] = 'stable';
    if (percentChange < -3) status = 'better'; // Drop in emissions is better
    else if (percentChange > 3) status = 'worse';

    // Positive saved CO2 is when current is less than previous
    const co2SavedKg = parseFloat((previousSums.total - currentSums.total).toFixed(1));

    return {
      currentWeekEmissions: currentSums,
      previousWeekEmissions: previousSums,
      percentChange,
      status,
      co2SavedKg: Math.max(0, co2SavedKg)
    };
  },

  /**
   * Projects a 6-month carbon footprint forecast comparing Business-As-Usual (BAU)
   * with optimized green habits.
   * @param history - The history of log entries
   * @param dailyGoal - The user's target daily emissions goal
   * @returns An array of ForecastPoints for the next 6 months
   */
  get6MonthForecast(history: LogEntry[], dailyGoal: number): ForecastPoint[] {
    const averages = aiCoachService.getCategoryAverages(history);
    const dailyAverage = Object.values(averages).reduce((a, b) => a + b, 0);
    const target = dailyGoal || 15.0;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    
    const forecast: ForecastPoint[] = [];
    let cumulative = 0;

    for (let i = 0; i < 6; i++) {
      const monthLabel = months[(currentMonthIdx + i) % 12];
      const daysInMonth = 30; // standard average month
      
      const bau = parseFloat((dailyAverage * daysInMonth).toFixed(1));
      
      // Assume progressive optimization: 5% reduction first month, scaling to 30% by month 6
      const reductionFactor = 0.05 + (i * 0.05); // max 30%
      const optDaily = Math.max(target, dailyAverage * (1 - reductionFactor));
      const opt = parseFloat((optDaily * daysInMonth).toFixed(1));
      
      const monthlySavings = parseFloat((bau - opt).toFixed(1));
      cumulative += monthlySavings;

      forecast.push({
        month: monthLabel,
        businessAsUsual: bau,
        optimized: opt,
        cumulativeSavings: parseFloat(cumulative.toFixed(1))
      });
    }

    return forecast;
  },

  /**
   * Triggers client-side print layout optimized for PDF generation.
   */
  exportWeeklyReportPDF(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
};

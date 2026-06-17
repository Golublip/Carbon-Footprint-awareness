import React from 'react';
import { useApp } from '../providers/AppContext';
import { Card } from '../widgets/SharedUI';
import { AccessibleDonutChart, AccessibleLineChart } from '../widgets/AccessibleChart';
import { Leaf, Zap, Flame, ShieldCheck } from 'lucide-react';
import { reportService } from '../services/reportService';

export const DashboardScreen: React.FC = () => {
  const { logs, profile, score, dailyAverage } = useApp();
  const summary = reportService.getWeeklySummary(logs);

  const breakdownData = [
    { label: 'transportation', value: summary.currentWeekEmissions.transportation, color: '#3b82f6' }, // Blue
    { label: 'electricity', value: summary.currentWeekEmissions.electricity, color: '#f59e0b' },   // Amber
    { label: 'water', value: summary.currentWeekEmissions.water, color: '#06b6d4' },             // Cyan
    { label: 'food', value: summary.currentWeekEmissions.food, color: '#10b981' },               // Emerald
    { label: 'shopping', value: summary.currentWeekEmissions.shopping, color: '#a855f7' },       // Purple
  ];

  // Get score color
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5';
    if (s >= 50) return 'text-amber-500 border-amber-500/30 bg-amber-500/5';
    return 'text-rose-500 border-rose-500/30 bg-rose-500/5';
  };

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Welcome back, {profile.name}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Here is your carbon footprint status and sustainability progress.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Leaf className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Daily Score</p>
            <h2 className="text-2xl font-black text-zinc-950 dark:text-zinc-50 font-mono mt-0.5">{score}</h2>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
            <Zap className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Avg Daily CO₂</p>
            <h2 className="text-2xl font-black text-zinc-950 dark:text-zinc-50 font-mono mt-0.5">
              {dailyAverage.toFixed(1)} <span className="text-xs font-normal">kg</span>
            </h2>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Weekly Savings</p>
            <h2 className="text-2xl font-black text-zinc-950 dark:text-zinc-50 font-mono mt-0.5">
              {summary.co2SavedKg.toFixed(1)} <span className="text-xs font-normal">kg</span>
            </h2>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
            <Flame className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active Streak</p>
            <h2 className="text-2xl font-black text-zinc-950 dark:text-zinc-50 font-mono mt-0.5">
              {profile.streak} <span className="text-xs font-normal">days</span>
            </h2>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Score Circle Card */}
        <Card className="flex flex-col items-center justify-center text-center p-8">
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-6">
            Daily Footprint Score
          </h3>
          <div className={`w-36 h-36 rounded-full border-8 flex flex-col items-center justify-center font-mono ${getScoreColor(score)}`}>
            <span className="text-5xl font-black">{score}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest mt-1">out of 100</span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-6 max-w-[200px]">
            {score >= 80 
              ? 'Excellent! Your carbon footprint is highly sustainable.' 
              : score >= 50 
                ? 'Good, but there is room to cut back on energy or transit.'
                : 'Warning: Emissions exceed target. Try an active transit challenge!'}
          </p>
        </Card>

        {/* Category Breakdown Chart */}
        <Card className="lg:col-span-2">
          <AccessibleDonutChart
            data={breakdownData}
            title="Weekly Category Breakdown"
            unit="kg"
          />
        </Card>
      </div>

      {/* Trend Row */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <AccessibleLineChart
            logs={logs}
            title="Total Daily Carbon Emissions Trend"
            dataKey="total"
            unit="kg"
            limit={7}
          />
        </Card>
      </div>
    </div>
  );
};

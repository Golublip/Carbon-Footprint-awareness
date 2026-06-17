import React, { useState } from 'react';
import { useApp } from '../providers/AppContext';
import { Card, Button, Input } from '../widgets/SharedUI';
import { reportService } from '../services/reportService';
import { Award, Flame, Settings, Calendar, Share2, Printer } from 'lucide-react';
import * as Icons from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { profile, badges, logs, updateProfile, resetData } = useApp();
  
  // Profile Form States
  const [name, setName] = useState(profile.name);
  const [goal, setGoal] = useState(profile.dailyGoalKg.toString());
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Share overlay state
  const [shareTextCopied, setShareTextCopied] = useState(false);

  const weeklySummary = reportService.getWeeklySummary(logs);
  const forecastData = reportService.get6MonthForecast(logs, profile.dailyGoalKg);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const goalNum = parseFloat(goal);
    if (!name.trim()) {
      setProfileError('Name cannot be empty');
      return;
    }
    if (isNaN(goalNum) || goalNum <= 0) {
      setProfileError('Daily goal must be a positive number');
      return;
    }

    setProfileError('');
    updateProfile(name.trim(), goalNum);
    setProfileSuccess('Profile settings updated successfully!');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  const handlePrintReport = () => {
    reportService.exportWeeklyReportPDF();
  };

  const handleShareCard = () => {
    const unlockedCount = badges.filter(b => b.unlockedAt).length;
    const text = `🌱 I am tracking and reducing my carbon footprint on the Carbon Footprint Awareness Platform!
🔥 My current streak: ${profile.streak} days
🏆 Badges unlocked: ${unlockedCount} / ${badges.length}
📉 I saved ${weeklySummary.co2SavedKg.toFixed(1)} kg of CO2e this week!
Join me and build a sustainable future!`;

    navigator.clipboard.writeText(text);
    setShareTextCopied(true);
    setTimeout(() => setShareTextCopied(false), 3000);
  };

  // Helper to dynamically render Lucide icons
  const renderBadgeIcon = (iconName: string, unlocked: boolean) => {
    const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; 'aria-hidden'?: string }>>)[iconName] || Icons.Award;
    return (
      <IconComponent
        className={`w-6 h-6 ${unlocked ? 'text-blue-500' : 'text-zinc-400'}`}
        aria-hidden="true"
      />
    );
  };

  const unlockedCount = badges.filter(b => b.unlockedAt).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Printable Report Styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          nav, header, button, .no-print {
            display: none !important;
          }
          .print-full {
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Profile & Achievements
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your goals, review unlocked milestones, and view sustainability projections.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handlePrintReport}
            ariaLabel="Print weekly carbon report"
            className="flex items-center gap-2 text-xs py-2"
          >
            <Printer className="w-4 h-4" />
            Print Weekly Report
          </Button>
          <Button
            variant="primary"
            onClick={handleShareCard}
            ariaLabel="Share your achievements card"
            className="flex items-center gap-2 text-xs py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            <Share2 className="w-4 h-4" />
            {shareTextCopied ? 'Stats Copied!' : 'Share Achievement Card'}
          </Button>
        </div>
      </div>

      {/* Grid of Profile Forms & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card className="md:col-span-1 no-print">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </h2>

            {profileSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 p-2 border border-emerald-500/20 rounded text-xs">
                {profileSuccess}
              </div>
            )}

            <Input
              label="Display Name"
              id="profile-name"
              value={name}
              onChange={e => setName(e.target.value)}
              error={profileError}
            />

            <Input
              label="Daily Limit Goal (kg CO₂e)"
              id="profile-goal"
              type="number"
              step="any"
              value={goal}
              onChange={e => setGoal(e.target.value)}
            />

            <Button type="submit" ariaLabel="Save profile configurations" className="w-full mt-2">
              Save Settings
            </Button>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm('Are you sure you want to reset all tracking logs? This cannot be undone.')) {
                    resetData();
                  }
                }}
                ariaLabel="Reset all profile data"
                className="w-full text-xs py-2"
              >
                Reset All Logs
              </Button>
            </div>
          </form>
        </Card>

        {/* Share Achievement Template */}
        <Card className="md:col-span-2 print-full flex flex-col justify-between bg-zinc-950 text-white border-zinc-800 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
              <span className="text-xs uppercase font-extrabold tracking-widest text-blue-400">Carbon Champion Card</span>
              <span className="text-[10px] text-zinc-400 font-mono">ID: {profile.name.replace(/\s+/g, '-').toLowerCase()}</span>
            </div>
            
            <div className="mt-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-3xl shrink-0">
                🌱
              </div>
              <div>
                <h3 className="text-lg font-black">{profile.name}</h3>
                <p className="text-xs text-zinc-400 font-medium flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Eco-conscious since {profile.joinedAt}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Streak</span>
                <div className="text-lg font-extrabold font-mono mt-1 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />
                  {profile.streak} days
                </div>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Weekly Saved</span>
                <div className="text-lg font-extrabold font-mono mt-1 text-emerald-400">
                  {weeklySummary.co2SavedKg.toFixed(1)} kg
                </div>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Badges</span>
                <div className="text-lg font-extrabold font-mono mt-1 text-blue-400">
                  {unlockedCount} / {badges.length}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-[10px] text-zinc-500 flex justify-between items-center">
            <span>Powered by Antigravity Carbon Aware Engine</span>
            <span className="font-bold text-zinc-400">#NetZeroHero</span>
          </div>
        </Card>
      </div>

      {/* Badges Panel */}
      <Card className="no-print">
        <div className="flex items-center gap-2 mb-6 text-zinc-950 dark:text-zinc-50">
          <Award className="w-5 h-5" aria-hidden="true" />
          <h2 className="text-base font-bold">Sustainability Badges & Streaks</h2>
          <span className="text-xs font-semibold text-zinc-450 ml-2">({unlockedCount} unlocked)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {badges.map(badge => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border text-center flex flex-col items-center justify-between transition-all ${
                  isUnlocked
                    ? 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f]'
                    : 'border-zinc-100 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10 opacity-50'
                }`}
              >
                <div className={`p-3 rounded-full mb-3 ${isUnlocked ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                  {renderBadgeIcon(badge.iconName, isUnlocked)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200">{badge.title}</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-normal max-w-[120px] mx-auto">
                    {badge.description}
                  </p>
                </div>
                {isUnlocked && (
                  <span className="text-[9px] font-mono font-bold text-emerald-500 mt-3 block">
                    Unlocked {badge.unlockedAt}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Personalized Journey & Projections */}
      <Card className="print-full">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-6 flex items-center gap-2">
          <Icons.TrendingUp className="w-4 h-4" />
          Personalized Sustainability Journey (6-Month Forecast)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Journey Roadmap Text */}
          <div className="md:col-span-1 space-y-4 text-xs font-semibold">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Milestone Roadmap</h3>
            <p className="text-zinc-500 leading-relaxed font-normal">
              Based on your carbon footprint logs and selected challenges, here is your path to sustainability:
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex gap-2 items-start">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                <div>
                  <h4 className="text-zinc-900 dark:text-zinc-200">Stage 1: Aware (Month 1-2)</h4>
                  <p className="text-[10px] text-zinc-500 font-normal leading-normal mt-0.5">Maintain logging streak and complete the "No Car Day" challenge.</p>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                <div>
                  <h4 className="text-zinc-900 dark:text-zinc-200">Stage 2: Reducer (Month 3-4)</h4>
                  <p className="text-[10px] text-zinc-500 font-normal leading-normal mt-0.5">Cut average weekly emissions by 15% through food and electricity savings.</p>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                <div>
                  <h4 className="text-zinc-900 dark:text-zinc-200">Stage 3: Champion (Month 5-6)</h4>
                  <p className="text-[10px] text-zinc-500 font-normal leading-normal mt-0.5">Reach target daily limit goal of {profile.dailyGoalKg} kg CO₂e consistently.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SVG Savings Forecast Chart */}
          <div className="md:col-span-2 flex flex-col justify-between">
            <div className="flex justify-between text-xs font-semibold text-zinc-500 mb-3">
              <span>6-Month Forecast (Monthly kg CO₂e)</span>
              <div className="flex gap-3">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 bg-rose-500 rounded"></span> BAU</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 bg-blue-500 rounded"></span> Optimized</span>
              </div>
            </div>
            
            {/* SVG Forecast Chart */}
            <div className="h-40 w-full">
              <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
                {/* Axes */}
                <line x1="20" y1="130" x2="380" y2="130" stroke="#71717a" strokeWidth="1" />
                
                {/* Chart Grid Lines */}
                <line x1="20" y1="20" x2="380" y2="20" stroke="#e4e4e7" className="dark:stroke-zinc-800" strokeDasharray="3 3" />
                <line x1="20" y1="75" x2="380" y2="75" stroke="#e4e4e7" className="dark:stroke-zinc-800" strokeDasharray="3 3" />

                {/* Draw BAU and Optimized Bars */}
                {forecastData.map((point, i) => {
                  const x = 30 + i * 58;
                  const maxEmissions = Math.max(...forecastData.map(p => p.businessAsUsual), 500);
                  
                  const bauHeight = (point.businessAsUsual / maxEmissions) * 100;
                  const optHeight = (point.optimized / maxEmissions) * 100;

                  return (
                    <g key={i} className="group cursor-pointer">
                      {/* BAU Bar */}
                      <rect
                        x={x}
                        y={130 - bauHeight}
                        width="16"
                        height={bauHeight}
                        fill="#f43f5e"
                        className="opacity-70 group-hover:opacity-90 transition-opacity rounded-t"
                      />
                      {/* Optimized Bar */}
                      <rect
                        x={x + 20}
                        y={130 - optHeight}
                        width="16"
                        height={optHeight}
                        fill="#3b82f6"
                        className="opacity-80 group-hover:opacity-100 transition-opacity rounded-t"
                      />
                      {/* X Label */}
                      <text x={x + 18} y="145" textAnchor="middle" fill="#9ca3af" className="text-[10px] font-mono font-bold">
                        {point.month}
                      </text>
                      <title>{`${point.month} Forecast: BAU: ${point.businessAsUsual}kg, Opt: ${point.optimized}kg (Saved: ${point.cumulativeSavings}kg)`}</title>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            <div className="p-3 bg-blue-50/10 border border-blue-200/20 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 mt-2 text-center">
              💡 By Month 6, you will have saved a cumulative total of **{forecastData[5]?.cumulativeSavings.toFixed(0)} kg CO₂e**!
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../providers/AppContext';
import { Card, Button, Input } from '../widgets/SharedUI';
import { Globe, Users, Heart, Award, CheckCircle, Shield } from 'lucide-react';
import { reportService } from '../services/reportService';

const generateFeedId = (prefix: string) => `${prefix}-${Date.now()}`;

interface OffsetProject {
  id: string;
  title: string;
  description: string;
  location: string;
  certifier: string;
  pricePerKg: number; // in USD
  rating: string;
}

const PROJECTS: OffsetProject[] = [
  {
    id: 'amazon-forestry',
    title: 'Amazon Basin Reforestation',
    description: 'Protects critical tropical rainforest from deforestation, restoring native ecosystems and supporting local indigenous forest management.',
    location: 'Acre, Brazil',
    certifier: 'VCS & Gold Standard',
    pricePerKg: 0.015, // $15 per metric ton
    rating: '⭐⭐⭐⭐⭐ High Quality'
  },
  {
    id: 'clean-cookstoves',
    title: 'Solar & Clean Cookstoves',
    description: 'Distributes fuel-efficient and solar-powered stoves to rural families in East Africa, reducing wood consumption and improving household air quality.',
    location: 'Kenya & Uganda',
    certifier: 'Gold Standard',
    pricePerKg: 0.012, // $12 per metric ton
    rating: '⭐⭐⭐⭐⭐ High Social Impact'
  },
  {
    id: 'india-wind',
    title: 'Renewable Wind Infrastructure',
    description: 'Powers grid decarbonization by replacing fossil fuel generation with regional clean wind turbine clusters in developing industrial zones.',
    location: 'Gujarat, India',
    certifier: 'VCS Certified',
    pricePerKg: 0.008, // $8 per metric ton
    rating: '⭐⭐⭐⭐ Additional Clean Power'
  }
];

interface FeedPost {
  id: string;
  user: string;
  initials: string;
  text: string;
  cheers: number;
  hasCheered: boolean;
  timestamp: string;
}

export const ImpactScreen: React.FC = () => {
  const { logs, profile, retireCarbonOffset } = useApp();
  const weeklySummary = useMemo(() => reportService.getWeeklySummary(logs), [logs]);

  // Marketplace states
  const [selectedProjectId, setSelectedProjectId] = useState<string>(PROJECTS[0].id);
  const [offsetAmount, setOffsetAmount] = useState<string>('50');
  const [offsetError, setOffsetError] = useState<string>('');
  const [offsetSuccess, setOffsetSuccess] = useState<string>('');

  // Community Feed states
  const [posts, setPosts] = useState<FeedPost[]>([
    {
      id: 'post-1',
      user: 'Sarah Jenkins',
      initials: 'SJ',
      text: 'Climbed my 7th flight of stairs instead of taking the elevator today! My transportation score is up to 95! 🚶‍♀️💚',
      cheers: 12,
      hasCheered: false,
      timestamp: '2 hours ago'
    },
    {
      id: 'post-2',
      user: 'David Chen',
      initials: 'DC',
      text: 'Just retired 200 kg of carbon offsets supporting the Amazon Basin Reforestation project! Feels great to offset last month\'s travel emissions! 🌳',
      cheers: 24,
      hasCheered: false,
      timestamp: '5 hours ago'
    },
    {
      id: 'post-3',
      user: 'Elena Rostova',
      initials: 'ER',
      text: 'Switched my home utility package to a 100% wind contract contract! Decarbonizing my electricity source one step at a time! ⚡💨',
      cheers: 18,
      hasCheered: false,
      timestamp: '1 day ago'
    }
  ]);

  const selectedProject = useMemo(() => PROJECTS.find(p => p.id === selectedProjectId)!, [selectedProjectId]);

  const estimatedCost = useMemo(() => {
    const amt = parseFloat(offsetAmount);
    if (isNaN(amt) || amt <= 0) return 0;
    return parseFloat((amt * selectedProject.pricePerKg).toFixed(2));
  }, [offsetAmount, selectedProject]);

  const calculatorEngineScore = useCallback(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(l => l.date === todayStr);
    const todayTotal = todayLog ? todayLog.emissions.total : 0;
    const { dailyGoalKg } = profile;
    const factor = dailyGoalKg > 0 ? (todayTotal / dailyGoalKg) : 1;
    let scoreVal = Math.round(100 - (factor * 50));
    if (scoreVal < 0) scoreVal = 0;
    if (scoreVal > 100) scoreVal = 100;
    return scoreVal;
  }, [logs, profile]);

  const handleRetireOffset = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(offsetAmount);
    if (isNaN(amt) || amt <= 0) {
      setOffsetError('Please enter a valid positive carbon amount to offset.');
      setOffsetSuccess('');
      return;
    }
    setOffsetError('');
    retireCarbonOffset(amt);
    
    setOffsetSuccess(`Successfully retired ${amt.toFixed(1)} kg CO2e through the "${selectedProject.title}" project!`);
    
    // Auto add to community feed
    const newPostId = generateFeedId('user-post');
    const newPost: FeedPost = {
      id: newPostId,
      user: profile.name,
      initials: profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'EC',
      text: `Just retired ${amt.toFixed(1)} kg of CO2e offsets supporting the "${selectedProject.title}" project! 🌳✨`,
      cheers: 0,
      hasCheered: false,
      timestamp: 'Just now'
    };
    setPosts(prev => [newPost, ...prev]);
  }, [offsetAmount, selectedProject, profile.name, retireCarbonOffset]);

  const handleCheer = useCallback((postId: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            cheers: post.hasCheered ? post.cheers - 1 : post.cheers + 1,
            hasCheered: !post.hasCheered
          };
        }
        return post;
      })
    );
  }, []);

  const handleShareSummary = useCallback(() => {
    const saved = weeklySummary.co2SavedKg;
    const newPostId = generateFeedId('user-summary');
    const newPost: FeedPost = {
      id: newPostId,
      user: profile.name,
      initials: profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'EC',
      text: `Weekly Update: I saved ${saved.toFixed(1)} kg of CO2e! My daily score is holding at ${calculatorEngineScore()} and my log streak is at ${profile.streak} days! Join the green journey! 🌿📈`,
      cheers: 0,
      hasCheered: false,
      timestamp: 'Just now'
    };
    setPosts(prev => [newPost, ...prev]);
  }, [weeklySummary.co2SavedKg, profile.name, profile.streak, calculatorEngineScore]);

  // Total offset amount for user
  const userTotalOffset = profile.totalOffsetKg || 0;

  // Collective progress tracker
  const communityBaseSavings = 42350;
  const collectiveTotal = parseFloat((communityBaseSavings + userTotalOffset).toFixed(1));
  const collectiveGoal = 50000;
  const goalPercent = Math.min(parseFloat(((collectiveTotal / collectiveGoal) * 100).toFixed(1)), 100);

  // Leaderboard data
  const leaderboardUsers = useMemo(() => [
    { name: 'GreenWarrior99', savings: 45.2, active: true },
    { name: 'EarthAngel_22', savings: 38.6, active: true },
    { name: `${profile.name} (You)`, savings: parseFloat(weeklySummary.co2SavedKg.toFixed(1)), active: false, highlight: true },
    { name: 'EcoTransit_Rider', savings: 31.4, active: true },
    { name: 'ZeroWasteChamp', savings: 27.9, active: true }
  ].sort((a, b) => b.savings - a.savings), [profile.name, weeklySummary.co2SavedKg]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
          Impact & Community Hub
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Offset your remaining footprint, share your progress, and participate in collective environmental action.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Marketplace (Left / Middle Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-blue-500 shrink-0" aria-hidden="true" />
              <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">Carbon Offset Marketplace</h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
              Offset the emissions you cannot cut back. All selected offset projects are verified by Gold Standard or VCS.
            </p>

            <form onSubmit={handleRetireOffset} className="space-y-4">
              {/* Projects Radio Grid */}
              <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Select carbon offset project">
                {PROJECTS.map(project => {
                  const isSelected = selectedProjectId === project.id;
                  return (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                      className={`border rounded-xl p-4 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-blue-500/50 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10'
                          : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                      }`}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          setSelectedProjectId(project.id);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{project.title}</h3>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5">{project.location}</p>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded border border-zinc-200 dark:border-zinc-700 shrink-0">
                          ${(project.pricePerKg * 1000).toFixed(0)}/ton
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">{project.description}</p>
                      
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">
                        <span>Certified: {project.certifier}</span>
                        <span>{project.rating}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Offset retirement form details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Input
                  label="Carbon to Offset (kg CO2e)"
                  id="offset-amount"
                  type="number"
                  value={offsetAmount}
                  onChange={e => setOffsetAmount(e.target.value)}
                  error={offsetError}
                />
                
                <div className="flex flex-col justify-end p-2 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800 rounded-lg">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Estimated Cost</span>
                  <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5">
                    ${estimatedCost.toFixed(2)} <span className="text-xs font-normal text-zinc-500">USD</span>
                  </span>
                </div>
              </div>

              {offsetSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-400 text-xs rounded-lg p-3.5 flex items-center gap-2" role="status">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <span className="font-medium">{offsetSuccess}</span>
                </div>
              )}

              <Button type="submit" ariaLabel={`Retire ${offsetAmount} kg of carbon offsets`} className="w-full">
                Proceed to Retire Offsets
              </Button>
            </form>
          </Card>

          {/* Community Feed */}
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500 shrink-0" aria-hidden="true" />
                <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">Eco Champions Feed</h2>
              </div>
              <Button onClick={handleShareSummary} variant="secondary" ariaLabel="Share weekly carbon summary to feed" className="text-xs py-1.5 px-3">
                Post My Weekly Progress
              </Button>
            </div>

            {/* Post Feed Items */}
            <div className="space-y-4" role="feed" aria-label="Community green feed">
              {posts.map(post => (
                <div key={post.id} className="border border-zinc-150 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/20 dark:bg-zinc-900/10 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {post.initials}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{post.user}</h4>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">{post.timestamp}</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-350 leading-relaxed font-normal">{post.text}</p>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-3 pt-1 border-t border-zinc-100/60 dark:border-zinc-800/30">
                    <button
                      onClick={() => handleCheer(post.id)}
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                        post.hasCheered
                          ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200/30'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 border border-transparent'
                      }`}
                      aria-label={`${post.hasCheered ? 'Remove Cheer' : 'Cheer this achievement'} - currently ${post.cheers} cheers`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${post.hasCheered ? 'fill-red-500 text-red-600 dark:text-red-400' : 'text-zinc-400'}`} aria-hidden="true" />
                      Cheer ({post.cheers})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar widgets (Right Column) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Individual Stats widget */}
          <Card className="p-5 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3 uppercase tracking-wider text-[10px]">Your Carbon Retirement</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-zinc-950 dark:text-zinc-50">{userTotalOffset.toFixed(1)}</span>
              <span className="text-xs text-zinc-500 font-semibold uppercase">kg CO2e</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal mt-2">
              All offset amounts are credited directly to your profile and added to the community collective goal.
            </p>
          </Card>

          {/* Collective Goal widget */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500 shrink-0" aria-hidden="true" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Collective Carbon Milestone</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-500">Goal Percent</span>
                <span className="text-zinc-900 dark:text-zinc-100">{goalPercent}%</span>
              </div>
              
              {/* Progress Bar Container */}
              <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000 ease-out"
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
              
              <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">
                <span>{collectiveTotal.toLocaleString()} kg Retired</span>
                <span>{collectiveGoal.toLocaleString()} kg Target</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
              Every tree planted and wind project funded helps the Eco Champions community clear this goal!
            </p>
          </Card>

          {/* Leaderboard widget */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-yellow-500 shrink-0" aria-hidden="true" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Eco Savings Leaderboard</h3>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-3 font-semibold">
              Ranks community champions based on carbon saved this week.
            </p>

            <div className="space-y-2">
              {leaderboardUsers.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                    item.highlight
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-400 font-bold'
                      : 'text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 w-3">#{idx + 1}</span>
                    <span className="truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="font-bold shrink-0">{item.savings.toFixed(1)} kg</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

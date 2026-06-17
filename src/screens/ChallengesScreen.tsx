import React from 'react';
import { useApp } from '../providers/AppContext';
import { Card, Button } from '../widgets/SharedUI';
import { Trophy, Flame, Plus } from 'lucide-react';
import type { Challenge } from '../models/types';

const CHALLENGES_LIST: Challenge[] = [
  {
    id: 'no-car-day',
    title: 'No Car Day',
    description: 'Commit to zero passenger car travel. Walk, bike, or take public transit instead.',
    category: 'transportation',
    durationDays: 1,
    co2SavingsKg: 4.5,
    targetValue: 1,
    targetDescription: '1 day of zero car transit'
  },
  {
    id: 'power-saver-week',
    title: 'Electricity Halver',
    description: 'Reduce household electricity consumption below 5 kWh per day.',
    category: 'electricity',
    durationDays: 7,
    co2SavingsKg: 12.0,
    targetValue: 7,
    targetDescription: '7 days under 5 kWh'
  },
  {
    id: 'water-conserve',
    title: 'Water Guardian',
    description: 'Limit daily water usage to under 60 liters per person.',
    category: 'water',
    durationDays: 3,
    co2SavingsKg: 2.8,
    targetValue: 3,
    targetDescription: '3 days under 60 liters'
  },
  {
    id: 'plant-powered-week',
    title: 'Sustainable Food Week',
    description: 'Commit to zero meat servings for one full week (plant-forward meals).',
    category: 'food',
    durationDays: 7,
    co2SavingsKg: 15.4,
    targetValue: 7,
    targetDescription: '7 days with 0 meat'
  }
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Clara Green', score: 2840, savedCo2: 142.5, avatar: '👩‍🌾' },
  { rank: 2, name: 'David Eco', score: 2610, savedCo2: 130.8, avatar: '👨‍🚀' },
  { rank: 3, name: 'Sophia Solar', score: 2450, savedCo2: 122.4, avatar: '👩‍🎤' },
  { rank: 4, name: 'Marcus Clean', score: 2210, savedCo2: 110.5, avatar: '👨‍🎨' },
];

export const ChallengesScreen: React.FC = () => {
  const { activeChallenges, joinChallenge, checkInChallenge, completeChallenge, logs } = useApp();

  const getLogStatsForToday = (category: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const log = logs.find(l => l.date === todayStr);
    if (!log) return false;
    
    if (category === 'transportation') {
      return log.transportation ? log.transportation.mode !== 'car' : true;
    }
    if (category === 'electricity') {
      return log.electricity ? log.electricity.kwh < 5 : false;
    }
    if (category === 'water') {
      return log.water ? log.water.liters < 60 : false;
    }
    if (category === 'food') {
      return log.food ? log.food.meatServings === 0 : false;
    }
    return false;
  };

  const handleCheckIn = (challengeId: string, category: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const challenge = activeChallenges.find(c => c.challengeId === challengeId);
    if (!challenge) return;

    if (challenge.checkIns[todayStr]) return; // Already checked in today

    // Check if the user met the specific criteria today
    const success = getLogStatsForToday(category);
    if (!success) {
      alert(`To check in, you must meet the challenge target in your logger today!`);
      return;
    }

    checkInChallenge(challengeId, todayStr, 1);
  };

  const checkCompletionStatus = (active: typeof activeChallenges[0], challenge: Challenge) => {
    return active.progress >= challenge.targetValue;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Challenges List */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Sustainability Challenges
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Join action challenges, check in, and reduce carbon footprint.
          </p>
        </div>

        {/* Active Challenges */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" aria-hidden="true" />
            Your Active Challenges
          </h2>
          {activeChallenges.filter(ac => !ac.completed).length === 0 ? (
            <Card className="text-center py-6 text-zinc-400 text-sm">
              No active challenges. Join one below to begin!
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChallenges.filter(ac => !ac.completed).map(ac => {
                const challenge = CHALLENGES_LIST.find(c => c.id === ac.challengeId);
                if (!challenge) return null;
                const canComplete = checkCompletionStatus(ac, challenge);
                const todayStr = new Date().toISOString().split('T')[0];
                const checkedInToday = ac.checkIns[todayStr];

                return (
                  <Card key={ac.challengeId} className="flex flex-col justify-between border-l-4 border-l-blue-500">
                    <div>
                      <h3 className="font-bold text-zinc-950 dark:text-zinc-50">{challenge.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1">{challenge.description}</p>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-500">Goal:</span>
                          <span className="text-zinc-800 dark:text-zinc-200">{challenge.targetDescription}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-500">Progress:</span>
                          <span className="text-zinc-800 dark:text-zinc-200 font-mono">
                            {ac.progress} / {challenge.targetValue} days
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, (ac.progress / challenge.targetValue) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex gap-2">
                      {canComplete ? (
                        <Button
                          onClick={() => completeChallenge(ac.challengeId)}
                          ariaLabel={`Complete ${challenge.title} challenge`}
                          className="w-full text-xs font-bold bg-emerald-500 hover:bg-emerald-600"
                        >
                          Claim {challenge.co2SavingsKg} kg CO₂ Savings
                        </Button>
                      ) : (
                        <Button
                          disabled={checkedInToday}
                          onClick={() => handleCheckIn(ac.challengeId, challenge.category)}
                          ariaLabel={`Check in for ${challenge.title}`}
                          className={`w-full text-xs font-semibold ${checkedInToday ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400' : ''}`}
                        >
                          {checkedInToday ? 'Checked In Today' : 'Log Today Check-In'}
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Challenges */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" aria-hidden="true" />
            Discover New Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CHALLENGES_LIST.filter(c => !activeChallenges.some(ac => ac.challengeId === c.id)).map(challenge => (
              <Card key={challenge.id} className="flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-zinc-950 dark:text-zinc-50">{challenge.title}</h3>
                    <span className="text-[10px] font-black text-blue-500 bg-blue-500/5 px-2 py-0.5 border border-blue-500/20 rounded uppercase">
                      -{challenge.co2SavingsKg} kg CO₂
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                    {challenge.description}
                  </p>
                </div>
                <Button
                  onClick={() => joinChallenge(challenge.id)}
                  ariaLabel={`Join ${challenge.title} challenge`}
                  className="w-full text-xs py-1.5 mt-4"
                >
                  Join Challenge
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Community Leaderboard */}
      <div className="space-y-6">
        <Card className="flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 text-amber-500">
              <Trophy className="w-5 h-5" aria-hidden="true" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Community Leaderboard</h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Compete with sustainability champions worldwide. Log clean habits to earn Eco Points!
            </p>
            <div className="mt-4 space-y-3">
              {MOCK_LEADERBOARD.map(user => (
                <div key={user.rank} className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg text-xs font-semibold">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-zinc-400 w-4">{user.rank}</span>
                    <span className="text-base">{user.avatar}</span>
                    <span className="text-zinc-900 dark:text-zinc-200">{user.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-zinc-900 dark:text-zinc-100">{user.score} pts</div>
                    <div className="text-[10px] text-emerald-500 font-bold">-{user.savedCo2} kg</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 p-3 bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-center text-xs">
            <span className="font-semibold text-zinc-400">Ranked Matchmaking</span>
            <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
              Leaderboard updates every 24 hours. Keep your streak active to climb the ranks!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

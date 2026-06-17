/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { LogEntry, UserProfile, ActiveChallenge, Badge, TransportationLog, ElectricityLog, WaterLog, FoodLog, ShoppingLog } from '../models/types';
import { storageRepository } from '../repositories/storageRepository';
import { calculatorEngine } from '../services/calculatorEngine';
import confetti from 'canvas-confetti';

interface AppContextType {
  profile: UserProfile;
  logs: LogEntry[];
  activeChallenges: ActiveChallenge[];
  badges: Badge[];
  score: number; // daily score
  dailyAverage: number;
  updateProfile: (name: string, dailyGoalKg: number) => void;
  logTransportation: (date: string, log: TransportationLog) => void;
  logElectricity: (date: string, log: ElectricityLog) => void;
  logWater: (date: string, log: WaterLog) => void;
  logFood: (date: string, log: FoodLog) => void;
  logShopping: (date: string, log: ShoppingLog) => void;
  joinChallenge: (challengeId: string) => void;
  checkInChallenge: (challengeId: string, date: string, value: number) => void;
  completeChallenge: (challengeId: string) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => storageRepository.getProfile());
  const [logs, setLogs] = useState<LogEntry[]>(() => storageRepository.getLogs());
  const [activeChallenges, setActiveChallenges] = useState<ActiveChallenge[]>(() => storageRepository.getActiveChallenges());
  const [badges, setBadges] = useState<Badge[]>(() => storageRepository.getBadges());
  const [score, setScore] = useState(100);
  const [dailyAverage, setDailyAverage] = useState(0);

  // Recalculate carbon score and daily average when logs or goal change
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(l => l.date === todayStr);
    const todayTotal = todayLog ? todayLog.emissions.total : 0;
    
    // Set daily score
    setScore(calculatorEngine.calculateScore(todayTotal, profile.dailyGoalKg));

    // Set daily average
    if (logs.length > 0) {
      const totalSum = logs.reduce((sum, log) => sum + log.emissions.total, 0);
      setDailyAverage(parseFloat((totalSum / logs.length).toFixed(2)));
    } else {
      setDailyAverage(0);
    }
  }, [logs, profile.dailyGoalKg]);

  const updateProfile = (name: string, dailyGoalKg: number) => {
    const updated = { ...profile, name, dailyGoalKg };
    setProfile(updated);
    storageRepository.saveProfile(updated);
  };

  const getOrCreateLogEntry = (date: string, currentLogs: LogEntry[]): LogEntry => {
    const existing = currentLogs.find(l => l.date === date);
    if (existing) return { ...existing };

    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date,
      emissions: {
        transportation: 0,
        electricity: 0,
        water: 0,
        food: 0,
        shopping: 0,
        total: 0
      }
    };
  };

  const saveUpdatedLogs = (updatedEntry: LogEntry) => {
    const updatedLogs = logs.map(l => (l.date === updatedEntry.date ? updatedEntry : l));
    if (!logs.some(l => l.date === updatedEntry.date)) {
      updatedLogs.push(updatedEntry);
    }
    
    // Sort chronologically
    updatedLogs.sort((a, b) => b.date.localeCompare(a.date));

    // Update streak logic
    const updatedProfile = { ...profile };
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (updatedEntry.date === todayStr || updatedEntry.date === yesterdayStr) {
      if (profile.lastLoggedDate !== updatedEntry.date) {
        if (profile.lastLoggedDate === yesterdayStr && updatedEntry.date === todayStr) {
          updatedProfile.streak += 1;
        } else if (profile.lastLoggedDate !== todayStr) {
          // Streak broke or first log
          updatedProfile.streak = 1;
        }
        updatedProfile.lastLoggedDate = updatedEntry.date;
        setProfile(updatedProfile);
        storageRepository.saveProfile(updatedProfile);
      }
    }

    setLogs(updatedLogs);
    storageRepository.saveLogs(updatedLogs);

    // Run badge unlocks checks
    checkBadgeUnlocks(updatedLogs, updatedProfile);
  };

  const logTransportation = (date: string, log: TransportationLog) => {
    const entry = getOrCreateLogEntry(date, logs);
    entry.transportation = log;
    entry.emissions = calculatorEngine.calculateAllEmissions(
      log,
      entry.electricity,
      entry.water,
      entry.food,
      entry.shopping
    );
    saveUpdatedLogs(entry);
  };

  const logElectricity = (date: string, log: ElectricityLog) => {
    const entry = getOrCreateLogEntry(date, logs);
    entry.electricity = log;
    entry.emissions = calculatorEngine.calculateAllEmissions(
      entry.transportation,
      log,
      entry.water,
      entry.food,
      entry.shopping
    );
    saveUpdatedLogs(entry);
  };

  const logWater = (date: string, log: WaterLog) => {
    const entry = getOrCreateLogEntry(date, logs);
    entry.water = log;
    entry.emissions = calculatorEngine.calculateAllEmissions(
      entry.transportation,
      entry.electricity,
      log,
      entry.food,
      entry.shopping
    );
    saveUpdatedLogs(entry);
  };

  const logFood = (date: string, log: FoodLog) => {
    const entry = getOrCreateLogEntry(date, logs);
    entry.food = log;
    entry.emissions = calculatorEngine.calculateAllEmissions(
      entry.transportation,
      entry.electricity,
      entry.water,
      log,
      entry.shopping
    );
    saveUpdatedLogs(entry);
  };

  const logShopping = (date: string, log: ShoppingLog) => {
    const entry = getOrCreateLogEntry(date, logs);
    entry.shopping = log;
    entry.emissions = calculatorEngine.calculateAllEmissions(
      entry.transportation,
      entry.electricity,
      entry.water,
      entry.food,
      log
    );
    saveUpdatedLogs(entry);
  };

  const joinChallenge = (challengeId: string) => {
    const exists = activeChallenges.some(c => c.challengeId === challengeId);
    if (exists) return;

    const newChallenge: ActiveChallenge = {
      challengeId,
      startDate: new Date().toISOString().split('T')[0],
      progress: 0,
      completed: false,
      checkIns: {}
    };

    const updated = [...activeChallenges, newChallenge];
    setActiveChallenges(updated);
    storageRepository.saveActiveChallenges(updated);
  };

  const checkInChallenge = (challengeId: string, date: string, value: number) => {
    const updated = activeChallenges.map(c => {
      if (c.challengeId === challengeId) {
        const checkIns = { ...c.checkIns, [date]: true };
        const newProgress = c.progress + value;
        return {
          ...c,
          progress: newProgress,
          checkIns
        };
      }
      return c;
    });
    setActiveChallenges(updated);
    storageRepository.saveActiveChallenges(updated);
  };

  const completeChallenge = (challengeId: string) => {
    const updated = activeChallenges.map(c => {
      if (c.challengeId === challengeId) {
        if (!c.completed) {
          // Confetti for challenge completion!
          confetti({
            particleCount: 150,
            spread: 80,
            colors: ['#10b981', '#3b82f6', '#f59e0b']
          });
        }
        return { ...c, completed: true };
      }
      return c;
    });
    setActiveChallenges(updated);
    storageRepository.saveActiveChallenges(updated);
  };

  const checkBadgeUnlocks = (updatedLogs: LogEntry[], updatedProfile: UserProfile) => {
    let unlockedAny = false;
    const todayStr = new Date().toISOString().split('T')[0];

    const updatedBadges = badges.map(badge => {
      if (badge.unlockedAt) return badge; // Already unlocked

      let unlockCondition = false;

      switch (badge.id) {
        case 'first-log':
          unlockCondition = updatedLogs.length > 0;
          break;
        case 'low-footprint':
          unlockCondition = updatedLogs.some(l => l.emissions.total > 0 && l.emissions.total < 10);
          break;
        case 'commute-hero':
          unlockCondition = updatedLogs.some(l => l.transportation && ['bike', 'walking', 'train'].includes(l.transportation.mode));
          break;
        case 'power-saver':
          unlockCondition = updatedLogs.some(l => l.electricity && l.electricity.kwh > 0 && l.electricity.kwh < 5);
          break;
        case 'water-conserve':
          unlockCondition = updatedLogs.some(l => l.water && l.water.liters > 0 && l.water.liters < 50);
          break;
        case 'plant-powered':
          unlockCondition = updatedLogs.some(l => l.food && l.food.meatServings === 0 && (l.food.veganMeals > 0 || l.food.dairyServings > 0));
          break;
        case 'conscious-shopper':
          unlockCondition = updatedLogs.some(l => l.shopping && l.shopping.recycleRate >= 80);
          break;
        case 'streak-3':
          unlockCondition = updatedProfile.streak >= 3;
          break;
        case 'streak-7':
          unlockCondition = updatedProfile.streak >= 7;
          break;
      }

      if (unlockCondition) {
        unlockedAny = true;
        return { ...badge, unlockedAt: todayStr };
      }
      return badge;
    });

    if (unlockedAny) {
      setBadges(updatedBadges);
      storageRepository.saveBadges(updatedBadges);
      // Fire double confetti for badge unlock!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const resetData = () => {
    storageRepository.clearAll();
    setProfile(storageRepository.getProfile());
    setLogs(storageRepository.getLogs());
    setActiveChallenges(storageRepository.getActiveChallenges());
    setBadges(storageRepository.getBadges());
  };

  return (
    <AppContext.Provider value={{
      profile,
      logs,
      activeChallenges,
      badges,
      score,
      dailyAverage,
      updateProfile,
      logTransportation,
      logElectricity,
      logWater,
      logFood,
      logShopping,
      joinChallenge,
      checkInChallenge,
      completeChallenge,
      resetData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

import { createContext, useContext } from 'react';
import type { LogEntry, UserProfile, ActiveChallenge, Badge, TransportationLog, ElectricityLog, WaterLog, FoodLog, ShoppingLog } from '../models/types';

export interface AppContextType {
  profile: UserProfile;
  logs: LogEntry[];
  activeChallenges: ActiveChallenge[];
  badges: Badge[];
  score: number;
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
  retireCarbonOffset: (amountKg: number) => void;
  resetData: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

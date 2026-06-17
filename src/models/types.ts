export type Category = 'transportation' | 'electricity' | 'water' | 'food' | 'shopping';

export interface TransportationLog {
  mode: 'car' | 'bus' | 'train' | 'flight' | 'bike' | 'walking';
  distance: number; // in km
  fuelType?: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  vehicleSize?: 'small' | 'medium' | 'large';
}

export interface ElectricityLog {
  kwh: number;
  source: 'grid' | 'mix' | 'solar' | 'wind';
}

export interface WaterLog {
  liters: number;
}

export interface FoodLog {
  meatServings: number;
  dairyServings: number;
  veganMeals: number;
  foodWasteKg: number;
}

export interface ShoppingLog {
  clothingItems: number;
  electronicsItems: number;
  generalPackagingKg: number;
  recycleRate: number; // percentage (0 - 100)
}

export interface LogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  transportation?: TransportationLog;
  electricity?: ElectricityLog;
  water?: WaterLog;
  food?: FoodLog;
  shopping?: ShoppingLog;
  emissions: {
    transportation: number; // in kg CO2e
    electricity: number;
    water: number;
    food: number;
    shopping: number;
    total: number;
  };
}

export interface CarbonScore {
  date: string;
  score: number; // 0 to 100 (100 being best/lowest footprint)
  emissions: number; // total kg CO2e
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: Category;
  durationDays: number;
  co2SavingsKg: number;
  targetValue: number;
  targetDescription: string;
}

export interface ActiveChallenge {
  challengeId: string;
  startDate: string;
  progress: number; // current value
  completed: boolean;
  checkIns: { [date: string]: boolean };
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  category: Category | 'general' | 'streak';
  iconName: string;
  unlockedAt?: string; // date string if unlocked
}

export interface UserProfile {
  name: string;
  dailyGoalKg: number; // target daily emissions limit
  joinedAt: string;
  streak: number;
  lastLoggedDate?: string;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

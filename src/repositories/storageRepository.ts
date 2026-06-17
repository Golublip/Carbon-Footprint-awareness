import type { LogEntry, UserProfile, ActiveChallenge, Badge } from '../models/types';
import { EMISSION_FACTORS } from '../constants/emissionFactors';

const PROFILE_KEY = 'carbon_tracker_profile';
const LOGS_KEY = 'carbon_tracker_logs';
const CHALLENGES_KEY = 'carbon_tracker_active_challenges';
const BADGES_KEY = 'carbon_tracker_badges';

// Default badges
const DEFAULT_BADGES: Badge[] = [
  { id: 'first-log', title: 'Eco Starter', description: 'Log your first daily activities', category: 'general', iconName: 'Leaf' },
  { id: 'low-footprint', title: 'Green Citizen', description: 'Keep daily emissions below 10 kg CO2e', category: 'general', iconName: 'ShieldAlert' },
  { id: 'commute-hero', title: 'Commute Hero', description: 'Walk, cycle, or take a train instead of driving', category: 'transportation', iconName: 'Bike' },
  { id: 'power-saver', title: 'Power Saver', description: 'Use less than 5 kWh of electricity in a day', category: 'electricity', iconName: 'Zap' },
  { id: 'water-conserve', title: 'Water Guardian', description: 'Use less than 50 liters of water in a day', category: 'water', iconName: 'Droplet' },
  { id: 'plant-powered', title: 'Plant Powered', description: 'Log a food habit with zero meat servings', category: 'food', iconName: 'Apple' },
  { id: 'conscious-shopper', title: 'Eco Shopper', description: 'Log a shopping habit with 80%+ recycling rate', category: 'shopping', iconName: 'ShoppingBag' },
  { id: 'streak-3', title: 'Consistent Green', description: 'Maintain a 3-day logging streak', category: 'streak', iconName: 'Calendar' },
  { id: 'streak-7', title: 'Eco Warrior', description: 'Maintain a 7-day logging streak', category: 'streak', iconName: 'Flame' },
];

// Helper to seed 14 days of mock data
function generateSeedLogs(): LogEntry[] {
  const logs: LogEntry[] = [];
  const now = new Date();
  
  for (let i = 14; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Vary the parameters slightly to create nice charts
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    const distance = isWeekend ? 10 + Math.random() * 20 : 15 + Math.random() * 30;
    const mode = isWeekend 
      ? (Math.random() > 0.4 ? 'car' : 'bike') 
      : (Math.random() > 0.3 ? 'train' : 'car');
    
    const kwh = 8 + Math.random() * 6 - (isWeekend ? 2 : 0);
    const liters = 80 + Math.random() * 60;
    
    const meatServings = Math.random() > 0.6 ? 2 : (Math.random() > 0.4 ? 1 : 0);
    const dairyServings = Math.floor(Math.random() * 3);
    const veganMeals = meatServings === 0 ? 3 : 1;
    const foodWasteKg = 0.1 + Math.random() * 0.4;
    
    const clothingItems = Math.random() > 0.85 ? 1 : 0;
    const electronicsItems = Math.random() > 0.95 ? 1 : 0;
    const packagingKg = 0.2 + Math.random() * 0.8;
    const recycleRate = 30 + Math.floor(Math.random() * 60);

    // Calculate emissions
    let transCo2 = 0;
    if (mode === 'car') {
      transCo2 = distance * EMISSION_FACTORS.transportation.car.fuelType.gasoline.medium;
    } else if (mode === 'train') {
      transCo2 = distance * EMISSION_FACTORS.transportation.train;
    } else if (mode === 'bike') {
      transCo2 = distance * EMISSION_FACTORS.transportation.bike;
    }

    const elecCo2 = kwh * EMISSION_FACTORS.electricity.grid;
    const waterCo2 = liters * EMISSION_FACTORS.water.perLiter;
    const foodCo2 = (meatServings * EMISSION_FACTORS.food.meatServing) + 
                    (dairyServings * EMISSION_FACTORS.food.dairyServing) + 
                    (veganMeals * EMISSION_FACTORS.food.veganMeal) + 
                    (foodWasteKg * EMISSION_FACTORS.food.foodWastePerKg);
    const shoppingCo2 = (clothingItems * EMISSION_FACTORS.shopping.clothingItem) +
                        (electronicsItems * EMISSION_FACTORS.shopping.electronicsItem) +
                        (packagingKg * EMISSION_FACTORS.shopping.packagingPerKg) -
                        (packagingKg * (recycleRate / 100) * EMISSION_FACTORS.shopping.recyclingCo2CreditPerKg);

    const total = parseFloat((transCo2 + elecCo2 + waterCo2 + foodCo2 + shoppingCo2).toFixed(2));

    logs.push({
      id: `seed-log-${i}`,
      date: dateStr,
      transportation: {
        mode,
        distance,
        fuelType: mode === 'car' ? 'gasoline' : undefined,
        vehicleSize: mode === 'car' ? 'medium' : undefined
      },
      electricity: {
        kwh,
        source: 'grid'
      },
      water: {
        liters
      },
      food: {
        meatServings,
        dairyServings,
        veganMeals,
        foodWasteKg
      },
      shopping: {
        clothingItems,
        electronicsItems,
        generalPackagingKg: packagingKg,
        recycleRate
      },
      emissions: {
        transportation: parseFloat(transCo2.toFixed(2)),
        electricity: parseFloat(elecCo2.toFixed(2)),
        water: parseFloat(waterCo2.toFixed(2)),
        food: parseFloat(foodCo2.toFixed(2)),
        shopping: parseFloat(shoppingCo2.toFixed(2)),
        total
      }
    });
  }
  return logs;
}

export const storageRepository = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) return JSON.parse(data);
      
      // Default Profile
      const defaultProfile: UserProfile = {
        name: 'Eco Champion',
        dailyGoalKg: 15.0, // Standard sustainable daily target
        joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        streak: 3,
        lastLoggedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalOffsetKg: 0
      };
      this.saveProfile(defaultProfile);
      return defaultProfile;
    } catch (e) {
      console.error('Error reading profile', e);
      return { name: 'User', dailyGoalKg: 15.0, joinedAt: new Date().toISOString().split('T')[0], streak: 0 };
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving profile', e);
    }
  },

  getLogs(): LogEntry[] {
    try {
      const data = localStorage.getItem(LOGS_KEY);
      if (data) return JSON.parse(data);
      
      // Seed initial logs
      const seedLogs = generateSeedLogs();
      this.saveLogs(seedLogs);
      return seedLogs;
    } catch (e) {
      console.error('Error reading logs', e);
      return [];
    }
  },

  saveLogs(logs: LogEntry[]): void {
    try {
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Error saving logs', e);
    }
  },

  getActiveChallenges(): ActiveChallenge[] {
    try {
      const data = localStorage.getItem(CHALLENGES_KEY);
      if (data) return JSON.parse(data);
      
      // Default: seed one active challenge to guide user
      const defaultActive: ActiveChallenge[] = [
        {
          challengeId: 'no-car-day',
          startDate: new Date().toISOString().split('T')[0],
          progress: 0,
          completed: false,
          checkIns: {}
        }
      ];
      this.saveActiveChallenges(defaultActive);
      return defaultActive;
    } catch (e) {
      console.error('Error reading active challenges', e);
      return [];
    }
  },

  saveActiveChallenges(challenges: ActiveChallenge[]): void {
    try {
      localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
    } catch (e) {
      console.error('Error saving active challenges', e);
    }
  },

  getBadges(): Badge[] {
    try {
      const data = localStorage.getItem(BADGES_KEY);
      if (data) {
        // Ensure default badges are matched
        const stored: Badge[] = JSON.parse(data);
        const merged = DEFAULT_BADGES.map(def => {
          const matched = stored.find(s => s.id === def.id);
          return matched ? { ...def, unlockedAt: matched.unlockedAt } : def;
        });
        return merged;
      }
      
      // Initially, mock seed two unlocked badges to make it look achieved
      const initialBadges = [...DEFAULT_BADGES];
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      initialBadges[0].unlockedAt = twoDaysAgo; // Eco Starter
      initialBadges[7].unlockedAt = twoDaysAgo; // Consistent Green (3-day streak)
      
      this.saveBadges(initialBadges);
      return initialBadges;
    } catch (e) {
      console.error('Error reading badges', e);
      return DEFAULT_BADGES;
    }
  },

  saveBadges(badges: Badge[]): void {
    try {
      localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
    } catch (e) {
      console.error('Error saving badges', e);
    }
  },

  clearAll(): void {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(LOGS_KEY);
    localStorage.removeItem(CHALLENGES_KEY);
    localStorage.removeItem(BADGES_KEY);
  }
};

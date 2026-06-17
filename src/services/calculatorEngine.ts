import type { LogEntry, TransportationLog, ElectricityLog, WaterLog, FoodLog, ShoppingLog } from '../models/types';
import { EMISSION_FACTORS } from '../constants/emissionFactors';

export const calculatorEngine = {
  calculateTransportation(log: TransportationLog): number {
    const { mode, distance, fuelType, vehicleSize } = log;
    if (distance <= 0) return 0;

    if (mode === 'car') {
      const fuel = fuelType || 'gasoline';
      const size = vehicleSize || 'medium';
      const factor = EMISSION_FACTORS.transportation.car.fuelType[fuel][size];
      return parseFloat((distance * factor).toFixed(2));
    }

    const factor = EMISSION_FACTORS.transportation[mode] || 0;
    return parseFloat((distance * factor).toFixed(2));
  },

  calculateElectricity(log: ElectricityLog): number {
    const { kwh, source } = log;
    if (kwh <= 0) return 0;
    const factor = EMISSION_FACTORS.electricity[source] || EMISSION_FACTORS.electricity.grid;
    return parseFloat((kwh * factor).toFixed(2));
  },

  calculateWater(log: WaterLog): number {
    const { liters } = log;
    if (liters <= 0) return 0;
    const factor = EMISSION_FACTORS.water.perLiter;
    return parseFloat((liters * factor).toFixed(2));
  },

  calculateFood(log: FoodLog): number {
    const { meatServings, dairyServings, veganMeals, foodWasteKg } = log;
    const meatCo2 = Math.max(0, meatServings) * EMISSION_FACTORS.food.meatServing;
    const dairyCo2 = Math.max(0, dairyServings) * EMISSION_FACTORS.food.dairyServing;
    const veganCo2 = Math.max(0, veganMeals) * EMISSION_FACTORS.food.veganMeal;
    const wasteCo2 = Math.max(0, foodWasteKg) * EMISSION_FACTORS.food.foodWastePerKg;
    return parseFloat((meatCo2 + dairyCo2 + veganCo2 + wasteCo2).toFixed(2));
  },

  calculateShopping(log: ShoppingLog): number {
    const { clothingItems, electronicsItems, generalPackagingKg, recycleRate } = log;
    const clothingCo2 = Math.max(0, clothingItems) * EMISSION_FACTORS.shopping.clothingItem;
    const electronicsCo2 = Math.max(0, electronicsItems) * EMISSION_FACTORS.shopping.electronicsItem;
    
    const packagingBase = Math.max(0, generalPackagingKg) * EMISSION_FACTORS.shopping.packagingPerKg;
    const recyclingCredit = Math.max(0, generalPackagingKg) * (Math.max(0, Math.min(100, recycleRate)) / 100) * EMISSION_FACTORS.shopping.recyclingCo2CreditPerKg;
    const packagingCo2 = Math.max(0, packagingBase - recyclingCredit);

    return parseFloat((clothingCo2 + electronicsCo2 + packagingCo2).toFixed(2));
  },

  calculateAllEmissions(
    transportation?: TransportationLog,
    electricity?: ElectricityLog,
    water?: WaterLog,
    food?: FoodLog,
    shopping?: ShoppingLog
  ): LogEntry['emissions'] {
    const trans = transportation ? this.calculateTransportation(transportation) : 0;
    const elec = electricity ? this.calculateElectricity(electricity) : 0;
    const wat = water ? this.calculateWater(water) : 0;
    const fd = food ? this.calculateFood(food) : 0;
    const shop = shopping ? this.calculateShopping(shopping) : 0;
    const total = parseFloat((trans + elec + wat + fd + shop).toFixed(2));

    return {
      transportation: trans,
      electricity: elec,
      water: wat,
      food: fd,
      shopping: shop,
      total
    };
  },

  /**
   * Carbon Score Calculator
   * Transforms raw carbon footprint into an intuitive 0-100 score where:
   * - 100: Excellent, net-zero or highly sustainable footprint (0 - 5 kg)
   * - 70+: Sustainable footprint within normal targets (5 - 15 kg)
   * - <50: High-carbon footprint exceeding sustainable targets (15+ kg)
   */
  calculateScore(totalEmissions: number, dailyGoal: number): number {
    if (totalEmissions <= 0) return 100;
    const target = dailyGoal || 15.0;
    // Linear scaling: 100 points down to 0
    // If emissions is 0 -> 100 points
    // If emissions is equal to target -> 70 points
    // If emissions is 3x target -> 0 points
    let score = 100 - (totalEmissions / target) * 30;
    if (totalEmissions > target) {
      // Steeper drop after passing target
      score = 70 - ((totalEmissions - target) / (target * 2)) * 70;
    }
    return Math.max(0, Math.min(100, Math.round(score)));
  }
};

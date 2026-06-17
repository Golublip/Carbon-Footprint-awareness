import { describe, it, expect } from 'vitest';
import { calculatorEngine } from '../services/calculatorEngine';

describe('Carbon Calculator Engine Tests', () => {
  describe('Transportation Calculations', () => {
    it('should calculate gasoline car emissions correctly', () => {
      // 100km in a medium gasoline car: 100 * 0.19 = 19 kg CO2e
      const emissions = calculatorEngine.calculateTransportation({
        mode: 'car',
        distance: 100,
        fuelType: 'gasoline',
        vehicleSize: 'medium',
      });
      expect(emissions).toBe(19);
    });

    it('should calculate electric car emissions correctly', () => {
      // 100km in a medium electric car: 100 * 0.04 = 4 kg CO2e
      const emissions = calculatorEngine.calculateTransportation({
        mode: 'car',
        distance: 100,
        fuelType: 'electric',
        vehicleSize: 'medium',
      });
      expect(emissions).toBe(4);
    });

    it('should calculate bus emissions correctly', () => {
      // 50km on a bus: 50 * 0.05 = 2.5 kg CO2e
      const emissions = calculatorEngine.calculateTransportation({
        mode: 'bus',
        distance: 50,
      });
      expect(emissions).toBe(2.5);
    });

    it('should return 0 emissions for walking or biking', () => {
      const bikeEmissions = calculatorEngine.calculateTransportation({
        mode: 'bike',
        distance: 20,
      });
      const walkEmissions = calculatorEngine.calculateTransportation({
        mode: 'walking',
        distance: 5,
      });
      expect(bikeEmissions).toBe(0);
      expect(walkEmissions).toBe(0);
    });
  });

  describe('Electricity Calculations', () => {
    it('should calculate grid electricity footprint correctly', () => {
      // 10 kWh on standard grid: 10 * 0.45 = 4.5 kg CO2e
      const emissions = calculatorEngine.calculateElectricity({
        kwh: 10,
        source: 'grid',
      });
      expect(emissions).toBe(4.5);
    });

    it('should calculate green/solar electricity footprint correctly', () => {
      // 10 kWh on solar: 10 * 0.03 = 0.3 kg CO2e
      const emissions = calculatorEngine.calculateElectricity({
        kwh: 10,
        source: 'solar',
      });
      expect(emissions).toBe(0.3);
    });
  });

  describe('Water Calculations', () => {
    it('should calculate water footprint correctly', () => {
      // 200 Liters: 200 * 0.0003 = 0.06 kg CO2e
      const emissions = calculatorEngine.calculateWater({
        liters: 200,
      });
      expect(emissions).toBe(0.06);
    });
  });

  describe('Food Calculations', () => {
    it('should calculate food habit emissions correctly', () => {
      // 2 meat servings, 3 dairy servings, 1 vegan meal, 0.5kg waste
      // 2*1.8 + 3*0.4 + 1*0.2 + 0.5*2.5 = 3.6 + 1.2 + 0.2 + 1.25 = 6.25 kg
      const emissions = calculatorEngine.calculateFood({
        meatServings: 2,
        dairyServings: 3,
        veganMeals: 1,
        foodWasteKg: 0.5,
      });
      expect(emissions).toBe(6.25);
    });
  });

  describe('Shopping Calculations', () => {
    it('should calculate shopping footprint with recycling credit correctly', () => {
      // 1 clothing, 0 electronics, 1kg packaging, 50% recycling rate
      // 1*8.5 + 0 + (1*0.6 - 1*0.5*0.4) = 8.5 + (0.6 - 0.2) = 8.9 kg
      const emissions = calculatorEngine.calculateShopping({
        clothingItems: 1,
        electronicsItems: 0,
        generalPackagingKg: 1,
        recycleRate: 50,
      });
      expect(emissions).toBe(8.9);
    });
  });

  describe('Carbon Score Calculations', () => {
    it('should calculate score 100 for zero emissions', () => {
      const score = calculatorEngine.calculateScore(0, 15);
      expect(score).toBe(100);
    });

    it('should calculate score 70 when emissions equal daily goal', () => {
      const score = calculatorEngine.calculateScore(15, 15);
      expect(score).toBe(70);
    });

    it('should calculate lower scores for high emissions', () => {
      const score = calculatorEngine.calculateScore(45, 15);
      expect(score).toBe(0);
    });
  });
});

export interface EmissionFactors {
  transportation: {
    car: {
      fuelType: {
        gasoline: { small: number; medium: number; large: number };
        diesel: { small: number; medium: number; large: number };
        hybrid: { small: number; medium: number; large: number };
        electric: { small: number; medium: number; large: number };
      };
    };
    bus: number;
    train: number;
    flight: number;
    bike: number;
    walking: number;
  };
  electricity: {
    grid: number;
    mix: number;
    solar: number;
    wind: number;
  };
  water: {
    perLiter: number;
  };
  food: {
    meatServing: number;
    dairyServing: number;
    veganMeal: number;
    foodWastePerKg: number;
  };
  shopping: {
    clothingItem: number;
    electronicsItem: number;
    packagingPerKg: number;
    recyclingCo2CreditPerKg: number; // Credit if recycled
  };
}

export const EMISSION_FACTORS: EmissionFactors = {
  transportation: {
    car: {
      fuelType: {
        gasoline: { small: 0.14, medium: 0.19, large: 0.25 },
        diesel: { small: 0.13, medium: 0.17, large: 0.23 },
        hybrid: { small: 0.08, medium: 0.11, large: 0.15 },
        electric: { small: 0.02, medium: 0.04, large: 0.06 },
      },
    },
    bus: 0.05,        // kg CO2e per passenger km
    train: 0.03,      // kg CO2e per passenger km
    flight: 0.15,     // kg CO2e per passenger km
    bike: 0.0,
    walking: 0.0,
  },
  electricity: {
    grid: 0.45,       // kg CO2e per kWh (standard fossil-heavy grid)
    mix: 0.22,        // kg CO2e per kWh (cleaner grid / utility green mix)
    solar: 0.03,      // kg CO2e per kWh (lifecycle PV solar)
    wind: 0.01,       // kg CO2e per kWh (lifecycle wind)
  },
  water: {
    perLiter: 0.0003, // kg CO2e per liter (water treatment and pumping)
  },
  food: {
    meatServing: 1.8,  // kg CO2e per serving (beef/pork/chicken average)
    dairyServing: 0.4, // kg CO2e per serving
    veganMeal: 0.2,    // kg CO2e per meal
    foodWastePerKg: 2.5, // kg CO2e per kg in landfill
  },
  shopping: {
    clothingItem: 8.5,     // kg CO2e per standard garment
    electronicsItem: 95.0, // kg CO2e per mobile/laptop device average
    packagingPerKg: 0.6,   // kg CO2e per kg of cardboard/plastics
    recyclingCo2CreditPerKg: 0.4, // kg CO2e credit saved by recycling 1kg
  },
};

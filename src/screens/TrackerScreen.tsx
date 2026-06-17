import React, { useState } from 'react';
import { useApp } from '../providers/AppContext';
import { Card, Button, Input, Select } from '../widgets/SharedUI';
import { Bus, Zap, Droplet, Apple, ShoppingBag, Calendar, CheckCircle } from 'lucide-react';
import type { LogEntry, TransportationLog, ElectricityLog, WaterLog, FoodLog, ShoppingLog } from '../models/types';

type Tab = 'transportation' | 'electricity' | 'water' | 'food' | 'shopping';

interface TrackerFormProps {
  date: string;
  logs: LogEntry[];
  logTransportation: (date: string, log: TransportationLog) => void;
  logElectricity: (date: string, log: ElectricityLog) => void;
  logWater: (date: string, log: WaterLog) => void;
  logFood: (date: string, log: FoodLog) => void;
  logShopping: (date: string, log: ShoppingLog) => void;
}

const TrackerForm: React.FC<TrackerFormProps> = ({
  date,
  logs,
  logTransportation,
  logElectricity,
  logWater,
  logFood,
  logShopping
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('transportation');
  const [successMessage, setSuccessMessage] = useState('');

  const log = logs.find(l => l.date === date);

  // Form States
  // 1. Transportation
  const [transMode, setTransMode] = useState<'car' | 'bus' | 'train' | 'flight' | 'bike' | 'walking'>(
    log?.transportation?.mode || 'car'
  );
  const [distance, setDistance] = useState(
    log?.transportation?.distance !== undefined ? log.transportation.distance.toString() : '0'
  );
  const [fuelType, setFuelType] = useState<'gasoline' | 'diesel' | 'hybrid' | 'electric'>(
    log?.transportation?.fuelType || 'gasoline'
  );
  const [vehicleSize, setVehicleSize] = useState<'small' | 'medium' | 'large'>(
    log?.transportation?.vehicleSize || 'medium'
  );
  const [transError, setTransError] = useState('');

  // 2. Electricity
  const [kwh, setKwh] = useState(
    log?.electricity?.kwh !== undefined ? log.electricity.kwh.toString() : '0'
  );
  const [elecSource, setElecSource] = useState<'grid' | 'mix' | 'solar' | 'wind'>(
    log?.electricity?.source || 'grid'
  );
  const [elecError, setElecError] = useState('');

  // 3. Water
  const [liters, setLiters] = useState(
    log?.water?.liters !== undefined ? log.water.liters.toString() : '0'
  );
  const [waterError, setWaterError] = useState('');

  // 4. Food
  const [meatServings, setMeatServings] = useState(
    log?.food?.meatServings !== undefined ? log.food.meatServings.toString() : '0'
  );
  const [dairyServings, setDairyServings] = useState(
    log?.food?.dairyServings !== undefined ? log.food.dairyServings.toString() : '0'
  );
  const [veganMeals, setVeganMeals] = useState(
    log?.food?.veganMeals !== undefined ? log.food.veganMeals.toString() : '0'
  );
  const [foodWaste, setFoodWaste] = useState(
    log?.food?.foodWasteKg !== undefined ? log.food.foodWasteKg.toString() : '0'
  );
  const [foodError, setFoodError] = useState('');

  // 5. Shopping
  const [clothing, setClothing] = useState(
    log?.shopping?.clothingItems !== undefined ? log.shopping.clothingItems.toString() : '0'
  );
  const [electronics, setElectronics] = useState(
    log?.shopping?.electronicsItems !== undefined ? log.shopping.electronicsItems.toString() : '0'
  );
  const [packaging, setPackaging] = useState(
    log?.shopping?.generalPackagingKg !== undefined ? log.shopping.generalPackagingKg.toString() : '0'
  );
  const [recycleRate, setRecycleRate] = useState(
    log?.shopping?.recycleRate !== undefined ? log.shopping.recycleRate.toString() : '0'
  );
  const [shopError, setShopError] = useState('');

  const triggerSuccess = (message: string) => {
    setSuccessMessage(message);
    const timer = setTimeout(() => {
      setSuccessMessage('');
    }, 3500);
    return () => clearTimeout(timer);
  };

  const handleTransSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const distNum = parseFloat(distance);
    if (isNaN(distNum) || distNum < 0) {
      setTransError('Distance must be a positive number');
      return;
    }
    setTransError('');
    logTransportation(date, {
      mode: transMode,
      distance: distNum,
      fuelType: transMode === 'car' ? fuelType : undefined,
      vehicleSize: transMode === 'car' ? vehicleSize : undefined,
    });
    triggerSuccess('Transportation log updated successfully!');
  };

  const handleElecSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const kwhNum = parseFloat(kwh);
    if (isNaN(kwhNum) || kwhNum < 0) {
      setElecError('Electricity (kWh) must be a positive number');
      return;
    }
    setElecError('');
    logElectricity(date, { kwh: kwhNum, source: elecSource });
    triggerSuccess('Electricity log updated successfully!');
  };

  const handleWaterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const litersNum = parseFloat(liters);
    if (isNaN(litersNum) || litersNum < 0) {
      setWaterError('Water (liters) must be a positive number');
      return;
    }
    setWaterError('');
    logWater(date, { liters: litersNum });
    triggerSuccess('Water usage log updated successfully!');
  };

  const handleFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const meat = parseInt(meatServings);
    const dairy = parseInt(dairyServings);
    const vegan = parseInt(veganMeals);
    const waste = parseFloat(foodWaste);

    if (isNaN(meat) || meat < 0 || isNaN(dairy) || dairy < 0 || isNaN(vegan) || vegan < 0 || isNaN(waste) || waste < 0) {
      setFoodError('All food values must be positive numbers');
      return;
    }
    setFoodError('');
    logFood(date, { meatServings: meat, dairyServings: dairy, veganMeals: vegan, foodWasteKg: waste });
    triggerSuccess('Food habits log updated successfully!');
  };

  const handleShopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clothNum = parseInt(clothing);
    const elecNum = parseInt(electronics);
    const packNum = parseFloat(packaging);
    const recycleNum = parseFloat(recycleRate);

    if (isNaN(clothNum) || clothNum < 0 || isNaN(elecNum) || elecNum < 0 || isNaN(packNum) || packNum < 0) {
      setShopError('Purchased items and packaging must be positive numbers');
      return;
    }
    if (isNaN(recycleNum) || recycleNum < 0 || recycleNum > 100) {
      setShopError('Recycle rate must be between 0% and 100%');
      return;
    }
    setShopError('');
    logShopping(date, {
      clothingItems: clothNum,
      electronicsItems: elecNum,
      generalPackagingKg: packNum,
      recycleRate: recycleNum,
    });
    triggerSuccess('Shopping log updated successfully!');
  };

  const tabs = [
    { id: 'transportation', label: 'Transit', icon: Bus },
    { id: 'electricity', label: 'Energy', icon: Zap },
    { id: 'water', label: 'Water', icon: Droplet },
    { id: 'food', label: 'Food', icon: Apple },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  ];

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-400 rounded-lg p-4 flex items-center gap-3" role="status">
          <CheckCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1 overflow-x-auto pb-px" role="tablist" aria-label="Category logger tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-t-md ${
                isSelected
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/10'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {/* 1. Transportation */}
      <div id="transportation-panel" role="tabpanel" aria-labelledby="transportation-tab" hidden={activeTab !== 'transportation'}>
        <Card>
          <form onSubmit={handleTransSubmit} className="space-y-4">
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">Transit Habits</h3>
            
            <Select
              label="Mode of Transport"
              id="trans-mode"
              value={transMode}
              onChange={e => setTransMode(e.target.value as 'car' | 'bus' | 'train' | 'flight' | 'bike' | 'walking')}
              options={[
                { value: 'car', label: 'Passenger Car' },
                { value: 'bus', label: 'Transit Bus' },
                { value: 'train', label: 'Train / Metro' },
                { value: 'flight', label: 'Airplane Flight' },
                { value: 'bike', label: 'Bicycle / Electric Scooter' },
                { value: 'walking', label: 'Walking' },
              ]}
            />

            <Input
              label="Distance Traveled (km)"
              id="trans-distance"
              type="number"
              step="any"
              value={distance}
              onChange={e => setDistance(e.target.value)}
              error={transError}
            />

            {transMode === 'car' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Select
                  label="Fuel Type"
                  id="car-fuel"
                  value={fuelType}
                  onChange={e => setFuelType(e.target.value as 'gasoline' | 'diesel' | 'hybrid' | 'electric')}
                  options={[
                    { value: 'gasoline', label: 'Gasoline' },
                    { value: 'diesel', label: 'Diesel' },
                    { value: 'hybrid', label: 'Hybrid' },
                    { value: 'electric', label: 'Electric' },
                  ]}
                />
                <Select
                  label="Vehicle Size"
                  id="car-size"
                  value={vehicleSize}
                  onChange={e => setVehicleSize(e.target.value as 'small' | 'medium' | 'large')}
                  options={[
                    { value: 'small', label: 'Compact / Small' },
                    { value: 'medium', label: 'Sedan / Medium' },
                    { value: 'large', label: 'SUV / Large Truck' },
                  ]}
                />
              </div>
            )}

            <Button type="submit" ariaLabel="Save transportation log" className="w-full mt-4">
              Update Transit Log
            </Button>
          </form>
        </Card>
      </div>

      {/* 2. Electricity */}
      <div id="electricity-panel" role="tabpanel" aria-labelledby="electricity-tab" hidden={activeTab !== 'electricity'}>
        <Card>
          <form onSubmit={handleElecSubmit} className="space-y-4">
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">Household Electricity</h3>

            <Input
              label="Electricity Consumption (kWh)"
              id="elec-kwh"
              type="number"
              step="any"
              value={kwh}
              onChange={e => setKwh(e.target.value)}
              error={elecError}
            />

            <Select
              label="Energy Sourcing"
              id="elec-source"
              value={elecSource}
              onChange={e => setElecSource(e.target.value as 'grid' | 'mix' | 'solar' | 'wind')}
              options={[
                { value: 'grid', label: 'Standard Local Grid (Coal/Gas heavy)' },
                { value: 'mix', label: 'Utility Green Power Mix' },
                { value: 'solar', label: 'Residential Solar Panels' },
                { value: 'wind', label: '100% Wind Power Contract' },
              ]}
            />

            <Button type="submit" ariaLabel="Save electricity log" className="w-full mt-4">
              Update Energy Log
            </Button>
          </form>
        </Card>
      </div>

      {/* 3. Water */}
      <div id="water-panel" role="tabpanel" aria-labelledby="water-tab" hidden={activeTab !== 'water'}>
        <Card>
          <form onSubmit={handleWaterSubmit} className="space-y-4">
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">Water Consumption</h3>

            <Input
              label="Water Consumed (Liters)"
              id="water-liters"
              type="number"
              step="any"
              value={liters}
              onChange={e => setLiters(e.target.value)}
              error={waterError}
            />

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed italic">
              Average water usage runs around 120 liters per day per person (covering showers, cleaning, cooking, and sanitation).
            </p>

            <Button type="submit" ariaLabel="Save water log" className="w-full mt-4">
              Update Water Log
            </Button>
          </form>
        </Card>
      </div>

      {/* 4. Food */}
      <div id="food-panel" role="tabpanel" aria-labelledby="food-tab" hidden={activeTab !== 'food'}>
        <Card>
          <form onSubmit={handleFoodSubmit} className="space-y-4">
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">Food Habits</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Meat Servings"
                id="food-meat"
                type="number"
                value={meatServings}
                onChange={e => setMeatServings(e.target.value)}
              />
              <Input
                label="Dairy Servings"
                id="food-dairy"
                type="number"
                value={dairyServings}
                onChange={e => setDairyServings(e.target.value)}
              />
              <Input
                label="Vegan Meals"
                id="food-vegan"
                type="number"
                value={veganMeals}
                onChange={e => setVeganMeals(e.target.value)}
              />
            </div>

            <Input
              label="Food Waste (kg)"
              id="food-waste"
              type="number"
              step="any"
              value={foodWaste}
              onChange={e => setFoodWaste(e.target.value)}
              error={foodError}
            />

            <Button type="submit" ariaLabel="Save food log" className="w-full mt-4">
              Update Food Log
            </Button>
          </form>
        </Card>
      </div>

      {/* 5. Shopping */}
      <div id="shopping-panel" role="tabpanel" aria-labelledby="shopping-tab" hidden={activeTab !== 'shopping'}>
        <Card>
          <form onSubmit={handleShopSubmit} className="space-y-4">
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">Shopping & Packaging</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Clothing Items Purchased"
                id="shop-clothing"
                type="number"
                value={clothing}
                onChange={e => setClothing(e.target.value)}
              />
              <Input
                label="Electronics Purchased"
                id="shop-elec"
                type="number"
                value={electronics}
                onChange={e => setElectronics(e.target.value)}
              />
            </div>

            <Input
              label="General Packaging/Trash (kg)"
              id="shop-packaging"
              type="number"
              step="any"
              value={packaging}
              onChange={e => setPackaging(e.target.value)}
            />

            <Input
              label="Recycle / Compost Rate (%)"
              id="shop-recycle"
              type="number"
              min="0"
              max="100"
              value={recycleRate}
              onChange={e => setRecycleRate(e.target.value)}
              error={shopError}
            />

            <Button type="submit" ariaLabel="Save shopping log" className="w-full mt-4">
              Update Shopping Log
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export const TrackerScreen: React.FC = () => {
  const { logs, logTransportation, logElectricity, logWater, logFood, logShopping } = useApp();
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
          Activity Logger
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Record your daily habits to compute your carbon footprint and score.
        </p>
      </div>

      {/* Date Selector */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-500 shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Logging Date</span>
        </div>
        <div className="w-full sm:w-48">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-950 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label="Select date to log activities"
          />
        </div>
      </Card>

      {/* The form with key={date} */}
      <TrackerForm
        key={date}
        date={date}
        logs={logs}
        logTransportation={logTransportation}
        logElectricity={logElectricity}
        logWater={logWater}
        logFood={logFood}
        logShopping={logShopping}
      />
    </div>
  );
};

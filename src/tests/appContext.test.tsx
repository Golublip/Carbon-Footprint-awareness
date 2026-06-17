import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AppProvider } from '../providers/AppProvider';
import { useApp } from '../providers/AppContext';

// Test consumer component
const TestConsumer: React.FC = () => {
  const {
    profile,
    logs,
    activeChallenges,
    badges,
    score,
    updateProfile,
    logTransportation,
    logElectricity,
    logWater,
    logFood,
    logShopping,
    joinChallenge,
    checkInChallenge,
    completeChallenge,
    resetData,
  } = useApp();

  return (
    <div>
      <div data-testid="profile-name">{profile.name}</div>
      <div data-testid="profile-goal">{profile.dailyGoalKg}</div>
      <div data-testid="logs-count">{logs.length}</div>
      <div data-testid="score">{score}</div>
      <div data-testid="active-challenges">{activeChallenges.length}</div>
      <div data-testid="badge-first-log">{badges.find(b => b.id === 'first-log')?.unlockedAt ? 'unlocked' : 'locked'}</div>
      <div data-testid="badge-conscious-shopper">{badges.find(b => b.id === 'conscious-shopper')?.unlockedAt ? 'unlocked' : 'locked'}</div>
      
      <button onClick={() => updateProfile('Jane Doe', 10.0)} data-testid="btn-update-profile">Update Profile</button>
      <button onClick={() => logTransportation('2026-06-17', { mode: 'bike', distance: 10 })} data-testid="btn-log-bike">Log Bike</button>
      <button onClick={() => logTransportation('2026-06-17', { mode: 'car', distance: 50, fuelType: 'gasoline', vehicleSize: 'medium' })} data-testid="btn-log-car">Log Car</button>
      <button onClick={() => logElectricity('2026-06-17', { kwh: 12, source: 'grid' })} data-testid="btn-log-elec">Log Elec</button>
      <button onClick={() => logWater('2026-06-17', { liters: 120 })} data-testid="btn-log-water">Log Water</button>
      <button onClick={() => logFood('2026-06-17', { meatServings: 1, dairyServings: 2, veganMeals: 1, foodWasteKg: 0.4 })} data-testid="btn-log-food">Log Food</button>
      <button onClick={() => logShopping('2026-06-17', { clothingItems: 1, electronicsItems: 0, generalPackagingKg: 0.5, recycleRate: 85 })} data-testid="btn-log-shop">Log Shop</button>
      <button onClick={() => joinChallenge('no-car-day')} data-testid="btn-join-challenge">Join Challenge</button>
      <button onClick={() => checkInChallenge('no-car-day', '2026-06-17', 1)} data-testid="btn-checkin-challenge">Checkin Challenge</button>
      <button onClick={() => completeChallenge('no-car-day')} data-testid="btn-complete-challenge">Complete Challenge</button>
      <button onClick={resetData} data-testid="btn-reset">Reset</button>
    </div>
  );
};

describe('App Context and State Management Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderContext = () => render(
    <AppProvider>
      <TestConsumer />
    </AppProvider>
  );

  it('should seed initial profile and logs on startup', () => {
    renderContext();
    expect(screen.getByTestId('profile-name').textContent).toBe('Eco Champion');
    expect(screen.getByTestId('profile-goal').textContent).toBe('15');
    expect(parseInt(screen.getByTestId('logs-count').textContent || '0')).toBeGreaterThan(10);
  });

  it('should allow profile name and daily goal updates', () => {
    renderContext();
    
    act(() => {
      screen.getByTestId('btn-update-profile').click();
    });

    expect(screen.getByTestId('profile-name').textContent).toBe('Jane Doe');
    expect(screen.getByTestId('profile-goal').textContent).toBe('10');
  });

  it('should calculate score updates dynamically when logging actions', () => {
    renderContext();
    
    act(() => {
      screen.getByTestId('btn-log-car').click();
    });

    const scoreVal = parseInt(screen.getByTestId('score').textContent || '100');
    expect(scoreVal).toBeLessThan(100);
  });

  it('should toggle badges on meeting goals', () => {
    renderContext();
    
    act(() => {
      screen.getByTestId('btn-log-bike').click();
    });

    expect(screen.getByTestId('badge-first-log').textContent).toBe('unlocked');
  });

  it('should support joining active challenges', () => {
    renderContext();
    
    act(() => {
      screen.getByTestId('btn-join-challenge').click();
    });

    expect(screen.getByTestId('active-challenges').textContent).toBe('1');
  });

  it('should support logging all categories, tracking challenge progress, and unlocking badges', () => {
    renderContext();

    act(() => {
      screen.getByTestId('btn-log-elec').click();
      screen.getByTestId('btn-log-water').click();
      screen.getByTestId('btn-log-food').click();
      screen.getByTestId('btn-log-shop').click();
    });

    // Conscious Shopper badge should unlock on shop log with 85% recycle rate
    expect(screen.getByTestId('badge-conscious-shopper').textContent).toBe('unlocked');

    // Join, Checkin, and Complete challenge
    act(() => {
      screen.getByTestId('btn-join-challenge').click();
    });
    expect(screen.getByTestId('active-challenges').textContent).toBe('1');

    act(() => {
      screen.getByTestId('btn-checkin-challenge').click();
      screen.getByTestId('btn-complete-challenge').click();
    });

    // Reset data
    act(() => {
      screen.getByTestId('btn-reset').click();
    });
    expect(screen.getByTestId('profile-name').textContent).toBe('Eco Champion');
  });
});

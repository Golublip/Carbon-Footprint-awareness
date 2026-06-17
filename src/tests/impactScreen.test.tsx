import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { AppProvider } from '../providers/AppProvider';
import { ImpactScreen } from '../screens/ImpactScreen';

describe('Impact Hub Screen Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderScreen = () => render(
    <AppProvider>
      <ImpactScreen />
    </AppProvider>
  );

  it('renders carbon offset marketplace, community feed, and leaderboard widgets', () => {
    renderScreen();

    // Headers
    expect(screen.getByText('Impact & Community Hub')).toBeInTheDocument();
    expect(screen.getByText('Carbon Offset Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Eco Champions Feed')).toBeInTheDocument();
    expect(screen.getByText('Collective Carbon Milestone')).toBeInTheDocument();
    expect(screen.getByText('Eco Savings Leaderboard')).toBeInTheDocument();

    // Default Offset Projects
    expect(screen.getByText('Amazon Basin Reforestation')).toBeInTheDocument();
    expect(screen.getByText('Solar & Clean Cookstoves')).toBeInTheDocument();
    expect(screen.getByText('Renewable Wind Infrastructure')).toBeInTheDocument();

    // Current User Carbon Retirement
    expect(screen.getByText('Your Carbon Retirement')).toBeInTheDocument();
  });

  it('calculates cost estimates dynamically on offset amount changes', () => {
    renderScreen();

    const amountInput = screen.getByLabelText('Carbon to Offset (kg CO2e)');
    
    // Default estimated cost for Amazon Basin Reforestation is 50 * 0.015 = 0.75
    expect(screen.getByText(/\$0\.75/)).toBeInTheDocument();

    // Change amount to 100
    fireEvent.change(amountInput, { target: { value: '100' } });
    expect(screen.getByText(/\$1\.50/)).toBeInTheDocument();

    // Change amount to 0
    fireEvent.change(amountInput, { target: { value: '0' } });
    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
  });

  it('supports selecting different offset projects and updates price estimations', () => {
    renderScreen();

    // Switch to Solar & Clean Cookstoves (pricePerKg = 0.012)
    const cookstovesRadio = screen.getByText('Solar & Clean Cookstoves');
    fireEvent.click(cookstovesRadio);

    // 50 * 0.012 = 0.60
    expect(screen.getByText(/\$0\.60/)).toBeInTheDocument();
  });

  it('supports selecting different offset projects using keyboard events (Space and Enter)', () => {
    renderScreen();

    const cookstovesRadio = screen.getByText('Solar & Clean Cookstoves').closest('[role="radio"]')!;
    
    // Press Enter
    fireEvent.keyDown(cookstovesRadio, { key: 'Enter' });
    expect(screen.getByText(/\$0\.60/)).toBeInTheDocument();

    // Switch back to Amazon via Space key
    const amazonRadio = screen.getByText('Amazon Basin Reforestation').closest('[role="radio"]')!;
    fireEvent.keyDown(amazonRadio, { key: ' ' });
    expect(screen.getByText(/\$0\.75/)).toBeInTheDocument();
  });

  it('validates carbon offset input and displays error notifications on invalid data', () => {
    renderScreen();

    const amountInput = screen.getByLabelText('Carbon to Offset (kg CO2e)');
    const submitBtn = screen.getByRole('button', { name: 'Retire 50 kg of carbon offsets' }); // matching ariaLabel

    // Set invalid negative value
    fireEvent.change(amountInput, { target: { value: '-10' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Please enter a valid positive carbon amount to offset.')).toBeInTheDocument();
  });

  it('allows user to successfully retire offsets, updates profile totals, and appends to feed', () => {
    renderScreen();

    const amountInput = screen.getByLabelText('Carbon to Offset (kg CO2e)');
    const submitBtn = screen.getByRole('button', { name: 'Retire 50 kg of carbon offsets' });

    // Enter 120 kg offset
    fireEvent.change(amountInput, { target: { value: '120' } });
    
    act(() => {
      fireEvent.click(submitBtn);
    });

    // Success notification banner should appear
    expect(screen.getByText(/Successfully retired 120\.0 kg CO2e through the/)).toBeInTheDocument();

    // New offset post should be prepended to the community feed
    expect(screen.getByText(/Just retired 120\.0 kg of CO2e offsets supporting the/)).toBeInTheDocument();
  });

  it('allows user to cheer/like community feed posts', () => {
    renderScreen();

    // Find first Cheer button
    const cheerBtns = screen.getAllByRole('button', { name: /Cheer/ });

    // Toggle cheer on
    act(() => {
      fireEvent.click(cheerBtns[0]);
    });
    expect(cheerBtns[0].textContent).toBe('Cheer (13)');

    // Toggle cheer off
    act(() => {
      fireEvent.click(cheerBtns[0]);
    });
    expect(cheerBtns[0].textContent).toBe('Cheer (12)');
  });

  it('allows user to publish their weekly progress summary directly to the community feed', () => {
    renderScreen();

    const shareBtn = screen.getByRole('button', { name: 'Share weekly carbon summary to feed' });
    
    act(() => {
      fireEvent.click(shareBtn);
    });

    // Check that summary post was appended to the feed
    expect(screen.getByText(/Weekly Update: I saved/)).toBeInTheDocument();
  });
});

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider } from '../providers/ThemeProvider';
import { useTheme } from '../providers/ThemeContext';

const ThemeConsumer: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-val">{theme}</span>
      <button onClick={toggleTheme} data-testid="btn-toggle">Toggle Theme</button>
    </div>
  );
};

describe('Theme Context Tests', () => {
  it('should initialize theme and toggle theme modes correctly', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const themeVal = screen.getByTestId('theme-val');
    // Default to dark mode based on initial settings or standard fallback
    const initialTheme = themeVal.textContent;
    expect(['light', 'dark']).toContain(initialTheme);

    act(() => {
      screen.getByTestId('btn-toggle').click();
    });

    const toggledTheme = themeVal.textContent;
    expect(toggledTheme).not.toBe(initialTheme);
    expect(document.documentElement.classList.contains('dark')).toBe(toggledTheme === 'dark');
  });
});

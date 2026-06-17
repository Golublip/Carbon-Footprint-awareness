import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia for dark mode testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock print for report export testing
Object.defineProperty(window, 'print', {
  writable: true,
  value: vi.fn(),
});

// Mock canvas-confetti
vi.mock('canvas-confetti', () => {
  return {
    default: vi.fn(),
  };
});

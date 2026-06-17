import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, Card, Input, Modal } from '../widgets/SharedUI';
import { AccessibleDonutChart, AccessibleBarChart, AccessibleLineChart } from '../widgets/AccessibleChart';
import type { LogEntry } from '../models/types';

describe('Accessible Widgets Tests', () => {
  describe('Card Component', () => {
    it('renders card child content correctly', () => {
      render(
        <Card ariaLabel="Test Card">
          <span>Card Content</span>
        </Card>
      );
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });
  });

  describe('Button Component', () => {
    it('renders with accessibility label and fires onClick', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} ariaLabel="Accessible Action Button">
          Click Me
        </Button>
      );
      
      const button = screen.getByLabelText('Accessible Action Button');
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe('Click Me');
      
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('honors disabled state and prevents click execution', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled ariaLabel="Disabled Button">
          Click Me
        </Button>
      );
      const button = screen.getByLabelText('Disabled Button');
      expect(button).toBeDisabled();
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Input Component', () => {
    it('sets correct accessibility label and outputs validation error alerts', () => {
      render(
        <Input
          label="Test Input Label"
          id="test-input"
          error="This field is required"
          value="invalid input"
          onChange={() => {}}
        />
      );
      const input = screen.getByLabelText('Test Input Label');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-invalid', 'true');
      
      const errorMsg = screen.getByRole('alert');
      expect(errorMsg).toBeInTheDocument();
      expect(errorMsg.textContent).toBe('This field is required');
    });
  });

  describe('Modal Component', () => {
    it('should show content when open, and hide when closed', () => {
      const handleClose = vi.fn();
      const { rerender } = render(
        <Modal isOpen={true} onClose={handleClose} title="Accessible Modal" ariaLabelledBy="m-title">
          <p>Modal Body Text</p>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Modal Body Text')).toBeInTheDocument();

      rerender(
        <Modal isOpen={false} onClose={handleClose} title="Accessible Modal" ariaLabelledBy="m-title">
          <p>Modal Body Text</p>
        </Modal>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('AccessibleChart Components', () => {
    it('toggles between SVG and HTML table representation upon button click for Donut Chart', () => {
      const mockData = [
        { label: 'Category A', value: 10, color: '#ff0000' },
        { label: 'Category B', value: 20, color: '#00ff00' }
      ];

      render(<AccessibleDonutChart data={mockData} title="Test Donut" unit="kg" />);
      
      const svg = screen.getByRole('img');
      expect(svg).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();

      const toggleBtn = screen.getByLabelText('Switch to table view for Test Donut');
      fireEvent.click(toggleBtn);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('toggles between SVG and HTML table for Bar Chart', () => {
      const mockData = [
        { label: 'Item 1', value: 15, color: '#000' },
        { label: 'Item 2', value: 30, color: '#fff' }
      ];

      render(<AccessibleBarChart data={mockData} title="Test Bar" unit="points" />);
      
      const svg = screen.getByRole('img');
      expect(svg).toBeInTheDocument();

      const toggleBtn = screen.getByLabelText('Switch to table view for Test Bar');
      fireEvent.click(toggleBtn);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('toggles between SVG and HTML table for Line Chart', () => {
      const mockLogs: LogEntry[] = [
        { id: '1', date: '2026-06-16', emissions: { transportation: 5, electricity: 0, water: 0, food: 0, shopping: 0, total: 5 } },
        { id: '2', date: '2026-06-17', emissions: { transportation: 10, electricity: 0, water: 0, food: 0, shopping: 0, total: 10 } }
      ];

      render(<AccessibleLineChart logs={mockLogs} title="Test Line" dataKey="total" />);
      
      const svg = screen.getByRole('img');
      expect(svg).toBeInTheDocument();

      const toggleBtn = screen.getByLabelText('Switch to table view for Test Line');
      fireEvent.click(toggleBtn);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });
});

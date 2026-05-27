import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCard } from './StatsCard';

describe('StatsCard Component', () => {
  const defaultProps = {
    title: 'Jumlah Unit',
    value: '1,234',
    icon: <span data-testid="test-icon">icon</span>,
    colorClass: 'bg-blue-500'
  };

  it('renders title and value correctly', () => {
    render(<StatsCard {...defaultProps} />);
    expect(screen.getByText('Jumlah Unit')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders subtitle if provided', () => {
    render(<StatsCard {...defaultProps} subtitle="Subjudul Khas" />);
    expect(screen.getByText('Subjudul Khas')).toBeInTheDocument();
  });

  it('renders trend indicating up direction correctly', () => {
    render(<StatsCard {...defaultProps} trend="12%" trendType="up" />);
    const trendText = screen.getByText(/↑ 12%/);
    expect(trendText).toBeInTheDocument();
    expect(trendText).toHaveClass('text-green-500');
  });

  it('renders trend indicating down direction correctly', () => {
    render(<StatsCard {...defaultProps} trend="5%" trendType="down" />);
    const trendText = screen.getByText(/↓ 5%/);
    expect(trendText).toBeInTheDocument();
    expect(trendText).toHaveClass('text-red-500');
  });

  it('renders custom icon and color class', () => {
    const { container } = render(<StatsCard {...defaultProps} />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    
    // Check colorClass wrapper div
    const iconContainer = container.querySelector('.bg-blue-500');
    expect(iconContainer).toBeInTheDocument();
  });
});

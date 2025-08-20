import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import VisitorCounter from '../ui/VisitorCounter';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_COUNTER_WORKSPACE: 'perhitsiksha',
  },
  writable: true,
});

describe('VisitorCounter', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it('renders loading state initially', () => {
    render(<VisitorCounter />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('displays view count after loading', async () => {
    render(<VisitorCounter />);

    // Wait for the component to load and display the count
    await waitFor(
      () => {
        expect(screen.getByText(/views/)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Should show base count (350) + mocked API count (25) = 375
    expect(screen.getByText('375 views')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<VisitorCounter className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders with proper structure', () => {
    const { container } = render(<VisitorCounter />);

    // Should have the SVG icon
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');

    // Should have the view text span
    const textSpan = screen.getByText(/views|\.\.\./);
    expect(textSpan).toHaveClass('font-medium');
  });
});

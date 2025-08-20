import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
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

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('VisitorCounter', () => {
  beforeEach(() => {
    // Clear all mocks completely
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    mockFetch.mockClear();

    // Reset to default behavior - no cached data
    localStorageMock.getItem.mockReturnValue(null);

    // Reset fetch to throw by default - each test must explicitly mock success
    mockFetch.mockRejectedValue(new Error('No mock configured'));

    // Clear any timers from previous tests
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders loading state initially', () => {
    // Mock a delayed API response
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<VisitorCounter />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('displays view count after loading', async () => {
    // Mock successful API response - override default error
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          code: '200',
          data: {
            id: 1,
            name: 'perhitsiksha-visits',
            slug: 'perhitsiksha-visits',
            up_count: 25,
            down_count: 0,
            created_at: '2025-08-20T09:37:57Z',
            updated_at: '2025-08-20T09:37:57Z',
            workspace_id: 462,
            workspace_slug: 'perhitsiksha',
            team_id: 597,
            user_id: 634,
            description: '',
          },
        }),
    });

    render(<VisitorCounter />);

    // Wait for the component to load and display the count
    await waitFor(
      () => {
        expect(screen.getByText(/views/)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Should show base count (10 in dev) + mocked API count (25) = 35
    expect(screen.getByText('35 views')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    // Mock a delayed API response so test doesn't wait
    mockFetch.mockImplementation(() => new Promise(() => {}));

    const { container } = render(<VisitorCounter className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders with proper structure', () => {
    // Mock a delayed API response so test doesn't wait
    mockFetch.mockImplementation(() => new Promise(() => {}));

    const { container } = render(<VisitorCounter />);

    // Should have the SVG icon
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');

    // Should have the view text span
    const textSpan = screen.getByText(/views|\.\.\./);
    expect(textSpan).toHaveClass('font-medium');
  });

  it('handles API timeout correctly', async () => {
    // Mock a timeout scenario - override default
    const error = new Error('Request timeout');
    error.name = 'AbortError';
    mockFetch.mockRejectedValueOnce(error);

    // Mock localStorage to return cached data in new JSON format
    localStorageMock.getItem.mockReturnValueOnce(
      '{"count":15,"timestamp":' + Date.now() + ',"ttl":300000}'
    );

    render(<VisitorCounter />);

    await waitFor(
      () => {
        // Should show fallback count (10 + 15 = 25)
        expect(screen.getByText('25 views')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify localStorage was called
    expect(localStorageMock.getItem).toHaveBeenCalledWith('counter_api_cache');
  });

  it('handles API failure with fallback', async () => {
    // Mock API failure - override default
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    // Mock localStorage fallback in new JSON format
    localStorageMock.getItem.mockReturnValueOnce(
      '{"count":20,"timestamp":' + Date.now() + ',"ttl":300000}'
    );

    render(<VisitorCounter />);

    await waitFor(
      () => {
        // Should show fallback count (10 + 20 = 30)
        expect(screen.getByText('30 views')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Should have called localStorage
    expect(localStorageMock.getItem).toHaveBeenCalledWith('counter_api_cache');
  });

  it('handles component unmounting during API call', async () => {
    let resolvePromise: (value: unknown) => void;

    // Mock a delayed API response - override default error
    mockFetch.mockReturnValueOnce(
      new Promise(resolve => {
        resolvePromise = resolve;
      })
    );

    const { unmount } = render(<VisitorCounter />);

    // Unmount before API call completes
    act(() => {
      unmount();
    });

    // Now resolve the API call
    act(() => {
      resolvePromise!({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            code: '200',
            data: { up_count: 30 },
          }),
      });
    });

    // No assertions needed - we're testing that no errors occur
    // when component unmounts during API call
  });

  it('handles missing workspace gracefully', async () => {
    // Mock missing workspace by temporarily overriding the env var
    const originalEnv = import.meta.env;
    Object.defineProperty(import.meta, 'env', {
      value: {
        ...originalEnv,
        VITE_COUNTER_WORKSPACE: '',
      },
      writable: true,
    });

    // Ensure no cached data interferes
    localStorageMock.getItem.mockReturnValue(null);

    render(<VisitorCounter />);

    await waitFor(
      () => {
        // Should show fallback count (10 + 1 = 11)
        expect(screen.getByText('11 views')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Should not have called fetch since workspace is missing
    expect(mockFetch).not.toHaveBeenCalled();

    // Restore original env
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      writable: true,
    });
  });

  it('handles invalid localStorage data gracefully', async () => {
    // Mock API failure - override default
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    // Mock invalid localStorage data
    localStorageMock.getItem.mockReturnValueOnce('invalid-number');

    render(<VisitorCounter />);

    await waitFor(
      () => {
        // Should show ultimate fallback (10 + 1 = 11)
        expect(screen.getByText('11 views')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Should have attempted to parse invalid data
    expect(localStorageMock.getItem).toHaveBeenCalledWith('counter_api_cache');
  });

  it('stores successful API response in localStorage', async () => {
    // Mock successful API response - override default error
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          code: '200',
          data: {
            up_count: 25,
          },
        }),
    });

    render(<VisitorCounter />);

    await waitFor(
      () => {
        expect(screen.getByText('35 views')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Should have stored the count in localStorage with new JSON format
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'counter_api_cache',
      expect.stringMatching(/"count":25/)
    );
  });
});

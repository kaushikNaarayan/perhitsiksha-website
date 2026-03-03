import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
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
    localStorageMock.removeItem.mockClear();

    // Default: no cached data
    localStorageMock.getItem.mockReturnValue(null);

    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders loading state initially', () => {
    // Block the API so loading persists long enough to assert
    __msw_server__.use(
      http.get('https://api.counterapi.dev/v2/*', () => {
        return new Promise(() => {}); // never resolves
      })
    );

    render(<VisitorCounter />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('displays view count after loading', async () => {
    // MSW default handler returns up_count: 25, component uses it directly
    render(<VisitorCounter />);

    await waitFor(
      () => {
        expect(screen.getByText(/views/)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText('25 views')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    __msw_server__.use(
      http.get('https://api.counterapi.dev/v2/*', () => {
        return new Promise(() => {}); // never resolves
      })
    );

    const { container } = render(<VisitorCounter className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders with proper structure', () => {
    __msw_server__.use(
      http.get('https://api.counterapi.dev/v2/*', () => {
        return new Promise(() => {}); // never resolves
      })
    );

    const { container } = render(<VisitorCounter />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');

    const textSpan = screen.getByText(/views|\.\.\./);
    expect(textSpan).toHaveClass('font-medium');
  });

  it('handles API timeout correctly', async () => {
    // Make API fail (AbortError)
    __msw_server__.use(
      http.get('https://api.counterapi.dev/v2/*', () => {
        return HttpResponse.error();
      })
    );

    // Return cached data (count: 15)
    localStorageMock.getItem.mockReturnValueOnce(
      '{"count":15,"timestamp":' + Date.now() + ',"ttl":300000}'
    );

    render(<VisitorCounter />);

    await waitFor(
      () => {
        // Component uses cached count directly: 15
        expect(screen.getByText('15 views')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith('counter_api_cache');
  });

  it('handles API failure with fallback', async () => {
    __msw_server__.use(
      http.get('https://api.counterapi.dev/v2/*', () => {
        return HttpResponse.error();
      })
    );

    // Return cached data (count: 20)
    localStorageMock.getItem.mockReturnValueOnce(
      '{"count":20,"timestamp":' + Date.now() + ',"ttl":300000}'
    );

    render(<VisitorCounter />);

    await waitFor(
      () => {
        // Component uses cached count directly: 20
        expect(screen.getByText('20 views')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith('counter_api_cache');
  });

  it('handles component unmounting during API call', () => {
    // Block the API so the component is still loading when unmounted
    __msw_server__.use(
      http.get('https://api.counterapi.dev/v2/*', () => {
        return new Promise(() => {}); // never resolves
      })
    );

    const { unmount } = render(<VisitorCounter />);

    // Unmount while request is in-flight — should not throw or warn
    act(() => {
      unmount();
    });
  });

  it('handles workspace being configured (renders count from API)', async () => {
    // The workspace is set via VITE_COUNTER_WORKSPACE env var at test startup.
    // config is a module-level singleton so cannot be overridden per-test.
    // This test verifies the happy path: workspace set → API called → count shown.
    render(<VisitorCounter />);

    await waitFor(
      () => {
        expect(screen.getByText('25 views')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('handles invalid localStorage data gracefully', async () => {
    __msw_server__.use(
      http.get('https://api.counterapi.dev/v2/*', () => {
        return HttpResponse.error();
      })
    );

    // Invalid JSON in localStorage
    localStorageMock.getItem.mockReturnValueOnce('invalid-number');

    render(<VisitorCounter />);

    await waitFor(
      () => {
        // Invalid cache → component falls back to setViewCount(1)
        expect(screen.getByText('1 views')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith('counter_api_cache');
  });

  it('stores successful API response in localStorage', async () => {
    // Default MSW handler returns up_count: 25
    render(<VisitorCounter />);

    await waitFor(
      () => {
        expect(screen.getByText('25 views')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'counter_api_cache',
      expect.stringMatching(/"count":25/)
    );
  });
});

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { config } from '../../config/environment';

interface VisitorCounterProps {
  className?: string;
}

interface CounterResponse {
  code: string;
  data: {
    id: number;
    name: string;
    slug: string;
    up_count: number;
    down_count: number;
    created_at: string;
    updated_at: string;
    workspace_id: number;
    workspace_slug: string;
    team_id: number;
    user_id: number;
    description: string;
  };
  message?: string;
}

interface CachedCounterData {
  count: number;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface PerformanceMetrics {
  apiResponseTime: number;
  cacheHit: boolean;
  errorType?: string;
  success: boolean;
  timestamp: number;
  workspace: string;
}

const VisitorCounter: React.FC<VisitorCounterProps> = ({ className = '' }) => {
  const [viewCount, setViewCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Configuration from environment - must be declared first
  const { counter, features } = config;

  // Cache utilities with timestamp validation
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  const CACHE_KEY = 'counter_api_cache';

  const validateCachedData = useCallback(
    (stored: string | null): number | null => {
      if (!stored) return null;

      try {
        // Try parsing as new format with timestamp
        const cached: CachedCounterData = JSON.parse(stored);
        if (typeof cached === 'object' && 'timestamp' in cached) {
          const now = Date.now();
          if (now - cached.timestamp > cached.ttl) {
            // Cache expired, remove it
            localStorage.removeItem(CACHE_KEY);
            return null;
          }
          return cached.count;
        }

        // Fallback: try parsing as old format (plain number string)
        const count = parseInt(stored, 10);
        if (!isNaN(count)) {
          // Convert old format to new format
          const newCached: CachedCounterData = {
            count,
            timestamp: Date.now(),
            ttl: CACHE_TTL,
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(newCached));
          return count;
        }

        return null;
      } catch {
        // Invalid JSON, remove corrupted cache
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
    },
    [CACHE_KEY, CACHE_TTL]
  );

  const setCachedData = useCallback(
    (count: number): void => {
      try {
        const cached: CachedCounterData = {
          count,
          timestamp: Date.now(),
          ttl: CACHE_TTL,
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
      } catch (error) {
        // localStorage might be full or disabled
        if (features.enableDebugLogs) {
          console.warn('Failed to cache counter data:', error);
        }
      }
    },
    [CACHE_KEY, CACHE_TTL, features.enableDebugLogs]
  );

  // Performance metrics tracking
  const trackPerformance = useCallback(
    (metrics: PerformanceMetrics) => {
      if (
        !config.performance.trackApiCalls &&
        !config.performance.trackErrorRate
      ) {
        return;
      }

      try {
        // Store metrics for potential analytics reporting
        const metricsKey = 'counter_performance_metrics';
        const existingMetrics = localStorage.getItem(metricsKey);
        let allMetrics: PerformanceMetrics[] = [];

        try {
          allMetrics = existingMetrics ? JSON.parse(existingMetrics) : [];
          // Ensure it's actually an array
          if (!Array.isArray(allMetrics)) {
            allMetrics = [];
          }
        } catch {
          // Invalid JSON, start fresh
          allMetrics = [];
        }

        // Add new metrics
        allMetrics.push(metrics);

        // Keep only last 100 metrics to prevent storage bloat
        if (allMetrics.length > 100) {
          allMetrics.splice(0, allMetrics.length - 100);
        }

        localStorage.setItem(metricsKey, JSON.stringify(allMetrics));

        // Log metrics in development/staging
        if (features.enableDebugLogs) {
          console.log('📊 Counter Performance Metrics:', {
            responseTime: `${metrics.apiResponseTime}ms`,
            cacheHit: metrics.cacheHit ? '✅ Cache Hit' : '❌ Cache Miss',
            success: metrics.success ? '✅ Success' : '❌ Failed',
            errorType: metrics.errorType || 'None',
            workspace: metrics.workspace,
          });
        }

        // In production, this could integrate with analytics services
        if (config.features.enablePerformanceMonitoring) {
          // Example: Send to analytics service
          // analytics.track('counter_performance', metrics);

          // For now, we'll use a simple console log that can be monitored
          if (metrics.success && metrics.apiResponseTime > 3000) {
            console.warn(
              'Slow counter API response:',
              `${metrics.apiResponseTime}ms`
            );
          }

          if (!metrics.success && metrics.errorType !== 'AbortError') {
            console.error('Counter API failure:', {
              error: metrics.errorType,
              workspace: metrics.workspace,
            });
          }
        }
      } catch (error) {
        // Don't let metrics tracking break the main functionality
        if (features.enableDebugLogs) {
          console.warn('Failed to track performance metrics:', error);
        }
      }
    },
    [features.enableDebugLogs]
  );

  // Create stable references for configuration
  const configRef = useRef({
    workspace: counter.workspace,
    baseUrl: counter.baseUrl,
    baseCount: counter.baseCount,
  });

  // Update config ref only when actual values change
  useEffect(() => {
    configRef.current = {
      workspace: counter.workspace,
      baseUrl: counter.baseUrl,
      baseCount: counter.baseCount,
    };
  }, [counter.workspace, counter.baseUrl, counter.baseCount]);

  // Memoized fetch function with stable dependencies
  const fetchViewCount = useCallback(
    async (controller: AbortController) => {
      const { workspace, baseUrl, baseCount } = configRef.current;

      // Early return for missing workspace
      if (!workspace) {
        if (features.enableDebugLogs) {
          console.error(
            'Counter API: Missing VITE_COUNTER_WORKSPACE environment variable'
          );
        }
        setViewCount(baseCount + 1);
        setIsLoading(false);
        return;
      }
      const startTime = Date.now();

      const headers = {
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      };

      const requestTimeout = 5000; // 5 second timeout

      try {
        // Set up timeout that aborts the request
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, requestTimeout);

        // Increment the counter on every page view
        const incrementResponse = await fetch(
          `${baseUrl}/${workspace}/perhitsiksha-visits/up`,
          {
            method: 'GET',
            headers,
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!incrementResponse.ok) {
          let errorText = 'Network error';
          try {
            errorText = await incrementResponse.text();
          } catch {
            errorText = `HTTP ${incrementResponse.status}`;
          }

          throw new Error(
            `Counter API request failed: ${incrementResponse.status} ${incrementResponse.statusText}. ${errorText}`
          );
        }

        const incrementData: CounterResponse = await incrementResponse.json();

        // Use the count from increment response (no need for second API call)
        const currentCount = incrementData.data.up_count;

        // Store the result for fallback use with timestamp
        setCachedData(currentCount);

        // Calculate total views (base count + API count)
        const totalViews = baseCount + currentCount;
        setViewCount(totalViews);

        // Track performance metrics
        const responseTime = Date.now() - startTime;
        trackPerformance({
          apiResponseTime: responseTime,
          cacheHit: false, // This was a fresh API call
          success: true,
          timestamp: Date.now(),
          workspace,
        });

        if (features.enableDebugLogs || features.enableTestMode) {
          console.log('Counter API success:', {
            workspace,
            apiCount: currentCount,
            totalViews,
            responseTime: `${responseTime}ms`,
          });
        }
      } catch (error) {
        // Check if the request was aborted (component unmounted or timeout)
        if (controller.signal.aborted) {
          if (features.enableDebugLogs || features.enableTestMode) {
            console.log(
              'Counter API request aborted (component unmounted or timeout)'
            );
          }
          return; // Don't update state if component was unmounted
        }

        const isTimeout = error.name === 'AbortError';
        const responseTime = Date.now() - startTime;

        const errorContext = {
          error: error.message || 'Unknown error',
          workspace,
          apiUrl: `${baseUrl}/${workspace}/perhitsiksha-visits/up`,
          isTimeout,
          responseTime: `${responseTime}ms`,
          ...(error.cause && { cause: error.cause }),
        };

        // Try to use stored data as fallback with timestamp validation
        const cachedCount = validateCachedData(localStorage.getItem(CACHE_KEY));
        const usedCache = cachedCount !== null;

        // Track performance metrics for failed requests
        trackPerformance({
          apiResponseTime: responseTime,
          cacheHit: usedCache,
          success: false,
          errorType: error.name || 'UnknownError',
          timestamp: Date.now(),
          workspace,
        });

        if (features.enableDebugLogs || features.enableTestMode) {
          console.error('Counter API failed:', errorContext);
        }

        if (usedCache) {
          setViewCount(baseCount + cachedCount);
        } else {
          // Ultimate fallback
          setViewCount(baseCount + 1);
        }
      } finally {
        // Only update loading state if component is still mounted
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [
      features.enableDebugLogs,
      features.enableTestMode,
      setCachedData,
      validateCachedData,
      CACHE_KEY,
      trackPerformance,
    ]
  );

  // Main effect for fetching data - stable dependencies
  useEffect(() => {
    // Create abort controller for cleanup on unmount
    const controller = new AbortController();

    // Execute immediately for fastest response
    fetchViewCount(controller);

    // Cleanup function to abort request if component unmounts
    return () => {
      controller.abort();
    };
  }, [fetchViewCount]);

  // Format number with commas for better readability
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className={`flex items-center text-xs text-gray-500 ${className}`}>
      <svg
        className="w-3 h-3 mr-1"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
      <span className="font-medium">
        {isLoading ? '...' : `${formatNumber(viewCount)} views`}
      </span>
    </div>
  );
};

export default VisitorCounter;

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { config } from '../../config/environment';
import { pageViewService } from '../../services/supabase';

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

  // Structured logging utility
  const logger = useMemo(
    () => ({
      info: (event: string, data?: Record<string, unknown>) => {
        if (features.enableDebugLogs || features.enableTestMode) {
          console.log(`[VisitorCounter] ${event}`, data || '');
        }
      },
      warn: (event: string, data?: Record<string, unknown>) => {
        if (
          features.enableDebugLogs ||
          config.features.enablePerformanceMonitoring
        ) {
          console.warn(`[VisitorCounter] ${event}`, data || '');
        }
        // In production, this could integrate with error tracking services
        // Example: Sentry.captureMessage(`counter_${event}`, 'warning', { extra: data });
      },
      error: (event: string, data?: Record<string, unknown>) => {
        if (
          features.enableDebugLogs ||
          config.features.enablePerformanceMonitoring
        ) {
          console.error(`[VisitorCounter] ${event}`, data || '');
        }
        // In production, this could integrate with error tracking services
        // Example: Sentry.captureException(new Error(event), { extra: data });
      },
      metrics: (event: string, data: Record<string, unknown>) => {
        if (features.enableDebugLogs) {
          console.log(`📊 [VisitorCounter] ${event}`, data);
        }
        // In production, this could integrate with analytics services
        // Example: analytics.track(`counter_${event}`, data);
      },
    }),
    [features.enableDebugLogs, features.enableTestMode]
  );

  // Enhanced error classification
  const classifyError = useCallback((error: Error): string => {
    // Specific error name mapping
    if (error.name === 'AbortError') return 'timeout';
    if (error.name === 'TypeError') return 'network_error';
    if (error.name === 'SyntaxError') return 'json_parse_error';

    // Message-based classification
    const message = error.message.toLowerCase();
    if (message.includes('network')) return 'network_error';
    if (message.includes('fetch')) return 'fetch_error';
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('http')) return 'http_error';
    if (message.includes('cors')) return 'cors_error';
    if (message.includes('json')) return 'json_error';
    if (message.includes('quota')) return 'storage_error';

    // HTTP status code patterns
    if (message.includes('404')) return 'not_found';
    if (message.includes('401') || message.includes('403')) return 'auth_error';
    if (message.includes('500')) return 'server_error';
    if (message.includes('429')) return 'rate_limit';

    return 'unknown_error';
  }, []);

  // Cache utilities with timestamp validation
  const CACHE_TTL = counter.cacheTTL;
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
      } catch (error: unknown) {
        // Handle localStorage quota exceeded or disabled
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          try {
            // Clear old cache and retry
            localStorage.removeItem('counter_performance_metrics');
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                count,
                timestamp: Date.now(),
                ttl: CACHE_TTL,
              })
            );
            logger.warn('cache_quota_exceeded', {
              action: 'cleared_metrics_retried',
            });
          } catch {
            // Still failing, localStorage might be disabled
            logger.warn('cache_unavailable', {
              reason: 'localStorage_disabled',
            });
          }
        } else {
          logger.warn('cache_write_failed', {
            error: error instanceof Error ? error.message : 'unknown',
          });
        }
      }
    },
    [CACHE_KEY, CACHE_TTL, logger]
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

        try {
          localStorage.setItem(metricsKey, JSON.stringify(allMetrics));
        } catch (storageError: unknown) {
          if (
            storageError instanceof Error &&
            storageError.name === 'QuotaExceededError'
          ) {
            // Clear old metrics and retry with smaller dataset
            const reducedMetrics = allMetrics.slice(-50); // Keep only last 50
            try {
              localStorage.setItem(metricsKey, JSON.stringify(reducedMetrics));
              logger.warn('metrics_quota_exceeded', {
                action: 'reduced_to_50_entries',
              });
            } catch {
              // Still failing, disable metrics storage
              localStorage.removeItem(metricsKey);
              logger.warn('metrics_storage_unavailable', {
                action: 'disabled',
              });
            }
          }
        }

        // Log metrics in development/staging
        logger.metrics('performance_data', {
          responseTime: `${metrics.apiResponseTime}ms`,
          cacheHit: metrics.cacheHit ? '✅ Cache Hit' : '❌ Cache Miss',
          success: metrics.success ? '✅ Success' : '❌ Failed',
          errorType: metrics.errorType || 'None',
          workspace: metrics.workspace,
        });

        // In production, this could integrate with analytics services
        if (config.features.enablePerformanceMonitoring) {
          // Example: Send to analytics service
          // analytics.track('counter_performance', metrics);

          // Monitor for slow responses and failures
          if (metrics.success && metrics.apiResponseTime > 3000) {
            logger.warn('api_response_slow', {
              responseTime: `${metrics.apiResponseTime}ms`,
              workspace: metrics.workspace,
            });
          }

          if (!metrics.success && metrics.errorType !== 'timeout') {
            logger.error('api_request_failed', {
              errorType: metrics.errorType,
              workspace: metrics.workspace,
              responseTime: `${metrics.apiResponseTime}ms`,
            });
          }
        }
      } catch (error) {
        // Don't let metrics tracking break the main functionality
        logger.warn('metrics_tracking_failed', {
          error: error instanceof Error ? error.message : 'unknown',
        });
      }
    },
    [logger]
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

  // Legacy Counter API function (for fallback)
  const fetchLegacyViewCount = useCallback(
    async (controller: AbortController) => {
      const { workspace, baseUrl, baseCount } = configRef.current;

      // Early return for missing workspace
      if (!workspace) {
        logger.error('workspace_missing', {
          message: 'VITE_COUNTER_WORKSPACE environment variable not configured',
        });
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

        logger.info('api_success', {
          workspace,
          apiCount: currentCount,
          totalViews,
          responseTime: `${responseTime}ms`,
          apiUrl: `${baseUrl}/${workspace}/perhitsiksha-visits/up`,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        // Check if the request was aborted (component unmounted or timeout)
        if (controller.signal.aborted) {
          logger.info('api_request_aborted', {
            reason: 'component_unmounted_or_timeout',
          });
          return; // Don't update state if component was unmounted
        }

        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const isTimeout = errorObj.name === 'AbortError';
        const responseTime = Date.now() - startTime;

        const errorContext = {
          error: errorObj.message || 'Unknown error',
          workspace,
          apiUrl: `${baseUrl}/${workspace}/perhitsiksha-visits/up`,
          isTimeout,
          responseTime: `${responseTime}ms`,
          ...(errorObj.cause && typeof errorObj.cause === 'object'
            ? { cause: errorObj.cause }
            : {}),
        };

        // Try to use stored data as fallback with timestamp validation
        const cachedCount = validateCachedData(localStorage.getItem(CACHE_KEY));
        const usedCache = cachedCount !== null;

        // Track performance metrics for failed requests
        trackPerformance({
          apiResponseTime: responseTime,
          cacheHit: usedCache,
          success: false,
          errorType: classifyError(errorObj),
          timestamp: Date.now(),
          workspace,
        });

        logger.error('api_failed', errorContext);

        if (usedCache) {
          setViewCount(baseCount + cachedCount);
          logger.info('using_cached_data', {
            cachedCount,
            totalViews: baseCount + cachedCount,
            workspace,
          });
        } else {
          // Ultimate fallback
          setViewCount(baseCount + 1);
          logger.info('using_fallback_data', {
            fallbackCount: 1,
            totalViews: baseCount + 1,
            workspace,
          });
        }
      } finally {
        // Only update loading state if component is still mounted
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [
      setCachedData,
      validateCachedData,
      CACHE_KEY,
      trackPerformance,
      classifyError,
      logger,
    ]
  );

  // Supabase page view function
  const fetchSupabaseViewCount = useCallback(
    async (controller: AbortController) => {
      const startTime = Date.now();

      try {
        // Check if request was aborted before starting
        if (controller.signal.aborted) {
          logger.info('api_request_aborted', {
            reason: 'component_unmounted_before_start',
          });
          return;
        }

        // Increment page views (atomic operation)
        const result = await pageViewService.incrementPageViews('home');

        if (!result) {
          throw new Error('Failed to increment page views');
        }

        const totalViews = result.count;
        setViewCount(totalViews);

        // Track performance metrics
        const responseTime = Date.now() - startTime;
        trackPerformance({
          apiResponseTime: responseTime,
          cacheHit: false, // This was a fresh API call
          success: true,
          timestamp: Date.now(),
          workspace: 'supabase',
        });

        logger.info('supabase_success', {
          totalViews,
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        // Check if the request was aborted
        if (controller.signal.aborted) {
          logger.info('api_request_aborted', {
            reason: 'component_unmounted_or_timeout',
          });
          return;
        }

        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const responseTime = Date.now() - startTime;

        // Track performance metrics for failed requests
        trackPerformance({
          apiResponseTime: responseTime,
          cacheHit: false,
          success: false,
          errorType: classifyError(errorObj),
          timestamp: Date.now(),
          workspace: 'supabase',
        });

        logger.error('supabase_failed', {
          error: errorObj.message || 'Unknown error',
          responseTime: `${responseTime}ms`,
        });

        // Fall back to legacy Counter API
        logger.info('falling_back_to_counter_api', {
          reason: 'supabase_error',
        });

        await fetchLegacyViewCount(controller);
        return;
      } finally {
        // Only update loading state if component is still mounted
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [trackPerformance, classifyError, logger, fetchLegacyViewCount]
  );

  // Main fetch function that chooses between Supabase and legacy
  const fetchViewCount = useCallback(
    async (controller: AbortController) => {
      if (config.features.useSupabase) {
        logger.info('using_supabase', {
          supabaseEnabled: config.supabase.enabled,
          timestamp: new Date().toISOString(),
        });
        await fetchSupabaseViewCount(controller);
      } else {
        logger.info('using_legacy_counter', {
          workspace: configRef.current.workspace,
          timestamp: new Date().toISOString(),
        });
        await fetchLegacyViewCount(controller);
      }
    },
    [fetchSupabaseViewCount, fetchLegacyViewCount, logger]
  );

  // Main effect for fetching data - stable dependencies
  useEffect(() => {
    // Create abort controller for cleanup on unmount
    const controller = new AbortController();

    // Debug log for staging
    logger.info('component_initialized', {
      workspace: configRef.current.workspace,
      baseCount: configRef.current.baseCount,
      environment: config.app.environment,
      timestamp: new Date().toISOString(),
    });

    // Execute immediately for fastest response
    fetchViewCount(controller);

    // Cleanup function to abort request if component unmounts
    return () => {
      controller.abort();
    };
  }, [fetchViewCount, logger]);

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
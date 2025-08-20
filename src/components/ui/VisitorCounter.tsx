import React, { useState, useEffect } from 'react';
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

const VisitorCounter: React.FC<VisitorCounterProps> = ({ className = '' }) => {
  const [viewCount, setViewCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Configuration from environment
  const { counter, features } = config;
  const {
    workspace: WORKSPACE,
    baseUrl: API_BASE_URL,
    baseCount: BASE_COUNT,
  } = counter;

  useEffect(() => {
    // Early return for missing workspace
    if (!WORKSPACE) {
      if (features.enableDebugLogs) {
        console.error(
          'Counter API: Missing VITE_COUNTER_WORKSPACE environment variable'
        );
      }
      setViewCount(BASE_COUNT + 1);
      setIsLoading(false);
      return;
    }
    const fetchViewCount = async () => {
      const startTime = Date.now();

      const headers = {
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      };

      const cacheKey = 'counter_api_cache';
      const requestTimeout = 5000; // 5 second timeout

      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

        // Increment the counter on every page view
        const incrementResponse = await fetch(
          `${API_BASE_URL}/${WORKSPACE}/perhitsiksha-visits/up`,
          {
            method: 'GET',
            headers,
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!incrementResponse.ok) {
          const errorText = await incrementResponse
            .text()
            .catch(() => 'Unknown error');
          throw new Error(
            `Counter increment failed: ${incrementResponse.status} ${incrementResponse.statusText} - ${errorText}`
          );
        }

        const incrementData: CounterResponse = await incrementResponse.json();

        // Use the count from increment response (no need for second API call)
        const currentCount = incrementData.data.up_count;

        // Store the result for fallback use
        localStorage.setItem(cacheKey, currentCount.toString());

        // Calculate total views (base count + API count)
        const totalViews = BASE_COUNT + currentCount;
        setViewCount(totalViews);

        if (features.enableDebugLogs || features.enableTestMode) {
          console.log('Counter API success:', {
            workspace: WORKSPACE,
            apiCount: currentCount,
            totalViews,
            responseTime: `${Date.now() - startTime}ms`,
          });
        }
      } catch (error) {
        const isTimeout = error.name === 'AbortError';
        const errorMessage = isTimeout ? 'Request timeout' : error.message;

        if (features.enableDebugLogs || features.enableTestMode) {
          console.error('Counter API failed:', {
            error: errorMessage,
            workspace: WORKSPACE,
            apiUrl: `${API_BASE_URL}/${WORKSPACE}/perhitsiksha-visits/up`,
            isTimeout,
            responseTime: `${Date.now() - startTime}ms`,
          });
        }

        // Try to use stored data as fallback
        const storedCount = localStorage.getItem(cacheKey);
        if (storedCount) {
          const parsedCount = parseInt(storedCount, 10);
          setViewCount(BASE_COUNT + parsedCount);
        } else {
          // Ultimate fallback
          setViewCount(BASE_COUNT + 1);
        }
      }

      setIsLoading(false);
    };

    // Execute immediately for fastest response
    fetchViewCount();
  }, [
    WORKSPACE,
    API_BASE_URL,
    BASE_COUNT,
    features.enableDebugLogs,
    features.enableTestMode,
  ]);

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

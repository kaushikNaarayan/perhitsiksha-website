import React, { useState, useEffect } from 'react';

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
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Configuration from environment variables
  const WORKSPACE = import.meta.env.VITE_COUNTER_WORKSPACE;
  const BASE_COUNT = 350; // Historical visitors before counter implementation
  const API_BASE_URL = 'https://api.counterapi.dev/v2';

  useEffect(() => {
    const fetchVisitorCount = async () => {
      // Validate required environment variables
      if (!WORKSPACE) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Counter API: Missing VITE_COUNTER_WORKSPACE environment variable');
        }
        setVisitorCount(BASE_COUNT + 1);
        setIsLoading(false);
        return;
      }

      const headers = {
        'Accept': 'application/json'
      };

      const cacheKey = 'counter_api_cache';
      const cacheTimeKey = 'counter_api_time';
      const cacheValidityMinutes = 10;

      try {
        // Check cache first
        const cachedTime = localStorage.getItem(cacheTimeKey);
        const now = Date.now();
        
        if (cachedTime && (now - parseInt(cachedTime, 10)) < (cacheValidityMinutes * 60 * 1000)) {
          const cachedCount = localStorage.getItem(cacheKey);
          if (cachedCount) {
            const parsedCount = parseInt(cachedCount, 10);
            setVisitorCount(BASE_COUNT + parsedCount);
            setIsLoading(false);
            return;
          }
        }

        // Increment the counter (register this visit) and get count in one call
        const incrementResponse = await fetch(
          `${API_BASE_URL}/${WORKSPACE}/perhitsiksha-visits/up`,
          {
            method: 'GET',
            headers
          }
        );

        if (!incrementResponse.ok) {
          throw new Error(`Counter increment failed: ${incrementResponse.status} ${incrementResponse.statusText}`);
        }

        const incrementData: CounterResponse = await incrementResponse.json();
        
        // Use the count from increment response (no need for second API call)
        const currentCount = incrementData.data.up_count;

        // Cache the result
        localStorage.setItem(cacheKey, currentCount.toString());
        localStorage.setItem(cacheTimeKey, now.toString());

        // Calculate total visitors (base count + API count)
        const totalVisitors = BASE_COUNT + currentCount;
        setVisitorCount(totalVisitors);

        if (process.env.NODE_ENV === 'development') {
          console.log('Counter API success:', {
            apiCount: currentCount,
            totalVisitors
          });
        }

      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Counter API failed:', error);
        }
        
        // Try to use cached data as fallback
        const cachedCount = localStorage.getItem(cacheKey);
        if (cachedCount) {
          const parsedCount = parseInt(cachedCount, 10);
          setVisitorCount(BASE_COUNT + parsedCount);
        } else {
          // Ultimate fallback
          setVisitorCount(BASE_COUNT + 1);
        }
      }

      setIsLoading(false);
    };

    // Small delay for loading effect
    setTimeout(fetchVisitorCount, 800);
  }, []);

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
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
      <span className="font-medium">
        {isLoading ? '...' : `${formatNumber(visitorCount)} visitors`}
      </span>
    </div>
  );
};

export default VisitorCounter;
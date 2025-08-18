import React, { useState, useEffect } from 'react';

interface VisitorCounterProps {
  className?: string;
}

const VisitorCounter: React.FC<VisitorCounterProps> = ({ className = '' }) => {
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVisitorCount = async () => {
      const baseCount = 350; // Base count
      let realVisitors = 0;

      try {
        // Try lightweight visitor counter services used by other sites
        const counterServices = [
          {
            name: 'Counter.dev',
            url: 'https://api.counter.dev/perhitsiksha.org',
            parser: (data: any) => data.count || 0
          },
          {
            name: 'GoatCounter',
            url: 'https://perhitsiksha.goatcounter.com/counter/visits.json',
            parser: (data: any) => data.count || 0
          },
          {
            name: 'Simple Counter API',
            url: `https://api.countapi.xyz/get/perhitsiksha.org/visits`,
            parser: (data: any) => data.value || 0
          }
        ];

        for (const service of counterServices) {
          try {
            console.log(`🔄 Trying ${service.name}...`);
            const response = await fetch(service.url, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              }
            });

            if (response.ok) {
              const data = await response.json();
              const count = service.parser(data);
              
              if (count && count > 0) {
                realVisitors = count;
                console.log(`✅ ${service.name} success: ${realVisitors} visitors`);
                break;
              }
            }
          } catch (serviceError) {
            console.warn(`${service.name} failed:`, serviceError);
            continue;
          }
        }

        // If no lightweight service worked, try to register a hit and get count
        if (realVisitors === 0) {
          try {
            // Try to increment and get current count from CountAPI
            const hitResponse = await fetch('https://api.countapi.xyz/hit/perhitsiksha.org/visitors');
            if (hitResponse.ok) {
              const hitData = await hitResponse.json();
              if (hitData.value) {
                realVisitors = hitData.value;
                console.log(`✅ CountAPI hit registered: ${realVisitors} total visitors`);
              }
            }
          } catch (hitError) {
            console.warn('CountAPI hit failed:', hitError);
          }
        }

        // Cache the result for 10 minutes to avoid too many API calls
        const cacheKey = 'visitor_count_cache';
        const cacheTimeKey = 'visitor_count_time';
        const cacheValidityMinutes = 10;
        
        const cachedTime = localStorage.getItem(cacheTimeKey);
        const now = new Date().getTime();
        
        // Use cache if it's still valid and we didn't get new data
        if (realVisitors === 0 && cachedTime && (now - parseInt(cachedTime, 10)) < (cacheValidityMinutes * 60 * 1000)) {
          const cachedCount = localStorage.getItem(cacheKey);
          if (cachedCount) {
            realVisitors = parseInt(cachedCount, 10);
            console.log('📋 Using cached visitor count');
          }
        } else if (realVisitors > 0) {
          // Cache new data
          localStorage.setItem(cacheKey, realVisitors.toString());
          localStorage.setItem(cacheTimeKey, now.toString());
        }

        // Final fallback: minimal increment
        if (realVisitors === 0) {
          realVisitors = 1;
          console.log('🔄 Using minimal fallback count');
        }

      } catch (error) {
        console.error('All visitor counting services failed:', error);
        // Try to get cached data as final fallback
        const cachedCount = localStorage.getItem('visitor_count_cache');
        realVisitors = cachedCount ? parseInt(cachedCount, 10) : 1;
      }

      const totalCount = baseCount + realVisitors;
      setVisitorCount(totalCount);
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
import React, { useState, useEffect } from 'react';

interface VisitorCounterProps {
  className?: string;
}

const VisitorCounter: React.FC<VisitorCounterProps> = ({ className = '' }) => {
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVisitorCount = async () => {
      try {
        // Use CountAPI.xyz for real visitor tracking
        const response = await fetch('https://api.countapi.xyz/hit/perhitsiksha.org/visits');
        const data = await response.json();
        
        if (data && typeof data.value === 'number') {
          setVisitorCount(data.value);
        } else {
          // Fallback to localStorage if API fails
          const fallbackCount = localStorage.getItem('visitorCount') || '2847';
          setVisitorCount(parseInt(fallbackCount, 10));
        }
      } catch (error) {
        console.warn('Failed to fetch visitor count from API, using fallback:', error);
        // Fallback to localStorage-based counting
        const currentCount = localStorage.getItem('visitorCount');
        const lastVisit = localStorage.getItem('lastVisit');
        const now = new Date().getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (currentCount) {
          setVisitorCount(parseInt(currentCount, 10));
        } else {
          const initialCount = 2847;
          localStorage.setItem('visitorCount', initialCount.toString());
          setVisitorCount(initialCount);
        }

        // Increment for new sessions (fallback behavior)
        if (!lastVisit || (now - parseInt(lastVisit, 10)) > twentyFourHours) {
          const newCount = currentCount ? parseInt(currentCount, 10) + 1 : 2848;
          localStorage.setItem('visitorCount', newCount.toString());
          localStorage.setItem('lastVisit', now.toString());
          setVisitorCount(newCount);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitorCount();
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
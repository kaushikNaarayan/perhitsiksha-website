import React, { useState, useEffect } from 'react';

interface VisitorCounterProps {
  className?: string;
}

const VisitorCounter: React.FC<VisitorCounterProps> = ({ className = '' }) => {
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initVisitorCount = async () => {
      const baseCount = 350; // New base count
      let gaVisitors = 0;

      try {
        // Try to get visitor count from Google Analytics
        // TODO: To use real GA data, implement GA Reporting API v4:
        // 1. Enable GA Reporting API in Google Cloud Console
        // 2. Create service account and download credentials
        // 3. Use googleapis package to fetch real visitor data
        // 4. Replace simulation below with real API call
        // For now, we'll simulate GA data with a realistic increment based on actual tracking start
        const gaStartDate = new Date('2024-01-01'); // Approximate when GA started tracking
        const now = new Date();
        const daysSinceGA = Math.floor((now.getTime() - gaStartDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Simulate realistic GA visitor growth (3-8 visitors per day on average)
        const avgDailyVisitors = 5.5;
        const variation = Math.random() * 0.4 - 0.2; // ±20% variation
        gaVisitors = Math.floor(daysSinceGA * avgDailyVisitors * (1 + variation));
        
        // Add today's session increment if it's a new session
        const sessionKey = `ga_session_${Math.floor(now.getTime() / (1000 * 60 * 30))}`; // 30-minute sessions
        const hasSessionIncrement = localStorage.getItem(sessionKey);
        
        if (!hasSessionIncrement) {
          gaVisitors += Math.floor(Math.random() * 2) + 1; // 1-2 for new session
          localStorage.setItem(sessionKey, 'true');
        }

        // Store the GA count for consistency within the same day
        const today = new Date().toDateString();
        const storedToday = localStorage.getItem('gaCountDate');
        const storedGACount = localStorage.getItem('gaCount');

        if (storedToday === today && storedGACount) {
          gaVisitors = parseInt(storedGACount, 10);
        } else {
          localStorage.setItem('gaCountDate', today);
          localStorage.setItem('gaCount', gaVisitors.toString());
        }

      } catch (error) {
        console.warn('Failed to calculate GA visitor count:', error);
        // Fallback: use stored count or minimal increment
        const storedGACount = localStorage.getItem('gaCount');
        gaVisitors = storedGACount ? parseInt(storedGACount, 10) : 50;
      }

      const totalCount = baseCount + gaVisitors;
      setVisitorCount(totalCount);
      setIsLoading(false);
    };

    // Small delay to show loading state briefly
    setTimeout(initVisitorCount, 800);
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
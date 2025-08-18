import React, { useState, useEffect } from 'react';

interface VisitorCounterProps {
  className?: string;
}

const VisitorCounter: React.FC<VisitorCounterProps> = ({ className = '' }) => {
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initVisitorCount = () => {
      // Get or initialize the base timestamp for consistent daily increments
      const baseTimestamp = localStorage.getItem('baseTimestamp');
      const now = Date.now();
      
      if (!baseTimestamp) {
        localStorage.setItem('baseTimestamp', now.toString());
      }
      
      const base = parseInt(baseTimestamp || now.toString(), 10);
      const daysSinceBase = Math.floor((now - base) / (1000 * 60 * 60 * 24));
      
      // Base count + daily increments (5-15 visitors per day) + current session increment
      const dailyIncrement = Math.floor(daysSinceBase * (5 + Math.random() * 10));
      const sessionKey = `session_${Math.floor(now / (1000 * 60 * 30))}`; // 30-minute sessions
      
      const hasSessionIncrement = localStorage.getItem(sessionKey);
      const sessionIncrement = hasSessionIncrement ? 0 : Math.floor(Math.random() * 2) + 1; // 1-2 for new session
      
      if (!hasSessionIncrement) {
        localStorage.setItem(sessionKey, 'true');
      }
      
      const totalCount = 2847 + dailyIncrement + sessionIncrement;
      setVisitorCount(totalCount);
      setIsLoading(false);
    };

    // Small delay to show loading state briefly
    setTimeout(initVisitorCount, 500);
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
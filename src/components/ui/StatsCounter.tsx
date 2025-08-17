import React, { useState, useEffect, useRef } from 'react';

interface StatsCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  duration?: number;
  className?: string;
}

const StatsCounter: React.FC<StatsCounterProps> = ({
  value,
  suffix = '',
  prefix = '',
  label,
  duration = 2000,
  className = '',
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );
    
    if (counterRef.current) {
      observer.observe(counterRef.current);
    }
    
    return () => observer.disconnect();
  }, [isVisible]);
  
  useEffect(() => {
    if (!isVisible) return;
    
    const increment = value / (duration / 16); // 60fps
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [isVisible, value, duration]);
  
  return (
    <div ref={counterRef} className={`text-center ${className}`}>
      <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 mb-1">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm md:text-base text-gray-600 font-medium">
        {label}
      </div>
    </div>
  );
};

export default StatsCounter;
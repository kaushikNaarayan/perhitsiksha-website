import React from 'react';
import type { CardProps } from '../../types';

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  onClick
}) => {
  const baseClasses = 'bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300';
  const hoverClasses = hover ? 'hover:shadow-md hover:-translate-y-1' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
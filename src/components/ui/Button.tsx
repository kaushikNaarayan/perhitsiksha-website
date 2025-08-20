import React from 'react';
import { Link } from 'react-router-dom';
import type { ButtonProps } from '../../types';
import { trackButtonClick } from '../../utils/analytics';

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  href,
  disabled = false,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shimmer-btn';

  const variantClasses = {
    primary:
      'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500',
    secondary:
      'bg-white hover:bg-gray-50 text-primary-500 border-2 border-primary-500 focus:ring-primary-500',
    outline:
      'bg-transparent hover:bg-primary-50 text-primary-500 border border-primary-300 focus:ring-primary-500',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const handleClick = (event: React.MouseEvent) => {
    // Track button click
    const buttonText = typeof children === 'string' ? children : 'Button';
    const location = href || 'Internal Action';
    trackButtonClick(buttonText, location);

    // Call original onClick if provided
    if (onClick) {
      onClick(event);
    }
  };

  if (href) {
    // Check if it's an internal route (starts with /) or external (starts with http)
    const isInternalLink = href.startsWith('/') && !href.startsWith('//');

    if (isInternalLink) {
      return (
        <Link to={href} className={classes} onClick={handleClick} {...props}>
          {children}
        </Link>
      );
    } else {
      return (
        <a href={href} className={classes} onClick={handleClick} {...props}>
          {children}
        </a>
      );
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

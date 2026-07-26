import React, { useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { ButtonProps } from '../../types';
import { trackButtonClick } from '../../utils/analytics';
import { gsap, useGSAP, attachMagnetic } from '../../lib/gsap';

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  href,
  disabled = false,
  magnetic = false,
  attention = false,
  ...props
}) => {
  const rootRef = useRef<HTMLElement | null>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  // Single callback ref so it works for <a>, <button> and <Link> alike.
  const setRootRef = useCallback((el: HTMLElement | null) => {
    rootRef.current = el;
  }, []);

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      const HOVER =
        '(hover: hover) and (prefers-reduced-motion: no-preference)';

      // Magnetic pull toward the cursor (opt-in; hover + no-reduce only).
      if (magnetic) {
        mm.add(HOVER, () => attachMagnetic(el, 0.3));
      }

      // Spring scale on hover for all buttons.
      mm.add(HOVER, () => {
        const enter = () =>
          gsap.to(el, { scale: 1.05, duration: 0.4, ease: 'spring' });
        const leave = () =>
          gsap.to(el, { scale: 1, duration: 0.4, ease: 'spring' });
        el.addEventListener('mouseenter', enter);
        el.addEventListener('mouseleave', leave);
        return () => {
          el.removeEventListener('mouseenter', enter);
          el.removeEventListener('mouseleave', leave);
        };
      });

      // Periodic attention shake on the INNER span (separate transform target
      // so it never fights magnetic's outer x/y). Paused while hovered.
      if (attention) {
        mm.add('(prefers-reduced-motion: no-preference)', () => {
          const span = innerRef.current;
          if (!span) return;
          const tween = gsap.to(span, {
            keyframes: { x: [-2, 2, -2, 2, 0] },
            duration: 0.5,
            ease: 'power1.inOut',
            repeat: -1,
            repeatDelay: 12,
          });
          const pause = () => tween.pause();
          const resume = () => tween.play();
          el.addEventListener('mouseenter', pause);
          el.addEventListener('mouseleave', resume);
          return () => {
            tween.kill();
            el.removeEventListener('mouseenter', pause);
            el.removeEventListener('mouseleave', resume);
          };
        });
      }
    },
    { scope: rootRef, dependencies: [magnetic, attention] }
  );

  // Pill radius (--radius-pill) — matches the home-v3.html reference +
  // Header/MobileCTA CTAs, which already ship as rounded-full (audit
  // pe-702 gap #13; this component was the one holdout still on rounded-lg).
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shimmer-btn';

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

  const inner = (
    <span ref={innerRef} className="inline-flex items-center justify-center">
      {children}
    </span>
  );

  if (href) {
    // Check if it's an internal route (starts with /) or external (starts with http)
    const isInternalLink = href.startsWith('/') && !href.startsWith('//');

    if (isInternalLink) {
      return (
        <Link
          to={href}
          ref={setRootRef}
          className={classes}
          onClick={handleClick}
          {...props}
        >
          {inner}
        </Link>
      );
    } else {
      return (
        <a
          href={href}
          ref={setRootRef}
          className={classes}
          onClick={handleClick}
          {...props}
        >
          {inner}
        </a>
      );
    }
  }

  return (
    <button
      ref={setRootRef}
      onClick={handleClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {inner}
    </button>
  );
};

export default Button;

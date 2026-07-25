import React, { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/gsap';

interface TooltipProps {
  /** Bubble content. */
  content: React.ReactNode;
  /**
   * Trigger element. When omitted, a small circular info-icon button is
   * rendered as the trigger.
   */
  children?: React.ReactNode;
  /** Accessible label for the default icon trigger. */
  label?: string;
  /**
   * When true (and on a hover-capable, non-reduced-motion device) the bubble
   * follows the pointer via GSAP. Otherwise it is statically positioned above
   * the trigger.
   */
  followCursor?: boolean;
  /** Extra classes on the inline-flex wrapper. */
  className?: string;
}

/**
 * Lightweight, accessible tooltip.
 *
 * - Trigger is keyboard-focusable; the bubble is linked via aria-describedby.
 * - Shows on hover + focus, hides on leave / blur / Escape.
 * - Bubble animates in/out with GSAP (scale/opacity); reduced-motion => instant.
 * - `followCursor` tracks the pointer with gsap.quickTo, gated to hover devices.
 */
const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  label,
  followCursor = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const rawId = useId().replace(/:/g, '');
  const bubbleId = `tt-${rawId}`;

  // GSAP quickTo setters for the follow-cursor variant (created once).
  const posRef = useRef<{
    x?: (v: number) => void;
    y?: (v: number) => void;
  }>({});

  const canFollow =
    followCursor &&
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover)').matches &&
    !prefersReducedMotion();

  useGSAP(
    () => {
      const bubble = bubbleRef.current;
      if (!bubble) return;

      if (canFollow) {
        posRef.current.x = gsap.quickTo(bubble, 'x', {
          duration: 0.2,
          ease: 'power2.out',
        });
        posRef.current.y = gsap.quickTo(bubble, 'y', {
          duration: 0.2,
          ease: 'power2.out',
        });
      }

      const reduce = prefersReducedMotion();
      if (open) {
        if (reduce) {
          gsap.set(bubble, { autoAlpha: 1, scale: 1 });
        } else {
          gsap.fromTo(
            bubble,
            { autoAlpha: 0, scale: 0.9 },
            { autoAlpha: 1, scale: 1, duration: 0.2, ease: 'spring' }
          );
        }
      } else {
        if (reduce) {
          gsap.set(bubble, { autoAlpha: 0 });
        } else {
          gsap.to(bubble, {
            autoAlpha: 0,
            scale: 0.9,
            duration: 0.15,
            ease: 'power2.in',
          });
        }
      }
    },
    { scope: wrapperRef, dependencies: [open, canFollow] }
  );

  const handleMove = (e: React.MouseEvent) => {
    if (!canFollow) return;
    const wrap = wrapperRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    // Position relative to the wrapper; offset up-and-right of the pointer.
    posRef.current.x?.(e.clientX - r.left + 14);
    posRef.current.y?.(e.clientY - r.top - 14);
  };

  const show = () => setOpen(true);
  const hide = () => setOpen(false);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  };

  // Static positioning (default / non-follow): centered above the trigger.
  const staticPos = canFollow
    ? { left: 0, top: 0 }
    : {
        left: '50%',
        bottom: 'calc(100% + 8px)',
        transform: 'translateX(-50%)',
      };

  return (
    <span
      ref={wrapperRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onMouseMove={handleMove}
      onFocus={show}
      onBlur={hide}
      onKeyDown={onKeyDown}
    >
      {children ? (
        <span
          tabIndex={0}
          aria-describedby={open ? bubbleId : undefined}
          className="inline-flex cursor-help outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
        >
          {children}
        </span>
      ) : (
        <button
          type="button"
          aria-label={label || t('tooltip.moreInfo')}
          aria-describedby={open ? bubbleId : undefined}
          className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-primary-300 text-primary-600 text-xs font-bold leading-none hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
        >
          i
        </button>
      )}

      <span
        ref={bubbleRef}
        id={bubbleId}
        role="tooltip"
        className={`pointer-events-none absolute z-modal w-56 rounded-lg bg-gray-900 px-3 py-2 text-xs font-normal leading-snug text-white shadow-xl ${
          canFollow ? '' : 'text-center'
        }`}
        style={{ ...staticPos, opacity: 0, visibility: 'hidden' }}
      >
        {content}
      </span>
    </span>
  );
};

export default Tooltip;

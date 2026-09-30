import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { gsap, prefersReducedMotion } from '../../lib/gsap';

interface TooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  label?: string;
  followCursor?: boolean;
  className?: string;
}

const VIEWPORT_GUTTER = 16;
const TRIGGER_GAP = 8;
const MAX_WIDTH = 224;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

type Position = { left: number; top: number; width: number };

/** Viewport-clamped tooltip that never contributes to document width. */
const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  label,
  followCursor = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const rawId = useId().replace(/:/g, '');
  const bubbleId = `tt-${rawId}`;
  const canFollow =
    followCursor &&
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover)').matches &&
    !prefersReducedMotion();
  const canHover =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover)').matches;

  const place = useCallback(
    (pointer?: { clientX: number; clientY: number }) => {
      const bubble = bubbleRef.current;
      const trigger = wrapperRef.current;
      if (!bubble || !trigger) return;

      const width = Math.min(
        MAX_WIDTH,
        window.innerWidth - VIEWPORT_GUTTER * 2
      );
      // offsetHeight deliberately ignores GSAP's entrance scale, so the final
      // 1x bubble remains inside the same gutter used for placement.
      const height = bubble.offsetHeight;
      const maxLeft = window.innerWidth - VIEWPORT_GUTTER - width;
      const maxTop = window.innerHeight - VIEWPORT_GUTTER - height;
      let preferredLeft: number;
      let preferredTop: number;

      if (pointer && canFollow) {
        preferredLeft = pointer.clientX + TRIGGER_GAP;
        preferredTop = pointer.clientY - TRIGGER_GAP - height;
        if (preferredTop < VIEWPORT_GUTTER)
          preferredTop = pointer.clientY + TRIGGER_GAP;
      } else {
        const triggerRect = trigger.getBoundingClientRect();
        preferredLeft = triggerRect.left + triggerRect.width / 2 - width / 2;
        preferredTop = triggerRect.top - TRIGGER_GAP - height;
        if (preferredTop < VIEWPORT_GUTTER)
          preferredTop = triggerRect.bottom + TRIGGER_GAP;
      }

      setPosition({
        left: clamp(preferredLeft, VIEWPORT_GUTTER, maxLeft),
        top: clamp(preferredTop, VIEWPORT_GUTTER, maxTop),
        width,
      });
    },
    [canFollow]
  );

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const reposition = () => place();
    const observer = new ResizeObserver(reposition);
    if (bubbleRef.current) observer.observe(bubbleRef.current);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !wrapperRef.current?.contains(target) &&
        !bubbleRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    const bubble = bubbleRef.current;
    if (!open || !bubble || !position) return;
    if (prefersReducedMotion()) {
      gsap.set(bubble, { autoAlpha: 1, scale: 1 });
      return;
    }
    gsap.fromTo(
      bubble,
      { autoAlpha: 0, scale: 0.9 },
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.2,
        ease: 'spring',
      }
    );
  }, [open, position]);

  const handleMove = (event: React.MouseEvent) => {
    if (canFollow) place(event);
  };
  const onTouchTrigger = (event: React.PointerEvent) => {
    if (event.pointerType !== 'mouse') setOpen(current => !current);
  };

  const trigger = children ? (
    <span
      tabIndex={0}
      aria-describedby={open ? bubbleId : undefined}
      onPointerDown={onTouchTrigger}
      className="inline-flex cursor-help outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
    >
      {children}
    </span>
  ) : (
    <button
      type="button"
      aria-label={label || t('tooltip.moreInfo')}
      aria-describedby={open ? bubbleId : undefined}
      onPointerDown={onTouchTrigger}
      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-primary-300 text-primary-600 text-xs font-bold leading-none hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
    >
      i
    </button>
  );

  return (
    <span
      ref={wrapperRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        if (canHover) setOpen(false);
      }}
      onMouseMove={handleMove}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={event => {
        if (event.key === 'Escape') setOpen(false);
      }}
    >
      {trigger}
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <span
            ref={bubbleRef}
            id={bubbleId}
            role="tooltip"
            className={`pointer-events-none fixed z-modal rounded-lg bg-gray-900 px-3 py-2 text-xs font-normal leading-snug text-white shadow-xl ${canFollow ? '' : 'text-center'}`}
            style={{
              left: position?.left ?? VIEWPORT_GUTTER,
              top: position?.top ?? VIEWPORT_GUTTER,
              width: position?.width ?? MAX_WIDTH,
              opacity: position ? undefined : 0,
              visibility: position ? 'visible' : 'hidden',
            }}
          >
            {content}
          </span>,
          document.body
        )}
    </span>
  );
};

export default Tooltip;

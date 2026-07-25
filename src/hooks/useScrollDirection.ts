import { useEffect, useRef, useState } from 'react';

export interface ScrollDirectionState {
  direction: 'up' | 'down';
  scrolled: boolean;
}

/**
 * Tracks vertical scroll direction and whether the page has scrolled past a
 * small threshold. Reads `window.scrollY`, throttled to one update per frame
 * via requestAnimationFrame.
 *
 * `scrolled` is true once `scrollY > 8` (useful for compacting a sticky header).
 */
export function useScrollDirection(): ScrollDirectionState {
  const [state, setState] = useState<ScrollDirectionState>({
    direction: 'up',
    scrolled: false,
  });
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const update = () => {
      ticking.current = false;
      const y = window.scrollY;
      const direction: 'up' | 'down' =
        y > lastY.current ? 'down' : y < lastY.current ? 'up' : state.direction;
      const scrolled = y > 8;
      lastY.current = y < 0 ? 0 : y;
      setState(prev =>
        prev.direction === direction && prev.scrolled === scrolled
          ? prev
          : { direction, scrolled }
      );
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => window.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}

export default useScrollDirection;

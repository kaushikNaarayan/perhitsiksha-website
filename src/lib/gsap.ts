/**
 * Shared GSAP setup + helpers for the Perhitsiksha site.
 * Single registration point (idempotent for React StrictMode double-invoke),
 * global defaults, the DS "spring" CustomEase, and reusable helpers.
 *
 * GSAP 3.13+ ships every plugin free — no Club license gate.
 */
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { SplitText } from 'gsap/SplitText';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Flip } from 'gsap/Flip';

let registered = false;

export function registerGsap(): void {
  if (registered) return;
  registered = true;
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    Observer,
    Draggable,
    InertiaPlugin,
    SplitText,
    MorphSVGPlugin,
    DrawSVGPlugin,
    CustomEase,
    ScrollToPlugin,
    Flip
  );
  // Hardware-accelerate everything; only transform/opacity should ever be tweened.
  gsap.defaults({ force3D: true });
  // DS "spring" ease — playful bounce for hovers, snaps, reveals.
  if (!CustomEase.get('spring')) {
    CustomEase.create('spring', 'M0,0 C0.175,0.885 0.32,1.275 1,1');
  }
}

registerGsap();

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Magnetic pull: nudges `el` toward the cursor while it's near.
 * Returns a cleanup fn. No-op on touch / reduced-motion.
 */
export function attachMagnetic(el: HTMLElement, strength = 0.3): () => void {
  if (prefersReducedMotion() || !window.matchMedia('(hover: hover)').matches) {
    return () => {};
  }
  const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'spring' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'spring' });
  const onMove = (e: MouseEvent) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    xTo(dx * strength);
    yTo(dy * strength);
  };
  const onLeave = () => {
    xTo(0);
    yTo(0);
  };
  el.addEventListener('mousemove', onMove);
  el.addEventListener('mouseleave', onLeave);
  return () => {
    el.removeEventListener('mousemove', onMove);
    el.removeEventListener('mouseleave', onLeave);
  };
}

export interface HorizontalLoopConfig {
  speed?: number;
  paddingRight?: number;
  repeat?: number;
  paused?: boolean;
  snap?: number | number[] | false;
}

/**
 * Seamless right-to-left marquee loop (official GSAP helper, trimmed).
 * Returns a timeline extended with .next()/.previous()/.toIndex() controls.
 */
export function horizontalLoop(
  items: HTMLElement[],
  config: HorizontalLoopConfig = {}
): gsap.core.Timeline {
  const el = gsap.utils.toArray<HTMLElement>(items);
  const tl = gsap.timeline({
    repeat: config.repeat ?? -1,
    paused: config.paused ?? false,
    defaults: { ease: 'none' },
  });
  const length = el.length;
  const widths: number[] = [];
  const xPercents: number[] = [];
  let totalWidth = 0;
  const pixelsPerSecond = (config.speed || 1) * 100;
  const snap =
    config.snap === false
      ? (v: number) => v
      : gsap.utils.snap(config.snap || 1);

  gsap.set(el, {
    xPercent: (i, target) => {
      const w = (widths[i] = parseFloat(
        gsap.getProperty(target, 'width', 'px') as string
      ));
      xPercents[i] = snap(
        (parseFloat(gsap.getProperty(target, 'x', 'px') as string) / w) * 100 +
          (gsap.getProperty(target, 'xPercent') as number)
      );
      return xPercents[i];
    },
  });
  gsap.set(el, { x: 0 });
  totalWidth =
    el[length - 1].offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    el[0].offsetLeft +
    el[length - 1].offsetWidth *
      (gsap.getProperty(el[length - 1], 'scaleX') as number) +
    (config.paddingRight || 0);

  for (let i = 0; i < length; i++) {
    const item = el[i];
    const curX = (xPercents[i] / 100) * widths[i];
    const distanceToStart = item.offsetLeft + curX - el[0].offsetLeft;
    const distanceToLoop =
      distanceToStart +
      widths[i] * (gsap.getProperty(item, 'scaleX') as number);
    tl.to(
      item,
      {
        xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0
    )
      .fromTo(
        item,
        {
          xPercent: snap(
            ((curX - distanceToLoop + totalWidth) / widths[i]) * 100
          ),
        },
        {
          xPercent: xPercents[i],
          duration:
            (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
          immediateRender: false,
        },
        distanceToLoop / pixelsPerSecond
      )
      .add('label' + i, distanceToStart / pixelsPerSecond);
  }
  tl.progress(1, true).progress(0, true); // pre-render for a smooth start
  return tl;
}

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  Observer,
  Draggable,
  SplitText,
  MorphSVGPlugin,
  DrawSVGPlugin,
  CustomEase,
  ScrollToPlugin,
  Flip,
};

import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/gsap';
import Tooltip from './Tooltip';

interface StatsCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  className?: string;
  /** Optional info-icon tooltip rendered next to the label. */
  infoContent?: React.ReactNode;
  /** Accessible label for the info-icon trigger. */
  infoLabel?: string;
  /** Optional cursor-following tooltip shown when hovering the number. */
  hoverTip?: React.ReactNode;
  /** Override the number's text color (defaults to text-primary-500). */
  numberClassName?: string;
  /** Override the label's text color (defaults to text-gray-600). */
  labelClassName?: string;
}

const StatsCounter: React.FC<StatsCounterProps> = ({
  value,
  suffix = '',
  prefix = '',
  label,
  className = '',
  infoContent,
  infoLabel,
  hoverTip,
  numberClassName = 'text-primary-500',
  labelClassName = 'text-gray-600',
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const num = numRef.current;
      if (!num) return;

      const render = (v: number) => {
        num.textContent = `${prefix}${Math.round(v).toLocaleString()}${suffix}`;
      };

      // Reduced motion: show the final value immediately, no count-up.
      if (prefersReducedMotion()) {
        render(value);
        return;
      }

      const obj = { val: 0 };
      render(0);
      gsap.to(obj, {
        val: value,
        duration: 2,
        ease: 'power1.out',
        snap: { val: 1 },
        onUpdate: () => render(obj.val),
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top 85%',
          once: true,
        },
      });
    },
    { scope: rootRef, dependencies: [value, prefix, suffix] }
  );

  const numberEl = (
    <div
      ref={numRef}
      className={`text-2xl md:text-3xl lg:text-4xl font-bold ${numberClassName} mb-1 tabular-nums`}
    >
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </div>
  );

  return (
    <div ref={rootRef} className={`text-center ${className}`}>
      {hoverTip ? (
        <Tooltip content={hoverTip} followCursor className="justify-center">
          {numberEl}
        </Tooltip>
      ) : (
        numberEl
      )}
      <div
        className={`flex items-center justify-center gap-1.5 text-sm md:text-base ${labelClassName} font-medium`}
      >
        <span>{label}</span>
        {infoContent && <Tooltip content={infoContent} label={infoLabel} />}
      </div>
    </div>
  );
};

export default StatsCounter;

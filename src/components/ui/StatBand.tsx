import React from 'react';
import StatsCounter from './StatsCounter';

export interface StatBandItem {
  /** Numeric value to count up (e.g. 450). Omit and use `display` for
   * non-numeric facts like "80G" or "Section 8". */
  value?: number;
  suffix?: string;
  prefix?: string;
  /** Static text shown instead of an animated count-up (e.g. "80G", "Section 8"). */
  display?: string;
  label: string;
  hoverTip?: React.ReactNode;
  infoContent?: React.ReactNode;
  infoLabel?: string;
}

interface StatBandProps {
  items: StatBandItem[];
  className?: string;
}

/**
 * v3 "impact-band" stat row — a responsive grid of stat entries (numeric
 * count-ups or static facts), shared so Home/About/Testimonials render the
 * same 2-4up rhythm.
 */
const StatBand: React.FC<StatBandProps> = ({ items, className = '' }) => {
  const cols =
    items.length >= 4
      ? 'sm:grid-cols-4'
      : items.length === 3
        ? 'sm:grid-cols-3'
        : 'sm:grid-cols-2';

  return (
    <div className={`grid grid-cols-2 gap-8 ${cols} ${className}`}>
      {items.map((item, i) =>
        item.display !== undefined ? (
          <div key={i} className="text-center">
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 mb-1">
              {item.display}
            </div>
            <div className="text-sm md:text-base text-gray-600 font-medium">
              {item.label}
            </div>
          </div>
        ) : (
          <StatsCounter
            key={i}
            value={item.value ?? 0}
            suffix={item.suffix}
            prefix={item.prefix}
            label={item.label}
            hoverTip={item.hoverTip}
            infoContent={item.infoContent}
            infoLabel={item.infoLabel}
          />
        )
      )}
    </div>
  );
};

export default StatBand;

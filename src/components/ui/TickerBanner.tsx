import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { FaExternalLinkAlt } from 'react-icons/fa';

const TickerBanner: React.FC = () => {
  const { t } = useTranslation('ticker');

  const announcement = (
    <Trans
      t={t}
      i18nKey="announcement"
      components={{
        cert: (
          <a
            href="https://drive.google.com/file/d/1ozwZyO0k4ZiZUWqoTQh60qHTI_w5K2L_/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline font-semibold hover:text-primary-100 transition-colors"
          />
        ),
        icon: (
          <span className="inline-flex items-center justify-center border border-white rounded w-4 h-4">
            <FaExternalLinkAlt className="w-2.5 h-2.5" />
          </span>
        ),
      }}
    />
  );

  return (
    <aside
      aria-label={t('ariaLabel', { defaultValue: 'Announcements' })}
      className="bg-primary-600 text-white py-2 overflow-hidden"
    >
      <div className="ticker-wrapper">
        <div className="ticker-content">
          <span className="ticker-item text-xs sm:text-sm md:text-base whitespace-nowrap">
            {announcement}{' '}
          </span>
          <span className="ticker-item text-xs sm:text-sm md:text-base whitespace-nowrap">
            {announcement}{' '}
          </span>
        </div>
      </div>
      <style>{`
        .ticker-wrapper {
          width: 100%;
          overflow: hidden;
        }

        .ticker-content {
          display: inline-flex;
          animation: ticker 30s linear infinite;
        }

        .ticker-item {
          display: inline-block;
          padding-right: 2rem;
        }

        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        /* Only pause on hover for desktop devices */
        @media (hover: hover) and (pointer: fine) {
          .ticker-content:hover {
            animation-play-state: paused;
          }
        }

        /* Static banner for laptops and desktops (1024px and above) */
        @media (min-width: 1024px) {
          .ticker-wrapper {
            display: flex;
            justify-content: center;
          }

          .ticker-content {
            animation: none;
            transform: none;
          }

          .ticker-item:last-child {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
};

export default TickerBanner;

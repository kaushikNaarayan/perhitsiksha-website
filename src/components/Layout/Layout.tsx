import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Footer from './Footer';
import MobileCTA from './MobileCTA';
import TickerBanner from '../ui/TickerBanner';
import DonationDrawer from '../ui/DonationDrawer';
import { useScrollDirection } from '../../hooks/useScrollDirection';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation('header');
  // Menu state is lifted here so the sticky bottom MobileCTA can be suppressed
  // while the full-screen mobile menu is open.
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { direction, scrolled } = useScrollDirection();

  // De-clutter: collapse the ticker on scroll-down, reveal it on scroll-up.
  const tickerHidden = direction === 'down' && scrolled;

  return (
    <div className="min-h-screen flex flex-col">
      {/* A11y: first focusable element jumps keyboard users to the content. */}
      <a href="#main-content" className="skip-link">
        {t('skipToContent')}
      </a>

      {/* Section-8 ticker sits above the nav; hides on scroll-down. */}
      <div
        aria-hidden={tickerHidden}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          tickerHidden ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'
        }`}
      >
        <TickerBanner />
      </div>

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <Footer />

      {/* Thumb-reach CTA for small screens; suppressed while the menu is open. */}
      <MobileCTA hidden={isMenuOpen} />

      {/* Global donation drawer — opened by any Contribute CTA. */}
      <DonationDrawer />
    </div>
  );
};

export default Layout;

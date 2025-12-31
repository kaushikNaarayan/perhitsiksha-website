import React from 'react';
import Header from './Header';
import Footer from './Footer';
import TickerBanner from '../ui/TickerBanner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <TickerBanner />
      <Header />

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;

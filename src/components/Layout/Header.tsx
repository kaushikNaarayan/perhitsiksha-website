import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImage from '../../assets/images/logo.jpg';
import VisitorCounter from '../ui/VisitorCounter';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Handle body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Scroll detection for header branding visibility
  useEffect(() => {
    const handleScroll = () => {
      // Show branding when scrolled past 60% of viewport height (Hero section)
      const scrollThreshold = window.innerHeight * 0.6;
      setShowBranding(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/testimonials', label: 'Testimonials' },
    { path: '/about', label: 'About' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Visitor Counter */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src={logoImage}
                alt="CLSI Perhitsiksha Logo"
                className={`w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover transition-opacity duration-300 ${
                  showBranding ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <span
                className={`text-xl font-bold text-gray-900 transition-opacity duration-300 ${
                  showBranding ? 'opacity-100' : 'opacity-0'
                }`}
              >
                CLSI Perhitsiksha
              </span>
            </Link>
            <VisitorCounter className="hidden sm:flex" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-primary-500 border-b-2 border-primary-500 pb-1'
                    : 'text-gray-700 hover:text-primary-500'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden md:block">
            <a
              href="https://wa.me/918142238633?text=Hi,%20I%20would%20like%20to%20contribute."
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200 inline-block"
            >
              Become a Contributor
            </a>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-primary-500 hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Slide-in Menu */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="mobile-menu-backdrop md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Slide-in Panel */}
            <div className="mobile-menu-panel md:hidden">
              <div className="p-6">
                {/* Close Button */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center space-x-2">
                    <img
                      src={logoImage}
                      alt="CLSI Perhitsiksha Logo"
                      className="w-6 h-6 rounded-lg object-cover"
                    />
                    <span className="text-lg font-bold text-gray-900">
                      CLSI Perhitsiksha
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-md text-gray-700 hover:text-primary-500 hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Close menu"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col space-y-4">
                  {navLinks.map(link => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                        isActive(link.path)
                          ? 'text-primary-500 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-500 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Social Media Icons for Mobile */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-center space-x-6">
                    <a
                      href="https://www.facebook.com/CGST.Lucknow.Social.Initiatives/"
                      className="text-gray-700 hover:text-primary-500 transition-colors duration-200"
                      aria-label="Follow us on Facebook"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                    <a
                      href="https://www.youtube.com/@clsi-perhitsiksha"
                      className="text-gray-700 hover:text-primary-500 transition-colors duration-200"
                      aria-label="Subscribe to our YouTube channel"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </a>
                  </div>

                  {/* Visitor Counter for Mobile */}
                  <div className="mt-4 flex justify-center">
                    <VisitorCounter />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;

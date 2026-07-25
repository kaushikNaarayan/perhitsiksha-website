import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logoImage from '../../assets/images/logo.jpg';
import VisitorCounter from '../ui/VisitorCounter';
import LanguageToggle from '../ui/LanguageToggle';
import ThemeToggle from '../ui/ThemeToggle';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { useDonationDrawer } from '../../context/DonationContext';
import {
  gsap,
  useGSAP,
  ScrollToPlugin,
  prefersReducedMotion,
} from '../../lib/gsap';

// ScrollToPlugin is registered in lib/gsap; reference it so tree-shaking keeps it.
void ScrollToPlugin;

// Homepage in-page sections the ScrollSpy tracks (ids live on Home.tsx sections).
const SECTION_IDS = ['impact', 'stories', 'contribute'] as const;

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const { t } = useTranslation('header');
  const location = useLocation();
  const onHome = location.pathname === '/';
  const { scrolled } = useScrollDirection();
  const { open: openDonation } = useDonationDrawer();

  const headerRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState<string>('');

  const closeMenu = useCallback(() => setIsMenuOpen(false), [setIsMenuOpen]);

  // Focus-trap the mobile panel (also handles Escape + focus restore).
  const panelRef = useFocusTrap<HTMLDivElement>(isMenuOpen, closeMenu);

  const isActive = (path: string) => location.pathname === path;

  // Close menu on route change.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location, setIsMenuOpen]);

  // Body-scroll-lock while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // ScrollSpy: on the homepage, highlight the section nearest the viewport centre.
  useEffect(() => {
    if (!onHome) {
      setActiveSection('');
      return;
    }
    const els = SECTION_IDS.map(id => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [onHome, location.pathname]);

  // Smooth-scroll to an in-page section (reduced-motion → instant jump).
  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    const offsetY = headerRef.current?.offsetHeight ?? 64;
    gsap.to(window, {
      duration: prefersReducedMotion() ? 0 : 0.8,
      scrollTo: { y: target, offsetY },
      ease: 'power3.inOut',
    });
    setActiveSection(id);
    closeMenu();
  };

  // Logo → scroll-to-top on the homepage; normal Link navigation elsewhere.
  const onLogoClick = (e: React.MouseEvent) => {
    if (!onHome) return;
    e.preventDefault();
    gsap.to(window, {
      duration: prefersReducedMotion() ? 0 : 0.8,
      scrollTo: { y: 0 },
      ease: 'power3.inOut',
    });
    closeMenu();
  };

  // Staggered reveal of the mobile menu links on open (reduced-motion safe).
  useGSAP(
    () => {
      if (!isMenuOpen) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.mobile-nav-item', {
          y: 30,
          opacity: 0,
          stagger: 0.05,
          duration: 0.4,
          ease: 'power3.out',
        });
      });
      return () => mm.revert();
    },
    { scope: panelRef, dependencies: [isMenuOpen] }
  );

  const routeLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/testimonials', label: t('nav.testimonials') },
    { path: '/about', label: t('nav.about') },
  ];

  const anchorLinks = [
    { id: 'impact', label: t('nav.impact') },
    { id: 'stories', label: t('nav.stories') },
    { id: 'contribute', label: t('nav.contribute') },
  ];

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-header bg-white/80 dark:bg-[#141314]/85 backdrop-blur-md border-b border-primary-50/60 dark:border-white/10 transition-shadow duration-200 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo and Visitor Counter */}
          <div className="flex items-center space-x-4 min-w-0">
            <Link
              to="/"
              onClick={onLogoClick}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <img
                src={logoImage}
                alt={t('logoAlt')}
                className="w-8 h-8 md:w-12 md:h-12 rounded-lg object-cover"
              />
              <span className="text-lg md:text-xl font-bold text-gray-900">
                {t('brand')}
              </span>
            </Link>
            <VisitorCounter className="hidden sm:flex" />
          </div>

          {/* Desktop Navigation — fluid wrap so long Hindi labels don't overflow */}
          <nav className="hidden lg:flex flex-wrap items-center gap-x-6 gap-y-2 min-w-0">
            {onHome
              ? anchorLinks.map(link => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={scrollToSection(link.id)}
                    aria-current={
                      activeSection === link.id ? 'true' : undefined
                    }
                    className={`font-medium transition-colors duration-200 ${
                      activeSection === link.id
                        ? 'text-primary-500 border-b-2 border-primary-500 pb-1'
                        : 'text-gray-700 hover:text-primary-500'
                    }`}
                  >
                    {link.label}
                  </a>
                ))
              : routeLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    aria-current={isActive(link.path) ? 'page' : undefined}
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

          {/* Desktop: theme + language toggle + CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <ThemeToggle />
            <LanguageToggle />
            <button
              type="button"
              onClick={openDonation}
              aria-label={t('ctaAriaLabel')}
              className="shimmer-btn whitespace-nowrap bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-full font-semibold transition-colors duration-200 inline-block"
            >
              {t('cta')}
            </button>
          </div>

          {/* Mobile Menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-primary-500 hover:bg-gray-100 transition-colors duration-200"
              aria-label={t('menu.toggle')}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu-panel"
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

        {/* Mobile Full-screen Menu */}
        {isMenuOpen && (
          <div
            id="mobile-menu-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('brand')}
            className="mobile-menu-panel lg:hidden"
          >
            <div className="p-6">
              {/* Header row */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-2">
                  <img
                    src={logoImage}
                    alt={t('logoAlt')}
                    className="w-6 h-6 rounded-lg object-cover"
                  />
                  <span className="text-lg font-bold text-gray-900">
                    {t('brand')}
                  </span>
                </div>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-md text-gray-700 hover:text-primary-500 hover:bg-gray-100 transition-colors duration-200"
                  aria-label={t('menu.close')}
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
                {onHome
                  ? anchorLinks.map(link => (
                      <a
                        key={link.id}
                        href={`#${link.id}`}
                        onClick={scrollToSection(link.id)}
                        aria-current={
                          activeSection === link.id ? 'true' : undefined
                        }
                        className={`mobile-nav-item py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                          activeSection === link.id
                            ? 'text-primary-500 bg-primary-50'
                            : 'text-gray-700 hover:text-primary-500 hover:bg-gray-50'
                        }`}
                      >
                        {link.label}
                      </a>
                    ))
                  : routeLinks.map(link => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={closeMenu}
                        aria-current={isActive(link.path) ? 'page' : undefined}
                        className={`mobile-nav-item py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                          isActive(link.path)
                            ? 'text-primary-500 bg-primary-50'
                            : 'text-gray-700 hover:text-primary-500 hover:bg-gray-50'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
              </nav>

              {/* Theme + language toggle + CTA */}
              <div className="mobile-nav-item mt-8 flex flex-col items-center gap-5">
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <LanguageToggle />
                </div>
                <button
                  type="button"
                  aria-label={t('ctaAriaLabel')}
                  onClick={() => {
                    closeMenu();
                    openDonation();
                  }}
                  className="shimmer-btn w-full text-center bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full font-semibold transition-colors duration-200"
                >
                  {t('cta')}
                </button>
              </div>

              {/* Social Media Icons */}
              <div className="mobile-nav-item mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-center space-x-6">
                  <a
                    href="https://www.facebook.com/share/19uSggzByG/"
                    className="text-gray-700 hover:text-primary-500 transition-colors duration-200"
                    aria-label={t('social.facebook')}
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
                    href="https://www.youtube.com/@PerhitSikshaFoundation"
                    className="text-gray-700 hover:text-primary-500 transition-colors duration-200"
                    aria-label={t('social.youtube')}
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
                  <a
                    href="https://www.instagram.com/perhit.siksha/"
                    className="text-gray-700 hover:text-primary-500 transition-colors duration-200"
                    aria-label={t('social.instagram')}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
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
        )}
      </div>
    </header>
  );
};

export default Header;

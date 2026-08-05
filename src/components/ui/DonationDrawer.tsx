import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/gsap';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import {
  useDonationDrawer,
  openDonationDrawer,
  DONATE_HREF,
} from '../../context/DonationContext';

const MIN_AMOUNT = 100;
const DONATION_EMAIL = 'clsi.perhitsiksha@gmail.com';

interface DonationDrawerProps {
  /**
   * Real UPI VPA (e.g. "perhitsiksha@okhdfcbank"). Until a verified id/QR is
   * supplied by the foundation this stays undefined and the UI shows a clearly
   * labelled placeholder — we never fabricate payment details. TODO: drop the
   * real VPA (and a real QR image) in here once finance confirms them.
   */
  upiVpa?: string;
}

const DonationDrawer: React.FC<DonationDrawerProps> = ({ upiVpa }) => {
  const { t } = useTranslation('donation');
  const { isOpen, close } = useDonationDrawer();

  // Keep mounted through the GSAP exit animation.
  const [mounted, setMounted] = useState(isOpen);

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useFocusTrap<HTMLDivElement>(isOpen, close);

  // Form state — both fields are optional, unvalidated mailto prefill.
  const [values, setValues] = useState({ name: '', amount: '' });

  const mailtoHref = useMemo(() => {
    const name = values.name.trim();
    const amountNum = Number(values.amount);
    const amount =
      values.amount.trim() !== '' &&
      Number.isFinite(amountNum) &&
      amountNum >= MIN_AMOUNT
        ? String(amountNum)
        : '';

    const bodyKey =
      name && amount
        ? 'contact.mailBodyBoth'
        : name
          ? 'contact.mailBodyName'
          : amount
            ? 'contact.mailBodyAmount'
            : 'contact.mailBodyNone';

    const subject = t('contact.mailSubject');
    const body = t(bodyKey, { name, amount });

    return `mailto:${DONATION_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }, [values, t]);

  // ------------------------------------------------------------------
  // Bridge: intercept CTAs we can't attach an onClick to (the hero <a>).
  // Any click on `a[href="#donate"]` or `[data-donate]` opens the drawer.
  // Installed once, capture-phase, for the app's lifetime.
  // ------------------------------------------------------------------
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const trigger = target?.closest?.(
        `a[href="${DONATE_HREF}"], [data-donate]`
      );
      if (trigger) {
        e.preventDefault();
        openDonationDrawer();
      }
    };
    document.addEventListener('click', onDocClick, true);
    return () => document.removeEventListener('click', onDocClick, true);
  }, []);

  // Mount as soon as asked to open; reset the form on each fresh open.
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setValues({ name: '', amount: '' });
    }
  }, [isOpen]);

  // Body-scroll-lock while open.
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // GSAP slide-in/out from the right; backdrop fade. Reduced-motion => instant.
  useGSAP(
    () => {
      if (!mounted) return;
      const backdrop = rootRef.current?.querySelector('.donation-backdrop');
      const panel = rootRef.current?.querySelector('.donation-panel');
      if (!backdrop || !panel) return;

      const reduce = prefersReducedMotion();

      if (isOpen) {
        if (reduce) {
          gsap.set(backdrop, { opacity: 1 });
          gsap.set(panel, { opacity: 1, xPercent: 0 });
          return;
        }
        gsap.to(backdrop, { opacity: 1, duration: 0.25, ease: 'power2.out' });
        gsap.fromTo(
          panel,
          { xPercent: 100, opacity: 1 },
          { xPercent: 0, duration: 0.45, ease: 'power3.out' }
        );
        return;
      }

      // Closing.
      if (reduce) {
        setMounted(false);
        return;
      }
      const tl = gsap.timeline({ onComplete: () => setMounted(false) });
      tl.to(panel, { xPercent: 100, duration: 0.3, ease: 'power2.in' }, 0).to(
        backdrop,
        { opacity: 0, duration: 0.3, ease: 'power2.in' },
        0
      );
    },
    { scope: rootRef, dependencies: [isOpen, mounted] }
  );

  if (!mounted) return null;

  const setField =
    (field: 'name' | 'amount') => (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues(v => ({ ...v, [field]: e.target.value }));
    };

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-modal flex justify-end"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="donation-backdrop absolute inset-0 bg-black/60"
        style={{ opacity: 0 }}
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-heading"
        className="donation-panel relative ml-auto flex h-full w-full max-w-md flex-col overflow-y-auto bg-white dark:bg-[#1e1c1d] shadow-2xl"
        style={{ transform: 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 dark:border-white/10 bg-white/95 dark:bg-[#1e1c1d]/95 backdrop-blur px-6 py-4">
          <div>
            <h2
              id="donation-heading"
              className="text-xl font-bold text-gray-900 dark:text-[#f2eeec]"
            >
              {t('headline')}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#bdb7b4]">
              {t('subhead')}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={t('close')}
            className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-[#bdb7b4] dark:hover:bg-white/10 transition-colors"
          >
            <svg
              className="h-6 w-6"
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

        <div className="flex-1 px-6 py-5">
          {/* ---------- Contribution model ---------- */}
          <div className="rounded-card bg-primary-50 dark:bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-[#66a3ff]">
              {t('model.title')}
            </p>
            <ul className="mt-3 space-y-3">
              {(['amount', 'direct', 'transparent'] as const).map(key => (
                <li key={key} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-gray-900 dark:text-[#f2eeec]">
                      {t(`model.${key}`)}
                    </span>
                    <span className="block text-xs text-gray-600 dark:text-[#bdb7b4]">
                      {t(`model.${key}Label`)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- UPI QR — PLACEHOLDER (never fabricated) ---------- */}
          <div className="mt-5">
            <p className="text-sm font-semibold text-gray-900 dark:text-[#f2eeec] mb-2">
              {t('upi.title')}
            </p>
            <div className="flex flex-col items-center rounded-card border-2 border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 px-4 py-6 text-center">
              {/* TODO: replace this placeholder with a real QR <img> once a
                  verified VPA/QR is supplied (see `upiVpa` prop). We do NOT
                  render a scannable code or VPA until it is real. */}
              <div className="flex h-28 w-28 items-center justify-center rounded-media bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-[#8a8582]">
                <svg
                  className="h-10 w-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 3h3m3 0h-3m0 0v3m0-6v3"
                  />
                </svg>
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-[#d8d3d0]">
                {upiVpa ? upiVpa : t('upi.pending')}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-[#bdb7b4]">
                {t('upi.note')}
              </p>
            </div>
          </div>

          {/* ---------- Contact card — mailto composer ---------- */}
          <div className="mt-5 space-y-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-[#f2eeec]">
              {t('contact.title')}
            </p>

            <div>
              <label
                htmlFor="donation-name"
                className="block text-sm font-medium text-gray-700 dark:text-[#d8d3d0] mb-1"
              >
                {t('contact.nameLabel')}
              </label>
              <input
                id="donation-name"
                type="text"
                autoComplete="name"
                placeholder={t('contact.namePlaceholder')}
                value={values.name}
                onChange={setField('name')}
                className="w-full rounded-media border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141314] text-gray-900 dark:text-[#f2eeec] placeholder-gray-400 dark:placeholder-[#8a8582] px-4 py-2.5 outline-none transition-colors focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
              />
            </div>

            <div>
              <label
                htmlFor="donation-amount"
                className="block text-sm font-medium text-gray-700 dark:text-[#d8d3d0] mb-1"
              >
                {t('contact.amountLabel')}
              </label>
              <input
                id="donation-amount"
                type="number"
                inputMode="numeric"
                min={MIN_AMOUNT}
                step={100}
                value={values.amount}
                onChange={setField('amount')}
                className="w-full rounded-media border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141314] text-gray-900 dark:text-[#f2eeec] placeholder-gray-400 dark:placeholder-[#8a8582] px-4 py-2.5 outline-none transition-colors focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
              />
            </div>

            <a
              href={mailtoHref}
              className="shimmer-btn block w-full rounded-full bg-primary-500 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-primary-600"
            >
              {t('contact.cta')}
            </a>
            <p className="text-xs text-gray-500 dark:text-[#bdb7b4]">
              {t('contact.addressFallback')}
            </p>
            <p className="text-xs text-gray-500 dark:text-[#bdb7b4]">
              {t('contact.caption')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationDrawer;

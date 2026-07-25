import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/gsap';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import {
  useDonationDrawer,
  openDonationDrawer,
  DONATE_HREF,
} from '../../context/DonationContext';

/** Foundation WhatsApp line — the working, real contact fallback. */
const WHATSAPP_NUMBER = '918317580423';
const DEFAULT_AMOUNT = 1000;
const MIN_AMOUNT = 100;

interface DonationDrawerProps {
  /**
   * Real UPI VPA (e.g. "perhitsiksha@okhdfcbank"). Until a verified id/QR is
   * supplied by the foundation this stays undefined and the UI shows a clearly
   * labelled placeholder — we never fabricate payment details. TODO: drop the
   * real VPA (and a real QR image) in here once finance confirms them.
   */
  upiVpa?: string;
}

type FieldName = 'name' | 'email' | 'phone' | 'amount';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Indian mobile: strip spaces / +91, require 10 digits starting 6-9. */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}
function isValidPhone(raw: string): boolean {
  return /^[6-9]\d{9}$/.test(normalizePhone(raw));
}

const buildWhatsAppHref = (
  name: string,
  amount: string,
  phone: string,
  email: string
): string => {
  const msg =
    `Hi, I would like to contribute ₹${amount || DEFAULT_AMOUNT}/month to fund a scholar.` +
    (name ? `\nName: ${name}` : '') +
    (phone ? `\nPhone: ${phone}` : '') +
    (email ? `\nEmail: ${email}` : '');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
};

const DonationDrawer: React.FC<DonationDrawerProps> = ({ upiVpa }) => {
  const { t } = useTranslation('donation');
  const { isOpen, close } = useDonationDrawer();

  // Keep mounted through the GSAP exit animation.
  const [mounted, setMounted] = useState(isOpen);

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useFocusTrap<HTMLDivElement>(isOpen, close);

  // Form state
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    amount: String(DEFAULT_AMOUNT),
  });
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    name: false,
    email: false,
    phone: false,
    amount: false,
  });
  const [submitted, setSubmitted] = useState(false);

  // Per-field validity (pure derivation from current values).
  const validity = useMemo(() => {
    const amountNum = Number(values.amount);
    return {
      name: values.name.trim().length >= 2,
      email: EMAIL_RE.test(values.email.trim()),
      phone: isValidPhone(values.phone),
      amount: Number.isFinite(amountNum) && amountNum >= MIN_AMOUNT,
    };
  }, [values]);

  const allValid =
    validity.name && validity.email && validity.phone && validity.amount;

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
      setSubmitted(false);
      setTouched({ name: false, email: false, phone: false, amount: false });
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
    (field: FieldName) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues(v => ({ ...v, [field]: e.target.value }));
      setTouched(tt => ({ ...tt, [field]: true }));
    };
  const markTouched = (field: FieldName) => () =>
    setTouched(tt => ({ ...tt, [field]: true }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, amount: true });
    if (allValid) setSubmitted(true);
  };

  const whatsappHref = buildWhatsAppHref(
    values.name.trim(),
    values.amount,
    normalizePhone(values.phone),
    values.email.trim()
  );

  // --- field row helper (inline validation feedback) ---
  const fieldError: Record<FieldName, string> = {
    name: t('form.errName'),
    email: t('form.errEmail'),
    phone: t('form.errPhone'),
    amount: t('form.errAmount', { min: MIN_AMOUNT }),
  };

  const renderField = (
    field: FieldName,
    label: string,
    inputProps: React.InputHTMLAttributes<HTMLInputElement>
  ) => {
    const showState = touched[field] && values[field] !== '';
    const ok = validity[field];
    return (
      <div>
        <label
          htmlFor={`donation-${field}`}
          className="block text-sm font-medium text-gray-700 dark:text-[#d8d3d0] mb-1"
        >
          {label}
        </label>
        <div className="relative">
          <input
            id={`donation-${field}`}
            value={values[field]}
            onChange={setField(field)}
            onBlur={markTouched(field)}
            aria-invalid={showState ? !ok : undefined}
            aria-describedby={
              showState && !ok ? `donation-${field}-err` : undefined
            }
            className={`w-full rounded-media border bg-white dark:bg-[#141314] text-gray-900 dark:text-[#f2eeec] placeholder-gray-400 dark:placeholder-[#8a8582] px-4 py-2.5 pr-10 outline-none transition-colors focus:ring-2 ${
              showState
                ? ok
                  ? 'border-success-500 focus:ring-success-500/40'
                  : 'border-[#E01919] focus:ring-[#E01919]/40'
                : 'border-gray-300 dark:border-white/15 focus:ring-primary-500/40 focus:border-primary-500'
            }`}
            {...inputProps}
          />
          {showState && (
            <span
              aria-hidden="true"
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {ok ? (
                <svg
                  className="w-5 h-5 text-success-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-[#E01919]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </span>
          )}
        </div>
        {showState && (
          <p
            id={ok ? undefined : `donation-${field}-err`}
            className={`mt-1 text-xs ${
              ok ? 'text-success-600' : 'text-[#E01919]'
            }`}
          >
            {ok ? t('form.valid') : fieldError[field]}
          </p>
        )}
      </div>
    );
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
          {submitted ? (
            /* ---------- Thank-you state ---------- */
            <div className="flex flex-col items-center text-center py-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success-500">
                <svg
                  className="h-9 w-9"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#f2eeec]">
                {t('thanks.title', { name: values.name.trim() })}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-[#bdb7b4]">
                {t('thanks.body', {
                  amount: Number(values.amount).toLocaleString('en-IN'),
                })}
              </p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.037zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                {t('thanks.cta')}
              </a>
              <button
                type="button"
                onClick={close}
                className="mt-3 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-[#bdb7b4] dark:hover:text-[#f2eeec]"
              >
                {t('thanks.done')}
              </button>
            </div>
          ) : (
            <>
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

              {/* ---------- Form ---------- */}
              <form
                onSubmit={handleSubmit}
                noValidate
                className="mt-5 space-y-4"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-[#f2eeec]">
                  {t('form.title')}
                </p>
                {renderField('name', t('form.nameLabel'), {
                  type: 'text',
                  autoComplete: 'name',
                  placeholder: t('form.namePlaceholder'),
                })}
                {renderField('email', t('form.emailLabel'), {
                  type: 'email',
                  inputMode: 'email',
                  autoComplete: 'email',
                  placeholder: t('form.emailPlaceholder'),
                })}
                {renderField('phone', t('form.phoneLabel'), {
                  type: 'tel',
                  inputMode: 'tel',
                  autoComplete: 'tel',
                  placeholder: t('form.phonePlaceholder'),
                })}
                {renderField('amount', t('form.amountLabel'), {
                  type: 'number',
                  inputMode: 'numeric',
                  min: MIN_AMOUNT,
                  step: 100,
                })}

                <button
                  type="submit"
                  className="shimmer-btn w-full rounded-full bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
                >
                  {t('form.submit')}
                </button>
              </form>

              {/* ---------- WhatsApp secondary path (always available) ---------- */}
              <div className="mt-5 border-t border-gray-100 dark:border-white/10 pt-4 text-center">
                <p className="text-xs text-gray-500 dark:text-[#bdb7b4] mb-2">
                  {t('whatsapp.secondary')}
                </p>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#25D366] px-5 py-2.5 text-sm font-semibold text-[#128C7E] dark:text-[#25D366] transition-colors hover:bg-[#25D366]/10"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.037zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationDrawer;

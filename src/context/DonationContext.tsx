import { useSyncExternalStore } from 'react';

/**
 * Donation-drawer open/close state.
 *
 * Implemented as a tiny module-level store (not a React Context Provider) so
 * that ANY component can open the drawer without the app being wrapped in a
 * provider — and, crucially, so the hero CTA can trigger it even though its
 * button is rendered by `Hero.tsx` (owned by another agent, not editable here).
 * Components subscribe via `useDonationDrawer()`; the drawer is mounted once in
 * `Layout.tsx`.
 *
 * The hero's "Contribute" button is an <a> whose href we set to the sentinel
 * `#donate` (see Home.tsx). `DonationDrawer` installs a single document-level
 * capture-phase click listener that intercepts clicks on `a[href="#donate"]`
 * (or any `[data-donate]` element) and opens the drawer — the one bridge we
 * need for CTAs we can't attach an onClick to directly.
 */

/** Sentinel href / attribute used by CTAs we can't wire with a direct onClick. */
export const DONATE_HREF = '#donate';

let isOpen = false;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach(l => l());
}

export function openDonationDrawer(): void {
  if (isOpen) return;
  isOpen = true;
  emit();
}

export function closeDonationDrawer(): void {
  if (!isOpen) return;
  isOpen = false;
  emit();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): boolean {
  return isOpen;
}

export interface DonationDrawerState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export function useDonationDrawer(): DonationDrawerState {
  const open = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { isOpen: open, open: openDonationDrawer, close: closeDonationDrawer };
}

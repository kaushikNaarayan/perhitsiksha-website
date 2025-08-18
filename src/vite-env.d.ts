/// <reference types="vite/client" />

// Google Analytics global function
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export {};

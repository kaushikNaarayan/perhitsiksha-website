/// <reference types="vite/client" />

// Google Analytics global function
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export {};

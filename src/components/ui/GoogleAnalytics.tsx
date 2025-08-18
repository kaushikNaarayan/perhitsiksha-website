import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const TRACKING_ID = 'G-4VMH1XGME6';

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize GA4 with the tracking ID
    ReactGA.initialize(TRACKING_ID);
  }, []);

  useEffect(() => {
    // Track page views on route changes
    ReactGA.send({ 
      hitType: "pageview", 
      page: location.pathname + location.search 
    });
  }, [location]);

  return null; // This component doesn't render anything
};

// Utility functions for tracking events
export const trackEvent = (action: string, category = 'User Interaction', label?: string, value?: number) => {
  ReactGA.event({
    action,
    category,
    label,
    value,
  });
};

export const trackButtonClick = (buttonName: string, location = 'Unknown') => {
  trackEvent('button_click', 'Button', `${buttonName} - ${location}`);
};

export const trackVideoPlay = (videoTitle: string, videoId: string) => {
  trackEvent('video_play', 'Video', `${videoTitle} (${videoId})`);
};

export const trackWhatsAppClick = (context: string) => {
  trackEvent('whatsapp_click', 'Communication', context);
};

export const trackTestimonialView = (testimonialName: string, role: string) => {
  trackEvent('testimonial_view', 'Testimonials', `${testimonialName} - ${role}`);
};

export default GoogleAnalytics;
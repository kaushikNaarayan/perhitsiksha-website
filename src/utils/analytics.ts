import ReactGA from 'react-ga4';

// Utility functions for tracking events
export const trackEvent = (
  action: string,
  category = 'User Interaction',
  label?: string,
  value?: number
) => {
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
  trackEvent(
    'testimonial_view',
    'Testimonials',
    `${testimonialName} - ${role}`
  );
};

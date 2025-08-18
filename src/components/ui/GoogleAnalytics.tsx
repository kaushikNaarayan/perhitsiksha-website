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

export default GoogleAnalytics;
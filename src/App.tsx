import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Testimonials from './pages/Testimonials';
import About from './pages/About';
import Privacy from './pages/Privacy';
import GoogleAnalytics from './components/ui/GoogleAnalytics';
import ScrollToTop from './components/ui/ScrollToTop';

function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle redirect from 404.html for GitHub Pages SPA routing
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    
    if (redirect) {
      // Remove the redirect parameter and navigate to the intended route
      const decodedPath = decodeURIComponent(redirect);
      window.history.replaceState({}, '', decodedPath);
      navigate(decodedPath, { replace: true });
    }
  }, [navigate]);

  return (
    <Layout>
      <ScrollToTop />
      <GoogleAnalytics />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
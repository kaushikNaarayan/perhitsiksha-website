import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../../assets/images/logo.jpg';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto container-padding section-padding">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Organization Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src={logoImage}
                alt="Perhitsiksha Logo"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-xl font-bold">Perhitsiksha Foundation</span>
            </div>
            <div className="text-gray-300 mb-4 max-w-md text-sm">
              <p className="mb-1">
                Registered as a Section 8 Company under the Companies Act, 2013
              </p>
              <p className="mb-1">
                <span className="font-medium">CIN:</span> U85500UP2025NPL237759
              </p>
              <p className="mb-1">
                <span className="font-medium">Date of Incorporation:</span>{' '}
                December 6, 2025
              </p>
              <p>
                <span className="font-medium">Registered Office:</span> H NO.
                659 Eldeco Udayan-I, Sec-3 Bangla Bazar, Dilkusha, Lucknow,
                Uttar Pradesh - 226002
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/share/19uSggzByG/"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Follow us on Facebook"
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
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Subscribe to our YouTube channel"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/testimonials"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Testimonials
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/918142238633?text=Hi,%20I%20would%20like%20to%20contribute."
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Support Students
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:clsi.perhitsiksha@gmail.com"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center sm:text-left">
              © {currentYear} Perhitsiksha. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Website made by{' '}
              <a
                href="https://www.materiallab.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
              >
                Material Lab
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

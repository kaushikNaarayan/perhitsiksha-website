import React from 'react';
import Hero from '../components/ui/Hero';

// Import images
import aboutHeroBg from '../assets/images/about-hero-bg.png';

const Privacy: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <Hero
        title="Privacy Policy"
        subtitle="How we protect and handle your personal information."
        backgroundImage={aboutHeroBg}
        overlay={false}
      />

      {/* Privacy Policy Content */}
      <section className="bg-white section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="space-y-8 body-base text-gray-700 leading-relaxed">
            <div>
              <p className="mb-4">
                <strong>Last updated:</strong>{' '}
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p>
                At CLSI (formerly Perhitsiksha), we are committed to protecting
                your privacy and ensuring the security of your personal
                information. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you visit our
                website or interact with our services.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-4">Information We Collect</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Personal Information
              </h3>
              <p className="mb-4">
                We may collect personal information that you voluntarily provide
                to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Name, email address, and phone number</li>
                <li>Donation and contribution information</li>
                <li>
                  Student application details (for scholarship applicants)
                </li>
                <li>Communication preferences</li>
                <li>Any other information you choose to provide</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Automatically Collected Information
              </h3>
              <p className="mb-4">
                When you visit our website, we may automatically collect:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address and browser information</li>
                <li>Device type and operating system</li>
                <li>Pages visited and time spent on our site</li>
                <li>Referring website information</li>
              </ul>
            </div>

            <div>
              <h2 className="heading-3 mb-4">How We Use Your Information</h2>
              <p className="mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Processing donations and managing contributor relationships
                </li>
                <li>Evaluating and processing scholarship applications</li>
                <li>
                  Providing updates on student progress and organizational
                  activities
                </li>
                <li>Improving our website and services</li>
                <li>Responding to inquiries and providing customer support</li>
                <li>Complying with legal obligations</li>
                <li>
                  Sending periodic emails about our programs (with your consent)
                </li>
              </ul>
            </div>

            <div>
              <h2 className="heading-3 mb-4">
                Information Sharing and Disclosure
              </h2>
              <p className="mb-4">
                We do not sell, trade, or otherwise transfer your personal
                information to third parties, except in the following
                circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Service Providers:</strong> We may share information
                  with trusted third parties who assist us in operating our
                  website, conducting our business, or serving our users
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose
                  information when required by law or to protect our rights and
                  safety
                </li>
                <li>
                  <strong>Consent:</strong> We may share information with your
                  explicit consent
                </li>
                <li>
                  <strong>Student-Contributor Connection:</strong> With
                  appropriate consent, we facilitate communication between
                  students and their sponsors while maintaining privacy
                  boundaries
                </li>
              </ul>
            </div>

            <div>
              <h2 className="heading-3 mb-4">Data Security</h2>
              <p className="mb-4">
                We implement appropriate security measures to protect your
                personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Secure data transmission using encryption technology</li>
                <li>Regular security assessments and updates</li>
                <li>
                  Restricted access to personal information on a need-to-know
                  basis
                </li>
                <li>Secure storage of financial and personal data</li>
              </ul>
              <p>
                However, please note that no method of transmission over the
                Internet or electronic storage is 100% secure. While we strive
                to use commercially acceptable means to protect your
                information, we cannot guarantee its absolute security.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-4">Your Rights and Choices</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access, update, or delete your personal information</li>
                <li>Opt out of marketing communications</li>
                <li>Request information about how your data is used</li>
                <li>Withdraw consent for data processing (where applicable)</li>
                <li>
                  File a complaint with relevant data protection authorities
                </li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at
                clsi.perhitsiksha@gmail.com.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-4">Third-Party Services</h2>
              <p className="mb-4">
                Our website may contain links to third-party websites and
                services, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>YouTube videos and social media platforms</li>
                <li>Payment processing services</li>
                <li>Google Analytics for website analytics</li>
              </ul>
              <p>
                These third-party services have their own privacy policies. We
                encourage you to review their privacy practices as we are not
                responsible for their content or privacy policies.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-4">Children's Privacy</h2>
              <p>
                Our services are not directed to children under the age of 13.
                We do not knowingly collect personal information from children
                under 13. If we become aware that we have collected personal
                information from a child under 13, we will take steps to delete
                such information promptly.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-4">Changes to This Privacy Policy</h2>
              <p>
                We reserve the right to update this Privacy Policy at any time.
                When we make changes, we will revise the "Last updated" date at
                the top of this policy. We encourage you to review this Privacy
                Policy periodically to stay informed about how we protect your
                information.
              </p>
            </div>

            <div>
              <h2 className="heading-3 mb-4">Contact Information</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our
                privacy practices, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">
                  CLSI (Formerly Perhitsiksha)
                </p>
                <p className="mb-1">Email: clsi.perhitsiksha@gmail.com</p>
                <p className="mb-1">Phone: +91 81422 38633</p>
                <p>We will respond to your inquiries within 30 days.</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-500">
                This privacy policy is effective as of the date stated above and
                applies to all information collected by CLSI through our website
                and services.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;

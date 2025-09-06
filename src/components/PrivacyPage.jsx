import React from 'react';
import { Helmet } from 'react-helmet-async';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Privacy Policy - Poker Game Information</title>
        <meta name="description" content="Privacy Policy for our poker game information service" />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 space-y-6">
              <p className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
                <p>
                  We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information when you use our poker game information service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
                <h3 className="text-lg font-medium text-white mb-2">Personal Information</h3>
                <p>When you create an account, we collect:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Email address</li>
                  <li>Display name</li>
                  <li>Region selection</li>
                  <li>Notification preferences</li>
                </ul>

                <h3 className="text-lg font-medium text-white mb-2 mt-4">Usage Information</h3>
                <p>We automatically collect:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>IP address and browser information</li>
                  <li>Pages visited and time spent on our service</li>
                  <li>Device and operating system information</li>
                  <li>Analytics data through Google Analytics</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
                <p>We use your information to:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Provide and maintain our service</li>
                  <li>Send you game notifications (if you've opted in)</li>
                  <li>Improve our service and user experience</li>
                  <li>Communicate with you about service updates</li>
                  <li>Analyze usage patterns and trends</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. Information Sharing</h2>
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties, except as described in this policy:
                </p>
                <ul className="list-disc ml-6 mt-2">
                  <li><strong>Service Providers:</strong> We may share information with trusted service providers who assist us in operating our service</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights</li>
                  <li><strong>Analytics:</strong> We use Google Analytics, which may collect and process data according to their privacy policy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. Data Security</h2>
                <p>
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
                </p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments</li>
                  <li>Access controls and authentication</li>
                  <li>Secure hosting infrastructure</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">6. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar tracking technologies to enhance your experience:
                </p>
                <ul className="list-disc ml-6 mt-2">
                  <li><strong>Essential Cookies:</strong> Required for basic site functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of notifications</li>
                  <li>Data portability</li>
                  <li>Object to processing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">8. Data Retention</h2>
                <p>
                  We retain your personal information only for as long as necessary to provide our services and fulfill the purposes outlined in this policy. When you delete your account, we will remove your personal data, though some information may be retained for legal or security purposes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">9. Third-Party Services</h2>
                <p>
                  Our service may contain links to third-party websites or integrate with third-party services. This privacy policy does not apply to those external services. We recommend reviewing their privacy policies separately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">10. Children's Privacy</h2>
                <p>
                  Our service is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal information, please contact us.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">11. Changes to This Policy</h2>
                <p>
                  We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of the service after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">12. Contact Us</h2>
                <p>
                  If you have any questions about this privacy policy or our data practices, please contact us through our contact page. We will respond to your inquiries promptly.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
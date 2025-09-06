import React from 'react';
import { Helmet } from 'react-helmet-async';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Terms and Conditions - Poker Game Information</title>
        <meta name="description" content="Terms and Conditions for using our poker game information service" />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Terms and Conditions</h1>
          
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 space-y-6">
              <p className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using this poker game information service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. Service Description</h2>
                <p>
                  This service provides information about poker games in various Australian regions. We aggregate and display publicly available information about poker games, venues, and schedules. This service is for informational purposes only.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. User Responsibilities</h2>
                <p>
                  Users are responsible for:
                </p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Providing accurate information when creating an account</li>
                  <li>Maintaining the security of their account credentials</li>
                  <li>Using the service in compliance with all applicable laws</li>
                  <li>Verifying game information independently before attending events</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. Information Accuracy</h2>
                <p>
                  While we strive to provide accurate and up-to-date information, we cannot guarantee the accuracy, completeness, or timeliness of all information displayed. Game schedules, venues, and other details may change without notice. Users should independently verify all information before making decisions based on it.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. User Content and Submissions</h2>
                <p>
                  Users may submit game suggestions and other content. By submitting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute such content in connection with the service. You represent that you have all necessary rights to submit such content.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">6. Privacy</h2>
                <p>
                  Your privacy is important to us. Please refer to our Privacy Policy for information about how we collect, use, and protect your personal information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">7. Disclaimers</h2>
                <p>
                  This service is provided "as is" without any warranties, express or implied. We disclaim all warranties including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the service will be uninterrupted or error-free.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">8. Limitation of Liability</h2>
                <p>
                  In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">9. Legal Compliance</h2>
                <p>
                  Users must comply with all applicable laws and regulations regarding gambling and poker in their jurisdiction. This service does not provide gambling services and is not responsible for users' compliance with local gambling laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">10. Modifications</h2>
                <p>
                  We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of the service after changes constitutes acceptance of the modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">11. Termination</h2>
                <p>
                  We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including breach of these terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">12. Contact Information</h2>
                <p>
                  If you have any questions about these Terms and Conditions, please contact us through our contact page.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
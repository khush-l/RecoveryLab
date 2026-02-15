import Header from "@/components/header";
import Footer from "@/components/footer";

export const metadata = {
  title: "Terms of Service | RecoveryLab",
};

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header solid />
      <main className="flex-1 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[800px]">
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-[#202020] sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mb-6 text-sm text-[rgba(32,32,32,0.5)]">
            Last updated: February 15, 2026
          </p>

          <div className="flex flex-col gap-8 text-base leading-[170%] text-[rgba(32,32,32,0.75)]">
            <section>
              <h2 className="mb-3 text-xl font-bold text-[#202020]">1. Acceptance of Terms</h2>
              <p>
                By accessing or using RecoveryLab, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#202020]">2. Description of Service</h2>
              <p>
                RecoveryLab provides gait analysis, physical therapy tracking, and recovery monitoring tools. Our service is intended for informational purposes and does not replace professional medical advice.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#202020]">3. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating an account.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#202020]">4. Acceptable Use</h2>
              <p>
                You agree not to misuse our services, attempt to gain unauthorized access to our systems, or use the platform for any unlawful purpose. We reserve the right to suspend or terminate accounts that violate these terms.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#202020]">5. Medical Disclaimer</h2>
              <p>
                RecoveryLab is not a medical device and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider regarding any medical conditions.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#202020]">6. Limitation of Liability</h2>
              <p>
                RecoveryLab is provided &ldquo;as is&rdquo; without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#202020]">7. Changes to Terms</h2>
              <p>
                We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the updated terms. We will notify users of significant changes via email or in-app notification.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#202020]">8. Contact Us</h2>
              <p>
                If you have questions about these Terms of Service, please reach out to us at legal@recoverylab.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

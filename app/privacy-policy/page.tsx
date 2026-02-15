import Header from "@/components/header";
import Footer from "@/components/footer";

export const metadata = {
  title: "Privacy Policy | RecoveryLab",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header solid />
      <main className="flex-1 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-[800px]">
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-[#202020] sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mb-6 text-sm text-[rgba(32,32,32,0.5)]">
            Last updated: February 15, 2026
          </p>

          <div className="flex flex-col gap-8 text-base leading-[170%] text-[rgba(32,32,32,0.75)]">
            <section>
              <h2 className="mb-3 text-xl font-bold text-[#202020]">1. Information We Collect</h2>
              <p>
                RecoveryLab collects information you provide directly, such as your name, email address, and health-related data when you create an account and use our services. We also collect gait analysis data from device sensors to provide personalized recovery insights.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#202020]">2. How We Use Your Information</h2>
              <p>
                We use your information to provide and improve our gait analysis and recovery tracking services, send notifications to your care team when configured, and communicate important updates about your account.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#202020]">3. Data Sharing</h2>
              <p>
                We do not sell your personal information. We may share data with care team contacts you explicitly configure, service providers who assist in operating our platform, and when required by law.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#202020]">4. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your personal and health information. All data is encrypted in transit and at rest.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#202020]">5. Your Rights</h2>
              <p>
                You may access, update, or delete your personal data at any time through your account settings. You can also request a copy of your data or ask us to stop processing it by contacting us.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#202020]">6. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please reach out to us at privacy@recoverylab.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-5 pt-10 sm:px-8">
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-8 lg:grid-cols-2">
            {/* Left — text content */}
            <div className="text-center lg:text-left">
              <div className="fade-in">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm text-[rgba(32,32,32,0.75)] shadow-[0px_2px_4px_-1px_rgba(1,65,99,0.08)] border border-[rgba(32,32,32,0.08)]">
                  <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-[#1DB3FB] to-[#00A7EF]" />
                  Movement Analysis Platform
                </div>
              </div>

              <h1
                className="fade-in max-w-3xl text-[32px] leading-[96%] font-bold tracking-[-0.05em] sm:text-[48px] md:text-[64px]"
                style={{ animationDelay: "0.1s" }}
              >
                Understand movement.{" "}
                <span className="text-gradient">Protect health.</span>
              </h1>

              <p
                className="fade-in mt-6 max-w-xl text-base leading-[140%] text-[rgba(32,32,32,0.75)] sm:text-lg"
                style={{ animationDelay: "0.2s" }}
              >
                Upload a video and get AI-powered movement analysis with
                personalized exercise recommendations in seconds.
              </p>

              <div
                className="fade-in mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
                style={{ animationDelay: "0.3s" }}
              >
                <Link href="/analyze">
                  <Button variant="modern-primary" size="modern-xl" className="gap-2 px-6">
                    Start Analysis
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="modern-outline" size="modern-xl" className="px-6">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — illustration */}
            <div
              className="fade-in flex items-center justify-center lg:justify-end"
              style={{ animationDelay: "0.3s" }}
            >
              <Image
                src="/hero-image.png"
                alt="Physical therapist helping patient with exercises"
                width={978}
                height={656}
                className="w-full max-w-[560px] h-auto rounded-2xl shadow-lg"
                priority
                unoptimized
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-14 text-center">
              <h2 className="h2-style text-[#202020]">
                Built for <span className="text-gradient">precision</span>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base leading-[140%] text-[rgba(32,32,32,0.75)]">
                Everything you need to analyze, monitor, and improve your
                movement.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="platform-feature-card rounded-[10px] border border-[rgba(32,32,32,0.06)] p-6">
                <div className="mb-4 flex items-center gap-4">
                  <svg className="h-14 w-14 shrink-0" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#feat1_clip)">
                      <rect width="64" height="64" rx="8" fill="#E5F8E6"/>
                      <circle cx="-24" cy="-20" r="95" fill="#BFECC3"/>
                      <ellipse cx="-24.6094" cy="-20" rx="65.5" ry="65" fill="#0BBB46"/>
                      <ellipse cx="-24.6094" cy="-20" rx="65.5" ry="65" fill="url(#feat1_r0)" fillOpacity="0.55"/>
                      <path d="M6 58C6 43.6406 17.6406 32 32 32C46.3594 32 58 43.6406 58 58V84H6V58Z" fill="#81D48B"/>
                      <path d="M20 44.7588C20 46.4156 21.567 47.7588 23.5 47.7588C25.433 47.7588 27 46.4156 27 44.7588" stroke="#00395F" strokeWidth="2.5" strokeLinecap="round"/>
                      <path d="M36 44.7588C36 46.4156 37.567 47.7588 39.5 47.7588C41.433 47.7588 43 46.4156 43 44.7588" stroke="#00395F" strokeWidth="2.5" strokeLinecap="round"/>
                      <path d="M16 54.2585C22.7117 59.2046 41 59.4998 47 54.2585" stroke="#00395F" strokeWidth="2.5" strokeLinecap="round"/>
                      <path d="M41.5 3C47.8513 3 53 8.14873 53 14.5C53 19.9377 49.225 24.4903 44.1533 25.6885L34.2666 31.6367C33.4771 32.1116 32.5202 31.3569 32.7979 30.4785L34.2139 26H22.5C16.1487 26 11 20.8513 11 14.5C11 8.14873 16.1487 3 22.5 3H41.5Z" fill="white"/>
                      <circle cx="22" cy="15" r="3" fill="#0BBB46"/>
                      <circle cx="33" cy="15" r="3" fill="#0BBB46"/>
                      <circle cx="44" cy="15" r="3" fill="#0BBB46"/>
                    </g>
                    <rect x="0.5" y="0.5" width="63" height="63" rx="7.5" stroke="#202020" strokeOpacity="0.04"/>
                    <defs>
                      <radialGradient id="feat1_r0" cx="0" cy="0" r="1" gradientTransform="matrix(-37.9653 -81.382 48.0961 -41.6263 7.80286 40.6599)" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00AE3E"/><stop offset="1" stopColor="#00AE3E" stopOpacity="0"/>
                      </radialGradient>
                      <clipPath id="feat1_clip"><rect width="64" height="64" rx="8" fill="white"/></clipPath>
                    </defs>
                  </svg>
                  <h3 className="text-xl leading-[1.15] font-bold tracking-[-0.01rem] text-[#202020]">
                    AI-Powered Vision
                  </h3>
                </div>
                <p className="text-base leading-[140%] text-[rgba(32,32,32,0.75)]">
                  Our fine-tuned vision model analyzes your video frame by frame to identify movement patterns and abnormalities.
                </p>
              </div>

              <div className="platform-feature-card rounded-[10px] border border-[rgba(32,32,32,0.06)] p-6">
                <div className="mb-4 flex items-center gap-4">
                  <svg className="h-14 w-14 shrink-0" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#feat3_clip)">
                      <rect width="64" height="64" rx="8" fill="#FFF4BD"/>
                      <circle cx="-25" cy="107" r="90" fill="#FFEB98"/>
                      <ellipse cx="-25.6094" cy="102" rx="65.5" ry="65" fill="#FFD000"/>
                      <ellipse cx="-25.6094" cy="102" rx="65.5" ry="65" fill="url(#feat3_l0)" fillOpacity="0.6"/>
                      <path d="M32 11V31.5" stroke="white" strokeWidth="2"/>
                      <path d="M12 31.5H52" stroke="white" strokeWidth="2"/>
                      <path d="M52 31V51.5H32V66" stroke="white" strokeWidth="2"/>
                      <circle cx="12" cy="31" r="5" fill="#FDA112"/>
                      <circle cx="32" cy="11" r="5" fill="#FDA112" stroke="#00395F" strokeWidth="2.5" strokeLinecap="round"/>
                      <circle cx="32" cy="31" r="5" fill="#FDA112"/>
                      <circle cx="52" cy="31" r="5" fill="#FDA112"/>
                      <circle cx="52" cy="51" r="5" fill="#FDA112"/>
                      <circle cx="32" cy="51" r="5" fill="#FDA112" stroke="#00395F" strokeWidth="2.5" strokeLinecap="round"/>
                    </g>
                    <rect x="0.5" y="0.5" width="63" height="63" rx="7.5" stroke="#202020" strokeOpacity="0.04"/>
                    <defs>
                      <linearGradient id="feat3_l0" x1="2" y1="41.5" x2="34" y2="77" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FB811D"/><stop offset="1" stopColor="#FB811D" stopOpacity="0"/>
                      </linearGradient>
                      <clipPath id="feat3_clip"><rect width="64" height="64" rx="8" fill="white"/></clipPath>
                    </defs>
                  </svg>
                  <h3 className="text-xl leading-[1.15] font-bold tracking-[-0.01rem] text-[#202020]">
                    Detailed Breakdown
                  </h3>
                </div>
                <p className="text-base leading-[140%] text-[rgba(32,32,32,0.75)]">
                  See left vs right side comparisons, asymmetry detection, and severity scoring.
                </p>
              </div>

              <div className="platform-feature-card rounded-[10px] border border-[rgba(32,32,32,0.06)] p-6">
                <div className="mb-4 flex items-center gap-4">
                  <svg className="h-14 w-14 shrink-0" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#feat2_clip)">
                      <rect width="64" height="64" rx="8" fill="#ECF2FF"/>
                      <circle cx="-5" cy="106" r="95" fill="#CEDEFF"/>
                      <ellipse cx="-5.60938" cy="106" rx="65.5" ry="65" fill="#84A1FF"/>
                      <ellipse cx="-5.60938" cy="106" rx="65.5" ry="65" fill="url(#feat2_l0)" fillOpacity="0.55"/>
                      <path d="M5.81142 20C0.794922 27.5 6.43393 43.0611 19.8113 34.5C32.3118 26.5 20.8113 18 15.8117 27.5C12.7036 33.4059 11.8118 45.5 27.3118 49" stroke="#00395F" strokeWidth="2.5" strokeLinecap="round"/>
                      <path d="M48.4764 8.84643C50.43 6.16982 54.1835 5.58368 56.8601 7.53724C59.5367 9.49081 60.1229 13.2443 58.1693 15.9209L38.1249 43.384L28.4321 36.3096L48.4764 8.84643Z" fill="#4258FF"/>
                      <rect x="46.709" y="11.2695" width="12" height="3" transform="rotate(36.1244 46.709 11.2695)" fill="#ECF2FF"/>
                      <path d="M27.8438 37.1172L37.5366 44.1917L28.0839 50.1154C26.554 51.0741 24.6374 49.6752 25.084 47.9259L27.8438 37.1172Z" fill="white"/>
                    </g>
                    <rect x="0.5" y="0.5" width="63" height="63" rx="7.5" stroke="#202020" strokeOpacity="0.04"/>
                    <defs>
                      <linearGradient id="feat2_l0" x1="1.00001" y1="45.5" x2="30.5" y2="55.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#3A4EE2"/><stop offset="1" stopColor="#3A4EE2" stopOpacity="0"/>
                      </linearGradient>
                      <clipPath id="feat2_clip"><rect width="64" height="64" rx="8" fill="white"/></clipPath>
                    </defs>
                  </svg>
                  <h3 className="text-xl leading-[1.15] font-bold tracking-[-0.01rem] text-[#202020]">
                    Iterative Refinement
                  </h3>
                </div>
                <p className="text-base leading-[140%] text-[rgba(32,32,32,0.75)]">
                  Your feedback sharpens every analysis. The AI learns from your input to deliver increasingly accurate results over time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-14 text-center">
              <h2 className="h2-style text-[#202020]">
                How it <span className="text-gradient">works</span>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base leading-[140%] text-[rgba(32,32,32,0.75)]">
                Three simple steps to get started with RecoveryLab.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Upload",
                  description: "Record or upload a video of yourself walking. Our system accepts webcam recordings or file uploads.",
                },
                {
                  step: "02",
                  title: "AI Analysis",
                  description: "Our vision AI analyzes your movement patterns, detecting asymmetries, postural issues, and abnormalities.",
                },
                {
                  step: "03",
                  title: "Get Your Plan",
                  description: "Receive a personalized exercise program with step-by-step instructions tailored to your specific needs.",
                },
              ].map((item) => (
                <div key={item.step} className="platform-feature-card rounded-[10px] border border-[rgba(32,32,32,0.06)] p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-[1.054px] border-[#202020] bg-gradient-to-b from-[#515151] to-[#202020] shadow-[0_0_1.054px_3.163px_#494949_inset,0_6.325px_5.271px_0_rgba(0,0,0,0.55)_inset]">
                    <span className="text-sm font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="mb-2 text-xl leading-[1.15] font-bold tracking-[-0.01rem] text-[#202020]">
                    {item.title}
                  </h3>
                  <p className="text-base leading-[140%] text-[rgba(32,32,32,0.75)]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[16px] bg-[linear-gradient(180deg,#E0F5FF_0%,#F0FAFF_44.95%,#FFFFFF_100%)] border border-[rgba(32,32,32,0.06)] p-10 text-center sm:p-16">
              <h2 className="h2-style text-[#202020]">
                Ready to improve your <span className="text-gradient">movement</span>?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base leading-[140%] text-[rgba(32,32,32,0.75)]">
                Join RecoveryLab today and take the first step towards better
                movement health.
              </p>
              <div className="mt-8 flex justify-center">
                <Link href="/analyze">
                  <Button variant="modern-primary" size="modern-xl" className="gap-2 px-6">
                    Start Free Analysis
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

"use client";

import React from "react";
import { Upload, Eye, Dumbbell, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityType } from "@/lib/activity-types";

interface AnalysisLoadingProps {
  currentStep: "uploading" | "analyzing" | "coaching";
  activityType?: ActivityType;
  exerciseName?: string;
}

const ACTIVITY_ANALYZE_LABELS: Record<string, string> = {
  gait: "Analyzing movement patterns",
  stretching: "Analyzing stretching form",
  balance: "Analyzing balance & stability",
  strength: "Analyzing exercise form",
  range_of_motion: "Analyzing range of motion",
};

const ACTIVITY_HEADER_LABELS: Record<string, string> = {
  gait: "Analyzing your movement",
  stretching: "Analyzing your stretching",
  balance: "Analyzing your balance",
  strength: "Analyzing your form",
  range_of_motion: "Analyzing your range of motion",
};

function getStepStatus(
  stepId: string,
  currentStep: string
): "completed" | "active" | "pending" {
  const order = ["uploading", "analyzing", "coaching"];
  const currentIndex = order.indexOf(currentStep);
  const stepIndex = order.indexOf(stepId);

  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "active";
  return "pending";
}

export default function AnalysisLoading({ currentStep, activityType = "gait", exerciseName }: AnalysisLoadingProps) {
  const analyzeLabel = exerciseName
    ? `Analyzing ${exerciseName} form`
    : (ACTIVITY_ANALYZE_LABELS[activityType] || ACTIVITY_ANALYZE_LABELS.gait);
  const headerLabel = exerciseName
    ? `Analyzing your ${exerciseName} form`
    : (ACTIVITY_HEADER_LABELS[activityType] || ACTIVITY_HEADER_LABELS.gait);

  const steps = [
    { id: "uploading" as const, label: "Uploading video", icon: Upload },
    { id: "analyzing" as const, label: analyzeLabel, icon: Eye },
    { id: "coaching" as const, label: "Generating exercise plan", icon: Dumbbell },
  ];

  return (
    <div className="fade-in w-full">
      <div className="platform-feature-card rounded-[10px] border border-[rgba(32,32,32,0.06)] p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <svg width="200" height="90" viewBox="-5 -5 356 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <style>{`
                @keyframes streak-float-1 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
                @keyframes streak-float-2 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
                @keyframes streak-float-3 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
                @keyframes streak-pulse { 0%, 100% { opacity: 0.33; } 50% { opacity: 0.55; } }
                .streak-orb-1 { animation: streak-float-1 2.4s ease-in-out infinite; }
                .streak-orb-2 { animation: streak-float-2 2.4s ease-in-out 0.3s infinite; }
                .streak-orb-3 { animation: streak-float-3 2.4s ease-in-out 0.6s infinite; }
                .streak-rays { animation: streak-pulse 2.4s ease-in-out infinite; }
              `}</style>

              {/* Orb 1 */}
              <g className="streak-orb-1">
                <g filter="url(#f0)"><circle cx="59" cy="46" r="42" fill="#1DB3FB"/></g>
                <circle cx="59" cy="42" r="40.5" fill="url(#p0)" stroke="white" strokeWidth="3"/>
                <mask id="m0" style={{maskType:"alpha"}} maskUnits="userSpaceOnUse" x="20" y="3" width="78" height="78">
                  <circle cx="59" cy="42" r="39" fill="url(#p1)"/>
                </mask>
                <g mask="url(#m0)">
                  <g className="streak-rays">
                    <path d="M64.48 197H52.52l4-80.79h3.99L64.48 197Z" fill="#96DCFE"/>
                    <path d="M34.37 194.13l-11.38-3.7 28.76-75.6 3.79 1.23-21.17 78.07Z" fill="#96DCFE"/>
                    <path d="M6.62 182.09l-9.68-7.04L47.65 112.04l3.23 2.34L6.62 182.09Z" fill="#96DCFE"/>
                    <path d="M-16.05 162.06l-7.04-9.68 67.71-44.26 2.35 3.23-63.02 50.71Z" fill="#96DCFE"/>
                    <path d="M-31.43 136.01l-3.7-11.38 78.07-21.18 1.23 3.8-75.6 28.76Z" fill="#96DCFE"/>
                    <path d="M-38 106.48V94.52l80.79 3.99v3.99L-38 106.48Z" fill="#96DCFE"/>
                    <path d="M52.52 4h11.96l-3.99 80.79h-3.99L52.52 4Z" fill="#96DCFE"/>
                    <path d="M82.63 6.87l11.38 3.7-28.76 75.6-3.79-1.23L82.63 6.87Z" fill="#96DCFE"/>
                    <path d="M110.38 18.91l9.68 7.04-50.71 63.01-3.23-2.34 44.26-67.71Z" fill="#96DCFE"/>
                    <path d="M133.05 38.94l7.04 9.68-67.71 44.26-2.34-3.23 63.01-50.71Z" fill="#96DCFE"/>
                    <path d="M148.43 64.99l3.7 11.38-78.07 21.17-1.23-3.79 75.6-28.76Z" fill="#96DCFE"/>
                    <path d="M155 94.52v11.96l-80.79-3.99v-3.99L155 94.52Z" fill="#96DCFE"/>
                  </g>
                  <path d="M14.22 17C6.7 17-.03 20.49-4.5 25.97c-.79-.1-1.58-.14-2.39-.14C-17.99 25.82-27 35.04-27 46.41-27 57.78-18 67-6.89 67c.46 0 .93-.02 1.38-.05V67h47.02v-.08C47.97 66.19 53 60.58 53 53.76c0-7.3-5.79-13.24-12.93-13.24-.5 0-.99.03-1.47.09C37.9 27.45 27.25 17 14.22 17Z" fill="white"/>
                  <path d="M93.39 16c3.76 0 7.13 1.67 9.36 4.3.4-.04.8-.07 1.2-.07 5.55 0 10.05 4.42 10.05 9.88s-4.5 9.88-10.05 9.88h-.69v.03H79.75V39.96c-3.23-.35-5.75-3.04-5.75-6.31 0-3.51 2.89-6.35 6.46-6.35.25 0 .5.01.74.04C81.55 21.02 86.87 16 93.39 16Z" fill="#E6F6FF"/>
                </g>
              </g>

              {/* Orb 2 */}
              <g className="streak-orb-2">
                <g filter="url(#f3)"><circle cx="170" cy="46" r="42" fill="#1DB3FB"/></g>
                <circle cx="170" cy="42" r="40.5" fill="url(#p2)" stroke="white" strokeWidth="3"/>
                <mask id="m1" style={{maskType:"alpha"}} maskUnits="userSpaceOnUse" x="131" y="3" width="78" height="78">
                  <circle cx="170" cy="42" r="39" fill="url(#p3)"/>
                </mask>
                <g mask="url(#m1)">
                  <g className="streak-rays">
                    <path d="M175.48 197h-11.96l4-80.79h3.99l3.97 80.79Z" fill="#96DCFE"/>
                    <path d="M145.37 194.13l-11.38-3.7 28.76-75.6 3.79 1.23-21.17 78.07Z" fill="#96DCFE"/>
                    <path d="M117.62 182.09l-9.68-7.04 50.71-63.01 3.23 2.34-44.26 67.71Z" fill="#96DCFE"/>
                    <path d="M94.95 162.06l-7.04-9.68 67.71-44.26 2.35 3.23-63.02 50.71Z" fill="#96DCFE"/>
                    <path d="M79.57 136.01l-3.7-11.38 78.07-21.18 1.23 3.8-75.6 28.76Z" fill="#96DCFE"/>
                    <path d="M73 106.48V94.52l80.79 3.99v3.99L73 106.48Z" fill="#96DCFE"/>
                    <path d="M163.52 4h11.97l-4 80.79h-3.99L163.52 4Z" fill="#96DCFE"/>
                    <path d="M193.63 6.87l11.38 3.7-28.76 75.6-3.79-1.23 21.17-78.07Z" fill="#96DCFE"/>
                    <path d="M221.38 18.91l9.68 7.04-50.71 63.01-3.23-2.34 44.26-67.71Z" fill="#96DCFE"/>
                    <path d="M244.05 38.94l7.04 9.68-67.71 44.26-2.34-3.23 63.01-50.71Z" fill="#96DCFE"/>
                    <path d="M259.43 64.99l3.7 11.38-78.07 21.17-1.23-3.79 75.6-28.76Z" fill="#96DCFE"/>
                    <path d="M266 94.52v11.96l-80.79-3.99v-3.99L266 94.52Z" fill="#96DCFE"/>
                  </g>
                  <path d="M157.22 17c-7.52 0-14.25 3.49-18.73 8.97-.78-.1-1.58-.14-2.39-.14-11.1 0-20.1 9.22-20.1 20.59S125 67 136.11 67c.46 0 .93-.02 1.38-.05V67h47.01v-.08c6.47-.73 11.5-6.34 11.5-13.15 0-7.31-5.79-13.24-12.93-13.24-.5 0-.99.03-1.47.09C180.9 27.45 170.25 17 157.22 17Z" fill="white"/>
                  <path d="M196.39 16c3.76 0 7.13 1.67 9.36 4.3.39-.04.8-.07 1.2-.07 5.55 0 10.05 4.42 10.05 9.88s-4.5 9.88-10.05 9.88h-.69v.03h-23.51v-.04c-3.23-.35-5.75-3.04-5.75-6.31 0-3.51 2.89-6.35 6.46-6.35.25 0 .5.01.74.04.35-6.32 5.67-11.34 12.19-11.34Z" fill="#E6F6FF"/>
                </g>
              </g>

              {/* Orb 3 */}
              <g className="streak-orb-3">
                <g filter="url(#f6)"><circle cx="287" cy="46" r="42" fill="#1DB3FB"/></g>
                <circle cx="287" cy="42" r="40.5" fill="url(#p4)" stroke="white" strokeWidth="3"/>
                <mask id="m2" style={{maskType:"alpha"}} maskUnits="userSpaceOnUse" x="248" y="3" width="78" height="78">
                  <circle cx="287" cy="42" r="39" fill="url(#p5)"/>
                </mask>
                <g mask="url(#m2)">
                  <g className="streak-rays">
                    <path d="M292.48 197h-11.96l4-80.79h3.99l3.97 80.79Z" fill="#96DCFE"/>
                    <path d="M262.37 194.13l-11.38-3.7 28.76-75.6 3.79 1.23-21.17 78.07Z" fill="#96DCFE"/>
                    <path d="M234.62 182.09l-9.68-7.04 50.71-63.01 3.23 2.34-44.26 67.71Z" fill="#96DCFE"/>
                    <path d="M211.95 162.06l-7.04-9.68 67.71-44.26 2.35 3.23-63.02 50.71Z" fill="#96DCFE"/>
                    <path d="M196.57 136.01l-3.7-11.38 78.07-21.18 1.24 3.8-75.61 28.76Z" fill="#96DCFE"/>
                    <path d="M190 106.48V94.52l80.79 3.99v3.99L190 106.48Z" fill="#96DCFE"/>
                    <path d="M280.52 4h11.97l-4 80.79h-3.99L280.52 4Z" fill="#96DCFE"/>
                    <path d="M310.63 6.87l11.38 3.7-28.76 75.6-3.79-1.23 21.17-78.07Z" fill="#96DCFE"/>
                    <path d="M338.38 18.91l9.68 7.04-50.71 63.01-3.23-2.34 44.26-67.71Z" fill="#96DCFE"/>
                    <path d="M361.05 38.94l7.04 9.68-67.71 44.26-2.34-3.23 63.01-50.71Z" fill="#96DCFE"/>
                    <path d="M376.43 64.99l3.7 11.38-78.07 21.17-1.24-3.79 75.61-28.76Z" fill="#96DCFE"/>
                    <path d="M383 94.52v11.96l-80.79-3.99v-3.99L383 94.52Z" fill="#96DCFE"/>
                  </g>
                  <path d="M314.22 17c-7.52 0-14.25 3.49-18.73 8.97-.78-.1-1.58-.14-2.39-.14-11.1 0-20.1 9.22-20.1 20.59S282 67 293.11 67c.46 0 .93-.02 1.38-.05V67h47.01v-.08c6.47-.73 11.5-6.34 11.5-13.15 0-7.31-5.79-13.24-12.93-13.24-.5 0-.99.03-1.47.09C337.9 27.45 327.25 17 314.22 17Z" fill="white"/>
                  <path d="M249.39 16c3.76 0 7.13 1.67 9.36 4.3.39-.04.8-.07 1.2-.07 5.55 0 10.05 4.42 10.05 9.88s-4.5 9.88-10.05 9.88h-.69v.03h-23.51v-.04c-3.23-.35-5.75-3.04-5.75-6.31 0-3.51 2.89-6.35 6.46-6.35.25 0 .5.01.74.04.35-6.32 5.67-11.34 12.19-11.34Z" fill="#E6F6FF"/>
                </g>
              </g>

              <defs>
                <filter id="f0" x="0" y="1" width="118" height="146" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="bg"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha"/>
                  <feOffset dy="3"/><feGaussianBlur stdDeviation="3"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/><feBlend in2="bg" result="s1"/>
                  <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha2"/>
                  <feOffset dy="10"/><feGaussianBlur stdDeviation="5"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0"/><feBlend in2="s1" result="s2"/>
                  <feBlend in="SourceGraphic" in2="s2" result="shape"/>
                  <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha3"/>
                  <feOffset dy="2"/><feComposite in2="ha3" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.19 0"/><feBlend in2="shape"/>
                </filter>
                <filter id="f3" x="111" y="1" width="118" height="146" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="bg"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha"/>
                  <feOffset dy="3"/><feGaussianBlur stdDeviation="3"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/><feBlend in2="bg" result="s1"/>
                  <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha2"/>
                  <feOffset dy="10"/><feGaussianBlur stdDeviation="5"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0"/><feBlend in2="s1" result="s2"/>
                  <feBlend in="SourceGraphic" in2="s2" result="shape"/>
                  <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha3"/>
                  <feOffset dy="2"/><feComposite in2="ha3" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.19 0"/><feBlend in2="shape"/>
                </filter>
                <filter id="f6" x="228" y="1" width="118" height="146" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="bg"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha"/>
                  <feOffset dy="3"/><feGaussianBlur stdDeviation="3"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/><feBlend in2="bg" result="s1"/>
                  <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha2"/>
                  <feOffset dy="10"/><feGaussianBlur stdDeviation="5"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0"/><feBlend in2="s1" result="s2"/>
                  <feBlend in="SourceGraphic" in2="s2" result="shape"/>
                  <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha3"/>
                  <feOffset dy="2"/><feComposite in2="ha3" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.19 0"/><feBlend in2="shape"/>
                </filter>
                <linearGradient id="p0" x1="59" y1="0" x2="59" y2="84" gradientUnits="userSpaceOnUse"><stop stopColor="#A6DCFF"/><stop offset="1" stopColor="#D9F1FF"/></linearGradient>
                <linearGradient id="p1" x1="59" y1="3" x2="59" y2="81" gradientUnits="userSpaceOnUse"><stop stopColor="#A6DCFF"/><stop offset="1" stopColor="#D9F1FF"/></linearGradient>
                <linearGradient id="p2" x1="170" y1="0" x2="170" y2="84" gradientUnits="userSpaceOnUse"><stop stopColor="#A6DCFF"/><stop offset="1" stopColor="#D9F1FF"/></linearGradient>
                <linearGradient id="p3" x1="170" y1="3" x2="170" y2="81" gradientUnits="userSpaceOnUse"><stop stopColor="#A6DCFF"/><stop offset="1" stopColor="#D9F1FF"/></linearGradient>
                <linearGradient id="p4" x1="287" y1="0" x2="287" y2="84" gradientUnits="userSpaceOnUse"><stop stopColor="#A6DCFF"/><stop offset="1" stopColor="#D9F1FF"/></linearGradient>
                <linearGradient id="p5" x1="287" y1="3" x2="287" y2="81" gradientUnits="userSpaceOnUse"><stop stopColor="#A6DCFF"/><stop offset="1" stopColor="#D9F1FF"/></linearGradient>
              </defs>
            </svg>
          </div>
          <p className="text-lg font-semibold text-[#202020]">
            {headerLabel}
          </p>
          <p className="mt-1 text-sm text-[rgba(32,32,32,0.5)]">
            This may take a moment
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mx-auto max-w-sm space-y-3">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id, currentStep);
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-[54px] left-[35px] h-3 w-[2px] transition-colors duration-500",
                      status === "completed"
                        ? "bg-[#1DB3FB]"
                        : "bg-[rgba(32,32,32,0.08)]"
                    )}
                  />
                )}

                <div
                  className={cn(
                    "flex items-center gap-4 rounded-lg px-4 py-3 transition-all duration-500",
                    status === "active" &&
                      "bg-[rgba(29,179,251,0.04)]"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-500",
                      status === "completed" &&
                        "bg-gradient-to-r from-[#1DB3FB] to-[#00A7EF]",
                      status === "active" &&
                        "bg-gradient-to-b from-[#E0F5FF] to-white",
                      status === "pending" &&
                        "bg-[rgba(32,32,32,0.04)]"
                    )}
                  >
                    {status === "completed" ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <StepIcon
                        className={cn(
                          "h-4 w-4 transition-colors duration-500",
                          status === "active"
                            ? "text-[#1DB3FB]"
                            : "text-[rgba(32,32,32,0.3)]"
                        )}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors duration-500",
                      status === "completed" && "text-[#1DB3FB]",
                      status === "active" && "text-[#202020]",
                      status === "pending" && "text-[rgba(32,32,32,0.35)]"
                    )}
                  >
                    {step.label}
                    {status === "active" && (
                      <span className="ml-1 inline-flex">
                        <span className="animate-pulse">...</span>
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mx-auto mt-8 max-w-sm">
          <div className="h-1 w-full overflow-hidden rounded-full bg-[rgba(32,32,32,0.06)]">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r from-[#1DB3FB] to-[#00A7EF] transition-all duration-700 ease-out"
              )}
              style={{
                width:
                  currentStep === "uploading"
                    ? "20%"
                    : currentStep === "analyzing"
                      ? "55%"
                      : "85%",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

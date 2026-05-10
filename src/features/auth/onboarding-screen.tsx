"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { onboardingSteps } from "@/shared/lib/constants";
import { sessionStorageService } from "@/shared/lib/storage";
import { trackEvent } from "@/shared/analytics/tracker";
import type { CSSProperties } from "react";

const FIGURE_LAYOUT: Array<{
  size: string;
  top: string;
  right: string;
  copyBottom: string;
  copyMax: string;
  titleSize: string;
  titleCompactSize: string;
}> = [
  {
    size: "clamp(190px, 50vw, 252px)",
    top: "74px",
    right: "-8px",
    copyBottom: "198px",
    copyMax: "min(86vw, 348px)",
    titleSize: "clamp(2.22rem, 7.3vw, 3rem)",
    titleCompactSize: "clamp(2rem, 6.5vw, 2.72rem)"
  },
  {
    size: "clamp(208px, 56vw, 278px)",
    top: "146px",
    right: "-18px",
    copyBottom: "172px",
    copyMax: "min(86vw, 352px)",
    titleSize: "clamp(2.18rem, 7.1vw, 2.95rem)",
    titleCompactSize: "clamp(1.98rem, 6.2vw, 2.65rem)"
  },
  {
    size: "clamp(180px, 49vw, 242px)",
    top: "92px",
    right: "18px",
    copyBottom: "184px",
    copyMax: "min(84vw, 344px)",
    titleSize: "clamp(2.18rem, 7.1vw, 2.95rem)",
    titleCompactSize: "clamp(1.98rem, 6.2vw, 2.65rem)"
  },
  {
    size: "clamp(214px, 58vw, 286px)",
    top: "102px",
    right: "-8px",
    copyBottom: "168px",
    copyMax: "min(86vw, 356px)",
    titleSize: "clamp(2.18rem, 7.1vw, 3rem)",
    titleCompactSize: "clamp(2rem, 6.3vw, 2.72rem)"
  }
];

export function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const step = onboardingSteps[index];
  const isLast = index === onboardingSteps.length - 1;
  const figureLayout = FIGURE_LAYOUT[index] ?? FIGURE_LAYOUT[0];
  const figureStyle = {
    "--figure-size": figureLayout.size,
    "--figure-top": figureLayout.top,
    "--figure-right": figureLayout.right,
    "--copy-bottom": figureLayout.copyBottom,
    "--copy-max": figureLayout.copyMax,
    "--title-size-mobile": figureLayout.titleSize,
    "--title-size-compact-mobile": figureLayout.titleCompactSize
  } as CSSProperties;

  const finish = () => {
    sessionStorageService.setOnboardingCompleted(true);
    void trackEvent("onboarding_completed");
    router.push("/feed");
  };

  return (
    <main className="page">
      <div className="content-width onboarding-shell">
        <Image src={step.image} alt="" width={320} height={320} className="onboarding-figure" style={figureStyle} />
        <div className="onboarding-copy">
          <h1 className={`miama onboarding-title${step.description ? " onboarding-title-compact" : ""}`}>{step.title}</h1>
          {step.description ? <p className="onboarding-text">{step.description}</p> : null}
        </div>

        <div className="onboarding-footer">
          <div className="onboarding-footer-inner">
            <div className="onboarding-actions">
              {!isLast ? (
                <button className="secondary-button onboarding-skip" onClick={finish}>
                  пропустить
                </button>
              ) : (
                <span />
              )}
              {!isLast ? (
                <div className="onboarding-nav">
                  {index > 0 ? (
                    <button className="round-button" onClick={() => setIndex((prev) => prev - 1)}>
                      ←
                    </button>
                  ) : null}
                  <button className="round-button" onClick={() => setIndex((prev) => Math.min(prev + 1, onboardingSteps.length - 1))}>
                    →
                  </button>
                </div>
              ) : (
                <button className="primary-button" onClick={finish}>
                  в приложение
                </button>
              )}
            </div>
            <div className="onboarding-dots">
              {onboardingSteps.map((_, dotIndex) => (
                <span
                  key={dotIndex}
                  className="onboarding-dot"
                  style={{ background: dotIndex === index ? "var(--app-primary)" : "var(--app-secondary)" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

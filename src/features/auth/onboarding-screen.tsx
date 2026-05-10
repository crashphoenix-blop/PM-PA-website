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
    size: "clamp(280px, 74vw, 620px)",
    top: "clamp(48px, 6.8vh, 94px)",
    right: "clamp(-38px, -9vw, -6px)",
    copyBottom: "clamp(340px, 43vh, 520px)",
    copyMax: "min(90vw, 760px)",
    titleSize: "clamp(2.95rem, 9.2vw, 4.9rem)",
    titleCompactSize: "clamp(2.65rem, 7.6vw, 4.1rem)"
  },
  {
    size: "clamp(290px, 77vw, 640px)",
    top: "clamp(106px, 13vh, 204px)",
    right: "clamp(-44px, -10vw, -10px)",
    copyBottom: "clamp(300px, 37vh, 450px)",
    copyMax: "min(92vw, 780px)",
    titleSize: "clamp(2.75rem, 8.8vw, 4.5rem)",
    titleCompactSize: "clamp(2.45rem, 7.2vw, 3.8rem)"
  },
  {
    size: "clamp(250px, 68vw, 560px)",
    top: "clamp(66px, 8.8vh, 126px)",
    right: "clamp(-12px, -2vw, 20px)",
    copyBottom: "clamp(292px, 36vh, 430px)",
    copyMax: "min(90vw, 740px)",
    titleSize: "clamp(2.75rem, 8.4vw, 4.5rem)",
    titleCompactSize: "clamp(2.4rem, 6.9vw, 3.7rem)"
  },
  {
    size: "clamp(300px, 79vw, 650px)",
    top: "clamp(74px, 10.2vh, 146px)",
    right: "clamp(-30px, -7vw, 6px)",
    copyBottom: "clamp(284px, 35vh, 420px)",
    copyMax: "min(92vw, 780px)",
    titleSize: "clamp(2.75rem, 8.6vw, 4.6rem)",
    titleCompactSize: "clamp(2.5rem, 7.3vw, 3.9rem)"
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

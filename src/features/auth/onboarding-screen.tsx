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
    size: "clamp(210px, 58vw, 290px)",
    top: "64px",
    right: "-18px",
    copyBottom: "284px",
    copyMax: "min(78vw, 338px)",
    titleSize: "clamp(2.45rem, 8vw, 3.45rem)",
    titleCompactSize: "clamp(2.2rem, 7vw, 3rem)"
  },
  {
    size: "clamp(230px, 62vw, 320px)",
    top: "112px",
    right: "-26px",
    copyBottom: "248px",
    copyMax: "min(79vw, 346px)",
    titleSize: "clamp(2.35rem, 7.4vw, 3.2rem)",
    titleCompactSize: "clamp(2.08rem, 6.7vw, 2.85rem)"
  },
  {
    size: "clamp(205px, 56vw, 286px)",
    top: "76px",
    right: "2px",
    copyBottom: "258px",
    copyMax: "min(78vw, 338px)",
    titleSize: "clamp(2.35rem, 7.5vw, 3.2rem)",
    titleCompactSize: "clamp(2.08rem, 6.7vw, 2.85rem)"
  },
  {
    size: "clamp(238px, 64vw, 332px)",
    top: "84px",
    right: "-22px",
    copyBottom: "244px",
    copyMax: "min(79vw, 350px)",
    titleSize: "clamp(2.35rem, 7.5vw, 3.2rem)",
    titleCompactSize: "clamp(2.1rem, 6.8vw, 2.9rem)"
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

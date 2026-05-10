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
}> = [
  { size: "clamp(250px, 66vw, 520px)", top: "clamp(44px, 6vh, 86px)", right: "clamp(-34px, -7vw, -2px)" },
  { size: "clamp(270px, 70vw, 560px)", top: "clamp(102px, 12vh, 188px)", right: "clamp(-34px, -8vw, -4px)" },
  { size: "clamp(235px, 62vw, 500px)", top: "clamp(60px, 8vh, 112px)", right: "clamp(-8px, -2vw, 22px)" },
  { size: "clamp(270px, 72vw, 570px)", top: "clamp(66px, 9vh, 132px)", right: "clamp(-28px, -6vw, 6px)" }
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
    "--figure-right": figureLayout.right
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

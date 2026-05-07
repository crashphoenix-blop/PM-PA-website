"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onboardingSteps } from "@/shared/lib/constants";
import { sessionStorageService } from "@/shared/lib/storage";
import { trackEvent } from "@/shared/analytics/tracker";

export function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const step = onboardingSteps[index];
  const isLast = index === onboardingSteps.length - 1;

  const titleSize = useMemo(() => (step.description ? 32 : 38), [step.description]);

  const finish = () => {
    sessionStorageService.setOnboardingCompleted(true);
    void trackEvent("onboarding_completed");
    router.push("/feed");
  };

  return (
    <main className="page">
      <div className="content-width" style={{ minHeight: "100dvh", position: "relative" }}>
        <Image
          src={step.image}
          alt=""
          width={120}
          height={120}
          style={{
            position: "absolute",
            right: -20,
            top: 100,
            width: "min(45vw, 160px)",
            opacity: 0.5
          }}
        />
        <div style={{ paddingTop: 110, maxWidth: 520 }}>
          <h1 className="miama" style={{ fontSize: titleSize, lineHeight: 1, color: "var(--app-primary)" }}>
            {step.title}
          </h1>
          {step.description ? (
            <p style={{ fontSize: 18, color: "var(--app-primary)", marginTop: 5 }}>{step.description}</p>
          ) : null}
        </div>

        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 24,
            display: "flex",
            justifyContent: "center"
          }}
        >
          <div style={{ width: "min(100%, 980px)", padding: "0 25px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              {!isLast ? (
                <button className="secondary-button" onClick={finish}>
                  пропустить
                </button>
              ) : (
                <span />
              )}
              {!isLast ? (
                <div style={{ display: "flex", gap: 12 }}>
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
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 18 }}>
              {onboardingSteps.map((_, dotIndex) => (
                <span
                  key={dotIndex}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    display: "inline-block",
                    background: dotIndex === index ? "var(--app-primary)" : "var(--app-secondary)"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

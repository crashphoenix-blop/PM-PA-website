"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { onboardingSteps } from "@/shared/lib/constants";
import { sessionStorageService } from "@/shared/lib/storage";
import { trackEvent } from "@/shared/analytics/tracker";

const DESIGN_WIDTH = 430;
const scale = (n: number) => `min(${n}px, calc(${n} / ${DESIGN_WIDTH} * 100vw))`;

type Controls = "first" | "middle" | "last" | "celebration";

type StepLayout = {
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
  imageTop: number;
  imageRight: number;
  imageOpacity: number;
  titleSize: number;
  descriptionSize: number;
  copyBottom: number;
  copyLeft: number;
  copyRight: number;
  controls: Controls;
};

const LAYOUTS: StepLayout[] = [
  {
    imageSrc: "/assets/wewewe.svg",
    imageWidth: 294,
    imageHeight: 363,
    imageTop: 137,
    imageRight: 0,
    imageOpacity: 0.6,
    titleSize: 36,
    descriptionSize: 0,
    copyBottom: 219,
    copyLeft: 33,
    copyRight: 33,
    controls: "first"
  },
  {
    imageSrc: "/assets/star4.svg",
    imageWidth: 344,
    imageHeight: 510,
    imageTop: 84,
    imageRight: 0,
    imageOpacity: 0.65,
    titleSize: 36,
    descriptionSize: 18,
    copyBottom: 178,
    copyLeft: 33,
    copyRight: 33,
    controls: "middle"
  },
  {
    imageSrc: "/assets/tree.svg",
    imageWidth: 289,
    imageHeight: 498,
    imageTop: 87,
    imageRight: 0,
    imageOpacity: 0.65,
    titleSize: 36,
    descriptionSize: 18,
    copyBottom: 223,
    copyLeft: 33,
    copyRight: 33,
    controls: "middle"
  },
  {
    imageSrc: "/assets/ellipse.svg",
    imageWidth: 328,
    imageHeight: 496,
    imageTop: 84,
    imageRight: 0,
    imageOpacity: 0.65,
    titleSize: 36,
    descriptionSize: 18,
    copyBottom: 130,
    copyLeft: 33,
    copyRight: 33,
    controls: "last"
  },
  {
    imageSrc: "/assets/star.svg",
    imageWidth: 88,
    imageHeight: 220,
    imageTop: 104,
    imageRight: 63,
    imageOpacity: 1,
    titleSize: 96,
    descriptionSize: 21,
    copyBottom: 73,
    copyLeft: 42,
    copyRight: 63,
    controls: "celebration"
  }
];

export function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const step = onboardingSteps[index];
  const layout = LAYOUTS[index] ?? LAYOUTS[0];

  const finish = () => {
    sessionStorageService.setOnboardingCompleted(true);
    void trackEvent("onboarding_completed");
    router.push("/feed");
  };

  useEffect(() => {
    if (layout.controls !== "celebration") return;
    const timer = window.setTimeout(finish, 2500);
    return () => window.clearTimeout(timer);
  }, [layout.controls]);

  const figureStyle: CSSProperties = {
    position: "absolute",
    top: scale(layout.imageTop),
    right: scale(layout.imageRight),
    width: scale(layout.imageWidth),
    height: scale(layout.imageHeight),
    opacity: layout.imageOpacity,
    pointerEvents: "none"
  };

  const copyStyle: CSSProperties = {
    position: "absolute",
    bottom: scale(layout.copyBottom),
    left: scale(layout.copyLeft),
    right: scale(layout.copyRight)
  };

  const titleStyle: CSSProperties = {
    fontSize: scale(layout.titleSize),
    lineHeight: 1.02,
    color: "var(--app-primary)",
    margin: 0,
    marginBottom: layout.descriptionSize > 0 ? scale(layout.controls === "celebration" ? 24 : 12) : 0
  };

  const descStyle: CSSProperties = {
    fontSize: scale(layout.descriptionSize),
    lineHeight: 1.32,
    color: layout.controls === "celebration" ? "var(--app-text-main)" : "var(--app-primary)",
    margin: 0,
    whiteSpace: "pre-line"
  };

  const renderFigure = () => {
    if (layout.controls === "celebration") {
      return (
        <div style={figureStyle}>
          <Image
            src="/assets/star_brown.svg"
            alt=""
            width={88}
            height={100}
            style={{ display: "block", width: "100%", height: "auto" }}
          />
          <Image
            src="/assets/star.svg"
            alt=""
            width={88}
            height={100}
            style={{ display: "block", width: "100%", height: "auto", marginTop: scale(20) }}
          />
        </div>
      );
    }
    return (
      <Image
        src={layout.imageSrc}
        alt=""
        width={layout.imageWidth}
        height={layout.imageHeight}
        style={figureStyle}
      />
    );
  };

  const renderControls = () => {
    if (layout.controls === "celebration") return null;

    if (layout.controls === "last") {
      return (
        <div className="onboarding-footer">
          <div className="onboarding-footer-inner" style={{ display: "flex", justifyContent: "center" }}>
            <button
              className="primary-button"
              onClick={finish}
              style={{ minWidth: scale(216) }}
            >
              в приложение
            </button>
          </div>
        </div>
      );
    }

    const showBack = layout.controls === "middle";
    return (
      <div className="onboarding-footer">
        <div className="onboarding-footer-inner">
          <div className="onboarding-actions">
            <button className="secondary-button onboarding-skip" onClick={finish}>
              пропустить
            </button>
            <div className="onboarding-nav">
              {showBack ? (
                <button
                  className="round-button"
                  onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}
                  aria-label="Назад"
                >
                  ←
                </button>
              ) : null}
              <button
                className="round-button"
                onClick={() =>
                  setIndex((prev) => Math.min(prev + 1, onboardingSteps.length - 1))
                }
                aria-label="Далее"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="page">
      <div className="content-width onboarding-shell">
        {renderFigure()}
        <div style={copyStyle}>
          <h1 className="miama" style={titleStyle}>
            {step.title}
          </h1>
          {step.description ? <p style={descStyle}>{step.description}</p> : null}
        </div>
        {renderControls()}
      </div>
    </main>
  );
}

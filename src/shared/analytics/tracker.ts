"use client";

import { apiClient } from "@/shared/api/client";

const ANALYTICS_ANON_KEY = "surprise_analytics_anonymous_id";
const ANALYTICS_SESSION_KEY = "surprise_analytics_session_id";

const getOrCreateId = (key: string): string => {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const next = crypto.randomUUID();
  window.localStorage.setItem(key, next);
  return next;
};

const getAnonymousId = (): string => getOrCreateId(ANALYTICS_ANON_KEY);
export const getAnalyticsSessionId = (): string => getOrCreateId(ANALYTICS_SESSION_KEY);

type EventParams = Record<string, unknown>;

export const trackEvent = async (eventName: string, params: EventParams = {}): Promise<void> => {
  if (typeof window === "undefined") return;

  const yandexMetrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  const path = window.location.pathname;
  const payload = {
    event_name: eventName,
    event_time: new Date().toISOString(),
    anonymous_id: getAnonymousId(),
    session_id: getAnalyticsSessionId(),
    path,
    payload: params,
    ...(typeof params.gift_id === "number" ? { gift_id: params.gift_id } : {}),
    ...(typeof params.surface === "string" ? { surface: params.surface } : {}),
    ...(typeof params.action === "string" ? { action: params.action } : {}),
    ...(typeof params.duration_seconds === "number" ? { duration_seconds: params.duration_seconds } : {})
  };

  if (typeof window !== "undefined" && typeof window.ym === "function" && yandexMetrikaId) {
    window.ym(Number(yandexMetrikaId), "reachGoal", eventName, params);
  }

  try {
    await apiClient.trackAnalyticsEvent(payload);
  } catch {
    // Analytics should never break product flow.
  }
};

declare global {
  interface Window {
    ym?: (counterId: number, action: string, target: string, params?: EventParams) => void;
  }
}

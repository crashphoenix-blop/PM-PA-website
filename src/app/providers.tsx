"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/features/auth/auth-context";
import { getAnalyticsSessionId, trackEvent } from "@/shared/analytics/tracker";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1
          }
        }
      })
  );

  useEffect(() => {
    const startedAt = Date.now();
    const sessionId = getAnalyticsSessionId();
    void trackEvent("site_open", { session_id: sessionId });
    void trackEvent("session_start", { session_id: sessionId });

    const handleUnload = () => {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      void trackEvent("session_end", { session_id: sessionId, duration_seconds: durationSeconds });
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      handleUnload();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

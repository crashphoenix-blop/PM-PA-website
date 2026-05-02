"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { sessionStorageService } from "@/shared/lib/storage";

export function RequireAuthRoutes({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated, isGuest } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (isAuthenticated || isGuest) {
      if (sessionStorageService.isOnboardingCompleted()) {
        router.replace("/feed");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [isAuthenticated, isGuest, isReady, router]);

  if (!isReady) return <>{children}</>;
  if (isAuthenticated || isGuest) return null;
  return <>{children}</>;
}

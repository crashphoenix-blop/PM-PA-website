"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { sessionStorageService } from "@/shared/lib/storage";

export function RequireAuthRoutes({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (isAuthenticated) {
      if (sessionStorageService.isOnboardingCompleted()) {
        router.replace("/feed");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [isAuthenticated, isReady, router]);

  if (!isReady) return <>{children}</>;
  if (isAuthenticated) return null;
  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { sessionStorageService } from "@/shared/lib/storage";

export function RequireAppAccess({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated, isGuest } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated && !isGuest) {
      router.replace("/welcome");
      return;
    }
    if (!sessionStorageService.isOnboardingCompleted()) {
      router.replace("/onboarding");
    }
  }, [isAuthenticated, isGuest, isReady, router]);

  if (!isReady) {
    return <main className="page">Загрузка...</main>;
  }

  if (!isAuthenticated && !isGuest) {
    return null;
  }

  return <>{children}</>;
}

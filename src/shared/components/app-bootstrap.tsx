"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { sessionStorageService } from "@/shared/lib/storage";

export function AppBootstrap() {
  const router = useRouter();
  const { isReady, isAuthenticated, isGuest } = useAuth();

  useEffect(() => {
    if (!isReady) return;

    if (isAuthenticated || isGuest) {
      if (sessionStorageService.isOnboardingCompleted()) {
        router.replace("/feed");
      } else {
        router.replace("/onboarding");
      }
      return;
    }
    router.replace("/welcome");
  }, [isAuthenticated, isGuest, isReady, router]);

  return (
    <main className="page">
      <div className="content-width">Загрузка...</div>
    </main>
  );
}

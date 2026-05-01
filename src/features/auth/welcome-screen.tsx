"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";

export function WelcomeScreen() {
  const router = useRouter();
  const { startGuest } = useAuth();

  return (
    <main className="page">
      <div className="content-width" style={{ textAlign: "center", paddingTop: 40 }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Image src="/assets/star.svg" alt="" width={100} height={100} style={{ opacity: 0.4 }} />
        </div>
        <h1 className="miama" style={{ color: "var(--app-primary)", fontSize: 43, marginTop: 80 }}>
          Приветствуем!
        </h1>
        <div style={{ display: "grid", gap: 16, justifyContent: "center", marginTop: 100 }}>
          <button className="primary-button" onClick={() => router.push("/login")}>
            вход
          </button>
          <button className="primary-button" onClick={() => router.push("/register")}>
            регистрация
          </button>
          <button
            className="primary-button"
            onClick={() => {
              startGuest();
              router.push("/onboarding");
            }}
          >
            пропустить
          </button>
        </div>
      </div>
    </main>
  );
}

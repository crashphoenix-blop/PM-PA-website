"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { validateEmailOrPhone, validatePassword } from "@/shared/lib/validation";

export function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const idError = validateEmailOrPhone(emailOrPhone);
    if (idError) {
      setError(idError);
      return;
    }
    const passError = validatePassword(password);
    if (passError) {
      setError(passError);
      return;
    }

    setSubmitting(true);
    try {
      await login(emailOrPhone.trim(), password);
      router.push("/feed");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось выполнить вход");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page">
      <div className="content-width" style={{ maxWidth: 560 }}>
        <h1 style={{ textAlign: "center", marginTop: 64, color: "var(--app-primary)" }}>ВХОД</h1>
        <form onSubmit={onSubmit} style={{ marginTop: 34 }}>
          <label className="field-label" htmlFor="identity">
            почта/номер телефона
          </label>
          <input
            id="identity"
            className="field-input"
            value={emailOrPhone}
            onChange={(event) => setEmailOrPhone(event.target.value)}
          />

          <label className="field-label" htmlFor="password" style={{ marginTop: 16 }}>
            пароль
          </label>
          <input
            id="password"
            type="password"
            className="field-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error ? <p style={{ color: "crimson", marginTop: 12 }}>{error}</p> : null}

          <div style={{ display: "grid", gap: 16, justifyContent: "center", marginTop: 28 }}>
            <button type="submit" className="primary-button" disabled={submitting}>
              вход
            </button>
            <button type="button" className="primary-button" onClick={() => router.push("/register")}>
              нет аккаунта
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

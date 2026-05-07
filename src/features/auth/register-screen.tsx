"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import {
  validateEmailOrPhone,
  validateName,
  validatePassword
} from "@/shared/lib/validation";

export function RegisterScreen() {
  const router = useRouter();
  const { register, startGuest } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const nameError = validateName(name);
    const identityError = validateEmailOrPhone(emailOrPhone);
    const passwordError = validatePassword(password);
    const firstError = nameError ?? identityError ?? passwordError;
    if (firstError) {
      setError(firstError);
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        emailOrPhone: emailOrPhone.trim(),
        password
      });
      router.push("/success");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось завершить регистрацию");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page">
      <div className="content-width" style={{ maxWidth: 560 }}>
        <button
          type="button"
          onClick={() => router.push("/welcome")}
          style={{ border: 0, background: "transparent", marginTop: 12, cursor: "pointer" }}
          aria-label="Назад"
        >
          <Image src="/assets/back_icon.svg" alt="" width={40} height={40} />
        </button>
        <h1 style={{ textAlign: "center", marginTop: 8, color: "var(--app-primary)" }}>РЕГИСТРАЦИЯ</h1>
        <form onSubmit={onSubmit} style={{ marginTop: 30 }}>
          <label className="field-label" htmlFor="reg-identity">
            почта/номер телефона
          </label>
          <input
            id="reg-identity"
            className="field-input"
            value={emailOrPhone}
            onChange={(event) => setEmailOrPhone(event.target.value)}
          />

          <label className="field-label" htmlFor="reg-name" style={{ marginTop: 16 }}>
            имя
          </label>
          <input
            id="reg-name"
            className="field-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <label className="field-label" htmlFor="reg-password" style={{ marginTop: 16 }}>
            пароль
          </label>
          <input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            className="field-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
            <button
              type="button"
              style={{ border: 0, background: "transparent", color: "var(--app-primary)", cursor: "pointer" }}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "скрыть пароль" : "показать пароль"}
            </button>
          </div>

          {error ? <p style={{ color: "crimson", marginTop: 12 }}>{error}</p> : null}

          <div style={{ display: "grid", gap: 16, justifyContent: "center", marginTop: 26 }}>
            <button type="submit" className="primary-button" disabled={submitting}>
              продолжить
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                startGuest();
                router.push("/onboarding");
              }}
            >
              пропустить
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { apiClient } from "@/shared/api/client";
import type { User } from "@/shared/api/types";
import { validateEmail, validateName, validatePhone } from "@/shared/lib/validation";

export function ProfileScreen() {
  const router = useRouter();
  const { user, isGuest, updateLocalUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar_url ?? "builtin://blue_star");
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [saving, setSaving] = useState(false);

  const hydrate = (nextUser: User) => {
    updateLocalUser(nextUser);
    setName(nextUser.name);
    setEmail(nextUser.email ?? "");
    setPhone(nextUser.phone ?? "");
    setAvatarUrl(nextUser.avatar_url ?? "builtin://blue_star");
  };

  useEffect(() => {
    if (!user || isGuest) return;
    let active = true;
    (async () => {
      try {
        const profile = await apiClient.getMe();
        if (!active) return;
        hydrate(profile);
      } catch {
        if (!active) return;
        setOffline(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [isGuest, user?.id]);

  const avatarSrc = useMemo(() => {
    if (avatarUrl === "builtin://pink_star") return "/assets/star4.svg";
    return "/assets/star.svg";
  }, [avatarUrl]);

  const save = async () => {
    if (isGuest) {
      setError("Для редактирования профиля нужна регистрация");
      return;
    }

    const firstError = validateName(name) ?? validateEmail(email) ?? validatePhone(phone);
    if (firstError) {
      setError(firstError);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const updated = await apiClient.updateMe({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        avatar_url: avatarUrl
      });
      hydrate(updated);
      setEditing(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Не удалось сохранить изменения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page">
      <div className="content-width" style={{ textAlign: "center", maxWidth: 680, paddingBottom: 160 }}>
        <h1 className="miama page-title" style={{ marginTop: 0 }}>
          Мой профиль
        </h1>
        <Image
          src={avatarSrc}
          alt="avatar"
          width={148}
          height={148}
          style={{
            background: "rgba(126, 191, 255, 0.45)",
            borderRadius: "50%",
            marginTop: 20,
            padding: 8
          }}
        />
        <p className="screen-subtitle" style={{ color: "var(--app-primary)" }}>
          {user?.name ?? "Гость"}
        </p>
        {offline ? (
          <p style={{ color: "var(--app-primary)", maxWidth: 540, margin: "0 auto" }}>
            Нет соединения. Показаны сохранённые данные.
          </p>
        ) : null}

        <div style={{ display: "grid", gap: 24, justifyContent: "center", marginTop: 28 }}>
          <button
            className="primary-button"
            style={{ width: 300 }}
            onClick={() => (isGuest ? router.push("/register") : setEditing((prev) => !prev))}
          >
            {isGuest ? "зарегистрироваться" : "настройки профиля"}
          </button>
          {isGuest ? (
            <button className="primary-button" style={{ width: 300 }} onClick={() => router.push("/login")}>
              войти
            </button>
          ) : null}
          <button
            className="primary-button"
            style={{ width: 300 }}
            onClick={() => window.open("https://t.me/dashamalafeeva", "_blank", "noopener,noreferrer")}
          >
            написать в поддержку
          </button>
          {user?.is_admin ? (
            <Link href="/admin/gifts/new" className="primary-button" style={{ width: 300, lineHeight: "56px" }}>
              добавить подарок
            </Link>
          ) : null}
        </div>

        {editing ? (
          <section style={{ marginTop: 28, textAlign: "left" }}>
            <h2 className="miama page-title" style={{ textAlign: "center" }}>
              Настройки профиля
            </h2>
            <p style={{ textAlign: "center", opacity: 0.65 }}>Не забудьте сохранить данные</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 18 }}>
              <button
                className="round-button"
                onClick={() => setAvatarUrl("builtin://blue_star")}
                style={{ border: avatarUrl === "builtin://blue_star" ? "2px solid var(--app-secondary)" : "none" }}
              >
                <Image src="/assets/star.svg" alt="" width={40} height={40} />
              </button>
              <button
                className="round-button"
                onClick={() => setAvatarUrl("builtin://pink_star")}
                style={{ border: avatarUrl === "builtin://pink_star" ? "2px solid var(--app-secondary)" : "none" }}
              >
                <Image src="/assets/star4.svg" alt="" width={40} height={40} />
              </button>
            </div>

            <label className="field-label" htmlFor="profile-name">
              имя
            </label>
            <input
              id="profile-name"
              className="field-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <label className="field-label" htmlFor="profile-email" style={{ marginTop: 20 }}>
              почта
            </label>
            <input
              id="profile-email"
              className="field-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <label className="field-label" htmlFor="profile-phone" style={{ marginTop: 20 }}>
              телефон
            </label>
            <input
              id="profile-phone"
              className="field-input"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            {error ? <p style={{ color: "crimson", marginTop: 12 }}>{error}</p> : null}
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <button className="primary-button" disabled={saving} onClick={() => void save()}>
                сохранить
              </button>
              {isGuest ? (
                <button
                  className="secondary-button"
                  style={{ marginLeft: 12 }}
                  onClick={() => {
                    router.push("/register");
                  }}
                >
                  перейти к регистрации
                </button>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

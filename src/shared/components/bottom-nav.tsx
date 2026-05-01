"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { href: "/feed", icon: "/assets/home.svg", label: "Лента" },
  { href: "/favorites", icon: "/assets/heart.svg", label: "Избранное" },
  { href: "/profile", icon: "/assets/profile.svg", label: "Профиль" }
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="tabbar-shell" aria-label="Основная навигация">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <button
            key={item.href}
            type="button"
            className="tabbar-button"
            onClick={() => router.push(item.href)}
            style={{ color: active ? "var(--app-primary)" : "var(--app-background)" }}
            aria-label={item.label}
          >
            <Image src={item.icon} alt={item.label} width={27} height={27} />
          </button>
        );
      })}
    </nav>
  );
}

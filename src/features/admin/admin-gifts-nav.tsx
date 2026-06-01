"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/gifts/candidates", label: "Парсер и модерация" },
  { href: "/admin/gifts/new", label: "Добавить вручную" }
] as const;

export function AdminGiftsNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-gifts-nav" aria-label="Админ: подарки">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "admin-gifts-nav__link admin-gifts-nav__link--active" : "admin-gifts-nav__link"}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

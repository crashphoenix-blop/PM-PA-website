import type { Metadata } from "next";
import { AppProviders } from "@/app/providers";
import "@/shared/styles/globals.css";

export const metadata: Metadata = {
  title: "Surprise Web",
  description: "Web version of Surprise iOS app"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

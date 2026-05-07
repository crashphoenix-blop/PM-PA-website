import type { Metadata } from "next";
import Script from "next/script";
import { AppProviders } from "@/app/providers";
import "@/shared/styles/globals.css";

export const metadata: Metadata = {
  title: "Surprise Web",
  description: "Web version of Surprise iOS app"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const yandexMetrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

  return (
    <html lang="ru">
      <body>
        {yandexMetrikaId ? (
          <Script
            id="yandex-metrika"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);
                })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
                ym(${Number(yandexMetrikaId)}, "init", {
                  clickmap: true,
                  trackLinks: true,
                  accurateTrackBounce: true,
                  webvisor: true
                });
              `
            }}
          />
        ) : null}
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.push("/feed");
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="page">
      <div className="content-width" style={{ minHeight: "100dvh", position: "relative" }}>
        <div style={{ position: "absolute", top: 140, right: 40 }}>
          <Image src="/assets/star.svg" alt="" width={88} height={100} style={{ opacity: 0.4 }} />
          <Image src="/assets/star.svg" alt="" width={88} height={100} style={{ marginTop: -80 }} />
        </div>
        <h1
          className="screen-title"
          style={{
            margin: 0,
            position: "absolute",
            left: 42,
            bottom: 73,
            whiteSpace: "pre-line",
            lineHeight: 0.85
          }}
        >
          {"Регистрация\nпрошла\nуспешно"}
        </h1>
      </div>
    </main>
  );
}

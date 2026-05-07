import { NextRequest, NextResponse } from "next/server";

const IMAGE_CONTENT_TYPE_PREFIX = "image/";
const EXTENSION_TO_CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml"
};

const inferContentType = (url: string): string => {
  const clean = url.split("?")[0]?.split("#")[0] ?? "";
  const ext = clean.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TO_CONTENT_TYPE[ext] ?? "image/jpeg";
};

const buildPlaceholderSvg = (title: string): string => {
  const safeTitle = title.replace(/[<>&"]/g, "").slice(0, 48) || "Подарок";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" fill="none">
  <rect width="1200" height="1200" fill="#E7E1DB"/>
  <circle cx="600" cy="420" r="180" fill="#A68E8E" fill-opacity="0.35"/>
  <text x="600" y="740" text-anchor="middle" fill="#524141" font-family="Helvetica, Arial, sans-serif" font-size="56" font-weight="700">${safeTitle}</text>
  <text x="600" y="810" text-anchor="middle" fill="#524141" font-family="Helvetica, Arial, sans-serif" font-size="36" fill-opacity="0.75">изображение временно недоступно</text>
</svg>`;
};

const placeholderResponse = (title: string): NextResponse =>
  new NextResponse(buildPlaceholderSvg(title), {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("url")?.trim();
  const title = request.nextUrl.searchParams.get("title")?.trim() ?? "Подарок";
  if (!source || (!source.startsWith("http://") && !source.startsWith("https://"))) {
    return placeholderResponse(title);
  }

  let upstream: Response;
  try {
    upstream = await fetch(source, {
      headers: {
        "User-Agent": "Mozilla/5.0 SurpriseImageProxy/1.0",
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
        Referer: "https://www.google.com/",
        "Accept-Language": "ru,en;q=0.9"
      },
      cache: "force-cache",
      next: { revalidate: 86400 }
    });
  } catch {
    return placeholderResponse(title);
  }

  if (!upstream.ok) {
    return placeholderResponse(title);
  }

  const rawContentType = upstream.headers.get("content-type") ?? "";
  const contentType = rawContentType.startsWith(IMAGE_CONTENT_TYPE_PREFIX)
    ? rawContentType
    : inferContentType(source);

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400"
    }
  });
}

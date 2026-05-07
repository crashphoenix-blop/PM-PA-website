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

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("url")?.trim();
  if (!source || (!source.startsWith("http://") && !source.startsWith("https://"))) {
    return new NextResponse("Invalid url", { status: 400 });
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
    return new NextResponse("Failed to fetch image", { status: 502 });
  }

  if (!upstream.ok) {
    return new NextResponse("Image unavailable", { status: 404 });
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

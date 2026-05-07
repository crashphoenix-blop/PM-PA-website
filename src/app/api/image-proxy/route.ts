import { NextRequest, NextResponse } from "next/server";

const IMAGE_CONTENT_TYPE_PREFIX = "image/";

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
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8"
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

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.startsWith(IMAGE_CONTENT_TYPE_PREFIX)) {
    return new NextResponse("Unsupported content type", { status: 415 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400"
    }
  });
}

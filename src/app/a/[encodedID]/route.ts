import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { encodedID: string } }
) {
  const { encodedID } = params;

  let originalUrl: string;
  try {
    // Decode base64url back to original URL
    originalUrl = Buffer.from(encodedID, "base64url").toString("utf-8");
  } catch {
    return new NextResponse("Invalid image ID", { status: 400 });
  }

  // Only allow proxying Instagram/Facebook CDN images
  const allowed =
    originalUrl.includes("cdninstagram.com") ||
    originalUrl.includes("fbcdn.net") ||
    originalUrl.includes("scontent");

  if (!allowed) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const upstream = await fetch(originalUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.instagram.com/",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!upstream.ok) {
      return new NextResponse("Failed to fetch image", {
        status: upstream.status,
      });
    }

    const contentType =
      upstream.headers.get("content-type") || "image/jpeg";
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error: any) {
    console.error("Image proxy error:", error);
    return new NextResponse("Failed to proxy image", { status: 502 });
  }
}

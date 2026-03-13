import { NextRequest, NextResponse } from "next/server";
import { incrementStat, logApiRequest } from "@/lib/supabase";
import { prettyJson } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return prettyJson({ status: false, error: "Parameter 'code' is required" }, 400);
  }

  const userIP = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const realUA = req.headers.get("user-agent") || "browser";

  await incrementStat("total_hits");

  try {
    const response = await fetch("https://carbon-generator-ditzx.vercel.app/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from provider: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.image) {
      throw new Error("No image returned from Carbon Generator API");
    }

    // The API returns base64 image data, convert it to buffer
    const base64Data = data.image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Determine content type from the data URI or default to png
    const contentTypeMatch = data.image.match(/^data:(image\/\w+);base64,/);
    const contentType = contentTypeMatch ? contentTypeMatch[1] : "image/png";

    await incrementStat("total_success");
    await logApiRequest({
      ip_address: userIP,
      method: "GET",
      router: "/api/maker/carbongenerator",
      status: 200,
      user_agent: realUA,
    });

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  } catch (error: any) {
    console.error("Carbon Generator API Error:", error);
    await incrementStat("total_errors");
    await logApiRequest({
      ip_address: userIP,
      method: "GET",
      router: "/api/maker/carbongenerator",
      status: 500,
      user_agent: realUA,
    });
    return prettyJson({ status: false, error: error.message }, 500);
  }
}

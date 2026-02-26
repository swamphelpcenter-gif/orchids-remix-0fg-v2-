import { NextRequest, NextResponse } from "next/server";
import { incrementStat, logApiRequest, supabase } from "@/lib/supabase";
import crypto from "crypto";
import { prettyJson } from "@/lib/utils";
import sharp from "sharp";

type WatermarkPosition = "northwest" | "north" | "northeast" | "west" | "center" | "east" | "southwest" | "south" | "southeast";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get("prompt");
  
  const size = searchParams.get("size") || "15";
  const position = (searchParams.get("position") || "southeast") as WatermarkPosition;
  const opacity = searchParams.get("opacity") || "42";

  const userIP = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "browser";

  if (!prompt) {
    return prettyJson({
      status: false,
      creator: "Vallzx",
      error: "Parameter 'prompt' is required",
      usage: {
        endpoint: "/api/ai/gemini-nano-banana",
        params: {
          prompt: "Your image description (required)",
            size: "Watermark size percentage 1-100 (default: 15)",
          position: "Watermark position: northwest, north, northeast, west, center, east, southwest, south, southeast (default: southeast)",
          opacity: "Watermark opacity percentage 1-100 (default: 42)"
        },
        example: "/api/ai/gemini-nano-banana?prompt=beautiful sunset over mountains&size=25&position=southeast&opacity=50"
      }
    }, 400);
  }

  const validPositions: WatermarkPosition[] = ["northwest", "north", "northeast", "west", "center", "east", "southwest", "south", "southeast"];
  if (!validPositions.includes(position)) {
    return prettyJson({
      status: false,
      creator: "Vallzx",
      error: `Invalid position. Valid values: ${validPositions.join(", ")}`
    }, 400);
  }

  const sizePercent = Math.min(100, Math.max(1, parseInt(size) || 15));
  const opacityPercent = Math.min(100, Math.max(1, parseInt(opacity) || 42));

  await incrementStat("total_requests");

  try {
    const targetUrl = `https://anabot.my.id/api/ai/text2image?prompt=${encodeURIComponent(prompt)}&models=nano-banana&apikey=freeApikey`;
    const response = await fetch(targetUrl, {
      headers: {
        "Accept": "application/json",
      },
    });
    const data = await response.json();

    if (!data.success || !data.data?.result?.ImageUrl) {
      throw new Error(data.message || "Failed to generate image from provider");
    }

    const imageUrl = data.data.result.ImageUrl;
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error("Failed to download image from provider URL");

    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

    const processedImageBuffer = await sharp(imageBuffer)
      .png()
      .toBuffer();

    const id = crypto.randomBytes(4).toString("hex");
    const imagePath = `gemini-nano-banana/${id}.png`;

      const { error: uploadError } = await supabase.storage
        .from("ai-images")
        .upload(imagePath, processedImageBuffer, {
        contentType: "image/png",
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { error: dbError } = await supabase
      .from("ai_images")
      .insert({
        id,
        prompt,
        image_path: imagePath
      });

    if (dbError) throw dbError;

    await incrementStat("total_success");
    await logApiRequest({
      ip_address: userIP,
      method: "GET",
      router: "/api/ai/gemini-nano-banana",
      status: 200,
      user_agent: userAgent
    });

    return new NextResponse(processedImageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "X-Result-ID": id,
        "X-Prompt": prompt,
      }
    });

  } catch (error: any) {
    console.error("Gemini Nano Banana API Error:", error);
    await incrementStat("total_errors");
    await logApiRequest({
      ip_address: userIP,
      method: "GET",
      router: "/api/ai/gemini-nano-banana",
      status: 500,
      user_agent: userAgent
    });
    return prettyJson({
      status: false,
      creator: "Vallzx",
      error: error.message || "Terjadi kesalahan saat generate gambar"
    }, 500);
  }
}

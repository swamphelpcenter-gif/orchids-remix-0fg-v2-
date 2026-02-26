import { NextRequest, NextResponse } from "next/server";
import { incrementStat, logApiRequest, supabase } from "@/lib/supabase";
import crypto from "crypto";
import { prettyJson } from "@/lib/utils";
import sharp from "sharp";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get("prompt");
  
  const userIP = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "browser";

  if (!prompt) {
    return prettyJson({
      status: false,
      creator: "Vallzx",
      error: "Parameter 'prompt' is required",
      usage: {
        endpoint: "/api/image-generator/nano-banana",
        params: {
          prompt: "Your image description (required)"
        },
        example: "/api/image-generator/nano-banana?prompt=Cute%20Cat"
      }
    }, 400);
  }

  await incrementStat("total_requests");

    try {
      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&model=flux&seed=${seed}&nologo=true`;
      const imageRes = await fetch(imageUrl, {
        headers: { "Accept": "image/*" },
      });
      if (!imageRes.ok) throw new Error("Failed to generate image from provider");
      const contentType = imageRes.headers.get("content-type") || "";
      if (!contentType.includes("image")) throw new Error("Provider did not return an image");

    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

    const processedImageBuffer = await sharp(imageBuffer)
      .png()
      .toBuffer();

    const id = crypto.randomBytes(4).toString("hex");
    const imagePath = `nano-banana/${id}.png`;

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
      router: "/api/image-generator/nano-banana",
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
    console.error("Nano Banana API Error:", error);
    await incrementStat("total_errors");
    await logApiRequest({
      ip_address: userIP,
      method: "GET",
      router: "/api/image-generator/nano-banana",
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

import { NextRequest, NextResponse } from "next/server";
import { incrementStat, logApiRequest, supabase } from "@/lib/supabase";
import crypto from "crypto";
import { prettyJson } from "@/lib/utils";
import sharp from "sharp";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get("prompt");
  const apikey = "freeApikey";

  const userIP = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "browser";

  if (!prompt) {
    return prettyJson({ status: false, error: "Parameter 'prompt' is required" }, 400);
  }

  await incrementStat("total_hits");

    try {
      const targetUrl = `https://anabot.my.id/api/ai/text2image?prompt=${encodeURIComponent(prompt)}&models=nano-banana&apikey=freeApikey`;
      const response = await fetch(targetUrl);
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
    const imagePath = `imagen-3.3-ultimate/${id}.png`;

    // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("ai-images")
        .upload(imagePath, processedImageBuffer, {
        contentType: "image/png",
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Save metadata to DB
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
      router: "/api/ai/imagen-3.3-ultimate",
      status: 200,
      user_agent: userAgent
    });

    // Directly return the image buffer as requested "hasilnya akan langsung ditampilkan"
    return new NextResponse(processedImageBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "X-Result-URL": `/image/imagen-3.3-ultimate/result/${id}`
        }
      });
  
    } catch (error: any) {
      console.error("Imagen 3.3 Ultimate API Error:", error);
      await incrementStat("total_errors");
      await logApiRequest({
        ip_address: userIP,
        method: "GET",
        router: "/api/ai/imagen-3.3-ultimate",
        status: 500,
        user_agent: userAgent
      });
      return prettyJson({ status: false, error: error.message }, 500);
    }
}

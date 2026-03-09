import { NextRequest, NextResponse } from "next/server";
import { incrementStat, logApiRequest } from "@/lib/supabase";
import { prettyJson } from "@/lib/utils";

const EXTERNAL_BACKEND_URL = "https://youtube-downloader-ditzx.vercel.app/api/yt";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const yt_url = searchParams.get("yt_url");
  const type = searchParams.get("type") || "video"; // Default to video

  const userIP = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "browser";

  if (!yt_url) {
    return prettyJson({ status: false, error: "Parameter 'yt_url' is required" }, 400);
  }

  // Validate URL format
  if (!yt_url.includes("youtube.com") && !yt_url.includes("youtu.be")) {
    return prettyJson({ status: false, error: "Invalid YouTube URL" }, 400);
  }

  // Validate type parameter
  if (!["video", "audio"].includes(type)) {
    return prettyJson({ status: false, error: "Parameter 'type' must be 'video' or 'audio'" }, 400);
  }

  await incrementStat("total_requests");

  try {
    // Map parameters to backend requirements
    const backendPayload = {
      url: yt_url,
      quality: type === "video" ? 1080 : 128,
      type: type
    };

    console.log("[v0] Calling external backend with payload:", backendPayload);

    // Call the external backend
    const backendResponse = await fetch(EXTERNAL_BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendPayload)
    });

    if (!backendResponse.ok) {
      throw new Error(`External backend request failed: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();

    console.log("[v0] Backend response:", backendData);

    if (!backendData.success || !backendData.data?.download?.url) {
      throw new Error(backendData.message || "Failed to get download URL from backend");
    }

    // Extract file ID from the download URL
    // Original: https://youtubedl.siputzx.my.id/files/1cb3acd0-d545-44b7-95a5-e46fe6ee4d5a.mp4
    // Extract: 1cb3acd0-d545-44b7-95a5-e46fe6ee4d5a.mp4
    const downloadUrl = backendData.data.download.url;
    const fileIdMatch = downloadUrl.match(/files\/(.+?)(?:\?|$)/);
    const fileId = fileIdMatch ? fileIdMatch[1] : null;

    if (!fileId) {
      throw new Error("Could not extract file ID from download URL");
    }

    // Rewrite the URL to use internal proxy
    const proxyDownloadUrl = `${new URL(req.url).origin}/api/result/yt/${fileId}`;

    await incrementStat("total_success");
    await logApiRequest({
      ip_address: userIP,
      method: "GET",
      router: "/api/downloader/youtubev2",
      status: 200,
      user_agent: userAgent
    });

    return prettyJson({
      success: true,
      data: {
        id: backendData.data.id,
        title: backendData.data.title,
        channel_title: backendData.data.channel_title,
        description: backendData.data.description,
        thumbnails: backendData.data.thumbnails,
        published_date: backendData.data.published_date,
        statistics: backendData.data.statistics,
        download: {
          status: true,
          url: proxyDownloadUrl,
          type: type
        }
      }
    }, 200);

  } catch (error: any) {
    console.error("[v0] YouTube V2 Downloader Error:", error);
    await incrementStat("total_errors");
    await logApiRequest({
      ip_address: userIP,
      method: "GET",
      router: "/api/downloader/youtubev2",
      status: 500,
      user_agent: userAgent
    });
    return prettyJson({ status: false, error: error.message || "Failed to download video" }, 500);
  }
        }

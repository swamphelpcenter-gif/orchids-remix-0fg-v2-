import { NextRequest } from "next/server";
import { incrementStat, logApiRequest } from "@/lib/supabase";
import { prettyJson } from "@/lib/utils";

const SCRAPE_CREATORS_API_KEY = "9CB36HYSHWZaaNK3b0x62fqbCWp2";

export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const provider = params.provider.toLowerCase();

  const userIP =
    req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const realUA =
    req.headers.get("user-agent") ||
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  const endpoint = `/api/stalker/${provider}`;

  await incrementStat("total_hits");

  try {
    let apiUrl: string;

    switch (provider) {
      case "tiktok": {
        if (!url) {
          return prettyJson(
            { success: false, error: "Parameter 'url' is required. Example: ?url=https://www.tiktok.com/@username" },
            400
          );
        }
        // Extract handle from TikTok URL
        const match = url.match(/tiktok\.com\/@([^/?&#]+)/);
        if (!match) {
          return prettyJson(
            { success: false, error: "Invalid TikTok URL. Expected format: https://www.tiktok.com/@username" },
            400
          );
        }
        const handle = match[1];
        apiUrl = `https://api.scrapecreators.com/v1/tiktok/profile?handle=${encodeURIComponent(handle)}`;
        break;
      }

      case "youtube": {
        if (!url) {
          return prettyJson(
            { success: false, error: "Parameter 'url' is required. Example: ?url=https://www.youtube.com/@channelname" },
            400
          );
        }
        // Extract channel handle or ID from YouTube URL
        const handleMatch =
          url.match(/youtube\.com\/@([^/?&#]+)/) ||
          url.match(/youtube\.com\/channel\/([^/?&#]+)/) ||
          url.match(/youtube\.com\/c\/([^/?&#]+)/) ||
          url.match(/youtube\.com\/user\/([^/?&#]+)/);
        if (!handleMatch) {
          return prettyJson(
            { success: false, error: "Invalid YouTube URL. Expected format: https://www.youtube.com/@channelname" },
            400
          );
        }
        apiUrl = `https://api.scrapecreators.com/v1/youtube/channel?url=${encodeURIComponent(url)}`;
        break;
      }

      case "facebook": {
        if (!url) {
          return prettyJson(
            { success: false, error: "Parameter 'url' is required. Example: ?url=https://www.facebook.com/pagename" },
            400
          );
        }
        apiUrl = `https://api.scrapecreators.com/v1/facebook/profile?url=${encodeURIComponent(url)}&get_business_hours=true`;
        break;
      }

      default:
        return prettyJson(
          {
            success: false,
            error: `Provider '${provider}' is not supported. Available providers: tiktok, youtube, facebook`,
          },
          400
        );
    }

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-api-key": SCRAPE_CREATORS_API_KEY,
        "User-Agent": realUA,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      await incrementStat("total_errors");
      await logApiRequest({
        ip_address: userIP,
        method: "GET",
        router: endpoint,
        status: response.status,
        user_agent: realUA,
      });
      return prettyJson(
        { success: false, error: `API request failed: ${response.status}`, detail: errText },
        response.status
      );
    }

    const data = await response.json();

    await incrementStat("total_success");
    await logApiRequest({
      ip_address: userIP,
      method: "GET",
      router: endpoint,
      status: 200,
      user_agent: realUA,
    });

    return prettyJson(data);
  } catch (error: any) {
    console.error(`Stalker [${provider}] API Error:`, error);
    await incrementStat("total_errors");
    await logApiRequest({
      ip_address: userIP,
      method: "GET",
      router: endpoint,
      status: 500,
      user_agent: realUA,
    });
    return prettyJson({ success: false, error: error.message }, 500);
  }
}

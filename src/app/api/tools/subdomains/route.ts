import { NextRequest, NextResponse } from "next/server";
import { prettyJson } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");

  if (!domain) {
    return prettyJson(
      { status: false, error: "Missing domain parameter" },
      400
    );
  }

  try {
    const response = await fetch(
      `https://api.siputzx.my.id/api/tools/subdomains?domain=${encodeURIComponent(domain)}`,
      {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      }
    );

    if (!response.ok) {
      return prettyJson(
        { status: false, error: "Failed to fetch subdomains" },
        response.status
      );
    }

    const data = await response.json();

    return new NextResponse(
      JSON.stringify({
        status: data.status || true,
        data: data.data || [],
        timestamp: new Date().toISOString()
      }, null, 2),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error: any) {
    console.error("Subdomain lookup error:", error);
    return prettyJson(
      { status: false, error: error.message || "Internal Server Error" },
      500
    );
  }
}

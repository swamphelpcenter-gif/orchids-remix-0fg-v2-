import { NextRequest, NextResponse } from "next/server";
import { incrementStat, logApiRequest, supabase } from "@/lib/supabase";
import { prettyJson } from "@/lib/utils";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const tiktokvid_url = searchParams.get("tiktokvid_url");

    if (!tiktokvid_url) {
      return prettyJson({ status: false, error: "Parameter 'tiktokvid_url' is required" }, 400);
    }

    const redirectUrl = new URL(`${req.nextUrl.origin}/api/downloader/tiktokdownloader`);
    redirectUrl.searchParams.set("tiktokvid_url", tiktokvid_url);
    redirectUrl.searchParams.set("type", "mp3");

    return NextResponse.redirect(redirectUrl);
}


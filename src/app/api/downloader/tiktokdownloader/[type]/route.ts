import { NextRequest, NextResponse } from "next/server";
import { incrementStat, logApiRequest, supabase } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: { type: string } }) {
    const { searchParams } = new URL(req.url);
    const tiktokvid_url = searchParams.get("tiktokvid_url");
    const type = params.type.toLowerCase();

    if (!tiktokvid_url) {
        return NextResponse.json({ status: false, error: "Parameter 'tiktokvid_url' is required" }, { status: 400 });
    }

    if (type !== "mp4" && type !== "mp3") {
        return NextResponse.json({ status: false, error: "Invalid type. Use 'mp4' or 'mp3'" }, { status: 400 });
    }

    const userIP = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const realUA = req.headers.get("user-agent") || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    await incrementStat("total_hits");

    try {
        const targetUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokvid_url)}&hd=1`;
        
        const response = await fetch(targetUrl, {
            headers: {
                "User-Agent": realUA,
                "Accept": "application/json"
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch from provider: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.code !== 0 || !data.data) {
            throw new Error(data.msg || "Failed to get data from provider response");
        }

        const videoUrl = data.data.hdplay || data.data.play;
        const musicUrl = data.data.music || data.data.music_info?.play;
        const title = data.data.title || "TikTok Video";
        const author = data.data.author?.nickname || "Unknown";
        const thumbnailUrl = data.data.cover || data.data.origin_cover || null;

        const downloadUrl = type === "mp4" ? videoUrl : musicUrl;

        if (!downloadUrl) {
            throw new Error(`No ${type} URL found in provider response`);
        }

        const fileResponse = await fetch(downloadUrl, {
            headers: { "User-Agent": realUA }
        });

        if (!fileResponse.ok) throw new Error(`Failed to fetch ${type} file`);
        
        const fileBuffer = await fileResponse.arrayBuffer();
        const contentType = type === "mp4" ? "video/mp4" : "audio/mpeg";

        // Background tasks: Save to DB and Storage for records (optional but keeping for consistency)
        (async () => {
            try {
                const id = crypto.randomUUID();
                const fileName = `${id}.${type}`;
                
                await supabase.storage
                    .from("tiktok-downloads")
                    .upload(fileName, fileBuffer, {
                        contentType: contentType,
                        upsert: true
                    });

                await supabase
                    .from("tiktok_downloads")
                    .insert({
                        id,
                        tiktok_url: tiktokvid_url,
                        [type === "mp4" ? "mp4_path" : "mp3_path"]: fileName,
                        thumbnail_url: thumbnailUrl,
                        title,
                        author
                    });
            } catch (e) {
                console.error("Failed background task:", e);
            }
        })();

        await incrementStat("total_success");
        await logApiRequest({
            ip_address: userIP,
            method: "GET",
            router: `/api/downloader/tiktokdownloader/${type}`,
            status: 200,
            user_agent: realUA
        });

        return new Response(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `inline; filename="${title.replace(/[^a-z0-9]/gi, '_')}.${type}"`
            }
        });

    } catch (error: any) {
        console.error("TikTok Downloader API Error:", error);
        await incrementStat("total_errors");
        await logApiRequest({
            ip_address: userIP,
            method: "GET",
            router: `/api/downloader/tiktokdownloader/${type}`,
            status: 500,
            user_agent: realUA
        });
        return NextResponse.json({ status: false, error: error.message }, { status: 500 });
    }
}

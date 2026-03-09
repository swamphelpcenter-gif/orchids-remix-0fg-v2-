import { NextRequest, NextResponse } from "next/server";
import { incrementStat, logApiRequest } from "@/lib/supabase";
import { prettyJson } from "@/lib/utils";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

function generateId(): string {
  const segments = [];
  for (let i = 0; i < 5; i++) {
    segments.push(crypto.randomBytes(3).toString("hex").toUpperCase());
  }
  return segments.join("-");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nominal = searchParams.get("nominal");

  if (!nominal) {
    return prettyJson({ status: false, error: "Parameter 'nominal' is required" }, 400);
  }

  const userIP = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const realUA = req.headers.get("user-agent") || "browser";

  await incrementStat("total_hits");

  try {
    const response = await fetch("https://fakedanageneratorditzx-production.up.railway.app/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ angka: nominal }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from provider: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";

    const resultDir = path.join("/tmp/result/maker/fakedana");
    await fs.mkdir(resultDir, { recursive: true });

    const id = generateId();
    const filePath = path.join(resultDir, id);
    await fs.writeFile(filePath, Buffer.from(buffer));

    await incrementStat("total_success");
    await logApiRequest({
      ip_address: userIP,
      method: "GET",
      router: "/api/maker/fakedana",
      status: 200,
      user_agent: realUA
    });

    return NextResponse.redirect(`/tmp/result/maker/fakedana/${id}`, 302);
  } catch (error: any) {
    console.error("Fake Dana API Error:", error);
    await incrementStat("total_errors");
    await logApiRequest({
      ip_address: userIP,
      method: "GET",
      router: "/api/maker/fakedana",
      status: 500,
      user_agent: realUA
    });
    return prettyJson({ status: false, error: error.message }, 500);
  }
}

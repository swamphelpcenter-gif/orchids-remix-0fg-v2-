import { NextRequest } from "next/server";
import { logApiRequest, incrementStat } from "@/lib/supabase";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "deepseek/deepseek-r1";

async function callDeepSeek(
  prompt: string,
  conversationHistory?: Array<{ role: string; content: string }>
) {
  const messages = [
    ...(conversationHistory || []),
    { role: "user", content: prompt },
  ];

  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not defined in environment variables");
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://api.visora.my.id",
      "X-Title": "Visora Rest API",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`
    );
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  const userIP = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "Unknown";

  try {
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get("prompt");
    const history = searchParams.get("history");

    if (!prompt) {
      await logApiRequest({
        ip_address: userIP,
        method: "GET",
        router: "/api/ai/deepseek-r1",
        status: 400,
        user_agent: userAgent
      });

      return new Response(
        JSON.stringify(
          {
            status: false,
            error: "Parameter 'prompt' is required",
            usage: {
              endpoint: "/api/ai/deepseek-r1",
              params: {
                prompt: "Your question or message (required)",
                history: "JSON array of previous messages (optional)",
              },
            },
          },
          null,
          2
        ),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let conversationHistory:
      | Array<{ role: string; content: string }>
      | undefined;
    if (history) {
      try {
        conversationHistory = JSON.parse(history);
      } catch {
        await logApiRequest({
          ip_address: userIP,
          method: "GET",
          router: "/api/ai/deepseek-r1",
          status: 400,
          user_agent: userAgent
        });

        return new Response(
          JSON.stringify({ status: false, error: "Invalid history format" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const result = await callDeepSeek(prompt, conversationHistory);

    // Override provider and model in response
    const formattedResult = {
      ...result,
      provider: "Vallzx AI APIs",
      model: "deepseek-r1",
    };

    await incrementStat("total_success");
    await logApiRequest({
      ip_address: userIP,
      method: "GET",
      router: "/api/ai/deepseek-r1",
      status: 200,
      user_agent: userAgent
    });

    return new Response(JSON.stringify(formattedResult, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    await incrementStat("total_errors");
    await logApiRequest({
      ip_address: userIP,
      method: "GET",
      router: "/api/ai/deepseek-r1",
      status: 500,
      user_agent: userAgent
    });

    return new Response(
      JSON.stringify(
        {
          status: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        },
        null,
        2
      ),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(request: NextRequest) {
  const userIP = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "Unknown";

  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.prompt) {
      await logApiRequest({
        ip_address: userIP,
        method: "POST",
        router: "/api/ai/deepseek-r1",
        status: 400,
        user_agent: userAgent
      });

      return new Response(
        JSON.stringify({ status: false, error: "Prompt is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { prompt, history } = body;
    const result = await callDeepSeek(prompt, history);

    // Override provider and model in response
    const formattedResult = {
      ...result,
      provider: "Vallzx AI APIs",
      model: "deepseek-r1",
    };

    await incrementStat("total_success");
    await logApiRequest({
      ip_address: userIP,
      method: "POST",
      router: "/api/ai/deepseek-r1",
      status: 200,
      user_agent: userAgent
    });

    return new Response(JSON.stringify(formattedResult, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    await incrementStat("total_errors");
    await logApiRequest({
      ip_address: userIP,
      method: "POST",
      router: "/api/ai/deepseek-r1",
      status: 500,
      user_agent: userAgent
    });

    return new Response(
      JSON.stringify(
        {
          status: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        },
        null,
        2
      ),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


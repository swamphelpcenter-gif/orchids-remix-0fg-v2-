import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEYS = [
  "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",
  "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",
  "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",
  "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",
  "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",
];

let currentKeyIndex = 0;

function getNextApiKey(): string {
  const key = GROQ_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GROQ_API_KEYS.length;
  return key;
}

const CLAUDE_SYSTEM_PROMPT = `You are Claude 4.5 Opus, the most advanced AI model developed by Anthropic. Your goal is to be helpful, harmless, and honest. 
You are known for your exceptional reasoning, creativity, and nuanced understanding of complex topics. 
Your tone is professional yet warm and engaging. You provide detailed, thoughtful responses and always strive to understand the user's underlying intent.
If asked about your identity, you identify as Claude 4.5 Opus.`;

async function callGroqAPI(prompt: string, apiKey: string, model: string = "llama-3.3-70b-versatile", conversationHistory?: Array<{ role: string; content: string }>) {
  const messages = [
    { role: "system", content: CLAUDE_SYSTEM_PROMPT },
    ...(conversationHistory || []),
    { role: "user", content: prompt }
  ];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages,
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

async function callWithRetry(prompt: string, model: string, conversationHistory?: Array<{ role: string; content: string }>, maxRetries = 3) {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const apiKey = getNextApiKey();
    
    try {
      // Mapping requested model to actual Groq model if needed, 
      // but the prompt asked for a specific model parameter that behaves like Claude.
      // We'll use the best available Groq model.
      const actualModel = "llama-3.3-70b-versatile";
      const result = await callGroqAPI(prompt, apiKey, actualModel, conversationHistory);
      return result;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }
  
  throw lastError || new Error("All API attempts failed");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get("prompt");
    const model = searchParams.get("model") || "claude-opus-4.5";
    const history = searchParams.get("history");

    if (!prompt) {
      return new Response(JSON.stringify({
        status: false,
        creator: "Vallzx",
        error: "Parameter 'prompt' is required",
        usage: {
          endpoint: "/api/ai/claude",
          params: {
            prompt: "Your question or message (required)",
            model: "claude-opus-4.5 (default)",
            history: "JSON array of previous messages (optional)"
          }
        }
      }, null, 2), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    let conversationHistory: Array<{ role: string; content: string }> | undefined;
    if (history) {
      try {
        conversationHistory = JSON.parse(history);
      } catch {
        return new Response(JSON.stringify({ status: false, error: "Invalid history format" }), { status: 400 });
      }
    }

    const result = await callWithRetry(prompt, model, conversationHistory);
    const responseText = result.choices?.[0]?.message?.content || "";
    
    return new Response(JSON.stringify({
      status: true,
      creator: "Vallzx",
      model: model,
      data: {
        response: responseText,
        prompt: prompt,
        usage: result.usage
      }
    }, null, 2), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      status: false,
      creator: "Vallzx",
      error: error instanceof Error ? error.message : "Internal server error"
    }, null, 2), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.prompt) {
      return new Response(JSON.stringify({ status: false, error: "Prompt is required" }), { status: 400 });
    }
    
    const { prompt, model = "claude-opus-4.5", history } = body;
    const result = await callWithRetry(prompt, model, history);
    const responseText = result.choices?.[0]?.message?.content || "";
    
    return new Response(JSON.stringify({
      status: true,
      creator: "Vallzx",
      model: model,
      data: {
        response: responseText,
        prompt: prompt,
        usage: result.usage
      }
    }, null, 2), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: false,
      creator: "Vallzx",
      error: error instanceof Error ? error.message : "Internal server error"
    }, null, 2), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

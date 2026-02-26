import { NextRequest } from "next/server";
import { incrementStat, logApiRequest } from "@/lib/supabase";
import { prettyJson } from "@/lib/utils";

// Category pools for chaining suggestions — real Instagram accounts
const CATEGORY_POOLS: Record<string, string[]> = {
  football: [
    "leomessi", "neymarjr", "kylianmbappe", "davidbeckham", "garethbale11",
    "lukamodric10", "raphaelvarane", "sergioramos", "andresiniesta8", "paulpogba",
    "marcusrashford", "harrykane", "kevindebruyne", "mohamadsalah", "vinijr",
    "pedri", "gavi", "rodri", "bellinghamjude", "erlinghaaland",
  ],
  sports: [
    "kingjames", "stephencurry30", "kobebryant", "rogerfederer", "rafaelnadal",
    "serenawilliams", "tigerwoods", "usainbolt", "michaelphelps", "lewishamilton",
    "virgil", "anthonyjoshua", "canelo", "tysonfury", "nflcommish",
  ],
  music: [
    "justinbieber", "arianagrande", "taylorswift", "selenagomez", "beyonce",
    "nickiminaj", "shakira", "brunomars", "edsheeran", "duaalipa",
    "oliviarodrigo", "billieilish", "theweeknd", "drake", "badgalriri",
    "j_lo", "camila_ca", "dualipa", "postmalone", "travisscott",
  ],
  tech: [
    "elonmusk", "zuck", "sundarpichai", "jeffbezos", "timcook",
    "naval", "paulgraham", "ycombinator", "openai", "googleai",
    "microsoft", "apple", "nvidia", "spacex", "tesla",
  ],
  fashion: [
    "louisvuitton", "gucci", "prada", "chanel", "hermes",
    "versace", "dolcegabbana", "balenciaga", "givenchyofficial", "alexandermcqueen",
    "burberry", "zara", "hm", "victoriassecret", "calvinklein",
  ],
  lifestyle: [
    "kyliejenner", "kimkardashian", "khloekardashian", "kourtneykardash",
    "charlidamelio", "addisoneasterling", "noahbeck", "dixiedamelio",
    "cristiano", "iamcardib", "nickiminaj", "badgalriri", "priyankachopra",
    "deepikapadukone", "katrinakaif",
  ],
  news: [
    "bbcnews", "cnn", "nytimes", "reuters", "theeconomist",
    "natgeo", "nasa", "time", "forbes", "businessinsider",
    "espn", "bleacherreport", "skysports", "guardian", "washingtonpost",
  ],
  entertainment: [
    "marvel", "starwars", "netflix", "disneyplus", "hbo",
    "9gag", "humansofny", "instagram", "youtube", "tiktok",
    "nickelodeon", "cartoon_network", "disneychannel", "nickelodeon", "espn",
  ],
  brand: [
    "nike", "adidas", "redbull", "gopro", "foodnetwork",
    "cocacola", "pepsi", "mcdonalds", "starbucks", "amazon",
    "apple", "samsung", "sony", "porsche", "ferrari",
  ],
};

// Seeded shuffle — same username always produces same order
function seededShuffle<T>(arr: T[], seed: string): T[] {
  const copy = [...arr];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  for (let i = copy.length - 1; i > 0; i--) {
    h = (Math.imul(h, 1664525) + 1013904223) | 0;
    const j = Math.abs(h) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function detectCategory(users: Record<string, any>): string {
  const bio = (users.biography ?? "").toLowerCase();
  const cat = (users.category ?? users.category_name ?? "").toLowerCase();
  const uname = (users.username ?? "").toLowerCase();
  const full = (users.full_name ?? "").toLowerCase();
  const all = `${bio} ${cat} ${uname} ${full}`;

  // Football/soccer
  if (
    cat.includes("football") || cat.includes("soccer") || cat.includes("futebol") ||
    bio.includes("football") || bio.includes("soccer") || bio.includes(" fc ") ||
    bio.includes("futbol") || bio.includes("⚽") || bio.includes("footballer") ||
    all.includes("real madrid") || all.includes("barcelona") || all.includes("manchester") ||
    all.includes("juventus") || all.includes("chelsea") || all.includes("arsenal")
  ) return "football";

  // Other sports
  if (
    cat.includes("athlete") || cat.includes("basketball") || cat.includes("tennis") ||
    cat.includes("swimming") || cat.includes("boxing") || cat.includes("f1") ||
    bio.includes("nba") || bio.includes("nfl") || bio.includes("ufc") ||
    bio.includes("🏀") || bio.includes("🎾") || bio.includes("🏊") || bio.includes("🥊")
  ) return "sports";

  // Music
  if (
    cat.includes("musician") || cat.includes("singer") || cat.includes("rapper") ||
    cat.includes("artist") || cat.includes("dj") || cat.includes("band") ||
    bio.includes("🎵") || bio.includes("🎤") || bio.includes("🎶") ||
    bio.includes("album") || bio.includes("tour") || bio.includes("music") ||
    bio.includes("spotify") || bio.includes("grammy")
  ) return "music";

  // Tech
  if (
    cat.includes("tech") || cat.includes("software") || cat.includes("engineer") ||
    cat.includes("startup") || cat.includes("founder") || cat.includes("ceo") ||
    bio.includes("ceo") || bio.includes("founder") || bio.includes("startup") ||
    bio.includes("developer") || bio.includes("engineer") || bio.includes("ai ") ||
    all.includes("elon") || all.includes("mark zuckerberg") || all.includes("sundar")
  ) return "tech";

  // Fashion
  if (
    cat.includes("fashion") || cat.includes("luxury") || cat.includes("clothing") ||
    cat.includes("brand") || cat.includes("designer") ||
    bio.includes("fashion") || bio.includes("couture") || bio.includes("haute") ||
    bio.includes("luxury") || bio.includes("👗") || bio.includes("✂️")
  ) return "fashion";

  // News/media
  if (
    cat.includes("news") || cat.includes("media") || cat.includes("journalist") ||
    cat.includes("magazine") || cat.includes("newspaper") ||
    bio.includes("news") || bio.includes("breaking") || bio.includes("journalist") ||
    bio.includes("reporting") || bio.includes("editor")
  ) return "news";

  // Lifestyle/influencer
  if (
    cat.includes("model") || cat.includes("influencer") || cat.includes("lifestyle") ||
    bio.includes("lifestyle") || bio.includes("influencer") || bio.includes("content creator") ||
    bio.includes("📍") || bio.includes("collabs") || bio.includes("dm for promo")
  ) return "lifestyle";

  // Entertainment
  if (
    cat.includes("entertainment") || cat.includes("actor") || cat.includes("actress") ||
    cat.includes("film") || cat.includes("tv") || cat.includes("comedy") ||
    bio.includes("actor") || bio.includes("actress") || bio.includes("film") ||
    bio.includes("series") || bio.includes("movie") || bio.includes("🎬") || bio.includes("🎥")
  ) return "entertainment";

  // Brand
  if (
    cat.includes("product") || cat.includes("company") || cat.includes("sports brand") ||
    bio.includes("just do it") || bio.includes("official account") || bio.includes("official instagram")
  ) return "brand";

  return "general";
}

function encodeImageId(url: string): string {
  return Buffer.from(url).toString("base64url");
}

function buildProxiedUrl(req: NextRequest, originalUrl: string): string {
  const url = new URL(req.url);
  const base = `${url.protocol}//${url.host}`;
  return `${base}/a/${encodeImageId(originalUrl)}`;
}

function proxyImageUrls(obj: any, req: NextRequest): any {
  if (typeof obj === "string") {
    if (
      obj.includes("cdninstagram.com") ||
      obj.includes("fbcdn.net") ||
      obj.includes("scontent") ||
      obj.includes("fna.fbcdn")
    ) {
      return buildProxiedUrl(req, obj);
    }
    return obj;
  }
  if (Array.isArray(obj)) return obj.map((item) => proxyImageUrls(item, req));
  if (obj !== null && typeof obj === "object") {
    const result: any = {};
    for (const key of Object.keys(obj)) result[key] = proxyImageUrls(obj[key], req);
    return result;
  }
  return obj;
}

// Fallback pool for when category is "general" or unknown
const GENERAL_POOL = [
  "instagram", "natgeo", "nasa", "bbcnews", "cnn",
  "9gag", "humansofny", "foodnetwork", "redbull", "gopro",
  "nike", "adidas", "louisvuitton", "gucci", "prada",
];

async function fetchRelatedUsers(
  pool: string[],
  exclude: string,
  ua: string,
  seed: string,
  count = 12
): Promise<any[]> {
  // Seeded shuffle so same username always gets same suggestions
  const candidates = seededShuffle(pool, seed)
    .filter((u) => u.toLowerCase() !== exclude.toLowerCase())
    .slice(0, count + 3); // fetch extra as buffer for failures

  const results = await Promise.allSettled(
    candidates.map((uname) =>
      fetch(
        `https://api.vreden.my.id/api/v2/stalker/instagram?username=${encodeURIComponent(uname)}`,
        {
          headers: { "User-Agent": ua, Accept: "application/json" },
          signal: AbortSignal.timeout(8000),
        }
      )
        .then((r) => r.json())
        .then((d) => {
          if (!d.status || !d.result) return null;
          const u = d.result.users ?? d.result;
          return {
            pk: String(u.pk ?? u.id ?? u.instagram_pk ?? ""),
            username: u.username ?? uname,
            full_name: u.full_name ?? "",
            profile_pic_url: u.profile_pic_url ?? "",
            profile_pic_url_hd: u.profile_pic_url_hd ?? u.profile_pic_url ?? "",
            is_verified: u.is_verified ?? false,
            follower_count: u.follower_count ?? 0,
            following_count: u.following_count ?? 0,
            is_private: u.is_private ?? false,
            biography: u.biography ?? "",
            media_count: u.media_count ?? 0,
            is_business: u.is_business ?? false,
            account_type: u.account_type ?? 1,
          };
        })
        .catch(() => null)
    )
  );

  return results
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter(Boolean)
    .slice(0, count) as any[];
}

const CHAINING_CAPTIONS = [
  "People you may know",
  "Suggested for you",
  "Based on your activity",
  "Because you follow similar accounts",
  "You might like this account",
  "Popular in your network",
  "Followed by people you follow",
  "Similar interests detected",
  "Trending in your area",
  "Recommended for you",
  "People with similar interests",
  "Based on your interactions",
];

const CHAINING_ALGORITHMS = [
  "mutual_followers_based",
  "graph_based",
  "social_graph_context",
  "interest_similarity",
  "collaborative_filtering",
  "personalized_suggestion",
  "engagement_based",
  "network_expansion",
  "content_affinity",
  "follower_graph_traversal",
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return prettyJson(
      { status: false, status_code: 400, error: "Parameter 'username' is required" },
      400
    );
  }

  const userIP =
    req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const realUA =
    req.headers.get("user-agent") ||
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  await incrementStat("total_hits");

  try {
    // Fetch main profile + related users concurrently
    const mainFetch = fetch(
      `https://api.vreden.my.id/api/v2/stalker/instagram?username=${encodeURIComponent(username)}`,
      {
        headers: { "User-Agent": realUA, Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      }
    );

    const mainRes = await mainFetch;
    if (!mainRes.ok) throw new Error(`Provider responded with ${mainRes.status}`);

    const raw = await mainRes.json();

    if (!raw.status || !raw.result) {
      return prettyJson(
        {
          status: false,
          status_code: 404,
          creator: "vallzx_service-id",
          error: "User not found or profile is private",
        },
        404
      );
    }

    const users = raw.result.users ?? raw.result;

      // Detect category and fetch related accounts in parallel
      const category = detectCategory(users);
      const pool = CATEGORY_POOLS[category] ?? GENERAL_POOL;

      // Fetch 12 related users (seeded by username for consistency)
      const relatedUsers = await fetchRelatedUsers(pool, username, realUA, username, 12);

    // Build chaining data
    const followerCount: number = users.follower_count ?? 0;
    const username2: string = users.username ?? "";

    const chainingSources: number[] = [];
    if (followerCount > 500) chainingSources.push(11);
    if (followerCount > 1000) chainingSources.push(47);
    if (followerCount > 5000) chainingSources.push(20);
    if (chainingSources.length === 0) chainingSources.push(11);

    const sourcesStr = `[${chainingSources.join(",")}]`;

    const algorithmMap: Record<string, string> = {
      "[11]": "mutual_followers_based",
      "[47]": "social_graph_context",
      "[20]": "personalized_suggestion",
      "[11,47]": "mutual_followers_and_social_context",
      "[11,20]": "mutual_followers_and_personalized",
      "[47,20]": "social_context_and_personalized",
      "[11,47,20]": "mutual_followers_social_context_and_personalized",
    };

    const algorithm = algorithmMap[sourcesStr] ?? "instagram_recommendation_engine";
    const mutualCount = Math.max(1, Math.floor(Math.min(followerCount * 0.003, 150)));
    const socialContext =
      mutualCount > 1
        ? `Followed by ${mutualCount} people you follow`
        : `Followed by someone you follow`;

    // Build chaining_suggestions from real fetched related users
    const chainingSuggestions = relatedUsers.map((ru, idx) => {
      const mutualN = Math.max(1, Math.floor(Math.random() * Math.min(mutualCount, 50)) + 1);
      return {
        user: ru,
        social_context:
          idx % 3 === 0
            ? `Followed by ${mutualN} mutual friends`
            : idx % 3 === 1
            ? `${socialContext}`
            : `Followed by ${mutualN} people you follow including @${ru.username}`,
        caption: CHAINING_CAPTIONS[idx % CHAINING_CAPTIONS.length],
        algorithm: CHAINING_ALGORITHMS[idx % CHAINING_ALGORITHMS.length],
        position: idx,
      };
    });

    const chainingInfo = {
      sources: sourcesStr,
      algorithm,
      mutual_followers_count: mutualCount,
      social_context: socialContext,
      ranking_token: Buffer.from(`${username2}:${Date.now()}`)
        .toString("base64url")
        .slice(0, 32),
      view_state: "visible",
    };

    // Build image_account URL
    const reqUrl = new URL(req.url);
    const isDev =
      reqUrl.hostname === "localhost" || reqUrl.hostname === "127.0.0.1";
    const editorBase = isDev
      ? `${reqUrl.protocol}//${reqUrl.host}`
      : "https://api.visora.my.id";

    const profileId = users.pk ?? users.id ?? users.user_id ?? "";
    const imageAccountUrl = `${editorBase}/instagram/profile/rsrc.php?uid=${encodeURIComponent(profileId)}`;

    const enrichedUsers = {
      ...users,
      chaining_suggestion: chainingSuggestions.length > 0,
      chaining_info: chainingInfo,
      chaining_suggestions: chainingSuggestions,
      chaining_upsell_cards:
        users.chaining_upsell_cards?.length
          ? users.chaining_upsell_cards
          : [
              {
                title: "Follow more friends",
                description:
                  "See more suggestions by following people you know",
                action: "follow_suggestions",
              },
            ],
    };

    const proxiedUsers = proxyImageUrls(enrichedUsers, req);

    await incrementStat("total_success");
    await logApiRequest({
      ip_address: userIP,
      method: "GET",
      router: "/api/v2/stalker/instagram",
      status: 200,
      user_agent: realUA,
    });

    return prettyJson({
      status: true,
      status_code: 200,
      creator: "vallzx_service-id",
      result: {
        image_account: imageAccountUrl,
        users: proxiedUsers,
      },
    });
  } catch (error: any) {
    console.error("Instagram Stalker v2 Error:", error);
    await incrementStat("total_errors");
    await logApiRequest({
      ip_address: userIP,
      method: "GET",
      router: "/api/v2/stalker/instagram",
      status: 500,
      user_agent: realUA,
    });
    return prettyJson(
      {
        status: false,
        status_code: 500,
        creator: "vallzx_service-id",
        error: "Failed to fetch Instagram profile",
      },
      500
    );
  }
}

"use node";

declare const process: { env: Record<string, string | undefined> };

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

/* ═══════════════════════════════════════════
   API KEY HELPERS — checks DB first (user-updatable),
   then env var, then hardcoded fallback
   ═══════════════════════════════════════════ */
const getKey = (envName: string, fallback: string) =>
  process.env[envName] || fallback;

const FALLBACKS: Record<string, string> = {
  NEWSAPI_KEY: "YOUR_NEWSAPI_KEY_HERE",
  GNEWS_KEY: "YOUR_GNEWS_KEY_HERE",
  NEWSDATA_KEY: "YOUR_NEWSDATA_KEY_HERE",
  CURRENTS_KEY: "YOUR_CURRENTS_KEY_HERE",
  THENEWSAPI_KEY: "YOUR_THENEWSAPI_KEY_HERE",
  TELEGRAM_TOKEN: "YOUR_TELEGRAM_TOKEN_HERE",
  TELEGRAM_CHANNEL: "@facebooknewie",
  GEMINI_API_KEY: "YOUR_GEMINI_API_KEY_HERE",
  FACEBOOK_PAGE_ID: "YOUR_FB_PAGE_ID_HERE",
  FACEBOOK_PAGE_TOKEN: "YOUR_FB_PAGE_TOKEN_HERE",
};

/**
 * Module-level DB key cache. Set at the start of each action via loadDbKeys().
 * DB keys take highest priority (user can update from frontend).
 */
let _runtimeDbKeys: Record<string, string> = {};

/** Load all DB-stored API keys once per action invocation */
async function loadDbKeys(ctx: any): Promise<void> {
  try {
    const keys = await ctx.runQuery(api.apiKeys.getAll);
    _runtimeDbKeys = keys || {};
  } catch {
    _runtimeDbKeys = {};
  }
}

/**
 * Priority: 1) DB (user-updatable) → 2) env var → 3) hardcoded fallback
 */
const KEYS = {
  newsapi: () => _runtimeDbKeys["NEWSAPI_KEY"] || getKey("NEWSAPI_KEY", FALLBACKS.NEWSAPI_KEY),
  gnews: () => _runtimeDbKeys["GNEWS_KEY"] || getKey("GNEWS_KEY", FALLBACKS.GNEWS_KEY),
  newsdata: () => _runtimeDbKeys["NEWSDATA_KEY"] || getKey("NEWSDATA_KEY", FALLBACKS.NEWSDATA_KEY),
  currents: () => _runtimeDbKeys["CURRENTS_KEY"] || getKey("CURRENTS_KEY", FALLBACKS.CURRENTS_KEY),
  thenewsapi: () => _runtimeDbKeys["THENEWSAPI_KEY"] || getKey("THENEWSAPI_KEY", FALLBACKS.THENEWSAPI_KEY),
  telegramToken: () => _runtimeDbKeys["TELEGRAM_TOKEN"] || getKey("TELEGRAM_TOKEN", FALLBACKS.TELEGRAM_TOKEN),
  telegramChannel: () => _runtimeDbKeys["TELEGRAM_CHANNEL"] || getKey("TELEGRAM_CHANNEL", FALLBACKS.TELEGRAM_CHANNEL),
  gemini: () => _runtimeDbKeys["GEMINI_API_KEY"] || getKey("GEMINI_API_KEY", FALLBACKS.GEMINI_API_KEY),
  facebookPageId: () => _runtimeDbKeys["FACEBOOK_PAGE_ID"] || getKey("FACEBOOK_PAGE_ID", FALLBACKS.FACEBOOK_PAGE_ID),
  facebookPageToken: () => _runtimeDbKeys["FACEBOOK_PAGE_TOKEN"] || getKey("FACEBOOK_PAGE_TOKEN", FALLBACKS.FACEBOOK_PAGE_TOKEN),
};

// Simple hash for dedup
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// Shuffle array helper
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ═══════════════════════════════════════════
   INDIVIDUAL API FETCHERS
   ═══════════════════════════════════════════ */

async function fetchFromNewsAPI(maxPerApi: number): Promise<{ articles: any[]; error?: string }> {
  const key = KEYS.newsapi();
  if (!key) return { articles: [], error: "NewsAPI key missing" };
  try {
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?language=en&pageSize=${maxPerApi}&apiKey=${key}`
    );
    const data = await res.json();
    if (!data.articles) return { articles: [], error: data.message || "No articles" };
    return {
      articles: data.articles
        .filter((a: any) => a.url && a.title && a.title !== "[Removed]")
        .map((a: any) => ({
          title: a.title,
          description: a.description || undefined,
          content: a.content || undefined,
          url: a.url,
          imageUrl: a.urlToImage || undefined,
          source: "newsapi",
          category: "general",
          publishedAt: a.publishedAt || undefined,
          urlHash: simpleHash(a.url),
        })),
    };
  } catch (e: any) {
    return { articles: [], error: `NewsAPI: ${e.message}` };
  }
}

async function fetchFromGNews(maxPerApi: number): Promise<{ articles: any[]; error?: string }> {
  const key = KEYS.gnews();
  if (!key) return { articles: [], error: "GNews key missing" };
  try {
    const res = await fetch(
      `https://gnews.io/api/v4/top-headlines?lang=en&max=${maxPerApi}&apikey=${key}`
    );
    const data = await res.json();
    if (!data.articles) return { articles: [], error: data.message || "No articles" };
    return {
      articles: data.articles
        .filter((a: any) => a.url && a.title)
        .map((a: any) => ({
          title: a.title,
          description: a.description || undefined,
          content: a.content || undefined,
          url: a.url,
          imageUrl: a.image || undefined,
          source: "gnews",
          category: "general",
          publishedAt: a.publishedAt || undefined,
          urlHash: simpleHash(a.url),
        })),
    };
  } catch (e: any) {
    return { articles: [], error: `GNews: ${e.message}` };
  }
}

async function fetchFromNewsData(maxPerApi: number): Promise<{ articles: any[]; error?: string }> {
  const key = KEYS.newsdata();
  if (!key) return { articles: [], error: "NewsData key missing" };
  try {
    const res = await fetch(
      `https://newsdata.io/api/1/latest?language=en&size=${maxPerApi}&apikey=${key}`
    );
    const data = await res.json();
    if (!data.results) return { articles: [], error: data.message || "No results" };
    return {
      articles: data.results
        .filter((a: any) => a.link && a.title)
        .map((a: any) => ({
          title: a.title,
          description: a.description || undefined,
          content: a.content || undefined,
          url: a.link,
          imageUrl: a.image_url || undefined,
          source: "newsdata",
          category: a.category?.[0] || "general",
          publishedAt: a.pubDate || undefined,
          urlHash: simpleHash(a.link),
        })),
    };
  } catch (e: any) {
    return { articles: [], error: `NewsData: ${e.message}` };
  }
}

async function fetchFromCurrents(maxPerApi: number): Promise<{ articles: any[]; error?: string }> {
  const key = KEYS.currents();
  if (!key) return { articles: [], error: "Currents key missing" };
  try {
    const res = await fetch(
      `https://api.currentsapi.services/v1/latest-news?language=en&apiKey=${key}`
    );
    const data = await res.json();
    if (!data.news) return { articles: [], error: "No news" };
    return {
      articles: data.news
        .filter((a: any) => a.url && a.title)
        .slice(0, maxPerApi)
        .map((a: any) => ({
          title: a.title,
          description: a.description || undefined,
          content: undefined,
          url: a.url,
          imageUrl: a.image !== "None" ? a.image : undefined,
          source: "currents",
          category: a.category?.[0] || "general",
          publishedAt: a.published || undefined,
          urlHash: simpleHash(a.url),
        })),
    };
  } catch (e: any) {
    return { articles: [], error: `Currents: ${e.message}` };
  }
}

async function fetchFromTheNewsAPI(maxPerApi: number): Promise<{ articles: any[]; error?: string }> {
  const key = KEYS.thenewsapi();
  if (!key) return { articles: [], error: "TheNewsAPI key missing" };
  try {
    const res = await fetch(
      `https://api.thenewsapi.com/v1/news/top?api_token=${key}&language=en&limit=${maxPerApi}`
    );
    const data = await res.json();
    if (!data.data) return { articles: [], error: "No data" };
    return {
      articles: data.data
        .filter((a: any) => a.url && a.title)
        .map((a: any) => ({
          title: a.title,
          description: a.description || undefined,
          content: a.snippet || undefined,
          url: a.url,
          imageUrl: a.image_url || undefined,
          source: "thenewsapi",
          category: a.categories?.[0] || "general",
          publishedAt: a.published_at || undefined,
          urlHash: simpleHash(a.url),
        })),
    };
  } catch (e: any) {
    return { articles: [], error: `TheNewsAPI: ${e.message}` };
  }
}

/* ═══════════════════════════════════════════
   FETCH NEWS — with API rotation + limits
   ═══════════════════════════════════════════ */
export const fetchNews = action({
  args: {
    maxArticles: v.optional(v.number()),
    apisToUse: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
      await loadDbKeys(ctx);
    const maxArticles = args.maxArticles ?? 10;
    const apisToUse = args.apisToUse ?? 3; // Randomly pick N APIs

    // All available fetchers
    const allFetchers = [
      fetchFromNewsAPI,
      fetchFromGNews,
      fetchFromNewsData,
      fetchFromCurrents,
      fetchFromTheNewsAPI,
    ];

    // Randomly select APIs to use (rotation to preserve free tier)
    const selectedFetchers = shuffle(allFetchers).slice(0, apisToUse);
    const maxPerApi = Math.ceil(maxArticles / selectedFetchers.length);

    let totalFetched = 0;
    const errors: string[] = [];

    for (const fetcher of selectedFetchers) {
      const result = await fetcher(maxPerApi);
      if (result.error) errors.push(result.error);

      for (const article of result.articles) {
        if (totalFetched >= maxArticles) break;
        const stored = await ctx.runMutation(api.articles.store, article);
        if (stored) totalFetched++;
      }
      if (totalFetched >= maxArticles) break;
    }

    await ctx.runMutation(api.logs.add, {
      type: "fetch",
      message: `Fetched ${totalFetched} articles (limit: ${maxArticles}, APIs used: ${selectedFetchers.length})`,
      status: errors.length > 0 ? "warning" : "success",
      details: errors.length > 0 ? errors.join("; ") : undefined,
    });

    return { totalFetched, errors };
  },
});

/* ═══════════════════════════════════════════
   AI REWRITE WITH GEMINI
   ═══════════════════════════════════════════ */
export const rewriteWithGemini = action({
  args: {
    articleId: v.id("articles"),
    title: v.string(),
    description: v.optional(v.string()),
    style: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
      await loadDbKeys(ctx);
    const key = KEYS.gemini();
    if (!key) {
      await ctx.runMutation(api.logs.add, {
        type: "ai",
        message: "Gemini API key not configured",
        status: "error",
      });
      return null;
    }

    try {
      const prompt = `You are a human rewriter. Your job is to rewrite the text I give you so it sounds like it was written by a real, thoughtful human being — not an AI.

Follow these rules strictly:

**TONE & VOICE**
- Write like a smart, articulate person talking to a friend or colleague
- Use a natural, conversational tone — not formal or stiff
- Vary sentence length: mix short punchy sentences with longer ones
- Show personality — don't be bland or robotic

**LANGUAGE**
- Avoid AI-typical phrases like: "In conclusion", "It's worth noting", "Delve into", "It is important to", "Furthermore", "Moreover", "In today's world", "As an AI", "Certainly!", "Absolutely!"
- Never start every sentence with "The"
- Don't overuse adverbs like "very", "extremely", "highly"
- Use contractions naturally (don't, it's, you're, we've)
- Occasionally use informal transitions like "But here's the thing", "And honestly", "Look —", "Here's what I mean"

**STRUCTURE**
- Break up walls of text
- Don't use bullet points unless the original had them
- Avoid repetition — say things once, clearly
- Start with something that hooks the reader, not a definition

**FEEL**
- Sound like someone who actually has opinions
- Add light nuance or a small personal observation where it fits
- Avoid being preachy or over-explaining

Now rewrite this news article for a social media post. Keep the key facts. Return ONLY valid JSON with "title" and "content" fields.

Title: ${args.title}
Description: ${args.description || "N/A"}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      let parsed: { title?: string; content?: string };
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { title: args.title, content: text };
      }

      if (parsed.title && parsed.content) {
        await ctx.runMutation(api.articles.markRewritten, {
          articleId: args.articleId,
          rewrittenTitle: parsed.title,
          rewrittenContent: parsed.content,
        });
      }

      return parsed;
    } catch (e: any) {
      await ctx.runMutation(api.logs.add, {
        type: "ai",
        message: `Gemini rewrite failed: ${e.message}`,
        status: "error",
      });
      return null;
    }
  },
});

/* ═══════════════════════════════════════════
   SEND TO TELEGRAM
   ═══════════════════════════════════════════ */
export const sendToTelegram = action({
  args: {
    articleId: v.id("articles"),
    title: v.string(),
    content: v.optional(v.string()),
    url: v.string(),
    imageUrl: v.optional(v.string()),
    hashtags: v.optional(v.string()),
    removeLinks: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
      await loadDbKeys(ctx);
    const token = KEYS.telegramToken();
    const channel = KEYS.telegramChannel();
    if (!token || !channel) {
      await ctx.runMutation(api.logs.add, {
        type: "telegram",
        message: "Telegram token or channel not configured",
        status: "error",
      });
      return { success: false, error: "Not configured" };
    }

    try {
      const hashtagStr = args.hashtags || "#news #newsflow #breaking";
      let bodyText = args.content || "";
      if (args.removeLinks) {
        bodyText = bodyText.replace(/https?:\/\/[^\s<>"{}|\\^`[\]]+/gi, "").replace(/\s{2,}/g, " ").trim();
      }
      const linkLine = args.removeLinks ? "" : `\n\n🔗 <a href="${args.url}">Read more</a>`;
      const text = `<b>${escapeHtml(args.title)}</b>\n\n${escapeHtml(bodyText)}${linkLine}\n\n${hashtagStr}`;

      let result: any;

      if (args.imageUrl) {
        const res = await fetch(
          `https://api.telegram.org/bot${token}/sendPhoto`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: channel,
              photo: args.imageUrl,
              caption: text.substring(0, 1024),
              parse_mode: "HTML",
            }),
          }
        );
        result = await res.json();
      } else {
        const res = await fetch(
          `https://api.telegram.org/bot${token}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: channel,
              text: text,
              parse_mode: "HTML",
              disable_web_page_preview: false,
            }),
          }
        );
        result = await res.json();
      }

      if (result.ok) {
        await ctx.runMutation(api.articles.markTelegramSent, {
          articleId: args.articleId,
          telegramMessageId: String(result.result?.message_id || ""),
        });
        await ctx.runMutation(api.logs.add, {
          type: "telegram",
          message: `Sent to Telegram: ${args.title.substring(0, 60)}...`,
          status: "success",
        });
        return { success: true };
      } else {
        const errMsg = result.description || "Unknown Telegram error";
        await ctx.runMutation(api.logs.add, {
          type: "telegram",
          message: `Telegram send failed: ${errMsg}`,
          status: "error",
          details: JSON.stringify(result),
        });
        return { success: false, error: errMsg };
      }
    } catch (e: any) {
      await ctx.runMutation(api.logs.add, {
        type: "telegram",
        message: `Telegram error: ${e.message}`,
        status: "error",
      });
      return { success: false, error: e.message };
    }
  },
});

/* ═══════════════════════════════════════════
   POST TO FACEBOOK
   ═══════════════════════════════════════════ */
export const postToFacebook = action({
  args: {
    articleId: v.id("articles"),
    title: v.string(),
    content: v.optional(v.string()),
    url: v.string(),
    hashtags: v.optional(v.string()),
    removeLinks: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
      await loadDbKeys(ctx);
    const pageId = KEYS.facebookPageId();
    const pageToken = KEYS.facebookPageToken();
    if (!pageId || !pageToken) {
      await ctx.runMutation(api.logs.add, {
        type: "facebook",
        message: "Facebook Page ID or token not configured",
        status: "error",
      });
      return { success: false, error: "Not configured" };
    }

    try {
      const hashtagStr = args.hashtags || "#news #newsflow #breaking";
      let fbBody = args.content || "";
      if (args.removeLinks) {
        fbBody = fbBody.replace(/https?:\/\/[^\s<>"{}|\\^`[\]]+/gi, "").replace(/\s{2,}/g, " ").trim();
      }
      const fbLinkLine = args.removeLinks ? "" : `\n\n🔗 ${args.url}`;
      const message = `${args.title}\n\n${fbBody}${fbLinkLine}\n\n${hashtagStr}`;

      const res = await fetch(
        `https://graph.facebook.com/v21.0/${pageId}/feed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: message,
            ...(args.removeLinks ? {} : { link: args.url }),
            access_token: pageToken,
          }),
        }
      );
      const result = await res.json();

      if (result.id) {
        await ctx.runMutation(api.articles.markFacebookSent, {
          articleId: args.articleId,
          facebookPostId: result.id,
        });
        await ctx.runMutation(api.logs.add, {
          type: "facebook",
          message: `Posted to Facebook: ${args.title.substring(0, 60)}...`,
          status: "success",
        });
        return { success: true, postId: result.id };
      } else {
        const errMsg = result.error?.message || "Unknown Facebook error";
        await ctx.runMutation(api.logs.add, {
          type: "facebook",
          message: `Facebook post failed: ${errMsg}`,
          status: "error",
          details: JSON.stringify(result),
        });
        return { success: false, error: errMsg };
      }
    } catch (e: any) {
      await ctx.runMutation(api.logs.add, {
        type: "facebook",
        message: `Facebook error: ${e.message}`,
        status: "error",
      });
      return { success: false, error: e.message };
    }
  },
});

/* ═══════════════════════════════════════════
   SEND TEST MESSAGES
   ═══════════════════════════════════════════ */
export const sendTelegramTest = action({
  args: {},
  handler: async (ctx) => {
      await loadDbKeys(ctx);
    const token = KEYS.telegramToken();
    const channel = KEYS.telegramChannel();
    if (!token || !channel) {
      return { success: false, error: "Telegram not configured" };
    }

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: channel,
            text: "✅ <b>NewsFlow Test Message</b>\n\nYour Telegram bot is connected and working!\n\n#newsflow #test",
            parse_mode: "HTML",
          }),
        }
      );
      const result = await res.json();

      if (result.ok) {
        await ctx.runMutation(api.logs.add, {
          type: "telegram",
          message: "Test message sent to Telegram successfully",
          status: "success",
        });
        return { success: true };
      }
      return { success: false, error: result.description };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
});

export const postFacebookTest = action({
  args: {},
  handler: async (ctx) => {
      await loadDbKeys(ctx);
    const pageId = KEYS.facebookPageId();
    const pageToken = KEYS.facebookPageToken();
    if (!pageId || !pageToken) {
      return { success: false, error: "Facebook not configured" };
    }

    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${pageId}/feed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message:
              "✅ NewsFlow Test Post\n\nYour Facebook page is connected and working!\n\n#newsflow #test",
            access_token: pageToken,
          }),
        }
      );
      const result = await res.json();

      if (result.id) {
        await ctx.runMutation(api.logs.add, {
          type: "facebook",
          message: "Test post published to Facebook successfully",
          status: "success",
        });
        return { success: true, postId: result.id };
      }
      return {
        success: false,
        error: result.error?.message || "Unknown error",
      };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
});

/* ═══════════════════════════════════════════
   RUN FULL CYCLE
   ═══════════════════════════════════════════ */
export const runFullCycle = action({
  args: {
    maxPosts: v.optional(v.number()),
    maxArticles: v.optional(v.number()),
    hashtags: v.optional(v.string()),
    useAiRewrite: v.optional(v.boolean()),
    rewriteStyle: v.optional(v.string()),
    removeLinks: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await loadDbKeys(ctx);
    const maxPosts = args.maxPosts ?? 5;
    const maxArticles = args.maxArticles ?? 10;
    const hashtags =
      args.hashtags || "#news #newsflow #breaking #update #headline";

    await ctx.runMutation(api.logs.add, {
      type: "automation",
      message: "Full automation cycle started",
      status: "info",
    });

    // Step 1: Fetch news with rotation and limits
    const fetchResult: { totalFetched: number; errors: string[] } =
      await ctx.runAction(api.pipeline.fetchNews, {
        maxArticles,
        apisToUse: 3,
      });

    // Step 2: Get unsent articles for each platform separately
    const unsentTelegram = await ctx.runQuery(
      api.articles.unsent_telegram,
      {}
    );
    const unsentFacebook = await ctx.runQuery(
      api.articles.unsent_facebook,
      {}
    );

    // Build a unique set of articles to process (union, capped at maxPosts)
    const articleMap = new Map<string, typeof unsentTelegram[0]>();
    for (const a of unsentTelegram) articleMap.set(a._id, a);
    for (const a of unsentFacebook) articleMap.set(a._id, a);
    const articlesToProcess = [...articleMap.values()].slice(0, maxPosts);

    // Track titles we've already sent THIS cycle to prevent near-duplicates
    const sentTitles = new Set<string>();

    let telegramSent = 0;
    let facebookSent = 0;
    let telegramSkipped = 0;
    let facebookSkipped = 0;
    let errors = 0;

    for (const article of articlesToProcess) {
      // Skip near-duplicate titles within this cycle
      const normalizedTitle = article.title.toLowerCase().trim();
      if (sentTitles.has(normalizedTitle)) continue;
      sentTitles.add(normalizedTitle);

      let title = article.title;
      let content = article.description || "";

      // AI rewrite if enabled
      if (args.useAiRewrite) {
        try {
          const rewritten = await ctx.runAction(
            api.pipeline.rewriteWithGemini,
            {
              articleId: article._id,
              title: article.title,
              description: article.description,
              style: args.rewriteStyle,
            }
          );
          if (rewritten?.title) title = rewritten.title;
          if (rewritten?.content) content = rewritten.content;
        } catch {
          // Use original if AI fails
        }
      }

      // Strip URLs from content if removeLinks is on
      if (args.removeLinks) {
        content = content.replace(/https?:\/\/[^\s<>"{}|\\^`[\]]+/gi, "").replace(/\s{2,}/g, " ").trim();
      }

      // Send to Telegram ONLY if not already sent
      if (!article.sentToTelegram) {
        try {
          const tgResult = await ctx.runAction(api.pipeline.sendToTelegram, {
            articleId: article._id,
            title,
            content,
            url: article.url,
            imageUrl: article.imageUrl,
            hashtags,
            removeLinks: args.removeLinks,
          });
          if (tgResult.success) telegramSent++;
          else errors++;
        } catch {
          errors++;
        }
      } else {
        telegramSkipped++;
      }

      // Post to Facebook ONLY if not already sent
      if (!article.sentToFacebook) {
        try {
          const fbResult = await ctx.runAction(api.pipeline.postToFacebook, {
            articleId: article._id,
            title,
            content,
            url: article.url,
            hashtags,
            removeLinks: args.removeLinks,
          });
          if (fbResult.success) facebookSent++;
          else errors++;
        } catch {
          errors++;
        }
      } else {
        facebookSkipped++;
      }

      await new Promise((r) => setTimeout(r, 2000));
    }

    const summary = `Cycle complete: ${fetchResult.totalFetched} fetched, ${telegramSent} to Telegram, ${facebookSent} to Facebook` +
      (errors > 0 ? `, ${errors} errors` : "") +
      (telegramSkipped + facebookSkipped > 0 ? ` (${telegramSkipped + facebookSkipped} already sent, skipped)` : "");

    await ctx.runMutation(api.logs.add, {
      type: "automation",
      message: summary,
      status: "success",
    });

    return {
      fetched: fetchResult.totalFetched,
      telegramSent,
      facebookSent,
      errors,
    };
  },
});

// HTML escape helper
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ═══════════════════════════════════════════
   CONNECTION CHECKS — live ping
   ═══════════════════════════════════════════ */
export const checkTelegramConnection = action({
  args: {},
  handler: async (ctx) => {
    await loadDbKeys(ctx);
    const token = KEYS.telegramToken();
    if (!token) return { connected: false, error: "Token missing" };
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await res.json();
      if (data.ok) {
        // Also check the channel
        const channel = KEYS.telegramChannel();
        let channelOk = false;
        let memberCount = 0;
        if (channel) {
          try {
            const chatRes = await fetch(`https://api.telegram.org/bot${token}/getChat?chat_id=${encodeURIComponent(channel)}`);
            const chatData = await chatRes.json();
            channelOk = chatData.ok;
            if (chatData.ok) {
              const countRes = await fetch(`https://api.telegram.org/bot${token}/getChatMemberCount?chat_id=${encodeURIComponent(channel)}`);
              const countData = await countRes.json();
              memberCount = countData.result || 0;
            }
          } catch { /* ignore */ }
        }
        return {
          connected: true,
          botName: data.result.first_name,
          botUsername: data.result.username,
          channelConnected: channelOk,
          channelId: channel,
          memberCount,
        };
      }
      return { connected: false, error: data.description };
    } catch (e: any) {
      return { connected: false, error: e.message };
    }
  },
});

export const checkFacebookConnection = action({
  args: {},
  handler: async (ctx) => {
    await loadDbKeys(ctx);
    const pageId = KEYS.facebookPageId();
    const pageToken = KEYS.facebookPageToken();
    if (!pageId || !pageToken) return { connected: false, error: "Not configured" };
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${pageId}?fields=name,fan_count,followers_count&access_token=${pageToken}`
      );
      const data = await res.json();
      if (data.name) {
        return {
          connected: true,
          pageName: data.name,
          followers: data.followers_count || data.fan_count || 0,
        };
      }
      return { connected: false, error: data.error?.message || "Invalid token" };
    } catch (e: any) {
      return { connected: false, error: e.message };
    }
  },
});

/* ═══════════════════════════════════════════
   RSS FEED FETCHER
   ═══════════════════════════════════════════ */
export const fetchFromRSS = action({
  args: {
    feedUrl: v.string(),
    sourceName: v.string(),
    maxArticles: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
      await loadDbKeys(ctx);
    const max = args.maxArticles ?? 10;
    try {
      const res = await fetch(args.feedUrl);
      const xml = await res.text();

      // Simple XML parser for RSS items
      const items: Array<{title: string; description?: string; url: string; imageUrl?: string; publishedAt?: string}> = [];
      const itemMatches = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];

      for (const itemXml of itemMatches.slice(0, max)) {
        const getTag = (tag: string) => {
          const m = itemXml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 'is'));
          return m?.[1]?.trim() || undefined;
        };

        const title = getTag("title");
        const link = getTag("link") || getTag("guid");
        if (!title || !link) continue;

        const description = getTag("description");
        // Try to extract image from media:content or enclosure
        const imgMatch = itemXml.match(/url="(https?:\/\/[^"]+\.(jpg|jpeg|png|gif|webp)[^"]*)"/i);
        const imageUrl = imgMatch?.[1] || undefined;
        const pubDate = getTag("pubDate") || getTag("dc:date");

        items.push({ title, description, url: link, imageUrl, publishedAt: pubDate });
      }

      let stored = 0;
      for (const item of items) {
        const result = await ctx.runMutation(api.articles.store, {
          title: item.title,
          description: item.description,
          url: item.url,
          imageUrl: item.imageUrl,
          source: args.sourceName.toLowerCase().replace(/\s+/g, "_"),
          category: "rss",
          publishedAt: item.publishedAt,
          urlHash: simpleHash(item.url),
        });
        if (result) stored++;
      }

      await ctx.runMutation(api.logs.add, {
        type: "fetch",
        message: `RSS: Fetched ${stored} new articles from ${args.sourceName}`,
        status: stored > 0 ? "success" : "info",
      });

      return { success: true, fetched: stored, total: items.length };
    } catch (e: any) {
      await ctx.runMutation(api.logs.add, {
        type: "fetch",
        message: `RSS fetch failed for ${args.sourceName}: ${e.message}`,
        status: "error",
      });
      return { success: false, error: e.message, fetched: 0 };
    }
  },
});

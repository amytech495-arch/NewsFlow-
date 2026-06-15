import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get recent articles
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("articles")
      .withIndex("by_fetchedAt")
      .order("desc")
      .take(limit);
  },
});

// Get articles not yet sent to Telegram
export const unsent_telegram = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_sentToTelegram", (q) => q.eq("sentToTelegram", false))
      .take(50);
  },
});

// Get articles not yet sent to Facebook
export const unsent_facebook = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_sentToFacebook", (q) => q.eq("sentToFacebook", false))
      .take(50);
  },
});

// Store a new article (dedup by urlHash)
export const store = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    url: v.string(),
    imageUrl: v.optional(v.string()),
    source: v.string(),
    category: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
    urlHash: v.string(),
  },
  handler: async (ctx, args) => {
    // Check for duplicate
    const existing = await ctx.db
      .query("articles")
      .withIndex("by_urlHash", (q) => q.eq("urlHash", args.urlHash))
      .first();
    if (existing) return null;

    return await ctx.db.insert("articles", {
      ...args,
      fetchedAt: Date.now(),
      isRewritten: false,
      sentToTelegram: false,
      sentToFacebook: false,
    });
  },
});

// Mark article as sent to Telegram
export const markTelegramSent = mutation({
  args: {
    articleId: v.id("articles"),
    telegramMessageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      sentToTelegram: true,
      telegramSentAt: Date.now(),
      telegramMessageId: args.telegramMessageId,
    });
  },
});

// Mark article as sent to Facebook
export const markFacebookSent = mutation({
  args: {
    articleId: v.id("articles"),
    facebookPostId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      sentToFacebook: true,
      facebookSentAt: Date.now(),
      facebookPostId: args.facebookPostId,
    });
  },
});

// Mark article as rewritten
export const markRewritten = mutation({
  args: {
    articleId: v.id("articles"),
    rewrittenTitle: v.string(),
    rewrittenContent: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      isRewritten: true,
      rewrittenTitle: args.rewrittenTitle,
      rewrittenContent: args.rewrittenContent,
    });
  },
});

// Dashboard stats
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const allArticles = await ctx.db.query("articles").collect();
    const now = Date.now();
    const todayStart = now - (now % 86400000);

    const totalFetched = allArticles.length;
    const sentTelegram = allArticles.filter((a) => a.sentToTelegram).length;
    const sentFacebook = allArticles.filter((a) => a.sentToFacebook).length;
    const todayArticles = allArticles.filter((a) => a.fetchedAt >= todayStart);
    const todayPosts = todayArticles.filter(
      (a) => a.sentToTelegram || a.sentToFacebook
    ).length;

    return {
      totalFetched,
      sentTelegram,
      sentFacebook,
      todayPosts,
      todayTotal: todayArticles.length,
    };
  },
});

// Facebook page stats
export const facebookStats = query({
  args: {},
  handler: async (ctx) => {
    const allArticles = await ctx.db.query("articles").collect();
    const totalPosts = allArticles.filter((a) => a.sentToFacebook).length;
    const successful = allArticles.filter(
      (a) => a.sentToFacebook && a.facebookPostId
    ).length;
    const failed = totalPosts - successful;
    return { totalPosts, successful, failed };
  },
});

// Analytics: weekly activity breakdown
export const weeklyActivity = query({
  args: {},
  handler: async (ctx) => {
    const allArticles = await ctx.db.query("articles").collect();
    const now = Date.now();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekData: Record<string, { fetched: number; sent: number; posted: number }> = {};

    // Initialize all days
    for (const d of dayNames) {
      weekData[d] = { fetched: 0, sent: 0, posted: 0 };
    }

    // Only look at last 7 days
    const sevenDaysAgo = now - 7 * 86400000;
    for (const a of allArticles) {
      if (a.fetchedAt < sevenDaysAgo) continue;
      const day = dayNames[new Date(a.fetchedAt).getDay()];
      weekData[day].fetched++;
      if (a.sentToTelegram) weekData[day].sent++;
      if (a.sentToFacebook) weekData[day].posted++;
    }

    // Return as ordered array (Mon-Sun)
    const orderedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return orderedDays.map((day) => ({
      day,
      ...weekData[day],
    }));
  },
});

// Analytics: overall stats with percentage changes
export const analyticsOverview = query({
  args: {},
  handler: async (ctx) => {
    const allArticles = await ctx.db.query("articles").collect();
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 86400000;
    const fourteenDaysAgo = now - 14 * 86400000;

    const thisWeek = allArticles.filter((a) => a.fetchedAt >= sevenDaysAgo);
    const lastWeek = allArticles.filter(
      (a) => a.fetchedAt >= fourteenDaysAgo && a.fetchedAt < sevenDaysAgo
    );

    const totalFetched = allArticles.length;
    const totalSent = allArticles.filter((a) => a.sentToTelegram).length;
    const totalPosted = allArticles.filter((a) => a.sentToFacebook).length;
    const successRate =
      totalFetched > 0
        ? Math.round(((totalSent + totalPosted) / (totalFetched * 2)) * 100)
        : 0;

    // Calculate percentage changes
    const thisWeekFetched = thisWeek.length;
    const lastWeekFetched = lastWeek.length;
    const fetchedChange =
      lastWeekFetched > 0
        ? Math.round(
            ((thisWeekFetched - lastWeekFetched) / lastWeekFetched) * 100
          )
        : 0;

    const thisWeekSent = thisWeek.filter((a) => a.sentToTelegram).length;
    const lastWeekSent = lastWeek.filter((a) => a.sentToTelegram).length;
    const sentChange =
      lastWeekSent > 0
        ? Math.round(((thisWeekSent - lastWeekSent) / lastWeekSent) * 100)
        : 0;

    const thisWeekPosted = thisWeek.filter((a) => a.sentToFacebook).length;
    const lastWeekPosted = lastWeek.filter((a) => a.sentToFacebook).length;
    const postedChange =
      lastWeekPosted > 0
        ? Math.round(
            ((thisWeekPosted - lastWeekPosted) / lastWeekPosted) * 100
          )
        : 0;

    return {
      totalFetched,
      totalSent,
      totalPosted,
      successRate,
      fetchedChange,
      sentChange,
      postedChange,
    };
  },
});

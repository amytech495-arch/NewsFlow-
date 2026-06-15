import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  // Fetched news articles
  articles: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    url: v.string(),
    imageUrl: v.optional(v.string()),
    source: v.string(), // "newsapi", "gnews", "newsdata", "currents", "thenewsapi"
    category: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
    fetchedAt: v.number(), // timestamp
    // AI rewrite
    rewrittenTitle: v.optional(v.string()),
    rewrittenContent: v.optional(v.string()),
    isRewritten: v.boolean(),
    // Posting status
    sentToTelegram: v.boolean(),
    telegramMessageId: v.optional(v.string()),
    telegramSentAt: v.optional(v.number()),
    sentToFacebook: v.boolean(),
    facebookPostId: v.optional(v.string()),
    facebookSentAt: v.optional(v.number()),
    // Dedup
    urlHash: v.string(),
  })
    .index("by_urlHash", ["urlHash"])
    .index("by_fetchedAt", ["fetchedAt"])
    .index("by_sentToTelegram", ["sentToTelegram"])
    .index("by_sentToFacebook", ["sentToFacebook"]),

  // Activity logs
  logs: defineTable({
    type: v.string(), // "fetch", "telegram", "facebook", "automation", "error", "ai"
    message: v.string(),
    status: v.string(), // "success", "error", "info", "warning"
    details: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),

  // App settings (single-row pattern)
  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  // Custom RSS sources
  customSources: defineTable({
    name: v.string(),
    url: v.string(),
    type: v.string(), // "rss"
    enabled: v.boolean(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
});

export default schema;

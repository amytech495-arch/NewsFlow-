import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const DEFAULT_WORLD_SOURCES = [
  { name: "BBC News - World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { name: "CNN - Top Stories", url: "http://rss.cnn.com/rss/edition.rss" },
  { name: "Reuters - World", url: "https://www.reutersagency.com/feed/?taxonomy=best-sectors&post_type=best" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { name: "The Guardian - World", url: "https://www.theguardian.com/world/rss" },
  { name: "AP News", url: "https://rsshub.app/apnews/topics/apf-topnews" },
  { name: "France 24", url: "https://www.france24.com/en/rss" },
  { name: "DW News", url: "https://rss.dw.com/rdf/rss-en-all" },
  { name: "NPR News", url: "https://feeds.npr.org/1001/rss.xml" },
  { name: "ABC News", url: "https://abcnews.go.com/abcnews/internationalheadlines" },
  { name: "Sky News", url: "https://feeds.skynews.com/feeds/rss/world.xml" },
  { name: "The New York Times - World", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml" },
  { name: "Washington Post - World", url: "https://feeds.washingtonpost.com/rss/world" },
  { name: "Bloomberg", url: "https://feeds.bloomberg.com/markets/news.rss" },
  { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
];

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("customSources")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    url: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("customSources", {
      name: args.name,
      url: args.url,
      type: args.type || "rss",
      enabled: true,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("customSources") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const toggle = mutation({
  args: { id: v.id("customSources"), enabled: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { enabled: args.enabled });
  },
});

/**
 * Seed default world news RSS sources if no sources exist yet.
 */
export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("customSources").first();
    if (existing) return { seeded: 0, message: "Sources already exist" };

    let count = 0;
    for (const source of DEFAULT_WORLD_SOURCES) {
      await ctx.db.insert("customSources", {
        name: source.name,
        url: source.url,
        type: "rss",
        enabled: true,
        createdAt: Date.now() + count, // slight offset for ordering
      });
      count++;
    }
    return { seeded: count, message: `Seeded ${count} default sources` };
  },
});

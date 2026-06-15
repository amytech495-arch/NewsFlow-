import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const VALID_PIN = "1966";

const KEY_NAMES = [
  "FACEBOOK_PAGE_TOKEN",
  "FACEBOOK_PAGE_ID",
  "TELEGRAM_TOKEN",
  "TELEGRAM_CHANNEL",
  "NEWSAPI_KEY",
  "GNEWS_KEY",
  "NEWSDATA_KEY",
  "CURRENTS_KEY",
  "THENEWSAPI_KEY",
  "GEMINI_API_KEY",
];

/**
 * List all API keys with masked values. Requires PIN.
 */
export const listKeys = query({
  args: { pin: v.string() },
  handler: async (ctx, args) => {
    if (args.pin !== VALID_PIN) {
      throw new Error("Invalid PIN");
    }

    const keys = [];
    for (const name of KEY_NAMES) {
      const doc = await ctx.db
        .query("settings")
        .withIndex("by_key", (q) => q.eq("key", `apikey_${name}`))
        .unique();

      keys.push({
        name,
        value: doc?.value ?? "",
        hasValue: !!doc?.value,
      });
    }
    return { keys };
  },
});

/**
 * Update a single API key. Requires PIN.
 */
export const updateKey = mutation({
  args: {
    pin: v.string(),
    keyName: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.pin !== VALID_PIN) {
      throw new Error("Invalid PIN");
    }

    const doc = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", `apikey_${args.keyName}`))
      .unique();

    if (doc) {
      await ctx.db.patch(doc._id, { value: args.value });
    } else {
      await ctx.db.insert("settings", {
        key: `apikey_${args.keyName}`,
        value: args.value,
      });
    }

    return { success: true };
  },
});

/**
 * Get a single key value (no PIN - for server-side use).
 */
export const getKey = query({
  args: { keyName: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", `apikey_${args.keyName}`))
      .unique();
    return doc?.value ?? null;
  },
});

/**
 * Get all stored API keys as a map (for pipeline/server-side use).
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const result: Record<string, string> = {};
    for (const name of KEY_NAMES) {
      const doc = await ctx.db
        .query("settings")
        .withIndex("by_key", (q) => q.eq("key", `apikey_${name}`))
        .unique();
      if (doc?.value) {
        result[name] = doc.value;
      }
    }
    return result;
  },
});

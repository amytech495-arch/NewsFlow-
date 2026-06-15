import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add a log entry
export const add = mutation({
  args: {
    type: v.string(),
    message: v.string(),
    status: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("logs", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// Get recent logs
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("logs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

// Count unread notifications (logs after the last read timestamp)
export const unreadCount = query({
  args: {
    lastReadAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const lastRead = args.lastReadAt ?? 0;
    const recentLogs = await ctx.db
      .query("logs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(100);
    const unread = recentLogs.filter((l) => l.timestamp > lastRead);
    return unread.length;
  },
});

import { query } from "./_generated/server";

declare const process: { env: Record<string, string | undefined> };

export const checkEnv = query({
  args: {},
  handler: async () => {
    return {
      hasGoogleId: !!process.env.AUTH_GOOGLE_ID,
      hasGoogleSecret: !!process.env.AUTH_GOOGLE_SECRET,
      hasSiteUrl: !!process.env.SITE_URL,
      hasConvexSiteUrl: !!process.env.CONVEX_SITE_URL,
      accessMode: process.env.VIKTOR_SPACES_ACCESS_MODE || "(not set)",
      googleIdPrefix: process.env.AUTH_GOOGLE_ID?.substring(0, 10) || "(missing)",
      siteUrl: process.env.SITE_URL || "(missing)",
      convexSiteUrl: process.env.CONVEX_SITE_URL || "(missing)",
    };
  },
});

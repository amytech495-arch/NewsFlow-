import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import type { AuthProviderConfig } from "@convex-dev/auth/server";
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { TestCredentials } from "./testAuth";
import {
  ViktorSpacesEmail,
  ViktorSpacesPasswordReset,
} from "./ViktorSpacesEmail";

declare const process: { env: Record<string, string | undefined> };

function decodePrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  if (key.includes("\n")) return key;
  if (key.startsWith("-----BEGIN")) {
    return key
      .replace("-----BEGIN PRIVATE KEY----- ", "-----BEGIN PRIVATE KEY-----\n")
      .replace(" -----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----")
      .split(" ")
      .join("\n");
  }
  try {
    return atob(key);
  } catch {
    return key;
  }
}

const authPrivateKey = process.env.AUTH_PRIVATE_KEY;
if (authPrivateKey) {
  process.env.AUTH_PRIVATE_KEY = decodePrivateKey(authPrivateKey);
}

const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;
if (jwtPrivateKey) {
  process.env.JWT_PRIVATE_KEY = decodePrivateKey(jwtPrivateKey);
}

// Google OAuth credentials — fallback for production where env vars may not be synced
const GOOGLE_CLIENT_ID =
  process.env.AUTH_GOOGLE_ID ||
  "64780511864-0jj6521v63bqn850c9lqrvr2sbu6grqp.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET =
  process.env.AUTH_GOOGLE_SECRET || "YOUR_KEY_HERE";

function configuredSpaceAuthProviders(): AuthProviderConfig[] {
  const providers: AuthProviderConfig[] = [
    Password({
      verify: ViktorSpacesEmail,
      reset: ViktorSpacesPasswordReset,
    }),
  ];

  // Add Google OAuth — always enabled
  providers.push(
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }) as unknown as AuthProviderConfig,
  );

  // Add test credentials on preview
  if (process.env.VIKTOR_SPACES_IS_PREVIEW === "true") {
    providers.push(TestCredentials);
  }

  return providers;
}

function configuredAuthProviders(): AuthProviderConfig[] {
  // Always use space auth providers — this app needs Password + Google OAuth
  return configuredSpaceAuthProviders();
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: configuredAuthProviders(),
});

export const currentUser = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

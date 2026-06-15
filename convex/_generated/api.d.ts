/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ViktorSpacesEmail from "../ViktorSpacesEmail.js";
import type * as apiKeys from "../apiKeys.js";
import type * as articles from "../articles.js";
import type * as auth from "../auth.js";
import type * as constants from "../constants.js";
import type * as customSources from "../customSources.js";
import type * as debug from "../debug.js";
import type * as http from "../http.js";
import type * as logs from "../logs.js";
import type * as pipeline from "../pipeline.js";
import type * as seedTestUser from "../seedTestUser.js";
import type * as testAuth from "../testAuth.js";
import type * as users from "../users.js";
import type * as viktorTools from "../viktorTools.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ViktorSpacesEmail: typeof ViktorSpacesEmail;
  apiKeys: typeof apiKeys;
  articles: typeof articles;
  auth: typeof auth;
  constants: typeof constants;
  customSources: typeof customSources;
  debug: typeof debug;
  http: typeof http;
  logs: typeof logs;
  pipeline: typeof pipeline;
  seedTestUser: typeof seedTestUser;
  testAuth: typeof testAuth;
  users: typeof users;
  viktorTools: typeof viktorTools;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

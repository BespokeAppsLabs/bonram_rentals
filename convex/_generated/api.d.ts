/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as files from "../files.js";
import type * as invoices from "../invoices.js";
import type * as products from "../products.js";
import type * as quotations from "../quotations.js";
import type * as recommendations from "../recommendations.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";
import type * as workos_admin from "../workos_admin.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  files: typeof files;
  invoices: typeof invoices;
  products: typeof products;
  quotations: typeof quotations;
  recommendations: typeof recommendations;
  seed: typeof seed;
  users: typeof users;
  workos_admin: typeof workos_admin;
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

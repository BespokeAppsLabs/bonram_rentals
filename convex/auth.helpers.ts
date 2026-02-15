import { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Get the authenticated user from the Convex context.
 * Returns null if not authenticated or user not found.
 */
export async function getAuthUser(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
        .first();
}

/**
 * Require an authenticated user with one of the given roles.
 * Throws if not authenticated or role doesn't match.
 */
export async function requireRole(
    ctx: QueryCtx | MutationCtx,
    allowedRoles: Array<"admin" | "staff" | "customer">
) {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Authentication required");
    if (!allowedRoles.includes(user.role)) {
        throw new Error("Insufficient permissions");
    }
    return user;
}

/**
 * Require admin or staff role.
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
    return requireRole(ctx, ["admin", "staff"]);
}

/**
 * Require admin-only role (super admin).
 */
export async function requireSuperAdmin(ctx: QueryCtx | MutationCtx) {
    return requireRole(ctx, ["admin"]);
}

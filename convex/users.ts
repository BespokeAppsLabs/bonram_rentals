import { query, mutation, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUser, requireAdmin, requireSuperAdmin } from "./auth.helpers";
import { Id } from "./_generated/dataModel";

// ============================================
// USER MANAGEMENT
// Admin staff management + invitations
// ============================================

/**
 * Check if an email belongs to a staff/admin user (public, no auth required).
 * Returns boolean only — no user data exposed.
 */
export const isStaffEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();
        return user !== null && (user.role === "admin" || user.role === "staff");
    },
});

/**
 * Get all users
 */
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        return await ctx.db.query("users").order("desc").collect();
    },
});

/**
 * Get user by token identifier
 */
export const getByToken = query({
    args: { tokenIdentifier: v.string() },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        return await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
            .first();
    },
});

/**
 * Get the current user from auth identity
 */
export const currentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .first();
    },
});

/**
 * Get the current user session (user data + permissions)
 */
export const getUserSession = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return {
                user: null,
                role: "guest",
                permissions: {
                    canAccessAdmin: false,
                    canManageStaff: false,
                },
                isAuthenticated: false,
            };
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .first();

        // If user logged in but record not created/synced yet, return minimal authed session
        if (!user) {
            return {
                user: null,
                role: "pending",
                permissions: {
                    canAccessAdmin: false,
                    canManageStaff: false,
                },
                isAuthenticated: true,
                tokenIdentifier: identity.tokenIdentifier,
            };
        }

        return {
            user,
            role: user.role,
            permissions: {
                canAccessAdmin: user.role === "admin" || user.role === "staff",
                canManageStaff: user.role === "admin",
            },
            isAuthenticated: true,
        };
    },
});

/**
 * Internal mutation to link or create user (called by sync action)
 */
export const linkUser = internalMutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
        tokenIdentifier: v.string(),
    },
    handler: async (ctx, args): Promise<Id<"users">> => {
        const userEmail = args.email.toLowerCase();

        // 1. Check if user exists by token
        const existingByToken = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
            .first();

        if (existingByToken !== null) {
            return existingByToken._id;
        }

        // 2. Link by email if "pending"
        const existingByEmail = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", userEmail))
            .first();

        if (existingByEmail && existingByEmail.tokenIdentifier === "pending") {
            await ctx.db.patch(existingByEmail._id, {
                tokenIdentifier: args.tokenIdentifier,
                name: args.name ?? existingByEmail.name,
            });
            return existingByEmail._id;
        }

        // 3. Check invitation or default to customer
        const invitation = await ctx.db
            .query("invitations")
            .withIndex("by_email", (q) => q.eq("email", userEmail))
            .first();

        const role = invitation?.role ?? "customer";

        if (existingByEmail) {
            // Found existing user but token wasn't pending (maybe guest account?)
            // We'll update it to have the auth token and role
            await ctx.db.patch(existingByEmail._id, {
                tokenIdentifier: args.tokenIdentifier,
                role: role !== "customer" ? role : existingByEmail.role,
            });
            return existingByEmail._id;
        }

        // 4. Create new user
        const userId = await ctx.db.insert("users", {
            name: args.name ?? "User",
            email: userEmail,
            tokenIdentifier: args.tokenIdentifier,
            role,
            createdAt: Date.now(),
        });

        if (invitation && invitation.status === "pending") {
            await ctx.db.patch(invitation._id, { status: "accepted" });
        }

        return userId;
    },
});

/**
 * Sync authenticated Clerk user into Convex database.
 * Clerk JWT includes email and name directly — no external API call needed.
 */
export const syncUserWithClerk = action({
    args: {},
    handler: async (ctx): Promise<Id<"users">> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const email = identity.email;
        const name = identity.name;

        if (!email) throw new Error("Could not determine user email from Clerk identity");

        return await ctx.runMutation(internal.users.linkUser, {
            email,
            name,
            tokenIdentifier: identity.tokenIdentifier,
        });
    },
});

/**
 * Get or create user from auth identity
 */
export const getOrCreateUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        tokenIdentifier: v.string(),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        // Check if user exists
        const existing = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
            .first();

        if (existing) {
            return existing;
        }

        // Check if this email has a pending invitation
        const invitation = await ctx.db
            .query("invitations")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        const role = invitation?.role ?? "customer";

        // Create user
        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            tokenIdentifier: args.tokenIdentifier,
            role,
            createdAt: Date.now(),
        });

        // Mark invitation as accepted if exists
        if (invitation && invitation.status === "pending") {
            await ctx.db.patch(invitation._id, { status: "accepted" });
        }

        return await ctx.db.get(userId);
    },
});

/**
 * Update user role (admin only)
 */
export const updateRole = mutation({
    args: {
        id: v.id("users"),
        role: v.union(v.literal("admin"), v.literal("staff"), v.literal("customer")),
    },
    handler: async (ctx, args) => {
        await requireSuperAdmin(ctx);
        const user = await ctx.db.get(args.id);
        if (!user) throw new Error("User not found");
        await ctx.db.patch(args.id, { role: args.role });
        return await ctx.db.get(args.id);
    },
});

/**
 * Create a staff invitation
 */
export const createInvitation = mutation({
    args: {
        email: v.string(),
        role: v.union(v.literal("admin"), v.literal("staff")),
        invitedBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        const inviter = await requireAdmin(ctx);
        const email = args.email.toLowerCase().trim();
        // Check for existing invitation
        const existing = await ctx.db
            .query("invitations")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (existing && existing.status === "pending") {
            throw new Error("An invitation for this email is already pending");
        }

        // Check if user already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (existingUser) {
            throw new Error("A user with this email already exists");
        }

        const invitationId = await ctx.db.insert("invitations", {
            email,
            role: args.role,
            status: "pending",
            invitedBy: inviter._id,
            createdAt: Date.now(),
        });

        return invitationId;
    },
});

/**
 * Get pending invitations
 */
export const getPendingInvitations = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        const invitations = await ctx.db
            .query("invitations")
            .order("desc")
            .collect();
        return invitations.filter((inv) => inv.status === "pending");
    },
});

/**
 * Get all invitations
 */
export const getAllInvitations = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        return await ctx.db.query("invitations").order("desc").collect();
    },
});

/**
 * Update user profile (customer self-service)
 */
export const updateProfile = mutation({
    args: {
        id: v.id("users"),
        name: v.optional(v.string()),
        phone: v.optional(v.string()),
        company: v.optional(v.string()),
        address: v.optional(v.string()),
        vatNumber: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const currentUser = await getAuthUser(ctx);
        if (!currentUser) throw new Error("Authentication required");
        if (currentUser.role !== "admin" && currentUser.role !== "staff" && currentUser._id !== id) {
            throw new Error("Insufficient permissions");
        }
        const user = await ctx.db.get(id);
        if (!user) throw new Error("User not found");

        // Filter out undefined values
        const patch: Record<string, string> = {};
        if (updates.name !== undefined) patch.name = updates.name;
        if (updates.phone !== undefined) patch.phone = updates.phone;
        if (updates.company !== undefined) patch.company = updates.company;
        if (updates.address !== undefined) patch.address = updates.address;
        if (updates.vatNumber !== undefined) patch.vatNumber = updates.vatNumber;

        await ctx.db.patch(id, patch);
        return await ctx.db.get(id);
    },
});


/**
 * One-time cleanup of duplicated anonymous users
 */
export const cleanupUsers = mutation({
    args: {},
    handler: async (ctx) => {
        await requireSuperAdmin(ctx);
        const users = await ctx.db.query("users").collect();
        const toDelete = users.filter(u => u.name === "Anonymous");
        for (const user of toDelete) {
            await ctx.db.delete(user._id);
        }
        return { deleted: toDelete.length };
    }
});

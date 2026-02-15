import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { WorkOS } from "@workos-inc/node";

/**
 * Provision the admin user in WorkOS and seed in Convex.
 * This is a workaround to avoid manual dashboard creation.
 * 
 * Usage: npx convex run workos_admin:provisionAdmin
 */
export const provisionAdmin = action({
    args: {},
    handler: async (ctx) => {
        const apiKey = process.env.WORKOS_API_KEY;
        if (!apiKey) {
            throw new Error("WORKOS_API_KEY not set in Convex environment");
        }

        const workos = new WorkOS(apiKey);
        const email = "lucas@bonram.co.za";
        const password = "AdminBespoke2026!";

        console.log(`[workos_admin] Provisioning user: ${email}`);

        try {
            // 1. Create user in WorkOS
            // Note: If user already exists, this might throw or handle it
            try {
                const user = await workos.userManagement.createUser({
                    email,
                    password,
                    firstName: "Lucas",
                    lastName: "Admin",
                    emailVerified: true,
                });
                console.log(`[workos_admin] Successfully created user in WorkOS: ${user.id}`);
            } catch (error: any) {
                // If user exists, we just continue to seeding
                if (error.message?.includes("already exists") || error.code === "email_already_exists") {
                    console.log(`[workos_admin] User already exists in WorkOS, skipping creation.`);
                } else {
                    throw error;
                }
            }

            // 2. Call the seed mutation to ensure record exists in Convex
            console.log(`[workos_admin] Syncing with Convex database...`);
            await ctx.runMutation(api.seed.seedAdmin, {});

            return {
                message: "Provisioning complete. You can now log in with the provided credentials.",
                email,
            };
        } catch (error: any) {
            console.error("[workos_admin] Error during provisioning:", error);
            throw new Error(`Provisioning failed: ${error.message}`);
        }
    },
});

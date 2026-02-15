"use client";

import { useConvexAuth, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useState } from "react";

/**
 * UserSync Component
 * 
 * Automatically synchronizes the authenticated WorkOS user with the Convex database.
 * This handles "auto-provisioning" by calling the `storeUser` mutation upon login.
 */
export function UserSync() {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const syncUser = useAction(api.users.syncUserWithWorkOS);
    const [synced, setSynced] = useState(false);

    useEffect(() => {
        // Only run sync if authenticated, not loading, and not already synced in this session
        if (isAuthenticated && !isLoading && !synced) {
            const performSync = async () => {
                try {
                    await syncUser();
                    setSynced(true);
                } catch (error) {
                    console.error("[UserSync] Failed to synchronize user:", error);
                }
            };
            performSync();
        }

        // Reset sync state if user logs out
        if (!isAuthenticated) {
            setSynced(false);
        }
    }, [isAuthenticated, isLoading, synced, syncUser]);

    return null; // This component doesn't render anything
}

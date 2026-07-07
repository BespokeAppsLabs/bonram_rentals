"use client";

import { useUser } from "@clerk/nextjs";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useRef } from "react";

export function UserSync() {
    const { isSignedIn, isLoaded, user } = useUser();
    const syncUser = useAction(api.users.syncUserWithClerk);
    const syncedUserId = useRef<string | null>(null);

    useEffect(() => {
        if (isSignedIn && isLoaded && user && syncedUserId.current !== user.id) {
            // Claim the sync slot synchronously so concurrent renders (before the
            // action resolves) cannot fire syncUser() more than once per user.
            syncedUserId.current = user.id;
            syncUser()
                .catch((error) => {
                    console.error("[UserSync] Failed to sync:", error);
                    // Reset on failure so a later render can retry.
                    if (syncedUserId.current === user.id) syncedUserId.current = null;
                });
        }
        if (!isSignedIn) syncedUserId.current = null;
    }, [isSignedIn, isLoaded, user, syncUser]);

    return null;
}

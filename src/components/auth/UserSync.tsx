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
            syncUser()
                .then(() => { syncedUserId.current = user.id; })
                .catch((error) => console.error("[UserSync] Failed to sync:", error));
        }
        if (!isSignedIn) syncedUserId.current = null;
    }, [isSignedIn, isLoaded, user, syncUser]);

    return null;
}

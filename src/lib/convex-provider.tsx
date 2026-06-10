"use client";

import { ReactNode, useState } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    const [convex] = useState(() => {
        const url = process.env.NEXT_PUBLIC_CONVEX_URL;
        if (!url) {
            // Fail fast in the browser, where a missing URL is a real misconfiguration.
            // During server prerender/build (no window) fall back so static export still
            // succeeds — a correctly-configured deployment inlines the real URL at build.
            if (typeof window !== "undefined") {
                throw new Error(
                    "NEXT_PUBLIC_CONVEX_URL is not set. Add it to your environment (.env.local / Vercel project env).",
                );
            }
            return new ConvexReactClient("https://placeholder.convex.cloud");
        }
        return new ConvexReactClient(url);
    });

    return (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            {children}
        </ConvexProviderWithClerk>
    );
}

export default ConvexClientProvider;

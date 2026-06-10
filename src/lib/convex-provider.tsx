"use client";

import { ReactNode, useState } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    const [convex] = useState(() => {
        const url = process.env.NEXT_PUBLIC_CONVEX_URL;
        if (!url) {
            throw new Error(
                "NEXT_PUBLIC_CONVEX_URL is not set. Add it to your environment (.env.local / Vercel project env).",
            );
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

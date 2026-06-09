"use client";

import { ReactNode, useState } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    const [convex] = useState(
        () =>
            new ConvexReactClient(
                process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud"
            )
    );

    return (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            {children}
        </ConvexProviderWithClerk>
    );
}

export default ConvexClientProvider;

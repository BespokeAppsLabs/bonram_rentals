"use client";

import { ReactNode, useCallback, useState } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth } from "convex/react";
import {
  AuthKitProvider,
  useAuth,
  useAccessToken,
} from "@workos-inc/authkit-nextjs/components";

// ============================================
// CONVEX CLIENT PROVIDER + WORKOS AUTHKIT
// Wraps the application with Convex + Auth
// ============================================

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [convex] = useState(() => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      // During build/prerendering, NEXT_PUBLIC_CONVEX_URL might be missing.
      // We provide a placeholder URL to avoid crashing the constructor,
      // as the client won't actually be used for networking during static generation.
      console.warn("NEXT_PUBLIC_CONVEX_URL is not defined. Using placeholder for build.");
      return new ConvexReactClient("https://placeholder.convex.cloud");
    }
    return new ConvexReactClient(convexUrl);
  });

  return (
    <AuthKitProvider>
      <ConvexProviderWithAuth client={convex} useAuth={useAuthFromAuthKit}>
        {children}
      </ConvexProviderWithAuth>
    </AuthKitProvider>
  );
}

function useAuthFromAuthKit() {
  const { user, loading: isLoading } = useAuth();
  const { getAccessToken, refresh } = useAccessToken();

  const isAuthenticated = !!user;

  const fetchAccessToken = useCallback(
    async ({
      forceRefreshToken,
    }: { forceRefreshToken?: boolean } = {}): Promise<string | null> => {
      if (!user) {
        return null;
      }
      try {
        if (forceRefreshToken) {
          console.log("[ConvexClientProvider] Forcing token refresh...");
          const token = await refresh();
          console.log("[ConvexClientProvider] Token refreshed:", token ? "Success" : "Failed");
          return token ?? null;
        }
        const token = await getAccessToken();
        if (!token) {
          console.log("[ConvexClientProvider] No access token found, session may be expired.");
        }
        return token ?? null;
      } catch (error) {
        console.error("Failed to get access token:", error);
        return null;
      }
    },
    [user, refresh, getAccessToken],
  );

  return {
    isLoading,
    isAuthenticated,
    fetchAccessToken,
  };
}

export default ConvexClientProvider;

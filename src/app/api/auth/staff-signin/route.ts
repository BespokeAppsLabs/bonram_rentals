import { redirect } from "next/navigation";
import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

/**
 * Staff sign-in API route.
 * Redirects directly to WorkOS AuthKit.
 */
export async function GET() {
    let authorizationUrl: string | null = null;
    try {
        authorizationUrl = await getSignInUrl();
    } catch (error) {
        console.error("[staff-signin] Error getting sign-in URL:", error);
    }

    if (authorizationUrl) {
        return redirect(authorizationUrl);
    }

    return redirect("/admin/sign-in");
}

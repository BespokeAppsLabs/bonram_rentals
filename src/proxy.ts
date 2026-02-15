import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware({
    // Use environment variables if present, otherwise fallback to the known production domain
    // This prevents the "You must provide a redirect URI" error if Vercel secrets are missing.
    redirectUri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI ||
        process.env.WORKOS_REDIRECT_URI ||
        "https://bonram-rentals-of36.vercel.app/callback",
    middlewareAuth: {
        enabled: true,
        unauthenticatedPaths: [
            "/",
            "/catalog",
            "/catalog/(.*)",
            "/quote",
            "/coming-soon",
            "/sign-in",
            "/sign-up",
            "/admin/sign-in",
            "/api/auth/staff-signin",
        ],
    },
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};

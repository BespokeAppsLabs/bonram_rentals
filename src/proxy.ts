import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware({
    redirectUri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI || process.env.WORKOS_REDIRECT_URI,
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

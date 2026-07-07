const issuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;
if (!issuerDomain) {
    throw new Error(
        "CLERK_JWT_ISSUER_DOMAIN is not set. Configure it in the Convex deployment environment (Clerk Dashboard → JWT Templates → Convex).",
    );
}

const authConfig = {
    providers: [
        {
            domain: issuerDomain,
            applicationID: "convex",
        },
    ],
};

export default authConfig;

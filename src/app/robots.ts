import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bonramrentals.co.za";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/account/"] },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

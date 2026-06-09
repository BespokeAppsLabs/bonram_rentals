import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bonramrentals.co.za";
  return ["", "/catalog", "/quote", "/services", "/about", "/contact", "/privacy", "/terms"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/catalog" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/catalog" || path === "/quote" ? 0.9 : 0.6,
  }));
}

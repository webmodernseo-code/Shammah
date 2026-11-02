import { SITE_URL } from "@/lib/seo";

export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/account-", "/checkout", "/view-cart", "/wish-list", "/typography-preview"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

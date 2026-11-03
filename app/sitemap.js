import { allProducts } from "@/data/products";
import { SITE_URL } from "@/lib/seo";

export default function sitemap() {
  const contentUpdatedAt = new Date("2026-11-03");
  const pages = [
    ["", 1, "weekly"], ["/shop-default", 0.9, "weekly"], ["/shop-collection-list", 0.8, "weekly"],
    ["/zones-livraison", 0.85, "monthly"], ["/about-us", 0.7, "monthly"], ["/contact-us", 0.7, "monthly"],
    ["/faq", 0.6, "monthly"], ["/shipping", 0.6, "monthly"], ["/return", 0.4, "yearly"],
    ["/blog-grid-01", 0.7, "weekly"], ["/privacy-policy", 0.2, "yearly"], ["/term-and-condition", 0.2, "yearly"],
  ].map(([path, priority, changeFrequency]) => ({ url: `${SITE_URL}${path}`, lastModified: contentUpdatedAt, priority, changeFrequency }));
  const seen = new Set();
  const products = allProducts.filter((p) => p?.id && !seen.has(p.id) && seen.add(p.id)).map((p) => ({
    url: `${SITE_URL}/product-detail/${p.id}`, lastModified: contentUpdatedAt, priority: 0.8, changeFrequency: "weekly",
  }));
  return [...pages, ...products];
}

import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import Breadcumb from "@/components/productDetails/Breadcumb";
import Description1 from "@/components/productDetails/Description1";
import Details1 from "@/components/productDetails/Details1";
import RecentlyViewedProducts from "@/components/productDetails/RecentlyViewedProducts";
import RecommendedProdtcts from "@/components/productDetails/RecommendedProdtcts";
import { allProducts } from "@/data/products";
import { fetchDatabaseProductById } from "@/lib/neon-products";
import { absoluteUrl } from "@/lib/seo";
import { notFound } from "next/navigation";
import React from "react";

export const dynamic = "force-dynamic";

async function getProduct(id) {
  const staticMatch = allProducts.find(
    (product) => String(product.id) === String(id)
  );
  if (staticMatch) return staticMatch;

  return await fetchDatabaseProductById(id);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    return {
      title: "Produit introuvable",
      robots: { index: false, follow: false },
    };
  }
  const title = `${product.title} — vêtement chrétien personnalisé`;
  const description =
    product.description ||
    `${product.title} par Shammah, création chrétienne imprimée à la demande. Livraison à Paris, Grenoble, partout en France et en Afrique de l’Ouest.`;
  const image = product.imgSrc || product.imageHover;
  return {
    title,
    description,
    alternates: { canonical: `/product-detail/${product.id}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/product-detail/${product.id}`,
      images: image && !image.startsWith("data:") ? [{ url: image, alt: product.title }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;

  const product = await getProduct(id);
  if (!product) notFound();

  const rawImage = product.imgSrc || product.imageHover;
  const schemaImage =
    rawImage && !rawImage.startsWith("data:")
      ? [absoluteUrl(rawImage)]
      : [absoluteUrl("/images/cls-categories/pod/t-shirts-jesus.jpg")];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: schemaImage,
    description:
      product.description ||
      `${product.title}, création chrétienne Shammah imprimée à la demande.`,
    sku: product.code || `SHAMMAH-${product.id}`,
    brand: { "@type": "Brand", name: "Shammah" },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product-detail/${product.id}`),
      priceCurrency: "EUR",
      price: product.price,
      availability:
        product.inStock === false
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <Breadcumb product={product} />
      <Details1 product={product} />
      <Description1 />
      <RecommendedProdtcts />
      <RecentlyViewedProducts />
      <Footer1 paddingBottom />
    </>
  );
}

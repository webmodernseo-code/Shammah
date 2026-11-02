import EditProductForm from "@/components/products/edit-product-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modifier un Produit | DivinExpress Admin",
  description: "Modification des caractéristiques, prix, visuels et déclinaisons de stock du produit.",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditProductForm productId={id} />;
}

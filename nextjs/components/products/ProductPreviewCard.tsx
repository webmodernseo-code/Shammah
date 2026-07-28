function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export function ProductPreviewCard({
  title,
  price,
  categoryName,
  imageUrl,
}: {
  title: string;
  price: number;
  categoryName: string;
  imageUrl: string | null;
}) {
  return (
    <div id="product-preview" className="mt-6 rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-semibold text-text-heading">Aperçu en direct</h4>
      <div className="mt-2 flex items-center gap-3">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-text-body">
            {title.charAt(0) || "?"}
          </span>
        )}
        <div>
          <div className="text-xs text-text-body">{categoryName}</div>
          <div className="text-sm font-medium text-text-heading">{title || "Titre de l'article"}</div>
          <div className="text-sm text-text-body">{formatEUR(price)}</div>
        </div>
      </div>
    </div>
  );
}

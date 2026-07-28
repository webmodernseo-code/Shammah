export type ProductRow = {
  id: string;
  title: string;
  basePrice: number;
  category: { name: string };
  thumbnailUrl: string | null;
  totalStock: number;
  variants: { id: string; colorName: string; colorHex: string; stock: { size: string; quantity: number }[] }[];
};

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export function ProductsTable({
  products,
  onEdit,
  onDelete,
}: {
  products: ProductRow[];
  onEdit: (product: ProductRow) => void;
  onDelete: (product: ProductRow) => void;
}) {
  return (
    <div id="products-table" className="rounded-card bg-card-bg shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs text-text-body">
            <th className="p-4 font-medium">Article</th>
            <th className="p-4 font-medium">Catégorie</th>
            <th className="p-4 font-medium">Stock</th>
            <th className="p-4 text-center font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} data-product-row className="border-b border-gray-50 last:border-0">
              <td className="flex items-center gap-3 p-4">
                {product.thumbnailUrl ? (
                  <img src={product.thumbnailUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-text-body">
                    {product.title.charAt(0)}
                  </span>
                )}
                <div>
                  <div className="font-medium text-text-heading">{product.title}</div>
                  <div className="text-xs text-text-body">{formatEUR(product.basePrice)}</div>
                </div>
              </td>
              <td className="p-4 text-text-body">{product.category.name}</td>
              <td className="p-4">
                <div className="space-y-1">
                  {product.variants.map((variant) =>
                    variant.stock.map((s) => (
                      <div key={variant.id + s.size} className="flex items-center gap-2 text-xs text-text-body">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: variant.colorHex }} />
                        {variant.colorName} ({s.size}): <span className="font-medium text-text-heading">{s.quantity}</span>
                      </div>
                    ))
                  )}
                </div>
                <span
                  data-stock-badge
                  className={
                    "mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium " +
                    (product.totalStock >= 3 ? "bg-status-green/10 text-status-green" : "bg-status-red/10 text-status-red")
                  }
                >
                  {product.totalStock >= 3 ? "OK" : "Stock Faible"}
                </span>
              </td>
              <td className="p-4 text-center">
                <button onClick={() => onEdit(product)} className="mr-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-text-heading hover:bg-gray-50">
                  Modifier
                </button>
                <button onClick={() => onDelete(product)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-status-red hover:bg-red-50">
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

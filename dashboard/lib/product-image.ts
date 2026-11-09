// Universal Product Image Resolver & Fallback Handler for Dashboard

export function getSafeProductImage(
  src?: string | null,
  code?: string | null,
  name?: string | null
): string {
  if (
    src &&
    (src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("blob:") ||
      src.startsWith("data:") ||
      src.startsWith("/"))
  ) {
    return src;
  }

  if (src && !src.startsWith("/")) {
    return `/images/products/${src}`;
  }

  const cleanCode = (code || "").toUpperCase();
  const cleanName = (name || "").toLowerCase();

  if (cleanCode.includes("SW") || cleanName.includes("sweat") || cleanName.includes("hoodie")) {
    return "/images/products/fashion/product-2.jpg";
  }
  if (cleanCode.includes("TS") || cleanName.includes("t-shirt")) {
    return "/images/products/fashion/t-shirt-1.jpg";
  }

  return "/images/products/fashion/product-1.jpg";
}

export function handleProductImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  code?: string | null,
  name?: string | null
) {
  const target = e.currentTarget;
  const cleanCode = (code || "").toUpperCase();
  const cleanName = (name || "").toLowerCase();

  if (cleanCode.includes("SW") || cleanName.includes("sweat") || cleanName.includes("hoodie")) {
    target.src = "/images/products/fashion/product-2.jpg";
  } else if (cleanCode.includes("TS") || cleanName.includes("t-shirt")) {
    target.src = "/images/products/fashion/t-shirt-1.jpg";
  } else {
    target.src = "/images/products/fashion/product-1.jpg";
  }
}

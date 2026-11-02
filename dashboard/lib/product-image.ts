// Universal Product Image Resolver & Fallback Handler for Dashboard

export function getSafeProductImage(
  src?: string | null,
  code?: string | null,
  name?: string | null
): string {
  if (src && (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("blob:") || src.startsWith("data:"))) {
    return src;
  }

  const cleanCode = (code || "").toUpperCase();
  const cleanName = (name || "").toLowerCase();
  const cleanSrc = (src || "").toLowerCase();

  if (cleanCode.includes("101") || cleanName.includes("costume") || cleanName.includes("veste") || cleanSrc.includes("costume")) {
    return "/images/products/fashion/product-1.jpg";
  }
  if (cleanCode.includes("201") || cleanName.includes("robe") || cleanName.includes("soie") || cleanSrc.includes("robe")) {
    return "/images/products/fashion/women-1.jpg";
  }
  if (cleanCode.includes("301") || cleanName.includes("hoodie") || cleanName.includes("coton") || cleanSrc.includes("hoodie")) {
    return "/images/products/fashion/product-2.jpg";
  }
  if (
    cleanCode.includes("102") ||
    cleanName.includes("chemise") ||
    cleanName.includes("oxford") ||
    cleanSrc.includes("chemise")
  ) {
    return "/images/products/fashion/product-3.jpg";
  }
  if (cleanCode.includes("202") || cleanName.includes("t-shirt") || cleanName.includes("pantalon") || cleanSrc.includes("t-shirt")) {
    return "/images/products/fashion/t-shirt-1.jpg";
  }

  if (src && src.startsWith("/")) {
    return src;
  }
  if (src && !src.startsWith("/")) {
    return `/images/products/${src}`;
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

  if (cleanCode.includes("101") || cleanName.includes("costume")) {
    target.src = "/images/products/fashion/product-1.jpg";
  } else if (cleanCode.includes("201") || cleanName.includes("robe")) {
    target.src = "/images/products/fashion/women-1.jpg";
  } else if (cleanCode.includes("301") || cleanName.includes("hoodie")) {
    target.src = "/images/products/fashion/product-2.jpg";
  } else if (cleanCode.includes("102") || cleanName.includes("chemise")) {
    target.src = "/images/products/fashion/product-3.jpg";
  } else {
    target.src = "/images/products/fashion/product-1.jpg";
  }
}

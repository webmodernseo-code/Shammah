"use client";

import { products28 } from "@/data/products";
import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useContextElement } from "@/context/Context";

export default function Products() {
  const {
    dbProducts = [],
    addToWishlist,
    isAddedtoWishlist,
    setQuickViewItem,
    addProductToCart,
    isAddedToCartProducts,
  } = useContextElement();

  // Fusionner les articles créés depuis le tableau de bord (en tête) avec les articles par défaut sans doublons
  const displayProducts = useMemo(() => {
    const seenTitles = new Set();
    const merged = [];

    for (const item of [...dbProducts, ...products28]) {
      const key = String(item.title || "").trim().toLowerCase();
      if (!key || seenTitles.has(key)) continue;
      seenTitles.add(key);
      merged.push(item);
    }

    return merged.slice(0, 12);
  }, [dbProducts]);

  return (
    <section className="flat-spacing-3 wow fadeInUp">
      <div className="container">
        <div className="flat-title">
          <h3 className="title fw-bold letter-0">Nos Créations</h3>
        </div>
        <div className="row g-3 g-md-4">
          {displayProducts.map((product) => {
            const isDataImg = Boolean(
              product.imgSrc?.startsWith("data:") ||
                product.imageHover?.startsWith("data:")
            );
            return (
              <div className="col-6 col-md-4 col-lg-3" key={product.id}>
                <div className="card-product">
                  <div className="card-product-wrapper rounded-0 asp-ratio-0">
                    <Link
                      href={`/product-detail/${product.id}`}
                      className="product-img"
                    >
                      <Image
                        className="img-product"
                        alt={product.title}
                        src={product.imgSrc}
                        width={513}
                        height={606}
                        unoptimized={isDataImg}
                        sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 25vw"
                      />
                      {product.imageHover && (
                        <Image
                          className="img-hover"
                          alt={product.title}
                          src={product.imageHover}
                          width={513}
                          height={606}
                          unoptimized={isDataImg}
                          sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 25vw"
                        />
                      )}
                    </Link>
                    <ul className="list-product-btn">
                      <li>
                        <a
                          href="#shoppingCart"
                          data-bs-toggle="offcanvas"
                          onClick={() => addProductToCart(product.id)}
                          className="hover-tooltip tooltip-left box-icon"
                        >
                          <span className="icon icon-cart2" />
                          <span className="tooltip">
                            {isAddedToCartProducts(product.id)
                              ? "Déjà au panier"
                              : "Ajouter au panier"}
                          </span>
                        </a>
                      </li>
                      <li
                        className={`wishlist ${
                          isAddedtoWishlist(product.id) ? "addwishlist" : ""
                        }`}
                      >
                        <a
                          onClick={() => addToWishlist(product.id)}
                          className="hover-tooltip tooltip-left box-icon"
                        >
                          <span
                            className={`icon ${
                              isAddedtoWishlist(product.id)
                                ? "icon-trash"
                                : "icon-heart2"
                            } `}
                          />
                          <span className="tooltip">
                            {isAddedtoWishlist(product.id)
                              ? "Retirer des favoris"
                              : "Ajouter aux favoris"}
                          </span>
                        </a>
                      </li>
                      <li>
                        <a
                          href="#quickView"
                          data-bs-toggle="modal"
                          onClick={() => setQuickViewItem(product)}
                          className="hover-tooltip tooltip-left box-icon quickview"
                        >
                          <span className="icon icon-view" />
                          <span className="tooltip">Aperçu rapide</span>
                        </a>
                      </li>
                    </ul>
                    {product.discount && (
                      <div className="on-sale-wrap flex-column type-2">
                        <span className="on-sale-item">
                          {Array.isArray(product.discount)
                            ? product.discount[0]
                            : product.discount}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="card-product-info">
                    <Link
                      href={`/product-detail/${product.id}`}
                      className="name-product link fw-medium text-md"
                    >
                      {product.title}
                    </Link>
                    <p className="price-wrap fw-medium">
                      <span className="price-new text-primary">
                        {Number(product.price).toFixed(2)} €
                      </span>{" "}
                      {product.oldPrice && (
                        <span className="price-old">
                          {Number(product.oldPrice).toFixed(2)} €
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

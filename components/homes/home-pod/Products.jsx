"use client";

import { products28 } from "@/data/products";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useContextElement } from "@/context/Context";

export default function Products() {
  const {
    addToWishlist,
    isAddedtoWishlist,
    setQuickViewItem,
    addProductToCart,
    isAddedToCartProducts,
  } = useContextElement();

  // Exactement 12 articles pour former 3 lignes de 4 colonnes
  const displayProducts = products28.slice(0, 12);

  return (
    <section className="flat-spacing-3 wow fadeInUp">
      <div className="container">
        <div className="flat-title">
          <h3 className="title fw-bold letter-0">Nos Créations</h3>
        </div>
        <div className="row g-3 g-md-4">
          {displayProducts.map((product) => (
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
                      sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 25vw"
                    />
                    {product.imageHover && (
                      <Image
                        className="img-hover"
                        alt={product.title}
                        src={product.imageHover}
                        width={513}
                        height={606}
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
                            ? "Already Added"
                            : "Add to Cart"}
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
                            ? "Remove Wishlist"
                            : "Add to Wishlist"}
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
                        <span className="tooltip">Quick View</span>
                      </a>
                    </li>
                  </ul>
                  {product.discount && (
                    <div className="on-sale-wrap flex-column type-2">
                      <span className="on-sale-item">
                        {Array.isArray(product.discount) ? product.discount[0] : product.discount}
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
                      {product.price.toFixed(2)} €
                    </span>{" "}
                    {product.oldPrice && (
                      <span className="price-old">
                        {product.oldPrice.toFixed(2)} €
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";
import { products29 } from "@/data/products";
import React, { useEffect, useMemo, useState } from "react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import Image from "next/image";
import { useContextElement } from "@/context/Context";

export default function Products2() {
  const {
    dbProducts = [],
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
    setQuickViewItem,
    addProductToCart,
    isAddedToCartProducts,
  } = useContextElement();

  const tabs = [
    { label: "Tendances", key: "What's Hot?" },
    { label: "Meilleures Ventes", key: "Best Sellers" },
    { label: "Nouveautés", key: "Just Arrivals" },
  ];
  const [activeTab, setActiveTab] = useState("What's Hot?");

  const allFeaturedPool = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const item of [...dbProducts, ...products29]) {
      const key = String(item.title || "").trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      list.push(item);
    }
    return list;
  }, [dbProducts]);

  const [filtered, setFiltered] = useState(allFeaturedPool);

  useEffect(() => {
    setFiltered(
      allFeaturedPool.filter(
        (elm) => !elm.tabFilterCategories || elm.tabFilterCategories.includes(activeTab)
      )
    );
  }, [activeTab, allFeaturedPool]);

  return (
    <div className="flat-spacing-24">
      <div className="container">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-end justify-content-between gap-3 mb-4">
          <div>
            <span className="text-xs text-uppercase tracking-wider text-muted fw-semibold d-inline-block mb-1">
              Prêt-à-porter &amp; Articles de Foi
            </span>
            <h2 className="title fw-bold text-dark letter-0 mb-1" style={{ fontSize: "2rem" }}>
              Créations en Vedette
            </h2>
            <p className="text-secondary text-sm mb-0">
              Des pièces d’exception confectionnées pour proclamer et porter la Parole avec élégance.
            </p>
          </div>
        </div>

        <div className="flat-animate-tab flat-controltab-nav overflow-visible">
          <div className="flat-title mb-4">
            <ul className="menu-tab-line style2 style-lg style-lg3">
              {tabs.map((tab, index) => (
                <li
                  key={index}
                  className="nav-tab-item"
                  role="presentation"
                  onClick={() => setActiveTab(tab.key)}
                >
                  <a
                    className={`tab-link ${
                      activeTab === tab.key ? "active" : ""
                    }`}
                  >
                    {tab.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="tab-content">
            <div className="tab-pane active show" id="hot" role="tabpanel">
              <Swiper
                dir="ltr"
                className="swiper tf-swiper"
                {...{
                  slidesPerView: 2,
                  spaceBetween: 12,
                  speed: 800,
                  loop: true,
                  autoplay: {
                    delay: 3800,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  },
                  observer: true,
                  observeParents: true,
                  navigation: {
                    clickable: true,
                    nextEl: ".nav-next-hot",
                    prevEl: ".nav-prev-hot",
                  },
                  pagination: { el: ".sw-pagination-hot", clickable: true },
                  breakpoints: {
                    768: {
                      slidesPerView: 3,
                      spaceBetween: 12,
                    },
                    1200: {
                      slidesPerView: 4,
                      spaceBetween: 24,
                    },
                  },
                }}
                modules={[Pagination, Navigation, Autoplay]}
              >
                {filtered.map((product) => {
                  const isDataImg = Boolean(
                    product.imgSrc?.startsWith("data:") ||
                      product.imageHover?.startsWith("data:")
                  );
                  return (
                    <SwiperSlide className="swiper-slide" key={product.id}>
                      <div className={`card-product ${product.style || ""}`}>
                        <div className="card-product-wrapper rounded-0 asp-ratio-0">
                          <Link
                            href={`/product-detail/${product.id}`}
                            className="product-img"
                          >
                            <Image
                              className="img-product lazyload"
                              data-src={product.imgSrc}
                              alt={product.title || "Produit Shammah"}
                              src={product.imgSrc}
                              width={513}
                              height={606}
                              unoptimized={isDataImg}
                              sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 25vw"
                            />
                            <Image
                              className="img-hover lazyload"
                              data-src={product.imageHover || product.imgSrc}
                              alt={product.title || "Produit Shammah"}
                              src={product.imageHover || product.imgSrc}
                              width={513}
                              height={606}
                              unoptimized={isDataImg}
                              sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 25vw"
                            />
                          </Link>
                          <ul className="list-product-btn">
                            <li>
                              <a
                                href="#shoppingCart"
                                onClick={() => addProductToCart(product.id)}
                                data-bs-toggle="offcanvas"
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
                            <li className="compare">
                              <a
                                href="#compare"
                                data-bs-toggle="modal"
                                aria-controls="compare"
                                onClick={() => addToCompareItem(product.id)}
                                className="hover-tooltip tooltip-left box-icon"
                              >
                                <span className="icon icon-compare" />
                                <span className="tooltip">
                                  {isAddedtoCompareItem(product.id)
                                    ? "Déjà comparé"
                                    : "Comparer"}
                                </span>
                              </a>
                            </li>
                          </ul>
                          {product.discount && (
                            <div className="on-sale-wrap">
                              <span className="on-sale-item">
                                {Array.isArray(product.discount)
                                  ? product.discount[0]
                                  : product.discount}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="card-product-info pb-0">
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
                    </SwiperSlide>
                  );
                })}
                <div className="d-flex d-xl-none sw-dot-default sw-pagination-hot justify-content-center" />
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

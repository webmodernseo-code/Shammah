"use client";
import { products29 } from "@/data/products";
import React, { useEffect, useState } from "react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import Image from "next/image";
import { useContextElement } from "@/context/Context";

export default function Products2() {
  const {
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
  const [filtered, setFiltered] = useState(products29);

  useEffect(() => {
    setFiltered(
      products29.filter((elm) => elm.tabFilterCategories?.includes(activeTab))
    );
  }, [activeTab]);

  return (
    <div className="flat-spacing-24">
      <div className="container">
        {/* En-tête de section ultra-premium avec titre inspirant et flèches vectorielles pures */}
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-end justify-content-between gap-3 mb-4">
          <div>
            <span className="text-xs text-uppercase tracking-wider text-muted fw-semibold d-inline-block mb-1">
              Prêt-à-porter & Articles de Foi
            </span>
            <h2 className="title fw-bold text-dark letter-0 mb-1" style={{ fontSize: "2rem" }}>
              Créations en Vedette
            </h2>
            <p className="text-secondary text-sm mb-0">
              Des pièces d’exception confectionnées pour proclamer et porter la Parole avec élégance.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div
              className="swiper-button-prev nav-swiper nav-prev-hot"
              aria-label="Précédent"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div
              className="swiper-button-next nav-swiper nav-next-hot"
              aria-label="Suivant"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 13L11 8L6 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
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
                {filtered.map((product) => (
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
                            alt="image-product"
                            src={product.imgSrc}
                            width={513}
                            height={606}
                            sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 25vw"
                          />
                          <Image
                            className="img-hover lazyload"
                            data-src={product.imageHover}
                            alt="image-product"
                            src={product.imageHover}
                            width={513}
                            height={606}
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
                                  ? "Already compared"
                                  : "Add to Compare"}
                              </span>
                            </a>
                          </li>
                        </ul>
                        {product.discount && (
                          <div className="on-sale-wrap">
                            <span className="on-sale-item">
                              {product.discount}
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
                            ${product.price.toFixed(2)}
                          </span>{" "}
                          {product.oldPrice && (
                            <span className="price-old">
                              ${product.oldPrice.toFixed(2)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
                <div className="d-flex d-xl-none sw-dot-default sw-pagination-hot justify-content-center" />
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

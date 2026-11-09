"use client";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import React, { useState } from "react";
import QuantitySelect from "../common/QuantitySelect";
import { products28 } from "@/data/products";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import ProgressBarComponent from "../common/Progressbar";

export default function CartModal() {
  const [openTool, setOpenTool] = useState(-1);
  const {
    cartProducts,
    setCartProducts,
    totalPrice,
    addProductToCart,
    isAddedToCartProducts,
    updateQuantity,
  } = useContextElement();

  const removeItem = (id) => {
    setCartProducts((pre) => [...pre.filter((elm) => elm.id != id)]);
  };

  const remainingForFreeShipping = Math.max(0, 60 - totalPrice);
  const shippingProgress = Math.min(100, Math.round((totalPrice / 60) * 100));

  return (
    <div
      className="offcanvas offcanvas-end popup-style-1 popup-shopping-cart"
      id="shoppingCart"
    >
      <div className="canvas-wrapper">
        <div className="popup-header">
          <span className="title">Mon panier</span>
          <span
            className="icon-close icon-close-popup"
            data-bs-dismiss="offcanvas"
          />
        </div>
        <div className="wrap">
          <div className="tf-mini-cart-threshold">
            <div className="text">
              {remainingForFreeShipping > 0 ? (
                <>
                  Plus que{" "}
                  <span className="fw-medium">
                    {remainingForFreeShipping.toFixed(2)} €
                  </span>{" "}
                  pour bénéficier de la{" "}
                  <span className="fw-medium">livraison offerte</span>
                </>
              ) : (
                <span className="fw-medium">
                  Vous bénéficiez de la livraison offerte !
                </span>
              )}
            </div>
            <div className="tf-progress-bar tf-progress-ship">
              <ProgressBarComponent max={shippingProgress || 15}>
                <i className="icon icon-car" />
              </ProgressBarComponent>
            </div>
          </div>
          <div className="tf-mini-cart-wrap">
            <div className="tf-mini-cart-main">
              <div className="tf-mini-cart-sroll">
                {cartProducts.length ? (
                  <div className="tf-mini-cart-items">
                    {cartProducts.map((product, i) => (
                      <div key={i} className="tf-mini-cart-item file-delete">
                        <div className="tf-mini-cart-image">
                          <Link href={`/product-detail/${product.id}`}>
                            <Image
                              className="lazyload"
                              alt={product.title || "Produit Shammah"}
                              src={product.imgSrc}
                              width={190}
                              height={252}
                            />
                          </Link>
                        </div>
                        <div className="tf-mini-cart-info">
                          <div className="d-flex justify-content-between">
                            <Link
                              className="title link text-md fw-medium"
                              href={`/product-detail/${product.id}`}
                            >
                              {product.title}
                            </Link>
                            <i
                              className="icon icon-close remove fs-12"
                              onClick={() => removeItem(product.id)}
                            />
                          </div>
                          <div className="d-flex gap-10">
                            <div className="text-xs">
                              {product.selectedColor || "Standard"} /{" "}
                              {product.selectedSize || "M"}
                            </div>
                          </div>
                          <p className="price-wrap text-sm fw-medium">
                            <span className="new-price text-primary">
                              {(product.price * product.quantity).toFixed(2)} €
                            </span>{" "}
                            {product.oldPrice && (
                              <span className="old-price text-decoration-line-through text-dark-1">
                                {(product.oldPrice * product.quantity).toFixed(
                                  2
                                )}{" "}
                                €
                              </span>
                            )}
                          </p>
                          <QuantitySelect
                            styleClass="small"
                            quantity={product.quantity}
                            setQuantity={(qty) => {
                              updateQuantity(product.id, qty);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4">
                    Votre panier est actuellement vide. Découvrez nos créations
                    pour commencer vos achats.{" "}
                    <Link
                      className="tf-btn btn-dark2 animate-btn mt-3"
                      href="/shop-default"
                    >
                      Explorer la collection
                    </Link>
                  </div>
                )}
                <div className="tf-minicart-recommendations">
                  <div className="tf-minicart-recommendations-heading d-flex justify-content-between align-items-end">
                    <div className="tf-minicart-recommendations-title text-md fw-medium">
                      Vous aimerez aussi
                    </div>
                  </div>
                  <Swiper
                    dir="ltr"
                    className="swiper tf-swiper"
                    {...{
                      slidesPerView: 1,
                      spaceBetween: 10,
                      speed: 800,
                      observer: true,
                      observeParents: true,
                      slidesPerGroup: 1,
                    }}
                  >
                    {products28.slice(0, 4).map((product, i) => (
                      <SwiperSlide key={i} className="swiper-slide">
                        <div className="tf-mini-cart-item line radius-16">
                          <div className="tf-mini-cart-image">
                            <Link href={`/product-detail/${product.id}`}>
                              <Image
                                className="lazyload"
                                alt={product.title || "Produit Shammah"}
                                src={product.imgSrc}
                                width={684}
                                height={972}
                              />
                            </Link>
                          </div>
                          <div className="tf-mini-cart-info justify-content-center">
                            <Link
                              className="title link text-md fw-medium"
                              href={`/product-detail/${product.id}`}
                            >
                              {product.title}
                            </Link>
                            <p className="price-wrap text-sm fw-medium">
                              <span className="new-price text-primary">
                                {product.price.toFixed(2)} €
                              </span>{" "}
                              {product.oldPrice && (
                                <span className="old-price text-decoration-line-through text-dark-1">
                                  {product.oldPrice.toFixed(2)} €
                                </span>
                              )}
                            </p>
                            <a
                              className="tf-btn animate-btn d-inline-flex bg-dark-2 w-max-content"
                              onClick={() => addProductToCart(product.id)}
                            >
                              {isAddedToCartProducts(product.id)
                                ? "Déjà au panier"
                                : "Ajouter au panier"}
                            </a>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            </div>
            <div className="tf-mini-cart-bottom">
              <div className="tf-mini-cart-tool">
                <div
                  className="tf-mini-cart-tool-btn btn-add-note"
                  onClick={() => setOpenTool((pre) => (pre == 2 ? -1 : 2))}
                >
                  <i className="icon icon-note" />
                  <div className="text-xxs">Note</div>
                </div>
              </div>
              <div className="tf-mini-cart-bottom-wrap">
                <div className="tf-cart-totals-discounts">
                  <div className="tf-cart-total text-xl fw-medium">Total :</div>
                  <div className="tf-totals-total-value text-xl fw-medium">
                    {totalPrice.toFixed(2)} €
                  </div>
                </div>
                <div className="tf-cart-tax text-sm opacity-8">
                  Frais de livraison calculés à l&apos;étape suivante (offerts
                  dès 60 €)
                </div>
                <div className="tf-mini-cart-view-checkout">
                  <Link
                    href={`/view-cart`}
                    className="tf-btn animate-btn d-inline-flex bg-dark-2 w-100 justify-content-center"
                  >
                    Voir mon panier
                  </Link>
                  <Link
                    href={`/checkout`}
                    className="tf-btn btn-out-line-dark2 w-100 justify-content-center"
                  >
                    <span>Commander</span>
                  </Link>
                </div>
              </div>
            </div>
            <div
              className={`tf-mini-cart-tool-openable add-note  ${
                openTool == 2 ? "open" : ""
              }`}
            >
              <div
                className="overplay tf-mini-cart-tool-close"
                onClick={() => setOpenTool(-1)}
              />
              <form action="#" className="tf-mini-cart-tool-content">
                <label
                  htmlFor="Cart-note"
                  className="tf-mini-cart-tool-text text-sm fw-medium"
                >
                  Note pour votre commande
                </label>
                <textarea
                  name="note"
                  id="Cart-note"
                  placeholder="Instructions de livraison ou remarque particulière..."
                  defaultValue={""}
                />
                <div className="tf-cart-tool-btns">
                  <button
                    className="subscribe-button tf-btn animate-btn d-inline-flex bg-dark-2 w-100"
                    type="button"
                    onClick={() => setOpenTool(-1)}
                  >
                    Enregistrer
                  </button>
                  <div
                    className="tf-btn btn-out-line-dark2 w-100 tf-mini-cart-tool-close"
                    onClick={() => setOpenTool(-1)}
                  >
                    Fermer
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

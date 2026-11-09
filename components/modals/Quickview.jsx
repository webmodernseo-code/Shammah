"use client";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import React, { useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import QuantitySelect from "../common/QuantitySelect";
import Image from "next/image";

export default function Quickview() {
  const [quantity, setQuantity] = useState(1);
  const {
    quickViewItem,
    addProductToCart,
    isAddedToCartProducts,
    cartProducts,
    updateQuantity,
  } = useContextElement();

  const hoverImg =
    quickViewItem.imgHover ||
    quickViewItem.imageHover ||
    quickViewItem.imgSrc;

  return (
    <div className="modal fade modalCentered modal-quick-view" id="quickView">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <span
            className="icon-close icon-close-popup"
            data-bs-dismiss="modal"
          />
          <div className="tf-product-media-wrap">
            <Swiper
              dir="ltr"
              className="swiper tf-single-slide"
              modules={[Navigation]}
              navigation={{
                prevEl: ".qvsnp1",
                nextEl: ".qvsnn1",
              }}
            >
              <SwiperSlide className="swiper-slide">
                <div className="item">
                  <Image
                    className="lazyload"
                    alt={quickViewItem.title || "Produit Shammah"}
                    src={quickViewItem.imgSrc}
                    width={513}
                    height={729}
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <div className="item">
                  <Image
                    className="lazyload"
                    alt={quickViewItem.title || "Produit Shammah"}
                    src={hoverImg}
                    width={513}
                    height={729}
                  />
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
          <div className="tf-product-info-wrap">
            <div className="tf-product-info-inner">
              <div className="tf-product-heading">
                <h6 className="product-name">
                  <Link
                    href={`/product-detail/${quickViewItem.id}`}
                    className="link"
                  >
                    {quickViewItem.title}
                  </Link>
                </h6>
                <div className="product-price">
                  <h6 className="price-new price-on-sale">
                    {quickViewItem.price.toFixed(2)} €
                  </h6>
                  {quickViewItem.oldPrice && (
                    <h6 className="price-old">
                      {quickViewItem.oldPrice.toFixed(2)} €
                    </h6>
                  )}
                </div>
                <p className="text">
                  Création officielle Shammah confectionnée avec soin dans des matériaux
                  sélectionnés pour leur confort, leur tenue et leur durabilité au quotidien.
                </p>
              </div>

              <div className="tf-product-total-quantity">
                <div className="group-btn">
                  <QuantitySelect
                    quantity={
                      isAddedToCartProducts(quickViewItem.id)
                        ? cartProducts.filter(
                            (elm) => elm.id == quickViewItem.id
                          )[0].quantity
                        : quantity
                    }
                    setQuantity={(qty) => {
                      if (isAddedToCartProducts(quickViewItem.id)) {
                        updateQuantity(quickViewItem.id, qty);
                      } else {
                        setQuantity(qty);
                      }
                    }}
                  />
                  <a
                    href="#shoppingCart"
                    data-bs-toggle="offcanvas"
                    className="tf-btn hover-primary"
                    onClick={() => addProductToCart(quickViewItem.id, quantity)}
                  >
                    {isAddedToCartProducts(quickViewItem.id)
                      ? "Déjà au panier"
                      : "Ajouter au panier"}
                  </a>
                </div>
                <Link
                  href={`/checkout`}
                  className="tf-btn w-100 animate-btn paypal btn-primary"
                >
                  Commander maintenant
                </Link>
              </div>
              <Link
                href={`/product-detail/${quickViewItem.id}`}
                className="view-details link"
              >
                Voir tous les détails <i className="icon icon-arrow-right" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

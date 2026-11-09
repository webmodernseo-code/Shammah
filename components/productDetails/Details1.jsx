"use client";
import React, { useState } from "react";
import Slider1 from "./sliders/Slider1";
import BoughtTogether from "./BoughtTogether";
import Link from "next/link";
import Image from "next/image";
import ColorSelect1 from "./ColorSelect1";
import SizePicker from "./SizeSelect";
import { useContextElement } from "@/context/Context";
import QuantitySelect from "../common/QuantitySelect";
import StickyProducts from "./StickyProducts";
import ProductHeading from "./ProductHeading";
import PaymentMethods from "@/components/common/PaymentMethods";

export default function Details1({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [activeColor, setActiveColor] = useState("Black");
  const [activeSize, setActiveSize] = useState("S");

  const variantPrices =
    product?.variantPrices && Array.isArray(product.variantPrices)
      ? product.variantPrices
      : null;

  const basePrice = Number(product?.price ?? 0) || 0;
  const baseOldPrice =
    product?.oldPrice == null ? null : Number(product.oldPrice) || 0;
  const matchedVariant = variantPrices?.find(
    (v) => v?.color === activeColor && v?.size === activeSize,
  );

  const price = matchedVariant
    ? Number(matchedVariant.price ?? basePrice) || basePrice
    : basePrice;
  const oldPrice = matchedVariant
    ? matchedVariant.oldPrice == null
      ? baseOldPrice
      : Number(matchedVariant.oldPrice) || baseOldPrice
    : baseOldPrice;
  const {
    addProductToCart,
    isAddedToCartProducts,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
    cartProducts,
    updateQuantity,
  } = useContextElement();
  return (
    <section className="flat-single-product">
      <div className="tf-main-product section-image-zoom">
        <div className="container">
          <div className="row">
            {/* Product Images */}
            <div className="col-md-6">
              <div className="tf-product-media-wrap sticky-top">
                <div className="product-thumbs-slider">
                  <Slider1
                    product={product}
                    activeColor={activeColor}
                    firstItem={product.imgSrc}
                    setActiveColor={setActiveColor}
                  />
                </div>
              </div>
            </div>
            {/* /Product Images */}
            {/* Product Info */}
            <div className="col-md-6">
              <div className="tf-zoom-main" />
              <div className="tf-product-info-wrap position-relative">
                <div className="tf-product-info-list other-image-zoom">
                  <ProductHeading
                    product={product}
                    price={price}
                    oldPrice={oldPrice}
                    inStock={product?.inStock}
                  />
                  <div className="tf-product-variant">
                    <ColorSelect1
                      setActiveColor={setActiveColor}
                      activeColor={activeColor}
                      selectedPrice={price}
                    />
                    <SizePicker
                      activeSize={activeSize}
                      setActiveSize={setActiveSize}
                    />
                  </div>
                  <div className="tf-product-total-quantity">
                    <div className="group-btn">
                      <QuantitySelect
                        quantity={
                          isAddedToCartProducts(product.id)
                            ? cartProducts.filter(
                              (elm) => elm.id == product.id,
                            )[0].quantity
                            : quantity
                        }
                        setQuantity={(qty) => {
                          if (isAddedToCartProducts(product.id)) {
                            updateQuantity(product.id, qty);
                          } else {
                            setQuantity(qty);
                          }
                        }}
                      />
                      <a
                        href="#shoppingCart"
                        data-bs-toggle="offcanvas"
                        onClick={() => addProductToCart(product.id, quantity)}
                        className="tf-btn hover-primary btn-add-to-cart"
                      >
                        {isAddedToCartProducts(product.id)
                          ? "Already Added"
                          : "Add to cart"}
                      </a>
                    </div>
                    <a
                      href="#"
                      className="tf-btn btn-primary w-100 animate-btn"
                    >
                      Buy it now
                    </a>
                    <Link
                      href={`/checkout`}
                      className="more-choose-payment link"
                    >
                      More payment options
                    </Link>
                  </div>
                  <div className="tf-product-extra-link">
                    <a
                      onClick={() => addToWishlist(product.id)}
                      className={`product-extra-icon link btn-add-wishlist ${isAddedtoWishlist(product.id) ? "added-wishlist" : ""
                        } `}
                    >
                      <i className="icon add icon-heart" />
                      <span className="add">Add to wishlist</span>
                      <i className="icon added icon-trash" />
                      <span className="added">Remove from wishlist</span>
                    </a>
                    <a
                      href="#compare"
                      data-bs-toggle="modal"
                      onClick={() => addToCompareItem(product.id)}
                      className="product-extra-icon link"
                    >
                      <i className="icon icon-compare2" />
                      {isAddedtoCompareItem(product.id)
                        ? "Already compared"
                        : "Add to Compare"}
                    </a>
                    <a
                      href="#askQuestion"
                      data-bs-toggle="modal"
                      className="product-extra-icon link"
                    >
                      <i className="icon icon-ask" />
                      Ask a question
                    </a>
                    <a
                      href="#shareSocial"
                      data-bs-toggle="modal"
                      className="product-extra-icon link"
                    >
                      <i className="icon icon-share" />
                      Share
                    </a>
                  </div>
                  <ul className="tf-product-cate-sku text-md">
                    <li className="item-cate-sku">
                      <span className="label">SKU:</span>
                      <span className="value">AD1FSSE0YR</span>
                    </li>
                    <li className="item-cate-sku">
                      <span className="label">Categories:</span>
                      <span className="value">Clothes, Top</span>
                    </li>
                  </ul>

                  <div className="tf-product-trust-seal text-center">
                    <p className="text-md text-dark-2 text-seal fw-medium">
                      Paiement 100 % sécurisé :
                    </p>
                    <PaymentMethods className="justify-content-center mt-2" />
                  </div>
                  <div className="tf-product-delivery-return">
                    <div className="product-delivery">
                      <div className="icon icon-car2" />
                      <p className="text-md">
                        Estimated delivery time:
                        <span className="fw-medium">
                          3-5 days international
                        </span>
                      </p>
                    </div>
                    <div className="product-delivery">
                      <div className="icon icon-shipping3" />
                      <p className="text-md">
                        Free shipping on
                        <span className="fw-medium">all orders over $150</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="tf-product-fbt">
                  <div className="title text-xl fw-medium">
                    Frequently Bought Together
                  </div>
                  <BoughtTogether />
                </div>
              </div>
            </div>
            {/* /Product Info */}
          </div>
        </div>
      </div>
      <StickyProducts />
    </section>
  );
}

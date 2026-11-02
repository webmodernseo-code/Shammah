import { products1 } from "@/data/products";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import ProgressBarComponent from "../common/Progressbar";

export default function Cartmodal2() {
  return (
    <div
      className="offcanvas offcanvas-end popup-style-1  popup-shopping-cart style-empty"
      id="shoppingCart"
    >
      <div className="canvas-wrapper">
        <div className="popup-header">
          <span className="title">Shopping cart</span>
          <span
            className="icon-close icon-close-popup"
            data-bs-dismiss="offcanvas"
          />
        </div>
        <div className="wrap">
          <div className="tf-mini-cart-threshold">
            <div className="text">
              Spend <span className="fw-medium">$100</span> more to get{" "}
              <span className="fw-medium">Free Shipping</span>
            </div>
            <div className="tf-progress-bar tf-progress-ship">
              <ProgressBarComponent max={75}>
                <i className="icon icon-car" />
              </ProgressBarComponent>
            </div>
          </div>
          <div className="cart-empty-wrap">
            <Image
              alt=""
              src="/images/section/cart-empty.png"
              width={227}
              height={227}
            />
            <p className="display-sm">Your cart is empty</p>
            <Link
              href={`/shop-default`}
              className="tf-btn animate-btn d-inline-flex bg-dark-2 w-max-content"
            >
              Return to Shop
            </Link>
          </div>
          <div className="tf-mini-cart-wrap">
            <div className="tf-mini-cart-main">
              <div className="tf-mini-cart-sroll">
                <div className="tf-minicart-recommendations">
                  <div className="tf-minicart-recommendations-heading">
                    <div className="tf-minicart-recommendations-title text-xl-2 fw-medium">
                      You may also like
                    </div>
                  </div>
                  <div className="tf-mini-cart-items">
                    {products1.slice(0, 3).map((product, i) => (
                      <div key={i} className="tf-mini-cart-item p-0 radius-16">
                        <div className="tf-mini-cart-image">
                          <Link href={`/product-detail/${product.id}`}>
                            <Image
                              className="lazyload"
                              alt="img-product"
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
                            <span
                              className={`new-price ${
                                product.oldPrice ? "text-primary" : ""
                              } `}
                            >
                              ${product.price.toFixed(2)}
                            </span>{" "}
                            {product.oldPrice && (
                              <span className="old-price text-decoration-line-through text-dark-1">
                                ${product.oldPrice?.toFixed(2)}
                              </span>
                            )}
                          </p>
                          <Link
                            href={`/view-cart`}
                            className="tf-btn animate-btn d-inline-flex bg-dark-2 w-max-content"
                          >
                            Add to cart
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

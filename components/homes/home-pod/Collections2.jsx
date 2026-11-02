import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Collections2() {
  return (
    <div className="flat-spacing-3">
      <div className="container">
        <div className="grid-cls grid-cls-v5 wow fadeInUp">
          <div className="item1 wg-cls rounded-0 style-abs type-2 hover-img">
            <Link href="/shop-default?category=homme" className="image img-style d-block">
              <Image
                alt="Homme"
                className="lazyloaded"
                src="/images/cls-categories/fashion/men.jpg"
                width={696}
                height={696}
              />
            </Link>
            <div className="cls-btn text-center">
              <Link
                href="/shop-default?category=homme"
                className="tf-btn btn-cls rounded-0 hover-dark btn-white hover-icon-2"
              >
                Homme
                <i className="icon icon-arrow1-top-left" />
              </Link>
            </div>
          </div>
          <div className="item2 wg-cls rounded-0 style-abs type-2 hover-img">
            <Link href="/shop-default?category=femme" className="image img-style d-block">
              <Image
                alt="Femme"
                className="lazyloaded"
                src="/images/cls-categories/fashion/women.jpg"
                width={696}
                height={696}
              />
            </Link>
            <div className="cls-btn text-center">
              <Link
                href="/shop-default?category=femme"
                className="tf-btn btn-cls rounded-0 hover-dark btn-white hover-icon-2"
              >
                Femme
                <i className="icon icon-arrow1-top-left" />
              </Link>
            </div>
          </div>
          <div className="item3 wg-cls rounded-0 style-abs type-2 hover-img">
            <Link href="/shop-default?category=enfant" className="image img-style d-block">
              <Image
                alt="Enfant"
                className="lazyloaded"
                src="/images/cls-categories/fashion/kid.jpg"
                width={696}
                height={696}
              />
            </Link>
            <div className="cls-btn text-center">
              <Link
                href="/shop-default?category=enfant"
                className="tf-btn btn-cls rounded-0 hover-dark btn-white hover-icon-2"
              >
                Enfant
                <i className="icon icon-arrow1-top-left" />
              </Link>
            </div>
          </div>
          <div className="item4 wg-cls rounded-0 style-abs type-2 hover-img">
            <Link href="/shop-default?category=gadgets" className="image img-style d-block">
              <Image
                alt="Gadgets & Cadeaux"
                className="lazyloaded"
                src="/images/cls-categories/grid-cls/pod-gift.jpg"
                width={696}
                height={696}
              />
            </Link>
            <div className="cls-btn text-center">
              <Link
                href="/shop-default?category=gadgets"
                className="tf-btn btn-cls rounded-0 hover-dark btn-white hover-icon-2"
              >
                Gadgets & Cadeaux
                <i className="icon icon-arrow1-top-left" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

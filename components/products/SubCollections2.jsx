import { categories14 } from "@/data/collections";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function SubCollections2() {
  return (
    <section className="flat-spacing-24">
      <div className="container">
        <div className="flat-wrap-cls tf-grid-layout tf-col-2 xl-col-3">
          {categories14.map((category) => {
            const targetUrl = category.slug
              ? `/shop-default?category=${category.slug}`
              : "/shop-default";
            return (
              <div
                className="wg-cls style-abs2 style-lg hover-img"
                key={category.id}
              >
                <Link href={targetUrl} className="image-wrap relative">
                  <div className="image img-style">
                    <Image
                      src={category.image}
                      alt={`Collection ${category.name} Shammah`}
                      className="lazyload"
                      width={696}
                      height={696}
                    />
                  </div>
                  <div className="cls-btn text-center">
                    <span className="tf-btn btn-white hover-dark">
                      Découvrir la collection
                    </span>
                  </div>
                  <span className="tf-overlay" />
                </Link>
                <div className="cls-content text-center">
                  <Link
                    href={targetUrl}
                    className="text-type text-xl-2 fw-medium link"
                  >
                    {category.name}
                  </Link>
                  <span className="count-item body-text-2 text-main">
                    {category.items}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

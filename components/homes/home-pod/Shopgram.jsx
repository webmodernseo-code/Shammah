"use client";
import { products30 } from "@/data/products";
import React from "react";
import { Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import Image from "next/image";
export default function Shopgram() {
  return (
    <section className="flat-spacing pb-0">
      <div className="container">
        <div className="flat-title wow fadeInUp">
          <h4 className="title letter-0">La Communauté @Shammah</h4>
        </div>
        <Swiper
          dir="ltr"
          className="swiper tf-swiper wow fadeInUp"
          {...{
            slidesPerView: 2,
            spaceBetween: 10,
            speed: 800,
            loop: true,
            autoplay: {
              delay: 3200,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            },
            observer: true,
            observeParents: true,
            pagination: { el: ".sw-pagination-gallery", clickable: true },
            breakpoints: {
              768: { slidesPerView: 3 },
              1200: { slidesPerView: 5 },
            },
          }}
          modules={[Pagination, Autoplay]}
        >
          {products30.map((item) => (
            <SwiperSlide key={item.id} className="swiper-slide">
              <div className="gallery-item rounded-0 hover-img hover-overlay">
                <div className="image img-style">
                  <Image
                    src={item.imgSrc}
                    alt={`Gallery item ${item.id}`}
                    className="lazyload"
                    width={420}
                    height={420}
                  />
                </div>
                <Link
                  href={`/product-detail/${item.id}`}
                  className="box-icon hover-tooltip"
                >
                  <span className="icon icon-cart2" />
                  <span className="tooltip">Voir le produit</span>
                </Link>
              </div>
            </SwiperSlide>
          ))}
          <span className="d-flex d-xl-none sw-dot-default sw-pagination-gallery justify-content-center" />
        </Swiper>
      </div>
    </section>
  );
}

"use client";
import { products37 } from "@/data/products";
import React from "react";
import ProductCard10 from "../productCards/ProductCard10";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

export default function RecommendedProdtcts() {
  return (
    <section>
      <div className="container">
        <div className="flat-title wow fadeInUp">
          <h4 className="title">Vous aimerez aussi</h4>
        </div>
        <div className="hover-sw-nav hover-sw-2 wow fadeInUp">
          <Swiper
            dir="ltr"
            className="swiper tf-swiper wrap-sw-over"
            {...{
              slidesPerView: 2,
              spaceBetween: 12,
              speed: 800,
              loop: true,
              autoplay: {
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              },
              observer: true,
              observeParents: true,
              navigation: {
                clickable: true,
                nextEl: ".nav-next-bought",
                prevEl: ".nav-prev-bought",
              },
              pagination: { el: ".sw-pagination-bought", clickable: true },
              breakpoints: {
                768: { slidesPerView: 3, spaceBetween: 12 },
                1200: { slidesPerView: 4, spaceBetween: 24 },
              },
            }}
            modules={[Pagination, Navigation, Autoplay]}
          >
            {products37.map((product) => (
              <SwiperSlide className="swiper-slide" key={product.id}>
                <ProductCard10 product={product} />
              </SwiperSlide>
            ))}
            <div className="d-flex d-xl-none sw-dot-default sw-pagination-bought justify-content-center" />
          </Swiper>
          <div className="d-none d-xl-flex swiper-button-next nav-swiper nav-next-bought" />
          <div className="d-none d-xl-flex swiper-button-prev nav-swiper nav-prev-bought" />
        </div>
      </div>
    </section>
  );
}

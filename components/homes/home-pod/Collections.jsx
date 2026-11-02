"use client";
import { categories11 } from "@/data/collections";
import React from "react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import Image from "next/image";
export default function Collections() {
  return (
    <section className="flat-spacing-21 pb-0">
      <div className="slider-layout-right wow fadeInUp">
        <div className="flat-title">
          <h3 className="title fw-bold text-dark text-start letter-0">
            Nos Collections
          </h3>
        </div>
        <Swiper
          dir="ltr"
          className="swiper tf-swiper tf-sw-right"
          {...{
            slidesPerView: 2,
            spaceBetween: 12,
            speed: 800,
            loop: true,
            autoplay: {
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            },
            observer: true,
            observeParents: true,
            navigation: {
              clickable: true,
              nextEl: ".nav-next-cls",
              prevEl: ".nav-prev-cls",
            },
            pagination: { el: ".sw-pagination-cls", clickable: true },
            breakpoints: {
              768: { slidesPerView: 2.5, spaceBetween: 12 },
              992: { slidesPerView: 3.5, spaceBetween: 24 },
              1200: { slidesPerView: 4, spaceBetween: 24 },
            },
          }}
          modules={[Pagination, Navigation, Autoplay]}
        >
          {categories11.map((item, index) => (
            <SwiperSlide className="swiper-slide" key={index}>
              <div className="wg-cls rounded-0 style-abs type-3 hover-img">
                <Link
                  href={`/shop-default`}
                  className="image img-style d-block"
                >
                  <Image
                    src={item.imgSrc}
                    alt={item.label}
                    className="lazyload"
                    width={item.width}
                    height={item.height}
                  />
                </Link>
                <div className="cls-btn text-center">
                  <Link
                    href={`/shop-default`}
                    className="tf-btn text-md rounded-0 fw-medium btn-white hover-dark"
                  >
                    {item.label}
                    <i className="icon icon-arr-right" />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <div className="d-flex d-xl-none sw-dot-default sw-pagination-cls justify-content-center" />
        </Swiper>
      </div>
    </section>
  );
}

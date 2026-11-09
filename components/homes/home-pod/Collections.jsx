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
      <div className="container">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-end justify-content-between gap-3 mb-4">
          <div>
            <span className="text-xs text-uppercase tracking-wider text-muted fw-semibold d-inline-block mb-1">
              Univers Shammah
            </span>
            <h2 className="title fw-bold text-dark letter-0 mb-1" style={{ fontSize: "2rem" }}>
              Nos Collections
            </h2>
            <p className="text-secondary text-sm mb-0">
              T-shirts, sweats à capuche, casquettes et accessoires : des pièces uniques conçues pour témoigner avec force et sobriété.
            </p>
          </div>
        </div>
      </div>

      <div className="slider-layout-right wow fadeInUp">
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
          {categories11.map((item, index) => {
            const targetUrl = `/shop-default?category=${item.slug || "t-shirts"}`;
            return (
              <SwiperSlide className="swiper-slide" key={index}>
                <div className="wg-cls rounded-0 style-abs type-3 hover-img">
                  <Link href={targetUrl} className="image img-style d-block">
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
                      href={targetUrl}
                      className="tf-btn text-md rounded-0 fw-medium btn-white hover-dark"
                    >
                      {item.label}
                      <svg
                        className="ms-2"
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 13L11 8L6 3"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
          <div className="d-flex d-xl-none sw-dot-default sw-pagination-cls justify-content-center" />
        </Swiper>
      </div>
    </section>
  );
}

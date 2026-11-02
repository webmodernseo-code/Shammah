"use client";
import { testimonialsData } from "@/data/testimonials";
import React from "react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
export default function Testimonials() {
  return (
    <section className="flat-spacing-2 relative overflow-hidden">
      <div className="tf-overlay" style={{ position: "relative" }}>
        <Image
          src="/images/cls-categories/pod/prl.jpg"
          alt="slider"
          className="lazyload effect-paralax"
          width={1920}
          height={800}
        />
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.65)" }} />
      </div>
      <div className="container">
        <div className="flat-title relative z-5 text-center mb-4">
          <span className="sub-title text-uppercase fw-semibold" style={{ color: "#e4e4e7", fontSize: "12px", letterSpacing: "1.5px" }}>
            Avis Vérifiés
          </span>
          <h3 className="title letter-0 text-white fw-bold mt-1" style={{ fontSize: "30px", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
            Témoignages & Avis de notre Communauté
          </h3>
        </div>
        <Swiper
          dir="ltr"
          className="swiper tf-swiper"
          {...{
            slidesPerView: 1,
            spaceBetween: 12,
            speed: 800,
            loop: true,
            autoplay: {
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            },
            observer: true,
            observeParents: true,
            navigation: {
              clickable: true,
              nextEl: ".nav-next-tes",
              prevEl: ".nav-prev-tes",
            },
            pagination: { el: ".sw-pagination-tes", clickable: true },
            breakpoints: {
              577: { slidesPerView: 2, spaceBetween: 12 },
              1200: { slidesPerView: 3, spaceBetween: 24 },
            },
          }}
          modules={[Pagination, Navigation, Autoplay]}
        >
          {testimonialsData.map((testimonial, index) => (
            <SwiperSlide className="swiper-slide" key={index}>
              <div className="wg-testimonial style-2 type-2 bg-white rounded-0">
                <div className="content-top">
                  <div className="list-star-default">
                    <i className="icon-star" />
                    <i className="icon-star" />
                    <i className="icon-star" />
                    <i className="icon-star" />
                    <i className="icon-star" />
                  </div>
                  <p className="text-xl fw-medium">
                    {testimonial.quote}
                  </p>
                  <p className="text-review text-md text-main">
                    {testimonial.review}
                  </p>
                  <div className="box-author">
                    <div className="avt">
                      <Image
                        alt=""
                        src={testimonial.authorAvatar}
                        width={100}
                        height={100}
                      />
                    </div>
                    <p className="name-author text-sm fw-medium">
                      {testimonial.authorName}
                    </p>
                  </div>
                </div>
                <span className="br-line d-block" />
                <div className="box-avt">
                  <div className="avatar rounded-0">
                    <Image
                      alt=""
                      src={testimonial.productImage}
                      width={144}
                      height={144}
                    />
                  </div>
                  <div className="box-price">
                    <a href="#" className="link name-item text-md fw-medium">
                      {testimonial.productName}
                    </a>
                    <p className="price text-md fw-medium">
                      {testimonial.productPrice}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <div className="d-flex d-xl-none sw-dot-default style-white sw-pagination-tes justify-content-center" />
        </Swiper>
      </div>
    </section>
  );
}

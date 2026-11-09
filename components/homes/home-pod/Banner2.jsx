"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const CREATOR_SLIDES = [
  {
    id: 1,
    src: "/images/banner/jesus-createur.jpg",
    alt: "Jésus — Quel créateur extraordinaire",
    theme: "dark",
  },
  {
    id: 2,
    src: "/images/banner/jesus-lifeline.png",
    alt: "Jesus is my lifeline",
    theme: "dark",
  },
  {
    id: 3,
    src: "/images/banner/jesus-croix.jpg",
    alt: "Jésus — La Croix",
    theme: "light",
  },
];

export default function Banner2() {
  const [activeTheme, setActiveTheme] = useState("dark");

  return (
    <section
      className={`shammah-creator-banner is-${activeTheme}`}
      aria-label="Jésus, quel créateur extraordinaire"
    >
      <div className="shammah-creator-banner-inner container">
        <div className="shammah-creator-visual">
          <Swiper
            dir="ltr"
            className="swiper shammah-creator-swiper"
            slidesPerView={1}
            spaceBetween={0}
            speed={750}
            loop={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              el: ".shammah-creator-pagination",
              clickable: true,
            }}
            onSlideChange={(swiper) => {
              const slide = CREATOR_SLIDES[swiper.realIndex];
              if (slide) setActiveTheme(slide.theme);
            }}
            modules={[Autoplay, Pagination]}
          >
            {CREATOR_SLIDES.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className={`shammah-creator-slide is-${slide.theme}`}>
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    width={1024}
                    height={572}
                    className="shammah-creator-img"
                    priority={slide.id === 1}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="shammah-creator-pagination" />
        </div>

        <div className="shammah-creator-actions text-center">
          <Link href="/shop-default" className="shammah-creator-btn">
            <span>Explorer la collection</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

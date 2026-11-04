"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import Image from "next/image";
import Drift from "drift-zoom";

const defaultSlides = [
  {
    id: 1,
    color: "Black",
    size: "M",
    imgSrc: "/images/products/pod/product-5.jpg",
  },
  {
    id: 2,
    color: "Black",
    size: "M",
    imgSrc: "/images/products/pod/product-6.jpg",
  },
  {
    id: 3,
    color: "White",
    size: "M",
    imgSrc: "/images/products/pod/product-7.jpg",
  },
  {
    id: 4,
    color: "Grey",
    size: "M",
    imgSrc: "/images/products/pod/product-12.jpg",
  },
];

export default function Slider1({
  product,
  activeColor = "Black",
  setActiveColor = () => {},
  firstItem,
  slideItems,
}) {
  const [thumbSwiper, setThumbSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const swiperRef = useRef(null);
  const lightboxRef = useRef(null);

  // Construct dynamic gallery items based on actual product
  const items = (() => {
    const list = [];
    if (product) {
      if (product.imgSrc) {
        list.push({
          id: 1,
          color: activeColor || "Black",
          size: "M",
          imgSrc: firstItem || product.imgSrc,
        });
      }
      if (product.imgHover && product.imgHover !== product.imgSrc) {
        list.push({
          id: list.length + 1,
          color: activeColor || "Black",
          size: "M",
          imgSrc: product.imgHover,
        });
      }
      if (product.imageHover && product.imageHover !== product.imgSrc && product.imageHover !== product.imgHover) {
        list.push({
          id: list.length + 1,
          color: activeColor || "Black",
          size: "M",
          imgSrc: product.imageHover,
        });
      }
      if (Array.isArray(product.colors)) {
        product.colors.forEach((col) => {
          if (col.img && !list.some((item) => item.imgSrc === col.img)) {
            list.push({
              id: list.length + 1,
              color: col.label || "Black",
              size: "M",
              imgSrc: col.img,
            });
          }
        });
      }
    }

    if (list.length > 0) {
      return list;
    }
    const fallback = slideItems && slideItems.length > 0 ? [...slideItems] : [...defaultSlides];
    if (firstItem && fallback[0]) {
      fallback[0].imgSrc = firstItem;
    }
    return fallback;
  })();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Drift zoom on desktop
  useEffect(() => {
    if (isMobile) return;

    let driftInstances = [];
    const timeout = setTimeout(() => {
      const driftAll = document.querySelectorAll(".tf-image-zoom");
      const pane = document.querySelector(".tf-zoom-main");
      if (pane) {
        driftAll.forEach((el) => {
          try {
            const d = new Drift(el, {
              zoomFactor: 2,
              paneContainer: pane,
              inlinePane: false,
              handleTouch: false,
              hoverBoundingBox: true,
              containInline: true,
            });
            driftInstances.push(d);
          } catch (e) {
            // Ignore drift init errors
          }
        });
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      driftInstances.forEach((d) => {
        try {
          d.destroy();
        } catch (e) {}
      });
    };
  }, [isMobile, items]);

  // PhotoSwipe Lightbox
  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: "#gallery-swiper-started",
      children: ".gallery-link-item",
      pswpModule: () => import("photoswipe"),
    });

    lightbox.init();
    lightboxRef.current = lightbox;

    return () => {
      if (lightboxRef.current) {
        lightboxRef.current.destroy();
      }
    };
  }, [items]);

  // Sync color changes
  useEffect(() => {
    if (swiperRef.current && items[activeIndex]?.color !== activeColor) {
      const matchIndex = items.findIndex((elm) => elm.color === activeColor);
      if (matchIndex >= 0) {
        swiperRef.current.slideTo(matchIndex);
      }
    }
  }, [activeColor, items]);

  return (
    <div className={`shammah-product-gallery ${isMobile ? "is-mobile-gallery" : "is-desktop-gallery"}`}>
      {/* 1. THUMBNAILS (Desktop: vertical on left | Mobile: horizontal below) */}
      <div className="shammah-thumbs-wrapper">
        <Swiper
          dir="ltr"
          className="swiper shammah-thumbs-swiper"
          slidesPerView={isMobile ? (items.length > 4 ? 4.5 : items.length) : 4}
          direction={isMobile ? "horizontal" : "vertical"}
          spaceBetween={isMobile ? 8 : 12}
          onSwiper={setThumbSwiper}
          modules={[Thumbs]}
          watchSlidesProgress
        >
          {items.map(({ color, size, imgSrc }, index) => (
            <SwiperSlide key={index} className="swiper-slide thumb-slide">
              <button
                type="button"
                className={`thumb-btn ${activeIndex === index ? "active" : ""}`}
                onClick={() => {
                  if (swiperRef.current) swiperRef.current.slideTo(index);
                }}
              >
                <Image
                  src={imgSrc}
                  alt={`Vignette ${color} ${index + 1}`}
                  width={120}
                  height={150}
                  className="thumb-img"
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 2. MAIN IMAGE (Center on desktop, top on mobile) */}
      <div className="shammah-main-preview-wrapper" id="gallery-swiper-started">
        <Swiper
          modules={[Thumbs, Navigation]}
          dir="ltr"
          className="swiper shammah-main-swiper"
          thumbs={{ swiper: thumbSwiper && !thumbSwiper.destroyed ? thumbSwiper : null }}
          navigation={{
            prevEl: ".shammah-nav-prev",
            nextEl: ".shammah-nav-next",
          }}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
            if (items[swiper.activeIndex]?.color) {
              setActiveColor(items[swiper.activeIndex].color);
            }
          }}
        >
          {items.map((elm, i) => (
            <SwiperSlide key={i} className="swiper-slide main-slide">
              <a
                href={elm.imgSrc}
                target="_blank"
                rel="noreferrer"
                className="gallery-link-item"
                data-pswp-width="1200"
                data-pswp-height="1500"
              >
                <div className="main-image-container">
                  <Image
                    className="tf-image-zoom main-product-image"
                    data-zoom={elm.imgSrc}
                    data-src={elm.imgSrc}
                    alt={product?.title || "Produit Shammah"}
                    src={elm.imgSrc}
                    width={828}
                    height={1035}
                    priority={i === 0}
                  />
                </div>
              </a>
            </SwiperSlide>
          ))}
        </Swiper>

        <div
          className="swiper-button-prev nav-swiper thumbs-prev shammah-nav-prev"
          aria-label="Photo précédente"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div
          className="swiper-button-next nav-swiper thumbs-next shammah-nav-next"
          aria-label="Photo suivante"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 13L11 8L6 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

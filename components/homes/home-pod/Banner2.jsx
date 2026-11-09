import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Banner2() {
  return (
    <section className="shammah-creator-banner" aria-label="Jésus, quel créateur extraordinaire">
      <div className="shammah-creator-banner-inner container">
        <div className="shammah-creator-visual">
          <Image
            src="/images/banner/jesus-createur.jpg"
            alt="Jésus — Quel créateur extraordinaire"
            width={1024}
            height={572}
            className="shammah-creator-img"
            priority={false}
          />
        </div>
        <div className="shammah-creator-actions text-center">
          <Link
            href="/shop-default"
            className="shammah-creator-btn"
          >
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

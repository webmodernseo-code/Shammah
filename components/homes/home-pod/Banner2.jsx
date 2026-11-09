import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Banner2() {
  return (
    <section className="banner-group-img">
      <Image
        className="banner-img ls-is-cached lazyloaded"
        data-src="/images/banner/pod1.jpg"
        alt=""
        src="/images/banner/pod1.jpg"
        width="1440"
        height="963"
      />
      <Image
        className="banner-img ls-is-cached lazyloaded"
        data-src="/images/banner/pod2.jpg"
        alt=""
        src="/images/banner/pod2.jpg"
        width="1440"
        height="963"
      />
      <div className="box-content text-center">
        <span className="fadeInUp wow subheading body-text-2 text-uppercase fw-semibold">
          Broderies Signature Shammah
        </span>
        <h3 className="fadeInUp wow heading letter-0 fw-bold">
          Affirmez Votre Foi au Quotidien
        </h3>
        <p className="fadeInUp wow body-text desc text-main">
          Découvrez notre sélection de casquettes brodées et créations textiles conçues avec soin. Profitez de{" "}
          <span className="fw-semibold text-dark">-20%</span> avec le code{" "}
          <span className="fw-semibold text-dark">SHAMMAH20</span> lors de votre commande.
        </p>
        <Link
          href={`/shop-default?category=casquettes`}
          className="fadeInUp wow tf-btn animate-btn btn-large rounded-0"
        >
          Découvrir les casquettes
          <i className="icon icon-arr-right" />
        </Link>
      </div>
    </section>
  );
}

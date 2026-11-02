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
          20% Off Men's Hats
        </span>
        <h3 className="fadeInUp wow heading letter-0 fw-bold">
          Top Off Your Look
        </h3>
        <p className="fadeInUp wow body-text desc text-main">
          Elevate your style with our exclusive men's hat collection. Use code{" "}
          <span className="fw-semibold text-dark">20DISCOUNT</span> at checkout
          to enjoy 20% off. Don't miss out—this offer is for a limited time
          only!
        </p>
        <Link
          href={`/shop-default`}
          className="fadeInUp wow tf-btn animate-btn btn-large rounded-0"
        >
          Shop Collection
          <i className="icon icon-arr-right" />
        </Link>
      </div>
    </section>
  );
}

import React from "react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="tf-slideshow slider-pod slider-default">
      <div
        className="parallax-wrap parallaxie"
        style={{
          backgroundImage: 'url("/images/slider/pod/slider-pod.jpg")',
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          backgroundPosition: "center 93.15px",
        }}
      >
        <div className="container">
          <div className="content-slider style-2 text-center rounded-0">
            <div className="wow fadeInUp box-title-slider">
              <h1 className="heading display-xl-2 fw-bold">
                La foi, portée avec style
              </h1>
              <p className="sub text-md text-main">
                Vêtements chrétiens et cadeaux personnalisés, créés avec soin.{" "}
                <br /> Livraison en France et en Afrique de l’Ouest.
              </p>
            </div>
            <div className="wow fadeInUp box-btn-slider">
              <Link
                href={`/shop-default`}
                className="tf-btn animate-btn btn-large rounded-0"
              >
                Découvrir la collection
                <i className="icon icon-arr-right" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

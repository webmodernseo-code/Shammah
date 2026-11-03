import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import React from "react";
import Link from "next/link";
import Image from "next/image";
export const metadata = {
  title: "Page Non Trouvée | Shammah",
  description: "La page recherchée n'existe pas. Découvrez nos collections de vêtements et accessoires chrétiens.",
  robots: { index: false, follow: false },
};
export default function page() {
  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <section className="flat-spacing">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="wg-404">
                <div className="image">
                  <Image
                    src="/images/banner/404.png"
                    alt={404}
                    className="lazyload"
                    width={472}
                    height={472}
                  />
                </div>
                <p className="title">Whoops!</p>
                <p className="text-md sub text-main">
                  We couldn’t find the page you were looking for.
                </p>
                <div className="bot">
                  <Link href={`/`} className="tf-btn btn-fill animate-btn">
                    Return to Homepage
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer1 />
    </>
  );
}

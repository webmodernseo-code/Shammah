import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import RelatedProducts from "@/components/otherPages/RelatedProducts";
import ShopCart from "@/components/otherPages/ShopCart";
import React from "react";
import Link from "next/link";
import Breadcumb from "@/components/common/Breadcumb";
export const metadata = {
  title: "Mon Panier | Shammah",
  description: "Finalisez vos achats de vêtements et accessoires chrétiens sur Shammah.",
  robots: { index: false, follow: false },
};
export default function page() {
  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <>
        <Breadcumb pageName="Cart" pageTitle="Shopping Cart" />

        {/* /Title Page */}
        <div className="flat-spacing-24">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-4 col-sm-8">
                <div className="tf-cart-head text-center">
                  <p className="text-xl-3 title text-dark-4">
                    Spend <span className="fw-medium">$100</span> more to get
                    <span className="fw-medium">Free Shipping</span>
                  </p>
                  <div className="progress-sold tf-progress-ship">
                    <div
                      className="value"
                      style={{ width: "60%" }}
                      data-progress={60}
                    >
                      <i className="icon icon-car" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
      <ShopCart />
      <RelatedProducts />
      <Footer1 />
    </>
  );
}

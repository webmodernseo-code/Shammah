import Blogs3 from "@/components/blogs/Blogs3";

import Sidebar2 from "@/components/blogs/Sidebar2";
import Breadcumb from "@/components/common/Breadcumb";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Blog & Inspirations Mode Chrétienne | Shammah",
  description: "Articles, inspirations et actualités autour des vêtements et accessoires chrétiens Shammah.",
  alternates: { canonical: "/blog-grid-01" },
};
export default function page() {
  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <Breadcumb pageName="Blogs" pageTitle="Blogs" />

      <div className="btn-sidebar-mb d-lg-none right">
        <button data-bs-toggle="offcanvas" data-bs-target="#mbAccount">
          <i className="icon icon-sidebar" />
        </button>
      </div>
      <section className="s-blog-grid sec-blog">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <Blogs3 />
            </div>
            <div className="col-lg-4">
              <Sidebar2 prentClass="sidebar-blog d-lg-grid d-none sidebar-content-wrap" />
            </div>
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}

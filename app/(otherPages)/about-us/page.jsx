import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import About from "@/components/otherPages/About";
import Features from "@/components/otherPages/Features";
import Features2 from "@/components/otherPages/Features2";
import Testimonials from "@/components/otherPages/Testimonials";
import React from "react";

export const metadata = {
  title: "Qui est Shammah ? Notre mission et nos créations",
  description: "Shammah est une boutique de vêtements et cadeaux chrétiens imprimés à la demande, destinée aux familles et communautés en France et en Afrique de l’Ouest.",
  alternates: { canonical: "/about-us" },
};
export default function page() {
  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <About />
      <Features />
      <Features2 />
      <Testimonials />
      <Footer1 />
    </>
  );
}

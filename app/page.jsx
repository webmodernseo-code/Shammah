import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import Banner2 from "@/components/homes/home-pod/Banner2";
import Collections from "@/components/homes/home-pod/Collections";
import Features from "@/components/homes/home-pod/Features";
import Hero from "@/components/homes/home-pod/Hero";
import Marquee from "@/components/homes/home-pod/Marquee";
import Products from "@/components/homes/home-pod/Products";
import Products2 from "@/components/homes/home-pod/Products2";
import Newsletter from "@/components/modals/Newsletter";
import React from "react";

export const metadata = {
  title: "Vêtements et Accessoires Chrétiens de Qualité | Boutique Officielle",
  description: "Découvrez la collection officielle Shammah : vêtements et accessoires chrétiens uniques (t-shirts chrétiens, sweats, hoodies, tote bags, casquettes et cadeaux de foi personnalisés). Livraison en France et à l'international.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      {/* 1) Barre de defilement noir du haut enlevée, celle du bas est gardée */}
      <Hero />
      <Marquee directionClass="scrollRight" />
      <Collections />
      <Products />
      <Banner2 />
      <Products2 />
      <Features />
      <section className="flat-spacing-24" aria-labelledby="livraison-shammah">
        <div className="container text-center">
          <h2 id="livraison-shammah" className="mb-3">Des créations chrétiennes livrées près de chez vous</h2>
          <p className="text-md mb-3">
            Shammah crée des vêtements et cadeaux porteurs de foi, imprimés à la demande avec soin. Nous livrons à Paris et en Île-de-France, à Grenoble, partout en France ainsi qu’en Afrique de l’Ouest.
          </p>
          <a href="/zones-livraison" className="tf-btn btn-line-dark">Découvrir nos zones de livraison</a>
        </div>
      </section>
      <Footer1 />
      <Newsletter />
    </>
  );
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Context from "@/context/Context";
import CartComponent from "@/components/modals/CartComponent";
import Compare from "@/components/modals/Compare";
import Login from "@/components/modals/Login";
import MobileMenu from "@/components/modals/MobileMenu";
import Quickview from "@/components/modals/Quickview";
import SearchModal from "@/components/modals/SearchModal";
import SizeGuide from "@/components/modals/SizeGuide";
import QuestionModal from "@/components/modals/QuestionModal";
import ShareModal from "@/components/modals/ShareModal";
import DbSidebar from "@/components/modals/DbSidebar";
import ScrollTop from "@/components/common/ScrollTop";
import CookieConsent from "@/components/common/CookieConsent";

export default function ClientShell({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.esm");
  }, []);

  useEffect(() => {
    const header = document.querySelector("header");
    const handleScroll = () => header?.classList.toggle("header-bg", window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <Context>
      {children}
      <CartComponent />
      <Compare />
      <Login />
      <MobileMenu />
      <Quickview />
      <SearchModal />
      <SizeGuide />
      <QuestionModal />
      <ShareModal />
      <DbSidebar />
      <ScrollTop />
      <CookieConsent />
    </Context>
  );
}

import Breadcumb from "@/components/common/Breadcumb";
import Account from "@/components/dashboard/Account";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import React from "react";

export const metadata = {
  title: "Mon Compte Client | Shammah",
  description: "Gérez vos informations personnelles et votre compte sur Shammah.",
  robots: { index: false, follow: false },
};
export default function page() {
  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <Breadcumb pageName="Account" pageTitle="My Account" />

      <Account />
      <Footer1 />
    </>
  );
}

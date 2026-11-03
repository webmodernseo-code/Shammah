import Breadcumb from "@/components/common/Breadcumb";
import Orders from "@/components/dashboard/Orders";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import OrderDetails from "@/components/modals/OrderDetails";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Mes Commandes | Shammah",
  description: "Suivi de vos commandes de vêtements et accessoires chrétiens Shammah.",
  robots: { index: false, follow: false },
};
export default function page() {
  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <Breadcumb pageName="Orders" pageTitle="My Orders" />
      <Orders />
      <Footer1 />
      <OrderDetails />
    </>
  );
}

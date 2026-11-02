import Breadcumb from "@/components/common/Breadcumb";
import Orders from "@/components/dashboard/Orders";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import OrderDetails from "@/components/modals/OrderDetails";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Account Orders || Shammah - Print On Demand E-Commerce",
  description: "Shammah - Print On Demand E-Commerce",
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

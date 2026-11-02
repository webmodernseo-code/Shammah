"use client";

import { usePathname } from "next/navigation";
import Cartmodal3 from "./Cartmodal3";
import Cartmodal2 from "./Cartmodal2";
import CartModal from "./CartModal";

const CartComponent = () => {
  const pathname = usePathname();
  if (pathname === "/cart-drawer-v2") return <Cartmodal3 />;
  if (pathname === "/cart-empty") return <Cartmodal2 />;
  return <CartModal />;
};

export default CartComponent;

"use client";
import { allProducts } from "@/data/products";
import { openCartModal } from "@/utlis/openCartModal";

import React, { useEffect, useContext, useState } from "react";

const noop = () => {};
const dataContext = React.createContext({
  cartProducts: [],
  wishList: [],
  compareItem: [],
  totalPrice: 0,
  dbProducts: [],
  quickViewItem: allProducts[0],
  quickAddItem: 1,
  setCartProducts: noop,
  addProductToCart: noop,
  isAddedToCartProducts: () => false,
  removeFromWishlist: noop,
  addToWishlist: noop,
  isAddedtoWishlist: () => false,
  setQuickViewItem: noop,
  setQuickAddItem: noop,
  addToCompareItem: noop,
  isAddedtoCompareItem: () => false,
  removeFromCompareItem: noop,
  setCompareItem: noop,
  updateQuantity: noop,
});

export const useContextElement = () => {
  return useContext(dataContext);
};

export default function Context({ children }) {
  const [cartProducts, setCartProducts] = useState([]);
  const [wishList, setWishList] = useState([1, 2, 3]);
  const [compareItem, setCompareItem] = useState([1, 2, 3]);
  const [dbProducts, setDbProducts] = useState([]);
  const [quickViewItem, setQuickViewItem] = useState(allProducts[0]);
  const [quickAddItem, setQuickAddItem] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  // Charger en direct les produits publiés depuis le tableau de bord (base Neon)
  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data)) {
          setDbProducts(json.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const subtotal = cartProducts.reduce((accumulator, product) => {
      return accumulator + product.quantity * product.price;
    }, 0);
    setTotalPrice(subtotal);
  }, [cartProducts]);

  const isAddedToCartProducts = (id) => {
    if (cartProducts.find((elm) => String(elm.id) === String(id))) {
      return true;
    }
    return false;
  };

  const addProductToCart = (id, qty, isModal = true) => {
    if (!isAddedToCartProducts(id)) {
      const combinedPool = [...dbProducts, ...allProducts];
      const found = combinedPool.find((elm) => String(elm.id) === String(id));
      if (!found) return;
      const item = {
        ...found,
        quantity: qty ? qty : 1,
      };
      setCartProducts((pre) => [...pre, item]);
      if (isModal) {
        openCartModal();
      }
    }
  };

  const updateQuantity = (id, qty) => {
    if (isAddedToCartProducts(id)) {
      let item = cartProducts.find((elm) => String(elm.id) === String(id));
      let items = [...cartProducts];
      const itemIndex = items.indexOf(item);

      item.quantity = qty / 1;
      items[itemIndex] = item;
      setCartProducts(items);
    }
  };

  const addToWishlist = (id) => {
    if (!wishList.includes(id)) {
      setWishList((pre) => [...pre, id]);
    } else {
      setWishList((pre) => pre.filter((elm) => elm != id));
    }
  };

  const removeFromWishlist = (id) => {
    if (wishList.includes(id)) {
      setWishList((pre) => [...pre.filter((elm) => elm != id)]);
    }
  };

  const addToCompareItem = (id) => {
    if (!compareItem.includes(id)) {
      setCompareItem((pre) => [...pre, id]);
    }
  };

  const removeFromCompareItem = (id) => {
    if (compareItem.includes(id)) {
      setCompareItem((pre) => [...pre.filter((elm) => elm != id)]);
    }
  };

  const isAddedtoWishlist = (id) => {
    return wishList.includes(id);
  };

  const isAddedtoCompareItem = (id) => {
    return compareItem.includes(id);
  };

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cartList"));
    if (items?.length) {
      setCartProducts(items);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartList", JSON.stringify(cartProducts));
  }, [cartProducts]);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("wishlist"));
    if (items?.length) {
      setWishList(items);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishList));
  }, [wishList]);

  const contextElement = {
    cartProducts,
    setCartProducts,
    totalPrice,
    dbProducts,
    addProductToCart,
    isAddedToCartProducts,
    removeFromWishlist,
    addToWishlist,
    isAddedtoWishlist,
    quickViewItem,
    wishList,
    setQuickViewItem,
    quickAddItem,
    setQuickAddItem,
    addToCompareItem,
    isAddedtoCompareItem,
    removeFromCompareItem,
    compareItem,
    setCompareItem,
    updateQuantity,
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}

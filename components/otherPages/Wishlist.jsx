"use client";
import { useContextElement } from "@/context/Context";
import { allProducts } from "@/data/products";
import React, { useEffect, useState } from "react";
import ProductCard12 from "../productCards/ProductCard12";
import Link from "next/link";

export default function Wishlist() {
  const { wishList } = useContextElement();
  const [items, setItems] = useState(allProducts);
  useEffect(() => {
    setItems([...allProducts.filter((elm) => wishList.includes(elm.id))]);
  }, [wishList]);
  return (
    <section className="s-account flat-spacing-4 pt_0">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            {items.length ? (
              <div
                className="wrapper-shop tf-grid-layout tf-col-2 lg-col-3 xl-col-4 style-1"
                id="gridLayout"
              >
                {items.map((product, i) => (
                  <ProductCard12 key={i} product={product} />
                ))}

                {/* Pagination */}
                <ul className="wg-pagination">
                  <li className="active">
                    <div className="pagination-item">1</div>
                  </li>
                  <li>
                    <a href="#" className="pagination-item">
                      2
                    </a>
                  </li>
                  <li>
                    <a href="#" className="pagination-item">
                      3
                    </a>
                  </li>
                  <li>
                    <a href="#" className="pagination-item">
                      <i className="icon-arr-right2" />
                    </a>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="">
                <div>
                  Your wishlist is empty. Start adding favorite products to
                  wishlist!
                </div>{" "}
                <Link
                  className="tf-btn btn-dark2 animate-btn mt-3"
                  href="/shop-default"
                >
                  Explore Products
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

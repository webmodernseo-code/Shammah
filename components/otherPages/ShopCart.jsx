"use client";

import Link from "next/link";
import { useContextElement } from "@/context/Context";
import QuantitySelect from "../common/QuantitySelect";
import PaymentMethods from "../common/PaymentMethods";
import Image from "next/image";

export default function ShopCart() {
  const {
    cartProducts,
    setCartProducts,
    totalPrice,
    updateQuantity,
  } = useContextElement();

  const removeItem = (id) => {
    setCartProducts((pre) => [...pre.filter((elm) => elm.id != id)]);
  };

  return (
    <div className="flat-spacing-2 pt-0">
      <div className="container">
        <div className="row">
          <div className="col-xl-8">
            <div className="tf-page-cart-main">
              <form className="form-cart" onSubmit={(e) => e.preventDefault()}>
                {cartProducts.length ? (
                  <table className="table-page-cart">
                    <thead>
                      <tr>
                        <th>Article</th>
                        <th>Prix</th>
                        <th>Quantité</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartProducts.map((product, i) => (
                        <tr key={i} className="tf-cart-item file-delete">
                          <td className="tf-cart-item_product">
                            <Link
                              href={`/product-detail/${product.id}`}
                              className="img-box"
                            >
                              <Image
                                alt={product.title || "Produit Shammah"}
                                src={product.imgSrc}
                                width={684}
                                height={972}
                              />
                            </Link>
                            <div className="cart-info">
                              <Link
                                href={`/product-detail/${product.id}`}
                                className="name text-md link fw-medium"
                              >
                                {product.title}
                              </Link>
                              <div className="variants">
                                {product.selectedColor || "Standard"} /{" "}
                                {product.selectedSize || "M"}
                              </div>
                              <span
                                className="remove-cart link remove"
                                onClick={() => removeItem(product.id)}
                              >
                                Retirer
                              </span>
                            </div>
                          </td>
                          <td className="tf-cart-item_price text-center">
                            <span className="cart-price price-on-sale text-md fw-medium">
                              {product.price.toFixed(2)} €
                            </span>
                          </td>
                          <td
                            className="tf-cart-item_quantity"
                            data-cart-title="Quantité"
                          >
                            <QuantitySelect
                              quantity={product.quantity}
                              setQuantity={(qty) => {
                                updateQuantity(product.id, qty);
                              }}
                            />
                          </td>
                          <td
                            className="tf-cart-item_total text-center"
                            data-cart-title="Total"
                          >
                            <div className="cart-total total-price text-md fw-medium">
                              {(product.price * product.quantity).toFixed(2)} €
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4">
                    Votre panier est actuellement vide. Découvrez nos créations
                    pour commencer vos achats.{" "}
                    <Link
                      className="tf-btn btn-dark2 animate-btn mt-3"
                      href="/shop-default"
                    >
                      Explorer la collection
                    </Link>
                  </div>
                )}
                <div className="cart-note mt-4">
                  <label htmlFor="note" className="text-md fw-medium">
                    Instructions ou remarques pour votre commande
                  </label>
                  <textarea
                    id="note"
                    placeholder="Indications de livraison ou mot d'accompagnement..."
                    defaultValue={""}
                  />
                </div>
              </form>
            </div>
          </div>
          <div className="col-xl-4">
            <div className="tf-page-cart-sidebar">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="cart-box checkout-cart-box"
              >
                <div className="cart-head">
                  <div className="total-discount text-xl fw-medium">
                    <span>Total :</span>
                    <span className="total">{totalPrice.toFixed(2)} €</span>
                  </div>
                  <p className="text-sm text-dark-4">
                    Frais de livraison calculés à l&apos;étape suivante (offerts
                    dès 60 €)
                  </p>
                </div>
                <div className="checkout-btn mt-3">
                  <Link
                    href={`/checkout`}
                    className="tf-btn btn-dark2 animate-btn w-100 justify-content-center"
                  >
                    Passer à la commande
                  </Link>
                </div>
                <div className="cart-imgtrust mt-4">
                  <p className="text-center text-sm text-dark-1 mb-2">
                    Moyens de paiement acceptés
                  </p>
                  <PaymentMethods className="justify-content-center" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

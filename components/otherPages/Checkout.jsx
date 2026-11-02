"use client";

import React, { useState } from "react";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import Image from "next/image";

export default function Checkout() {
  const { cartProducts, totalPrice } = useContextElement();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    postalCode: "",
    city: "",
    country: "France",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const shippingCost = totalPrice >= 60 || totalPrice === 0 ? 0 : 4.9;
  const finalTotal = totalPrice + shippingCost;

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = true;
    if (!formData.lastName.trim()) newErrors.lastName = true;
    if (!formData.phone.trim()) newErrors.phone = true;
    if (!formData.address.trim()) newErrors.address = true;
    if (!formData.postalCode.trim()) newErrors.postalCode = true;
    if (!formData.city.trim()) newErrors.city = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const generatedOrderNum = `SH-${Date.now().toString().slice(-6)}`;
    setOrderNumber(generatedOrderNum);

    // Build the formatted WhatsApp message
    const itemsList = cartProducts
      .map(
        (p) =>
          `• ${p.quantity}x ${p.title} (${p.selectedColor || "Standard"} / ${
            p.selectedSize || "M"
          }) — ${(p.price * p.quantity).toFixed(2)} €`
      )
      .join("\n");

    const message = `🕊️ *NOUVELLE COMMANDE SHAMMAH (#${generatedOrderNum})*
--------------------------------
👤 *Client* : ${formData.firstName} ${formData.lastName}
📞 *WhatsApp / Tél* : ${formData.phone}
${formData.email ? `📧 *Email* : ${formData.email}\n` : ""}📍 *Adresse de livraison* :
${formData.address}
${formData.postalCode} ${formData.city}, ${formData.country}
${formData.notes ? `📝 *Remarques* : ${formData.notes}\n` : ""}
🛍️ *Articles commandés* :
${itemsList || "• Panier en cours de confirmation"}

💰 *Sous-total* : ${totalPrice.toFixed(2)} €
🚚 *Frais de port* : ${shippingCost === 0 ? "Offerts (0.00 €)" : `${shippingCost.toFixed(2)} €`}
✨ *Total à régler* : ${finalTotal.toFixed(2)} €

Bonjour l'équipe Shammah, je vous transmets mes informations pour finaliser ma commande et organiser la livraison. Merci !`;

    const encodedMsg = encodeURIComponent(message);
    const targetUrl = `https://wa.me/33600000000?text=${encodedMsg}`;
    setWhatsappLink(targetUrl);
    setOrderConfirmed(true);

    // Open WhatsApp
    if (typeof window !== "undefined") {
      window.open(targetUrl, "_blank");
    }
  };

  return (
    <div className="flat-spacing-25" style={{ backgroundColor: "#fafafa", minHeight: "80vh" }}>
      <div className="container">
        {orderConfirmed ? (
          <div
            className="bg-white rounded-2xl p-4 p-md-5 text-center mx-auto"
            style={{
              maxWidth: "680px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "#ecfdf5",
                color: "#10b981",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h3 className="fw-bold text-gray-900 mb-2">Commande transmise avec succès !</h3>
            <p className="text-gray-600 mb-3" style={{ fontSize: "15px" }}>
              Numéro de référence : <strong className="text-dark">{orderNumber}</strong>
            </p>
            <p className="text-gray-600 mb-4" style={{ fontSize: "14px", lineHeight: "1.6" }}>
              Votre récapitulatif complet et vos informations de livraison ont été préparés pour être envoyés directement à notre service client sur WhatsApp.
              Notre équipe prend en charge votre commande et vous confirme l'expédition.
            </p>

            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mb-4">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="tf-btn btn-dark2 d-inline-flex align-items-center justify-content-center gap-2"
                style={{ backgroundColor: "#25D366", borderColor: "#25D366", color: "#ffffff", padding: "12px 24px" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.077-1.748-.383-1.424-.59-2.336-2.035-2.407-2.129-.071-.094-.575-.765-.575-1.458 0-.693.364-1.034.494-1.174.13-.14.283-.175.377-.175.094 0 .188.001.27.006.086.005.202-.033.316.24.116.28.397.97.432 1.042.035.072.059.156.012.25-.047.094-.071.153-.141.236-.071.082-.149.183-.213.246-.071.07-.145.146-.062.289.083.143.369.609.792.986.545.486 1.005.637 1.148.708.143.071.228.062.312-.036.084-.098.361-.421.457-.565.096-.144.192-.12.324-.071.132.049.839.396.983.468.144.072.24.108.276.17.036.062.036.357-.108.762zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.981-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.603 0-3.097-.478-4.351-1.298l-.312-.204-2.955.775.789-2.88-.224-.356A8.138 8.138 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z" />
                </svg>
                Ouvrir la conversation WhatsApp
              </a>

              <Link
                href="/shop-default"
                className="tf-btn btn-white hover-dark d-inline-flex align-items-center justify-content-center"
                style={{ padding: "12px 24px" }}
              >
                Retour à la boutique
              </Link>
            </div>

            <div className="pt-3 border-top text-gray-500" style={{ fontSize: "13px" }}>
              <div className="d-flex align-items-center justify-content-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Traitement direct & sécurisé par l'équipe Shammah</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {/* Left Column: Guest Order & Shipping Form */}
            <div className="col-lg-7">
              <div
                className="bg-white rounded-2xl p-4 p-md-5"
                style={{
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div className="mb-4">
                  <h4 className="fw-bold text-gray-900 mb-1" style={{ fontSize: "22px" }}>
                    Informations de livraison
                  </h4>
                  <p className="text-gray-500 mb-0" style={{ fontSize: "14px" }}>
                    Achat direct sans création de compte. Vous recevrez le suivi et la confirmation directement par notification WhatsApp.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label text-gray-700 fw-medium" style={{ fontSize: "13px" }}>
                        Prénom *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`form-control rounded-xl ${errors.firstName ? "is-invalid border-danger" : "border-gray-200"}`}
                        placeholder="Jean"
                        style={{ height: "44px", fontSize: "14px" }}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label text-gray-700 fw-medium" style={{ fontSize: "13px" }}>
                        Nom *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`form-control rounded-xl ${errors.lastName ? "is-invalid border-danger" : "border-gray-200"}`}
                        placeholder="Dupont"
                        style={{ height: "44px", fontSize: "14px" }}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label text-gray-700 fw-medium d-flex align-items-center justify-content-between" style={{ fontSize: "13px" }}>
                        <span>Numéro WhatsApp / Mobile *</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`form-control rounded-xl ${errors.phone ? "is-invalid border-danger" : "border-gray-200"}`}
                        placeholder="+33 6 12 34 56 78"
                        style={{ height: "44px", fontSize: "14px" }}
                      />
                      <small className="text-gray-400" style={{ fontSize: "11px" }}>
                        Indispensable pour l'envoi du récapitulatif et le suivi
                      </small>
                    </div>

                    <div className="col-sm-6">
                      <label className="form-label text-gray-700 fw-medium" style={{ fontSize: "13px" }}>
                        Adresse email (facultatif)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control rounded-xl border-gray-200"
                        placeholder="jean.dupont@email.com"
                        style={{ height: "44px", fontSize: "14px" }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-gray-700 fw-medium" style={{ fontSize: "13px" }}>
                      Adresse de livraison complète *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`form-control rounded-xl ${errors.address ? "is-invalid border-danger" : "border-gray-200"}`}
                      placeholder="12 rue de la Paix, Bâtiment B, Apt 4"
                      style={{ height: "44px", fontSize: "14px" }}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-sm-5">
                      <label className="form-label text-gray-700 fw-medium" style={{ fontSize: "13px" }}>
                        Code postal *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className={`form-control rounded-xl ${errors.postalCode ? "is-invalid border-danger" : "border-gray-200"}`}
                        placeholder="75001"
                        style={{ height: "44px", fontSize: "14px" }}
                      />
                    </div>

                    <div className="col-sm-7">
                      <label className="form-label text-gray-700 fw-medium" style={{ fontSize: "13px" }}>
                        Ville *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`form-control rounded-xl ${errors.city ? "is-invalid border-danger" : "border-gray-200"}`}
                        placeholder="Paris"
                        style={{ height: "44px", fontSize: "14px" }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-gray-700 fw-medium" style={{ fontSize: "13px" }}>
                      Pays de livraison
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="form-select rounded-xl border-gray-200"
                      style={{ height: "44px", fontSize: "14px" }}
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Luxembourg">Luxembourg</option>
                      <option value="Autre pays d'Europe">Autre pays d'Europe</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-gray-700 fw-medium" style={{ fontSize: "13px" }}>
                      Instructions ou message pour notre équipe (optionnel)
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      value={formData.notes}
                      onChange={handleChange}
                      className="form-control rounded-xl border-gray-200"
                      placeholder="Code d'accès, indication de livraison ou mot d'accompagnement..."
                      style={{ fontSize: "14px", resize: "none" }}
                    />
                  </div>

                  {/* Micro-Réassurance discrète */}
                  <div
                    className="p-3 rounded-xl mb-4 d-flex align-items-center gap-2"
                    style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "13px", color: "#475569" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Vos coordonnées sont transmises en toute confidentialité pour organiser votre livraison.</span>
                  </div>

                  <button
                    type="submit"
                    className="tf-btn w-100 rounded-xl d-flex align-items-center justify-content-center gap-2 py-3"
                    style={{
                      backgroundColor: "#25D366",
                      borderColor: "#25D366",
                      color: "#ffffff",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.077-1.748-.383-1.424-.59-2.336-2.035-2.407-2.129-.071-.094-.575-.765-.575-1.458 0-.693.364-1.034.494-1.174.13-.14.283-.175.377-.175.094 0 .188.001.27.006.086.005.202-.033.316.24.116.28.397.97.432 1.042.035.072.059.156.012.25-.047.094-.071.153-.141.236-.071.082-.149.183-.213.246-.071.07-.145.146-.062.289.083.143.369.609.792.986.545.486 1.005.637 1.148.708.143.071.228.062.312-.036.084-.098.361-.421.457-.565.096-.144.192-.12.324-.071.132.049.839.396.983.468.144.072.24.108.276.17.036.062.036.357-.108.762zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.981-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.603 0-3.097-.478-4.351-1.298l-.312-.204-2.955.775.789-2.88-.224-.356A8.138 8.138 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z" />
                    </svg>
                    Confirmer ma commande sur WhatsApp
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="col-lg-5">
              <div
                className="bg-white rounded-2xl p-4 p-md-5 sticky-top"
                style={{
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  top: "120px",
                }}
              >
                <h4 className="fw-bold text-gray-900 mb-3" style={{ fontSize: "18px" }}>
                  Récapitulatif de votre commande
                </h4>

                {cartProducts.length > 0 ? (
                  <div className="mb-4">
                    <ul className="list-unstyled mb-3 divide-y divide-gray-100" style={{ maxHeight: "320px", overflowY: "auto" }}>
                      {cartProducts.map((product, idx) => (
                        <li key={idx} className="d-flex align-items-center gap-3 py-2 border-bottom">
                          <div
                            className="rounded-lg overflow-hidden position-relative flex-shrink-0"
                            style={{ width: "54px", height: "68px", backgroundColor: "#f3f4f6" }}
                          >
                            <Image
                              src={product.imgSrc}
                              alt={product.title}
                              width={54}
                              height={68}
                              className="w-100 h-100 object-fit-cover"
                            />
                            <span
                              className="position-absolute top-0 end-0 badge rounded-pill bg-dark"
                              style={{ fontSize: "10px", transform: "translate(30%, -30%)" }}
                            >
                              {product.quantity}
                            </span>
                          </div>
                          <div className="flex-grow-1" style={{ fontSize: "14px" }}>
                            <p className="fw-medium text-gray-900 mb-0 line-clamp-1">{product.title}</p>
                            <span className="text-gray-500" style={{ fontSize: "12px" }}>
                              {product.selectedColor || "Standard"} • {product.selectedSize || "M"}
                            </span>
                          </div>
                          <span className="fw-semibold text-gray-900 text-nowrap" style={{ fontSize: "14px" }}>
                            {(product.price * product.quantity).toFixed(2)} €
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-2 mb-3" style={{ fontSize: "14px" }}>
                      <div className="d-flex justify-content-between text-gray-600 py-1">
                        <span>Sous-total articles</span>
                        <span className="fw-medium text-gray-900">{totalPrice.toFixed(2)} €</span>
                      </div>
                      <div className="d-flex justify-content-between text-gray-600 py-1">
                        <span>Livraison en Europe</span>
                        <span className="fw-medium">
                          {shippingCost === 0 ? (
                            <span className="text-success fw-bold">Offerte</span>
                          ) : (
                            `${shippingCost.toFixed(2)} €`
                          )}
                        </span>
                      </div>
                      {totalPrice < 60 && (
                        <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                          💡 Plus que {(60 - totalPrice).toFixed(2)} € pour bénéficier de la livraison offerte !
                        </p>
                      )}
                    </div>

                    <div
                      className="d-flex justify-content-between align-items-center pt-3 border-top mt-3"
                      style={{ fontSize: "18px" }}
                    >
                      <span className="fw-bold text-gray-900">Total</span>
                      <span className="fw-bold text-gray-900" style={{ fontSize: "22px" }}>
                        {finalTotal.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-3">Votre panier est actuellement vide.</p>
                    <Link href="/shop-default" className="tf-btn btn-white hover-dark btn-sm">
                      Explorer la boutique
                    </Link>
                  </div>
                )}

                <div
                  className="rounded-xl p-3 mt-3"
                  style={{ backgroundColor: "#f9fafb", border: "1px dashed #d1d5db", fontSize: "12px", color: "#6b7280" }}
                >
                  <p className="fw-semibold text-gray-800 mb-1">Comment fonctionne la livraison ?</p>
                  <p className="mb-0">
                    Dès réception de vos coordonnées sur WhatsApp, nous confirmons votre commande. Votre vêtement ou accessoire est alors imprimé à la demande dans notre atelier européen et expédié sous 48h avec numéro de suivi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

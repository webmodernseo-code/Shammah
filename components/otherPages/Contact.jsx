"use client";

import React, { useState } from "react";

export default function Contact() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <section className="s-contact flat-spacing-13">
      <div className="container">
        <div className="row g-5 align-items-start">
          {/* Left Column: Contact info & WhatsApp card */}
          <div className="col-lg-5">
            <div className="content-left">
              <span className="text-xs text-uppercase tracking-wider text-muted fw-bold mb-2 d-block">
                À votre écoute
              </span>
              <h2 className="title fw-bold display-md-2 text-gray-900 mb-3">
                Nous Contacter
              </h2>
              <p className="sub-title text-gray-600 mb-4 leading-relaxed" style={{ fontSize: "15px" }}>
                Une question sur une taille, un verset, une commande personnalisée ou un délai de livraison ?
                Notre équipe est à votre entière disposition pour vous répondre avec bienveillance et réactivité.
              </p>

              {/* WhatsApp direct card */}
              <div
                className="p-4 rounded-2xl mb-4"
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                }}
              >
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "36px", height: "36px", backgroundColor: "#22c55e", color: "#ffffff" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.077-1.748-.383-1.424-.59-2.336-2.035-2.407-2.129-.071-.094-.575-.765-.575-1.458 0-.693.364-1.034.494-1.174.13-.14.283-.175.377-.175.094 0 .188.001.27.006.086.005.202-.033.316.24.116.28.397.97.432 1.042.035.072.059.156.012.25-.047.094-.071.153-.141.236-.071.082-.149.183-.213.246-.071.07-.145.146-.062.289.083.143.369.609.792.986.545.486 1.005.637 1.148.708.143.071.228.062.312-.036.084-.098.361-.421.457-.565.096-.144.192-.12.324-.071.132.049.839.396.983.468.144.072.24.108.276.17.036.062.036.357-.108.762zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.981-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.603 0-3.097-.478-4.351-1.298l-.312-.204-2.955.775.789-2.88-.224-.356A8.138 8.138 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="fw-bold text-gray-900 mb-0" style={{ fontSize: "16px" }}>
                      Assistance WhatsApp Directe
                    </h5>
                    <span className="text-gray-500" style={{ fontSize: "12px" }}>Réponse rapide du lundi au samedi</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-3" style={{ fontSize: "13px" }}>
                  Discutez en direct avec nous pour une réponse immédiate sur votre commande ou un conseil taille.
                </p>
                <a
                  href="https://wa.me/33600000000?text=Bonjour%20Shammah,%20j%27aimerais%20des%20informations%20concernant%20vos%20vêtements."
                  target="_blank"
                  rel="noreferrer"
                  className="tf-btn w-100 rounded-xl d-flex align-items-center justify-content-center gap-2"
                  style={{ backgroundColor: "#22c55e", color: "#ffffff", padding: "10px 16px", fontSize: "14px" }}
                >
                  Ouvrir WhatsApp
                </a>
              </div>

              {/* Details list */}
              <div className="p-4 rounded-2xl bg-white border">
                <ul className="list-unstyled mb-0 space-y-3" style={{ fontSize: "14px" }}>
                  <li className="d-flex align-items-start gap-3 py-2 border-bottom">
                    <span className="text-gray-400 flex-shrink-0 mt-1">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <div>
                      <span className="text-gray-500 d-block" style={{ fontSize: "12px" }}>Email général & partenariats</span>
                      <a href="mailto:contact@shammah.eu" className="fw-medium text-dark text-decoration-none">
                        contact@shammah.eu
                      </a>
                    </div>
                  </li>

                  <li className="d-flex align-items-start gap-3 py-2 border-bottom">
                    <span className="text-gray-400 flex-shrink-0 mt-1">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    </span>
                    <div>
                      <span className="text-gray-500 d-block" style={{ fontSize: "12px" }}>Zone de livraison</span>
                      <span className="text-gray-900 fw-medium">France métropolitaine, Belgique, Suisse & Union Européenne</span>
                    </div>
                  </li>

                  <li className="d-flex align-items-start gap-3 py-2">
                    <span className="text-gray-400 flex-shrink-0 mt-1">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </span>
                    <div>
                      <span className="text-gray-500 d-block" style={{ fontSize: "12px" }}>Horaires d'écoute</span>
                      <span className="text-gray-900 fw-medium">Lundi au Samedi : 9h00 – 19h00</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Contact form */}
          <div className="col-lg-7">
            <div className="p-4 p-md-5 rounded-2xl bg-white border shadow-2xs">
              <h3 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "20px" }}>
                Envoyez-nous un message
              </h3>
              <p className="text-gray-500 mb-4" style={{ fontSize: "14px" }}>
                Remplissez ce formulaire et nous vous répondrons sous 24h ouvrées.
              </p>

              {formSubmitted ? (
                <div className="p-4 rounded-xl text-center bg-gray-50 border border-success">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: "48px", height: "48px", backgroundColor: "#ecfdf5", color: "#10b981" }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h5 className="fw-bold text-gray-900 mb-1">Message bien reçu !</h5>
                  <p className="text-gray-600 mb-0" style={{ fontSize: "14px" }}>
                    Merci pour votre message. Un membre de notre équipe Shammah vous répondra par email dans les plus brefs délais.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label text-gray-700 fw-medium" style={{ fontSize: "13px" }}>
                        Votre nom complet *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="form-control rounded-xl border-gray-200"
                        placeholder="Ex : Marie Martin"
                        style={{ height: "44px", fontSize: "14px" }}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label text-gray-700 fw-medium" style={{ fontSize: "13px" }}>
                        Votre adresse email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="form-control rounded-xl border-gray-200"
                        placeholder="Ex : marie@exemple.com"
                        style={{ height: "44px", fontSize: "14px" }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-gray-700 fw-medium" style={{ fontSize: "13px" }}>
                      Sujet de votre demande
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="form-control rounded-xl border-gray-200"
                      placeholder="Ex : Conseil pour un t-shirt enfant, commande de groupe..."
                      style={{ height: "44px", fontSize: "14px" }}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-gray-700 fw-medium" style={{ fontSize: "13px" }}>
                      Votre message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="form-control rounded-xl border-gray-200"
                      placeholder="Écrivez-nous votre message..."
                      style={{ fontSize: "14px", resize: "none" }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="tf-btn btn-dark2 w-100 rounded-xl py-3 fw-medium"
                    style={{ fontSize: "15px" }}
                  >
                    Envoyer mon message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

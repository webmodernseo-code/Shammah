import React from "react";
import Link from "next/link";

export const faqCategories = [
    {
      id: "orders",
      categoryTitle: "Commandes & Suivi WhatsApp",
      items: [
        {
          id: "ord-1",
          question: "Ai-je besoin de créer un compte client pour commander ?",
          answer:
            "Non, aucun compte n'est nécessaire. Chez Shammah, nous privilégions la simplicité et le contact direct : vous remplissez directement votre adresse de livraison au moment de valider votre panier, et votre récapitulatif est transmis par notification WhatsApp à notre équipe pour confirmer et expédier votre colis.",
        },
        {
          id: "ord-2",
          question: "Comment fonctionne la confirmation et le suivi par WhatsApp ?",
          answer:
            "Dès que vous validez votre panier, un message prérempli avec vos coordonnées et les articles commandés s'ouvre sur WhatsApp. Notre équipe prend en charge votre commande, vous envoie les instructions de paiement sécurisé et vous transmet le lien de suivi dès l'envoi de votre colis.",
        },
        {
          id: "ord-3",
          question: "Puis-je commander pour faire un cadeau ou un baptême ?",
          answer:
            "Tout à fait ! Vous pouvez indiquer l'adresse du destinataire lors de la commande et nous préciser dans les remarques s'il s'agit d'un cadeau. Nous pouvons joindre une carte avec le verset ou mot de votre choix.",
        },
      ],
    },
    {
      id: "products",
      categoryTitle: "Vêtements, Tailles & Matériaux",
      items: [
        {
          id: "prod-1",
          question: "Quelle est la qualité des textiles Shammah ?",
          answer:
            "Tous nos t-shirts, hoodies et vêtements sont confectionnés à partir de coton biologique peigné de haute qualité (180 à 350 g/m² selon les modèles). Nos encres d'impression sont certifiées OEKO-TEX Eco Passport, sans produits chimiques nocifs pour la peau et respectueuses de l'environnement.",
        },
        {
          id: "prod-2",
          question: "Comment bien choisir ma taille ?",
          answer:
            "Nos modèles homme, femme et enfant taillent normalement (coupe européenne standard). Si vous préférez une coupe plus ample (style oversize décontracté), nous vous conseillons de sélectionner une taille au-dessus. Un guide des tailles complet est disponible sur chaque fiche produit.",
        },
        {
          id: "prod-3",
          question: "Comment entretenir mes vêtements imprimés ?",
          answer:
            "Pour préserver l'éclat de l'impression et la douceur du coton bio, nous vous recommandons de laver vos vêtements à l'envers à 30°C en cycle délicat. Évitez le sèche-linge et repassez toujours sur l'envers du motif imprimé.",
        },
      ],
    },
    {
      id: "shipping",
      categoryTitle: "Impression & Livraison en Europe",
      items: [
        {
          id: "ship-1",
          question: "Quels sont les délais d'impression et de livraison ?",
          answer:
            "Chaque vêtement ou accessoire Shammah est imprimé à la demande dans notre atelier européen afin d'éviter toute surproduction inutile. Le temps de production est de 24 à 48 heures ouvrées, suivi d'une livraison à domicile sous 3 à 5 jours ouvrés.",
        },
        {
          id: "ship-2",
          question: "Quels sont les frais de livraison ?",
          answer:
            "La livraison avec numéro de suivi est offerte dès 60 € d'achat pour la France métropolitaine et l'Union Européenne. Pour les commandes inférieures à 60 €, les frais de livraison forfaitaires sont de 4,90 €.",
        },
        {
          id: "ship-3",
          question: "Dans quels pays expédiez-vous ?",
          answer:
            "Nous expédions quotidiennement en France métropolitaine, en Belgique, en Suisse, au Luxembourg, ainsi que dans l'ensemble des pays de l'Union Européenne.",
        },
      ],
    },
    {
      id: "returns",
      categoryTitle: "Retours & Échanges Fraternels",
      items: [
        {
          id: "ret-1",
          question: "Puis-je échanger mon article si la taille ne me convient pas ?",
          answer:
            "Oui ! Vous disposez de 14 jours après réception de votre commande pour demander un échange ou un retour. Il vous suffit de nous contacter sur WhatsApp ou par email à contact@shammah.eu et nous vous guiderons pour le renvoi de votre article neuf non porté.",
        },
        {
          id: "ret-2",
          question: "Que faire si un article arrive avec un défaut de confection ?",
          answer:
            "La satisfaction de nos frères et sœurs est notre priorité. Si un article présente la moindre anomalie d'impression ou de confection, envoyez-nous simplement une photo sur WhatsApp. Nous réimprimerons et réexpédierons immédiatement un nouvel article sans aucun frais supplémentaire.",
        },
      ],
    },
  ];

export default function Faqs() {

  return (
    <section className="s-faq flat-spacing-13">
      <div className="container">
        <div className="row g-5">
          {/* Left Sidebar */}
          <div className="col-lg-4">
            <div className="sb-contact p-4 p-md-5 rounded-2xl bg-white border sticky-top" style={{ top: "120px" }}>
              <span className="text-xs text-uppercase tracking-wider text-muted fw-bold mb-2 d-block">
                Assistance Fraternelle
              </span>
              <h4 className="fw-bold text-gray-900 mb-3" style={{ fontSize: "20px" }}>
                Une question sans réponse ?
              </h4>
              <p className="text-gray-600 mb-4" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                Nous sommes à votre écoute pour vous conseiller, vous aider à choisir une taille ou suivre votre commande.
              </p>

              <div className="d-flex flex-column gap-3">
                <a
                  href="https://wa.me/33600000000?text=Bonjour%20Shammah,%20j%27ai%20une%20question%20sur%20un%20produit."
                  target="_blank"
                  rel="noreferrer"
                  className="tf-btn d-flex align-items-center justify-content-center gap-2 rounded-xl py-3 fw-medium"
                  style={{ backgroundColor: "#22c55e", color: "#ffffff", fontSize: "14px" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.077-1.748-.383-1.424-.59-2.336-2.035-2.407-2.129-.071-.094-.575-.765-.575-1.458 0-.693.364-1.034.494-1.174.13-.14.283-.175.377-.175.094 0 .188.001.27.006.086.005.202-.033.316.24.116.28.397.97.432 1.042.035.072.059.156.012.25-.047.094-.071.153-.141.236-.071.082-.149.183-.213.246-.071.07-.145.146-.062.289.083.143.369.609.792.986.545.486 1.005.637 1.148.708.143.071.228.062.312-.036.084-.098.361-.421.457-.565.096-.144.192-.12.324-.071.132.049.839.396.983.468.144.072.24.108.276.17.036.062.036.357-.108.762zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.981-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.603 0-3.097-.478-4.351-1.298l-.312-.204-2.955.775.789-2.88-.224-.356A8.138 8.138 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z" />
                  </svg>
                  Échanger sur WhatsApp
                </a>

                <Link
                  href="/contact-us"
                  className="tf-btn btn-white hover-dark rounded-xl py-3 text-center fw-medium"
                  style={{ fontSize: "14px" }}
                >
                  Formulaire de contact
                </Link>
              </div>

              <div className="mt-4 pt-3 border-top text-gray-500" style={{ fontSize: "12px" }}>
                <span>Email : </span>
                <a href="mailto:contact@shammah.eu" className="fw-semibold text-dark text-decoration-none">
                  contact@shammah.eu
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: FAQ Accordions */}
          <div className="col-lg-8">
            <div className="space-y-5">
              {faqCategories.map((cat, cIdx) => (
                <div key={cat.id} className="p-4 p-md-5 rounded-2xl bg-white border shadow-2xs mb-4">
                  <h3 className="fw-bold text-gray-900 mb-4" style={{ fontSize: "18px" }}>
                    {cat.categoryTitle}
                  </h3>

                  <div className="accordion accordion-flush" id={`acc-${cat.id}`}>
                    {cat.items.map((item, iIdx) => {
                      const collapseId = `col-${cat.id}-${iIdx}`;
                      const isFirst = cIdx === 0 && iIdx === 0;

                      return (
                        <div key={item.id} className="accordion-item border-bottom py-2">
                          <h4 className="accordion-header" id={`head-${collapseId}`}>
                            <button
                              className={`accordion-button ${isFirst ? "" : "collapsed"} bg-transparent shadow-none px-0 py-3 fw-medium text-gray-900`}
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target={`#${collapseId}`}
                              aria-expanded={isFirst ? "true" : "false"}
                              aria-controls={collapseId}
                              style={{ fontSize: "15px" }}
                            >
                              {item.question}
                            </button>
                          </h4>
                          <div
                            id={collapseId}
                            className={`accordion-collapse collapse ${isFirst ? "show" : ""}`}
                            aria-labelledby={`head-${collapseId}`}
                            data-bs-parent={`#acc-${cat.id}`}
                          >
                            <div className="accordion-body px-0 pt-0 pb-3 text-gray-600 leading-relaxed" style={{ fontSize: "14px" }}>
                              {item.answer}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

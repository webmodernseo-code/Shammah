import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import Link from "next/link";
import Breadcumb from "@/components/common/Breadcumb";

export const metadata = {
  title: "Livraison & Délais || Shammah - Vêtements d'Inspiration Chrétienne",
  description: "Modalités d'impression et d'expédition des créations chrétiennes Shammah en France et en Europe.",
};

export default function Shipping() {
  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <Breadcumb pageName="Livraison & Délais" pageTitle="Livraison & Expédition" />

      <section className="s-term-user flat-spacing-2" style={{ backgroundColor: "#fafafa" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="bg-white rounded-2xl p-4 p-md-5 border shadow-2xs">
            <div className="mb-4 pb-3 border-bottom">
              <span className="text-xs text-uppercase tracking-wider text-muted fw-bold mb-1 d-block">
                shammah.eu
              </span>
              <h2 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "24px" }}>
                Politique de Livraison & Délais
              </h2>
              <p className="text-gray-500 mb-0" style={{ fontSize: "14px" }}>
                Dernière mise à jour : 1er Novembre 2026
              </p>
            </div>

            <div className="content space-y-4" style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151" }}>
              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  1. Une confection éthique à la demande (Print On Demand)
                </h4>
                <p>
                  Dans un souci de respect de la Création et pour éviter tout gaspillage textile, chaque pièce de vêtement
                  (t-shirt, sweat, hoodie) ou accessoire Shammah est imprimée à la demande dans notre atelier partenaire européen dès la confirmation de votre commande.
                </p>
                <p className="mb-0">
                  Le temps d'impression et de contrôle qualité est habituellement de <strong>24 à 48 heures ouvrées</strong> avant la prise en charge par le transporteur.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  2. Zones & Délais de livraison
                </h4>
                <p>
                  Nous expédions vos colis directement à votre domicile avec remise suivie :
                </p>
                <ul className="list-unstyled ps-3 space-y-2">
                  <li className="d-flex align-items-center gap-2">
                    <span className="text-success fw-bold">•</span>
                    <span><strong>France métropolitaine & Monaco :</strong> 3 à 5 jours ouvrés après expédition.</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <span className="text-success fw-bold">•</span>
                    <span><strong>Belgique, Luxembourg & Suisse :</strong> 4 à 6 jours ouvrés après expédition.</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <span className="text-success fw-bold">•</span>
                    <span><strong>Reste de l'Union Européenne :</strong> 5 à 8 jours ouvrés.</span>
                  </li>
                </ul>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  3. Tarifs de livraison
                </h4>
                <div className="p-3 rounded-xl bg-gray-50 border mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold text-gray-900">Commandes dès 60 € d'achat</span>
                    <span className="badge bg-success-subtle text-success fw-bold px-3 py-1">Gratuit (0.00 €)</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-gray-600">Commandes inférieures à 60 €</span>
                    <span className="fw-bold text-gray-900">4,90 € forfaitaire</span>
                  </div>
                </div>
                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  Aucun frais caché : le montant total vous est clairement récapitulé avant toute validation.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  4. Suivi de votre commande & Notifications WhatsApp
                </h4>
                <p>
                  Puisque vos commandes sont coordonnées directement avec notre équipe, dès que votre colis quitte l'atelier,
                  vous recevez votre numéro de suivi directement par <strong>notification WhatsApp</strong> (ou par email). Vous pouvez ainsi suivre l'acheminement de votre colis en temps réel.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  5. Une question sur votre envoi ?
                </h4>
                <p className="mb-3">
                  Si vous constatez un retard inhabituel ou si vous souhaitez modifier une adresse avant l'expédition, contactez-nous au plus vite :
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <a
                    href="https://wa.me/33600000000?text=Bonjour%20Shammah,%20j%27ai%20une%20question%20concernant%20la%20livraison."
                    target="_blank"
                    rel="noreferrer"
                    className="tf-btn d-inline-flex align-items-center gap-2 rounded-xl py-2 px-3"
                    style={{ backgroundColor: "#22c55e", color: "#ffffff", fontSize: "14px" }}
                  >
                    Assistance WhatsApp Directe
                  </a>
                  <a
                    href="mailto:contact@shammah.eu"
                    className="tf-btn btn-white hover-dark rounded-xl py-2 px-3"
                    style={{ fontSize: "14px" }}
                  >
                    contact@shammah.eu
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer1 />
    </>
  );
}

import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import Link from "next/link";
import Breadcumb from "@/components/common/Breadcumb";

export const metadata = {
  title: "Retours & Remboursements || Shammah - Vêtements d'Inspiration Chrétienne",
  description: "Politique de retours, d'échanges et de remboursements pour la boutique chrétienne Shammah (shammah.eu).",
};

export default function Return() {
  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <Breadcumb pageName="Retours & Remboursements" pageTitle="Retours & Échanges Fraternels" />

      <section className="s-term-user flat-spacing-2" style={{ backgroundColor: "#fafafa" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="bg-white rounded-2xl p-4 p-md-5 border shadow-2xs">
            <div className="mb-4 pb-3 border-bottom">
              <span className="text-xs text-uppercase tracking-wider text-muted fw-bold mb-1 d-block">
                shammah.eu
              </span>
              <h2 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "24px" }}>
                Politique de Retours, Échanges & Remboursements
              </h2>
              <p className="text-gray-500 mb-0" style={{ fontSize: "14px" }}>
                Dernière mise à jour : 1er Novembre 2026
              </p>
            </div>

            <div className="content space-y-4" style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151" }}>
              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  1. Notre engagement de satisfaction
                </h4>
                <p>
                  Chez <strong>Shammah</strong>, nous mettons tout notre cœur pour que chaque vêtement ou accessoire reçu
                  soit une source de joie et d'édification. Si pour une raison quelconque un article ne correspondait pas pleinement à vos attentes,
                  vous bénéficiez d'un <strong>délai légal de 14 jours</strong> à compter de la réception de votre colis pour nous demander un échange ou un remboursement.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  2. Conditions de retour
                </h4>
                <p>
                  Pour être accepté en retour, l'article doit être neuf, non lavé, non porté (en dehors de l'essayage initial) et dans son emballage d'origine avec toutes ses étiquettes intactes.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  3. Comment faire un échange ou un retour ?
                </h4>
                <p>
                  Nous facilitons la démarche au maximum :
                </p>
                <ol className="ps-3 space-y-2 mb-3">
                  <li>
                    <strong>Contactez-nous :</strong> Envoyez-nous un message sur WhatsApp ou un email à{" "}
                    <a href="mailto:contact@shammah.eu" className="fw-semibold text-dark">contact@shammah.eu</a> avec votre numéro de commande et le motif de votre demande (ex : souhait d'échange de taille M vers L).
                  </li>
                  <li>
                    <strong>Confirmation :</strong> Notre équipe vous transmet l'adresse de notre point de retour en France.
                  </li>
                  <li>
                    <strong>Traitement :</strong> Dès réception et vérification de la pièce retournée, nous expédions votre nouvelle taille ou déclenchons votre remboursement.
                  </li>
                </ol>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  4. Article endommagé ou erreur d'impression
                </h4>
                <p>
                  Bien que nos ateliers effectuent un contrôle rigoureux, si un produit présentait un défaut textile ou un problème d'impression,
                  envoyez-nous simplement une photo nette par WhatsApp. Nous procéderons à la <strong>réimpression et réexpédition immédiate à nos frais exclusifs</strong>, sans que vous n'ayez à renvoyer l'article défectueux.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  5. Délais de remboursement
                </h4>
                <p className="mb-0">
                  Les remboursements sont exécutés sous <strong>3 à 5 jours ouvrés</strong> après validation du retour via le même moyen de paiement que celui convenu lors de la commande.
                </p>
              </div>

              <div className="pt-4 border-top">
                <div className="p-3 rounded-xl bg-gray-50 border d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                  <div>
                    <h6 className="fw-bold text-gray-900 mb-1">Besoin d'aide pour un retour ?</h6>
                    <span className="text-gray-500" style={{ fontSize: "13px" }}>Notre équipe vous accompagne en direct.</span>
                  </div>
                  <a
                    href="https://wa.me/33600000000?text=Bonjour%20Shammah,%20je%20souhaite%20procéder%20à%20un%20échange/retour."
                    target="_blank"
                    rel="noreferrer"
                    className="tf-btn d-inline-flex align-items-center gap-2 rounded-xl py-2 px-3"
                    style={{ backgroundColor: "#22c55e", color: "#ffffff", fontSize: "14px" }}
                  >
                    Contacter le support WhatsApp
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

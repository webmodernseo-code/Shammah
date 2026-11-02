import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import Breadcumb from "@/components/common/Breadcumb";

export const metadata = {
  title: "Conditions Générales de Vente (CGV) || Shammah - shammah.eu",
  description: "Conditions Générales de Vente régissant les achats effectués sur la boutique en ligne Shammah.",
};

export default function TermsAndConditions() {
  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <Breadcumb pageName="Conditions Générales" pageTitle="Conditions Générales de Vente" />

      <section className="s-term-user flat-spacing-2" style={{ backgroundColor: "#fafafa" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="bg-white rounded-2xl p-4 p-md-5 border shadow-2xs">
            <div className="mb-4 pb-3 border-bottom">
              <span className="text-xs text-uppercase tracking-wider text-muted fw-bold mb-1 d-block">
                shammah.eu
              </span>
              <h2 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "24px" }}>
                Conditions Générales de Vente (CGV)
              </h2>
              <p className="text-gray-500 mb-0" style={{ fontSize: "14px" }}>
                Applicables à compter du 1er Novembre 2026
              </p>
            </div>

            <div className="content space-y-4" style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151" }}>
              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  1. Préambule & Objet
                </h4>
                <p>
                  Les présentes Conditions Générales de Vente (CGV) s'appliquent à toutes les commandes passées sur le site internet <strong>shammah.eu</strong>,
                  dédié à la vente de vêtements éthiques et accessoires d'inspiration chrétienne (Homme, Femme, Enfant, Objets de foi).
                </p>
                <p className="mb-0">
                  Toute validation de commande implique l'adhésion entière et sans réserve du client aux présentes conditions.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  2. Produits & Confection Print On Demand
                </h4>
                <p>
                  Les caractéristiques essentielles de chaque vêtement (composition en coton biologique, grammage, coupes, guide des tailles) sont présentées sur chaque fiche produit.
                  Afin de limiter notre empreinte écologique et lutter contre la surproduction, les pièces sont produites à la demande dans notre atelier européen suite à votre commande.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  3. Prix & Frais de livraison
                </h4>
                <p>
                  Les prix de nos produits sont indiqués en <strong>Euros (€) Toutes Taxes Comprises (TTC)</strong>.
                  Les frais de livraison sont offerts pour toute commande atteignant <strong>60,00 €</strong> en France et dans l'Union Européenne.
                  Pour les commandes inférieures à ce seuil, une participation forfaitaire de <strong>4,90 €</strong> est appliquée.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  4. Commande directe & Coordination par WhatsApp
                </h4>
                <p>
                  Pour garantir une expérience fluide sans contrainte de mot de passe, les commandes sur <strong>shammah.eu</strong> ne requièrent aucune création préalable de compte client.
                  Le client saisit ses coordonnées de livraison, et le récapitulatif complet de la commande est transmis par notification WhatsApp à l'équipe Shammah pour finalisation et confirmation immédiate.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  5. Livraison & Suivi
                </h4>
                <p>
                  Les produits sont livrés à l'adresse indiquée lors de la commande. Le délai d'expédition moyen est de <strong>24 à 48 heures ouvrées</strong> pour la fabrication, suivi de <strong>3 à 5 jours ouvrés</strong> pour la livraison à domicile avec numéro de suivi en France et Europe.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  6. Droit de rétractation & Échanges
                </h4>
                <p>
                  Conformément à la législation européenne, le client dispose d'un délai de <strong>14 jours francs</strong> à compter de la réception de sa commande pour exercer son droit de rétractation ou demander un échange de taille.
                  L'article doit être retourné neuf, non porté et non lavé. En cas de défaut de conformité ou de textile endommagé, Shammah procède à la réimpression immédiate à ses frais exclusifs.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  7. Propriété intellectuelle
                </h4>
                <p className="mb-0">
                  L'ensemble des éléments du site <strong>shammah.eu</strong> (logos, graphismes, typographies, compositions de versets, visuels) sont la propriété exclusive de Shammah. Toute reproduction, même partielle, sans autorisation préalable est interdite.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  8. Droit applicable & Contact
                </h4>
                <p>
                  Les présentes CGV sont soumises au droit français et européen. Pour toute question ou réclamation, notre équipe est joignable à{" "}
                  <a href="mailto:contact@shammah.eu" className="fw-semibold text-dark">contact@shammah.eu</a> ou via notre support WhatsApp dédié.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer1 />
    </>
  );
}

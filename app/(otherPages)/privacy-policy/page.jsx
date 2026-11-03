import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import Breadcumb from "@/components/common/Breadcumb";

export const metadata = {
  alternates: { canonical: "/privacy-policy" },
  title: "Politique de Confidentialité || Shammah - shammah.eu",
  description: "Engagement de protection des données personnelles et conformité RGPD pour le site e-commerce Shammah.",
};

export default function PrivacyPolicy() {
  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <Breadcumb pageName="Confidentialité" pageTitle="Politique de Confidentialité" />

      <section className="s-term-user flat-spacing-2" style={{ backgroundColor: "#fafafa" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="bg-white rounded-2xl p-4 p-md-5 border shadow-2xs">
            <div className="mb-4 pb-3 border-bottom">
              <span className="text-xs text-uppercase tracking-wider text-muted fw-bold mb-1 d-block">
                shammah.eu • Conformité RGPD
              </span>
              <h2 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "24px" }}>
                Politique de Protection des Données Personnelles
              </h2>
              <p className="text-gray-500 mb-0" style={{ fontSize: "14px" }}>
                Dernière mise à jour : 1er Novembre 2026
              </p>
            </div>

            <div className="content space-y-4" style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151" }}>
              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  1. Notre engagement éthique
                </h4>
                <p>
                  Chez <strong>Shammah</strong>, la transparence, la sincérité et le respect de votre vie privée sont au cœur de nos valeurs chrétiennes.
                  La présente politique vous informe de manière claire sur la façon dont vos données personnelles sont recueillies, utilisées et protégées lorsque vous naviguez sur <strong>shammah.eu</strong> et passez commande.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  2. Responsable de traitement
                </h4>
                <p>
                  Le responsable de traitement des données personnelles collectées sur le site est la boutique en ligne <strong>Shammah</strong>, joignable directement par email à{" "}
                  <a href="mailto:contact@shammah.eu" className="fw-semibold text-dark">contact@shammah.eu</a>.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  3. Données collectées & Finalités
                </h4>
                <p>
                  Dans le cadre de notre processus de commande directe sans compte obligatoire, nous ne collectons que les informations strictement nécessaires à la bonne exécution de votre commande :
                </p>
                <ul className="list-unstyled ps-3 space-y-2">
                  <li>
                    <strong>• Identité & Coordonnées :</strong> Prénom, nom, numéro WhatsApp/téléphone, adresse postale complète, adresse email.
                  </li>
                  <li>
                    <strong>• Finalité :</strong> Impression de vos articles, acheminement et livraison de vos colis par le transporteur, notification du numéro de suivi sur WhatsApp et support client direct.
                  </li>
                  <li>
                    <strong>• Données de navigation :</strong> Données techniques anonymisées strictly nécessaires au bon affichage et à la sécurité de la boutique.
                  </li>
                </ul>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  4. Zéro revente de vos données
                </h4>
                <p>
                  <strong>Nous ne vendons, ne louons et ne cédons jamais vos données personnelles à des tiers à des fins publicitaires ou de prospection commerciale.</strong>
                </p>
                <p className="mb-0">
                  Vos coordonnées ne sont partagées qu'avec nos prestataires logistiques d'impression et d'expédition européens, uniquement dans la mesure indispensable à la livraison de vos colis.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  5. Sécurité & Confidentialité des échanges WhatsApp
                </h4>
                <p>
                  Lorsque vous confirmez votre commande par WhatsApp, les échanges bénéficient du chiffrement de bout en bout de l'application. Seule notre équipe dédiée a accès à votre conversation pour traiter votre commande avec soin et fraternité.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  6. Durée de conservation
                </h4>
                <p className="mb-0">
                  Vos informations de commande sont conservées uniquement pendant la durée nécessaire à la gestion de la commande, de la livraison, de la garantie légale et des obligations comptables en vigueur.
                </p>
              </div>

              <div className="term-item mb-4">
                <h4 className="fw-bold text-gray-900 mb-2" style={{ fontSize: "17px" }}>
                  7. Vos droits (RGPD)
                </h4>
                <p>
                  Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez à tout moment d'un droit d'accès, de rectification, de portabilité et de suppression de vos données personnelles.
                </p>
                <p className="mb-0">
                  Pour exercer ces droits, il vous suffit de nous adresser un email à{" "}
                  <a href="mailto:contact@shammah.eu" className="fw-semibold text-dark">contact@shammah.eu</a>. Nous vous répondrons dans un délai maximal de 48 heures.
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

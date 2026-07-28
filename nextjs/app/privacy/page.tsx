import Link from "next/link";
import React from "react";

export default function PrivacyPage() {
  return (
    <div className="main-wrapper" style={{ padding: "80px 20px", maxWidth: "800px", margin: "0 auto", fontFamily: "var(--font-inter)", color: "var(--text-primary)" }}>
      <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none", display: "inline-block", marginBottom: 40, fontWeight: 600 }}>
        ← Retour à la boutique
      </Link>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: 24 }}>Politique de Confidentialité</h1>
      <p style={{ lineHeight: 1.6, color: "var(--text-secondary)" }}>
        Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
      </p>
      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 16 }}>1. Collecte de l'information</h2>
        <p style={{ lineHeight: 1.6, color: "var(--text-secondary)", marginBottom: 24 }}>
          Nous recueillons des informations lorsque vous effectuez un achat sur notre vitrine. Les informations recueillies incluent votre nom, adresse e-mail, numéro de téléphone, et adresse de livraison.
        </p>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 16 }}>2. Utilisation des informations</h2>
        <p style={{ lineHeight: 1.6, color: "var(--text-secondary)" }}>
          Toutes les informations que nous recueillons auprès de vous sont utilisées uniquement pour exécuter vos commandes, personnaliser votre expérience et vous contacter pour le suivi de votre colis.
        </p>
      </section>
    </div>
  );
}

import Link from "next/link";
import React from "react";

export default function TermsPage() {
  return (
    <div className="main-wrapper" style={{ padding: "80px 20px", maxWidth: "800px", margin: "0 auto", fontFamily: "var(--font-inter)", color: "var(--text-primary)" }}>
      <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none", display: "inline-block", marginBottom: 40, fontWeight: 600 }}>
        ← Retour à la boutique
      </Link>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: 24 }}>Conditions Générales de Vente</h1>
      <p style={{ lineHeight: 1.6, color: "var(--text-secondary)" }}>
        Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
      </p>
      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 16 }}>1. Objet</h2>
        <p style={{ lineHeight: 1.6, color: "var(--text-secondary)", marginBottom: 24 }}>
          Les présentes Conditions Générales de Vente régissent les ventes par la boutique en ligne de nos articles et vêtements.
        </p>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 16 }}>2. Prix et Paiements</h2>
        <p style={{ lineHeight: 1.6, color: "var(--text-secondary)" }}>
          Les prix de nos produits sont indiqués en devises locales, toutes taxes comprises (TTC). Le paiement est exigible immédiatement à la commande, que ce soit par Mobile Money ou Carte Bancaire.
        </p>
      </section>
    </div>
  );
}

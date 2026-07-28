import Link from "next/link";
import React from "react";

export default function LegalPage() {
  return (
    <div className="main-wrapper" style={{ padding: "80px 20px", maxWidth: "800px", margin: "0 auto", fontFamily: "var(--font-inter)", color: "var(--text-primary)" }}>
      <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none", display: "inline-block", marginBottom: 40, fontWeight: 600 }}>
        ← Retour à la boutique
      </Link>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: 24 }}>Mentions Légales</h1>
      <p style={{ lineHeight: 1.6, color: "var(--text-secondary)" }}>
        Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
      </p>
      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 16 }}>Éditeur du site</h2>
        <p style={{ lineHeight: 1.6, color: "var(--text-secondary)", marginBottom: 24 }}>
          DivinExpress / Shammah<br />
          Contact : support@divinexpress.com
        </p>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 16 }}>Hébergement</h2>
        <p style={{ lineHeight: 1.6, color: "var(--text-secondary)" }}>
          Ce site est hébergé sur Vercel Inc.<br />
          340 S Lemon Ave #4133<br />
          Walnut, CA 91789, USA.
        </p>
      </section>
    </div>
  );
}

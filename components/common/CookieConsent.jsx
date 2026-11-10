"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "shammah_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) === null);
  }, []);

  const saveChoice = (choice) => {
    localStorage.setItem(STORAGE_KEY, choice);
    window.dispatchEvent(new CustomEvent("shammah:cookie-consent", { detail: choice }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <section
      className="shammah-cookie-banner"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <h2 id="cookie-consent-title" className="shammah-cookie-title">
        Nous utilisons des cookies 🍪
      </h2>
      <p id="cookie-consent-description" className="shammah-cookie-text">
        Pour améliorer votre expérience sur Shammah, nous utilisons des cookies
        pour la mesure d’audience, la personnalisation et la sécurisation de vos
        transactions.
      </p>
      <div className="shammah-cookie-footer">
        <Link href="/privacy-policy" className="shammah-cookie-link">
          Consulter notre politique de confidentialité →
        </Link>
        <div className="shammah-cookie-actions">
          <button type="button" className="shammah-cookie-button shammah-cookie-deny" onClick={() => saveChoice("denied")}>
            Fermer et refuser
          </button>
          <button type="button" className="shammah-cookie-button shammah-cookie-allow" onClick={() => saveChoice("accepted")}>
            Tout accepter
          </button>
        </div>
      </div>
    </section>
  );
}

import React from "react";

export default function Topbar4({
  parentClass = "tf-topbar bg-brown topbar-bg marquee-topbar",
}) {
  const messages = [
    "Livraison offerte dès 60€ d'achat en Europe",
    "Shammah — Vêtements & accessoires d'inspiration chrétienne",
    "Coton biologique & confection éthique",
    "Assistance & commande directe via WhatsApp",
    "Portez votre foi avec élégance et modernité",
  ];

  return (
    <div className={parentClass}>
      <div className="topbar-center marquee-wrapper">
        <div className="initial-child-container">
          {Array(3)
            .fill(messages)
            .flat()
            .map((msg, index) => (
              <React.Fragment key={index}>
                <div className="marquee-child-item">
                  <p>{msg}</p>
                </div>
                <div className="marquee-child-item">
                  <span className="dot" />
                </div>
              </React.Fragment>
            ))}
        </div>
      </div>
    </div>
  );
}

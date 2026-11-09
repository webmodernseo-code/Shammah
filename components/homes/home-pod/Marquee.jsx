import React from "react";

export default function Marquee({ directionClass = "" }) {
  const items = [
    "Nouvelle collection disponible",
    "Livraison offerte dès 60 € d'achat",
    "Coton biologique & impression haute tenue",
    "Expédition suivie en France et à l'international",
  ];

  // Répéter les éléments pour un défilement continu sans coupure
  const repeatedItems = [...items, ...items, ...items];

  return (
    <div className="marquee-sale bg-dark">
      <div className={`marquee-wrapper ${directionClass}`}>
        <div className="initial-child-container">
          {repeatedItems.map((text, idx) => (
            <React.Fragment key={idx}>
              <div className="marquee-child-item">
                <p className="display-xs fw-medium">{text}</p>
              </div>
              <div className="marquee-child-item">
                <i className="icon-flash-star" />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from "react";

export interface SaaSIconProps {
  className?: string;
  size?: number | string;
  color?: string;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *  ULTRA-PREMIUM SAAS VECTOR ICONS (LINEAR / STRIPE / RAMP STYLE)
 *  100% Pure Precision SVGs • Geometric Alignment • Duotone Micro-Glow
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * 1. Chiffre d'Affaires / Revenue
 * Emblème financier haute couture avec pièce géométrique et flèche d'ascension dynamique
 */
export function SaaSRevenueIcon({ className = "size-5", size = 20 }: SaaSIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
      <path
        d="M14.5 9.5C14.5 8.11929 13.3807 7 12 7C10.6193 7 9.5 8.11929 9.5 9.5C9.5 10.8807 10.6193 12 12 12C13.3807 12 14.5 13.1193 14.5 14.5C14.5 15.8807 13.3807 17 12 17C10.6193 17 9.5 15.8807 9.5 14.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path d="M12 5.5V7M12 17V18.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="18" cy="6" r="2.5" fill="currentColor" />
    </svg>
  );
}

/**
 * 2. Commandes / Orders
 * Sac de shopping haute maroquinerie avec poignées cintrées et rabat géométrique
 */
export function SaaSOrdersIcon({ className = "size-5", size = 20 }: SaaSIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.5 8.5C4.5 7.67157 5.17157 7 6 7H18C18.8284 7 19.5 7.67157 19.5 8.5L20.25 18.5C20.25 19.8807 19.1307 21 17.75 21H6.25C4.86929 21 3.75 19.8807 3.75 18.5L4.5 8.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8.5 7V5.5C8.5 3.567 10.067 2 12 2C13.933 2 15.5 3.567 15.5 5.5V7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M9 11.5C9 12.0523 9.44772 12.5 10 12.5C10.5523 12.5 11 12.0523 11 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13 11.5C13 12.0523 13.4477 12.5 14 12.5C14.5523 12.5 15 12.0523 15 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 3. Panier Moyen / Average Basket
 * Jauge de valeur avec étiquette de prix et cube volumétrique
 */
export function SaaSBasketIcon({ className = "size-5", size = 20 }: SaaSIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 9.5C3 8.39543 3.89543 7.5 5 7.5H19C20.1046 7.5 21 8.39543 21 9.5V17.5C21 19.1569 19.6569 20.5 18 20.5H6C4.34315 20.5 3 19.1569 3 17.5V9.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7 7.5L9.5 3.5M17 7.5L14.5 3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="12" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 11.5V12M12 16V16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 4. Total Clients / Customers
 * Double silhouette moderne avec halo VIP et micro-badge de vérification
 */
export function SaaSCustomersIcon({ className = "size-5", size = 20 }: SaaSIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Utilisateur Principal */}
      <circle cx="9" cy="7" r="3.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2.5 19C2.5 15.4101 5.41015 12.5 9 12.5C12.5899 12.5 15.5 15.4101 15.5 19V20H2.5V19Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Utilisateur Secondaire / Aura */}
      <path
        d="M15.5 4.5C16.8807 4.5 18 5.61929 18 7C18 8.38071 16.8807 9.5 15.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
      <path
        d="M18.5 13C20.433 13.5 21.5 15.2 21.5 18V19H17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
    </svg>
  );
}

/**
 * 5. Tableau de bord / Navigation Principale
 */
export function SaaSDashboardIcon({ className = "size-5", size = 20 }: SaaSIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7.5" height="7.5" rx="2.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * 6. Paiements & Transactions
 */
export function SaaSTransactionsIcon({ className = "size-5", size = 20 }: SaaSIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="5" width="19" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 10H21.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="14" width="4" height="2" rx="0.75" fill="currentColor" />
      <circle cx="17" cy="15" r="1.25" fill="currentColor" />
    </svg>
  );
}

/**
 * 7. Codes Promo & Réductions
 */
export function SaaSCouponIcon({ className = "size-5", size = 20 }: SaaSIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 9C4.10457 9 5 8.10457 5 7V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V7C19 8.10457 19.8954 9 21 9V15C19.8954 15 19 15.8954 19 17V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V17C5 15.8954 4.10457 15 3 15V9Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M9.5 9L14.5 15M9.5 14.5H9.51M14.5 9.5H14.51" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 8. Catalogue Produits & Prêt-à-porter
 */
export function SaaSProductsIcon({ className = "size-5", size = 20 }: SaaSIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 6.5V17.5L12 22L21 17.5V6.5L12 2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 22V12M12 12L20.5 7.5M12 12L3.5 7.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="7" r="1.5" fill="currentColor" />
    </svg>
  );
}

/**
 * 9. Gestion des stocks
 */
export function SaaSStocksIcon({ className = "size-5", size = 20 }: SaaSIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="10" width="18" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="16" width="18" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="6.25" r="1" fill="currentColor" />
      <circle cx="7" cy="12.25" r="1" fill="currentColor" />
      <circle cx="7" cy="18.25" r="1" fill="currentColor" />
    </svg>
  );
}

/**
 * 10. Avis & Témoignages
 */
export function SaaSReviewIcon({ className = "size-5", size = 20 }: SaaSIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

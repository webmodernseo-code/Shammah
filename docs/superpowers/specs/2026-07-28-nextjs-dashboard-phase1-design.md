# Spécification — Plan B, Chantier 1 : Nav du haut + Dashboard (port Next.js)

## 1. Contexte et portée

Le Plan A (fondations Next.js — scaffold, Prisma/Neon, NextAuth, Vercel Blob, migration) est posé et vérifié de bout en bout : la vraie base Neon contient le catalogue Shammah migré (4 catégories, 19 produits, 3 codes promo, 4 commandes), le compte admin existe, le dashboard actuel n'est qu'une coquille vide protégée par l'authentification.

Le Plan B porte le dashboard admin "Bloom" (déjà conçu et validé en vanilla — voir `docs/superpowers/specs/2026-07-26-bloom-dashboard-phase1-design.md`) vers Next.js/React, branché sur les vraies données Postgres via Prisma plutôt que sur `localStorage`. Le travail est découpé en 6 chantiers indépendants, dans le même ordre que la refonte vanilla, chacun avec son propre cycle spec → plan → implémentation :

1. **Nav du haut + Dashboard** (ce document)
2. Produits (liste + modale Add/Edit)
3. Commandes (liste + modale détail)
4. Clients (nouvelle notion de fiche client — modèle Prisma à créer)
5. Attributs (Catégories/Sous-catégories/Tailles/Couleurs — modèle Tailles/Couleurs à créer)
6. Profil & Paramètres (nouvelle page)

Le site n'est considéré "en ligne" qu'une fois les 6 chantiers terminés (décision utilisateur du 2026-07-28).

Principe directeur : reproduire fidèlement le contenu fonctionnel du spec vanilla Phase 1 (§5 de ce document), avec les mêmes calculs et le même visuel Bloom — mais avec une architecture Next.js idiomatique plutôt qu'une traduction littérale du JS vanilla.

## 2. Hors périmètre pour ce chantier

- Produits, Commandes, Clients, Attributs, Promotions : chacun aura sa propre page réelle dans un chantier dédié. Pour ce chantier, chaque onglet de nav pointe vers une page de type "en construction" (même principe que "Clients" en vanilla Phase 1).
- Vrai système de notifications derrière la cloche (icône statique, comme en vanilla).
- Page "Profil & Paramètres" réelle (lien présent dans le menu utilisateur mais désactivé/grisé, comme en vanilla — sera construite au chantier 6).
- Upload de nouvelles images produit (Vercel Blob n'est pas encore configuré avec un vrai token — non bloquant ici puisque ce chantier ne touche pas la gestion produit).

## 3. Nav du haut

Le layout `app/(admin)/layout.tsx` accueille une nouvelle barre de navigation fixe, remplaçant le `<div>` minimal actuel :

- Logo : `images/logo-shammah.svg` (déjà présent dans `public/images/`) + wordmark "SHAMMAH".
- 6 onglets en pilule, dans cet ordre : **Dashboard, Produits, Commandes, Clients, Attributs, Promotions**. Implémentés avec `<Link>` de Next.js ; l'onglet actif est déterminé via `usePathname()`. Style pill identique au spec vanilla §3 (fond `--color-accent-primary` plein si actif, texte gris sinon).
- Cloche de notification : icône SVG statique, pas de menu déroulant (identique au vanilla).
- Bloc utilisateur : avatar (initiale), nom "Administrateur" (ou le nom réel si disponible via la session NextAuth), rôle "Super Admin", chevron. Au clic : menu avec "Profil & Paramètres" (grisé, non cliquable) et "Déconnexion" — **cette fois câblée pour de vrai** sur `signOut()` de NextAuth (contrairement au vanilla où c'était décoratif), puisque l'authentification réelle existe désormais.

Pages placeholder pour Produits/Commandes/Clients/Attributs/Promotions : une page simple par section (`app/(admin)/produits/page.tsx`, etc.) affichant un message "Cette section arrive dans un prochain chantier." dans une carte centrée, pour que la nav ne pointe jamais vers une 404.

## 4. Design tokens

Déjà en place dans `nextjs/app/globals.css` (Tailwind v4, via `@theme`) depuis le Plan A — aucun nouveau travail de token nécessaire pour ce chantier :

```css
--color-page-bg: #F6F6FB;
--color-card-bg: #FFFFFF;
--color-accent-primary: #6C63FF;
--color-accent-primary-hover: #5A52E0;
--color-status-blue: #3B82F6;
--color-status-amber: #F59E0B;
--color-status-green: #22C55E;
--color-status-red: #EF4444;
--color-text-heading: #111827;
--color-text-body: #6B7280;
```

Cartes : `rounded-card` (16px) + `shadow-card`, définis dans le Plan A. Convention SVG identique au vanilla : chaque icône est un SVG inline `stroke="currentColor" stroke-width="2"`, aucun raster sauf vraies photos produit.

## 5. Page Dashboard

Contenu fonctionnel identique au spec vanilla §5 (repris ici pour référence, adapté à l'architecture Next.js) :

### 5.1 En-tête

"Bonjour, Administrateur 👋" + sous-titre. Sélecteur de plage de dates (pilule, options **7 derniers jours / 30 derniers jours / Tout**, défaut "7 derniers jours") et bouton "Exporter le rapport".

**Sélecteur de dates** : composant client (`DateRangeSelect`) qui met à jour `?range=7d|30d|all` dans l'URL via `router.push` (pas de state client séparé — la page se re-rend côté serveur avec les nouvelles données). Filtre les 4 KPI (§5.2), la jauge (§5.4) et l'aperçu des ventes (§5.6). Le graphique CA (§5.3) et les Commandes Récentes (§5.5) ont leur fenêtre propre, non affectée par ce sélecteur — comme en vanilla.

**Exporter le rapport** : composant client (`ExportReportButton`) recevant les KPI et commandes déjà calculés en props, générant le CSV et le téléchargement via `Blob` + `<a download>` — identique à l'approche vanilla, aucun appel serveur supplémentaire.

### 5.2 Cartes KPI (4)

Mêmes calculs que le spec vanilla §5.2 (Ventes Totales, Chiffre d'Affaires, Clients Actifs — approximé par email/téléphone distinct en attendant la vraie fiche client du chantier 4, Demandes de Remboursement), recalculés côté serveur via Prisma sur la période sélectionnée, avec comparaison à la période précédente équivalente. Badge de tendance masqué si `range=all` **ou si la période précédente vaut 0** (pas de division par zéro ni de "+∞ %" — traité comme "pas de comparaison possible", pertinent vu le petit volume réel actuel de 4 commandes).

### 5.3 Graphique "Chiffre d'Affaires"

SVG fait main (composant client `RevenueChart`, pour gérer le survol/tooltip et la bascule Semaine/Mois). Semaine = 7 barres (derniers 7 jours) ; Mois = 4-5 barres (dernières semaines). Tooltip au survol : date, nombre de commandes, CA. Badge de tendance vs période équivalente précédente. Indépendant du sélecteur de plage de dates de l'en-tête, comme en vanilla.

### 5.4 Jauge radiale "Taux de Réussite"

Composant SVG (`SuccessGauge`, peut rester un composant serveur si aucune interactivité n'est nécessaire) : arc semi-circulaire segmenté, rempli proportionnellement à `(Payée+Expédiée) / (toutes sauf Annulée) × 100`. Deux mini-cartes en dessous (Ventes, Chiffre d'Affaires) réutilisant les KPI déjà calculés.

### 5.5 Commandes Récentes

Composant serveur `RecentOrdersTable`, lecture seule, 5 dernières commandes tous statuts confondus (pas de filtre par plage de dates). Colonnes : miniature (première image du premier article, avec repli propre si absente), titre + "+N autres articles", client, date, montant, badge de statut non cliquable.

### 5.6 Aperçu des Ventes

Composant `SalesOverview` : légende à 3 catégories (Réussies/En attente/Annulées) avec % réel sur la période sélectionnée, visualisation en barres verticales colorées, et tableau "Produits les plus vendus" (agrégation `OrderItem` par titre, qty × price, top 3-4, % du CA total).

### 5.7 États vides

Le jeu de données réel actuel est petit (4 commandes). Chaque widget doit gérer proprement l'absence de données sur la période sélectionnée (ex. "Aucune commande sur cette période" au lieu d'un graphique ou tableau vide/cassé) plutôt que de supposer un minimum de données.

## 6. Architecture technique

- `app/(admin)/layout.tsx` : nav du haut (§3), remplace le wrapper minimal actuel.
- `app/(admin)/dashboard/page.tsx` : devient un composant serveur asynchrone (`async function DashboardPage({ searchParams })`), lit `range` et `chart` (semaine/mois) depuis les search params, appelle `lib/dashboard-metrics.ts` directement (pas de nouvel endpoint `/api/dashboard` — Prisma est appelé côté serveur directement, cohérent avec les Server Components de l'App Router).
- `lib/dashboard-metrics.ts` (nouveau) : fonctions pures calculant KPIs + tendance, données du graphique CA, taux de réussite, aperçu des ventes, à partir de requêtes Prisma sur `Order`/`OrderItem`. Réutilisable et testable indépendamment du rendu.
- `app/(admin)/{produits,commandes,clients,attributs,promotions}/page.tsx` (nouveaux, placeholders).
- `components/dashboard/` (nouveaux) : `TopNav.tsx`, `UserMenu.tsx` (client, pour le dropdown + signOut), `DateRangeSelect.tsx` (client), `KpiCard.tsx`, `RevenueChart.tsx` (client), `SuccessGauge.tsx`, `RecentOrdersTable.tsx`, `SalesOverview.tsx`, `ExportReportButton.tsx` (client).
- Aucune modification du schéma Prisma nécessaire pour ce chantier — tout est dérivé des tables `Order`/`OrderItem`/`Product` existantes.

## 7. Vérification

- Scripts Playwright (convention PASS/FAIL du projet) contre la vraie base migrée :
  - la nav affiche les 6 onglets et l'onglet actif est mis en évidence ;
  - changer la plage de dates met à jour les 4 KPI, la jauge et l'aperçu des ventes ;
  - basculer Semaine/Mois met à jour le graphique CA sans changer les KPI ;
  - le survol d'une barre affiche le tooltip attendu ;
  - "Exporter le rapport" déclenche un téléchargement ;
  - les Commandes Récentes affichent au maximum 5 lignes ;
  - le tableau des produits les plus vendus reflète une agrégation correcte des `OrderItem` réels ;
  - avec `range=all` (ou une période sans commande), les widgets affichent un état vide propre, sans erreur ;
  - "Déconnexion" invalide bien la session (redirection vers `/login`, `/dashboard` redevient inaccessible).
- Comparaison visuelle avec le rendu vanilla Bloom Phase 1 déjà validé (même palette, mêmes composants).

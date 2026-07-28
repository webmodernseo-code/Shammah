# Spécification — Migration Next.js, Étape 1 : Fondations + Dashboard Admin Complet

## 1. Contexte et portée

L'utilisateur souhaite migrer l'ensemble du site SHAMMAH (vitrine + dashboard admin) de HTML/CSS/JS vanilla vers **Next.js + Tailwind CSS**, avec un objectif de référencement (SEO) sérieux sur 3 marchés : **France**, **Royaume-Uni**, et **Afrique de l'Ouest francophone**. C'est un projet trop vaste pour une seule spec — il est découpé en sous-projets indépendants, chacun avec son propre cycle spec → plan → implémentation :

1. **Fondations + Dashboard admin complet** (ce document)
2. Vitrine publique (pages produits/catégories, panier) + routing i18n/SEO
3. Paiements réels (Stripe uniquement, tous marchés confondus — décision validée pour une étape future)
4. Contenu et copywriting localisés par marché

Cette première étape couvre uniquement l'**infrastructure technique** et le **portage complet du dashboard admin** (déjà conçu et construit en vanilla JS lors de la refonte "Bloom", cf. `docs/superpowers/plans/2026-07-26-bloom-dashboard-phase1.md`), avec de **vraies données migrées** dans une vraie base de données. La vitrine publique n'est pas reconstruite dans cette étape.

## 2. Décisions validées

| Sujet | Décision |
|---|---|
| Base de données | **Neon** (Postgres serverless) |
| Hébergement | **Vercel** |
| ORM | **Prisma** |
| Authentification admin | Email + mot de passe (Auth.js/NextAuth), un compte administrateur |
| Stockage des images | **Vercel Blob** |
| Budget hébergement | Démarrage sur paliers gratuits (Vercel Hobby) pendant la construction/test ; passage à **Vercel Pro** (~20$/mois) obligatoire au lancement commercial réel (usage non-commercial requis par les conditions Vercel Hobby) |
| Langues/marchés (pour l'étape vitrine future) | FR-FR (EUR), FR-CI/Afrique de l'Ouest (FCFA), EN-GB (GBP) — 2 langues, 3 marchés |
| Structure URL (étape vitrine future) | Sous-dossiers `/fr-fr/`, `/fr-ci/`, `/en-gb/` |
| Stratégie de prix multi-devises | Un seul prix de base + devise de base par produit, converti automatiquement selon le marché via un taux de change configurable (pas d'API de conversion temps réel) |
| Paiements (étape future) | **Stripe uniquement**, sur les 3 marchés — les moyens de paiement ouest-africains actuels (Wave, Orange Money, MTN MoMo) ne sont pas repris pour les nouvelles commandes ; conservés uniquement comme valeurs historiques sur les commandes migrées |

## 3. Architecture globale

- **Framework** : Next.js (App Router), React, Tailwind CSS.
- **Hébergement** : Vercel.
- **Base de données** : Neon (Postgres), accédée via Prisma.
- **Authentification** : Auth.js/NextAuth, provider email + mot de passe, un seul compte admin.
- **Stockage fichiers** : Vercel Blob pour toutes les photos produit (existantes migrées + nouvelles uploadées).
- Le dashboard est une application authentifiée (routes protégées), sans lien avec le routing i18n de la future vitrine.

## 4. Modèle de données (schéma Neon/Postgres via Prisma)

- **`categories`** (id, nom, slug) et **`subcategories`** (id, category_id, nom, slug) — structure à deux niveaux identique à l'existant. Les slugs sont une nouvelle donnée (n'existent pas dans `js/db.js`), générés à partir des noms lors de la migration, en anticipation du SEO de la future vitrine.
- **`products`** (id, titre, slug, description, prix_base, devise_base, category_id, subcategory_id, dates de création/modification).
- **`product_variants`** (id, product_id, nom couleur, code couleur hex) — une ligne par couleur/variante.
- **`product_images`** (id, variant_id, url Vercel Blob, ordre d'affichage) — **table séparée** pour supporter plusieurs photos par variante (galerie), corrigeant une première ébauche qui ne prévoyait qu'une seule photo par variante.
- **`product_variant_stock`** (variant_id, taille, quantité) — la grille stock par taille × couleur, reprise à l'identique de l'éditeur produit existant. La logique de mise à jour du stock doit uniquement modifier la variante/taille concernée (cohérent avec les corrections de bugs déjà faites sur la version vanilla : pas de perte de stock sur les autres tailles/couleurs lors d'une modification).
- **`promo_codes`** (id, code, type de réduction, valeur, actif, date d'expiration).
- **`orders`** (id, numéro de commande, nom client, email, adresse, téléphone, total, moyen de paiement, statut, date de création). Le statut reste une énumération fermée : "En attente" / "Payée" / "Expédiée" / "Annulée".
- **`order_items`** (id, order_id, titre article, prix, nom variante, taille, quantité) — **stocke un instantané** (copie) des informations au moment de l'achat, jamais une référence en direct vers le produit courant. C'est le comportement déjà en place aujourd'hui (le tableau `items[]` d'une commande est une copie figée) ; ce point est rendu explicite dans le nouveau schéma pour éviter qu'une modification future de prix/titre ne fausse rétroactivement l'historique des commandes.
- **`admin_users`** (id, email, mot de passe haché).

## 5. Migration des données réelles

Script de migration exécuté une seule fois (pas un système permanent) :

1. Lit les données actuelles depuis `js/db.js` : produits réels, catégories/sous-catégories, codes promo réels, commandes existantes (y compris les commandes de démonstration).
2. Génère un slug pour chaque produit et catégorie/sous-catégorie.
3. Télécharge chaque photo existante (`images/...`) et la réuploade vers Vercel Blob ; remplace les chemins locaux par les nouvelles URLs dans `product_images`.
4. Insère l'ensemble dans Neon via Prisma.

Une fois exécuté, Neon devient l'unique source de vérité pour l'admin — `js/db.js` n'est plus lu par le nouveau dashboard (le site vanilla actuel continue de fonctionner de façon autonome jusqu'à ce que la vitrine Next.js le remplace, à l'étape suivante).

## 6. Dashboard admin (portage Bloom → Next.js)

Toutes les fonctionnalités déjà conçues et implémentées dans la refonte "Bloom" (nav du haut à 6 onglets, 4 cartes KPI réelles avec tendances, graphique CA avec bascule Semaine/Mois et infobulle, jauge de taux de réussite, aperçu des commandes récentes, aperçu des ventes avec répartition et top produits, export CSV réel, gestion produits/catégories/promos) sont **reconduites à l'identique visuellement et fonctionnellement**, mais reconstruites :

- En composants React (plus de manipulation DOM manuelle via des IIFE).
- Les données sont lues et écrites via des routes API Next.js (ou Server Actions) interrogeant Neon via Prisma, plus jamais `localStorage`.
- L'accès à l'ensemble du dashboard est protégé par l'authentification email/mot de passe — aucune page admin n'est accessible sans connexion.
- Les icônes restent en SVG inline, dans la continuité du style "premium SaaS" déjà établi.

## 7. Hors périmètre pour cette étape

- La vitrine publique (pages produits/catégories, panier, tunnel de commande) — étape suivante.
- Le routing i18n (`/fr-fr/`, `/fr-ci/`, `/en-gb/`) et toute optimisation SEO (hreflang, sitemap, données structurées) — étape suivante, une fois la vitrine construite.
- L'intégration réelle de Stripe ou de tout moyen de paiement — étape dédiée aux paiements.
- La gestion des fiches clients — reste un placeholder "bientôt disponible", comme dans le dashboard Bloom actuel.

## 8. Vérification

- Le dashboard Next.js déployé sur Vercel affiche les vraies données (produits, catégories, commandes, codes promo) migrées depuis `js/db.js`, identiques à ce qui existe aujourd'hui.
- La connexion admin (email/mot de passe) protège effectivement toutes les routes du dashboard.
- Toutes les photos produit (existantes et nouvelles) se chargent depuis Vercel Blob, sans chemin local cassé.
- Chaque widget du dashboard (KPI, graphique, jauge, commandes récentes, aperçu des ventes, export CSV) reproduit fidèlement le comportement déjà validé dans la version vanilla, avec des données réelles issues de Neon.
- Aucune régression sur les fonctionnalités de gestion (produits, catégories, codes promo) déjà éprouvées dans la version vanilla.

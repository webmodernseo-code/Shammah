# Spécification — Refonte "Bloom" du Dashboard Admin, Phase 1 : Socle de Navigation + Dashboard

## 1. Contexte et portée

L'utilisateur a fourni une maquette de référence (template "Bloom") : un dashboard e-commerce à nav horizontale, palette indigo/violet sur fond clair, avec 6 sections (Dashboard, Products, Orders, Customers, Attributes, + nos codes promo). La refonte complète est découpée en 6 phases indépendantes, chacune avec son propre cycle spec → plan → implémentation :

1. **Socle de navigation + Dashboard** (ce document)
2. Produits (liste + modale Add/Edit)
3. Commandes (liste + modale détail)
4. Clients (nouvelle notion de fiche client)
5. Attributs (Catégories/Sous-catégories/Tailles/Couleurs)
6. Profil & Paramètres (nouvelle page)

Principe directeur validé avec l'utilisateur : **reproduire fidèlement le visuel de Bloom, tout en gardant le dashboard 100% fonctionnel** — aucune donnée affichée ne doit être fictive/statique quand une donnée réelle existe déjà ou peut être calculée depuis les données existantes (commandes, produits, catégories). Le style doit viser un rendu "premium SaaS" (Stripe et consorts) : icônes en SVG partout, jamais de raster pour les éléments d'interface.

Contexte additionnel (non actionnable maintenant) : l'utilisateur prévoit une migration future vers Next.js/Tailwind, mais tout le travail actuel reste en HTML/CSS/JS vanilla, sans dépendance ni build step, cohérent avec le reste du projet.

## 2. Hors périmètre pour cette phase

- Les pages Produits, Commandes (version complète), Clients, Attributs, Profil & Paramètres — chacune fera l'objet de sa propre phase.
- Mode sombre : retiré de la nouvelle nav (le code existant dans `admin/js/ui-kit.js` n'est pas supprimé, il devient simplement non-invoqué — les boutons `#theme-toggle-btn`/`#sidebar-toggle-btn` n'existant plus dans le nouveau HTML, les fonctions d'init concernées deviennent des no-op sûrs grâce à leurs gardes existantes `if (!btn) return;`).
- Un vrai sélecteur de calendrier pour la plage de dates (remplacé par un menu déroulant de préréglages, voir §5).
- Un vrai système de notifications derrière la cloche (icône statique pour cette phase).

## 3. Nav du haut

Remplace entièrement `.sidebar` et la grille `260px 1fr` de `.app-container`. Nouvelle structure : barre fixe en haut (~72px), contenu principal en dessous en pleine largeur, scrollable.

**Contenu de la barre, de gauche à droite :**
- Logo : le SVG brand-mark existant (`images/logo-shammah.svg`, déjà utilisé) + wordmark "SHAMMAH" — pas le logo de Bloom, seul le style de mise en page (icône + texte) est repris.
- 6 onglets en pilule, dans cet ordre : **Dashboard, Produits, Commandes, Clients, Attributs, Promotions**. Onglet actif = fond `--accent-primary` plein, texte blanc, coins arrondis complets (pill). Onglets inactifs = texte gris, fond transparent, survol = fond gris très clair.
- Cloche de notification (icône SVG, pas de menu déroulant pour cette phase).
- Bloc utilisateur : avatar (cercle initiale, réutilise `.user-avatar` existant), nom "Administrateur", rôle "Super Admin", chevron. Au clic : petit menu avec "Profil & Paramètres" (lien vers la Phase 6, désactivé/grisé tant qu'elle n'existe pas) et "Déconnexion" (décoratif, pas de système d'authentification).

La logique de bascule d'onglet (`admin/js/app.js`, `setupNavigation`) reste inchangée : elle fonctionne déjà de façon générique sur `[data-target]`/`.workspace-panel`, seul le HTML autour est déplacé de la sidebar vers la nav du haut. Le raccourci clavier ⌘K (palette de commandes, `admin/js/ui-kit.js`) reste actif tel quel, sans champ de recherche visible dans la nav (la maquette n'en a pas).

## 4. Design tokens

Nouvelles variables CSS (remplacent partiellement celles de `admin/admin.css`, le mode sombre n'étant plus câblé, ces valeurs n'ont pas besoin d'un pendant `data-theme="dark"`) :

```css
--page-bg: #F6F6FB;
--card-bg: #FFFFFF;
--accent-primary: #6C63FF;
--accent-primary-hover: #5A52E0;
--status-blue: #3B82F6;   /* En cours */
--status-amber: #F59E0B;  /* En attente */
--status-green: #22C55E;  /* Terminé / Actif */
--status-red: #EF4444;    /* Annulé / Remboursement */
--text-heading: #111827;
--text-body: #6B7280;
--card-radius: 16px;
--card-shadow: 0 4px 24px rgba(17, 24, 39, 0.06);
```

Cartes : fond blanc, sans bordure, `--card-shadow`, `--card-radius`. Police Inter conservée ; chiffres de KPI en `font-weight: 800`, taille augmentée par rapport à l'existant.

**Convention SVG** : chaque icône (nav, KPI, statuts, chevrons, cloche, glyphes de graphique) est un SVG inline, dans le même style trait-fin que l'existant (`stroke="currentColor"`, `stroke-width="2"`). Aucune image raster sauf les vraies photos produit.

## 5. Page Dashboard

### 5.1 En-tête
"Bonjour, Administrateur 👋" + sous-titre "Gérez produits, commandes, clients et performance en un seul endroit." À droite : sélecteur de plage de dates (menu déroulant stylé en pilule avec icône calendrier — options **"7 derniers jours"**, **"30 derniers jours"**, **"Tout"**, valeur par défaut "7 derniers jours") et bouton "Exporter le rapport".

**Sélecteur de dates** : filtre réellement les 4 cartes KPI (§5.2), la jauge "Taux de Réussite" (§5.4) et l'Aperçu des Ventes (§5.6) en ne gardant que les commandes dont `order.date` (format `dd/mm/yyyy`) tombe dans la fenêtre choisie ; "Tout" ne filtre rien. Le graphique "Chiffre d'Affaires" (§5.3) et le tableau "Commandes Récentes" (§5.5) ont leur propre fenêtre fixe et ne sont **pas** affectés par ce sélecteur (voir §5.3).

**Exporter le rapport** : construit une chaîne CSV à partir des KPI affichés et des commandes du tableau "Commandes Récentes" (§5.4), puis déclenche un téléchargement navigateur via `Blob` + `<a download="rapport-shammah-AAAA-MM-JJ.csv">`. Aucun appel serveur.

### 5.2 Cartes KPI (4)

Chacune : icône SVG en cercle coloré, titre, valeur, badge de variation en % (vert si positif, rouge si négatif) vs la période précédente de même durée.

| Carte | Calcul |
|---|---|
| Ventes Totales | `orders.filter(o => o.status !== "Annulée").length` sur la période sélectionnée |
| Chiffre d'Affaires | somme des `total` où `status !== "Annulée"` (logique déjà existante dans `dashboard.js`) |
| Clients Actifs | nombre de valeurs distinctes de `order.email \|\| order.phone` sur la période (approximation en attendant la vraie fiche client de la Phase 4) |
| Demandes de Remboursement | `orders.filter(o => o.status === "Annulée").length` |

La variation % compare la période sélectionnée à la période immédiatement précédente de même durée (ex. "7 derniers jours" vs les 7 jours avant ça) ; pour "Tout", pas de comparaison possible → badge masqué.

### 5.3 Graphique "Chiffre d'Affaires" (barres + tooltip)

SVG fait main (même approche que l'actuelle courbe animée). Bascule Semaine/Mois conservée, **indépendante du sélecteur de plage de dates de l'en-tête** (§5.1) — exactement comme aujourd'hui, ce graphique gère sa propre fenêtre temporelle fixe, non affectée par le filtre de la page :
- **Semaine** : 7 barres (Lun-Dim), fenêtre fixe = les 7 derniers jours, hauteur = somme du CA du jour.
- **Mois** : 4-5 barres (une par semaine), fenêtre fixe = les ~5 dernières semaines, hauteur = somme du CA de la semaine.

Le sélecteur de plage de dates de l'en-tête ne filtre que les KPI (§5.2), la jauge (§5.4) et l'aperçu des ventes (§5.6) — pas ce graphique, pour éviter un double filtrage confus (ex. "7 derniers jours" + bascule "Mois" donnerait des fenêtres incohérentes entre elles).

Survol d'une barre : tooltip affichant la date exacte, le nombre de commandes, et le CA de ce jour/cette semaine (remplace le tooltip statique actuel). Badge de tendance en haut à droite : % vs période précédente équivalente (même jeu de données que la bascule active, pas lié au sélecteur de plage de dates).

### 5.4 Jauge radiale "Taux de Réussite"

Nouveau composant SVG : arc semi-circulaire composé de segments radiaux (style "barres en éventail" de la maquette), rempli proportionnellement au taux de réussite :

```
taux = orders.filter(o => o.status === "Payée" || o.status === "Expédiée").length
       / orders.filter(o => o.status !== "Annulée").length * 100
```

Sous la jauge : deux mini-cartes "Ventes" (nombre de commandes réussies + %) et "Chiffre d'Affaires" (CA correspondant + %), réutilisant les KPI déjà calculés.

### 5.5 Commandes Récentes

Aperçu en **lecture seule** des 5 dernières commandes (pas de recherche/filtre/changement de statut ici — cette interactivité est réservée à la vraie page Commandes de la Phase 3, pour éviter de dupliquer cette logique). Colonnes : miniature produit (première image du premier article) + titre + "+N autres articles" si plusieurs, client, date, montant, statut (badge coloré, non éditable dans cette vue).

### 5.6 Aperçu des Ventes

- Légende à 3 catégories avec % réel : **Réussies** (Payée+Expédiée), **En attente** (En attente), **Annulées** (Annulée), calculés sur la période sélectionnée.
- Visualisation en barres verticales fines multicolores (~50 segments), répartition proportionnelle aux 3 %.
- Tableau "Produits les plus vendus" : agrège `order.items` de toutes les commandes de la période (qty × price), groupé par titre d'article, trié décroissant, top 3-4 affichés avec % de part du CA total et montant gagné.

## 6. Impact technique (fichiers concernés)

- `admin/index.html` : remplacement de la structure sidebar par la nav du haut ; les 6 panneaux existants (`panel-dashboard`, `panel-orders`, `panel-products`, `panel-promos`, `panel-settings` renommé conceptuellement, futur `panel-customers`) restent des `.workspace-panel` avec `[data-target]`, seule leur nav d'accès change de conteneur.
- `admin/admin.css` : nouveaux tokens (§4), nouveaux styles de nav horizontale, cartes sans bordure, nouveaux composants graphiques.
- `admin/js/dashboard.js` : réécriture substantielle — vrais calculs de tendance, sélecteur de plage de dates, nouveau graphique à barres avec tooltip, jauge radiale, aperçu des ventes avec agrégation d'articles, export CSV.
- `admin/js/app.js` : nav de bascule inchangée dans sa logique, juste re-câblée sur les nouveaux éléments DOM.
- `admin/js/ui-kit.js` : aucune suppression ; le thème sombre et le repli de sidebar deviennent des no-op silencieux (gardes déjà existantes), la palette ⌘K reste active.
- Aucune modification de `js/db.js` : tous les calculs de cette phase sont dérivés à l'affichage depuis `getOrders()`/`getProducts()` existants, aucune nouvelle donnée persistée n'est nécessaire.

## 7. Vérification

- Comparaison visuelle avec la maquette Bloom fournie (nav, cartes, graphiques) dans un navigateur réel.
- Vérifier que les 4 KPI, le graphique à barres, la jauge et l'aperçu des ventes changent bien quand on bascule le sélecteur de plage de dates.
- Créer/modifier des commandes de test et confirmer que chaque widget reflète les vraies données (aucune valeur figée en dur ne doit rester).
- Confirmer qu'aucune icône raster n'est utilisée pour l'interface (uniquement SVG), à l'exception des vraies photos produit.
- Confirmer que le mode sombre et le repli de sidebar ne provoquent aucune erreur JS maintenant que leurs boutons n'existent plus dans le DOM.

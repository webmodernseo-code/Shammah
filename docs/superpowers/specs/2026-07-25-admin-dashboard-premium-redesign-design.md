# Spécification — Refonte Premium & Audit du Dashboard Admin SHAMMAH

## 1. Objectif

Corriger les bugs identifiés lors de l'audit du dashboard admin (`admin/`), élever son rendu visuel au niveau d'un SaaS premium (type Linear/Stripe/Shopify), et refondre en profondeur l'expérience de gestion des produits à variantes (couleurs, tailles, photos, stock). Quelques touches de cohérence (logos SVG des moyens de paiement) sont aussi apportées à la boutique vitrine (`index.html`).

Aucun changement de backend : l'application reste 100% statique (HTML/CSS/JS vanilla), adossée à `localStorage` via `js/db.js`, sans bundler ni framework.

## 2. Audit — Bugs à corriger

| # | Bug | Cause racine | Correction |
|---|-----|--------------|------------|
| 1 | Modifier le stock d'une seule taille dans le tableau d'inventaire écrase le stock des autres tailles de la même couleur (remis à 0) | `loadInventoryList()` recalcule une répartition de secours (`sizesStock`) à l'affichage mais ne la sauvegarde jamais ; `updateVariantSizeStock()` part donc d'un objet `sizesStock` incomplet et recalcule le total uniquement à partir de la taille modifiée | Persister la répartition de secours dès qu'elle est calculée (`window.db.saveProduct(p)`), et rendre `updateVariantSizeStock` défensif : compléter toute taille manquante (union avec `p.sizes`) avant de recalculer les totaux |
| 2 | Les tailles affichées en édition sont fausses pour les produits dont les tailles ne sont pas génériques (ex : Pantalon Chino en 30/32/34/36, Casquette en Taille Unique) | `getSelectedProductSizes()` déduit toujours la liste de tailles depuis la catégorie sélectionnée, jamais depuis le produit réel | Supprimer `getSelectedProductSizes()`. Les tailles deviennent un état explicite par produit (éditeur de chips, voir §6.2), initialisé depuis `p.sizes` en édition, jamais recalculé depuis la catégorie |
| 3 | Les quantités de stock saisies pendant la création/édition d'un produit sont perdues dès qu'on ajoute une nouvelle couleur ou change de catégorie | `renderActiveVariants()` reconstruit tout le HTML à partir du tableau `activeVariants`, qui n'est mis à jour qu'au moment de publier (les `<input>` de stock n'ont pas d'écouteur live) | Chaque `<input>` de stock (et les chips de taille) écrit directement dans l'état en mémoire à chaque changement (`input`/`change`). Les opérations locales (ajouter une couleur, supprimer une couleur) ne redessinent que le nœud concerné, jamais toute la liste |
| 4 | Le dashboard affiche des commandes et KPI 100% fictifs et figés ; les vraies commandes passées via le checkout boutique (`window.db.saveOrder`) ne sont jamais lues nulle part dans l'admin ; le panneau "Commandes" prévu dans la spec d'origine n'existe pas | `loadOverviewMetrics()` contient un tableau de commandes codé en dur ; aucun appel à `window.db.getOrders()` dans tout `admin.js` | Nouveau panneau "Commandes" (§7) branché sur `getOrders()`/`updateOrderStatus()`. KPI, graphique et widget "Dernières Commandes" recalculés à partir des vraies données, avec un jeu de commandes de démonstration pré-rempli au premier lancement (même logique que `DEFAULT_PRODUCTS`) |
| 5 | `deleteProduct` contourne `js/db.js` (accès direct à `localStorage`) ; aucune suppression possible pour catégories/sous-catégories ; tous les messages passent par `alert()`/`confirm()` du navigateur | Logique ad-hoc historique | Ajouter `deleteProduct`, `deleteCategory` (cascade sur ses sous-catégories), `deleteSubcategory`, `updateOrderStatus` à `ShammahDB`. Ajouter la suppression dans l'arbre de catégories. Remplacer tous les `alert()`/`confirm()` par le système de toasts / modale de confirmation (§5.3) |

## 3. Architecture des fichiers

`admin/admin.js` (997 lignes) est déjà surchargé ; la refonte l'aurait fait grossir bien davantage. Découpage en modules, chacun encapsulé dans une IIFE (`(function(){ ... })();`) pour éviter de polluer le scope global — seule une API explicite est exposée sur `window` (ex. `window.Toast`, `window.ConfirmModal`, `window.VariantEditor`), à l'image de ce que fait déjà `window.db`.

```
admin/
  index.html
  admin.css                (étendu : thème sombre, drawer, chips, dropzone, toasts, palette ⌘K)
  js/
    ui-kit.js               → Toast, ConfirmModal, gestion thème clair/sombre, repli de la sidebar, palette de commandes ⌘K
    variant-editor.js         → Éditeur de variantes (chips de taille, dropzones photo drag & drop, aperçu live) — utilisé par products.js
    dashboard.js             → KPI, graphique de performance, panneau Commandes + widget "Dernières Commandes"
    categories.js            → Panneau Configuration (catégories/sous-catégories, avec suppression)
    promos.js                → Panneau Codes Promo (logique actuelle, portée telle quelle + toasts)
    products.js               → Table d'inventaire + drawer de création/édition de produit
    app.js                    → Bootstrap (DOMContentLoaded, navigation des panneaux, init de chaque module dans l'ordre)
js/db.js                     (étendu, voir §8)
```

`admin/index.html` charge les scripts dans cet ordre : `../js/db.js`, `ui-kit.js`, `variant-editor.js`, `dashboard.js`, `categories.js`, `promos.js`, `products.js`, `app.js`.

## 4. Portée

**Dans le périmètre** : tout `admin/`, extensions de `js/db.js`, et dans `index.html`/`js/shammah.js` uniquement les badges de paiement du footer (remplacement du texte brut par des icônes SVG).

**Hors périmètre** (pour garder un chantier livrable) :
- Pas de backend/Supabase — architecture `localStorage` inchangée.
- Pas de blocage de l'ajout au panier en fonction du stock côté boutique (comportement actuel conservé).
- Pas de changement à la logique du tunnel de commande, seule sa charte d'icônes SVG est réutilisée ailleurs.
- Pas de système de comptes/auth pour l'admin (reste un utilisateur "Administrateur" unique).
- Pas d'édition de catégories existantes (ajout + suppression seulement).
- Le logo de la boutique vitrine (wordmark texte "SHAMMAH") n'est pas remplacé — seul le dashboard admin reçoit le monogramme SVG (§5.4).

## 5. Coquille du dashboard (identité premium)

### 5.1 Sidebar rétractable
Bouton de bascule en bas de `sidebar-top`. En mode replié (72px au lieu de 260px) : icônes seules avec tooltip au survol, zone de recherche masquée. Largeur animée en transition CSS. État persisté (`localStorage: shammah_admin_sidebar_collapsed`).

### 5.2 Thème clair/sombre
Attribut `data-theme="light"|"dark"` sur `<html>`, bascule accessible depuis la carte utilisateur. Toutes les variables CSS (`--bg-primary`, `--bg-panel`, `--text-primary`, `--border-light`, etc.) redéfinies sous `:root[data-theme="dark"]`. Persisté (`localStorage: shammah_admin_theme`) ; à défaut, suit `prefers-color-scheme`.

### 5.3 Toasts & modale de confirmation
`Toast.show(message, type)` (`success`/`error`/`info`) : empilement en bas à droite, disparition auto ~3.5s, anime légèrement à l'entrée/sortie. `ConfirmModal.open({ title, message, confirmLabel, danger }) → Promise<boolean>` : remplace tous les `window.confirm()`. Ces deux briques remplacent l'intégralité des `alert()`/`confirm()` du code actuel.

### 5.4 Logo SVG & palette de commande
Monogramme SVG original (mark géométrique minimaliste cohérent avec la baseline "Minimalisme & Raffinement" déjà utilisée côté boutique) affiché dans la sidebar (pleine largeur et version repliée icône seule) et utilisé comme favicon de `admin/index.html`.

La zone de recherche `⌘K` (actuellement un `<input readonly>` décoratif) devient fonctionnelle : `Ctrl/Cmd+K` ou clic dessus ouvre une palette de commandes modale listant la navigation rapide entre panneaux et une recherche texte simple (sous-chaîne, pas de fuzzy-matching) sur les titres de produits ; sélectionner un résultat ouvre directement le drawer d'édition de ce produit (§6).

## 6. Panneau Produits — refonte de l'éditeur de variantes

### 6.1 Passage à un panneau latéral ("drawer")
Le formulaire de création, aujourd'hui affiché en permanence à côté du tableau d'inventaire, devient un **drawer** coulissant depuis la droite (~680px, overlay + scroll interne), ouvert par le bouton "Nouveau produit" (au-dessus du tableau, qui passe en pleine largeur) ou par "Modifier" sur une ligne. Fermeture par l'overlay, Échap, ou bouton Annuler — si des changements sont en attente, `ConfirmModal` demande confirmation avant de fermer. Pied de drawer collant avec les boutons Annuler / Publier (ou "Enregistrer les modifications" en édition).

Contenu du drawer, en un seul défilement (pas d'onglets) :
1. **Informations générales** : titre, prix, catégorie, sous-catégorie, description, code promo associé — reprend les champs actuels.
2. **Tailles & Variantes de couleur** (§6.2).
3. **Aperçu en direct** (§6.3).

### 6.2 Tailles & variantes de couleur
- **Éditeur de tailles en chips** : liste de tags ajoutables/supprimables par produit (remplace `getSelectedProductSizes()`, corrige le bug #2). Pour un **nouveau** produit, changer la catégorie pré-remplit des chips suggérées (mêmes valeurs par défaut qu'aujourd'hui : S/M/L/XL, tranches d'âge pour Enfant, Taille Unique pour Gadget) mais reste librement éditable. En **édition**, les chips s'initialisent depuis `p.sizes` réel et ne sont jamais recalculées depuis la catégorie.
- **Carte par couleur** : nom + pastille de couleur, poignée `⠿` pour réordonner les couleurs par glisser-déposer, bouton supprimer.
  - **Dropzone photo drag & drop** (3 emplacements par couleur, inchangé) : dépose ou clic pour choisir un fichier, aperçu miniature, bouton ✕ au survol pour retirer une photo, glisser-déposer pour réordonner les 3 photos entre elles.
  - **Mini-grille de stock par taille**, une entrée par chip de taille active ; chaque `<input>` écrit dans l'état en mémoire à chaque changement (corrige le bug #3).
- Toute opération qui ajoute/retire une couleur ou une taille ne redessine que le nécessaire ; avant tout redessin complet (ex. modification globale des chips de taille affectant toutes les cartes), l'état en mémoire est d'abord resynchronisé depuis les `<input>` visibles à l'écran.

### 6.3 Aperçu produit en direct
Mini rendu, mis à jour à chaque frappe/changement pertinent, imitant la carte produit de la boutique (image principale, badge catégorie, badge code promo si renseigné, titre, prix) — donne un retour visuel immédiat sans devoir ouvrir la boutique dans un autre onglet.

### 6.4 Modèle de données
Inchangé côté stockage : `product.sizes: string[]`, `variant.sizesStock: {[taille]: number}`, `variant.images: string[]`, `variant.img` (miniature). Seule la façon dont l'admin construit/lit ces champs change — aucune migration de données nécessaire, compatible avec les produits déjà en `localStorage`.

## 7. Nouveau panneau "Commandes"

Ajouté entre "Vue d'ensemble" et "Gestion Articles" dans la sidebar (ordre de la spec d'origine). Tableau : N° commande, client, date, total, moyen de paiement (icône SVG + libellé), statut (badge + menu déroulant pour changer : *En attente → Payée → Expédiée*, ou *Annulée*), bouton pour voir l'adresse/détail des articles. État vide illustré si aucune commande.

Le widget "Dernières Commandes" et les KPI de la Vue d'ensemble se recalculent à partir de `window.db.getOrders()` :
- **Chiffre d'affaires** = somme des `total` des commandes dont le statut ≠ *Annulée*.
- **Commandes actives** = nombre de commandes au statut *En attente* ou *Payée*.
- **Panier moyen** = CA ÷ nombre de commandes non annulées.

Au premier lancement (`shammah_db_orders` absent), un jeu de 4 commandes de démonstration est inséré (mêmes valeurs que les données fictives actuelles), pour ne pas présenter un dashboard vide ; toute commande réelle passée ensuite via le checkout s'ajoute normalement à cette liste.

## 8. Extensions de `js/db.js`

- `deleteProduct(id)`
- `deleteCategory(slug)` — supprime aussi toutes les sous-catégories dont `category_slug === slug`
- `deleteSubcategory(categorySlug, slug)`
- `updateOrderStatus(orderId, status)`
- `DEFAULT_ORDERS` (4 commandes de démonstration, même forme que l'objet créé par `js/shammah.js` : `{id, date, client, email, address, phone, total, method, status, items}`) : utilisé pour initialiser `shammah_db_orders` si la clé est **absente ou vide** (et non plus seulement absente, pour rester cohérent avec l'installation actuelle où elle a déjà été initialisée à `[]`)

## 9. Icônes SVG des moyens de paiement

Réutilisation des marques SVG déjà dessinées pour les opérateurs Mobile Money du checkout (Orange, MTN, Wave) plus une icône générique carte bancaire, dans :
- La colonne "Moyen" du nouveau panneau Commandes et du widget "Dernières Commandes".
- Les badges de confiance du footer de la boutique (`index.html`), qui passent de pastilles texte brut à icône + libellé.

## 10. Vérification

Vérification manuelle dans un navigateur (via un serveur local) :
- Créer un produit avec des tailles personnalisées (ex. tour de taille), l'éditer, confirmer qu'aucune quantité ni taille n'est perdue en cours de route.
- Ajouter plusieurs couleurs avec photos (drag & drop), vérifier l'aperçu en direct, réordonner couleurs et photos.
- Passer une commande réelle depuis la boutique et vérifier qu'elle apparaît dans le panneau Commandes et impacte les KPI.
- Bascule thème sombre et repli de sidebar : vérifier la persistance après rechargement.
- Palette ⌘K : navigation entre panneaux et recherche produit fonctionnelles.
- Confirmer qu'aucun `alert()`/`confirm()` natif ne subsiste (remplacés par toasts/modale).

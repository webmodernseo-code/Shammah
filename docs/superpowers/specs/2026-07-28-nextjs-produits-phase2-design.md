# Spécification — Plan B, Chantier 2 : Produits (port Next.js)

## 1. Contexte et portée

Le chantier 1 (nav + dashboard) est livré et fusionné dans `main`. Ce chantier porte la page "Produits" — jusqu'ici un placeholder "en construction" — vers une gestion réelle du catalogue, branchée sur Postgres via les routes `/api/products` déjà construites et durcies pendant l'audit du Plan A.

Référence fonctionnelle : le panneau "Gestion du Catalogue" actuellement fonctionnel en vanilla (`admin/js/products.js`, non encore restylé Bloom) — tableau d'inventaire avec édition de stock en ligne, tiroir Créer/Modifier avec éditeur de variantes couleur et aperçu en direct.

## 2. Décisions prises avec l'utilisateur

- **Upload de photos** : pas de vrai upload de fichier pour ce chantier (Vercel Blob reste non configuré, token à fournir plus tard). Le champ image est un **input texte pour l'URL de l'image** — une fois le token Blob disponible, un futur chantier ajoutera l'upload réel sans changer la structure de données (`ProductImage.url` reste une simple chaîne).
- **Code promo par produit** : abandonné. Les codes promo restent uniquement saisis au checkout (comportement déjà supporté par le schéma actuel) — pas de lien `Product` ↔ `PromoCode`.
- **Aperçu en direct** : conservé (miniature + titre + prix + badge catégorie, mis à jour à la saisie), comme en vanilla.

## 3. Hors périmètre

- Upload réel de fichier image (Vercel Blob) — futur chantier, une fois le token fourni.
- Génération/édition du catalogue de tailles et couleurs "globales" (ça, c'est le chantier Attributs).
- Fiche client / historique d'achat par client (chantier Clients).

## 4. Page Produits (`/produits`)

Remplace le `ComingSoonPanel` actuel. Composant serveur asynchrone qui lit directement via Prisma (`prisma.product.findMany` avec `category`, `subcategory`, `variants.images`, `variants.stock`) — même approche que le Dashboard (chantier 1), pas de nouvel appel API pour la lecture de la page elle-même.

### 4.1 Tableau d'inventaire

Une ligne par produit : miniature (première image de la première variante, repli si absente comme sur les Commandes Récentes), titre, prix, catégorie, **bloc stock détaillé** (une ligne par variante × taille, avec un `<input type="number">` modifiable directement), badge de statut (`OK` si stock total ≥ 3, `Stock Faible` sinon — seuil identique au vanilla), boutons Modifier / Supprimer.

### 4.2 Édition de stock en ligne

Composant client `StockInput` : à la perte de focus (`onBlur`) ou sur Entrée, appelle `PATCH /api/products/[id]/stock` (nouvelle route, voir §6) avec `{ variantId, size, quantity }`. Une quantité négative ou non numérique est ramenée à 0 côté client avant l'appel (même règle que le vanilla `Math.max(0, parseInt(...) || 0)`). Affiche un `Toast` de confirmation (`useToast()`, déjà câblé dans le layout racine) et met à jour l'affichage local sans recharger toute la page.

### 4.3 Suppression

Réutilise le composant `ConfirmModal` existant (`components/ConfirmModal.tsx`) : "Voulez-vous vraiment supprimer cet article de la boutique ?" / confirmation rouge "Supprimer". Appelle `DELETE /api/products/[id]` (route existante). `Toast` de succès, retire la ligne de la liste.

## 5. Tiroir Créer/Modifier

Composant client `ProductDrawer`, ouvert par le bouton "+ Nouveau produit" (création) ou "Modifier" sur une ligne (édition) — même tiroir pour les deux cas, comme en vanilla.

### 5.1 Informations générales

Nom (requis), Prix (requis, nombre), Catégorie (menu déroulant, requis), Sous-Catégorie (dépend de la catégorie choisie, se recalcule au changement de catégorie), Description (texte libre).

### 5.2 Éditeur de variantes couleur

Composant `VariantEditor` (état géré par le parent `ProductDrawer`, pas de composant non contrôlé) :
- Liste des variantes couleur, chacune avec : nom de la couleur, sélecteur de couleur (`<input type="color">`), une ou plusieurs images (input URL, bouton "+ image"), un stock par taille.
- Tailles suggérées selon la catégorie choisie (identique au vanilla) : Gadget → `["Taille Unique"]`, Enfant → `["2 ans", "4 ans", "6 ans", "8 ans"]`, sinon → `["S", "M", "L", "XL"]`. Changer la catégorie en cours de création recalcule les tailles proposées (mais ne touche pas aux variantes déjà saisies si on est en édition).
- Bouton "+ Couleur" : ajoute une variante vide avec les tailles suggérées, stock à 0.
- Bouton de suppression par variante.

### 5.3 Aperçu en direct

Mis à jour à chaque frappe : miniature (première image de la première variante, ou repli), titre, prix formaté, badge catégorie.

### 5.4 Fermeture et validation

- Fermeture (croix, bouton Annuler, clic hors du tiroir, touche Échap) : si le formulaire a été modifié, demande confirmation via `ConfirmModal` ("Fermer sans enregistrer ?" / "Les modifications non publiées seront perdues.") avant de fermer.
- Validation à la publication : nom et prix requis, au moins une variante, la première variante doit avoir au moins une image renseignée. Erreurs affichées via `Toast` (type erreur), pas de blocage silencieux.
- Publication : `POST /api/products` (création) ou `PUT /api/products/[id]` (édition) — routes existantes, format de variantes déjà attendu : `{ colorName, colorHex, images: [{url, sortOrder}], stock: [{size, quantity}] }`.

## 6. Architecture technique

- `app/(admin)/produits/page.tsx` : remplace le placeholder, composant serveur, lecture Prisma directe.
- `app/api/products/[id]/stock/route.ts` (nouveau) : `PATCH`, protégée par la même vérification de session que les autres routes admin (`await auth()`, 401 sinon), met à jour uniquement `ProductVariantStock` pour un `(variantId, size)` donné — évite de passer par le `PUT /api/products/[id]` existant (qui supprime/recrée toutes les variantes à chaque appel, repéré comme un point faible pendant l'audit du Plan A) pour une simple modification de quantité.
- `components/products/ProductsTable.tsx`, `StockInput.tsx` (client), `ProductDrawer.tsx` (client), `VariantEditor.tsx` (client), `ProductPreviewCard.tsx` (nouveaux).
- Réutilisation directe (aucune modification) : `ConfirmModal.tsx`, `useToast()`.
- Aucune modification du schéma Prisma nécessaire.

## 7. Vérification

- Scripts Playwright (convention PASS/FAIL du projet) contre la vraie base migrée :
  - la liste affiche les 19 vrais produits avec leur stock par variante/taille ;
  - modifier une quantité de stock en ligne persiste (rechargement de la page confirme la nouvelle valeur) sans toucher aux autres variantes ;
  - supprimer un produit de test le retire de la liste et de la base ;
  - ouvrir "Nouveau produit", remplir le formulaire, ajouter 2 couleurs avec tailles/stock, publier — le produit apparaît dans la liste avec les bonnes variantes ;
  - modifier un produit existant, changer la catégorie, confirmer que les tailles suggérées se mettent à jour ;
  - fermer le tiroir avec des modifications non enregistrées déclenche la confirmation ; annuler la fermeture garde le tiroir ouvert et les données saisies ;
  - publier sans nom/prix ou sans variante affiche l'erreur attendue, ne crée rien en base ;
  - l'aperçu en direct reflète le titre/prix/catégorie saisis.

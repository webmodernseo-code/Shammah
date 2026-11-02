# 📖 Guide de Méthode & Catalogue — Vineta (Next.js 15)

Ce document sert de **mode d'emploi direct** pour créer rapidement n'importe quel site e-commerce à partir de ce template.

---

## ⚡ Méthode Rapide : Comment créer un nouveau site en 3 étapes

### Étape 1 : Dupliquer le dossier
Ne travaillez pas directement dans le dossier original du template.
1. Copiez le dossier `Vineta` et collez-le dans `PROJET WEB/<Nom-Du-Nouveau-Projet>`.
2. Ouvrez le projet dans votre terminal ou IDE.
3. Installez les dépendances :
   ```bash
   npm install
   ```

---

### Étape 2 : Choisir et activer la page d'accueil de niche
Toutes les pages d'accueil préconçues se trouvent dans `app/(homes)/`.
Pour définir la page d'accueil par défaut de votre nouveau site :
* Ouvrez `app/page.jsx`.
* Modifiez l'import pour charger la variante souhaitée (par exemple `HomePageFashionWomen`, `HomePageElectronic`, `HomePageSkincare`, etc.).

---

### Étape 3 : Remplacer les données et les images
Tous les contenus sont centralisés dans le dossier `data/` :
* `data/products.js` : Catalogue produits (titres, prix, images, variantes).
* `data/menu.js` : Navigation et liens du menu header.
* `data/heroSlides.js` : Bannières défilantes de la page d'accueil.
* `data/testimonials.js` : Avis clients.
* `data/blogs.js` : Articles de blog.
* `public/images/` : Déposez vos propres images et logos.

Lancez le serveur local :
```bash
npm run dev
```
Votre site est prêt sur `http://localhost:3000`.

---

## 🗂️ Catalogue Complet des 23 Pages d'Accueil (Niches)

| Niche / Secteur | Dossier Route dans `app/(homes)/` | Description & Ambiance |
| :--- | :--- | :--- |
| 👗 **Mode Femme** | `home-fashion-women` | Design épuré, lookbooks, grilles éditoriales |
| 👕 **Mode Générale (v2)** | `home-fashion-02` | E-commerce prêt-à-porter multi-catégories |
| 🏃 **Sportswear** | `home-sportwear` | Énergie dynamique, vêtements et chaussures de sport |
| 🧴 **Skincare & Cosmétiques 1** | `home-skincare` | Tons doux, routines beauté, focus ingrédients |
| 💄 **Skincare & Beauté 2** | `home-skincare2` | Variante moderne minimaliste pour cosmétiques |
| 💍 **Bijouterie & Joaillerie 1** | `home-jewelry` | Style luxe, fonds sombres/or, détails raffinés |
| ✨ **Bijouterie 2** | `home-jewelry2` | Variante lumineuse et contemporaine |
| 🛋️ **Mobilier & Déco 1** | `home-furniture` | Mise en avant grand format d'intérieurs design |
| 🪑 **Mobilier 2** | `home-furniture2` | Style scandinave et épuré |
| 📱 **Électronique & High-Tech** | `home-electronic` | Produits tech, fiches spécifications, promos flash |
| ⚡ **Mega Store Électronique** | `home-mega-electronic` | Disposition riche type marketplace tech |
| 🔌 **Accessoires Électriques** | `home-electric-accessories` | Câbles, chargeurs, gadgets |
| 📲 **Coques & Accessoires Téléphone** | `home-phonecase` | Produits personnalisables et accessoires mobiles |
| 🌿 **Plantes & Jardinage** | `home-plant` | Végétal, conseils d'entretien, pots |
| 🎨 **Artisanat & Fait-main** | `home-handcraft` | Céramique, créations artisanales, atelier |
| 🐶 **Animalerie & Accessoires** | `home-pet-accessories` | Chiens, chats, nourriture et jouets |
| 🎾 **Pickleball & Sports de Raquette**| `home-pickleball` | Équipements sportifs spécifiques et textiles |
| 🚲 **Vélos & Mobilité Urbaine** | `home-bicycle` | Vélos électriques, pièces et accessoires |
| 🥦 **Légumes & Bio** | `home-vegetable` | Alimentation bio, paniers frais, épicerie |
| 👶 **Bébé & Puériculture** | `home-baby` | Douceur, jouets, vêtements enfants |
| 🖨️ **Print On Demand (POD)** | `home-pod` | Produits personnalisés, t-shirts, mugs |

---

## 🔍 Catalogue des 31 Fiches Produits Avancées (`app/(product-details)/`)

| Fonctionnalité Produit | Dossier Route | Utilisation recommandée |
| :--- | :--- | :--- |
| 🕶️ **Visualiseur 3D AR** | `product-3d` | Objets, meubles ou baskets manipulables en 3D |
| 🎬 **Vidéo Produit intégrée** | `product-video` | Démonstration dynamique du produit en action |
| 🔍 **Zoom Externe (Loupe)** | `product-external-zoom` | Zoom haute définition à côté de l'image |
| 🔍 **Zoom Intérieur** | `product-inner-zoom` | Zoom direct dans le cadre de l'image |
| ⏳ **Compte à rebours promo** | `product-countdown-timer` | Ventes flash et offres limitées dans le temps |
| 📦 **Remise sur Volume** | `product-volume-discount` | "Achetez-en 2, économisez 10%" |
| 🎁 **Offre Buy X Get Y** | `product-buyx-gety` | Promotions spéciales "1 acheté = 1 offert" |
| 🤝 **Acheter Ensemble (Bundle)**| `product-together` | Vente croisée d'accessoires complémentaires |
| 🎨 **Sélecteur Couleurs / Images**| `product-swatch-image` | Pastilles d'images pour chaque variante de couleur |
| 🏪 **Retrait Magasin (Pickup)** | `product-pickup-available` | Boutiques physiques avec Click & Collect |

---

## 🛒 Gestion Panier, Compte & Navigation

* **Composant Panier & Favoris :** Géré automatiquement via `context/Context.js` (stockage local, ajout/suppression en temps réel).
* **Pages Compte Client (`app/(dashboard)/`) :**
  * `account-page` : Vue d'ensemble du profil utilisateur.
  * `account-orders` : Historique des commandes.
  * `account-addresses` : Adresses de livraison enregistrées.
* **Pages Tunnel d'achat (`app/(otherPages)/`) :**
  * `checkout` : Page de paiement / validation.
  * `view-cart` & `cart-drawer-v2` : Panier pleine page ou tiroir latéral.
  * `wish-list` & `compare` : Liste d'envies et comparateur de caractéristiques.

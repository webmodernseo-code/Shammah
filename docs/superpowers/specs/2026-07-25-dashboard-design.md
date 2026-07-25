# Spécifications de Conception - Dashboard d'Administration SHAMMAH

Ce document définit les spécifications fonctionnelles, ergonomiques et techniques du futur tableau de bord d'administration de la boutique **SHAMMAH**.

---

## 1. Objectif & Cadre
Développer une interface d'administration épurée en **Vanilla HTML, CSS, et JavaScript** connectée à la base de données **Supabase** (ou simulée localement dans un premier temps), permettant de gérer les commandes, les produits, les stocks, les photos de variantes et les codes promotionnels.

---

## 2. Identité Visuelle (Thème Clair Premium SaaS)
Conformément aux exemples de design SaaS haut de gamme validés, l'interface utilisera les règles suivantes :

### A. Palette de Couleurs Fonctionnelles
* **Fond global (Canvas)** : `#f8fafc` (Gris bleuâtre ultra-léger)
* **Cartes et Panneaux** : `#ffffff` (Blanc pur avec bordure fine `#e2e8f0`)
* **Texte Principal** : `#0f172a` (Charbon foncé) | **Texte Secondaire** : `#64748b` (Gris ardoise)
* **Indicateurs Métriques** :
  * **Vert Succès (`#10b981`)** : Chiffres d'affaires et indicateurs de performance positive.
  * **Bleu Info (`#3b82f6`)** : Commandes actives et transactions Wave.
  * **Or Alerte (`#f59e0b`)** : Panier moyen et transactions Orange Money.
  * **Rouge Danger (`#ef4444`)** : Indicateurs de stock critique (< 3 unités).

### B. Typographie & Icônerie
* **Polices** : `Inter, sans-serif` exclusivement.
* **Icônes** : Icônes vectorielles SVG intégrées de manière native pour chaque lien de navigation et chaque titre de widget métrique.

---

## 3. Structure & Navigation (Layout)
L'interface sera divisée en une barre latérale fixe à gauche et un espace de travail principal à droite :

### A. Barre Latérale (Sidebar)
* Logo de la marque `SHAMMAH` avec un espacement minimaliste.
* Zone de recherche rapide simulée avec raccourci `⌘K`.
* Liens de navigation :
  * **Vue d'ensemble** (KPIs généraux et graphiques).
  * **Commandes** (Suivi et modification des statuts de préparation).
  * **Produits** (Ajout d'articles et gestion des stocks).
  * **Ventes Flash & Codes** (Modification des bannières et codes promo).
  * **Configuration** (Frais d'expédition et CGV).

### B. Module "Gestion de Stock & Ajout de Produit"
Il s'agit du module clé intégrant les demandes spécifiques de l'utilisateur :
1. **Formulaire de création d'article** :
   * **Nom** et **Prix de vente** (FCFA).
   * **Description du produit** : Zone de saisie de texte (`textarea`) décrivant l'article.
   * **Catégorie (Fixe)** : Liste déroulante fermée comprenant : `Femme`, `Homme`, `Enfant`, `Gadget`.
   * **Sous-catégorie (Variable)** : Zone de texte libre (ex: `Maroquinerie` pour les gadgets, `Polo` pour Homme).
   * **Gestion des Variantes de Couleur** :
     * Bouton pour ajouter une couleur.
     * Pour chaque couleur ajoutée, une zone d'upload dédiée pouvant accueillir **jusqu'à 3 photos maximum** (ex: Photo de Face, Photo d'Intérieur, Photo de Profil).
2. **Nouvelle Catégorie "Gadget" & Produits de Démonstration** :
   * La boutique vitrine affichera un nouvel onglet de catégorie **Gadget**.
   * 3 produits Gadget seront insérés par défaut dans le catalogue :
     * *Portefeuille Cuir Minimaliste* (Maroquinerie, 18 500 FCFA, variantes Chocolat et Noir, stock: 15).
     * *Porte-Clés Laiton Massif* (Accessoire, 8 000 FCFA, variante Or Laiton, stock: 30).
     * *Étui Cartes Premium* (Maroquinerie, 12 000 FCFA, variante Cognac, stock: 20).
3. **Tableau des Stocks** :
   * Visualisation claire de la quantité en stock pour chaque article et chaque variante.
   * Alerte visuelle de stock faible (badge rouge `Stock Faible`) si la quantité descend sous les 3 unités.

---

## 4. Structure de Base de Données (Schéma Supabase)

Pour supporter la création dynamique de catégories avec images et de sous-catégories depuis le panneau de configuration, voici la structure de données relationnelle proposée :

```sql
-- Table des Catégories (Dynamiques)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) UNIQUE NOT NULL,         -- Ex: femme, homme, gadget
    name VARCHAR(100) NOT NULL,               -- Ex: Femme, Homme, Gadget
    image_url TEXT NOT NULL,                  -- Ex: images/category_woman.png, category_gadget.png
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des Sous-Catégories (Variables)
CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_slug VARCHAR(50) REFERENCES categories(slug) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,               -- Ex: Maroquinerie, Accessoire, Polo
    slug VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(category_slug, name)
);

-- Table des Produits
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    old_price DECIMAL(10,2),
    image_url TEXT NOT NULL,                  -- Image principale de vitrine
    category_slug VARCHAR(50) REFERENCES categories(slug) NOT NULL,
    subcategory_slug VARCHAR(100) NOT NULL,
    stock INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des Variantes de Couleur et Images (Max 3 Photos par Couleur)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    color_name VARCHAR(50) NOT NULL,          -- Ex: Chocolat, Noir
    color_hex VARCHAR(20) NOT NULL,           -- Ex: #1c1917, #000000
    image_url_1 TEXT NOT NULL,               -- Photo 1 (Principale/Face)
    image_url_2 TEXT,                        -- Photo 2 (Optionnelle)
    image_url_3 TEXT,                        -- Photo 3 (Optionnelle)
    stock INTEGER DEFAULT 5
);
```

### Intégration sur la Boutique Vitrine (Génération Dynamique)
* **Tabs Catégories de l'Accueil** : Les boutons ronds de catégories de la page d'accueil ne seront plus écrits en dur dans `index.html`. Au chargement, le script JS lira le contenu de la table `categories` et insérera dynamiquement les boutons contenant l'image ronde de la catégorie correspondante.
* **Filtres de Sous-Catégories** : Les tiroirs de filtres interrogeront la table `subcategories` pour générer automatiquement la liste des sous-catégories variables liées à la catégorie sélectionnée.

---

## 5. Statut & Prochaine Étape
* **Statut actuel** : Spécifications enrichies, maquette visuelle des paramètres de catégories validée dans le visual-companion.
* **Prochaine étape** : Attente de l'approbation formelle de ce document de spécification par l'utilisateur et de son **Top Départ** pour l'implémentation.

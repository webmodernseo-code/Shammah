export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  category: "Homme" | "Femme" | "Enfant" | "Accessoires" | "Tendances" | "Conseils";
  excerpt: string;
  content: string;
  coverImage: string;
  authorName: string;
  authorAvatar: string;
  tags: string[];
  status: "Publié" | "Brouillon";
  publishedAt: string;
  viewsCount: number;
  commentsCount: number;
  readTime: string;
}

export const INITIAL_BLOG_POSTS: BlogPostItem[] = [
  {
    id: "blog-1",
    slug: "guide-du-style-saisonnier-les-tendances-incontournables",
    title: "Guide du style saisonnier : les tendances incontournables de l'année",
    category: "Tendances",
    excerpt:
      "Décryptage des pièces maîtresses, des palettes de couleurs et des silhouettes qui rythment les nouvelles collections de prêt-à-porter.",
    content: `Le vestiaire contemporain évolue vers une harmonie subtile entre confort haut de gamme et élégance minimaliste. Cette saison, les matières nobles et naturelles telles que le lin lavé, la soie sauvage et la laine vierge s'imposent dans les collections homme et femme.

### Les silhouettes structurées à l'honneur
L'accent est mis sur des coupes nettes, des vestons cintrés et des pantalons amples à taille haute qui élancent la démarche. Les nuances terreuses (terracotta, écru, sauge et brun chocolat) dominent la palette, apportant une chaleur intemporelle.

### Comment adopter cette tendance au quotidien ?
1. **Privilégiez les pièces fortes** : un beau blazer ceinturé ou une robe fluide en soie suffit à composer une tenue chic.
2. **Misez sur les superpositions** : chemise en popeline sous un pull en maille fine pour un style moderne et soigné.
3. **Harmonisez les accessoires** : une ceinture en cuir pleine fleur et des souliers assortis subliment instantanément l'ensemble.`,
    coverImage: "/images/blog/blog-7.jpg",
    authorName: "Élodie Laurent",
    authorAvatar: "/images/avatar/blog-author-1.jpg",
    tags: ["Mode", "Tendances", "Lookbook", "Prêt-à-porter"],
    status: "Publié",
    publishedAt: "2026-03-10",
    viewsCount: 1420,
    commentsCount: 12,
    readTime: "4 min",
  },
  {
    id: "blog-2",
    slug: "5-indispensables-intemporels-du-vestiaire-feminin",
    title: "5 indispensables intemporels que chaque femme devrait posséder",
    category: "Femme",
    excerpt:
      "Investir dans des basiques de grande qualité pour concevoir une garde-robe capsule élégante, polyvalente et durable.",
    content: `La véritable élégance ne réside pas dans la quantité de vêtements accumulés, mais dans la pertinence et la coupe irréprochable de chaque pièce sélectionnée.

### 1. La chemise blanche en coton d'Égypte
Une coupe nette avec un col affirmé qui s'adapte aussi bien à un pantalon de tailleur qu'à un jean brut pour un look décontracté chic.

### 2. Le trench-coat ceinturé
Indispensable pour affronter la mi-saison avec allure. Choisissez une gabardine imperméabilisée dans une teinte beige sablé ou sable doré.

### 3. La petite robe noire revisitée
Une robe midi en crêpe ou en soie fluide qui sublime la silhouette de jour comme en soirée.

### 4. Le blazer structuré
Pièce maîtresse du vestiaire d'affaires et de soirée, il structure les épaules et allonge la silhouette avec raffinement.

### 5. Le sac en cuir artisanal
Un cabas ou un sac bandoulière en cuir pleine fleur tannage végétal qui se patine avec noblesse au fil du temps.`,
    coverImage: "/images/blog/blog-8.jpg",
    authorName: "Claire Dumont",
    authorAvatar: "/images/avatar/blog-author-2.jpg",
    tags: ["Femme", "Capsule Wardrobe", "Essentiels", "Élégance"],
    status: "Publié",
    publishedAt: "2026-03-05",
    viewsCount: 2310,
    commentsCount: 19,
    readTime: "5 min",
  },
  {
    id: "blog-3",
    slug: "costume-homme-sur-mesure-regles-d-or-de-l-elegance-masculine",
    title: "Le costume sur-mesure : les règles d'or de l'élégance masculine",
    category: "Homme",
    excerpt:
      "Épaules, tombé de manche, longueur de pantalon : tous les secrets pour choisir et porter un costume ajusté à la perfection.",
    content: `Un costume bien taillé est la signature d'un homme qui accorde de l'importance au détail et à l'excellence. Voici les points d'ajustement capitaux à vérifier.

### L'emmanchure et les épaules
La couture d'épaule doit épouser parfaitement la fin naturelle de l'os acromion. Aucun pli vertical ou excès de matière ne doit apparaître au niveau des omoplates.

### Le cintrage du veston
Le bouton principal doit se fermer naturellement sans tension en 'X'. Lorsque vous êtes assis, veillez à toujours déboutonner votre veste.

### Le cassant du pantalon
Pour une allure contemporaine et dynamique, optez pour un léger cassant (quart de pli) ou un bas sans cassant effleurant l'empeigne des souliers.`,
    coverImage: "/images/blog/blog-9.jpg",
    authorName: "Marc Alexandre",
    authorAvatar: "/images/avatar/blog-author-3.jpg",
    tags: ["Homme", "Costume", "Sartorial", "Élégance"],
    status: "Publié",
    publishedAt: "2026-02-28",
    viewsCount: 1890,
    commentsCount: 15,
    readTime: "6 min",
  },
  {
    id: "blog-4",
    slug: "mode-enfant-allier-confort-resistance-et-style",
    title: "Mode enfant : comment allier confort, résistance et style au quotidien",
    category: "Enfant",
    excerpt:
      "Des matières douces certifiées Oeko-Tex et des finitions renforcées pour accompagner les mouvements des enfants en toute liberté.",
    content: `Habiller les plus jeunes requiert une attention particulière portée au bien-être, à la douceur des textiles et à la praticité des coupes.

### Des matières hypoallergéniques et respirantes
Privilégiez les cotons biologiques peignés, les molletons doux et les doublures polaires sans substances chimiques nocives.

### Des coupes étudiées pour l'autonomie
Élastiques doux à la taille, fermetures éclair faciles à manipuler et boutons pression ergonomiques facilitent l'habillage des petits.

### La résistance à toute épreuve
Nos ensembles enfant disposent de coutures renforcées aux genoux et aux coudes pour résister aux aventures de la récréation.`,
    coverImage: "/images/blog/baby-1.jpg",
    authorName: "Sophie Morel",
    authorAvatar: "/images/avatar/blog-author-4.jpg",
    tags: ["Enfant", "Confort", "Coton Bio", "Conseils Parents"],
    status: "Publié",
    publishedAt: "2026-02-20",
    viewsCount: 980,
    commentsCount: 8,
    readTime: "3 min",
  },
  {
    id: "blog-5",
    slug: "l-art-des-accessoires-sublimer-une-tenue-avec-subtilite",
    title: "L'art des accessoires : sublimer une tenue avec subtilité et caractère",
    category: "Accessoires",
    excerpt:
      "Ceintures raffinées, maroquinerie d'exception et montres minimalistes : le guide pour parfaire vos ensembles.",
    content: `Les accessoires constituent la ponctuation stylistique de votre allure. Bien choisis, ils transforment une tenue sobre en une silhouette remarquable.

### La maroquinerie noble
Un cuir tanné de manière végétale gagne en beauté et en patine avec les années. Associez toujours la teinte de vos cuirs (ceinture et souliers) pour un rendu harmonieux.

### Les montres et bijoux discrets
Moins c'est plus : privilégiez une belle montre au cadran épuré ou des boucles d'oreilles graphiques fines pour illuminer le visage sans surcharger.`,
    coverImage: "/images/blog/blog-v4-4.jpg",
    authorName: "Claire Dumont",
    authorAvatar: "/images/avatar/blog-author-2.jpg",
    tags: ["Accessoires", "Maroquinerie", "Cuir", "Style"],
    status: "Publié",
    publishedAt: "2026-02-14",
    viewsCount: 1650,
    commentsCount: 11,
    readTime: "4 min",
  },
  {
    id: "blog-6",
    slug: "la-puissance-du-monochrome-maitriser-les-camaieux",
    title: "La puissance du monochrome : maîtriser l'art des camaïeux de couleurs",
    category: "Conseils",
    excerpt:
      "Comment composer des silhouettes unies ultra-sophistiquées en jouant sur les textures et les reliefs des étoffes.",
    content: `S'habiller en monochrome ne signifie pas être monotone. C'est l'un des exercices de style les plus valorisants pour affiner et allonger la silhouette.

### Varier les textures
Pour réussir un look monochrome, juxtaposez des matières aux finitions contrastées : un pantalon en laine mate avec une chemise en soie satinée et un manteau en cachemire texturé.

### Les teintes phares
Le total look crème/écru, le bleu nuit profond et le gris anthracite constituent les valeurs sûres de la saison.`,
    coverImage: "/images/blog/blog-v4-1.jpg",
    authorName: "Marc Alexandre",
    authorAvatar: "/images/avatar/blog-author-3.jpg",
    tags: ["Conseils", "Monochrome", "Colorimétrie", "Lookbook"],
    status: "Publié",
    publishedAt: "2026-02-01",
    viewsCount: 2150,
    commentsCount: 14,
    readTime: "5 min",
  },
];

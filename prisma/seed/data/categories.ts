export interface CategoryData {
  slug: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionFr?: string;
  descriptionEn?: string;
  sortOrder: number;
  children?: Omit<CategoryData, "children" | "sortOrder">[];
}

export const categories: CategoryData[] = [
  {
    slug: "electronics",
    nameAr: "إلكترونيات",
    nameFr: "Électronique",
    nameEn: "Electronics",
    descriptionAr: "هواتف، حواسيب، وملحقات إلكترونية",
    descriptionFr: "Téléphones, ordinateurs et accessoires",
    descriptionEn: "Phones, computers and accessories",
    sortOrder: 1,
    children: [
      { slug: "phones", nameAr: "هواتف", nameFr: "Téléphones", nameEn: "Phones" },
      { slug: "laptops", nameAr: "حواسيب محمولة", nameFr: "Ordinateurs portables", nameEn: "Laptops" },
      { slug: "accessories", nameAr: "ملحقات", nameFr: "Accessoires", nameEn: "Accessories" },
    ],
  },
  {
    slug: "clothing",
    nameAr: "ملابس",
    nameFr: "Vêtements",
    nameEn: "Clothing",
    descriptionAr: "ملابس رجالية ونسائية وأطفال",
    descriptionFr: "Vêtements homme, femme et enfant",
    descriptionEn: "Men's, women's and kids' clothing",
    sortOrder: 2,
    children: [
      { slug: "men-clothing", nameAr: "ملابس رجالية", nameFr: "Homme", nameEn: "Men" },
      { slug: "women-clothing", nameAr: "ملابس نسائية", nameFr: "Femme", nameEn: "Women" },
      { slug: "kids-clothing", nameAr: "ملابس أطفال", nameFr: "Enfants", nameEn: "Kids" },
    ],
  },
  {
    slug: "home-garden",
    nameAr: "المنزل والحديقة",
    nameFr: "Maison & Jardin",
    nameEn: "Home & Garden",
    descriptionAr: "أثاث، ديكور، ومستلزمات المنزل",
    descriptionFr: "Meubles, décoration et articles ménagers",
    descriptionEn: "Furniture, decor and household items",
    sortOrder: 3,
    children: [
      { slug: "furniture", nameAr: "أثاث", nameFr: "Meubles", nameEn: "Furniture" },
      { slug: "kitchen", nameAr: "مطبخ", nameFr: "Cuisine", nameEn: "Kitchen" },
    ],
  },
  {
    slug: "beauty-health",
    nameAr: "الجمال والصحة",
    nameFr: "Beauté & Santé",
    nameEn: "Beauty & Health",
    descriptionAr: "مستحضرات التجميل والعناية الشخصية",
    descriptionFr: "Cosmétiques et soins personnels",
    descriptionEn: "Cosmetics and personal care",
    sortOrder: 4,
  },
  {
    slug: "sports",
    nameAr: "رياضة",
    nameFr: "Sports",
    nameEn: "Sports",
    descriptionAr: "معدات رياضية وملابس رياضية",
    descriptionFr: "Équipements et vêtements de sport",
    descriptionEn: "Sports equipment and sportswear",
    sortOrder: 5,
  },
  {
    slug: "books-stationery",
    nameAr: "كتب وقرطاسية",
    nameFr: "Livres & Papeterie",
    nameEn: "Books & Stationery",
    descriptionAr: "كتب، مستلزمات مدرسية وقرطاسية",
    descriptionFr: "Livres, fournitures scolaires et papeterie",
    descriptionEn: "Books, school supplies and stationery",
    sortOrder: 6,
  },
];

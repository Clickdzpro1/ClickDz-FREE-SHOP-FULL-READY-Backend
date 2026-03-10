import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";

export const bundleService = {
  async list(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [bundles, total] = await Promise.all([
      prisma.productBundle.findMany({
        where: { isActive: true },
        include: {
          items: {
            include: {
              product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.productBundle.count({ where: { isActive: true } }),
    ]);
    return { bundles, total, page, limit };
  },

  async getBySlug(slug: string) {
    const bundle = await prisma.productBundle.findUnique({
      where: { slug },
      include: {
        items: {
          include: {
            product: { include: { images: true, variants: true } },
          },
        },
      },
    });
    if (!bundle) throw new AppError("Bundle not found", 404);
    return bundle;
  },

  async create(data: {
    slug: string;
    nameAr: string;
    nameFr: string;
    nameEn: string;
    descriptionAr?: string;
    descriptionFr?: string;
    descriptionEn?: string;
    price: number;
    image?: string;
    items: { productId: string; quantity: number }[];
  }) {
    // Calculate compare price (sum of individual product prices)
    const products = await prisma.product.findMany({
      where: { id: { in: data.items.map((i) => i.productId) } },
    });

    const comparePrice = data.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product ? Number(product.price) * item.quantity : 0);
    }, 0);

    return prisma.productBundle.create({
      data: {
        slug: data.slug,
        nameAr: data.nameAr,
        nameFr: data.nameFr,
        nameEn: data.nameEn,
        descriptionAr: data.descriptionAr,
        descriptionFr: data.descriptionFr,
        descriptionEn: data.descriptionEn,
        price: data.price,
        comparePrice,
        image: data.image,
        items: {
          create: data.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });
  },

  async update(id: string, data: any) {
    return prisma.productBundle.update({ where: { id }, data });
  },

  async remove(id: string) {
    return prisma.productBundle.update({ where: { id }, data: { isActive: false } });
  },
};

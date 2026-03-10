import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { slugify } from "../utils/slug";
import { CreateCategoryInput, UpdateCategoryInput } from "../schemas/category.schema";

export class CategoryService {
  async list() {
    return prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
            _count: { select: { products: true } },
          },
          // removed _count for cleaner typing
        },
        _count: { select: { products: true } },
      },
    });
  }

  async listAll() {
    return prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        children: { orderBy: { sortOrder: "asc" } },
        _count: { select: { products: true } },
      },
    });
  }

  async getBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { products: true } } },
        },
        parent: { select: { id: true, slug: true, nameFr: true, nameEn: true, nameAr: true } },
        _count: { select: { products: true } },
      },
    });
    if (!category) throw new AppError("Category not found", 404);
    return category;
  }

  async getById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: { orderBy: { sortOrder: "asc" } },
        parent: true,
      },
    });
    if (!category) throw new AppError("Category not found", 404);
    return category;
  }

  async create(data: CreateCategoryInput) {
    const slug = data.slug || slugify(data.nameFr);
    return prisma.category.create({
      data: { ...data, slug },
      include: { parent: true, children: true },
    });
  }

  async update(id: string, data: UpdateCategoryInput) {
    await this.getById(id);
    return prisma.category.update({
      where: { id },
      data,
      include: { parent: true, children: true },
    });
  }

  async delete(id: string) {
    const category = await this.getById(id);
    if (category.children.length > 0) {
      throw new AppError("Cannot delete category with children. Delete children first.", 400);
    }
    await prisma.category.delete({ where: { id } });
  }

  async getTree() {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        nameAr: true,
        nameFr: true,
        nameEn: true,
        image: true,
        parentId: true,
        sortOrder: true,
        _count: { select: { products: true } },
      },
    });

    // Build tree from flat list
    const map = new Map<string, typeof categories[0] & { children: typeof categories }>();
    const roots: (typeof categories[0] & { children: typeof categories })[] = [];

    for (const cat of categories) {
      map.set(cat.id, { ...cat, children: [] });
    }

    for (const cat of categories) {
      const node = map.get(cat.id)!;
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}

export const categoryService = new CategoryService();

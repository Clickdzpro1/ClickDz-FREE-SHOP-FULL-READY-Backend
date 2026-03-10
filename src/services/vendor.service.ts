import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { VendorStatus } from "@prisma/client";

export const vendorService = {
  async apply(userId: string, data: {
    storeName: string;
    storeNameAr?: string;
    slug: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    wilayaId?: number;
  }) {
    const existing = await prisma.vendor.findUnique({ where: { userId } });
    if (existing) throw new AppError("You already have a vendor application", 400);

    return prisma.vendor.create({
      data: { userId, ...data },
    });
  },

  async getProfile(userId: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      include: {
        products: { include: { product: { include: { images: { take: 1 } } } } },
      },
    });
    if (!vendor) throw new AppError("Vendor profile not found", 404);
    return vendor;
  },

  async getBySlug(slug: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { slug },
      include: {
        products: {
          include: { product: { include: { images: { take: 1 } } } },
        },
        user: { select: { firstName: true, lastName: true } },
      },
    });
    if (!vendor || vendor.status !== "APPROVED") throw new AppError("Store not found", 404);
    return vendor;
  },

  async listPublic(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where: { status: "APPROVED" },
        select: { id: true, storeName: true, storeNameAr: true, slug: true, logo: true, rating: true, totalSales: true },
        orderBy: { totalSales: "desc" },
        skip,
        take: limit,
      }),
      prisma.vendor.count({ where: { status: "APPROVED" } }),
    ]);
    return { vendors, total, page, limit };
  },

  async addProduct(userId: string, productId: string) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor || vendor.status !== "APPROVED") throw new AppError("Not an approved vendor", 403);

    return prisma.vendorProduct.create({
      data: { vendorId: vendor.id, productId },
    });
  },

  async removeProduct(userId: string, productId: string) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new AppError("Not a vendor", 403);

    await prisma.vendorProduct.delete({
      where: { vendorId_productId: { vendorId: vendor.id, productId } },
    });
  },

  // ─── Admin ──────────────────────────────────────────
  async listAll(status?: VendorStatus, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.vendor.count({ where }),
    ]);
    return { vendors, total, page, limit };
  },

  async updateStatus(id: string, status: VendorStatus) {
    return prisma.vendor.update({
      where: { id },
      data: {
        status,
        approvedAt: status === "APPROVED" ? new Date() : undefined,
      },
    });
  },

  async updateCommission(id: string, commissionRate: number) {
    return prisma.vendor.update({ where: { id }, data: { commissionRate } });
  },
};

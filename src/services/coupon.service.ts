import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { parsePagination, buildPaginatedResult, buildPrismaSkip } from "../utils/pagination";
import { CreateCouponInput, UpdateCouponInput } from "../schemas/coupon.schema";
import { Prisma } from "@prisma/client";

export class CouponService {
  async validate(code: string) {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) throw new AppError("Invalid coupon code", 400);
    if (!coupon.isActive) throw new AppError("Coupon is inactive", 400);
    if (coupon.startsAt && coupon.startsAt > new Date()) throw new AppError("Coupon not yet active", 400);
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new AppError("Coupon has expired", 400);
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError("Coupon usage limit reached", 400);
    }

    return {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount,
      descriptionAr: coupon.descriptionAr,
      descriptionFr: coupon.descriptionFr,
    };
  }

  // Admin methods
  async list(query: Record<string, string | undefined>) {
    const params = parsePagination(query);

    const [data, total] = await Promise.all([
      prisma.coupon.findMany({
        skip: buildPrismaSkip(params),
        take: params.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.coupon.count(),
    ]);

    return buildPaginatedResult(data, total, params);
  }

  async getById(id: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });
    if (!coupon) throw new AppError("Coupon not found", 404);
    return coupon;
  }

  async create(data: CreateCouponInput) {
    const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (existing) throw new AppError("Coupon code already exists", 409);

    return prisma.coupon.create({
      data: {
        ...data,
        value: new Prisma.Decimal(data.value),
        minOrderAmount: data.minOrderAmount ? new Prisma.Decimal(data.minOrderAmount) : null,
        maxDiscount: data.maxDiscount ? new Prisma.Decimal(data.maxDiscount) : null,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  async update(id: string, data: UpdateCouponInput) {
    await this.getById(id);

    const updateData: Prisma.CouponUpdateInput = { ...data };
    if (data.value !== undefined) updateData.value = new Prisma.Decimal(data.value);
    if (data.minOrderAmount !== undefined)
      updateData.minOrderAmount = data.minOrderAmount ? new Prisma.Decimal(data.minOrderAmount) : null;
    if (data.maxDiscount !== undefined)
      updateData.maxDiscount = data.maxDiscount ? new Prisma.Decimal(data.maxDiscount) : null;
    if (data.startsAt !== undefined)
      updateData.startsAt = data.startsAt ? new Date(data.startsAt) : null;
    if (data.expiresAt !== undefined)
      updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    return prisma.coupon.update({ where: { id }, data: updateData });
  }

  async delete(id: string) {
    await this.getById(id);
    await prisma.coupon.delete({ where: { id } });
  }
}

export const couponService = new CouponService();

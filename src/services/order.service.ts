import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { generateOrderNumber } from "../utils/orderNumber";
import { parsePagination, buildPaginatedResult, buildPrismaSkip } from "../utils/pagination";
import { ORDER_STATUS_TRANSITIONS } from "../utils/constants";
import { CreateOrderInput, UpdateOrderStatusInput } from "../schemas/order.schema";
import { Prisma } from "@prisma/client";

export class OrderService {
  async create(userId: string, data: CreateOrderInput) {
    // 1. Get cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    // 2. Verify address
    const address = await prisma.address.findFirst({
      where: { id: data.addressId, userId },
      include: { wilaya: true, commune: true },
    });
    if (!address) throw new AppError("Address not found", 404);

    // 3. Calculate totals
    let subtotal = new Prisma.Decimal(0);
    const orderItems: {
      productId: string;
      variantId: string | null;
      quantity: number;
      unitPrice: Prisma.Decimal;
      totalPrice: Prisma.Decimal;
      productName: string;
      productSku: string | null;
      variantName: string | null;
    }[] = [];

    for (const item of cart.items) {
      const price = item.variant ? item.variant.price : item.product.price;
      const total = price.mul(item.quantity);

      // Stock check
      const available = item.variant ? item.variant.stock : item.product.stock;
      if (item.product.trackInventory && item.quantity > available) {
        throw new AppError(`Insufficient stock for ${item.product.nameFr}`, 400);
      }

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: price,
        totalPrice: total,
        productName: item.product.nameFr,
        productSku: item.product.sku,
        variantName: item.variant?.name || null,
      });

      subtotal = subtotal.add(total);
    }

    // 4. Get shipping cost
    const shippingRate = await prisma.shippingRate.findFirst({
      where: {
        wilayaId: address.wilayaId,
        provider: data.shippingProvider || "MANUAL",
        isActive: true,
      },
    });
    const shippingCost = shippingRate?.homeDelivery || new Prisma.Decimal(500);

    // 5. Apply coupon
    let discount = new Prisma.Decimal(0);
    let couponId: string | null = null;
    if (data.couponCode) {
      const coupon = await this.validateCoupon(data.couponCode, subtotal);
      couponId = coupon.id;
      discount = this.calculateDiscount(coupon, subtotal, shippingCost);
    }

    const total = subtotal.add(shippingCost).sub(discount);

    // 6. Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      const orderNumber = generateOrderNumber();

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: data.addressId,
          shippingAddress: {
            fullName: address.fullName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            wilaya: address.wilaya.nameFr,
            wilayaId: address.wilayaId,
            commune: address.commune.nameFr,
            communeId: address.communeId,
            postalCode: address.commune.postalCode,
          },
          subtotal,
          shippingCost,
          discount,
          total,
          paymentMethod: data.paymentMethod,
          shippingProvider: data.shippingProvider || "MANUAL",
          couponId,
          customerNote: data.customerNote,
          items: { create: orderItems },
          statusHistory: {
            create: {
              toStatus: "PENDING",
              note: "Order placed",
            },
          },
        },
        include: {
          items: true,
          statusHistory: true,
        },
      });

      // Decrement stock
      for (const item of cart.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else if (item.product.trackInventory) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // Increment coupon usage
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return order;
  }

  async listByUser(userId: string, query: Record<string, string | undefined>) {
    const params = parsePagination(query);

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip: buildPrismaSkip(params),
        take: params.limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } },
            },
          },
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return buildPaginatedResult(data, total, params);
  }

  async getByIdForUser(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
        statusHistory: { orderBy: { createdAt: "desc" } },
        payment: true,
      },
    });
    if (!order) throw new AppError("Order not found", 404);
    return order;
  }

  async cancel(userId: string, orderId: string) {
    const order = await this.getByIdForUser(userId, orderId);
    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      throw new AppError("Order cannot be cancelled at this stage", 400);
    }

    return this.updateStatus(orderId, {
      status: "CANCELLED",
      note: "Cancelled by customer",
    });
  }

  // Admin methods
  async listAll(query: Record<string, string | undefined>) {
    const params = parsePagination(query);
    const where: Prisma.OrderWhereInput = {};

    if (query.status) where.status = query.status as Prisma.EnumOrderStatusFilter;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus as Prisma.EnumPaymentStatusFilter;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: "insensitive" } },
        { user: { email: { contains: query.search, mode: "insensitive" } } },
        { user: { firstName: { contains: query.search, mode: "insensitive" } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: buildPrismaSkip(params),
        take: params.limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          items: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return buildPaginatedResult(data, total, params);
  }

  async getByIdAdmin(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        items: { include: { product: { include: { images: { take: 1 } } } } },
        statusHistory: { orderBy: { createdAt: "desc" } },
        payment: true,
        coupon: true,
      },
    });
    if (!order) throw new AppError("Order not found", 404);
    return order;
  }

  async updateStatus(orderId: string, data: UpdateOrderStatusInput, changedBy?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError("Order not found", 404);

    // Validate transition
    const allowed = ORDER_STATUS_TRANSITIONS[order.status] || [];
    if (!allowed.includes(data.status)) {
      throw new AppError(
        `Cannot transition from ${order.status} to ${data.status}`,
        400
      );
    }

    const updateData: Prisma.OrderUpdateInput = {
      status: data.status,
      trackingNumber: data.trackingNumber || order.trackingNumber,
    };

    // Set timestamp fields
    if (data.status === "CONFIRMED") updateData.confirmedAt = new Date();
    if (data.status === "SHIPPED") updateData.shippedAt = new Date();
    if (data.status === "DELIVERED") {
      updateData.deliveredAt = new Date();
      if (order.paymentMethod === "COD") {
        updateData.paymentStatus = "PAID";
      }
    }
    if (data.status === "CANCELLED") updateData.cancelledAt = new Date();

    return prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: updateData,
        include: { items: true, statusHistory: { orderBy: { createdAt: "desc" } } },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: data.status,
          note: data.note,
          changedBy,
        },
      });

      // Restore stock on cancellation
      if (data.status === "CANCELLED") {
        for (const item of updated.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      return updated;
    });
  }

  private async validateCoupon(code: string, subtotal: Prisma.Decimal) {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) throw new AppError("Invalid coupon code", 400);
    if (!coupon.isActive) throw new AppError("Coupon is inactive", 400);
    if (coupon.startsAt && coupon.startsAt > new Date()) throw new AppError("Coupon not yet active", 400);
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new AppError("Coupon has expired", 400);
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError("Coupon usage limit reached", 400);
    }
    if (coupon.minOrderAmount && subtotal.lt(coupon.minOrderAmount)) {
      throw new AppError(`Minimum order amount is ${coupon.minOrderAmount} DZD`, 400);
    }
    return coupon;
  }

  private calculateDiscount(
    coupon: { type: string; value: Prisma.Decimal; maxDiscount: Prisma.Decimal | null },
    subtotal: Prisma.Decimal,
    shippingCost: Prisma.Decimal
  ): Prisma.Decimal {
    let discount = new Prisma.Decimal(0);

    if (coupon.type === "PERCENTAGE") {
      discount = subtotal.mul(coupon.value).div(100);
      if (coupon.maxDiscount && discount.gt(coupon.maxDiscount)) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.type === "FIXED_AMOUNT") {
      discount = coupon.value;
    } else if (coupon.type === "FREE_SHIPPING") {
      discount = shippingCost;
    }

    // Don't let discount exceed subtotal
    if (discount.gt(subtotal)) discount = subtotal;
    return discount;
  }
}

export const orderService = new OrderService();

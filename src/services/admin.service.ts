import { prisma } from "../config/database";
import { Prisma } from "@prisma/client";
import { PaginationParams } from "../types";
import { buildPrismaSkip } from "../utils/pagination";

export class AdminService {
  /**
   * Dashboard statistics.
   */
  async getDashboardStats() {
    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      pendingReviews,
      recentOrders,
      ordersByStatus,
      revenueByMonth,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),

      // Total revenue (completed orders only)
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
        },
      }),

      // Total customers
      prisma.user.count({ where: { role: "CUSTOMER" } }),

      // Pending orders
      prisma.order.count({ where: { status: "PENDING" } }),

      // Total products
      prisma.product.count({ where: { isActive: true } }),

      // Low stock alerts (stock < 10)
      prisma.product.findMany({
        where: { stock: { lt: 10 }, isActive: true },
        select: { id: true, nameEn: true, nameFr: true, stock: true, sku: true },
        orderBy: { stock: "asc" },
        take: 20,
      }),

      // Pending reviews
      prisma.review.count({ where: { isApproved: false } }),

      // Recent orders
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          paymentMethod: true,
          createdAt: true,
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),

      // Orders grouped by status
      prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      // Revenue by month (last 12 months)
      prisma.$queryRaw`
        SELECT
          TO_CHAR("created_at", 'YYYY-MM') as month,
          COUNT(*)::int as orders,
          COALESCE(SUM("total"), 0) as revenue
        FROM "orders"
        WHERE "created_at" >= NOW() - INTERVAL '12 months'
          AND "status" NOT IN ('CANCELLED', 'REFUNDED')
        GROUP BY TO_CHAR("created_at", 'YYYY-MM')
        ORDER BY month DESC
      `,
    ]);

    return {
      overview: {
        totalOrders,
        totalRevenue: Number(totalRevenue._sum?.total || 0),
        totalCustomers,
        pendingOrders,
        totalProducts,
        pendingReviews,
      },
      lowStockProducts,
      recentOrders: recentOrders.map((o) => ({
        ...o,
        total: Number(o.total),
      })),
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
      revenueByMonth,
    };
  }

  /**
   * List customers with stats.
   */
  async listCustomers(pagination: PaginationParams, search?: string) {
    const where: Prisma.UserWhereInput = {
      role: "CUSTOMER",
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    };

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          _count: { select: { orders: true, reviews: true } },
        },
        skip: buildPrismaSkip(pagination),
        take: pagination.limit,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
      }),
      prisma.user.count({ where }),
    ]);

    return { customers, total };
  }

  /**
   * Get customer detail with order history.
   */
  async getCustomerDetail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        addresses: {
          include: { wilaya: true, commune: true },
        },
        orders: {
          take: 20,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
        _count: { select: { orders: true, reviews: true } },
      },
    });

    if (!user) return null;

    // Calculate total spent
    const totalSpent = await prisma.order.aggregate({
      _sum: { total: true },
      where: {
        userId,
        status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
      },
    });

    return {
      ...user,
      orders: user.orders.map((o) => ({
        ...o,
        total: Number(o.total),
      })),
      totalSpent: Number(totalSpent._sum?.total || 0),
    };
  }

  /**
   * Export orders as CSV.
   */
  async exportOrdersCsv(filters?: {
    status?: string;
    from?: string;
    to?: string;
  }) {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.status) {
      where.status = filters.status as any;
    }
    if (filters?.from || filters?.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = new Date(filters.from);
      if (filters.to) where.createdAt.lte = new Date(filters.to);
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        items: { include: { product: { select: { nameEn: true, sku: true } } } },
        payment: { select: { status: true, method: true, paidAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Build CSV
    const headers = [
      "Order Number",
      "Date",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Status",
      "Payment Method",
      "Payment Status",
      "Subtotal",
      "Shipping Fee",
      "Discount",
      "Total",
      "Items",
      "Tracking Number",
    ];

    const rows = orders.map((o) => [
      o.orderNumber,
      o.createdAt.toISOString().split("T")[0],
      `${o.user.firstName} ${o.user.lastName}`,
      o.user.email,
      o.user.phone || "",
      o.status,
      o.paymentMethod,
      o.payment?.status || "N/A",
      Number(o.subtotal).toFixed(2),
      Number(o.shippingCost).toFixed(2),
      Number(o.discount).toFixed(2),
      Number(o.total).toFixed(2),
      o.items.map((i) => `${i.product.nameEn || i.product.sku} x${i.quantity}`).join("; "),
      o.trackingNumber || "",
    ]);

    const csvLines = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ];

    return csvLines.join("\n");
  }

  /**
   * Admin: CRUD shipping rates.
   */
  async listShippingRates() {
    return prisma.shippingRate.findMany({
      include: { wilaya: true },
      orderBy: { wilayaId: "asc" },
    });
  }

  async upsertShippingRate(data: {
    wilayaId: number;
    provider: string;
    homeDelivery: number;
    officeDelivery: number;
    estimatedDays: number;
    isActive?: boolean;
  }) {
    return prisma.shippingRate.upsert({
      where: {
        wilayaId_provider: {
          wilayaId: data.wilayaId,
          provider: data.provider as any,
        },
      },
      create: data as any,
      update: data as any,
    });
  }

  async deleteShippingRate(id: string) {
    return prisma.shippingRate.delete({ where: { id } });
  }
}

export const adminService = new AdminService();

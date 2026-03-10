import { prisma } from "../config/database";
import { config } from "../config";
import { logger } from "../config/logger";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export const notificationService = {
  // ─── Email ──────────────────────────────────────────
  async sendEmail(to: string, subject: string, html: string) {
    try {
      await transporter.sendMail({
        from: config.smtp.from,
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (err) {
      logger.error("Email send failed:", err);
      return false;
    }
  },

  // ─── Order Confirmation ─────────────────────────────
  async sendOrderConfirmation(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: true },
    });
    if (!order) return;

    const html = `
      <h2>Order Confirmation</h2>
      <p>Thank you for your order, ${order.user.firstName}!</p>
      <p><strong>Order #${order.orderNumber}</strong></p>
      <p>Total: ${order.total} DZD</p>
      <p>Items: ${order.items.length}</p>
      <p>We'll notify you when your order ships.</p>
    `;

    await this.sendEmail(order.user.email, `Order Confirmed: #${order.orderNumber}`, html);
    await this.createInApp(order.userId, "Order Confirmed", `Order #${order.orderNumber} has been confirmed.`);
  },

  // ─── Shipping Update ────────────────────────────────
  async sendShippingUpdate(orderId: string, trackingNumber: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
    if (!order) return;

    const html = `
      <h2>Your Order Has Shipped!</h2>
      <p>Hi ${order.user.firstName},</p>
      <p>Order <strong>#${order.orderNumber}</strong> is on its way.</p>
      <p>Tracking: <strong>${trackingNumber}</strong></p>
    `;

    await this.sendEmail(order.user.email, `Shipped: #${order.orderNumber}`, html);
    await this.createInApp(order.userId, "Order Shipped", `Order #${order.orderNumber} has been shipped. Tracking: ${trackingNumber}`);
  },

  // ─── Password Reset ─────────────────────────────────
  async sendPasswordReset(email: string, resetToken: string) {
    const resetUrl = `${config.app.frontendUrl}/reset-password?token=${resetToken}`;
    const html = `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, ignore this email.</p>
    `;

    await this.sendEmail(email, "Password Reset Request", html);
  },

  // ─── Back in Stock ──────────────────────────────────
  async sendBackInStockAlert(userId: string, productName: string, productSlug: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const url = `${config.app.frontendUrl}/products/${productSlug}`;
    const html = `
      <h2>Back in Stock!</h2>
      <p>Hi ${user.firstName},</p>
      <p><strong>${productName}</strong> is back in stock!</p>
      <p><a href="${url}">Shop Now</a></p>
    `;

    await this.sendEmail(user.email, `${productName} is Back in Stock!`, html);
    await this.createInApp(userId, "Back in Stock", `${productName} is now available!`);
  },

  // ─── In-App Notifications ──────────────────────────
  async createInApp(userId: string, subject: string, body: string, metadata?: any) {
    return prisma.notification.create({
      data: {
        userId,
        type: "IN_APP",
        status: "SENT",
        subject,
        body,
        metadata,
        sentAt: new Date(),
      },
    });
  },

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    const unread = await prisma.notification.count({
      where: { userId, readAt: null, status: "SENT" },
    });

    return { notifications, total, unread, page, limit };
  },

  async markAsRead(userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date(), status: "READ" },
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date(), status: "READ" },
    });
  },
};

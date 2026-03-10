import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { AddToCartInput } from "../schemas/cart.schema";

export class CartService {
  async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: "asc" }, take: 1 },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { orderBy: { sortOrder: "asc" }, take: 1 },
                },
              },
              variant: true,
            },
          },
        },
      });
    }

    return cart;
  }

  async addItem(userId: string, data: AddToCartInput) {
    const cart = await this.getOrCreateCart(userId);

    // Verify product exists and is active
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product || !product.isActive) throw new AppError("Product not found", 404);

    // Find existing cart item for this product+variant
    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId || null,
      },
    });

    // Calculate total quantity (existing + new)
    const totalQuantity = (existing?.quantity || 0) + data.quantity;

    // Check stock against TOTAL quantity (cumulative check)
    if (data.variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: data.variantId } });
      if (!variant || !variant.isActive) throw new AppError("Variant not found", 404);
      if (variant.stock < totalQuantity) {
        throw new AppError(
          `Insufficient stock. Available: ${variant.stock}, requested total: ${totalQuantity}`,
          400
        );
      }
    } else {
      if (product.trackInventory && product.stock < totalQuantity) {
        throw new AppError(
          `Insufficient stock. Available: ${product.stock}, requested total: ${totalQuantity}`,
          400
        );
      }
    }

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: totalQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId || null,
          quantity: data.quantity,
        },
      });
    }

    return this.getOrCreateCart(userId);
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true, variant: true },
    });

    if (!item) throw new AppError("Cart item not found", 404);

    // Check stock
    const available = item.variant ? item.variant.stock : item.product.stock;
    if (item.product.trackInventory && quantity > available) {
      throw new AppError(`Insufficient stock. Available: ${available}`, 400);
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return this.getOrCreateCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new AppError("Cart item not found", 404);

    await prisma.cartItem.delete({ where: { id: itemId } });
    return this.getOrCreateCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  }
}

export const cartService = new CartService();

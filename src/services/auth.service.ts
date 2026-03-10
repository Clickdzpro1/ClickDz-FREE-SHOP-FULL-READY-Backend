import crypto from "crypto";
import { prisma } from "../config/database";
import { hashPassword, comparePassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { AppError } from "../middleware/errorHandler";
import { config } from "../config";
import { logger } from "../config/logger";
import {
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
  UpdateProfileInput,
} from "../schemas/auth.schema";

export class AuthService {
  async register(data: RegisterInput) {
    const email = data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError("Email already registered", 409);

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        locale: data.locale || "fr",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        locale: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user, ...tokens };
  }

  async login(data: LoginInput) {
    const email = data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("Invalid email or password", 401);
    if (!user.isActive) throw new AppError("Account is deactivated", 403);

    const valid = await comparePassword(data.password, user.passwordHash);
    if (!valid) throw new AppError("Invalid email or password", 401);

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        locale: user.locale,
      },
      ...tokens,
    };
  }

  async refreshToken(token: string) {
    // Hash the incoming token and look up by hash
    const tokenHash = this.hashToken(token);
    const stored = await prisma.refreshToken.findUnique({ where: { token: tokenHash } });
    if (!stored) throw new AppError("Invalid refresh token", 401);
    if (stored.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new AppError("Refresh token expired", 401);
    }

    try {
      verifyRefreshToken(token);
    } catch {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new AppError("Invalid refresh token", 401);
    }

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user || !user.isActive) throw new AppError("User not found or inactive", 401);

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.generateTokens(user.id, user.email, user.role);
  }

  async logout(token: string) {
    const tokenHash = this.hashToken(token);
    await prisma.refreshToken.deleteMany({ where: { token: tokenHash } });
  }

  async logoutAll(userId: string) {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        locale: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        locale: true,
      },
    });
  }

  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    const valid = await comparePassword(data.currentPassword, user.passwordHash);
    if (!valid) throw new AppError("Current password is incorrect", 400);

    const passwordHash = await hashPassword(data.newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  /**
   * Forgot password: Generate a secure reset token and log it (send via email in production).
   * Always returns void to prevent email enumeration attacks.
   */
  async forgotPassword(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || !user.isActive) {
      // Silently return — don't reveal whether email exists
      return;
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = this.hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store hashed token with a prefix to distinguish from refresh tokens
    await prisma.refreshToken.create({
      data: {
        token: `pwd_reset:${resetTokenHash}`,
        userId: user.id,
        expiresAt,
      },
    });

    // Build reset URL
    const resetUrl = `${config.app.frontendUrl}/reset-password?token=${resetToken}`;
    logger.info(`Password reset requested for ${normalizedEmail}. Reset URL: ${resetUrl}`);

    // TODO: Send email via SMTP transporter
    // await sendEmail({ to: user.email, subject: "Reset your password", html: `...${resetUrl}...` });
  }

  /**
   * Reset password using a valid reset token.
   */
  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hashToken(token);
    const stored = await prisma.refreshToken.findFirst({
      where: { token: `pwd_reset:${tokenHash}` },
    });

    if (!stored) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    if (stored.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new AppError("Reset token has expired", 400);
    }

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      // Update password
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      // Delete the used reset token
      prisma.refreshToken.delete({ where: { id: stored.id } }),
      // Invalidate all existing refresh tokens (force re-login)
      prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
    ]);
  }

  private async generateTokens(userId: string, email: string, role: import("@prisma/client").UserRole) {
    const payload = { userId, email, role };
    const accessToken = signAccessToken(payload);
    const refreshTokenValue = signRefreshToken(payload);

    // Parse refresh expiry from config (supports "7d", "30d", "1h", etc.)
    const expiresIn = config.jwt.refreshExpiresIn;
    const match = expiresIn.match(/^(\d+)\s*([dhms])$/i);
    let ms: number;
    if (match) {
      const num = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      const multipliers: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
      };
      ms = num * (multipliers[unit] || 86400000);
    } else {
      ms = 7 * 24 * 60 * 60 * 1000; // Default 7 days
    }
    const expiresAt = new Date(Date.now() + ms);

    // Store hashed refresh token (never store raw tokens in DB)
    const tokenHash = this.hashToken(refreshTokenValue);
    await prisma.refreshToken.create({
      data: {
        token: tokenHash,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: refreshTokenValue };
  }

  /**
   * Hash a token using SHA-256 for secure storage.
   * Raw tokens are never stored in the database.
   */
  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}

export const authService = new AuthService();

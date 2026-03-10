import { prisma } from "../config/database";
import { hashPassword, comparePassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { AppError } from "../middleware/errorHandler";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config";
import {
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
  UpdateProfileInput,
} from "../schemas/auth.schema";

export class AuthService {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError("Email already registered", 409);

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
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
    const user = await prisma.user.findUnique({ where: { email: data.email } });
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
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
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
    await prisma.refreshToken.deleteMany({ where: { token } });
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

  private async generateTokens(userId: string, email: string, role: import("@prisma/client").UserRole) {
    const payload = { userId, email, role };
    const accessToken = signAccessToken(payload);
    const refreshTokenValue = signRefreshToken(payload);

    // Parse refresh expiry from config (e.g., "7d" → 7 days)
    const expiresIn = config.jwt.refreshExpiresIn;
    const days = parseInt(expiresIn) || 7;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: refreshTokenValue };
  }
}

export const authService = new AuthService();

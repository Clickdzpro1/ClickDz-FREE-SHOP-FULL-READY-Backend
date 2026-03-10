import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";
import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import crypto from "crypto";

function verifyToken(token: string, secret: string): boolean {
  try {
    const result = verifySync({ token, secret });
    return result.valid === true;
  } catch {
    return false;
  }
}

export const twoFactorService = {
  async setup(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    const existing = await prisma.twoFactorAuth.findUnique({ where: { userId } });
    if (existing?.isEnabled) throw new AppError("2FA is already enabled", 400);

    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: "ClickDz Shop",
      label: user.email,
      secret,
      algorithm: "sha1",
      digits: 6,
      period: 30,
    });
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString("hex")
    );

    await prisma.twoFactorAuth.upsert({
      where: { userId },
      create: { userId, secret, backupCodes: JSON.stringify(backupCodes) },
      update: { secret, backupCodes: JSON.stringify(backupCodes), isEnabled: false },
    });

    return { qrCode, secret, backupCodes };
  },

  async verify(userId: string, token: string) {
    const tfa = await prisma.twoFactorAuth.findUnique({ where: { userId } });
    if (!tfa) throw new AppError("2FA not set up", 400);

    const isValid = verifyToken(token, tfa.secret);
    if (!isValid) throw new AppError("Invalid 2FA code", 400);

    if (!tfa.isEnabled) {
      await prisma.twoFactorAuth.update({
        where: { userId },
        data: { isEnabled: true, verifiedAt: new Date() },
      });
    }

    return true;
  },

  async disable(userId: string, token: string) {
    const tfa = await prisma.twoFactorAuth.findUnique({ where: { userId } });
    if (!tfa?.isEnabled) throw new AppError("2FA is not enabled", 400);

    const isValid = verifyToken(token, tfa.secret);
    if (!isValid) throw new AppError("Invalid 2FA code", 400);

    await prisma.twoFactorAuth.delete({ where: { userId } });
    return true;
  },

  async validateLogin(userId: string, token: string): Promise<boolean> {
    const tfa = await prisma.twoFactorAuth.findUnique({ where: { userId } });
    if (!tfa?.isEnabled) return true; // 2FA not enabled, allow login

    // Try OTP first
    if (verifyToken(token, tfa.secret)) return true;

    // Try backup code
    const backupCodes: string[] = JSON.parse(tfa.backupCodes as string || "[]");
    const codeIndex = backupCodes.indexOf(token);
    if (codeIndex >= 0) {
      backupCodes.splice(codeIndex, 1);
      await prisma.twoFactorAuth.update({
        where: { userId },
        data: { backupCodes: JSON.stringify(backupCodes) },
      });
      return true;
    }

    return false;
  },

  async isEnabled(userId: string): Promise<boolean> {
    const tfa = await prisma.twoFactorAuth.findUnique({ where: { userId } });
    return !!tfa?.isEnabled;
  },
};

import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";

export const socialLoginService = {
  async findOrCreateUser(profile: {
    provider: string;
    providerId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }) {
    // Check if social account already linked
    const existing = await prisma.socialAccount.findUnique({
      where: { provider_providerId: { provider: profile.provider, providerId: profile.providerId } },
      include: { user: true },
    });

    if (existing) {
      return existing.user;
    }

    // Check if user with this email exists
    let user = await prisma.user.findUnique({ where: { email: profile.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: profile.email,
          passwordHash: "", // Social login users don't have a password
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
        },
      });
    }

    // Link social account
    await prisma.socialAccount.create({
      data: {
        userId: user.id,
        provider: profile.provider,
        providerId: profile.providerId,
        email: profile.email,
        name: `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
        avatar: profile.avatar,
      },
    });

    return user;
  },

  async getLinkedAccounts(userId: string) {
    return prisma.socialAccount.findMany({
      where: { userId },
      select: { id: true, provider: true, email: true, name: true, avatar: true, createdAt: true },
    });
  },

  async unlinkAccount(userId: string, provider: string) {
    const account = await prisma.socialAccount.findFirst({
      where: { userId, provider },
    });
    if (!account) throw new AppError("Social account not linked", 404);

    // Make sure user has a password or another social account before unlinking
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const otherAccounts = await prisma.socialAccount.count({
      where: { userId, provider: { not: provider } },
    });

    if (!user?.passwordHash && otherAccounts === 0) {
      throw new AppError("Cannot unlink last login method. Set a password first.", 400);
    }

    await prisma.socialAccount.delete({ where: { id: account.id } });
  },
};

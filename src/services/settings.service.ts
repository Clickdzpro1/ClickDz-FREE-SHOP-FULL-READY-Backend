import { prisma } from "../config/database";

export class SettingsService {
  async getAll() {
    const settings = await prisma.setting.findMany();
    const result: Record<string, unknown> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async get(key: string) {
    const setting = await prisma.setting.findUnique({ where: { key } });
    return setting?.value ?? null;
  }

  async set(key: string, value: unknown) {
    return prisma.setting.upsert({
      where: { key },
      update: { value: value as object },
      create: { key, value: value as object },
    });
  }

  async setMany(settings: Record<string, unknown>) {
    const ops = Object.entries(settings).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: value as object },
        create: { key, value: value as object },
      })
    );
    return prisma.$transaction(ops);
  }
}

export const settingsService = new SettingsService();

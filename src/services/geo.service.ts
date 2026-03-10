import { prisma } from "../config/database";

export class GeoService {
  async getWilayas() {
    return prisma.wilaya.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        nameAr: true,
        nameFr: true,
        nameEn: true,
      },
    });
  }

  async getWilayaById(id: number) {
    return prisma.wilaya.findUnique({
      where: { id },
      include: {
        communes: {
          orderBy: { nameFr: "asc" },
          select: {
            id: true,
            nameAr: true,
            nameFr: true,
            postalCode: true,
            dairaNameFr: true,
          },
        },
      },
    });
  }

  async getCommunesByWilaya(wilayaId: number) {
    return prisma.commune.findMany({
      where: { wilayaId },
      orderBy: { nameFr: "asc" },
      select: {
        id: true,
        nameAr: true,
        nameFr: true,
        postalCode: true,
        dairaNameFr: true,
        wilayaId: true,
      },
    });
  }

  async searchCommunes(query: string) {
    return prisma.commune.findMany({
      where: {
        OR: [
          { nameFr: { contains: query, mode: "insensitive" } },
          { nameAr: { contains: query } },
          { postalCode: { startsWith: query } },
        ],
      },
      include: {
        wilaya: {
          select: { id: true, nameAr: true, nameFr: true, nameEn: true },
        },
      },
      take: 20,
    });
  }
}

export const geoService = new GeoService();

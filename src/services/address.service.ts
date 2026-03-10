import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { CreateAddressInput, UpdateAddressInput } from "../schemas/address.schema";

export class AddressService {
  async list(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      include: {
        wilaya: { select: { id: true, nameAr: true, nameFr: true, nameEn: true } },
        commune: { select: { id: true, nameAr: true, nameFr: true, postalCode: true } },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  async getById(userId: string, addressId: string) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
      include: {
        wilaya: true,
        commune: true,
      },
    });
    if (!address) throw new AppError("Address not found", 404);
    return address;
  }

  async create(userId: string, data: CreateAddressInput) {
    // Verify wilaya and commune exist and match
    const commune = await prisma.commune.findUnique({ where: { id: data.communeId } });
    if (!commune) throw new AppError("Commune not found", 404);
    if (commune.wilayaId !== data.wilayaId) {
      throw new AppError("Commune does not belong to selected wilaya", 400);
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // If first address, make it default
    const count = await prisma.address.count({ where: { userId } });
    if (count === 0) data.isDefault = true;

    return prisma.address.create({
      data: { ...data, userId },
      include: {
        wilaya: { select: { id: true, nameAr: true, nameFr: true, nameEn: true } },
        commune: { select: { id: true, nameAr: true, nameFr: true, postalCode: true } },
      },
    });
  }

  async update(userId: string, addressId: string, data: UpdateAddressInput) {
    await this.getById(userId, addressId);

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id: addressId },
      data,
      include: {
        wilaya: { select: { id: true, nameAr: true, nameFr: true, nameEn: true } },
        commune: { select: { id: true, nameAr: true, nameFr: true, postalCode: true } },
      },
    });
  }

  async delete(userId: string, addressId: string) {
    const address = await this.getById(userId, addressId);
    await prisma.address.delete({ where: { id: addressId } });

    // If was default, set another as default
    if (address.isDefault) {
      const next = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (next) {
        await prisma.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }
  }

  async setDefault(userId: string, addressId: string) {
    await this.getById(userId, addressId);

    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    return prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
      include: {
        wilaya: { select: { id: true, nameAr: true, nameFr: true, nameEn: true } },
        commune: { select: { id: true, nameAr: true, nameFr: true, postalCode: true } },
      },
    });
  }
}

export const addressService = new AddressService();

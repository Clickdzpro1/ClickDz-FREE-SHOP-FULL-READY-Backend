import { PrismaClient } from "@prisma/client";
import { wilayas } from "./data/wilayas";
import { communes } from "./data/communes";
import { categories, CategoryData } from "./data/categories";
import { products } from "./data/products";
import { defaultSettings } from "./data/settings";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedGeo() {
  console.log("  Seeding wilayas...");
  for (const w of wilayas) {
    await prisma.wilaya.upsert({
      where: { id: w.id },
      update: { nameAr: w.nameAr, nameFr: w.nameFr, nameEn: w.nameEn },
      create: { id: w.id, nameAr: w.nameAr, nameFr: w.nameFr, nameEn: w.nameEn },
    });
  }
  console.log(`  ✓ ${wilayas.length} wilayas seeded`);

  console.log("  Seeding communes...");
  for (const c of communes) {
    await prisma.commune.upsert({
      where: {
        id: communes.indexOf(c) + 1,
      },
      update: {
        nameAr: c.nameAr,
        nameFr: c.nameFr,
        postalCode: c.postalCode,
        wilayaId: c.wilayaId,
        dairaNameFr: c.dairaNameFr,
      },
      create: {
        nameAr: c.nameAr,
        nameFr: c.nameFr,
        postalCode: c.postalCode,
        wilayaId: c.wilayaId,
        dairaNameFr: c.dairaNameFr,
      },
    });
  }
  console.log(`  ✓ ${communes.length} communes seeded`);
}

async function seedShippingRates() {
  console.log("  Seeding shipping rates...");
  // Northern wilayas (1-35, 42, 44, 46, 48): cheaper & faster
  // Southern wilayas: more expensive, slower
  const southernIds = [1, 3, 7, 8, 11, 17, 30, 32, 33, 37, 39, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58];

  for (const w of wilayas) {
    const isSouth = southernIds.includes(w.id);
    await prisma.shippingRate.upsert({
      where: { wilayaId_provider: { wilayaId: w.id, provider: "MANUAL" } },
      update: {},
      create: {
        wilayaId: w.id,
        provider: "MANUAL",
        homeDelivery: isSouth ? 900 : 500,
        officeDelivery: isSouth ? 700 : 350,
        estimatedDays: isSouth ? 5 : 2,
      },
    });
  }
  console.log(`  ✓ ${wilayas.length} shipping rates seeded`);
}

async function seedCategories() {
  console.log("  Seeding categories...");
  let count = 0;

  async function createCategory(data: CategoryData, parentId?: string) {
    const cat = await prisma.category.upsert({
      where: { slug: data.slug },
      update: {
        nameAr: data.nameAr,
        nameFr: data.nameFr,
        nameEn: data.nameEn,
        descriptionAr: data.descriptionAr,
        descriptionFr: data.descriptionFr,
        descriptionEn: data.descriptionEn,
        sortOrder: data.sortOrder ?? 0,
        parentId,
      },
      create: {
        slug: data.slug,
        nameAr: data.nameAr,
        nameFr: data.nameFr,
        nameEn: data.nameEn,
        descriptionAr: data.descriptionAr,
        descriptionFr: data.descriptionFr,
        descriptionEn: data.descriptionEn,
        sortOrder: data.sortOrder ?? 0,
        parentId,
      },
    });
    count++;

    if (data.children) {
      for (const child of data.children) {
        await createCategory({ ...child, sortOrder: 0 }, cat.id);
      }
    }
  }

  for (const cat of categories) {
    await createCategory(cat);
  }
  console.log(`  ✓ ${count} categories seeded`);
}

async function seedProducts() {
  console.log("  Seeding products...");

  for (const p of products) {
    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } });

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        sku: p.sku,
        nameAr: p.nameAr,
        nameFr: p.nameFr,
        nameEn: p.nameEn,
        descriptionAr: p.descriptionAr,
        descriptionFr: p.descriptionFr,
        descriptionEn: p.descriptionEn,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: p.stock,
        weight: p.weight,
        categoryId: category?.id,
        isFeatured: p.isFeatured ?? false,
      },
    });

    // Images
    for (let i = 0; i < p.images.length; i++) {
      await prisma.productImage.create({
        data: {
          url: p.images[i],
          sortOrder: i,
          productId: product.id,
        },
      });
    }

    // Variants
    if (p.variants) {
      for (const v of p.variants) {
        await prisma.productVariant.upsert({
          where: { sku: v.sku },
          update: {},
          create: {
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            attributes: v.attributes,
            productId: product.id,
          },
        });
      }
    }
  }
  console.log(`  ✓ ${products.length} products seeded`);
}

async function seedAdmin() {
  console.log("  Seeding admin user...");
  const email = process.env.ADMIN_EMAIL || "admin@clickdz.shop";
  const password = process.env.ADMIN_PASSWORD || "ClickDz2024!";
  const hash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: hash,
      firstName: "Admin",
      lastName: "ClickDz",
      role: "SUPER_ADMIN",
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`  ✓ Admin: ${email} / ${password}`);

  // Demo customer
  const custEmail = "customer@example.com";
  const custHash = await bcrypt.hash("Customer2024!", 12);
  await prisma.user.upsert({
    where: { email: custEmail },
    update: {},
    create: {
      email: custEmail,
      passwordHash: custHash,
      firstName: "Ahmed",
      lastName: "Benali",
      phone: "+213555123456",
      role: "CUSTOMER",
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`  ✓ Customer: ${custEmail} / Customer2024!`);
}

async function seedSettings() {
  console.log("  Seeding settings...");
  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log(`  ✓ ${Object.keys(defaultSettings).length} settings seeded`);
}

async function main() {
  console.log("🌱 Seeding database...\n");

  await seedGeo();
  await seedShippingRates();
  await seedCategories();
  await seedProducts();
  await seedAdmin();
  await seedSettings();

  console.log("\n✅ Seeding complete!");
  console.log("⚠️  Change the default admin password in production!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

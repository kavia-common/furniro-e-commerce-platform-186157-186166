const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with sample categories and products...');

  const categoriesData = [
    { name: 'Sofas', slug: 'sofas' },
    { name: 'Chairs', slug: 'chairs' },
    { name: 'Tables', slug: 'tables' },
    { name: 'Beds', slug: 'beds' },
    { name: 'Storage', slug: 'storage' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const sofas = await prisma.category.findUnique({ where: { slug: 'sofas' } });
  const chairs = await prisma.category.findUnique({ where: { slug: 'chairs' } });
  const tables = await prisma.category.findUnique({ where: { slug: 'tables' } });

  const productsData = [
    {
      name: 'Luna Corner Sofa',
      slug: 'luna-corner-sofa',
      description: 'Modern L-shaped corner sofa with plush cushions and durable fabric.',
      price: '1299.00',
      discountPct: 10,
      stock: 25,
      sku: 'SOFA-LUNA-CRN',
      categoryId: sofas.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1582582621958-c41b66dc8c36', alt: 'Luna Corner Sofa Front', priority: 0 },
        { url: 'https://images.unsplash.com/photo-1616594093127-6da8cff3a605', alt: 'Luna Corner Sofa Angle', priority: 1 },
      ],
    },
    {
      name: 'Aero Lounge Chair',
      slug: 'aero-lounge-chair',
      description: 'Ergonomic lounge chair with breathable mesh and steel frame.',
      price: '349.00',
      discountPct: 0,
      stock: 50,
      sku: 'CHAIR-AERO-LNG',
      categoryId: chairs.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4', alt: 'Aero Lounge Chair', priority: 0 },
      ],
    },
    {
      name: 'Oak Dining Table',
      slug: 'oak-dining-table',
      description: 'Solid oak dining table seating up to 6 people.',
      price: '899.00',
      discountPct: 15,
      stock: 15,
      sku: 'TABLE-OAK-DN6',
      categoryId: tables.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', alt: 'Oak Dining Table', priority: 0 },
      ],
    },
  ];

  for (const p of productsData) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        description: p.description,
        price: p.price,
        discountPct: p.discountPct ?? null,
        stock: p.stock,
        sku: p.sku,
        categoryId: p.categoryId,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        discountPct: p.discountPct ?? null,
        stock: p.stock,
        sku: p.sku,
        categoryId: p.categoryId,
      },
    });

    // reset and re-create images
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: p.images.map((img) => ({
        productId: product.id,
        url: img.url,
        alt: img.alt || null,
        priority: img.priority || 0,
      })),
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

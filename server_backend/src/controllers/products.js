const { getPrisma } = require('../lib/prisma');

function buildProductInclude() {
  return {
    include: {
      category: true,
      images: {
        orderBy: { priority: 'asc' },
      },
    },
  };
}

class ProductsController {
  /**
   * PUBLIC_INTERFACE
   * list
   * List products with optional filters: q, categorySlug, minPrice, maxPrice, hasDiscount, sort, page, pageSize
   */
  async list(req, res) {
    /** This is a public function that lists products with filters and pagination. */
    const prisma = getPrisma();
    const {
      q,
      categorySlug,
      minPrice,
      maxPrice,
      hasDiscount,
      sort = 'newest',
      page = 1,
      pageSize = 12,
    } = req.query;

    const where = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    if (minPrice) where.price = { ...(where.price || {}), gte: minPrice };
    if (maxPrice) where.price = { ...(where.price || {}), lte: maxPrice };
    if (hasDiscount === 'true') where.discountPct = { not: null, gt: 0 };

    const orderBy = [];
    if (sort === 'price_asc') orderBy.push({ price: 'asc' });
    else if (sort === 'price_desc') orderBy.push({ price: 'desc' });
    else orderBy.push({ createdAt: 'desc' });

    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        ...buildProductInclude(),
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({
      items,
      pagination: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    });
  }

  /**
   * PUBLIC_INTERFACE
   * detail
   * Get product by slug or id query param
   */
  async detail(req, res) {
    /** This is a public function that returns a product by slug or id. */
    const prisma = getPrisma();
    const { idOrSlug } = req.params;
    const where = isNaN(Number(idOrSlug))
      ? { slug: idOrSlug }
      : { id: Number(idOrSlug) };
    const product = await prisma.product.findFirst({
      where,
      ...buildProductInclude(),
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json(product);
  }

  /**
   * PUBLIC_INTERFACE
   * create
   * Admin: Create a product
   */
  async create(req, res) {
    /** This is a public function that allows admins to create products. */
    const prisma = getPrisma();
    const { name, slug, description, price, discountPct, stock, sku, categoryId, images } = req.body;

    const created = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        price,
        discountPct: discountPct ?? null,
        stock: stock ?? 0,
        sku: sku || null,
        categoryId,
        images: images?.length
          ? { create: images.map(img => ({ url: img.url, alt: img.alt || null, priority: img.priority || 0 })) }
          : undefined,
      },
      ...buildProductInclude(),
    });
    return res.status(201).json(created);
  }

  /**
   * PUBLIC_INTERFACE
   * update
   * Admin: Update a product by id
   */
  async update(req, res) {
    /** This is a public function that allows admins to update products. */
    const prisma = getPrisma();
    const id = Number(req.params.id);
    const { name, slug, description, price, discountPct, stock, sku, categoryId, images } = req.body;

    // Update product core
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description: description ?? undefined,
        price: price ?? undefined,
        discountPct: discountPct !== undefined ? discountPct : undefined,
        stock: stock !== undefined ? stock : undefined,
        sku: sku !== undefined ? sku : undefined,
        categoryId: categoryId ?? undefined,
      },
      ...buildProductInclude(),
    });

    // Replace images if provided
    if (Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (images.length) {
        await prisma.productImage.createMany({
          data: images.map(img => ({
            productId: id,
            url: img.url,
            alt: img.alt || null,
            priority: img.priority || 0,
          })),
        });
      }
    }

    const final = await prisma.product.findUnique({ where: { id }, ...buildProductInclude() });
    return res.json(final);
  }

  /**
   * PUBLIC_INTERFACE
   * remove
   * Admin: Delete a product by id
   */
  async remove(req, res) {
    /** This is a public function that allows admins to delete products. */
    const prisma = getPrisma();
    const id = Number(req.params.id);
    await prisma.product.delete({ where: { id } });
    return res.status(204).send();
  }
}

module.exports = new ProductsController();

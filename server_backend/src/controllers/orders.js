const { getPrisma } = require('../lib/prisma');
const { Prisma } = require('@prisma/client');

async function computeCartTotal(prisma, cartId) {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
    include: { product: true },
  });
  let total = new Prisma.Decimal(0);
  for (const item of items) {
    const price = new Prisma.Decimal(item.product.price);
    const discountPct = item.product.discountPct || 0;
    const discounted = discountPct > 0 ? price.mul(new Prisma.Decimal(100 - discountPct)).div(100) : price;
    total = total.add(discounted.mul(item.quantity));
  }
  return { items, total };
}

class OrdersController {
  /**
   * PUBLIC_INTERFACE
   * create
   * Create order from cart or direct payload.
   * Body: { fromCart?: boolean, items?: [{ productId, quantity }] }
   */
  async create(req, res) {
    /** This is a public function that creates an order from the user's cart or direct items payload. */
    const prisma = getPrisma();
    const userId = req.user.id;
    const { fromCart, items: payloadItems } = req.body;

    let orderItems = [];
    let total = new Prisma.Decimal(0);

    if (fromCart) {
      const cart = await prisma.cart.findUnique({ where: { userId } });
      if (!cart) return res.status(400).json({ message: 'Cart is empty' });
      const { items, total: t } = await computeCartTotal(prisma, cart.id);
      orderItems = items.map(ci => ({
        productId: ci.productId,
        quantity: ci.quantity,
        price: ci.product.price,
      }));
      total = t;
    } else {
      if (!Array.isArray(payloadItems) || payloadItems.length === 0) {
        return res.status(400).json({ message: 'items payload is required when fromCart is false' });
      }
      // Fetch products and compute totals based on given quantities
      const map = new Map();
      for (const it of payloadItems) map.set(it.productId, it.quantity);
      const products = await prisma.product.findMany({ where: { id: { in: Array.from(map.keys()).map(Number) } } });
      for (const p of products) {
        const q = Number(map.get(p.id) || 0);
        const price = new Prisma.Decimal(p.price);
        const discountPct = p.discountPct || 0;
        const discounted = discountPct > 0 ? price.mul(new Prisma.Decimal(100 - discountPct)).div(100) : price;
        total = total.add(discounted.mul(q));
        orderItems.push({ productId: p.id, quantity: q, price: p.price });
      }
    }

    // Create order and items
    const created = await prisma.order.create({
      data: {
        userId,
        total,
        items: { create: orderItems },
      },
      include: { items: { include: { product: { include: { images: true, category: true } } } } },
    });

    // If fromCart => clear cart
    if (fromCart) {
      const cart = await prisma.cart.findUnique({ where: { userId } });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }

    return res.status(201).json(created);
  }

  /**
   * PUBLIC_INTERFACE
   * listMine
   * List authenticated user's orders
   */
  async listMine(req, res) {
    /** This is a public function that lists orders for the authenticated user. */
    const prisma = getPrisma();
    const items = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    });
    return res.json({ items });
  }

  /**
   * PUBLIC_INTERFACE
   * getById
   * Get order by id (only if belongs to user or admin)
   */
  async getById(req, res) {
    /** This is a public function that returns a specific order if authorized. */
    const prisma = getPrisma();
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    return res.json(order);
  }

  /**
   * PUBLIC_INTERFACE
   * listAll
   * Admin: list all orders
   */
  async listAll(req, res) {
    /** This is a public function that lists all orders for admins. */
    const prisma = getPrisma();
    const items = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } }, user: { select: { id: true, email: true } } },
    });
    return res.json({ items });
  }
}

module.exports = new OrdersController();

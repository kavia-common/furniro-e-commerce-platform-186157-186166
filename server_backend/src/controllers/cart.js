const { getPrisma } = require('../lib/prisma');

async function getOrCreateUserCart(prisma, userId) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { images: { orderBy: { priority: 'asc' } }, category: true },
          },
        },
      },
    },
  });
}

class CartController {
  /**
   * PUBLIC_INTERFACE
   * get
   * Get the current user's cart
   */
  async get(req, res) {
    /** This is a public function that returns the authenticated user's cart. */
    const prisma = getPrisma();
    const cart = await getOrCreateUserCart(prisma, req.user.id);
    return res.json(cart);
  }

  /**
   * PUBLIC_INTERFACE
   * add
   * Add item to cart: { productId, quantity }
   */
  async add(req, res) {
    /** This is a public function that adds a product to the user's cart. */
    const prisma = getPrisma();
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity || 1 } },
      create: { cartId: cart.id, productId, quantity: quantity || 1 },
    });

    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: { include: { images: true, category: true } } } } },
    });
    return res.status(201).json(updated);
  }

  /**
   * PUBLIC_INTERFACE
   * update
   * Update item quantity: { productId, quantity }
   */
  async update(req, res) {
    /** This is a public function that updates quantity of a product in the cart. */
    const prisma = getPrisma();
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    } else {
      await prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId } },
        update: { quantity },
        create: { cartId: cart.id, productId, quantity },
      });
    }

    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: { include: { images: true, category: true } } } } },
    });
    return res.json(updated);
  }

  /**
   * PUBLIC_INTERFACE
   * remove
   * Remove a product from the cart by productId
   */
  async remove(req, res) {
    /** This is a public function that removes a product from the cart. */
    const prisma = getPrisma();
    const userId = req.user.id;
    const productId = Number(req.params.productId);

    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });

    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: { include: { images: true, category: true } } } } },
    });
    return res.json(updated);
  }

  /**
   * PUBLIC_INTERFACE
   * clear
   * Clear all items from the cart
   */
  async clear(req, res) {
    /** This is a public function that clears the cart. */
    const prisma = getPrisma();
    const userId = req.user.id;

    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    const cleared = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: { include: { images: true, category: true } } } } },
    });

    return res.json(cleared);
  }
}

module.exports = new CartController();

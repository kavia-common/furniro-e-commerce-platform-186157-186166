const express = require('express');
const ProductsController = require('../controllers/products');
const { authenticate, requireAdmin, validateBody } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product browsing and admin management
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: List products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: categorySlug
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: hasDiscount
 *         schema: { type: string, enum: [ "true", "false" ] }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [ "newest", "price_asc", "price_desc" ] }
 *       - in: query
 *         name: page
 *         schema: { type: number }
 *       - in: query
 *         name: pageSize
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/', ProductsController.list.bind(ProductsController));

/**
 * @swagger
 * /api/products/{idOrSlug}:
 *   get:
 *     summary: Get product by id or slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product details
 */
router.get('/:idOrSlug', ProductsController.detail.bind(ProductsController));

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create product (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ name, slug, price, categoryId ]
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               discountPct: { type: number }
 *               stock: { type: number }
 *               sku: { type: string }
 *               categoryId: { type: number }
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url: { type: string }
 *                     alt: { type: string }
 *                     priority: { type: number }
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateBody({
    name: { type: 'string' },
    slug: { type: 'string' },
    price: { type: 'number' },
    categoryId: { type: 'number' },
    description: { type: 'string', optional: true },
    discountPct: { type: 'number', optional: true },
    stock: { type: 'number', optional: true },
    sku: { type: 'string', optional: true },
    images: { type: 'array', optional: true },
  }),
  ProductsController.create.bind(ProductsController)
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Updated
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  ProductsController.update.bind(ProductsController)
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: number }
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  ProductsController.remove.bind(ProductsController)
);

module.exports = router;

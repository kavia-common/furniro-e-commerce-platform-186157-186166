const express = require('express');
const CartController = require('../controllers/cart');
const { authenticate, validateBody } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Cart
 *     description: Shopping cart operations
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get current cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart data
 */
router.get('/', authenticate, CartController.get.bind(CartController));

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: number }
 *               quantity: { type: number }
 *     responses:
 *       201:
 *         description: Added
 */
router.post(
  '/add',
  authenticate,
  validateBody({ productId: { type: 'number' }, quantity: { type: 'number', optional: true } }),
  CartController.add.bind(CartController)
);

/**
 * @swagger
 * /api/cart/update:
 *   post:
 *     summary: Update item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId: { type: number }
 *               quantity: { type: number }
 *     responses:
 *       200:
 *         description: Updated
 */
router.post(
  '/update',
  authenticate,
  validateBody({ productId: { type: 'number' }, quantity: { type: 'number' } }),
  CartController.update.bind(CartController)
);

/**
 * @swagger
 * /api/cart/item/{productId}:
 *   delete:
 *     summary: Remove product from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Removed
 */
router.delete('/item/:productId', authenticate, CartController.remove.bind(CartController));

/**
 * @swagger
 * /api/cart/clear:
 *   post:
 *     summary: Clear cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleared
 */
router.post('/clear', authenticate, CartController.clear.bind(CartController));

module.exports = router;

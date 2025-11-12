const express = require('express');
const OrdersController = require('../controllers/orders');
const { authenticate, requireAdmin, validateBody } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order operations
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fromCart: { type: boolean }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId: { type: number }
 *                     quantity: { type: number }
 *     responses:
 *       201:
 *         description: Order created
 */
router.post(
  '/',
  authenticate,
  validateBody({
    fromCart: { type: 'boolean', optional: true },
    items: { type: 'array', optional: true },
  }),
  OrdersController.create.bind(OrdersController)
);

/**
 * @swagger
 * /api/orders/mine:
 *   get:
 *     summary: List my orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 */
router.get('/mine', authenticate, OrdersController.listMine.bind(OrdersController));

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by id
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/:id', authenticate, OrdersController.getById.bind(OrdersController));

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: List all orders (admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All orders
 */
router.get('/', authenticate, requireAdmin, OrdersController.listAll.bind(OrdersController));

module.exports = router;

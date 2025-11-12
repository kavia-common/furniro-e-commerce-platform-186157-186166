const express = require('express');
const CategoriesController = require('../controllers/categories');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Product categories
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: List categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', CategoriesController.list.bind(CategoriesController));

module.exports = router;

const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Furniro Backend API',
      version: '1.0.0',
      description: 'Express + Prisma API for Furniro e-commerce platform',
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Products', description: 'Product browsing and admin management' },
      { name: 'Categories', description: 'Product categories' },
      { name: 'Cart', description: 'Shopping cart operations' },
      { name: 'Orders', description: 'Order operations' },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;

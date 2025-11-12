# furniro-e-commerce-platform-186157-186166

Backend API (server_backend)
- Swagger UI: /docs
- Health: GET /
- API base: /api
  - Auth: /api/auth (POST /register, POST /login, GET /me)
  - Products: /api/products (GET list, GET /:idOrSlug, POST, PUT /:id, DELETE /:id [admin])
  - Categories: /api/categories (GET)
  - Cart: /api/cart (GET), POST /add, POST /update, DELETE /item/:productId, POST /clear
  - Orders: /api/orders (POST create, GET /mine, GET /:id, GET / [admin])

Environment
- Copy server_backend/.env.example to server_backend/.env and set DATABASE_URL, JWT_SECRET, PORT, HOST, CORS_ORIGINS.
- CORS_ORIGINS may be comma-separated list or "*".

Prisma
- See server_backend/PRISMA_SETUP.md for generate, migrate, and seed steps.
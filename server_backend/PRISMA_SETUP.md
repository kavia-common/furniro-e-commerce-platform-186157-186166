Prisma + MySQL Setup (server_backend)

1) Install dependencies (CI will handle based on package.json):
   - prisma (devDependency)
   - @prisma/client (dependency)

2) Configure environment:
   - Copy .env.example to .env and set:
     DATABASE_URL="mysql://username:password@host:3306/furniro"
     JWT_SECRET="your_secure_secret"
     NODE_ENV="development"

3) Generate client:
   npm run prisma:generate

4) Run migrations:
   - For development (create or update schema + create migration history):
     npm run prisma:migrate
   - For production deploy:
     npm run prisma:deploy

5) Seed data:
   npm run prisma:seed

6) Optional reset:
   npm run db:reset

Notes:
- Prisma schema is located at prisma/schema.prisma
- Seed script adds sample categories and products
- Use the helper at src/lib/prisma.js to access Prisma client:
    const { getPrisma } = require('../lib/prisma');
    const prisma = getPrisma();

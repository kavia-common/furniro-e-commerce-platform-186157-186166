const { getPrisma } = require('../lib/prisma');

class CategoriesController {
  /**
   * PUBLIC_INTERFACE
   * list
   * List all categories
   */
  async list(req, res) {
    /** This is a public function that lists all categories. */
    const prisma = getPrisma();
    const items = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true },
    });
    return res.json({ items });
  }
}

module.exports = new CategoriesController();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPrisma } = require('../lib/prisma');

function signToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name || null,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

class AuthController {
  /**
   * PUBLIC_INTERFACE
   * register
   * Register a new user. Body: { email, password, name? }
   */
  async register(req, res) {
    /** This is a public function that registers a user and returns JWT + profile. */
    const prisma = getPrisma();
    const { email, password, name } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        name: name || null,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    // Ensure user has a cart record
    await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    const token = signToken(user);
    return res.status(201).json({ token, user });
  }

  /**
   * PUBLIC_INTERFACE
   * login
   * Login a user. Body: { email, password }
   */
  async login(req, res) {
    /** This is a public function that logs in a user and returns JWT + profile. */
    const prisma = getPrisma();
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = signToken(safeUser);
    return res.json({ token, user: safeUser });
  }

  /**
   * PUBLIC_INTERFACE
   * me
   * Return current user profile from JWT
   */
  async me(req, res) {
    /** This is a public function that returns the authenticated user's profile. */
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  }
}

module.exports = new AuthController();

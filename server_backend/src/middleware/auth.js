const jwt = require('jsonwebtoken');

/**
 * Extract allowed origins from env (comma-separated) or wildcard.
 */
function getAllowedOrigins() {
  const raw = process.env.CORS_ORIGINS || '*';
  if (raw === '*') return '*';
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * PUBLIC_INTERFACE
 * authenticate
 * Middleware that verifies JWT and attaches user payload to req.user.
 */
function authenticate(req, res, next) {
  /** This is a public function that authenticates a JWT from Authorization header. */
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Missing Authorization token' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role, email: payload.email, name: payload.name || null };
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * PUBLIC_INTERFACE
 * requireAdmin
 * Middleware that requires the user role to be ADMIN.
 */
function requireAdmin(req, res, next) {
  /** This is a public function that enforces ADMIN role. */
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
}

/**
 * PUBLIC_INTERFACE
 * validateBody
 * Simple body validation helper: ensures required fields exist and types are valid.
 * Pass an object with keys => 'string' | 'number' | 'boolean' | 'object' | 'array' and { optional: true } for optional.
 */
function validateBody(schema) {
  /** This is a public function that validates req.body against a simple schema. */
  return (req, res, next) => {
    const errors = [];
    for (const [key, rules] of Object.entries(schema || {})) {
      const value = req.body[key];
      const optional = !!rules.optional;
      const type = rules.type;
      if (value === undefined || value === null) {
        if (!optional) errors.push(`${key} is required`);
        continue;
      }
      if (type) {
        if (type === 'array') {
          if (!Array.isArray(value)) errors.push(`${key} must be an array`);
        } else if (type === 'number') {
          if (typeof value !== 'number') errors.push(`${key} must be a number`);
        } else if (type === 'boolean') {
          if (typeof value !== 'boolean') errors.push(`${key} must be a boolean`);
        } else if (type === 'object') {
          if (typeof value !== 'object' || Array.isArray(value)) errors.push(`${key} must be an object`);
        } else if (type === 'string') {
          if (typeof value !== 'string') errors.push(`${key} must be a string`);
        }
      }
    }
    if (errors.length) {
      return res.status(400).json({ message: 'Validation error', errors });
    }
    return next();
  };
}

module.exports = {
  // PUBLIC_INTERFACE
  authenticate,
  // PUBLIC_INTERFACE
  requireAdmin,
  // PUBLIC_INTERFACE
  validateBody,
  getAllowedOrigins,
};

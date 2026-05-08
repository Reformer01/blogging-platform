import jwt from 'jsonwebtoken';

function requireJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required (refusing insecure default)');
  }
  return secret;
}

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  let secret;
  try {
    secret = requireJwtSecret();
  } catch (e) {
    return res.status(500).json({ error: 'Server auth misconfigured' });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    // Backward compatible decode:
    // - new tokens: { id, email, username, role }
    // - legacy tokens (pre-modern-auth): { userId }
    req.user = {
      ...user,
      id: user?.id ?? user?.userId,
    };
    next();
  });
};

export const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

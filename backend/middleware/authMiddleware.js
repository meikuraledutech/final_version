import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      req.user = decoded;
      next();
    });
  } catch (err) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const verifySuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Only superadmin can access this' });
  }
  next();
};

export { verifyToken, verifySuperAdmin };

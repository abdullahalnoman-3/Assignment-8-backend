import jwt from 'jsonwebtoken';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No authorization token was provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'assignment8-secret-key-super-secure-2026';

    const decoded = jwt.verify(token, secret);

    // Attach user information to request (excluding role)
    req.user = {
      id: decoded.id,
      email: decoded.email?.toLowerCase(),
      name: decoded.name,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session token has expired. Please sign in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    });
  }
};

export default requireAuth;

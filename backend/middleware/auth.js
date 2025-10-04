// middleware/auth.js
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
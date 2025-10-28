// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';
import Role from '../models/role.model.js'
import { logLoginActivity, logLogoutActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// routes/admin.js (login)
// Admin login - Fixed version
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email, isActive: true })
      .populate('role'); 

    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: admin.role?.name || admin.role }, // Include role name in token
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log login activity
    await logLoginActivity(req, admin, token);

    // Return admin with populated role
    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role // Now this will be the full role object with name and permissions
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await Admin.findById(decoded.id);
      
      if (admin) {
        await logLogoutActivity(req, admin);
      }
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current admin
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password').populate('role');
    
    res.json(admin);
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
});

export default router;
// routes/activityLogs.js (new file)
import express from 'express';
import { logNavigation } from '../middleware/activityLogger.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Track navigation from frontend
router.post('/navigation', authenticate, async (req, res) => {
  try {
    const { fromPage, toPage } = req.body;
    
    await logNavigation(
      req.admin._id,
      fromPage,
      toPage,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json({ message: 'Navigation logged successfully' });
  } catch (error) {
    console.error('Error logging navigation:', error);
    res.status(500).json({ message: 'Failed to log navigation' });
  }
});

export default router;
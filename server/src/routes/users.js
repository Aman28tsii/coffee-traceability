import express from 'express';
import { protect, allowAdmin } from '../middleware/auth.js';
import { query } from '../config/database.js';

const router = express.Router();

router.get('/', protect, allowAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT id, name, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
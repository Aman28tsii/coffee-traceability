import express from 'express';
import { protect } from '../middleware/auth.js';
import { pool } from '../config/database.js';

const router = express.Router();

router.use(protect);

// Get all shipments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, 
        array_length(s.lot_ids, 1) as lot_count,
        u.name as created_by_name
      FROM shipments s
      LEFT JOIN users u ON s.created_by = u.id
      ORDER BY s.export_date DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
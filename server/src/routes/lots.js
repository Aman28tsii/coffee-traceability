import express from 'express';
import { protect } from '../middleware/auth.js';
import { getLots, getLotById, createLot, updateLotStatus, deleteLot, getLotQRCode } from '../controllers/lotController.js';
import { pool } from '../config/database.js';

const router = express.Router();

router.use(protect);

// Role-based access for GET / (list lots)
router.get('/', async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    
    let query = `
      SELECT l.*, f.name as farm_name, farmers.name as farmer_name
      FROM lots l
      LEFT JOIN farms f ON l.farm_id = f.id
      LEFT JOIN farmers ON l.farmer_id = farmers.id
      WHERE 1=1
    `;
    let params = [];
    let paramIndex = 1;
    
    // Farmers see only their own lots
    if (userRole === 'farmer') {
      query += ` AND farmers.user_id = $${paramIndex++}`;
      params.push(userId);
    }
    // Coop sees all lots (for now)
    else if (userRole === 'coop') {
      // No additional filter - show all lots
    }
    
    query += ` ORDER BY l.created_at DESC`;
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get lots error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// Admin and Exporter only can create/update/delete
router.post('/', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'exporter') {
    return createLot(req, res, next);
  }
  res.status(403).json({ success: false, error: 'Access denied' });
});

router.put('/:id/status', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'exporter') {
    return updateLotStatus(req, res, next);
  }
  res.status(403).json({ success: false, error: 'Access denied' });
});

router.delete('/:id', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'exporter') {
    return deleteLot(req, res, next);
  }
  res.status(403).json({ success: false, error: 'Access denied' });
});

router.get('/qr/:lotNumber', getLotQRCode);
router.get('/:id', getLotById);

export default router;
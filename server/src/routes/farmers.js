import express from 'express';
import { protect } from '../middleware/auth.js';
import { getFarmers, getFarmerById, createFarmer, updateFarmer, deleteFarmer } from '../controllers/farmerController.js';
import { pool } from '../config/database.js';

const router = express.Router();

router.use(protect);

// Role-based access for GET / (list farmers)
router.get('/', async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    
    let query = `SELECT * FROM farmers`;
    let params = [];
    
    // Farmers see only themselves
    if (userRole === 'farmer') {
      query += ` WHERE user_id = $1`;
      params.push(userId);
    }
    // Coop sees farmers in their cooperative
    else if (userRole === 'coop') {
      query += ` WHERE cooperative_name IS NOT NULL`;
    }
    
    query += ` ORDER BY name`;
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin and Exporter only can create/update/delete
router.post('/', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'exporter') {
    return createFarmer(req, res, next);
  }
  res.status(403).json({ success: false, error: 'Access denied' });
});

router.put('/:id', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'exporter') {
    return updateFarmer(req, res, next);
  }
  res.status(403).json({ success: false, error: 'Access denied' });
});

router.delete('/:id', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'exporter') {
    return deleteFarmer(req, res, next);
  }
  res.status(403).json({ success: false, error: 'Access denied' });
});

router.get('/:id', getFarmerById);

export default router;
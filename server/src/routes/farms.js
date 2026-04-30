import express from 'express';
import { protect } from '../middleware/auth.js';
import { getFarms, getFarmById, createFarm, updateFarm, deleteFarm } from '../controllers/farmController.js';
import { pool } from '../config/database.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Role-based access for GET / (list farms)
router.get('/', async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    
    let query = `
      SELECT f.*, farmers.name as farmer_name
      FROM farms f
      LEFT JOIN farmers ON f.farmer_id = farmers.id
    `;
    let params = [];
    
    // Farmers see only their own farms
    if (userRole === 'farmer') {
      query += ` WHERE farmers.user_id = $1`;
      params.push(userId);
    }
    // Coop sees farms from their cooperative
    else if (userRole === 'coop') {
      query += ` WHERE farmers.cooperative_name IS NOT NULL`;
    }
    
    query += ` ORDER BY f.name`;
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get farms error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin and Exporter only can create/update/delete
router.post('/', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'exporter') {
    return createFarm(req, res, next);
  }
  res.status(403).json({ success: false, error: 'Access denied' });
});

router.put('/:id', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'exporter') {
    return updateFarm(req, res, next);
  }
  res.status(403).json({ success: false, error: 'Access denied' });
});

router.delete('/:id', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'exporter') {
    return deleteFarm(req, res, next);
  }
  res.status(403).json({ success: false, error: 'Access denied' });
});

router.get('/:id', getFarmById);
router.post('/:id/upload', protect, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const imageUrl = `/uploads/${req.file.filename}`;
    
    await pool.query('UPDATE farms SET image_url = $1 WHERE id = $2', [imageUrl, id]);
    
    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
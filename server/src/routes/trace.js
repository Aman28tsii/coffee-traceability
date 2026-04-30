import express from 'express';
import { protect, allowExporter } from '../middleware/auth.js';
import { query } from '../config/database.js';

const router = express.Router();

router.use(protect);
router.use(allowExporter);

// Add trace event to a lot
router.post('/lots/:lotId/events', async (req, res) => {
  try {
    const { lotId } = req.params;
    const { event_type, event_date, location_latitude, location_longitude, description, temperature, humidity, operator_name } = req.body;
    const userId = req.user.id;
    
    const result = await query(
      `INSERT INTO trace_events (lot_id, event_type, event_date, location_latitude, location_longitude, description, temperature, humidity, operator_name, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [lotId, event_type, event_date, location_latitude, location_longitude, description, temperature, humidity, operator_name, userId]
    );
    
    // Update lot status if needed
    if (event_type === 'washing') {
      await query(`UPDATE lots SET status = 'processing' WHERE id = $1`, [lotId]);
    } else if (event_type === 'drying') {
      await query(`UPDATE lots SET status = 'processing' WHERE id = $1`, [lotId]);
    } else if (event_type === 'storage') {
      await query(`UPDATE lots SET status = 'stored' WHERE id = $1`, [lotId]);
    } else if (event_type === 'export') {
      await query(`UPDATE lots SET status = 'exported' WHERE id = $1`, [lotId]);
    }
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Add trace event error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get trace timeline for a lot
router.get('/lots/:lotId/timeline', async (req, res) => {
  try {
    const { lotId } = req.params;
    
    const result = await query(`
      SELECT * FROM trace_events 
      WHERE lot_id = $1 
      ORDER BY event_date ASC
    `, [lotId]);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
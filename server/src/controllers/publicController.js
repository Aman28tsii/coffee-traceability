import { query } from '../config/database.js';

export const getPublicTrace = async (req, res) => {
  try {
    const { lotNumber } = req.params;
    
    const lotResult = await query(`
      SELECT l.*, 
        f.name as farm_name, f.location_description, f.latitude, f.longitude, f.altitude,
        farmers.name as farmer_name, farmers.cooperative_name
      FROM lots l
      LEFT JOIN farms f ON l.farm_id = f.id
      LEFT JOIN farmers ON l.farmer_id = farmers.id
      WHERE l.lot_number = $1
    `, [lotNumber]);
    
    if (lotResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Lot not found' });
    }
    
    const traceResult = await query(`
      SELECT * FROM trace_events 
      WHERE lot_id = $1 
      ORDER BY event_date ASC
    `, [lotResult.rows[0].id]);
    
    const qualityResult = await query(`
      SELECT * FROM quality_assessments 
      WHERE lot_id = $1 
      ORDER BY assessment_date DESC 
      LIMIT 1
    `, [lotResult.rows[0].id]);
    
    res.json({
      success: true,
      data: {
        lot: lotResult.rows[0],
        trace_events: traceResult.rows,
        quality: qualityResult.rows[0] || null
      }
    });
  } catch (error) {
    console.error('Public trace error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
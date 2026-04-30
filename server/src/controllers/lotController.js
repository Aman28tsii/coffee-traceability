import { query } from '../config/database.js';
import QRCode from 'qrcode';

const generateLotNumber = async () => {
  const result = await query("SELECT MAX(CAST(SUBSTRING(lot_number FROM 4) AS INTEGER)) as max FROM lots WHERE lot_number LIKE 'LOT%'");
  const nextNum = (result.rows[0].max || 0) + 1;
  return `LOT${String(nextNum).padStart(4, '0')}`;
};

export const getLots = async (req, res) => {
  try {
    const result = await query(`
      SELECT l.*, f.name as farm_name
      FROM lots l
      LEFT JOIN farms f ON l.farm_id = f.id
      ORDER BY l.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get lots error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getLotById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT l.*, f.name as farm_name, f.farm_code
      FROM lots l
      LEFT JOIN farms f ON l.farm_id = f.id
      WHERE l.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Lot not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get lot error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createLot = async (req, res) => {
  try {
    const { farm_id, harvest_date, processing_method, quantity_kg } = req.body;
    const userId = req.user.id;
    
    const lotNumber = await generateLotNumber();
    
    const result = await query(
      `INSERT INTO lots (lot_number, farm_id, harvest_date, processing_method, quantity_kg, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING *`,
      [lotNumber, farm_id, harvest_date, processing_method, quantity_kg, userId]
    );
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create lot error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateLotStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await query(
      `UPDATE lots SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Lot not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update lot status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteLot = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM lots WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Lot not found' });
    }
    
    res.json({ success: true, message: 'Lot deleted successfully' });
  } catch (error) {
    console.error('Delete lot error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getLotQRCode = async (req, res) => {
  try {
    const { lotNumber } = req.params;
    const result = await query(
      `SELECT l.*, f.name as farm_name 
       FROM lots l 
       LEFT JOIN farms f ON l.farm_id = f.id 
       WHERE l.lot_number = $1`,
      [lotNumber]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Lot not found' });
    }
    
    const lot = result.rows[0];
    const traceUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/trace/${lot.lot_number}`;
    
    const qrCode = await QRCode.toDataURL(traceUrl, {
      width: 300,
      margin: 2
    });
    
    res.json({ success: true, qrCode, url: traceUrl, lot });
  } catch (error) {
    console.error('QR code error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
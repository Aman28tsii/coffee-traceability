import { query } from '../config/database.js';

export const getShipments = async (req, res) => {
  try {
    const result = await query(`
      SELECT s.*, 
        l.lot_number,
        f.name as farm_name
      FROM shipments s
      LEFT JOIN lots l ON s.lot_id = l.id
      LEFT JOIN farms f ON l.farm_id = f.id
      ORDER BY s.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT s.*, l.lot_number
      FROM shipments s
      LEFT JOIN lots l ON s.lot_id = l.id
      WHERE s.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get shipment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createShipment = async (req, res) => {
  try {
    const { lot_id, destination, shipment_date, carrier, tracking_number } = req.body;
    const userId = req.user.id;
    
    // Generate shipment number
    const result2 = await query("SELECT MAX(CAST(SUBSTRING(shipment_number FROM 4) AS INTEGER)) as max FROM shipments WHERE shipment_number LIKE 'SHP%'");
    const nextNum = (result2.rows[0].max || 0) + 1;
    const shipmentNumber = `SHP${String(nextNum).padStart(4, '0')}`;
    
    const result = await query(
      `INSERT INTO shipments (shipment_number, lot_id, destination, shipment_date, carrier, tracking_number, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [shipmentNumber, lot_id, destination, shipment_date, carrier, tracking_number, userId]
    );
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await query(
      `UPDATE shipments 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update shipment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM shipments WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }
    
    res.json({ success: true, message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error('Delete shipment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
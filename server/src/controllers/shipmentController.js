import { query } from '../config/database.js';

export const getShipments = async (req, res) => {
  try {
    const result = await query('SELECT * FROM shipments ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM shipments WHERE id = $1', [id]);
    
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
    const { lot_id, origin, destination, status } = req.body;
    
    // Generate unique shipment number
    const result2 = await query("SELECT MAX(CAST(SUBSTRING(shipment_number FROM 4) AS INTEGER)) as max FROM shipments WHERE shipment_number LIKE 'SHP%'");
    const nextNum = (result2.rows[0].max || 0) + 1;
    const shipmentNumber = `SHP${String(nextNum).padStart(4, '0')}`;
    
    const result = await query(
      `INSERT INTO shipments (shipment_number, lot_id, origin, destination, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [shipmentNumber, lot_id, origin, destination, status || 'pending']
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
      'UPDATE shipments SET status = $1 WHERE id = $2 RETURNING *',
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
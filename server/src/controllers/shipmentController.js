import { query } from '../config/database.js';

const generateShipmentNumber = async () => {
  const result = await query("SELECT MAX(CAST(SUBSTRING(shipment_number FROM 4) AS INTEGER)) as max FROM shipments WHERE shipment_number LIKE 'SHP%'");
  const nextNum = (result.rows[0].max || 0) + 1;
  return `SHP${String(nextNum).padStart(4, '0')}`;
};

export const createShipment = async (req, res) => {
  try {
    const {
      lot_ids,
      container_number,
      shipping_line,
      bill_of_lading,
      export_date,
      port_of_origin,
      port_of_destination,
      quantity_kg,
      number_of_bags,
      fob_price_usd,
      buyer_name,
      buyer_company,
      buyer_country,
      eudr_compliant,
      gps_validated
    } = req.body;
    
    const userId = req.user.id;
    const shipmentNumber = await generateShipmentNumber();
    
    const result = await query(
      `INSERT INTO shipments (
        shipment_number, lot_ids, container_number, shipping_line, bill_of_lading,
        export_date, port_of_origin, port_of_destination, quantity_kg, number_of_bags,
        fob_price_usd, buyer_name, buyer_company, buyer_country,
        eudr_compliant, gps_validated, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        shipmentNumber, lot_ids, container_number, shipping_line, bill_of_lading,
        export_date, port_of_origin, port_of_destination, quantity_kg, number_of_bags,
        fob_price_usd, buyer_name, buyer_company, buyer_country,
        eudr_compliant, gps_validated, userId
      ]
    );
    
    // Update lot statuses to exported
    for (const lotId of lot_ids) {
      await query(`UPDATE lots SET status = 'exported' WHERE id = $1`, [lotId]);
      
      // Add trace event for export
      await query(
        `INSERT INTO trace_events (lot_id, event_type, event_date, description, created_by)
         VALUES ($1, 'export', $2, $3, $4)`,
        [lotId, export_date, `Exported via ${shipping_line} - ${shipmentNumber}`, userId]
      );
    }
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getShipments = async (req, res) => {
  try {
    const result = await query(`
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
};

export const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT s.*,
        json_agg(DISTINCT jsonb_build_object(
          'id', l.id,
          'lot_number', l.lot_number,
          'quantity_kg', l.quantity_kg,
          'farm_name', f.name,
          'farmer_name', farmers.name
        )) as lots
      FROM shipments s
      LEFT JOIN UNNEST(s.lot_ids) AS lot_id ON true
      LEFT JOIN lots l ON lot_id = l.id
      LEFT JOIN farms f ON l.farm_id = f.id
      LEFT JOIN farmers ON l.farmer_id = farmers.id
      WHERE s.id = $1
      GROUP BY s.id
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

export const addComplianceDocument = async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const { document_type, document_url, notes } = req.body;
    const userId = req.user.id;
    
    const result = await query(
      `INSERT INTO compliance_documents (
        shipment_id, document_type, document_url, verified_by, notes
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [shipmentId, document_type, document_url, userId, notes]
    );
    
    // Update shipment EUDR compliance flag
    await query(
      `UPDATE shipments SET eudr_compliant = true WHERE id = $1`,
      [shipmentId]
    );
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Add compliance document error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
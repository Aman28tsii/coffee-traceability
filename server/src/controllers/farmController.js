import { query } from '../config/database.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const generateFarmCode = async () => {
  const result = await query("SELECT MAX(CAST(SUBSTRING(farm_code FROM 6) AS INTEGER)) as max FROM farms WHERE farm_code LIKE 'FARM%'");
  const nextNum = (result.rows[0].max || 0) + 1;
  return `FARM${String(nextNum).padStart(4, '0')}`;
};

export const getFarms = async (req, res) => {
  try {
    const result = await query(`
      SELECT f.*, 
        farmers.name as farmer_name,
        COUNT(lots.id) as lot_count,
        COALESCE(SUM(lots.quantity_kg), 0) as total_harvest
      FROM farms f
      LEFT JOIN farmers ON f.farmer_id = farmers.id
      LEFT JOIN lots ON f.id = lots.farm_id
      GROUP BY f.id, farmers.name
      ORDER BY f.name
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get farms error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getFarmById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT f.*, farmers.name as farmer_name, farmers.phone as farmer_phone
      FROM farms f
      LEFT JOIN farmers ON f.farmer_id = farmers.id
      WHERE f.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Farm not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get farm error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createFarm = async (req, res) => {
  try {
    const { farmer_id, name, location_description, latitude, longitude, altitude, area_hectares, coffee_variety, tree_age, certifications } = req.body;
    
    const farmCode = await generateFarmCode();
    
    const result = await query(
      `INSERT INTO farms (farm_code, farmer_id, name, location_description, latitude, longitude, altitude, area_hectares, coffee_variety, tree_age, certifications)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [farmCode, farmer_id, name, location_description, latitude, longitude, altitude, area_hectares, coffee_variety, tree_age, certifications || []]
    );
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create farm error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location_description, latitude, longitude, altitude, area_hectares, coffee_variety, tree_age, certifications } = req.body;
    
    const result = await query(
      `UPDATE farms 
       SET name = COALESCE($1, name),
           location_description = COALESCE($2, location_description),
           latitude = COALESCE($3, latitude),
           longitude = COALESCE($4, longitude),
           altitude = COALESCE($5, altitude),
           area_hectares = COALESCE($6, area_hectares),
           coffee_variety = COALESCE($7, coffee_variety),
           tree_age = COALESCE($8, tree_age),
           certifications = COALESCE($9, certifications),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [name, location_description, latitude, longitude, altitude, area_hectares, coffee_variety, tree_age, certifications, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Farm not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update farm error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteFarm = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lotCheck = await query('SELECT COUNT(*) FROM lots WHERE farm_id = $1', [id]);
    if (parseInt(lotCheck.rows[0].count) > 0) {
      return res.status(400).json({ success: false, error: 'Cannot delete farm with existing lots' });
    }
    
    const result = await query('DELETE FROM farms WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Farm not found' });
    }
    
    res.json({ success: true, message: 'Farm deleted successfully' });
  } catch (error) {
    console.error('Delete farm error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/farms';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `farm_${Date.now()}${path.extname(file.originalname)}`);
  }
});

export const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

export const uploadFarmImage = async (req, res) => {
  try {
    const { id } = req.params;
    const imageUrl = `/uploads/farms/${req.file.filename}`;
    
    await query('UPDATE farms SET image_url = $1 WHERE id = $2', [imageUrl, id]);
    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

const generateFarmerCode = async () => {
  const result = await query("SELECT MAX(CAST(SUBSTRING(farmer_code FROM 5) AS INTEGER)) as max FROM farmers WHERE farmer_code LIKE 'FARM%'");
  const nextNum = (result.rows[0].max || 0) + 1;
  return `FARM${String(nextNum).padStart(4, '0')}`;
};

// Get all farmers
export const getFarmers = async (req, res) => {
  try {
    const result = await query(`
      SELECT f.*, COUNT(farms.id) as farm_count
      FROM farmers f
      LEFT JOIN farms ON f.id = farms.farmer_id
      GROUP BY f.id
      ORDER BY f.name
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single farmer
export const getFarmerById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT f.*, 
        json_agg(DISTINCT jsonb_build_object('id', farms.id, 'name', farms.name, 'farm_code', farms.farm_code)) as farms
      FROM farmers f
      LEFT JOIN farms ON f.id = farms.farmer_id
      WHERE f.id = $1
      GROUP BY f.id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Farmer not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get farmer error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create farmer (UPDATED - creates both farmer and user account)
export const createFarmer = async (req, res) => {
  try {
    const { name, phone, email, cooperative_name, id_number, password } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }
    
    // Check if email already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }
    
    // Use provided password or default
    const defaultPassword = 'farmer123';
    const finalPassword = password || defaultPassword;
    
    if (finalPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }
    
    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    const farmerCode = await generateFarmerCode();
    
    // Create user account first
    const userResult = await query(
      `INSERT INTO users (name, email, password, role, created_at)
       VALUES ($1, $2, $3, 'farmer', NOW())
       RETURNING id`,
      [name, email.toLowerCase(), hashedPassword]
    );
    
    const createdUserId = userResult.rows[0].id;
    
    // Create farmer linked to user
    const result = await query(
      `INSERT INTO farmers (farmer_code, name, phone, email, cooperative_name, id_number, created_by, user_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [farmerCode, name, phone, email.toLowerCase(), cooperative_name, id_number, userId, createdUserId]
    );
    
    res.status(201).json({ 
      success: true, 
      data: result.rows[0],
      message: `Farmer created successfully! Login email: ${email}, Password: ${finalPassword}`,
      credentials: { email, password: finalPassword }
    });
  } catch (error) {
    console.error('Create farmer error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update farmer
export const updateFarmer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, cooperative_name, id_number } = req.body;
    
    // Get current farmer to get user_id
    const currentFarmer = await query('SELECT user_id FROM farmers WHERE id = $1', [id]);
    const farmerUserId = currentFarmer.rows[0]?.user_id;
    
    const result = await query(
      `UPDATE farmers 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           email = COALESCE($3, email),
           cooperative_name = COALESCE($4, cooperative_name),
           id_number = COALESCE($5, id_number),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, phone, email, cooperative_name, id_number, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Farmer not found' });
    }
    
    // Also update the user table
    if (farmerUserId) {
      await query(
        `UPDATE users SET name = $1, email = $2 WHERE id = $3`,
        [name || result.rows[0].name, email || result.rows[0].email, farmerUserId]
      );
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update farmer error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete farmer
export const deleteFarmer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user_id before deleting farmer
    const farmerResult = await query('SELECT user_id FROM farmers WHERE id = $1', [id]);
    const userId = farmerResult.rows[0]?.user_id;
    
    const result = await query('DELETE FROM farmers WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Farmer not found' });
    }
    
    // Also delete the user account
    if (userId) {
      await query('DELETE FROM users WHERE id = $1', [userId]);
    }
    
    res.json({ success: true, message: 'Farmer deleted successfully' });
  } catch (error) {
    console.error('Delete farmer error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
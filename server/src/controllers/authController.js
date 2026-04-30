import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'coffee_traceability_secret_key_2024';
const JWT_EXPIRES_IN = '7d';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    
    const result = await query(
      `SELECT id, name, email, password, role, organization, is_active FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    
    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Account deactivated. Contact admin.' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    
    await query(`UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [user.id]);
    
    const token = generateToken(user);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, role, organization, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );
    
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
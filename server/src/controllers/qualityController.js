import { query } from '../config/database.js';

export const addQualityAssessment = async (req, res) => {
  try {
    const { lotId } = req.params;
    const {
      assessed_by,
      assessment_date,
      fragrance_aroma,
      flavor,
      aftertaste,
      acidity,
      body,
      uniformity,
      balance,
      clean_cup,
      sweetness,
      overall,
      defects,
      certified_by
    } = req.body;
    
    // Calculate total SCA score
    const totalScore = (
      (fragrance_aroma || 0) +
      (flavor || 0) +
      (aftertaste || 0) +
      (acidity || 0) +
      (body || 0) +
      (uniformity || 0) +
      (balance || 0) +
      (clean_cup || 0) +
      (sweetness || 0) +
      (overall || 0) -
      (defects || 0)
    );
    
    const result = await query(
      `INSERT INTO quality_assessments (
        lot_id, assessed_by, assessment_date,
        fragrance_aroma, flavor, aftertaste, acidity, body,
        uniformity, balance, clean_cup, sweetness, overall, defects,
        total_score, certified_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        lotId, assessed_by, assessment_date,
        fragrance_aroma, flavor, aftertaste, acidity, body,
        uniformity, balance, clean_cup, sweetness, overall, defects,
        totalScore, certified_by
      ]
    );
    
    // Update lot's SCA score
    await query(`UPDATE lots SET sca_score = $1 WHERE id = $2`, [totalScore, lotId]);
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Add quality assessment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getQualityAssessments = async (req, res) => {
  try {
    const { lotId } = req.params;
    
    const result = await query(
      `SELECT * FROM quality_assessments WHERE lot_id = $1 ORDER BY assessment_date DESC`,
      [lotId]
    );
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get quality assessments error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'coffee_traceability_secret_key_2024';

const roleHierarchy = {
  'farmer': 1,
  'coop': 2,
  'exporter': 3,
  'admin': 4,
};

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
};

export const hasRole = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    if (userLevel >= requiredLevel) {
      return next();
    }
    
    return res.status(403).json({ 
      success: false, 
      error: `Access denied. ${requiredRole} role or higher required.` 
    });
  };
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ 
      success: false, 
      error: 'Access denied. You do not have permission for this action.' 
    });
  };
};

export const allowAdmin = hasRole('admin');
export const allowExporter = hasRole('exporter');
export const allowCoop = hasRole('coop');
export const allowFarmer = hasRole('farmer');
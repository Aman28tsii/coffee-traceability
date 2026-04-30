import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { testConnection } from './src/config/database.js';
import authRoutes from './src/routes/auth.js';
import farmerRoutes from './src/routes/farmers.js';
import farmRoutes from './src/routes/farms.js';
import lotRoutes from './src/routes/lots.js';
import traceRoutes from './src/routes/trace.js';
import publicRoutes from './src/routes/public.js';
import shipmentRoutes from './src/routes/shipments.js';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './src/routes/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

console.log('DATABASE_URL from env:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

const startServer = async () => {
  // Test database connection (won't crash Render if no DB yet)
  let dbConnected = false;
  try {
    dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn('⚠️ Database connection failed - running without database');
    } else {
      console.log('✅ Database connected successfully');
    }
  } catch (error) {
    console.warn('⚠️ Database not configured yet - running in demo mode');
    dbConnected = false;
  }
  
  // Rate limiting (less strict for Render)
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 500 : 300,
    message: { success: false, error: 'Too many requests, please slow down.' },
    skipSuccessfulRequests: true,
  });

  // Security middleware with Render compatibility
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false, // Required for Render
  }));
  
  // CORS - allow both local and Render frontend
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    'https://*.onrender.com'
  ].filter(Boolean);
  
  app.use(cors({ 
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200
  }));
  
  app.use(express.json({ limit: '10mb' }));
  app.use(morgan('dev'));
  app.use('/api/', limiter);

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    res.json({ 
      success: true, 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Simple test endpoint
  app.get('/api/test', (req, res) => {
    res.json({ 
      message: 'Coffee Traceability API is working!',
      timestamp: new Date().toISOString()
    });
  });
  
  // Routes (with error handling for missing modules)
  const mountRoute = (path, route, name) => {
    try {
      if (route && typeof route === 'function') {
        app.use(path, route);
        console.log(`✅ ${name} route mounted at ${path}`);
      } else {
        console.warn(`⚠️ ${name} route not available`);
        app.use(path, (req, res) => {
          res.json({ message: `${name} endpoint ready`, available: false });
        });
      }
    } catch (error) {
      console.warn(`⚠️ Failed to mount ${name} route:`, error.message);
      app.use(path, (req, res) => {
        res.json({ message: `${name} endpoint coming soon` });
      });
    }
  };

  // Mount all routes safely
  mountRoute('/api/auth', authRoutes, 'Auth');
  mountRoute('/api/farmers', farmerRoutes, 'Farmers');
  mountRoute('/api/farms', farmRoutes, 'Farms');
  mountRoute('/api/lots', lotRoutes, 'Lots');
  mountRoute('/api/trace', traceRoutes, 'Trace');
  mountRoute('/api/public', publicRoutes, 'Public');
  mountRoute('/api/shipments', shipmentRoutes, 'Shipments');
  mountRoute('/api/users', userRoutes, 'Users');
  
  // Static files for uploads
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ 
      success: false, 
      error: 'Route not found',
      path: req.originalUrl
    });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ 
      success: false, 
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
    });
  });

  // Start server - bind to 0.0.0.0 for Render
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Coffee Traceability Server Started!`);
    console.log(`📡 Local: http://localhost:${PORT}`);
    console.log(`❤️ Health: http://localhost:${PORT}/api/health`);
    console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Database: ${dbConnected ? 'Connected ✅' : 'Demo Mode ⚠️'}`);
  });
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

startServer();
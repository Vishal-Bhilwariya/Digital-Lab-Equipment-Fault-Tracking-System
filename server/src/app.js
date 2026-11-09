import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import labRoutes from './routes/labRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import calibrationRoutes from './routes/calibrationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Enable CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local network testing / mobile lens scanning
      }
    },
    credentials: true
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check endpoint (always available, even without DB) ──────────────────
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';
  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? 'online' : 'degraded',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    service: 'Lab Equipment Calibration & Fault Tracking System API',
    ...(dbState !== 1 && {
      hint: 'Database not connected. Please whitelist your IP in MongoDB Atlas → Security → Network Access.'
    })
  });
});

// ── DB Readiness Guard — return 503 instead of a cryptic crash ─────────────────
const requireDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected. The server is running but cannot reach MongoDB Atlas.',
      hint: 'Go to https://cloud.mongodb.com → Security → Network Access → Add IP Address → Allow Access From Anywhere (0.0.0.0/0). Then restart the server.'
    });
  }
  next();
};

// API Routes (all protected by DB readiness guard)
app.use('/api/v1/auth', requireDB, authRoutes);
app.use('/api/v1/users', requireDB, userRoutes);
app.use('/api/v1/labs', requireDB, labRoutes);
app.use('/api/v1/equipment', requireDB, equipmentRoutes);
app.use('/api/v1/tickets', requireDB, ticketRoutes);
app.use('/api/v1/calibrations', requireDB, calibrationRoutes);
app.use('/api/v1/reports', requireDB, reportRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;


import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
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

// ── Security Headers (Helmet) ──────────────────────────────────────────────
app.use(helmet());

// ── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173' // Vite preview port
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In development, be permissive for local network testing (mobile QR scan)
      if (process.env.NODE_ENV === 'development') return callback(null, true);
      callback(new Error(`CORS: Origin ${origin} is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// ── HTTP Request Logger (Morgan) ──────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Body Parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Global Rate Limiter — prevents DoS on all API routes ─────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,                  // 500 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api/', globalLimiter);

// ── Auth-specific Rate Limiter — brute-force protection on login ──────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // only 20 login attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  message: {
    success: false,
    message: 'Too many login attempts. Your IP has been temporarily blocked. Try again in 15 minutes.'
  }
});

// ── Health check endpoint (always available, even without DB) ──────────────
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';
  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? 'online' : 'degraded',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    service: 'LabTrack Pro — Lab Equipment Calibration & Fault Tracking API',
    version: '1.0.0',
    ...(dbState !== 1 && {
      hint: 'Database not connected. Please whitelist your IP in MongoDB Atlas → Security → Network Access → Add 0.0.0.0/0'
    })
  });
});

// ── DB Readiness Guard — return 503 instead of a cryptic crash ─────────────
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

// ── API Routes ──────────────────────────────────────────────────────────────
// Auth routes get the stricter rate limiter for login
app.use('/api/v1/auth', requireDB, authLimiter, authRoutes);
app.use('/api/v1/users', requireDB, userRoutes);
app.use('/api/v1/labs', requireDB, labRoutes);
app.use('/api/v1/equipment', requireDB, equipmentRoutes);
app.use('/api/v1/tickets', requireDB, ticketRoutes);
app.use('/api/v1/calibrations', requireDB, calibrationRoutes);
app.use('/api/v1/reports', requireDB, reportRoutes);

// ── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;

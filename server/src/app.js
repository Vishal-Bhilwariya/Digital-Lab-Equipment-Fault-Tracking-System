import express from 'express';
import cors from 'cors';

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Lab Equipment Calibration & Fault Tracking System API'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/labs', labRoutes);
app.use('/api/v1/equipment', equipmentRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/calibrations', calibrationRoutes);
app.use('/api/v1/reports', reportRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;

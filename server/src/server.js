import dns from 'dns';
// Set public DNS servers to prevent querySrv ECONNREFUSED issues on local ISP resolvers
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // ignore if restricted
}

import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas (if MONGO_URI is defined)
if (process.env.MONGO_URI) {
  connectDB();
} else {
  console.warn('[Warning] MONGO_URI not found in environment. Please configure .env file.');
}

const server = app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection Error]: ${err.message}`);
  // Do not crash server in dev
});

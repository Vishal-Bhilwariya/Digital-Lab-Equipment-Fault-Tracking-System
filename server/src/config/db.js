import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 s timeout before giving a clear error
    });
    console.log(`\n✅ [MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    // ─── Detect the most common setup mistake: IP not whitelisted in Atlas ──────
    const isIPError =
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('Could not connect to any servers') ||
      error.message.includes('querySrv') ||
      error.message.includes('ETIMEDOUT');

    console.error('\n❌ [MongoDB] Connection failed!');
    console.error(`   Reason : ${error.message}\n`);

    if (isIPError) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('  ⚠️  LIKELY CAUSE: Your IP is NOT whitelisted in MongoDB Atlas');
      console.error('');
      console.error('  FIX (takes ~30 seconds):');
      console.error('  1. Open → https://cloud.mongodb.com/');
      console.error('  2. Go to  Security → Network Access');
      console.error('  3. Click  "+ ADD IP ADDRESS"');
      console.error('  4. Click  "ALLOW ACCESS FROM ANYWHERE" (adds 0.0.0.0/0)');
      console.error('     OR enter your current public IP if you prefer restriction.');
      console.error('  5. Click  Confirm, then restart this server.');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // Do NOT crash the server process — let the Express app still respond
    // so the frontend can at least load. API calls will fail gracefully with 503.
    console.error('[Server] Running WITHOUT database. All /api routes will return 503 until DB connects.\n');
  }
};

export default connectDB;

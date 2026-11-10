import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import User from '../models/User.js';
import Lab from '../models/Lab.js';
import { ROLES, generateLabId } from '../utils/constants.js';

async function syncUsers() {
  console.log('\n[Sync] Connecting to MongoDB Atlas...');
  if (!process.env.MONGO_URI) {
    console.error('[Sync] ❌ MONGO_URI missing in server/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('[Sync] ✅ Connected successfully!\n');

    // 1. Ensure Laboratories exist
    let chemLab = await Lab.findOne({ labName: /Chemistry/i });
    if (!chemLab) {
      chemLab = await Lab.create({
        labId: generateLabId(),
        labName: 'Chemistry Lab 1',
        labBlock: 'Block A',
        isActive: true
      });
      console.log('[Sync] Created Chemistry Lab 1');
    }

    let physicsLab = await Lab.findOne({ labName: /Physics/i });
    if (!physicsLab) {
      physicsLab = await Lab.create({
        labId: generateLabId(),
        labName: 'Physics Lab 2',
        labBlock: 'Block B',
        isActive: true
      });
      console.log('[Sync] Created Physics Lab 2');
    }

    let electronicsLab = await Lab.findOne({ labName: /Electronics/i });
    if (!electronicsLab) {
      electronicsLab = await Lab.create({
        labId: generateLabId(),
        labName: 'Electronics & Circuits Lab',
        labBlock: 'Block C',
        isActive: true
      });
      console.log('[Sync] Created Electronics Lab');
    }

    // 2. Hash default passwords
    const adminHash   = await bcrypt.hash('Admin@123', 12);
    const assistHash  = await bcrypt.hash('Assistant@123', 12);
    const studentHash = await bcrypt.hash('Student@123', 12);

    // 3. Upsert Primary Administrator: mohitkumarsolanki25112005@gmail.com
    const primaryAdmin = await User.findOneAndUpdate(
      { email: 'mohitkumarsolanki25112005@gmail.com' },
      {
        $set: {
          name: 'Mohit Kumar Solanki',
          email: 'mohitkumarsolanki25112005@gmail.com',
          mobile: '9800000001',
          passwordHash: adminHash,
          role: ROLES.ADMIN,
          isActive: true,
          mustChangePassword: false
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`[Sync] ✅ Primary Administrator synced: ${primaryAdmin.email} (Password: Admin@123)`);

    // 4. Also upsert admin@labtrack.edu so both email logins work seamlessly
    const secondaryAdmin = await User.findOneAndUpdate(
      { email: 'admin@labtrack.edu' },
      {
        $set: {
          name: 'System Administrator',
          email: 'admin@labtrack.edu',
          mobile: '9800000000',
          passwordHash: adminHash,
          role: ROLES.ADMIN,
          isActive: true,
          mustChangePassword: false
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`[Sync] ✅ Secondary Administrator synced: ${secondaryAdmin.email} (Password: Admin@123)`);

    // 5. Upsert Assistant: rahul.sharma@labtrack.edu
    const assist1 = await User.findOneAndUpdate(
      { email: 'rahul.sharma@labtrack.edu' },
      {
        $set: {
          name: 'Rahul Sharma',
          email: 'rahul.sharma@labtrack.edu',
          mobile: '9800000002',
          assistantId: 'AST-CH01',
          passwordHash: assistHash,
          role: ROLES.ASSISTANT,
          assignedLabId: chemLab._id,
          isActive: true,
          mustChangePassword: false
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`[Sync] ✅ Assistant synced: ${assist1.email} / ${assist1.assistantId} (Password: Assistant@123)`);

    // 6. Upsert Assistant: priya.verma@labtrack.edu
    const assist2 = await User.findOneAndUpdate(
      { email: 'priya.verma@labtrack.edu' },
      {
        $set: {
          name: 'Priya Verma',
          email: 'priya.verma@labtrack.edu',
          mobile: '9800000003',
          assistantId: 'AST-PH02',
          passwordHash: assistHash,
          role: ROLES.ASSISTANT,
          assignedLabId: physicsLab._id,
          isActive: true,
          mustChangePassword: false
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`[Sync] ✅ Assistant synced: ${assist2.email} / ${assist2.assistantId} (Password: Assistant@123)`);

    // 7. Upsert Assistant: amit.patel@labtrack.edu
    const assist3 = await User.findOneAndUpdate(
      { email: 'amit.patel@labtrack.edu' },
      {
        $set: {
          name: 'Amit Patel',
          email: 'amit.patel@labtrack.edu',
          mobile: '9800000004',
          assistantId: 'AST-EE03',
          passwordHash: assistHash,
          role: ROLES.ASSISTANT,
          assignedLabId: electronicsLab._id,
          isActive: true,
          mustChangePassword: false
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`[Sync] ✅ Assistant synced: ${assist3.email} / ${assist3.assistantId} (Password: Assistant@123)`);

    // 8. Upsert Student: 2200290100018
    const student = await User.findOneAndUpdate(
      { rollNumber: '2200290100018' },
      {
        $set: {
          name: 'Mohit Kumar',
          email: 'mohit.kumar@student.edu',
          rollNumber: '2200290100018',
          passwordHash: studentHash,
          role: ROLES.STUDENT,
          isActive: true,
          mustChangePassword: false
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`[Sync] ✅ Student synced: Roll ${student.rollNumber} / ${student.email} (Password: Student@123)`);

    console.log('\n======================================================');
    console.log('✅ ALL USERS SYNCED AND READY FOR LOGIN!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n[Sync] ❌ Database Sync Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

syncUsers();

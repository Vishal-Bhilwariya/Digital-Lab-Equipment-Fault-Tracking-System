import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Lab from '../models/Lab.js';
import Equipment from '../models/Equipment.js';
import Ticket from '../models/Ticket.js';
import CalibrationLog from '../models/CalibrationLog.js';
import { ROLES, OPERATIONAL_STATUS, generateLabId, generatePublicId } from './constants.js';

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('[Seeder] Error: MONGO_URI is missing in server/.env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seeder] Connected to MongoDB Atlas...');

    // Clear existing records
    await Promise.all([
      User.deleteMany({}),
      Lab.deleteMany({}),
      Equipment.deleteMany({}),
      Ticket.deleteMany({}),
      CalibrationLog.deleteMany({})
    ]);
    console.log('[Seeder] Cleared previous records...');

    // 1. Create Laboratories
    const chemLab = await Lab.create({
      labId: generateLabId(),
      labName: 'Chemistry Lab 1',
      labBlock: 'Block A'
    });

    const physicsLab = await Lab.create({
      labId: generateLabId(),
      labName: 'Physics Lab 2',
      labBlock: 'Block B'
    });
    console.log(`[Seeder] Created Labs: ${chemLab.labName} (${chemLab.labId}), ${physicsLab.labName} (${physicsLab.labId})`);

    // 2. Hash Password
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const assistantPasswordHash = await bcrypt.hash('Assistant@123', 10);

    // 3. Create Administrator
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@univ.edu',
      mobile: '9876543210',
      passwordHash: adminPasswordHash,
      role: ROLES.ADMIN,
      isActive: true
    });
    console.log(`[Seeder] Created Admin: ${admin.email}`);

    // 4. Create Lab Assistant assigned to Chemistry Lab 1
    const assistant = await User.create({
      name: 'Rahul Sharma',
      email: 'assistant.chem@univ.edu',
      mobile: '9876543211',
      passwordHash: assistantPasswordHash,
      role: ROLES.ASSISTANT,
      assignedLabId: chemLab._id,
      isActive: true
    });
    console.log(`[Seeder] Created Assistant: ${assistant.email} assigned to ${chemLab.labName}`);

    // 5. Create Sample Equipment in Chemistry Lab 1
    const dso = await Equipment.create({
      publicId: generatePublicId(),
      labId: chemLab._id,
      name: 'Digital Storage Oscilloscope 100MHz',
      serialNumber: 'DSO-TEK-2024-001',
      model: 'Tektronix TBS1102B',
      location: 'Bench 04, Room 102',
      operationalStatus: OPERATIONAL_STATUS.READY_TO_USE,
      damageCount: 0,
      calibrationIntervalDays: 180,
      lastCalibrationDate: new Date(),
      nextCalibrationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // Due in 60 days
    });

    const multimeter = await Equipment.create({
      publicId: generatePublicId(),
      labId: chemLab._id,
      name: 'Precision Digital Multimeter',
      serialNumber: 'DMM-FLUKE-099',
      model: 'Fluke 179',
      location: 'Bench 02, Room 102',
      operationalStatus: OPERATIONAL_STATUS.READY_TO_USE,
      damageCount: 1,
      calibrationIntervalDays: 90,
      lastCalibrationDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      nextCalibrationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // Overdue by 10 days
    });

    console.log(`[Seeder] Seeded Equipment: ${dso.name} (Public ID: ${dso.publicId}), ${multimeter.name}`);
    console.log('[Seeder] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();

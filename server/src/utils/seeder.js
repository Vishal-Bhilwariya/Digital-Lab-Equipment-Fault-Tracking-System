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
import {
  ROLES,
  OPERATIONAL_STATUS,
  TICKET_STATUS,
  generateLabId,
  generatePublicId,
  generateTicketId
} from './constants.js';

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('[Seeder] ❌ MONGO_URI is missing in server/.env');
      console.error('[Seeder]    Copy server/.env.example to server/.env and fill in your Atlas URI');
      process.exit(1);
    }

    console.log('\n[Seeder] Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('[Seeder] ✅ Connected\n');

    // ── Clear all collections ───────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Lab.deleteMany({}),
      Equipment.deleteMany({}),
      Ticket.deleteMany({}),
      CalibrationLog.deleteMany({})
    ]);
    console.log('[Seeder] Cleared all existing records');

    // ── 1. Create Laboratories ──────────────────────────────────────────────
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

    const electronicsLab = await Lab.create({
      labId: generateLabId(),
      labName: 'Electronics & Circuits Lab',
      labBlock: 'Block C'
    });

    console.log(`[Seeder] Created Labs: ${chemLab.labName} | ${physicsLab.labName} | ${electronicsLab.labName}`);

    // ── 2. Hash Passwords ───────────────────────────────────────────────────
    const adminHash    = await bcrypt.hash('Admin@123', 12);
    const assistHash1  = await bcrypt.hash('Assistant@123', 12);
    const assistHash2  = await bcrypt.hash('Assistant@123', 12);
    const assistHash3  = await bcrypt.hash('Assistant@123', 12);
    const studentHash  = await bcrypt.hash('Student@123', 12);

    // ── 3. Create System Administrator ─────────────────────────────────────
    const admin = await User.create({
      name: 'Mohit Kumar Solanki',
      email: 'mohitkumarsolanki25112005@gmail.com',
      mobile: '9800000001',
      passwordHash: adminHash,
      role: ROLES.ADMIN,
      isActive: true
    });
    console.log(`[Seeder] Created Primary Admin: ${admin.email}`);

    // Also keep secondary admin for backward compatibility
    await User.create({
      name: 'System Administrator',
      email: 'admin@labtrack.edu',
      mobile: '9800000000',
      passwordHash: adminHash,
      role: ROLES.ADMIN,
      isActive: true
    });
    console.log('[Seeder] Created Secondary Admin: admin@labtrack.edu');

    // ── 4. Create Lab Assistants ────────────────────────────────────────────
    const assistant1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul.sharma@labtrack.edu',
      mobile: '9800000002',
      assistantId: 'AST-CH01',
      passwordHash: assistHash1,
      role: ROLES.ASSISTANT,
      assignedLabId: chemLab._id,
      isActive: true
    });

    const assistant2 = await User.create({
      name: 'Priya Verma',
      email: 'priya.verma@labtrack.edu',
      mobile: '9800000003',
      assistantId: 'AST-PH02',
      passwordHash: assistHash2,
      role: ROLES.ASSISTANT,
      assignedLabId: physicsLab._id,
      isActive: true
    });

    const assistant3 = await User.create({
      name: 'Amit Gupta',
      email: 'amit.gupta@labtrack.edu',
      mobile: '9800000004',
      assistantId: 'AST-EL03',
      passwordHash: assistHash3,
      role: ROLES.ASSISTANT,
      assignedLabId: electronicsLab._id,
      isActive: true
    });

    console.log(`[Seeder] Created Assistants: ${assistant1.email}, ${assistant2.email}, ${assistant3.email}`);

    // ── 4.1 Create Sample Student ───────────────────────────────────────────
    const student1 = await User.create({
      name: 'Vishal Bhilwariya',
      email: 'vishal@student.gla.ac.in',
      mobile: '9876543210',
      rollNumber: '2200290100018',
      role: ROLES.STUDENT,
      passwordHash: studentHash,
      isActive: true
    });
    console.log(`[Seeder] Created Student: ${student1.name} (${student1.rollNumber})`);

    // ── 5. Create Equipment in Chemistry Lab 1 ──────────────────────────────
    const dso = await Equipment.create({
      publicId: generatePublicId(),
      labId: chemLab._id,
      name: 'Digital Storage Oscilloscope 100MHz',
      serialNumber: 'DSO-TEK-2024-001',
      model: 'Tektronix TBS1102B',
      location: 'Bench 04, Room 102',
      additionDate: new Date(),
      operationalStatus: OPERATIONAL_STATUS.READY_TO_USE,
      damageCount: 0,
      calibrationIntervalDays: 180,
      lastCalibrationDate: new Date(),
      nextCalibrationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)  // due in 60 days
    });

    const multimeter = await Equipment.create({
      publicId: generatePublicId(),
      labId: chemLab._id,
      name: 'Precision Digital Multimeter',
      serialNumber: 'DMM-FLUKE-2024-099',
      model: 'Fluke 179',
      location: 'Bench 02, Room 102',
      additionDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      operationalStatus: OPERATIONAL_STATUS.DAMAGED,
      damageCount: 2,
      calibrationIntervalDays: 90,
      lastCalibrationDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      nextCalibrationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)  // overdue by 10 days
    });

    const pHMeter = await Equipment.create({
      publicId: generatePublicId(),
      labId: chemLab._id,
      name: 'Benchtop pH Meter',
      serialNumber: 'PHM-HANNA-2023-07',
      model: 'Hanna HI2210',
      location: 'Wet Lab Counter A, Room 103',
      additionDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
      operationalStatus: OPERATIONAL_STATUS.UNDER_REPAIR,
      damageCount: 1,
      calibrationIntervalDays: 60,
      lastCalibrationDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
      nextCalibrationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)   // overdue by 5 days
    });

    // Optional Non-Calibrated Equipment test record
    const workbenchStool = await Equipment.create({
      publicId: generatePublicId(),
      labId: chemLab._id,
      name: 'Anti-Static Lab Workstation & Bench',
      serialNumber: 'STN-CHEM-004',
      model: 'ESD Safe Workstation',
      location: 'Bench Row 3, Room 102',
      additionDate: new Date(),
      operationalStatus: OPERATIONAL_STATUS.READY_TO_USE,
      damageCount: 0,
      calibrationIntervalDays: null,
      lastCalibrationDate: null,
      nextCalibrationDate: null
    });

    // ── 6. Create Equipment in Physics Lab 2 ───────────────────────────────
    const sonometer = await Equipment.create({
      publicId: generatePublicId(),
      labId: physicsLab._id,
      name: 'Sonometer',
      serialNumber: 'SONO-PHYS-2022-003',
      model: 'Generic Wooden Sonometer',
      location: 'Lab Rack 1, Room 201',
      additionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      operationalStatus: OPERATIONAL_STATUS.READY_TO_USE,
      damageCount: 0,
      calibrationIntervalDays: 365,
      lastCalibrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextCalibrationDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000)
    });

    const laserKit = await Equipment.create({
      publicId: generatePublicId(),
      labId: physicsLab._id,
      name: 'Diode Laser Optics Kit',
      serialNumber: 'LASER-OPT-2024-011',
      model: 'Thorlabs CPS532',
      location: 'Optical Bench, Room 203',
      additionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      operationalStatus: OPERATIONAL_STATUS.READY_TO_USE,
      damageCount: 0,
      calibrationIntervalDays: 180,
      lastCalibrationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      nextCalibrationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    });

    // ── 7. Create Equipment in Electronics Lab ──────────────────────────────
    const funcGen = await Equipment.create({
      publicId: generatePublicId(),
      labId: electronicsLab._id,
      name: 'Function / Signal Generator',
      serialNumber: 'FG-RIGS-2023-004',
      model: 'Rigol DG1022Z',
      location: 'Bench 01, Room 301',
      additionDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
      operationalStatus: OPERATIONAL_STATUS.READY_TO_USE,
      damageCount: 0,
      calibrationIntervalDays: 365,
      lastCalibrationDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
      nextCalibrationDate: new Date(Date.now() + 165 * 24 * 60 * 60 * 1000)
    });

    console.log(`[Seeder] Seeded equipment records across 3 labs (including non-calibrated hardware)`);

    // ── 8. Create Sample Fault Tickets ──────────────────────────────────────
    const ticket1 = await Ticket.create({
      ticketId: generateTicketId(),
      equipmentId: multimeter._id,
      labId: chemLab._id,
      studentId: student1._id,
      studentName: student1.name,
      rollNumber: student1.rollNumber,
      mobile: student1.mobile,
      email: student1.email,
      description: 'Display is flickering and readings are inconsistent. LCD shows garbled characters when measuring AC voltage above 200V.',
      photoUrl: 'https://via.placeholder.com/640x480.png?text=Multimeter+Display+Fault',
      ticketStatus: TICKET_STATUS.UNDER_REVIEW
    });

    const ticket2 = await Ticket.create({
      ticketId: generateTicketId(),
      equipmentId: pHMeter._id,
      labId: chemLab._id,
      studentName: 'Mohit Kumar',
      rollNumber: '2200290100019',
      mobile: '9876543211',
      email: 'mohit@student.gla.ac.in',
      description: 'pH probe is not calibrating. The machine gives error code E-02 and fails two-point buffer calibration.',
      photoUrl: 'https://via.placeholder.com/640x480.png?text=pH+Meter+Error',
      ticketStatus: TICKET_STATUS.IN_REPAIR
    });

    console.log(`[Seeder] Created sample fault tickets`);

    // ── 9. Create Sample Calibration Logs ──────────────────────────────────
    await CalibrationLog.create({
      equipmentId: dso._id,
      labId: chemLab._id,
      calibratedBy: 'National Instruments Calibration Services',
      calibrationDate: new Date(),
      nextDueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      remarks: 'All channels within tolerance. Bandwidth verified at 100MHz.'
    });

    await CalibrationLog.create({
      equipmentId: laserKit._id,
      labId: physicsLab._id,
      calibratedBy: 'Thorlabs Service Center Delhi',
      calibrationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      nextDueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      remarks: 'Power output 4.9mW (spec 5mW ± 10%). Beam alignment verified. Certificate issued.'
    });

    console.log('[Seeder] Created sample calibration history records\n');

    // ── Summary ─────────────────────────────────────────────────────────────
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  ✅  DATABASE SEEDING COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('  Login Credentials:');
    console.log('  ──────────────────');
    console.log('  👑 Admin');
    console.log('     Email:    admin@labtrack.edu');
    console.log('     Password: Admin@123');
    console.log('');
    console.log('  🔧 Lab Assistant (Chemistry Lab 1)');
    console.log('     ID:       AST-CH01');
    console.log('     Email:    rahul.sharma@labtrack.edu');
    console.log('     Password: Assistant@123');
    console.log('');
    console.log('  🎓 Student Account');
    console.log('     Roll No:  2200290100018');
    console.log('     Email:    vishal@student.gla.ac.in');
    console.log('     Password: Student@123');
    console.log('');
    console.log(`  QR Public IDs:  ${dso.publicId}  |  ${multimeter.publicId}`);
    console.log('');
    console.log('  Open: http://localhost:5173');
    console.log('═══════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error(`\n[Seeder] ❌ Error: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();

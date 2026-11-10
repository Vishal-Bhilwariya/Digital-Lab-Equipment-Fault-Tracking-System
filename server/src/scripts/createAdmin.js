import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import User from '../models/User.js';
import { ROLES } from '../utils/constants.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function run() {
  console.log('\n======================================================');
  console.log('   CREATE NEW ADMINISTRATOR (BACKEND DIRECT SCRIPT)   ');
  console.log('======================================================\n');

  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is missing in server/.env');
    process.exit(1);
  }

  // Check command line arguments first: node createAdmin.js <name> <email> <mobile> <password>
  const args = process.argv.slice(2);
  let name = args[0];
  let email = args[1];
  let mobile = args[2];
  let password = args[3];

  if (!name) name = await askQuestion('Enter Full Name: ');
  if (!email) email = await askQuestion('Enter Email Address: ');
  if (!mobile) mobile = await askQuestion('Enter 10-digit Mobile Number: ');
  if (!password) password = await askQuestion('Enter Password: ');

  rl.close();

  name = name.trim();
  email = email.trim().toLowerCase();
  mobile = mobile.trim();
  password = password.trim();

  if (!name || !email || !password) {
    console.error('\n❌ Error: Name, Email, and Password are required.');
    process.exit(1);
  }

  try {
    console.log('\nConnecting to database...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role === ROLES.ADMIN) {
        console.log(`\n⚠️  An Administrator with email "${email}" already exists.`);
        const updatePwd = await askQuestion ? 'n' : 'n';
      } else {
        console.log(`\n⚠️  A user with email "${email}" already exists with role: "${existingUser.role}".`);
      }
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newAdmin = await User.create({
      name,
      email,
      mobile: mobile || undefined,
      passwordHash,
      role: ROLES.ADMIN,
      isActive: true,
      mustChangePassword: false
    });

    console.log('\n✅ SUCCESS: Administrator account created successfully!');
    console.log('------------------------------------------------------');
    console.log(` Name:     ${newAdmin.name}`);
    console.log(` Email:    ${newAdmin.email}`);
    console.log(` Role:     ${newAdmin.role}`);
    console.log(` Password: [HIDDEN] (Hashed securely with bcrypt)`);
    console.log('------------------------------------------------------');
    console.log('You can now log in at http://localhost:5173/login\n');

  } catch (err) {
    console.error('\n❌ Failed to create administrator:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();

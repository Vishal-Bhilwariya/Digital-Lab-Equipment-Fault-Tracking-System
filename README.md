<div align="center">

# 🔬 LabTrack Pro
### *Digital Lab Equipment Calibration & Fault Tracking System*

<br/>

[![GLA University](https://img.shields.io/badge/GLA%20University-B.Tech%20Major%20Project-0a2342?style=for-the-badge&logoColor=white)](https://www.gla.ac.in/)
[![Session](https://img.shields.io/badge/Session-2025--26-22d3ee?style=for-the-badge)](.)
[![Group](https://img.shields.io/badge/Group-G137-2563eb?style=for-the-badge)](.)
[![Department](https://img.shields.io/badge/Dept-CSE-6366f1?style=for-the-badge)](.)

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20Storage-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square)](LICENSE)

<br/>

> **A centralized, full-stack MERN web application** that modernizes university laboratory management — digitizing instrument inventory, generating scannable QR code labels, enabling student fault reporting with damage photo uploads, and maintaining calibration schedules with priority-sorted workflows.

</div>

---

## 📋 Table of Contents

- [🌟 Why LabTrack Pro?](#-why-labtrack-pro)
- [🎯 Project Overview](#-project-overview)
- [🏗️ System Architecture](#️-system-architecture)
- [✨ Core Features](#-core-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Project Structure](#-project-structure)
- [⚙️ How It Works — End-to-End Flow](#️-how-it-works--end-to-end-flow)
- [🔐 Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [🚀 Getting Started](#-getting-started)
- [🗄️ Database Schema](#️-database-schema)
- [🌐 API Reference](#-api-reference)
- [🔑 Environment Variables](#-environment-variables)
- [🧪 Testing Results](#-testing-results)
- [🛠 Troubleshooting](#-troubleshooting)
- [👥 Team G137](#-team-g137)
- [🎓 Academic Details](#-academic-details)

---

## 🌟 Why LabTrack Pro?

University science and engineering laboratories struggle with **manual, paper-based** processes that are error-prone, slow, and impossible to audit:

| ❌ Old Way (Paper-Based)              | ✅ LabTrack Pro                                        |
|--------------------------------------|-------------------------------------------------------|
| Hand-written fault registers         | Digital fault tickets with photo evidence             |
| Lost or illegible maintenance logs   | Immutable, timestamped calibration history            |
| No visibility on overdue calibrations| Priority-sorted schedule: Overdue → Due Today → Upcoming |
| Students call/visit lab to report    | Instant fault report via QR scan from any phone      |
| Instrument identity only by memory   | Unique QR label printed on every instrument           |
| Repair status unknown to students    | Real-time ticket tracking: Open → Under Review → In Repair → Resolved |
| No damage trend analysis             | Auto-incrementing `damageCount` per instrument        |

---

## 🎯 Project Overview

**LabTrack Pro** is a **B.Tech Major Project** built for **GLA University, Mathura (U.P.)** (Department of Computer Science & Engineering) for the academic session 2025–26 by Group **G137**.

The system serves **three distinct user roles**:

```
┌─────────────────────────────────────────────────────────────────┐
│                        LabTrack Pro                             │
├──────────────┬───────────────────────┬──────────────────────────┤
│  👑 Admin    │  🔧 Lab Assistant     │  🎓 Student (Public)     │
├──────────────┼───────────────────────┼──────────────────────────┤
│ Manage Labs  │ Manage Equipment      │ Scan QR Code             │
│ Manage Staff │ Generate QR Labels    │ View Instrument Info     │
│ View Reports │ Log Calibrations      │ Submit Fault Tickets     │
│ System-wide  │ Manage Fault Tickets  │ Track Ticket Status      │
│ Analytics    │ Lab-isolated Access   │ No login required        │
└──────────────┴───────────────────────┴──────────────────────────┘
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER                                │
│          React 18 + Vite + Tailwind CSS + Lucide Icons                  │
│    ┌──────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────────┐    │
│    │ HomePage │ │ Admin Portal │ │   Assistant  │ │  Public QR    │    │
│    │ /        │ │ /admin/*     │ │  /assistant/*│ │  /e/:publicId │    │
│    └────┬─────┘ └──────┬───────┘ └──────┬───────┘ └───────┬───────┘    │
│         └──────────────┴────────────────┴─────────────────┘             │
│                              Axios (HTTP + Vite Proxy)                   │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │ REST API  /api/v1/*
┌──────────────────────────────────▼──────────────────────────────────────┐
│                      EXPRESS.JS BACKEND  (Port 5000)                    │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Auth       │  │ RBAC         │  │ Lab          │  │ Email        │  │
│  │ Middleware │  │ Middleware   │  │ Isolation    │  │ Notifications│  │
│  └────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        ROUTERS & CONTROLLERS                    │    │
│  │  /auth  │  /users  │  /labs  │  /equipment  │  /tickets  │     │    │
│  │                    /calibrations  │  /reports               │    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │  QR Service  │  │ Upload Svc   │  │ Email Svc    │                   │
│  │  qrcode pkg  │  │ Cloudinary   │  │ Nodemailer   │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │  Mongoose ODM
┌──────────────────────────────────▼──────────────────────────────────────┐
│                       MONGODB ATLAS (Cloud Database)                    │
│  Users │ Labs │ Equipment │ Tickets │ CalibrationLogs                   │
└─────────────────────────────────────────────────────────────────────────┘
                   │                                │
         ┌─────────▼──────────┐          ┌──────────▼──────────┐
         │   CLOUDINARY CDN   │          │   SMTP Mail Server  │
         │  (Damage Photos)   │          │  (Ticket Alerts)    │
         └────────────────────┘          └─────────────────────┘
```

---

## ✨ Core Features

### 🏷️ 1. QR Code Label Generation
- Every instrument gets a **unique `publicId`** (e.g., `EQ-7A3F2`)
- Lab Assistants generate and **download printable QR labels** directly from the dashboard
- Students scan with **Google Lens / phone camera** → instantly see instrument details and report faults — **no login needed**

### 📸 2. Student Fault Reporting (Public)
- Zero-friction fault submission — just scan the QR code
- Supports **photo upload** (damage evidence) stored on Cloudinary CDN
- Auto-increments the instrument's **damage count** (never resets — full audit history)
- Ticket lifecycle: `Open → Under Review → In Repair → Resolved`

### 📅 3. Calibration Schedule Management
- Assistants log calibration events with an **immutable history** (every entry is permanent)
- Schedule auto-sorts by urgency:
  1. 🔴 **Overdue** (past due date)
  2. 🟡 **Due Today**
  3. 🟢 **Upcoming** (ascending by days remaining)
- Calibration status badge: `Valid` / `Due Soon` / `Overdue` — **independent** of operational status

### 📊 4. Admin Analytics & Reports
- System-wide overview: total labs, total equipment, open tickets, overdue calibrations
- Per-lab breakdowns and instrument damage trend data
- Exportable reports for department records

### 🔐 5. Secure Role-Based Access Control (RBAC)
- JWT-based authentication with httpOnly-ready tokens
- Three roles: **Admin**, **Lab Assistant**, **Student (unauthenticated public)**
- Lab Isolation: Assistants can **only** see and manage their assigned lab's data

### 📧 6. Email Notifications
- Nodemailer integration for ticket status change alerts
- Configurable SMTP (works with Gmail, Outlook, institutional mail servers)

### 📱 7. Fully Responsive Dark UI
- Midnight Navy glassmorphism theme (`#080F20` base, Cyan `#22d3ee` / Blue `#2563eb` accents)
- Mobile-first design — optimized for student QR scan experience on phones
- Smooth micro-animations and hover transitions throughout

---

## 🛠️ Technology Stack

### Frontend
| Technology       | Version | Purpose                                     |
|-----------------|---------|---------------------------------------------|
| **React**        | 18.x   | Component-based UI framework                 |
| **Vite**         | 5.x    | Lightning-fast dev server & build tool        |
| **Tailwind CSS** | 3.x    | Utility-first styling                         |
| **React Router** | 6.x    | Client-side routing & protected routes        |
| **Axios**        | 1.x    | HTTP client with interceptors                 |
| **Lucide React** | latest | Consistent icon library                       |
| **Context API**  | —      | Global auth state management                  |

### Backend
| Technology       | Version | Purpose                                     |
|-----------------|---------|---------------------------------------------|
| **Node.js**      | 20.x+  | JavaScript runtime                           |
| **Express.js**   | 4.x    | Web application framework                    |
| **Mongoose**     | 8.x    | MongoDB ODM with schema validation           |
| **JSON Web Token** | 9.x | Stateless authentication tokens             |
| **bcryptjs**     | 2.x    | Password hashing (10 salt rounds)            |
| **Multer**       | 1.x    | Multipart form data / file uploads           |
| **qrcode**       | 1.x    | Server-side QR code PNG generation           |
| **Nodemailer**   | 6.x    | Transactional email delivery                 |
| **Cloudinary**   | SDK    | Cloud-based media storage & delivery         |
| **dotenv**       | 16.x   | Environment variable management              |

### Database & Infrastructure
| Service           | Purpose                                     |
|------------------|---------------------------------------------|
| **MongoDB Atlas** | Cloud-hosted NoSQL database                  |
| **Cloudinary**    | CDN for damage photo uploads                 |
| **Google DNS**    | Reliable SRV record resolution for Atlas     |

---

## 📁 Project Structure

```
Digital-Lab-Equipment-Fault-Tracking-System/
│
├── 📂 client/                          # React Frontend (Vite)
│   ├── 📂 public/
│   └── 📂 src/
│       ├── 📂 context/
│       │   └── AuthContext.jsx         # Global auth state
│       ├── 📂 layouts/
│       │   └── DashboardLayout.jsx     # Sidebar + top nav
│       ├── 📂 pages/
│       │   ├── 📂 admin/
│       │   │   ├── AdminDashboard.jsx  # System analytics
│       │   │   ├── ManageLabs.jsx      # CRUD labs
│       │   │   ├── ManageAssistants.jsx# CRUD staff accounts
│       │   │   └── AdminReports.jsx    # Reports & exports
│       │   ├── 📂 assistant/
│       │   │   ├── AssistantDashboard.jsx
│       │   │   ├── EquipmentManagement.jsx # QR + inventory
│       │   │   ├── CalibrationSchedule.jsx # Priority schedule
│       │   │   └── TicketQueue.jsx     # Fault ticket workflow
│       │   ├── 📂 auth/
│       │   │   └── LoginPage.jsx       # Staff sign-in
│       │   ├── 📂 public/
│       │   │   ├── EquipmentPublicView.jsx # QR landing page
│       │   │   ├── RaiseTicketPage.jsx     # Student fault form
│       │   │   └── TrackTicketPage.jsx     # Ticket status tracker
│       │   └── HomePage.jsx            # Landing page
│       ├── 📂 styles/
│       │   └── LandingPage.css         # Custom animations
│       └── 📂 utils/
│           └── statusBadges.jsx        # Shared status badge components
│
├── 📂 server/                          # Node.js + Express Backend
│   ├── 📂 src/
│   │   ├── 📂 config/
│   │   │   └── db.js                   # MongoDB connection + IP-whitelist error guide
│   │   ├── 📂 models/
│   │   │   ├── User.js
│   │   │   ├── Lab.js
│   │   │   ├── Equipment.js
│   │   │   ├── Ticket.js
│   │   │   └── CalibrationLog.js
│   │   ├── 📂 middleware/
│   │   │   ├── auth.js                 # JWT verification
│   │   │   └── labIsolation.js         # Lab-scoped access control
│   │   ├── 📂 routes/
│   │   ├── 📂 controllers/
│   │   ├── 📂 services/
│   │   │   ├── qrService.js
│   │   │   ├── uploadService.js        # Cloudinary uploader
│   │   │   └── emailService.js         # Nodemailer dispatcher
│   │   ├── 📂 utils/
│   │   │   └── seeder.js               # DB seed script
│   │   ├── app.js                      # Express app + DB readiness guard
│   │   └── server.js                   # Entry point + MongoDB connect
│   ├── .env                            # Your local secrets (git-ignored)
│   └── .env.example                    # Template to copy from
│
├── 📂 docs/
│   ├── schema-blueprint.md
│   ├── api-endpoints.md
│   └── rbac-matrix.md
│
├── .gitignore
└── README.md
```

---

## ⚙️ How It Works — End-to-End Flow

### 🔵 Flow 1: Instrument Registration & QR Label
```
Admin creates Lab  →  Admin assigns Lab Assistant
         ↓
Lab Assistant adds Equipment (name, model, serial, purchase date)
         ↓
System assigns unique publicId (e.g. EQ-7A3F2)
         ↓
Assistant clicks "Generate QR"  →  Server renders QR PNG
         ↓
Assistant downloads & prints QR label → Sticks on physical instrument
```

### 🔴 Flow 2: Student Fault Reporting
```
Student spots damaged instrument
         ↓
Scans QR code with phone camera / Google Lens
         ↓
Opens /equipment/EQ-7A3F2  →  sees instrument details & current status
         ↓
Clicks "Report a Fault"  →  Fills fault form + uploads damage photo + enters Roll Number
         ↓
Server: validates → uploads photo to Cloudinary → creates Ticket
        → increments equipment.damageCount by 1
         ↓
Ticket status: OPEN  (visible to Lab Assistant in Ticket Queue)
         ↓
Assistant reviews → moves to UNDER REVIEW → IN REPAIR → RESOLVED
         ↓
Student tracks progress at /track-ticket using Ticket ID + Roll Number
```

### 🟡 Flow 3: Calibration Management
```
Assistant views Calibration Schedule (sorted by urgency)
         ↓
Selects overdue instrument → clicks "Log Calibration"
         ↓
Enters calibration date + next due date + technician notes
         ↓
Server: appends immutable record to CalibrationLogs
        → updates equipment.lastCalibrated + nextCalibrationDate
        → recalculates calibrationStatus badge
         ↓
Schedule re-renders with updated priority order
```

---

## 🔐 Role-Based Access Control (RBAC)

| Permission                     | 👑 Admin | 🔧 Assistant | 🎓 Student |
|-------------------------------|:-------:|:----------:|:--------:|
| View system-wide analytics     |   ✅   |     ❌     |    ❌    |
| Create / deactivate Labs       |   ✅   |     ❌     |    ❌    |
| Create / deactivate Assistants |   ✅   |     ❌     |    ❌    |
| View all Labs & Equipment      |   ✅   |  Own Lab  |    ❌    |
| Add / edit Equipment           |   ❌   |     ✅     |    ❌    |
| Generate & download QR codes   |   ❌   |     ✅     |    ❌    |
| Log Calibrations               |   ❌   |     ✅     |    ❌    |
| Manage Fault Tickets           |   ❌   |     ✅     |    ❌    |
| View Instrument Public Page    |   ✅   |     ✅     |    ✅   |
| Submit Fault Ticket            |   ✅   |     ✅     |    ✅   |
| Track Ticket Status            |   ✅   |     ✅     |    ✅   |

> **Lab Isolation**: Lab Assistants can ONLY access data belonging to their assigned lab. Cross-lab access is blocked at the middleware level.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and **npm** v9+
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (M0 free tier is sufficient)
- A free [Cloudinary](https://cloudinary.com/) account (for damage photo storage)
- Git

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Vishal-Bhilwariya/Digital-Lab-Equipment-Fault-Tracking-System.git
cd Digital-Lab-Equipment-Fault-Tracking-System
```

---

### Step 2 — Configure Backend Environment

```bash
cd server
copy .env.example .env
```

Open `server/.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas (replace with your cluster URI)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/labtrack?retryWrites=true&w=majority

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (optional — Gmail App Password recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=no-reply@labtrack.edu

# Frontend URL for CORS
CLIENT_URL=http://localhost:5173
```

---

### ⚠️ Step 2.5 — Whitelist Your IP in MongoDB Atlas (CRITICAL)

> This is the **most common cause** of connection failure during testing.
> MongoDB Atlas blocks all connections by default until you explicitly allow your IP.

**Do this once — takes 30 seconds:**

1. Go to **[https://cloud.mongodb.com/](https://cloud.mongodb.com/)** and log in
2. Select your project → click **"Network Access"** in the left sidebar (under Security)
3. Click the green **"+ ADD IP ADDRESS"** button
4. Click **"ALLOW ACCESS FROM ANYWHERE"** → this adds `0.0.0.0/0`
5. Click **Confirm**

> If you prefer to restrict access, click **"ADD CURRENT IP ADDRESS"** instead — but you'll need to repeat this step every time your public IP changes (e.g., when switching WiFi networks).

---

### Step 3 — Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

### Step 4 — Seed the Database

```bash
cd server
npm run seed
```

This creates:
- 👑 **Admin**: `admin@univ.edu` / `Admin@123`
- 🔧 **Lab Assistant**: `assistant.chem@univ.edu` / `Assistant@123`
- 🏛️ **Labs**: Chemistry Lab 1, Physics Lab 2
- 🔬 **Sample Equipment**: Pre-loaded instruments with statuses

---

### Step 5 — Run the Application

**Terminal 1 — Start Backend:**
```bash
cd server
npm run dev
# ✅ Server running on http://localhost:5000
# ✅ [MongoDB] Connected: cluster0.xxxxx.mongodb.net
```

**Terminal 2 — Start Frontend:**
```bash
cd client
npm run dev
# ✅ App running on http://localhost:5173
```

---

### Step 6 — Open in Browser

```
http://localhost:5173
```

> 💡 The Vite dev server proxies all `/api/v1/*` requests to `http://localhost:5000` automatically — no manual CORS configuration needed during development.

---

## 🗄️ Database Schema

### Equipment (Core Collection)
```js
{
  name: String,                 // "Digital Oscilloscope"
  model: String,                // "DSO1052E"
  serialNumber: String,         // unique
  publicId: String,             // "EQ-7A3F2" — used in QR URLs
  lab: ObjectId → Lab,

  // ── Status 1: Operational ──────────────────────────────────
  operationalStatus: enum['Ready to Use', 'Under Repair', 'Damaged'],

  // ── Status 2: Calibration ──────────────────────────────────
  calibrationStatus: enum['Valid', 'Due Soon', 'Overdue'],
  lastCalibrated: Date,
  nextCalibrationDate: Date,

  // ── Damage Tracking ───────────────────────────────────────
  damageCount: Number,          // starts 0, never resets, only increments

  isActive: Boolean,            // soft delete — never use deleteOne()
  createdAt, updatedAt: Date
}
```

### Ticket (Fault Report)
```js
{
  ticketId: String,             // "TKT-20261107-A9B2" — human-readable reference
  equipment: ObjectId → Equipment,
  lab: ObjectId → Lab,

  studentName: String,          // reporter's name
  rollNumber: String,           // student roll number (used for ticket tracking)
  mobile: String,
  email: String,
  faultDescription: String,
  damagePhotoUrl: String,       // Cloudinary CDN URL

  // ── Status 3: Ticket Lifecycle ────────────────────────────
  status: enum['Open', 'Under Review', 'In Repair', 'Resolved'],

  resolvedAt: Date,
  resolutionNotes: String,
  assignedTo: ObjectId → User,

  createdAt, updatedAt: Date    // immutable history — never deleted
}
```

> ⚠️ **Three statuses are always independent**: Operational Status, Calibration Status, and Ticket Status are **never merged** into a single field.

---

## 🌐 API Reference

| Method | Endpoint                              | Auth     | Description                       |
|--------|---------------------------------------|----------|-----------------------------------|
| GET    | `/api/health`                         | Public   | Server + DB status check           |
| POST   | `/api/v1/auth/login`                  | Public   | Staff login → returns JWT          |
| GET    | `/api/v1/auth/me`                     | 🔐 Any   | Get current user profile           |
| GET    | `/api/v1/labs`                        | 🔐 Admin | List all labs                      |
| POST   | `/api/v1/labs`                        | 🔐 Admin | Create a new lab                   |
| GET    | `/api/v1/users`                       | 🔐 Admin | List all assistants                |
| POST   | `/api/v1/users`                       | 🔐 Admin | Create a new assistant account     |
| GET    | `/api/v1/equipment`                   | 🔐 Staff | List equipment (lab-isolated)      |
| POST   | `/api/v1/equipment`                   | 🔐 Asst  | Add new equipment                  |
| GET    | `/api/v1/equipment/public/:publicId`  | 🌐 Public| QR landing — instrument details    |
| GET    | `/api/v1/equipment/:id/qr`            | 🔐 Asst  | Generate & download QR PNG         |
| GET    | `/api/v1/tickets`                     | 🔐 Asst  | List tickets for assigned lab      |
| POST   | `/api/v1/tickets`                     | 🌐 Public| Student submits fault ticket       |
| PATCH  | `/api/v1/tickets/:id/status`          | 🔐 Asst  | Update ticket status               |
| GET    | `/api/v1/tickets/track`               | 🌐 Public| Track ticket by ID + Roll Number   |
| GET    | `/api/v1/calibrations`                | 🔐 Asst  | Calibration schedule (priority-sorted) |
| POST   | `/api/v1/calibrations`                | 🔐 Asst  | Log a new calibration event        |
| GET    | `/api/v1/reports/admin`               | 🔐 Admin | System-wide analytics report       |

---

## 🔑 Environment Variables

| Variable                | Required | Description                                 |
|------------------------|----------|---------------------------------------------|
| `PORT`                 | ✅       | Server port (default: 5000)                  |
| `MONGO_URI`            | ✅       | MongoDB Atlas connection string              |
| `JWT_SECRET`           | ✅       | Secret key for signing JWT tokens            |
| `JWT_EXPIRES_IN`       | ✅       | Token expiry (e.g., `7d`)                    |
| `CLOUDINARY_CLOUD_NAME`| ✅       | Your Cloudinary cloud name                   |
| `CLOUDINARY_API_KEY`   | ✅       | Cloudinary API key                           |
| `CLOUDINARY_API_SECRET`| ✅       | Cloudinary API secret                        |
| `SMTP_HOST`            | Optional | Email server host                            |
| `SMTP_PORT`            | Optional | Email server port                            |
| `SMTP_USER`            | Optional | Email account username                       |
| `SMTP_PASS`            | Optional | Email account password / app password        |
| `EMAIL_FROM`           | Optional | Sender address for notifications             |
| `CLIENT_URL`           | ✅       | Frontend URL for CORS whitelist              |

> 🔒 Never commit `.env` to version control. It is already in `.gitignore`.

---

## 🧪 Testing Results

> Based on the **Project Testing Report** conducted by Group G137 (Session 2025–26).
> **Testing Environment**: Windows 10/11 · Node.js v24.13.0 · npm v11.6.2

| # | Test Case                        | Expected Result                               | Actual Result                                      | Status  |
|---|----------------------------------|-----------------------------------------------|----------------------------------------------------|---------|
| 1 | Home Page Load                   | Home page loads successfully                  | Home page loaded successfully                      | ✅ Pass |
| 2 | Login Functionality              | Login with valid credentials succeeds         | Login fails (caused by DB not connected — see #6)  | ⏳ Pending DB fix |
| 3 | Portal Display (3 roles)         | Admin, Assistant & Student portals show       | All three portals displayed correctly              | ✅ Pass |
| 4 | Ticket Tracking Form Validation  | Ticket ID + Roll Number required              | Validation messages shown when either field empty  | ✅ Pass |
| 5 | Backend Server Startup           | Server starts on port 5000                    | Server started successfully in development mode    | ✅ Pass |
| 6 | MongoDB Atlas Connection         | Backend connects to Atlas cluster             | **Failed** — Tester's IP not whitelisted in Atlas  | ⏳ Fix below |

> **Root Cause for Tests 2 & 6**: MongoDB Atlas blocks all external connections by default. The tester's machine IP address was not added to the Atlas Network Access allowlist.
> **Resolution**: Follow [Step 2.5](#️-step-25--whitelist-your-ip-in-mongodb-atlas-critical) above.

---

## 🛠 Troubleshooting

### ❌ Problem: Login fails with "Login failed. Please check your credentials"

**Cause**: The backend cannot connect to MongoDB Atlas — usually because the testing machine's IP is not whitelisted.

**Fix**:
1. Open `http://localhost:5000/api/health` in your browser
2. If you see `"database": "disconnected"` → your IP needs to be whitelisted
3. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) → Security → Network Access → Add IP Address → Allow Access From Anywhere

---

### ❌ Problem: `Could not connect to any servers in your MongoDB Atlas cluster`

**Cause**: IP not whitelisted OR incorrect `MONGO_URI` in `.env`.

**Fix**:
- Whitelist your IP as described in Step 2.5
- Double-check your `MONGO_URI` matches what Atlas shows in "Connect → Drivers"
- Ensure your Atlas username/password in the URI are URL-encoded (special chars like `@`, `#` must be encoded)

---

### ❌ Problem: `querySrv ECONNREFUSED _mongodb._tcp.cluster0...`

**Cause**: Your local DNS resolver cannot resolve MongoDB Atlas SRV records.

**Fix**: This is already handled automatically — `server.js` sets Google's public DNS (`8.8.8.8`) at startup. Simply **restart the server** after fixing the IP whitelist.

---

### ❌ Problem: `AggregateError [ECONNREFUSED]` on API calls from the frontend

**Cause**: The frontend is running but the backend server is not started.

**Fix**: Make sure you have **two terminals open**:
```
Terminal 1: cd server && npm run dev   ← must show "Running on port 5000"
Terminal 2: cd client && npm run dev   ← frontend at localhost:5173
```

---

### ❌ Problem: Backend server starts but API returns 503

**Cause**: Server is running but MongoDB is still not connected (DB readiness guard is active).

**Fix**: Check the backend terminal for the MongoDB error message — it will print the exact IP whitelist instructions.

---

## 👥 Team G137

<div align="center">

| 👤 Name               | 🎓 Role                              |
|----------------------|--------------------------------------|
| **Vishal** | Team Lead & Full-Stack Developer     |
| **Mohit Kumar**       | Backend Developer                    |
| **Kunal Kumar**       | Frontend Developer                   |
| **Drishti Ahuja**     | UI/UX & Frontend                     |
| **Ranjeet Singh**     | Database & Testing                   |

</div>

---

## 🎓 Academic Details

<div align="center">

| Field                | Details                                           |
|---------------------|---------------------------------------------------|
| **University**       | GLA University, Mathura (U.P.)                    |
| **Department**       | Computer Science & Engineering (CSE)              |
| **Program**          | Bachelor of Technology (B.Tech)                   |
| **Academic Session** | 2025 – 2026                                       |
| **Project Group**    | **G137**                                          |
| **Project Type**     | Major Project (Capstone)                          |
| **Project Guide**    | **Mr. Manwatkar Sumedkumar Janardanji Sir**        |

</div>

---

## 📌 Key Design Decisions

- **Status Separation**: Three completely independent status fields (Operational, Calibration, Ticket) are **never merged** — each has its own lifecycle.
- **Damage Count Immutability**: `damageCount` only ever increments by 1 on a new valid ticket submission and **never resets** — providing a true audit trail.
- **Calibration History is Sacred**: Every calibration event permanently appends to `CalibrationLogs`. Records are **never deleted or overwritten**.
- **Soft Deletes Only**: The system uses `isActive: false` for all deactivations. `deleteOne()` is **never called** on any production collection.
- **DNS Reliability**: Google Public DNS (`8.8.8.8`, `8.8.4.4`) is set programmatically to ensure MongoDB Atlas SRV records resolve reliably in all network environments.
- **DB Readiness Guard**: All `/api/v1/*` routes return a clear `503` with actionable instructions if MongoDB is not connected — the server never crashes silently.
- **Lab Isolation Middleware**: Every authenticated request by an Assistant is filtered through `labIsolation.js` — it is architecturally impossible for an Assistant to read or write another lab's data.

---

## 📄 License

This project is submitted as an academic major project at GLA University.  
© 2025–26 Group G137 — All rights reserved.

---

<div align="center">

**Built with ❤️ by Group G137 | GLA University | B.Tech CSE | 2025–26**

*"Digitizing laboratory management, one QR code at a time."*

</div>

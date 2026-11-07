# Digital Lab Equipment Calibration & Fault Tracking System

A centralized web application for university laboratories to manage equipment inventory, generate unique QR labels for Google Lens / camera scanning, track calibration schedules with priority sorting, and streamline digital fault reporting and repair workflows.

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express.js REST API
- **Database**: MongoDB Atlas with Mongoose ORM
- **Authentication**: JWT + bcrypt (Role-Based Access Control)
- **File Storage**: Cloudinary (Damage Photographs)
- **Emails**: Nodemailer (Assistant Account Setup & Alerts)
- **QR Engine**: `qrcode` (Printable Labels)

---

## 📐 Project Directory Structure

```
├── client/                     # React Frontend Application
│   ├── public/                 # Static public assets
│   └── src/
│       ├── assets/             # Images, icons
│       ├── components/         # Reusable UI components (common, equipment, tickets)
│       ├── context/            # React Auth and State Context
│       ├── hooks/              # Custom React hooks
│       ├── layouts/            # Dashboard and Public layouts
│       ├── pages/
│       │   ├── admin/          # Admin Dashboard, Labs, Assistants, Reports
│       │   ├── assistant/      # Assistant Dashboard, Equipment, Calibration, Tickets
│       │   ├── auth/           # Login & Password Setup pages
│       │   └── public/         # QR Public Equipment View & Fault Submission Form
│       ├── services/           # Axios / API clients
│       └── utils/              # Sorting, date formatting, badge utilities
│
├── server/                     # Express Backend REST API
│   ├── src/
│   │   ├── config/             # MongoDB, Cloudinary, Nodemailer configurations
│   │   ├── controllers/        # Request handlers (auth, labs, equipment, tickets, calibrations)
│   │   ├── middleware/         # Auth, RBAC, Lab-level isolation, Upload, Error handler
│   │   ├── models/             # Mongoose Schemas (User, Lab, Equipment, Ticket, CalibrationLog)
│   │   ├── routes/             # API Route definitions
│   │   ├── services/           # QR code generation, notification service
│   │   └── utils/              # Enums, status constants, validation helpers
│   └── .env.example            # Environment variables blueprint
│
├── docs/                       # System Design & Architecture Specifications
│   ├── schema-blueprint.md     # Mongoose Schemas, relations, and data rules
│   ├── api-endpoints.md        # Full REST API documentation
│   └── rbac-matrix.md          # Role-Based Access Control and Lab Isolation matrix
│
├── .gitignore
└── README.md
```

---

## 🚀 6-Phase Development Roadmap

- [x] **Phase 1 — System Design**
  - Finalize V1 requirements & business rules.
  - Design MongoDB schemas, relations, and immutability rules.
  - Define REST API endpoints & access rules.
  - Design RBAC matrix and lab-level isolation rules.
  - Establish project directory structure.
- [ ] **Phase 2 — Backend Development**
  - Express server & MongoDB Atlas connection.
  - Mongoose models (User, Lab, Equipment, Ticket, CalibrationLog).
  - Auth, JWT, and lab-isolation middleware.
  - Lab & Equipment APIs + QR generation service.
  - Fault ticket submission & status transition lifecycle.
- [ ] **Phase 3 — Frontend Development**
  - React + Tailwind setup.
  - Auth routing & role guards.
  - Admin & Assistant dashboards.
  - Public Equipment Details page (Google Lens target) & Fault Ticket form.
- [ ] **Phase 4 — Integration**
  - Connect React to Express APIs.
  - End-to-end QR scan → report → status update flow.
  - Cloudinary image uploads.
- [ ] **Phase 5 — Calibration & Dashboard**
  - Calibration ledger and historical logs.
  - Calibration priority sorting (`Overdue` → `Due Today` → `Upcoming`).
  - Equipment sorted by `damageCount` DESC.
- [ ] **Phase 6 — Testing & Deployment**
  - Unit & Integration testing.
  - Security audit & Live deployment.

System Architecture

1. Architecture Overview

The Digital Lab Equipment Calibration & Fault Tracking System follows a client-server architecture.
The frontend is developed using React.js and communicates with the backend through REST APIs. The backend uses Node.js and Express.js to handle application logic, authentication, and database operations. MongoDB is used to store application data.
The application is organized into the following layers:
Frontend Layer: Provides user interfaces and dashboards.
API Layer: Handles communication between the frontend and backend.
Backend Layer: Manages routes, controllers, middleware, and services.
Database Layer: Stores users, laboratories, equipment, tickets, and calibration records.
External Services: Supports file uploads, QR code generation, and email functionality.

2. Project Directory Structure

The project is divided into two main folders:
client/ – Contains the frontend application.
server/ – Contains the backend application.

2.1 Frontend Structure

The frontend is organized into reusable components, pages, layouts, and supporting services.

client/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── equipment/
│   │   └── tickets/
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   ├── layouts/
│   │   └── DashboardLayout.jsx
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminReports.jsx
│   │   │   ├── ManageAssistants.jsx
│   │   │   └── ManageLabs.jsx
│   │   ├── assistant/
│   │   │   ├── AssistantDashboard.jsx
│   │   │   ├── CalibrationSchedule.jsx
│   │   │   ├── EquipmentManagement.jsx
│   │   │   └── TicketQueue.jsx
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── SetupPasswordPage.jsx
│   │   ├── public/
│   │   │   ├── EquipmentPublicView.jsx
│   │   │   ├── RaiseTicketPage.jsx
│   │   │   └── TrackTicketPage.jsx
│   │   └── HomePage.jsx
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js

2.2 Backend Structure

server/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── calibrationController.js
│   │   ├── equipmentController.js
│   │   ├── labController.js
│   │   ├── reportController.js
│   │   ├── ticketController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── labIsolation.js
│   │   └── validators.js
│   ├── models/
│   │   ├── CalibrationLog.js
│   │   ├── Equipment.js
│   │   ├── Lab.js
│   │   ├── Ticket.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── calibrationRoutes.js
│   │   ├── equipmentRoutes.js
│   │   ├── labRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── ticketRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   ├── emailService.js
│   │   ├── qrService.js
│   │   └── uploadService.js
│   ├── utils/
│   │   ├── constants.js
│   │   └── seeder.js
│   ├── app.js
│   └── server.js
├── package.json
└── package-lock.json
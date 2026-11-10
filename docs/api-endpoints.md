# Phase 1: REST API Endpoints Specification

Base URL: `/api/v1`

---

## 1. Authentication & User Management (`/auth`, `/users`)
| Method | Endpoint | Access | Description | Request Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Authenticate user (Admin/Assistant) and return JWT | `{ email, password }` |
| `GET` | `/auth/me` | Authenticated | Get current logged-in user profile & role | None (Bearer Token) |
| `POST` | `/auth/setup-password` | Public | Set initial password via email token | `{ token, newPassword }` |
| `POST` | `/users/assistants` | Admin | Add Lab Assistant, assign lab, trigger setup email | `{ name, email, mobile, assignedLabId }` |
| `GET` | `/users/assistants` | Admin | List all Lab Assistants with their assigned lab | None |
| `PATCH` | `/users/assistants/:id/status`| Admin | Deactivate/Archive an assistant (`isActive: false`)| None |

---

## 2. Laboratory Management (`/labs`)
| Method | Endpoint | Access | Description | Request Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/labs` | Admin | Create lab with auto-generated unique `labId` | `{ labName, labBlock }` |
| `GET` | `/labs` | Admin, Assistant | List all active laboratories | Optional query: `includeArchived=true` |
| `GET` | `/labs/:id` | Admin, Assigned Assistant | Get single lab details | None |
| `PATCH` | `/labs/:id/archive` | Admin | Soft-delete / Archive lab (`isActive: false`) | None |

---

## 3. Equipment Inventory (`/equipment`)
| Method | Endpoint | Access | Description | Request Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/equipment` | Assistant (Assigned Lab) | Register new equipment, generate `publicId`, set `damageCount: 0` | `{ name, serialNumber, model, location, installationDate, calibrationIntervalDays, nextCalibrationDate }` |
| `GET` | `/equipment` | Assistant (Assigned Lab) | List lab's equipment (Sorted by `damageCount` DESC by default) | Query: `sort=damageCount:desc`, `status=...` |
| `GET` | `/equipment/public/:publicId` | **Public** (Google Lens QR)| View equipment status & public details | None |
| `GET` | `/equipment/:id` | Assistant (Assigned Lab) | Get full internal equipment details | None |
| `PATCH` | `/equipment/:id` | Assistant (Assigned Lab) | Update equipment details / operationalStatus | `{ name, location, operationalStatus }` |
| `GET` | `/equipment/:id/qr` | Assistant (Assigned Lab) | Generate data URL or downloadable PNG QR label | None |
| `PATCH` | `/equipment/:id/archive` | Assistant (Assigned Lab) | Soft-delete equipment (`isActive: false`) | None |

---

## 4. Fault Ticket System (`/tickets`)
| Method | Endpoint | Access | Description | Request Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/tickets/public` | **Public** (Students) | Raise fault ticket via QR page. Increments equipment `damageCount` by 1. | Multipart Form: `{ publicId, studentName, rollNumber, mobile, email, description, photo (file) }` |
| `GET` | `/tickets` | Assistant (Assigned Lab) | List active or all tickets for assigned lab | Query: `status=Open,Under Review,In Repair` |
| `GET` | `/tickets/:id` | Assistant (Assigned Lab) | Get ticket details and damage photo | None |
| `PATCH` | `/tickets/:id/status` | Assistant (Assigned Lab) | Transition status: `Open` -> `Under Review` -> `In Repair` -> `Resolved` | `{ ticketStatus, resolutionNotes, updateOperationalStatus }` |
| `GET` | `/tickets/student/track` | Public | Track ticket status using Ticket ID and Roll Number | Query: `ticketId=...&rollNumber=...` |

---

## 5. Calibration Records (`/calibrations`)
| Method | Endpoint | Access | Description | Request Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/calibrations` | Assistant (Assigned Lab) | Log completed calibration, append to `calibrationLogs`, update equipment dates | `{ equipmentId, calibratedBy, calibrationDate, nextDueDate, remarks, certificateUrl }` |
| `GET` | `/calibrations/equipment/:id` | Assistant (Assigned Lab) | Get complete historical calibration ledger for equipment | None |
| `GET` | `/calibrations/schedule` | Assistant (Assigned Lab) | Get calibration schedule sorted by urgency priority | None |

---

## 6. Reports & Analytics (`/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/reports/calibrated-equipment` | Admin (Read-Only) | Global report of all calibrated equipment across labs |
| `GET` | `/reports/damaged-equipment` | Admin (Read-Only) | Global report of all currently damaged equipment & open faults |
| `GET` | `/reports/lab-summary` | Assistant (Assigned Lab) | Summary counts (Total Equipment, Ready to Use, Damaged, Under Repair, Overdue Calibrations) |

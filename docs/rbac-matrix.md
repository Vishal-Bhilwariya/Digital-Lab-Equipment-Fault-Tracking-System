# Phase 1: Role-Based Access Control (RBAC) & Lab Isolation Matrix

This document defines the security boundaries, authorization matrix, and middleware enforcement strategies.

---

## 1. Role Hierarchy & Boundaries

### A. Administrator (System Management)
* **Scope**: Global system oversight, Lab setup, Assistant onboarding, Read-only audit reporting.
* **Prohibited Operations**: Cannot directly alter daily equipment operational status, edit calibration logs, or modify fault tickets (these actions belong strictly to the assigned Lab Assistant).

### B. Lab Assistant (Assigned Lab Technician)
* **Scope**: Strict Lab-Level Isolation.
* **Enforcement Rule**: An Assistant's JWT contains `assignedLabId`. Middleware must verify that any equipment, ticket, or calibration requested matches the assistant's `assignedLabId`. Attempting to access or alter records from another lab results in `403 Forbidden`.

### C. Student (Public End-User)
* **Scope**: Strictly limited to scanning equipment QR codes, viewing public operational/calibration status, and submitting fault tickets with damage photos.
* **Security Rule**: No access to internal IDs, sensitive technician information, or system management routes.

---

## 2. Permissions Matrix

| Resource & Operation | Admin | Lab Assistant (Own Lab) | Lab Assistant (Other Lab) | Student / Public |
| :--- | :---: | :---: | :---: | :---: |
| **Labs: Create (`POST /labs`)** | ✅ Allowed | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |
| **Labs: View Active (`GET /labs`)** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ❌ Forbidden |
| **Labs: Archive (`PATCH /labs/:id`)** | ✅ Allowed | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |
| **Users: Add Assistant & Invite** | ✅ Allowed | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |
| **Users: Deactivate Assistant** | ✅ Allowed | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |
| **Equipment: Add / Edit** | ❌ Forbidden | ✅ Allowed | ❌ Forbidden | ❌ Forbidden |
| **Equipment: Generate QR** | ❌ Forbidden | ✅ Allowed | ❌ Forbidden | ❌ Forbidden |
| **Equipment: Public QR Page** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ **Allowed** |
| **Equipment: Archive** | ❌ Forbidden | ✅ Allowed | ❌ Forbidden | ❌ Forbidden |
| **Tickets: Submit Fault via QR** | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden | ✅ **Allowed** |
| **Tickets: View Queue & Photos** | ❌ Forbidden | ✅ Allowed | ❌ Forbidden | ❌ Forbidden |
| **Tickets: Transition Status** | ❌ Forbidden | ✅ Allowed | ❌ Forbidden | ❌ Forbidden |
| **Tickets: Track Status by ID** | ❌ Forbidden | ✅ Allowed | ❌ Forbidden | ✅ **Allowed** |
| **Calibrations: Log Calibration**| ❌ Forbidden | ✅ Allowed | ❌ Forbidden | ❌ Forbidden |
| **Calibrations: View History** | ❌ Forbidden | ✅ Allowed | ❌ Forbidden | ❌ Forbidden |
| **Reports: Global Calibrated** | ✅ Read-Only | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |
| **Reports: Global Damaged** | ✅ Read-Only | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |

---

## 3. Backend Enforcement Architecture

```
Incoming Request
       │
       ▼
[ authMiddleware ]  ──► Validates JWT, extracts { userId, role, assignedLabId }
       │
       ▼
[ roleMiddleware(['Admin', 'Assistant']) ] ──► Ensures role authorization
       │
       ▼
[ labIsolationMiddleware ] ──► Ensures (req.user.assignedLabId === targetRecord.labId)
       │
       ▼
Controller Handler Executed
```

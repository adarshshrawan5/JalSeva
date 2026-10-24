# 💧 JalSeva (जलसेवा)

### Design and Implementation of a Web-Based Water Supply Management and Citizen Grievance Prototype
**Academic Research Project • Prototype Case Study: Mira-Bhayandar Urban Area**

---

> **Academic Prototype & Research Disclaimer**:  
> **JalSeva** is an independent, student-developed research engineering prototype and proof-of-concept web application. It is **not** an official municipal application, has **not** been commissioned, endorsed, or deployed by the Mira-Bhayandar Municipal Corporation (MBMC), and does **not** connect to physical municipal telemetry or government servers. All municipal statistics, ward populations, and telemetry figures are illustrative demo models for academic evaluation.

---

## 📌 1. Project Abstract & Overview

Urban water distribution in rapidly growing Indian satellite cities often suffers from operational opacity, uncoordinated emergency tanker dispatching, and fragmented citizen grievance redressal. **JalSeva** is a software engineering research project designed to explore a consolidated, progressive web-based architecture for municipal water monitoring and civic redressal.

The prototype models a unified portal connecting four core stakeholder workflows:
1. **Citizens**: Access scheduled valve distribution timetables, register geotagged grievance tickets with photo evidence, request emergency potable water tankers, monitor consumption trends via telescopic tariff analytics, and log self-meter readings.
2. **Tanker Drivers**: Access dispatch itineraries, navigate delivery locations on interactive maps, verify 4-digit handover One-Time Passwords (OTP), and log fulfillment states.
3. **Field Plumbers & Technicians**: Review assigned municipal grievances, execute on-site work diagnostics (parts, labor, water quality readings), and complete ticket resolutions.
4. **Municipal Administrators**: Coordinate emergency outage alerts, balance field technician assignments, manage ward timetables, and monitor demonstrative zone-level telemetry.

---

## 🎯 2. Research Objectives

1. **Dual-Layer Persistence Architecture**: Evaluate the viability of a hybrid storage layer combining synchronous browser `localStorage` caching with asynchronous Google Cloud Firestore synchronization.
2. **Deterministic Redressal State Machine**: Model a civic grievance lifecycle (`Pending` → `Assigned` → `In Progress` → `Resolved` → `Reopened`) with bi-directional technician assignment and citizen validation.
3. **Emergency Resource Allocation**: Implement geospatial depot routing using the Haversine formula to assign the nearest operational depot with available tanker stock.
4. **Role-Based Access Control (RBAC) in Serverless NoSQL**: Design and validate declarative Firestore security rules (`firestore.rules`) enforcing least-privilege access, citizen privacy isolation, and defense against unauthorized privilege escalation.

---

## 🛠️ 3. Technology Stack & System Architecture

```
                      ┌──────────────────────────────────────────────┐
                      │            JalSeva Web Client                │
                      │  (React 19, TypeScript, Vite, Tailwind v4)  │
                      └──────────────────────┬───────────────────────┘
                                             │
                      ┌──────────────────────┴───────────────────────┐
                      │          storageService (Client Cache)       │
                      │    - LocalStorage persistence                │
                      │    - Reactive event bus update mechanism     │
                      └──────────────────────┬───────────────────────┘
                                             │
                                  Asynchronous Dual-Sync
                                             │
                      ┌──────────────────────▼───────────────────────┐
                      │          firebaseService (SDK v13)           │
                      └──────────────┬───────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌────────────────────────┐                          ┌────────────────────────┐
│  Firebase Auth SDK     │                          │  Cloud Firestore NoSQL │
│  - Google OAuth        │                          │  - Database: Named ID  │
│  - Session tokens      │                          │  - firestore.rules     │
└────────────────────────┘                          └────────────────────────┘
```

- **Frontend Core**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS v4, Lucide React
- **Data Visualizations**: Recharts 3.x (`AreaChart`, `BarChart`, `ResponsiveContainer`, `Tooltip`)
- **GIS & Mapping**: Leaflet 1.9, OpenStreetMap tiles, `@vis.gl/react-google-maps` (with quota fallback traps)
- **Cloud Database**: Google Cloud Firestore (Named Database: `ai-studio-aquaconnectmbmcd-ed48ea96-a122-4654-9e0e-577010d583d8`)
- **Authentication**: Firebase Authentication (Google OAuth provider) with client-side session management
- **Security Validation**: Attribute-Based Access Control (ABAC) in `firestore.rules`

---

## 📊 4. Verified Modules vs. Simulated Demonstrations

To ensure technical transparency and academic rigor, the table below distinguishes implemented software logic from simulated components:

| Feature / Module | Implementation Nature | Technical Description |
|---|---|---|
| **Citizen Grievance Docket** | **Implemented** | Form validation, deterministic ID generation (`CMP<date><rand>`), timeline state transitions, photo attachment encoding, and Firestore persistence. |
| **Emergency Tanker Booking** | **Implemented** | Date validation restricted to Today/Tomorrow, depot allocation via Haversine formula, duplicate order prevention, and Firestore persistence. |
| **OTP Handover Verification** | **Implemented** | Cryptographic 4-digit numeric OTP generated at booking; delivery completion requires matching OTP validation. |
| **Cloud-to-Local Hydration** | **Implemented** | When users authenticate, remote cloud documents are merged into client storage without duplicate key creation. |
| **Write Failure Transparency** | **Implemented** | Cloud sync promises track `'synced'` vs `'failed'` states; interface alerts user if a write was stored locally but rejected by cloud rules. |
| **Telescopic Billing Calculator**| **Implemented (Formula)** | Computes slab tariffs (0–15 kL @ ₹6.50, 16–30 kL @ ₹10.00, >30 kL @ ₹16.00) + 20% cess + ₹40 meter rent. |
| **Driver Transit Movement** | **Simulated** | Fleet vehicle GPS positions along routes are simulated via interpolated polyline coordinates; no physical vehicle GPS hardware is connected. |
| **Citizen SMS / Push Alerts** | **Simulated** | Rendered via on-screen UI modal alerts; no external telecom carrier gateway (e.g. CDAC Mobile Seva / Twilio) is integrated. |
| **SCADA & Reservoir Telemetry** | **Simulated** | In-memory `setInterval` mathematical models oscillating tank percentages and pressure; no physical RTU/Modbus hardware connection. |
| **UPI / Payment Gateway** | **Simulated** | Illustrative UPI QR modal and mock receipt generator for demo workflows; no banking aggregator (e.g. Razorpay / NPCI) API key is integrated. |

---

## 📈 5. Illustrative Municipal & Tariff Models

The data structures utilized in the prototype reflect standard urban Indian municipal water supply models, but are **illustrative reference values**:

### A. Domestic Telescopic Water Tariff Schedule (Model Baseline)
*Source Baseline: Illustrative rates structured after standard Maharashtra Municipal Corporation residential brackets:*
- **Slab 1 (0 – 15 kL/month)**: ₹6.50 per kL (Subsidized lifeline quota)
- **Slab 2 (16 – 30 kL/month)**: ₹10.00 per kL (Standard residential consumption)
- **Slab 3 (> 30 kL/month)**: ₹16.00 per kL (High-volume consumption bracket)
- **Sewerage Surcharge**: 20% of net water charge
- **Meter Service Charge**: ₹40.00 flat monthly charge
- *Benchmark Comparison*: Central Public Health and Environmental Engineering Organisation (CPHEEO) urban benchmark of 135 Liters Per Capita per Day (LPCD).

### B. Illustrative Municipal Zonal Matrix
*The prototype partitions the demonstrative municipal area into four operational zones:*

| Zone ID | Zone Name | Marathi Reference | Ward Tags | Modeled Population (Demo) | Modeled Depots |
|---|---|---|---|---|---|
| `zone-1` | Bhayandar East | विभाग १: भाईंदर पूर्व | Wards 1, 2, 3, 4 | ~238,500 | Kharigaon Central Depot |
| `zone-2` | Bhayandar West | विभाग २: भाईंदर पश्चिम | Wards 5, 6, 7, 8 | ~186,200 | Subhash Nagar Depot |
| `zone-3` | Mira Road East | विभाग ३: मीरा रोड पूर्व | Wards 9, 10, 11, 12, 13 | ~298,400 | Sector 4 Auxiliary Depot |
| `zone-4` | Uttan Coastal | विभाग ४: उत्तन व सागरी विभाग | Wards 14, 15, 16 | ~86,278 | Uttan Coastal Depot |

---

## 🔒 6. Security Architecture & Firestore Rules

Database operations are governed by declarative security rules in `firestore.rules`:

1. **Default-Deny Catch-All**: The database root match blocks all unauthenticated read and write actions by default (`allow read, write: if false;`).
2. **Citizen Profile Protection (`/users/{userId}`)**:
   - `get`: Restricted to the authenticated document owner (`request.auth.uid == userId`) or an administrator. Unauthorized public listing of citizen records is denied.
   - `create`: Enforces valid schema types and blocks non-admins from self-assigning `role: 'admin'`.
   - `update`: Restricts mutable fields to citizen contact attributes (`name`, `phone`, `address`, `consumerNumber`, `zoneId`). Privilege escalation to `'admin'` is blocked.
3. **Public Grievance and Tanker Booking Submission**:
   - `complaints` and `tanker_bookings` allow public creation subject to strict schema validation (`isValidComplaint()`, `isValidTankerBooking()`), enabling anonymous civic reporting.
   - Deletion of complaints or bookings is restricted to verified administrators (`allow delete: if isAdmin();`).
4. **Outage Announcements (`/outage_alerts/{alertId}`)**:
   - Read is public to ensure all residents receive emergency notices.
   - Write, update, and delete require verified administrator authorization.

---

## 🧪 7. Automated Testing & Verification Methodology

The codebase includes an automated test runner (`test_runner.ts`) executed headless via `tsx`:

```bash
npm test
```

### Verified Test Cases (19/19 Passing):
- **TC-01**: Citizen complaint creation and deterministic ID formatting (`CMP...`).
- **TC-02**: Citizen complaint retrieval by ID.
- **TC-03**: Tanker booking creation and 4-digit numeric OTP generation.
- **TC-04**: Tanker booking strict date validation (restricted to Today and Tomorrow).
- **TC-05**: Client-side storage persistence across browser reload events.
- **TC-06**: Administrator outage alert publishing and status lifecycle (`Active` → `Resolved`).
- **TC-07**: Zone supply schedule modifications.
- **TC-08**: Complaint broadcasting to the field technician pool.
- **TC-09**: First-come-first-served technician job claim logic and load balancing.
- **TC-10**: Citizen technician rejection and re-dispatch workflow.
- **TC-11**: Driver delivery OTP verification (positive vs. negative match).
- **TC-12**: Google Maps quota exhaustion event handler trap.
- **TC-13**: Firestore write failure transparency (rejections recorded as `failed` with error string).
- **TC-14**: Firestore write success tracking (`cloudSyncStatus: 'synced'`).
- **TC-15**: Remote cloud-to-local hydration with duplicate prevention.
- **TC-16**: Tanker booking duplicate order prevention (same phone and date).
- **TC-17**: RBAC blueprint privilege escalation guard (blocking citizen self-promotion).
- **TC-18**: Outage alert administrator authorization guard.
- **TC-19**: Citizen registration and profile cloud sync trigger.

---

## ⚠️ 8. Research Limitations & Constraints

1. **Non-Production Deployment**: The portal is an experimental prototype and has not undergone penetration testing, load testing under high municipal concurrency, or government audit.
2. **Authentication Coupling**: In the current security rules blueprint, administrator verification references a specific project administrator email alongside `/admins/` document lookups. A production deployment requires migration to enterprise Firebase Auth Custom Claims.
3. **Simulated Hardware Integrations**: SCADA levels, pressure sensors, and vehicle fleet locations operate on client-side simulation loops rather than IoT edge gateways or MQTT/Modbus protocols.
4. **Bi-directional Conflict Resolution**: Multi-device offline reconciliation currently utilizes an add-new-ID strategy rather than a distributed conflict-free replicated data type (CRDT) or vector clock.

---

## 💻 9. Reproducibility & Local Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**

### Installation
```bash
# 1. Clone repository
git clone https://github.com/adarshshrawan5/JalSeva.git
cd JalSeva

# 2. Install dependencies
npm install

# 3. Verify TypeScript type safety
npm run lint

# 4. Execute automated test suite
npm test

# 5. Build production bundle
npm run build

# 6. Start local development server
npm run dev
```

### Firebase Web Client Configuration
The web client connects using public Firebase API configuration keys (`firebase-applet-config.json`):
```json
{
  "projectId": "booming-lane-3mn89",
  "appId": "1:997457548685:web:818cb314035a3e0ce559c4",
  "apiKey": "AIzaSyAbGdhlgekLfxp2K7BzjmZzzu3flT8a6gI",
  "authDomain": "booming-lane-3mn89.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-aquaconnectmbmcd-ed48ea96-a122-4654-9e0e-577010d583d8",
  "storageBucket": "booming-lane-3mn89.firebasestorage.app",
  "messagingSenderId": "997457548685"
}
```
> **Security Notice**: Firebase client configuration keys identify the project to Google Cloud APIs and are safe to be bundled in frontend code. **Never** place private service-account keys (`serviceAccountKey.json`), Admin SDK private keys, or backend secrets in frontend configuration files.

---

## 🔮 10. Future Scope & Roadmap

- **Hardware SCADA Integration**: Replace simulated telemetry with real-time MQTT message brokers linked to LoRaWAN water-pressure and ultrasonic reservoir sensors.
- **Telecom DLT Gateway Integration**: Connect SMS notifications to an approved Indian Distributed Ledger Technology (DLT) telecom provider for real-world resident dispatch notices.
- **Automated Offline Sync Queue**: Implement an IndexedDB-backed service worker queue using exponential backoff to retry failed writes when network connectivity returns.
- **GIS Pipe Network Mapping**: Integrate GeoJSON shapefiles of the municipal underground water pipeline grid for spatial leak hazard visualization.

---

## 📄 11. Academic Attribution & License

- **Project Title**: JalSeva: Design and Implementation of a Web-Based Water Supply Management and Citizen Grievance Prototype
- **Author / Developer**: Adarsh Yadav (`adarshshrawan5@gmail.com`)
- **License**: [Apache License 2.0](LICENSE)
- **Notice**: This repository is maintained solely for software engineering research and educational presentation.

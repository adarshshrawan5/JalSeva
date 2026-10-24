# 💧 JalSeva (जलसेवा)

### A Web-Based Water Supply Management and Citizen Grievance Portal

**Student Project | Software Engineering Prototype | Mira-Bhayandar, Maharashtra, India**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-19%2F19%20Passing-brightgreen)](test_runner.ts)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

**JalSeva** is an independent, student-developed web application prototype designed to explore how modern digital tools can support water-supply transparency, civic grievance management, emergency tanker booking, and administrative service coordination.

> **Academic Disclaimer:** JalSeva is an independent research prototype. It is **not** an official municipal application, has **not** been commissioned, endorsed, or deployed by the Mira-Bhayandar Municipal Corporation (MBMC), and does **not** connect to physical municipal telemetry or government servers. All municipal statistics, ward populations, and sensor values are illustrative demo models for academic evaluation.

---

## 🌐 Project Links

- **Live Prototype Demo:** https://jal-seva-seven.vercel.app/
- **Source Code Repository:** https://github.com/adarshshrawan5/JalSeva

*Notice: The live demo is hosted for peer review and academic evaluation. It utilizes demonstrative baseline data and must not be treated as an operational civic utility.*

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Research & Engineering Objectives](#-research--engineering-objectives)
- [Key Features & Role Portals](#-key-features--role-portals)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Implementation Status: Implemented vs. Simulated](#-implementation-status-implemented-vs-simulated)
- [Data and Security Governance](#-data-and-security-governance)
- [Illustrative Tariff & Municipal Reference Models](#-illustrative-tariff--municipal-reference-models)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Limitations & Constraints](#-limitations--constraints)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)
- [Author & Acknowledgments](#-author--acknowledgments)

---

## 📖 Overview

Access to reliable municipal water-supply information and structured grievance redressal mechanisms is essential for rapidly growing urban satellite areas. In many municipalities, coordinating valve release timetables, citizen leakage tickets, emergency potable tanker requests, and field technician dispatching across fragmented manual channels introduces operational friction and delays.

**JalSeva** investigates a consolidated, progressive web-based architecture to address these challenges. The prototype links citizen-facing modules with role-based interfaces for drivers, field technicians, and municipal administrators, combining instant client-side browser caching (`localStorage`) with cloud persistence in **Google Cloud Firestore**.

The project is developed for software engineering education, human-computer interaction (HCI) evaluation, and academic research. Its efficacy in municipal administration has not been established through an authorized civic deployment.

---

## 🎯 Research & Engineering Objectives

1. **Dual-Layer Persistence Architecture**: Evaluate a hybrid storage layer linking synchronous browser `localStorage` caching with asynchronous Google Cloud Firestore synchronization.
2. **Deterministic Redressal State Machine**: Model a full civic grievance lifecycle (`Pending` → `Assigned` → `In Progress` → `Resolved` → `Reopened`) with field worker assignment and citizen satisfaction feedback.
3. **Emergency Resource Allocation**: Demonstrate an emergency potable tanker booking mechanism with geospatial depot allocation via the Haversine formula and duplicate order prevention.
4. **Delivery Verification Workflow**: Implement a cryptographic 4-digit numeric One-Time Password (OTP) verification system between citizen recipients and delivery drivers.
5. **Role-Based Access Control (RBAC) in NoSQL**: Design declarative Firestore security rules (`firestore.rules`) enforcing least-privilege document access, citizen profile privacy, and defense against privilege escalation.
6. **Transparent Failure Feedback**: Ensure failed remote writes explicitly communicate error states (`cloudSyncStatus: 'failed'`) rather than falsely reporting cloud synchronization.
7. **Comprehensive Automated Verification**: Validate core domain logic, boundary constraints, deduplication, and security rules through automated test suites.

---

## ✨ Key Features & Role Portals

### 👤 Citizen Portal
- **Supply Timetables**: View modeled ward-level valve release schedules and maintenance notices.
- **Grievance Docket**: Register geotagged complaints with categorization, urgency levels, and optional photo attachment encoding.
- **Ticket Tracking**: Inspect real-time status timelines with assigned technician details.
- **Emergency Potable Tanker Booking**: Request emergency water deliveries restricted to valid time windows (Today and Tomorrow) with nearest-depot routing.
- **Consumption Analytics**: Log self-meter readings and review monthly consumption trends using interactive area and bar charts.
- **Telescopic Billing Calculator**: Calculate modeled slab-based residential tariffs with sewerage surcharges and meter service fees.

### 🚚 Tanker Driver Portal
- **Dispatch Itinerary**: Review allocated emergency delivery orders filtered by assigned tanker registration.
- **Route Visualization**: Inspect mapped delivery addresses on interactive OpenStreetMap/Leaflet canvases.
- **OTP Delivery Handover**: Authenticate drop-off by validating the citizen's 4-digit delivery PIN before transitioning orders to `Delivered`.

### 🛠️ Field Worker / Technician Portal
- **Assigned Work Queue**: Review assigned municipal water pipeline complaints and emergency repair requests.
- **On-Site Diagnostics**: Log resolution field reports, including labor hours, replacement components, and tested water pressure.
- **First-Come Job Claiming**: Claim unassigned broadcast complaints with automated workload accounting.

### 🏢 Administrative Portal
- **Service Schedule Management**: Update ward supply schedules (morning and evening distribution hours).
- **Outage Alert Broadcast**: Author and publish public emergency water outage advisories.
- **Workload Balancing**: Reassign grievance tickets and coordinate field worker assignments.
- **Zonal Telemetry Dashboard**: Monitor demonstrative reservoir levels, distribution pressure, and grievance metrics.

---

## 🧰 Technology Stack

| Component | Technology | Version | Purpose |
|---|---|---|---|
| **User Interface** | React | 19.x | Component-driven frontend architecture |
| **Language** | TypeScript | 5.x | Static type safety and data integrity |
| **Build Tool** | Vite | 6.x | Fast HMR and optimized production bundling |
| **Styling** | Tailwind CSS | v4 | Utility-first responsive design system |
| **Visualizations** | Recharts | 3.x | Telescopic tariff and consumption charts |
| **Mapping & GIS** | Leaflet & OSM | 1.9.x | Interactive open-source spatial maps |
| **Google Maps** | `@vis.gl/react-google-maps` | 1.x | Demonstration mapping with quota error traps |
| **Cloud Database** | Cloud Firestore | SDK v13 | Structured NoSQL document database |
| **Authentication** | Firebase Auth | SDK v13 | User session management and Google Sign-In |
| **Client Cache** | Browser `localStorage` | Web API | Zero-latency local caching and offline resilience |

---

## 🏗️ System Architecture

The application adopts a decoupled client-cloud architecture where the local storage service serves as an immediate reactive cache, asynchronously backed by Cloud Firestore:

```text
                 ┌──────────────────────────────────────────────┐
                 │             JalSeva Web Client               │
                 │   (React 19, TypeScript, Tailwind CSS v4)    │
                 └──────────────────────┬───────────────────────┘
                                        │
                 ┌──────────────────────▼───────────────────────┐
                 │             storageService.ts                │
                 │   - Synchronous LocalStorage Cache           │
                 │   - Reactive CustomEvent Bus                 │
                 │   - Cloud Sync Status Tracking               │
                 └──────────────────────┬───────────────────────┘
                                        │
                             Asynchronous Dual-Sync
                                        │
                 ┌──────────────────────▼───────────────────────┐
                 │             firebaseService.ts               │
                 │   - Cloud Firestore SDK v13                  │
                 │   - Client-to-Cloud Hydration & Deduplication│
                 └──────────────┬───────────────────────────────┘
                                │
       ┌────────────────────────┴────────────────────────┐
       ▼                                                 ▼
┌────────────────────────────┐              ┌────────────────────────────┐
│   Firebase Authentication  │              │   Google Cloud Firestore   │
│   - Google OAuth Provider  │              │   - Named Database ID      │
│   - Client Session State   │              │   - firestore.rules (ABAC) │
└────────────────────────────┘              └────────────────────────────┘
```

*Note: In the event of network disruption or security rule rejection, write operations persist in local cache while explicitly marking `cloudSyncStatus: 'failed'` to prevent false reporting.*

---

## ⚙️ Implementation Status: Implemented vs. Simulated

To preserve technical honesty in academic reporting, the table below delineates verified software logic from simulated components:

| Feature / Module | Status | Technical Description |
|---|---|---|
| **Citizen Grievance Docket** | **Implemented** | Form validation, deterministic ID generation (`CMP<timestamp><random>`), status progression, photo encoding, and Firestore persistence. |
| **Emergency Tanker Booking** | **Implemented** | Booking window validation (Today/Tomorrow), depot selection via Haversine calculation, duplicate order rejection, and Firestore persistence. |
| **Delivery OTP Handover** | **Implemented** | Cryptographic 4-digit numeric OTP generated at booking; delivery completion strictly requires OTP match. |
| **Dual-Layer Persistence** | **Implemented** | Synchronous `localStorage` updates paired with asynchronous Firestore `setDoc`/`addDoc` calls. |
| **Failure Transparency** | **Implemented** | Tracks `'synced'` vs `'failed'` states; alerts user if a write was retained locally but rejected by cloud rules. |
| **Cloud-to-Local Hydration** | **Implemented** | Authenticated session start queries Firestore and merges cloud records without creating duplicates. |
| **Telescopic Tariff Formula** | **Implemented (Formula)** | Implements slab brackets (0–15 kL @ ₹6.50, 16–30 kL @ ₹10.00, >30 kL @ ₹16.00) + 20% cess + ₹40 meter rent. |
| **Vehicle Fleet Movement** | **Simulated** | Driver transit coordinates along delivery routes use interpolated polylines; no physical GPS hardware is connected. |
| **Citizen SMS / Push Notices** | **Simulated** | Rendered via on-screen UI modal alerts; no telecom DLT carrier gateway (e.g. CDAC Mobile Seva / Twilio) is integrated. |
| **Reservoir / Pressure SCADA** | **Simulated** | Client-side mathematical oscillation loops (`setInterval`); no physical RTU/Modbus hardware connection exists. |
| **UPI Payment / Receipts** | **Simulated** | Demonstrative UPI QR modal and mock receipt generator; no banking aggregator (e.g. Razorpay / NPCI) API key is integrated. |

---

## 🔐 Data and Security Governance

JalSeva establishes security controls at both the application interface and the database layer:

- **Server-Enforced Access Control**: Security is enforced at the database boundary via declarative `firestore.rules`, rather than relying solely on client-side UI guards.
- **Default-Deny Policy**: All unspecified document reads and writes are blocked by default (`allow read, write: if false;`).
- **Citizen Profile Isolation (`/users/{userId}`)**:
  - Individual profile reads are restricted to the authenticated document owner (`request.auth.uid == userId`) or administrators.
  - Public listing of user profile records is denied to protect citizen privacy.
  - Profile creation blocks unauthorized self-promotion to `role: 'admin'`.
- **Public Grievance and Tanker Booking Submission**:
  - Unauthenticated citizens can submit emergency grievances and tanker requests subject to strict schema validation rules.
  - Record deletion is restricted exclusively to verified administrators.
- **Emergency Outage Advisories (`/outage_alerts/{alertId}`)**:
  - Public read access ensures immediate reach for civic announcements.
  - Document creation, modification, and deletion are restricted to administrators.
- **Credential Protection**:
  - Public web configuration keys in `firebase-applet-config.json` identify the project to Google Cloud APIs.
  - No private service-account keys (`serviceAccountKey.json`), Admin SDK private credentials, or secrets are exposed.

---

## 📈 Illustrative Tariff & Municipal Reference Models

All tariff schedules and geographic data modeled in the system are illustrative baselines structured after urban Indian municipal standards:

### A. Domestic Telescopic Water Tariff Schedule
*Model baseline structured after residential municipal water brackets:*
- **Slab 1 (0 – 15 kL/month)**: ₹6.50 per kL (Subsidized lifeline allocation)
- **Slab 2 (16 – 30 kL/month)**: ₹10.00 per kL (Standard residential bracket)
- **Slab 3 (> 30 kL/month)**: ₹16.00 per kL (High-volume consumption bracket)
- **Sewerage Surcharge**: 20% of net water consumption charge
- **Meter Service Rent**: Flat ₹40.00 monthly charge
- *Benchmark Comparison*: Central Public Health and Environmental Engineering Organisation (CPHEEO) urban benchmark of 135 Liters Per Capita per Day (LPCD).

### B. Demonstrative Municipal Zonal Matrix
*Four illustrative operational divisions modeled for routing and scheduling:*

| Zone ID | Zone Name | Marathi Reference | Ward Tags | Modeled Population | Modeled Depots |
|---|---|---|---|---|---|
| `zone-1` | Bhayandar East | विभाग १: भाईंदर पूर्व | Wards 1–4 | ~238,500 | Kharigaon Central Depot |
| `zone-2` | Bhayandar West | विभाग २: भाईंदर पश्चिम | Wards 5–8 | ~186,200 | Subhash Nagar Depot |
| `zone-3` | Mira Road East | विभाग ३: मीरा रोड पूर्व | Wards 9–13 | ~298,400 | Sector 4 Auxiliary Depot |
| `zone-4` | Uttan Coastal | विभाग ४: उत्तन व सागरी विभाग | Wards 14–16 | ~86,278 | Uttan Coastal Depot |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/adarshshrawan5/JalSeva.git
cd JalSeva
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify Firebase Web Client Configuration
Ensure `firebase-applet-config.json` contains public client keys for your Firebase project:
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

### 4. Start the Local Development Server
```bash
npm run dev
```

### 5. Execute Quality Checks
```bash
# Verify TypeScript type definitions and syntax
npm run lint

# Run automated functional and regression test suite
npm test

# Build production bundle
npm run build
```

---

## 🧪 Testing & Quality Assurance

The project includes an automated test runner (`test_runner.ts`) executed headless via `tsx`:

```bash
npm test
```

### Automated Test Coverage (19/19 Passing)

| Test Case | Module | Verification Objective | Status |
|---|---|---|---|
| **TC-01** | Grievance | Citizen complaint creation & deterministic ID formatting (`CMP...`) | **PASS** |
| **TC-02** | Grievance | Complaint retrieval by ID from storage layer | **PASS** |
| **TC-03** | Tanker Booking | Emergency tanker booking creation & 4-digit numeric OTP generation | **PASS** |
| **TC-04** | Tanker Booking | Strict delivery date validation (restricted to Today and Tomorrow) | **PASS** |
| **TC-05** | Storage Cache | Local storage data retention across browser refresh simulations | **PASS** |
| **TC-06** | Outage Alerts | Administrator alert creation & status transition (`Active` → `Resolved`) | **PASS** |
| **TC-07** | Admin Operations | Zone water supply distribution schedule modification | **PASS** |
| **TC-08** | Dispatch | Admin complaint broadcast to field technician pool | **PASS** |
| **TC-09** | Field Worker | First-come technician job claim and load accounting | **PASS** |
| **TC-10** | Citizen Redressal | Citizen rejection of assigned technician & re-dispatch workflow | **PASS** |
| **TC-11** | Delivery OTP | Driver delivery OTP matching (accepts matching OTP, rejects incorrect) | **PASS** |
| **TC-12** | GIS Integration | Google Maps API quota event trap handling | **PASS** |
| **TC-13** | Cloud Sync | Firestore write failure transparency (flags `failed` on `PERMISSION_DENIED`) | **PASS** |
| **TC-14** | Cloud Sync | Firestore write success tracking (`cloudSyncStatus: 'synced'`) | **PASS** |
| **TC-15** | Hydration | Cloud-to-local data hydration with duplicate prevention | **PASS** |
| **TC-16** | Tanker Booking | Duplicate order prevention (same phone and date) | **PASS** |
| **TC-17** | RBAC Security | Privilege escalation guard (blocks citizen self-assignment of `admin`) | **PASS** |
| **TC-18** | Security Rules | Outage alert admin-only publishing authorization guard | **PASS** |
| **TC-19** | User Profile | Citizen registration profile cloud synchronization trigger | **PASS** |

*Note: Automated tests evaluate domain logic, schema constraints, and storage contracts. Live cloud writes against Google Cloud Firestore are subject to project network availability and active security rules.*

---

## ⚠️ Limitations & Constraints

1. **Research Prototype Status**: The application is an academic software prototype and has not undergone government security accreditation or high-volume municipal stress testing.
2. **Authentication Architecture**: In the prototype, administrative checks utilize a combination of email verification and `/admins/` document lookups. A production municipal deployment requires migration to enterprise Firebase Auth Custom Claims.
3. **Simulated Telemetry**: Sensor readings (water pressure, reservoir capacities) and vehicle tracking operate on client-side mathematical simulation routines rather than physical IoT edge hardware.
4. **Offline Conflict Handling**: Multi-device offline synchronization currently uses an append-latest strategy rather than a distributed conflict-free replicated data type (CRDT).
5. **Telecom & Payment Mocking**: SMS delivery notices and UPI payment flows are simulated in the UI and do not initiate real telecom transmissions or financial transactions.

---

## 🔮 Future Enhancements

- **Physical SCADA Integration**: Interface with real-time MQTT message brokers linked to LoRaWAN water-pressure and ultrasonic reservoir sensors.
- **Telecom DLT Gateway Integration**: Connect SMS notifications to an approved Indian Distributed Ledger Technology (DLT) telecom provider for real-world resident dispatch notices.
- **Automated Offline Sync Queue**: Implement an IndexedDB-backed service worker queue with exponential backoff to retry failed writes when network connectivity returns.
- **GIS Pipeline Grid Mapping**: Integrate municipal GeoJSON shapefiles representing the underground water distribution network for spatial burst/leak hazard visualization.
- **Automated Security Rule Emulation**: Add `@firebase/rules-unit-testing` suites executed in GitHub Actions for continuous security rules regression testing.

---

## 🤝 Contributing

Contributions, feedback, and academic critique are welcome.

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/improved-validation`).
3. Ensure all tests and lint checks pass (`npm test && npm run lint`).
4. Commit your changes with descriptive messages.
5. Submit a pull request detailing the modifications.

*Please ensure no personal citizen data, production database credentials, or secret keys are committed.*

---

## 📄 License

This project is open-source software licensed under the [Apache License 2.0](LICENSE).

---

## 👨‍💻 Author & Acknowledgments

**Adarsh Yadav**  
Student Developer | Information Technology  
GitHub: [@adarshshrawan5](https://github.com/adarshshrawan5)  
Email: `adarshshrawan5@gmail.com`

---

*JalSeva is an academic software engineering prototype developed to explore digital approaches to water-supply information management, citizen grievance workflows, and cloud persistence.*

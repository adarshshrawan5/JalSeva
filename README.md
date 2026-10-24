# 💧 JalSeva (जलसेवा)

### A Web-Based Water Supply Management and Citizen Grievance Portal
**Academic Research Project • Software Engineering Prototype • Case Study: Mira-Bhayandar, Maharashtra, India**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Automated Tests](https://img.shields.io/badge/Tests-19%2F19%20Passing-brightgreen)](test_runner.ts)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

**JalSeva** is an independent, student-developed software engineering research prototype designed to explore a unified web-based architecture for municipal water supply scheduling, civic grievance redressal, emergency potable tanker booking, and cross-departmental coordination.

> **Academic Prototype & Research Disclaimer**:  
> **JalSeva** is an independent academic research and engineering prototype developed for scholarly evaluation. It is **not** an official municipal application, has **not** been commissioned, endorsed, or deployed by the Mira-Bhayandar Municipal Corporation (MBMC), and does **not** connect to physical municipal telemetry or government servers. All municipal statistics, ward populations, and telemetry figures are illustrative demo models for research evaluation.

---

## 🌐 2. Live Demo and Screenshots

- **Live Application Demo:** [https://jal-seva-seven.vercel.app/](https://jal-seva-seven.vercel.app/)
- **Source Code Repository:** [https://github.com/adarshshrawan5/JalSeva](https://github.com/adarshshrawan5/JalSeva)

*Notice: The live demo is hosted for peer review, academic evaluation, and functional demonstration. It operates on demonstrative baseline datasets and must not be used as an official municipal emergency service.*

### Portal Previews

| View | Screenshot / Asset | Workflow Description |
|---|---|---|
| **Public Landing & Timetables** | ![Homepage Hero](public/images/hero_water_infrastructure.jpg) | Ward-level water release timetables, public notices, and civic grievance submission. |
| **Municipal Grievance Dashboard** | ![Water Testing & Operations](public/images/card_water_testing_lab.jpg) | Interactive grievance tracking timeline (`Pending` → `Assigned` → `In Progress` → `Resolved`). |
| **Emergency Tanker Fleet Dispatch** | ![Tanker Fleet Dispatch](public/images/card_tanker_fleet.jpg) | Emergency tanker booking, nearest-depot routing via Haversine formula, and driver dispatch. |
| **Driver Handover & OTP Verification** | `Driver Verification Portal` | Interactive delivery mapping, recipient address details, and 4-digit PIN verification. |
| **Administrative Control Center** | `Admin Overview Dashboard` | Outage advisory authoring, technician workload balancing, and zonal supply schedules. |

---

## 📖 3. Overview, Objectives, and Research Methodology

### Problem Addressed
In rapidly urbanizing satellite cities across India, municipal potable water is distributed through scheduled, intermittent valve releases rather than 24/7 pressurized mains. This operational model often results in:
1. **Information Asymmetry**: Citizens lack advance visibility into valve timing shifts, low-pressure zones, and localized pipe-burst outages.
2. **Fragmented Redressal**: Water grievances (contamination, low pressure, illegal booster suction) are logged across disjointed manual channels without verifiable tracking.
3. **Emergency Tanker Inefficiencies**: Bottlenecks in emergency tanker allocation lead to opaque distribution, non-standardized delivery handovers, and duplicate bookings.
4. **Field Coordination Gaps**: Municipal field plumbers and repair teams lack unified digital job boards to claim work and record diagnostic findings on-site.

### Research Objectives
The primary purpose of **JalSeva** is to design, implement, and evaluate a lightweight, progressive web architecture addressing these civic challenges:

1. **Dual-Layer Persistence Architecture**: Evaluate the reliability of combining instantaneous client-side browser caching (`localStorage`) with asynchronous, server-enforced cloud persistence (**Google Cloud Firestore**).
2. **Deterministic Redressal State Machine**: Model a full civic grievance lifecycle (`Pending` → `Assigned` → `In Progress` → `Resolved` → `Reopened`) with bi-directional technician assignment and citizen validation.
3. **Geospatial Depot Allocation**: Implement algorithmic dispatch utilizing the Haversine formula to assign the nearest municipal depot with active tanker capacity.
4. **Cryptographic Delivery Handover**: Validate delivery integrity through a randomly generated 4-digit numeric One-Time Password (OTP) required for status progression.
5. **Role-Based Access Control (RBAC) in NoSQL**: Formulate declarative Firestore security rules (`firestore.rules`) enforcing least-privilege document access, citizen profile privacy, and defense against privilege escalation.
6. **Failure Transparency in Client UI**: Prevent deceptive UI confirmations by explicitly tracking `'synced'` vs `'failed'` cloud write states with visual alerts upon rule rejections.
7. **Comprehensive Automated Verification**: Validate core domain logic, boundary constraints, deduplication, and security rules through automated test suites.

### Research Methodology
- **Design Science Research (DSR)**: The application was engineered using an iterative prototyping methodology, establishing requirements from standard Indian urban municipal frameworks (CPHEEO guidelines).
- **Headless Automated Verification**: Built-in automated test suite (`test_runner.ts`) executed headless via `tsx` to verify domain constraints, state transitions, and error traps independently of browser DOM rendering.
- **Controlled Evaluation Environment**: Separation of simulated sensory hardware from genuine cloud database transactions to ensure transparency in academic reporting.

---

## 👥 4. Features and User Roles

```
                      ┌──────────────────────────────────────┐
                      │          JalSeva Ecosystem           │
                      └──────────────────┬───────────────────┘
         ┌───────────────────┬───────────┴───────────┬───────────────────┐
         ▼                   ▼                       ▼                   ▼
┌─────────────────┐ ┌─────────────────┐     ┌─────────────────┐ ┌─────────────────┐
│ Citizen Portal  │ │ Driver Portal   │     │ Worker Portal   │ │ Admin Portal    │
│ - Timetables    │ │ - Itineraries   │     │ - Job Claiming  │ │ - Schedules     │
│ - Grievances    │ │ - Leaflet Map   │     │ - Field Diag    │ │ - Outage Alerts │
│ - Tanker Orders │ │ - OTP Check     │     │ - Labor/Parts   │ │ - Workload Bal  │
│ - Tariff Calc   │ │ - Fulfillment   │     │ - Resolution    │ │ - Telemetry UI  │
└─────────────────┘ └─────────────────┘     └─────────────────┘ └─────────────────┘
```

### 👤 1. Citizen Portal
- **Supply Schedules**: Access ward-level valve release hours (morning and evening distribution windows).
- **Grievance Docket**: Register geotagged tickets with issue classification (Leakage, Contamination, Low Pressure, Theft), location, and optional photo attachment encoding.
- **Ticket Tracking**: Inspect real-time status progression, assigned worker details, and resolution history.
- **Emergency Potable Tanker Booking**: Request emergency water delivery restricted to valid operational windows (Today and Tomorrow) with duplicate order prevention.
- **Delivery PIN Generation**: Automatic issuance of a secure 4-digit OTP to present to the driver upon delivery.
- **Consumption Analytics**: Log self-meter readings and review consumption trends via interactive area charts.
- **Telescopic Billing Calculator**: Calculate residential slab-based tariffs with sewerage surcharge and meter rent.

### 🚚 2. Tanker Driver Portal
- **Dispatch Itinerary**: View allocated tanker delivery orders filtered by vehicle registration.
- **Geographic Navigation**: Review mapped delivery coordinates on interactive Leaflet/OpenStreetMap canvases.
- **OTP Delivery Handover**: Authenticate drop-off by validating the citizen's 4-digit delivery PIN before transitioning orders to `Delivered`.
- **Fleet Availability**: Report vehicle capacity status and trip completion.

### 🛠️ 3. Field Worker / Technician Portal
- **Assigned Work Queue**: Review assigned municipal water pipeline complaints and emergency repair requests.
- **On-Site Diagnostics**: Log resolution field reports, including labor hours, replacement components, and tested water pressure.
- **First-Come Job Claiming**: Claim unassigned broadcast complaints with automated workload accounting.

### 🏢 4. Administrative Control Center
- **Service Schedule Management**: Update ward supply schedules (morning and evening distribution hours).
- **Outage Alert Broadcast**: Author and publish public emergency water outage advisories.
- **Workload Balancing**: Reassign grievance tickets and coordinate field worker assignments.
- **Zonal Telemetry Dashboard**: Monitor demonstrative reservoir levels, distribution pressure, and grievance metrics.

---

## 🛠️ 5. Technology Stack and Architecture

### Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Client Core** | React | 19.x | Component-driven declarative UI architecture |
| **Language** | TypeScript | 5.x | Static typing, interface contracts, and compile-time safety |
| **Build Tool** | Vite | 6.x | Fast HMR and optimized production bundling |
| **Styling** | Tailwind CSS | v4 | Utility-first responsive design system |
| **Visualizations**| Recharts | 3.x | Telescopic tariff and consumption charts |
| **Mapping & GIS** | Leaflet & OSM | 1.9.x | Interactive open-source spatial maps |
| **Google Maps** | `@vis.gl/react-google-maps` | 1.x | Demonstration mapping with quota error traps |
| **Cloud Database**| Google Cloud Firestore | SDK v13 | Scalable NoSQL document database (Named DB ID) |
| **Authentication**| Firebase Auth | SDK v13 | Client-side Google OAuth session management |
| **Client Storage**| Browser `localStorage` | Web API | Zero-latency local caching and offline resilience |

### System Architecture Diagram

```
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

### Data Flow & Dual-Layer Persistence

1. **Write Sequence**:
   - The user submits an action (e.g., grievance ticket, tanker booking).
   - Form fields undergo client-side validation against strict schema constraints.
   - `storageService.ts` writes the record immediately to `localStorage` and emits an update event to refresh UI components without latency.
   - Concurrently, `firebaseService.ts` executes an asynchronous write (`setDoc` / `addDoc`) to Cloud Firestore.
   - If the write succeeds, the record's metadata is tagged as `cloudSyncStatus: 'synced'`.
   - If the write fails (e.g., security rule violation or offline state), the error is intercepted, logged, and stored as `cloudSyncStatus: 'failed'` with the exact error message.
2. **Read & Hydration Sequence**:
   - On application startup or user authentication, `storageService.ts` serves cached data immediately.
   - Upon successful Firebase login, `firebaseService.ts` queries Firestore for records matching the user's role and identity.
   - Retrieved cloud documents are merged into the local cache using a deduplication filter (`TC-15`) to prevent duplicate list entries.

### Separation: Implemented Workflows vs. Simulated Features

To preserve academic integrity, the following matrix explicitly contrasts functional code modules from simulated components:

| Feature / Module | Architecture Status | Implementation Mechanism |
|---|---|---|
| **Citizen Grievance Docket** | **Implemented** | Validated forms, deterministic IDs (`CMP...`), timeline progression, and Firestore synchronization. |
| **Emergency Tanker Booking** | **Implemented** | Date validation (Today/Tomorrow), Haversine depot allocation, duplicate check, and Firestore persistence. |
| **Delivery OTP Handover** | **Implemented** | 4-digit cryptographic OTP generation; driver completion strictly gates on exact match. |
| **Dual-Layer Persistence** | **Implemented** | Synchronous `localStorage` caching + asynchronous Firestore `setDoc`/`addDoc` sync. |
| **Write Failure Transparency** | **Implemented** | Tracks `'synced'` vs `'failed'` states; alerts user if a write was retained locally but rejected by cloud rules. |
| **Cloud-to-Local Hydration** | **Implemented** | Authenticated session start queries Firestore and merges cloud records without duplicate creation. |
| **Telescopic Tariff Formula** | **Implemented** | Computes slab brackets (0–15 kL @ ₹6.50, 16–30 kL @ ₹10.00, >30 kL @ ₹16.00) + 20% cess + ₹40 meter rent. |
| **Vehicle Fleet Movement** | **Simulated** | Fleet vehicle GPS transit is simulated via polyline coordinate interpolation; no physical GPS hardware. |
| **Citizen SMS / Push Notices** | **Simulated** | Rendered via in-app UI modal dialogues; no external telecom carrier gateway (DLT) integrated. |
| **Reservoir / Pressure SCADA** | **Simulated** | Client-side mathematical oscillation loops (`setInterval`); no physical RTU/Modbus hardware. |
| **UPI Payment / Receipts** | **Simulated** | Demonstrative UPI QR modal and mock receipt generator; no banking aggregator (e.g. Razorpay) API integrated. |

---

## 🚀 6. Installation and Configuration

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**

### Step 1: Clone Repository
```bash
git clone https://github.com/adarshshrawan5/JalSeva.git
cd JalSeva
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Firebase Configuration
The web client initializes using public Firebase API configuration keys (`firebase-applet-config.json`):
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

### Step 4: Run Type Checks and Test Suite
```bash
# Verify TypeScript type definitions and syntax
npm run lint

# Run automated functional and regression test suite
npm test
```

### Step 5: Launch Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` (or the port specified by Vite in your terminal).

### Step 6: Build Production Bundle
```bash
npm run build
```

---

## 🧪 7. Testing, Verification, and Limitations

### Automated Test Coverage (19/19 Passing)
Automated functional verification is executed via `tsx test_runner.ts` (`npm test`):

| Test Case | Functional Scope | Expected Behavior | Actual Result |
|---|---|---|---|
| **TC-01** | Grievance Creation | Formatted ticket ID (`CMP...`), initial `Pending` status | **PASS** |
| **TC-02** | Grievance Retrieval | Query ticket by ID from storage layer | **PASS** |
| **TC-03** | Tanker Booking Creation | Formatted booking ID (`TNK...`), 4-digit numeric OTP generation | **PASS** |
| **TC-04** | Tanker Date Validation | Restrict delivery dates strictly to Today and Tomorrow | **PASS** |
| **TC-05** | Browser Refresh Cache | Local persistence of complaints/bookings across reload simulation | **PASS** |
| **TC-06** | Outage Alert Lifecycle | Alert publication and transition to `Resolved` | **PASS** |
| **TC-07** | Water Zone Schedules | Update morning/evening supply distribution hours | **PASS** |
| **TC-08** | Complaint Broadcast | Admin broadcast of unassigned tickets to worker pool | **PASS** |
| **TC-09** | First-Come Job Claim | Technician job claim and active workload incrementation | **PASS** |
| **TC-10** | Worker Reassignment | Citizen rejection resets ticket to `Pending` and decrements load | **PASS** |
| **TC-11** | OTP Handover Validation | Incorrect OTP rejected; correct OTP transitions order to `Delivered` | **PASS** |
| **TC-12** | GIS Quota Error Trap | Capture `gmp-quota-exceeded` event gracefully | **PASS** |
| **TC-13** | Firestore Write Failure | Record `cloudSyncStatus: 'failed'` on `PERMISSION_DENIED` | **PASS** |
| **TC-14** | Firestore Write Success | Record `cloudSyncStatus: 'synced'` on successful write | **PASS** |
| **TC-15** | Hydration Deduplication | Remote cloud records merged without creating duplicate keys | **PASS** |
| **TC-16** | Duplicate Booking Guard | Block duplicate tanker order on same phone and date | **PASS** |
| **TC-17** | RBAC Escalation Guard | Allow citizen/worker roles; block self-promotion to `admin` | **PASS** |
| **TC-18** | Outage Authorization Guard | Block non-admins from publishing emergency advisories | **PASS** |
| **TC-19** | Citizen Cloud Profile Sync | User registration triggers profile sync with role `citizen` | **PASS** |

### Academic Research Limitations
1. **Prototype Non-Deployment**: The application is an academic software prototype and has not undergone municipal security accreditation, privacy impact assessment (PIA), or high-concurrency field load testing.
2. **Administrative Role Verification**: In the current security rules blueprint, administrator verification references an admin email fallback alongside `/admins/` document lookups. A production municipal deployment requires migration to enterprise Firebase Auth Custom Claims.
3. **Hardware Simulation**: Reservoir levels, water pressures, and fleet locations operate on client-side simulation intervals rather than physical IoT edge gateways (Modbus, LoRaWAN).
4. **Offline Synchronization Conflict Strategy**: Multi-device offline synchronization currently adopts an append-latest strategy rather than a distributed conflict-free replicated data type (CRDT) or vector clock.
5. **Simulated Integrations**: SMS notifications and UPI payment flows are simulated in the UI and do not initiate real telecom transmissions or financial transactions.

---

## 🤝 8. Contribution, License, and Author

### Contributing
Contributions, suggestions, and academic review are welcome.

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/enhanced-offline-sync`).
3. Ensure all tests and lint checks pass (`npm test && npm run lint`).
4. Commit your changes with descriptive messages.
5. Submit a pull request detailing the modifications.

*Please ensure no personal citizen data, production database credentials, or secret keys are committed.*

### License
This project is open-source software licensed under the **[Apache License 2.0](LICENSE)**.

### Author & Academic Profile

**Adarsh Yadav**  
Student Researcher & Developer | Information Technology  
GitHub: [@adarshshrawan5](https://github.com/adarshshrawan5)  
Email: `adarshshrawan5@gmail.com`

---

*JalSeva is an academic software engineering prototype developed to explore digital approaches to water-supply information management, citizen grievance workflows, and cloud persistence.*

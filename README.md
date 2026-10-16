# 💧 JalSeva (जलसेवा)

### Municipal Water Supply & Grievance Management System
**Mira-Bhayandar Municipal Corporation (MBMC) • Water Supply & Sewerage Department**

---

## 📌 Project Overview

**JalSeva** is a digital civic portal engineered for the **Mira-Bhayandar Municipal Corporation (MBMC)**, serving over 800,000 residents across 4 administrative zones and 79 localized sub-areas. 

The application bridges citizens, field engineers, and emergency tanker drivers into a unified municipal workflow:
- **Citizens** monitor real-time distribution schedules, submit grievance dockets with photo attachments, book emergency potable tankers with OTP-verified handovers, log optical meter readings, and inspect monthly consumption trends via Recharts.
- **Tanker Drivers** receive dispatch assignments, navigate depot-to-consumer routes on interactive maps, verify 4-digit delivery handshake OTPs, and update delivery statuses.
- **Municipal Administrators** broadcast emergency outage bulletins, manage ward supply timetables, assign field plumbers to complaints with live workload balancing, track tanker fleet logistics (Kanban dispatch board), and inspect system telemetry.

---

## 🔗 Deployments & Repository

| Resource | URL |
|---|---|
| **Production Application** | [https://ais-pre-3qwpih5actl2tud5iwcbh7-372840170243.asia-southeast1.run.app](https://ais-pre-3qwpih5actl2tud5iwcbh7-372840170243.asia-southeast1.run.app) |
| **Development URL** | [https://ais-dev-3qwpih5actl2tud5iwcbh7-372840170243.asia-southeast1.run.app](https://ais-dev-3qwpih5actl2tud5iwcbh7-372840170243.asia-southeast1.run.app) |
| **GitHub Repository** | [https://github.com/adarshshrawan5/JalSeva](https://github.com/adarshshrawan5/JalSeva) |
| **Maintainer** | **Adarsh Yadav** (`adarshshrawan5@gmail.com`) |

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS v4, Lucide React icons
- **Data Visualizations**: Recharts 3.x (`AreaChart`, `BarChart`, `ResponsiveContainer`, `Tooltip`)
- **GIS & Mapping**: Leaflet 1.9, OpenStreetMap tile servers, Haversine geospatial distance calculations
- **Backend & Cloud Database**:
  - **Firebase Firestore**: Real-time persistent document database (`ai-studio-aquaconnectmbmcd-ed48ea96-a122-4654-9e0e-577010d583d8`)
  - **Firebase Authentication**: Google OAuth provider and verified session token handling
  - **Security Architecture**: Attribute-Based Access Control (ABAC) in `firestore.rules` preventing path injection, Denial-of-Wallet payloads, and unauthorized state mutation
  - **Intermediate Schema**: Validated `firebase-blueprint.json` schema definitions
  - **Offline Fallback**: Resilient LocalStorage reactive synchronization via custom event bus

---

## 🚀 Key Functional Modules

### 1. Water Consumption & Meter Analytics Dashboard (`WaterConsumptionDashboard.tsx`)
- **Usage Trends**: Dual-axis `AreaChart` plotting monthly consumption in kiloliters (kL) and liters with threshold reference lines for subsidized domestic quota (15 kL) and standard residential cap (30 kL).
- **Telescopic Tariff Assessment**: `BarChart` calculating bills based on official MBMC slab rates:
  - Slab 1 (0–15 kL): ₹6.50/kL
  - Slab 2 (16–30 kL): ₹10.00/kL
  - Slab 3 (>30 kL): ₹16.00/kL
  - Sewerage Cess: 20% surcharge
  - Meter Service Rent: ₹40.00 fixed charge
- **Benchmarking Indicators**:
  - Month-over-month consumption percentage variance.
  - Per-capita daily consumption (LPCD) evaluated against the CPHEEO urban baseline (135 LPCD).
  - Bill breakdown modal with itemized tariff dockets.
- **Optical Dial Reader Integration**: Synchronized with the Citizen Self-Meter Reader component; any logged dial reading updates the chart and local database immediately.

### 2. Emergency Water Tanker Booking & Fleet Dispatch
- **Strict Schedule Restrictions**: Bookings are restricted to **Today or Tomorrow** only.
- **Geospatial Depot Routing**: Calculates Haversine distances to the 4 municipal depots (*Kharigaon Central, Sector 4 Mira Road, Subhash Nagar, Uttan*), auto-assigning the closest depot with available vehicle stock.
- **Housing Society (CHS) Bulk Ordering**: Allows Cooperative Housing Societies to book fleet deliveries (up to 50,000L) with registration registration proofs and staggered dispatch intervals.
- **Handover Security**: Generates a cryptographically random 4-digit Delivery OTP required by the driver to complete the order.
- **Live Fleet Tracking**: Displays moving truck coordinates, driver contact details, vehicle registration, and estimated arrival times on an interactive Leaflet map.

### 3. Grievance Redressal Desk & Smart Field Worker Dispatch
- **Incident Categorization**: Pipeline Leaks, Contaminated Water, Low Pressure, Supply Outages, Water Logging, Dirty Water, and Meter Faults.
- **Admin Smart Matching**: Recommends certified plumbers and water quality specialists based on issue type (e.g. Pipeline & Valve specialists for leaks; Water Quality technicians for turbidity and contamination).
- **Active Deployments Roster**: Dedicated dashboard section tracking which technician is currently deployed on which citizen ticket in real time.
- **Lifecycle Tracking**: Ticket state machine (`Pending` → `Assigned` → `In Progress` → `Resolved` → `Reopened`) with field worker assignment, audit notes, resolution timestamping, and 5-star citizen ratings.

### 4. Field Worker & Plumber Portal (`WorkerDashboard.tsx`)
- **Direct Grievance Dispatch**: Technicians view assigned citizen tickets with live phone dialer, address landmarks, and citizen photo evidence.
- **Trip & Repair Execution**: Single-tap actions to update job status (`Start Travel (En Route)` → `Arrived on Site & Begin Repair`).
- **Technical Work Analysis Docket (`WorkAnalysisModal.tsx`)**:
  - Root-cause diagnosis documentation
  - Hardware & spare parts tracking (e.g., HDPE pipe sleeves, CPVC valves, Teflon seals)
  - Chemical potability and water pressure assay readings (PPM, pH, Turbidity)
  - Base municipal labor fee + parts cost calculation
- **Citizen Service Settlement & Payment Handshake**: Citizens settle the technician's service fee directly via **UPI QR Code**, Cash on site, or Card, with instant generation of an official MBMC e-Receipt.

### 5. Supply Timetable & Outage Broadcasts
- **Hierarchy Navigation**: 4 Municipal Zones → 79 Local Sub-Areas → Street Localities.
- **Supply Countdown**: Real-time countdown timer to the next scheduled valve release.
- **Administrative Broadcaster**: Emergency pipeline maintenance notices with start/end windows, affected ward tags, and simulated SMS/Push alert dispatch.

### 6. Multi-Role Authentication & Access Control
- **Citizen Access**: Phone/name profile login or 1-click Google Sign-In via Firebase Auth.
- **Fleet Driver Access**: Vehicle number and 4-digit PIN authentication with dedicated dispatch queue.
- **Field Worker & Plumber Access**: Technician ID / Phone and 4-digit PIN (`1234`) with dedicated mobile-responsive repair console.
- **Municipal Administrator Access**: Role-based access (`Super Admin`, `Zone Manager`, `Field Officer`) with timetable editors, grievance consoles, and staff rosters.

---

## 📂 Project Directory Structure

```
├── .env.example
├── index.html                        # HTML entry point with JalSeva meta tags
├── metadata.json                     # Applet capabilities & runtime configuration
├── package.json
├── tsconfig.json
├── vite.config.ts
├── firebase-applet-config.json       # Firebase SDK configuration
├── firebase-blueprint.json           # Intermediate Representation (IR) schema
├── firestore.rules                   # Zero-Trust Firestore Security Rules
├── firestore.rules.test.ts           # Rules test suite validating adversarial payloads
├── security_spec.md                  # Security specification & Dirty Dozen payload tests
├── README.md
├── src/
│   ├── main.tsx                      # Application entry point
│   ├── App.tsx                       # Root view router & multi-role orchestration
│   ├── firebase.ts                   # Firebase App, Firestore, Auth, & error handler
│   ├── index.css                     # Tailwind CSS v4 styling & dark theme definitions
│   ├── types/
│   │   └── index.ts                  # TypeScript definitions (Complaints, Bookings, MeterLogs)
│   ├── data/
│   │   └── mbmcData.ts               # MBMC geographic zones, depots, initial records
│   ├── services/
│   │   ├── storageService.ts         # Central storage engine, reactive dispatcher & cache
│   │   ├── firebaseService.ts        # Firestore document sync & real-time snapshot listeners
│   │   └── distanceService.ts        # Haversine distance, depot allocation & ETA calculation
│   ├── context/
│   │   ├── AuthContext.tsx           # Firebase authentication context
│   │   ├── ThemeContext.tsx          # Dark / Light theme provider
│   │   └── LanguageContext.tsx       # English / मराठी / हिंदी localization
│   └── components/
│       ├── common/
│       │   ├── JalSevaLogo.tsx       # Brand logo component
│       │   ├── Navbar.tsx            # Navigation header with portal toggles
│       │   ├── Footer.tsx            # Municipal footer with links & helpline numbers
│       │   ├── LeafletMapView.tsx    # Leaflet OpenStreetMap wrapper
│       │   ├── ProfileModal.tsx      # Profile modal with embedded usage analytics
│       │   └── MainLandingPage.tsx   # Gateway landing page
│       ├── citizen/
│       │   ├── CitizenLogin.tsx      # Citizen login with Google Sign-In integration
│       │   ├── CitizenHome.tsx       # Citizen home dashboard with consumption trends
│       │   ├── WaterConsumptionDashboard.tsx # Recharts usage & telescopic billing dashboard
│       │   ├── WaterMeterReader.tsx  # Self-meter optical dial reader
│       │   ├── ScheduleTracker.tsx   # Ward timetable countdown & GPS locator
│       │   ├── ComplaintForm.tsx     # 4-step grievance registration wizard
│       │   ├── ComplaintTracker.tsx  # Grievance docket timeline & rating
│       │   ├── TankerBookingForm.tsx # Emergency tanker booking system
│       │   ├── TankerTracker.tsx     # Live GPS tanker tracking & OTP handshake
│       │   └── SupportSection.tsx    # Ward office directory & helpline
│       ├── driver/
│       │   ├── DriverLogin.tsx       # Fleet driver authentication
│       │   └── DriverDashboard.tsx   # Route navigation & delivery confirmation
│       └── admin/
│           ├── AdminLogin.tsx        # Administrative authentication
│           ├── AdminLayout.tsx       # Admin sidebar & workspace shell
│           ├── AdminDashboardHome.tsx# Telemetry statistics & zone load meters
│           ├── AdminBroadcastManager.tsx # Outage notice publisher
│           ├── AdminScheduleManager.tsx  # Zone timetable editor
│           ├── AdminComplaintsDesk.tsx   # Grievance dispatch & assignment desk
│           ├── AdminTankerManager.tsx    # Tanker dispatch Kanban board
│           └── AdminStaffManager.tsx # Field plumbers & fleet driver directory
```

---

## ⚡ Installation & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/adarshshrawan5/JalSeva.git
cd JalSeva
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Configuration
Ensure `firebase-applet-config.json` is present in the project root with valid Firebase credentials:
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

### 5. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### 6. Validate Build & Linting
```bash
# Type check with TypeScript
npm run lint

# Compile production bundle
npm run build
```

---

## 📤 Pushing Changes to GitHub

To push your local repository directly to your GitHub repository (`adarshshrawan5/JalSeva`):

```bash
# Verify git status
git status

# Stage all files
git add .

# Create a clean commit
git commit -m "feat: integrate Recharts consumption dashboard, Firebase Firestore & Google Auth"

# Configure branch and remote
git branch -M main
git remote set-url origin https://github.com/adarshshrawan5/JalSeva.git

# Push to GitHub
git push -u origin main
```

---

## 🔑 Test Credentials & Built-In Demo Accounts

### 1. Citizen Portal
- **Google Sign-In**: Click *"Sign In with Google Account"* on the resident login screen.
- **Mobile Number Login**: Any 10-digit number (e.g. `9820544123`).
- **Demo Accounts**:
  - `9820544123` - Sunil Merchant (Jesal Park, Bhayandar East)
  - `9820123456` - Rajesh Kumar (Golden Nest, Bhayandar East)
  - `9870188992` - Fatima Shaikh (Naya Nagar, Mira Road East)
  - *Guest Mode available without credentials.*

### 2. Fleet Driver Dashboard
- **Rahul**: Vehicle `MH-04-RH-8821` | Depot: Kharigaon Central | PIN: `1234`
- **Mahesh Jadhav**: Vehicle `MH-04-CD-5678` | Depot: Mira Road Sec 4 | PIN: `1234`
- **Suresh Patil**: Vehicle `MH-04-EF-9012` | Depot: Bhayandar West | PIN: `1234`
- **Francis Fernandes**: Vehicle `MH-04-GH-3456` | Depot: Uttan Coastal | PIN: `1234`

### 3. Field Worker & Plumber Portal
- **Suresh Patil** (`wrk-1`): Phone: `9820511984` | Specialization: Pipeline & Valve | PIN: `1234`
- **Deepak Salvi** (`wrk-4`): Phone: `9821944321` | Specialization: Water Quality & Chemical | PIN: `1234`
- **Manoj Kamble** (`wrk-2`): Phone: `9819166520` | Specialization: Motor & Pump | PIN: `1234`
- **Dinesh Yadav** (`wrk-3`): Phone: `9833822109` | Specialization: General Plumber | PIN: `1234`
- **Prashant More** (`wrk-5`): Phone: `9819077412` | Specialization: Pipeline & Valve | PIN: `1234`
- *Quick 1-tap profile selection available on worker login screen.*

### 4. MBMC Admin Console
- **Super Administrator**: `adarsh.yadav@mbmc.gov.in` (Employee ID: `MBMC-WTR-001`, PIN/Pass: `mbmc@2026`)
- **Zone Manager**: `zonemanager@mbmc.gov.in` (Pass: `mbmc@2026`)
- **Field Officer**: `fieldofficer@mbmc.gov.in` (Pass: `mbmc@2026`)

---

## 🗺️ Municipal Coverage Matrix

| Zone ID | Zone Name | Marathi Name | Ward Coverage | Population | Primary Depot |
|---|---|---|---|---|---|
| **zone-1** | Bhayandar East | विभाग १: भाईंदर पूर्व | Wards 1, 2, 3, 4 | ~238,500 | Kharigaon Central Depot |
| **zone-2** | Bhayandar West | विभाग २: भाईंदर पश्चिम | Wards 5, 6, 7, 8 | ~186,200 | Subhash Nagar Depot |
| **zone-3** | Mira Road East | विभाग ३: मीरा रोड पूर्व | Wards 9, 10, 11, 12, 13 | ~298,400 | Sector 4 Auxiliary Depot |
| **zone-4** | Uttan Coastal | विभाग ४: उत्तन व सागरी विभाग | Wards 14, 15, 16 | ~86,278 | Uttan Coastal Depot |

---

## 📄 License

This project is licensed under the **Apache License 2.0**.  
Developed for the **Mira-Bhayandar Municipal Corporation (MBMC)**.

# 💧🤝 JalSeva (जलसेवा)

### Digital Water Supply Management Portal for Mira-Bhayandar Citizens
**Mira-Bhayandar Municipal Corporation (MBMC) • Department of Water Supply & Sewerage**

> *"आपका पानी, आपकी सेवा - हर बूंद मायने रखती है"*  
> *(Your Water, Your Service — Every Drop Matters)*

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-OpenStreetMap-199900.svg)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

---

## 📖 Executive Summary

**JalSeva (जलसेवा)** is a full-stack digital municipal bridge connecting **809,378 residents** of Mira-Bhayandar with municipal water supply authorities, field engineers, and emergency tanker drivers.

The platform provides a unified **Gateway Landing Page** routing users into three dedicated operational dashboards:
1. 👤 **Citizen Dashboard**: Real-time water supply schedules across 79 localities, strict Today/Tomorrow emergency tanker booking with live GPS tracking, online complaint redressal with 48h SLA, and interactive ward directory.
2. 🚚 **Tanker Driver Dashboard**: Assigned trip queues, turn-by-turn route navigation from depot to citizen address, direct citizen call integration, and 1-tap *"In Transit"* & *"Delivered"* trip completion.
3. 🛡️ **MBMC Admin Command Console**: Emergency outage broadcast manager with push/SMS simulation, zone timetable grid with batch updates and audit trails, master grievance desk with plumber dispatch, and a live Kanban tanker dispatch board.

---

## 🚀 Core Modules & Capabilities

### 1. 🌐 Public Landing Page & Role Gateway
- **Multi-Role Entry Point**: Direct 1-click access to **Citizen Portal**, **Driver Dashboard**, and **Admin Console**.
- **Live Emergency Outage Ticker**: Real-time scrolling banner highlighting active pipeline breaks, repair timelines, and alternative arrangements.
- **City Telemetry Dashboard**: Real-time indicators showing **142.5 MLD** supplied from Surya & MIDC Jambhul sources, active complaints, completed tanker trips, and citizens served.
- **Quick 4-Zone Schedule Lookup**: Rapid morning and evening timing preview for Bhayandar East, Bhayandar West, Mira Road East, and Uttan Coastal Zone.
- **24x7 Helplines**: Toll-free control room direct dialing (`1800-22-2026` / `022-2819 2828`).

---

### 2. 👤 Citizen Portal
- **Area-Wise Schedule & Outage Tracker**:
  - Covers **4 Municipal Zones** across **79 sub-areas** and distinct localities.
  - **3-Level Hierarchy Navigation**: Zone → Sub-Area → Locality.
  - **Daily Timing Cards** & **7-Day Weekly Grid View**.
  - **Live Supply Countdown Timer**: *"Next water release in X hours Y minutes"*.
  - **📍 Live Location Detection**: Uses browser Geolocation API to auto-detect citizen GPS coordinates, compute nearest municipal area/zone, display accuracy indicators (e.g. `±45m`), and center the interactive OpenStreetMap.
  - **Color-Coded Outage Statuses**: 🔴 Red (Emergency Outage), 🟡 Yellow (Planned Maintenance), 🟢 Green (Normal Supply).
- **Water Tanker Booking System (Custom Features)**:
  - **Strict Date Restriction Logic**: Enforced via JavaScript and date boundaries strictly to **Today or Tomorrow only** (`min={today}` & `max={tomorrow}`).
  - **9 Daily Time Slots**: 06:00–08:00 through 22:00–23:59 with real-time remaining slot capacity counters.
  - **Capacity Options**: 5,000 Liters, 10,000 Liters (standard), and 15,000 Liters.
  - **Distance-Based Auto Assignment**: Employs the **Haversine formula** to calculate great-circle distances across all 4 MBMC depots (*Kharigaon Central, Sector 4 Mira Rd, Subhash Nagar, Uttan*), selects the nearest available depot, computes transit ETA (`(Dist/30)*1.5 + 0.17` hrs), and plots route polylines.
  - **Digital Receipt Modal**: Official municipal water docket with **scannable SVG QR Code**, printable view, and driver details.
  - **Live Moving Tanker Tracking**: Real-time moving truck simulation along the delivery route with driver details and call button.
- **Online Complaint Redressal Desk**:
  - **4-Step Wizard**: Contact details, GPS-assisted area detection, 10 predefined categories (*Low Pressure, No Water, Pipeline Leak, Contaminated Water, Dirty Water, Water Logging, Meter Issue, etc.*) with auto-assigned priority, photo upload with preview, and review screen.
  - Generates unique Docket ID (`CMPYYYYMMDDNNN`) with simulated SMS confirmation.
  - **Visual Status Timeline**: 📝 Registered → 👨‍🔧 Assigned → 🔧 In Progress → ✅ Resolved with timestamped logs, worker contact, reopen option, and 5-star rating.
- **Support & Ward Directory**: Contact details for all 4 Zonal Ward Offices, FAQ accordion, and executive suggestion submission form.

---

### 3. 🚚 Tanker Driver Dashboard
- **Authorized Driver Profiles**: Quick 1-click driver presets (*Ramesh Kumar, Mahesh Jadhav, Suresh Patil, Francis Fernandes*) or sign-in via vehicle registration number + 4-digit security PIN.
- **Active Trip Showcase**: Real-time card showing delivery recipient name, mobile number (click-to-call `tel:` link), complete address, landmark, and requested volume.
- **Turn-by-turn Navigation Map**: Interactive Leaflet route map showing origin depot, live tanker position, and citizen destination.
- **Trip Status Controls**:
  - 🚀 **"Start Navigation / Mark In Transit"**: Updates booking status in real-time, activating the moving truck icon on the citizen's live tracking screen.
  - ✅ **"Confirm Water Delivered"**: Completes trip, updates driver delivery counters, and records delivery timestamp.
- **Trip Queue & History**: Review upcoming scheduled deliveries for today and tomorrow.

---

### 4. 🛡️ MBMC Admin Command Center
- **Role-Based Access Control**: Presets for **Super Admin** (*Er. Ramesh Sawant*), **Zone Manager** (*Er. Sachin Patil*), and **Field Officer** (*Suresh Patil*).
- **Operations Dashboard**: 6 key metric counters, zone load distribution bar charts, and live activity stream.
- **Broadcast & Outage Manager**: Create and publish emergency pipeline burst notices or planned maintenance with multi-zone selection, start/end datetimes, priority levels, live ticker sync, and instant push/SMS broadcast simulator.
- **Schedule Manager**: Zone-by-zone timetable configuration with 15-minute intervals, **Batch Update ("Apply to All Zones")**, and immutable audit log.
- **Complaint Resolution Desk**: Master table with multi-filters, detail inspection modal, field plumber assignment with active workload metrics, status transition workflow (*Pending → Assigned → In Progress → Resolved* with mandatory resolution notes), and CSV export.
- **Tanker Dispatch Manager**: Dual view switcher (**Table Log** vs **Kanban Board**: *Pending Approval → Approved → In Transit → Delivered*), driver vehicle assignment modal, and delivery confirmation.
- **Reports & Analytics**: Visual charts for grievances by category, zone volume, tanker fleet utilization (86%), and response times.
- **Staff & Drivers**: Directory of certified field plumbers, tanker drivers, and depot managers.

---

### 5. 🌓 Theme System (Dark & Light Mode)
- Seamless switcher in the top navigation bar.
- Persisted in `localStorage`.
- High contrast, WCAG AA compliant colors, optimized for low-light night-time usage.

---

## 🏗️ Technical Architecture & Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 (Functional components, Hooks, Context API) |
| **Build Tool** | Vite 8 + ESBuild |
| **Language** | TypeScript (Strict typing across entities) |
| **Styling** | Tailwind CSS v4 (`@custom-variant dark`) |
| **Maps & GIS** | Leaflet.js 1.9 + OpenStreetMap tiles + Custom SVG Markers |
| **State & Persistence** | React Reactive State + Custom LocalStorage StorageService with Cross-Tab Event Dispatch |
| **Icons & Visuals** | Lucide React + Canvas Confetti |
| **Calculations** | Haversine Formula (GPS Distance in km) + City Speed & Prep ETA Model |

---

## 📁 Repository File Structure

```
├── .env.example
├── index.html                  # HTML entry point with JalSeva meta tags & Leaflet CSS
├── metadata.json               # Applet capabilities & permissions
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx                # React root bootstrap
│   ├── App.tsx                 # Core application controller & multi-role view routing
│   ├── index.css               # Tailwind CSS v4 configuration & theme transitions
│   ├── types/
│   │   └── index.ts            # Data models (Zones, Areas, Complaints, Tankers, Drivers, Depots)
│   ├── data/
│   │   └── mbmcData.ts         # Authentic MBMC dataset (4 zones, 79 areas, 4 depots, staff)
│   ├── services/
│   │   ├── storageService.ts   # Persistent reactive storage & strict date validations
│   │   └── distanceService.ts  # Haversine distance, ETA, and depot auto-routing
│   ├── context/
│   │   └── ThemeContext.tsx    # Persistent Dark / Light theme provider
│   └── components/
│       ├── common/
│       │   ├── JalSevaLogo.tsx       # Brand logo (💧 Blue Drop + 🤝 Orange Service Hand)
│       │   ├── Navbar.tsx            # Main top navigation with portal gateways
│       │   ├── Footer.tsx            # Municipal footer with 24x7 emergency contacts
│       │   ├── ThemeToggle.tsx       # Smooth Moon / Sun toggle
│       │   ├── AlertTicker.tsx       # Live emergency outage marquee banner
│       │   ├── Modal.tsx             # Reusable accessible dialog modal
│       │   ├── LeafletMapView.tsx    # Interactive Leaflet map with custom HTML markers
│       │   ├── ReceiptModal.tsx      # Official municipal receipt with SVG QR code
│       │   └── MainLandingPage.tsx   # Welcome landing page with 3 role login cards
│       ├── citizen/
│       │   ├── CitizenLogin.tsx      # 1-click resident sign-in & mobile login
│       │   ├── CitizenHome.tsx       # Citizen home dashboard with quick access cards
│       │   ├── ScheduleTracker.tsx   # 4-zone schedule, countdown timer & GPS auto-detect
│       │   ├── ComplaintForm.tsx     # 4-step grievance registration wizard
│       │   ├── ComplaintTracker.tsx  # Docket search & visual status journey
│       │   ├── TankerBookingForm.tsx # Strict Today/Tomorrow tanker booking with maps
│       │   ├── TankerTracker.tsx     # Live GPS moving tanker tracking
│       │   └── SupportSection.tsx    # Ward office directory & FAQ accordion
│       ├── driver/
│       │   ├── DriverLogin.tsx       # 1-click vehicle login for fleet drivers
│       │   └── DriverDashboard.tsx   # Active trip navigation, call citizen & delivery confirmation
│       └── admin/
│           ├── AdminLogin.tsx            # 1-click administrative role sign-in
│           ├── AdminLayout.tsx           # Administrative dashboard layout & sidebar
│           ├── AdminDashboardHome.tsx    # Operations KPI counters & zone load distribution
│           ├── AdminBroadcastManager.tsx # Outage notice publisher & push/SMS simulator
│           ├── AdminScheduleManager.tsx  # Timetable grid editor with batch update
│           ├── AdminComplaintsDesk.tsx   # Master grievance table & field plumber assignment
│           ├── AdminTankerManager.tsx    # Tanker dispatch Kanban board & driver assignment
│           ├── AdminAnalytics.tsx        # Charts & telemetry reports
│           └── AdminStaffManager.tsx     # Staff & driver directory
```

---

## ⚡ Getting Started (Local Development)

### 1. Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 2. Clone & Install
```bash
# Clone the repository
git clone https://github.com/your-username/jalseva-mbmc.git

# Navigate into the project directory
cd jalseva-mbmc

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` to interact with **JalSeva**.

### 4. Build for Production
```bash
npm run build
```

---

## 🔑 Demo Access Credentials

The application includes built-in **1-Click Demo Profiles** on each login screen for rapid evaluation:

### 👤 Citizen Portal
- **Sunil Merchant**: `9820544123` (Jesal Park, Bhayandar East — has active In Transit tanker delivery)
- **Rajesh Kumar**: `9820123456` (Golden Nest, Bhayandar East — has active Low Pressure complaint)
- **Fatima Shaikh**: `9870188992` (Naya Nagar, Mira Road East — has active Contamination complaint)
- *Or continue as Guest Resident without sign-in.*

### 🚚 Tanker Driver Dashboard
- **Ramesh Kumar**: Vehicle `MH-04-AB-1234` • Kharigaon Central Depot • 10,000L Capacity • ⭐ 4.9
- **Mahesh Jadhav**: Vehicle `MH-04-CD-5678` • Mira Road Sec 4 Depot • 10,000L Capacity • ⭐ 4.8
- **Suresh Patil**: Vehicle `MH-04-EF-9012` • Bhayandar West Depot • 15,000L Capacity • ⭐ 4.7
- **Francis Fernandes**: Vehicle `MH-04-GH-3456` • Uttan Coastal Depot • 5,000L Capacity • ⭐ 5.0
- *Default PIN: `1234`*

### 🛡️ MBMC Admin Console
- **Super Admin**: `superadmin@mbmc.gov.in` (*Er. Ramesh Sawant*, Superintending Engineer)
- **Zone Manager**: `zonemanager@mbmc.gov.in` (*Er. Sachin Patil*, Executive Engineer, Zone 1 & 2)
- **Field Officer**: `fieldofficer@mbmc.gov.in` (*Suresh Patil*, Field Supervisor)
- *Default Password: `mbmc@2026`*

---

## 🏢 Mira-Bhayandar Municipal Corporation (MBMC) Geographic Coverage

| Zone ID | Zone Name | Marathi Name | Ward Coverage | Population | Primary Depot |
|---|---|---|---|---|---|
| **zone-1** | Bhayandar East | विभाग १: भाईंदर पूर्व | Wards 1, 2, 3 & 4 | ~238,500 | Kharigaon Central Water Depot |
| **zone-2** | Bhayandar West | विभाग २: भाईंदर पश्चिम | Wards 5, 6, 7 & 8 | ~186,200 | Bhayandar West Subhash Nagar Depot |
| **zone-3** | Mira Road East | विभाग ३: मीरा रोड पूर्व | Wards 9, 10, 11, 12 & 13 | ~298,400 | Mira Road Sector 4 Auxiliary Depot |
| **zone-4** | Uttan & Coastal Zone | विभाग ४: उत्तन व सागरी विभाग | Wards 14, 15 & 16 | ~86,278 | Uttan Coastal Auxiliary Depot |

---

## 📜 License & Intellectual Property

This project is licensed under the **Apache License 2.0**.  
Developed for the **Mira-Bhayandar Municipal Corporation (MBMC) Water Supply & Sewerage Department**.

*JalSeva (जलसेवा) — Dedicated to providing clean, predictable, and transparent water supply services to every resident of Mira-Bhayandar.*

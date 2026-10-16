# JalSeva: Hardware and Software Requirements Specification

This document provides a comprehensive breakdown of all software and hardware requirements needed to develop, host, and run the **JalSeva (जलसेवा) Municipal Water Supply & Grievance Management System**.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Based on your responses, a complete specification covering development, production hosting, cloud infrastructure, and end-user devices has been formulated. Upon your approval, the full breakdown will be finalized and presented.

- **Requirements Scope**: Complete categorized inventory (Development, Production Server, Cloud/Database, and End-User Client).
- **Target Documentation**: In-depth specification prepared for direct review and academic/project reference.

---

### 1. Overview & System Context

**JalSeva** is a full-stack civic web application built with **React 19**, **TypeScript**, **Vite 8**, **Tailwind CSS v4**, and **Firebase** (Firestore and Authentication). It caters to three primary user groups:
1. **Citizens**: Accessing dashboards, consumption analytics (Recharts), GIS supply schedules (Leaflet), tanker bookings, and grievance submissions.
2. **Tanker Drivers**: Mobile/tablet web access for GPS dispatch navigation, route guidance, and 4-digit OTP handshakes.
3. **Municipal Administrators**: Desktop/laptop workspace for ward management, tanker fleet Kanban tracking, staff rostering, and grievance redressal desks.

---

### 2. Software Requirements

#### A. Development & Build Environment
Software required by developers to clone, run, test, and build the source code locally:
- **Operating System**: Windows 10/11 (64-bit), macOS (v12 Monterey or newer), or Linux (Ubuntu 20.04+, Debian 11+, Fedora 36+, or WSL2).
- **Runtime & Engine**: 
  - **Node.js**: v18.0.0 or higher (v20+ LTS / v22 LTS recommended).
  - **Package Manager**: `npm` (v9.0.0+) or `bun` (v1.0.0+ / v1.4.2).
- **Code Editor / IDE**: Visual Studio Code, Cursor, WebStorm, or any modern editor with TypeScript and Tailwind CSS extensions.
- **Version Control**: Git v2.30.0 or higher.
- **Core Frameworks & Libraries**:
  - React v19.0.1 & React-DOM v19.0.1
  - TypeScript v7.0+ / 5.x
  - Vite v8.3.0+ & `@vitejs/plugin-react`
  - Tailwind CSS v4.3.3 & `@tailwindcss/vite`
  - Firebase SDK v13.0.0
  - Leaflet v1.9.4 & OpenStreetMap
  - Recharts v3.10.1 & Lucide React v0.546.0

#### B. Server, Cloud & Production Hosting
Software and services required to run and serve the application online:
- **Hosting Platform**: Vercel, Google Cloud Run, Netlify, or Firebase Hosting.
- **Database & Backend Services**:
  - **Google Firebase Firestore**: NoSQL Document Store (`ai-studio-aquaconnectmbmcd-ed48ea96-a122-4654-9e0e-577010d583d8`).
  - **Firebase Authentication**: Identity management with Google OAuth and session tokens.
  - **Firestore Rules Engine**: Declarative zero-trust attribute-based access control (ABAC).
- **Web Server Protocol**: HTTPS with TLS 1.3 / HTTP/2 support (mandatory for geolocation and camera/photo APIs).

#### C. End-User Client Software
Software required by citizens, drivers, and municipal officials to access the portal:
- **Operating Systems**:
  - Android 8.0+ (Mobile / Tablet)
  - iOS 14.0+ / iPadOS (iPhone / iPad)
  - Windows 10/11, macOS 11+, Linux, ChromeOS
- **Supported Web Browsers**:
  - Google Chrome (v90+)
  - Mozilla Firefox (v90+)
  - Apple Safari (v14+)
  - Microsoft Edge (v90+)
- **Browser Capabilities**:
  - HTML5 & ES6+ JavaScript enabled
  - LocalStorage / IndexedDB enabled
  - HTML5 Geolocation API permission (for GPS tagging and depot routing)
  - Camera / File upload support (for grievance photo evidence)

---

### 3. Hardware Requirements

#### A. Development Machine (Minimum & Recommended)
| Component | Minimum Specification | Recommended Specification |
|---|---|---|
| **Processor (CPU)** | Dual-Core Intel Core i3 / AMD Ryzen 3 (2.0 GHz) | Quad-Core Intel Core i5/i7 or AMD Ryzen 5/7 / Apple Silicon (M1/M2/M3/M4) |
| **Memory (RAM)** | 4 GB RAM | 8 GB – 16 GB RAM |
| **Storage (Disk)** | 5 GB free disk space (SSD preferred) | 15 GB+ free SSD NVMe storage |
| **Display** | 1366 × 768 resolution | 1920 × 1080 (Full HD) or higher |
| **Internet** | Broadband (5 Mbps download) for dependency fetching | 25+ Mbps high-speed internet |

#### B. Production Server / Hosting Platform
When deploying the compiled SPA bundle:
| Resource | Minimum Tier | High-Traffic Municipal Production Tier |
|---|---|---|
| **Architecture** | Serverless / Static CDN Edge (Vercel / Cloud Run) | Multi-region CDN + Containerized Node.js backend |
| **Virtual CPU (vCPU)** | 0.5 vCPU (or Serverless Edge Compute) | 2–4 vCPU auto-scaling instances |
| **Server RAM** | 512 MB – 1 GB | 2 GB – 4 GB per container instance |
| **Database Operations** | Firebase Spark / Blaze Tier (50k reads/day) | Blaze Tier with dedicated indexing & caching |
| **Network Bandwidth** | Standard CDN egress (10 GB/month) | 100 GB+ monthly egress |

#### C. End-User Client Hardware (Citizens, Drivers, Municipal Admins)
| Device Type | Minimum Hardware Requirements | Recommended Hardware Requirements |
|---|---|---|
| **Citizen Smartphone** | Quad-Core CPU, 2 GB RAM, 720p Screen, GPS sensor, 5MP Camera | Octa-Core CPU, 4 GB+ RAM, 1080p Screen, 4G/5G connectivity, GPS |
| **Tanker Driver Smartphone** | Quad-Core CPU, 2 GB RAM, GPS module, 4G LTE | 4 GB RAM, GPS + GLONASS, robust battery / in-cab charger, 4G/5G |
| **Admin Workstation** | Dual-Core CPU, 4 GB RAM, 1366 × 768 display | Quad-Core CPU, 8 GB RAM, 1080p 24" monitor (for Kanban & GIS maps) |

---

### 4. Technical Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        End-User Client Devices                         │
│  [Citizen Smartphone]      [Driver Mobile/GPS]      [Admin Desktop PC] │
│   (GPS + Camera + Web)      (4G/5G + Route Map)      (Full HD Dashboard│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (TLS 1.3)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Frontend Application Layer                         │
│        React 19 + TypeScript + Vite 8 + Tailwind CSS v4                │
│  ├── Leaflet Maps & Haversine Distance Engine                          │
│  ├── Recharts Visualizations (Consumption & Telescopic Tariffs)        │
│  └── Reactive LocalStorage Event Bus + Offline Fallback Engine         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Secure WebSocket & REST (Firestore)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Cloud Infrastructure & Services                      │
│  ├── Firebase Firestore (Real-time NoSQL DB & ABAC Security Rules)     │
│  ├── Firebase Authentication (Google OAuth & JWT Sessions)             │
│  └── OpenStreetMap Tile Servers (Mapping & Geocoding)                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 5. Summary of Key Decisions

1. **Client-Side Heavy Architecture**: Because JalSeva is built as an optimized React 19 Single Page Application (SPA), the server-side hardware requirements are minimal (static CDN edge hosting), shifting UI rendering to client devices while offloading database queries to Google Cloud Firestore.
2. **Offline-Resilient Storage**: A custom LocalStorage reactive dispatcher ensures the portal remains functional even under intermittent mobile network coverage across municipal wards.

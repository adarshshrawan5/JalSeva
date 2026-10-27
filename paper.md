---
title: 'JalSeva: A Digital Water Supply Management Portal for Mira–Bhayandar Citizens'
tags:
  - civic technology
  - water supply
  - grievance redressal
  - software engineering
  - web application
authors:
  - name: Adarsh Yadav
    orcid: 0009-0008-1266-6869
    affiliation: 1
affiliations:
  - name: Department of Information Technology, Shree L. R. Tiwari College of Engineering, Mira-Bhayandar, Maharashtra, India
    index: 1
date: 27 October 2026
bibliography: paper.bib
---

# Summary

JalSeva is an open-source web application prototype that consolidates urban water-service workflows into a unified digital interface: ward-level valve distribution timetables, citizen grievance dockets, emergency potable water tanker booking, delivery handover verification, field-technician dispatch, and administrative notices. Developed as an academic software engineering research prototype using React 19, TypeScript, and Tailwind CSS, the software integrates Firebase Authentication and Google Cloud Firestore for persistent cloud data management, complemented by browser `localStorage` caching to provide immediate UI feedback. The application tracks whether asynchronous remote writes succeed or fail, explicitly exposing synchronization errors rather than silently masking write failures. The repository includes declarative Firestore security rules (`firestore.rules`) and a headless automated test runner (`test_runner.ts`) verifying functional contracts and access-control boundaries.

JalSeva is an independent academic research prototype and is not an official municipal application. It has not been commissioned, endorsed, or deployed by the Mira–Bhayandar Municipal Corporation (MBMC), and does not interface with physical municipal supervisory control and data acquisition (SCADA) telemetry, pressure sensors, or government servers. Fleet vehicle transit, reservoir levels, water pressure readings, citizen SMS notifications, and payment receipts are modeled as client-side simulations. An accompanying academic project report is archived on Zenodo [@yadav2026jalseva].

# Statement of Need

In urban satellite regions characterized by rapid population growth and intermittent piped water distribution, municipal water is released during scheduled windows rather than continuous pressurized mains. Citizens often struggle with fragmented communication across disconnected channels when tracking shifting valve hours, reporting localized pipe leakages, or requesting emergency relief tankers. Concurrently, municipal staff face coordination bottlenecks across citizens, dispatchers, field plumbers, and administrative supervisors.

JalSeva addresses this challenge by providing an integrated prototype where these interdependent civic workflows can be systematically explored. The primary audience includes software engineering students, civic technology researchers, and web developers seeking a documented reference implementation of dual-layer persistence, role-based workflows, and location-aware civic service coordination.

The software introduces several functional contributions:
1. A deterministic grievance state machine (`Pending` $\rightarrow$ `Assigned` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved` $\rightarrow$ `Reopened`) supporting field worker self-claiming and citizen reassignment workflows.
2. An emergency potable tanker booking mechanism featuring date-window validation (restricted to Today and Tomorrow), duplicate order prevention, and nearest-depot allocation computed using the Haversine distance formula.
3. A delivery verification mechanism utilizing a 4-digit cryptographic One-Time Password (OTP) generated at booking and required by the driver interface to complete handover.
4. A failure-transparent storage architecture that couples instant client-side caching with asynchronous Cloud Firestore operations, explicitly recording `cloudSyncStatus: 'failed'` and displaying error alerts upon database permission rejections.

While these modules provide an educational and experimental foundation, the prototype has not undergone field testing to evaluate real-world municipal response times, water loss reduction, or citizen satisfaction.

# State of the Field

Civic issue reporting is an established domain within civic technology and open-source software. The Open311 GeoReport v2 standard defines an open API specification for submitting, routing, and tracking location-based public service requests [@open311georeport]. FixMyStreet is an established open-source civic reporting platform that routes citizen reports regarding street defects and public infrastructure to appropriate local government authorities [@fixmystreetplatform].

JalSeva does not aim to replace these general-purpose reporting platforms or propose a competing civic reporting standard. Instead, its narrower contribution is an academic prototype tailored specifically to the operational constraints of intermittent municipal water supply in Indian urban centers. Unlike generic issue trackers, JalSeva couples complaint tracking with ward-level valve schedules, emergency potable tanker routing, OTP-based physical delivery handovers, and dual-layer local/cloud persistence. 

No systematic comparative benchmark, municipal trial, or formal usability evaluation has yet been conducted. The project therefore serves as an open-source case study for architectural evaluation rather than a validated replacement for established civic platforms. Future work should investigate whether integrating Open311-compliant endpoints or adapting established civic frameworks would offer a more robust foundation for municipal production deployment.

# Software Design

The client application is built with React 19, TypeScript, and Vite. The core persistence layer (`storageService.ts`) implements a hybrid architecture: user actions are immediately committed to browser `localStorage` and emitted across a reactive event bus to ensure responsive client updates, while `firebaseService.ts` executes concurrent asynchronous writes (`setDoc`, `addDoc`) against Google Cloud Firestore. If a cloud operation is rejected—such as when a non-administrative user attempts an unauthorized document write—the service catches the error, marks the document with `cloudSyncStatus: 'failed'`, and logs the specific error message to inform the user interface.

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
            ┌────────────────────────┴─────────────────────────┐
            ▼                                                   ▼
 ┌────────────────────────┐                          ┌────────────────────────┐
 │  Firebase Auth SDK     │                          │  Cloud Firestore NoSQL │
 │  - Google OAuth        │                          │  - Database: Named ID  │
 │  - Session tokens      │                          │  - firestore.rules     │
 └────────────────────────┘                          └────────────────────────┘
```

Authentication is managed via Firebase Authentication with client-side Google OAuth. Access control is declared at the database boundary via `firestore.rules`:
- Root-level access defaults to deny-all (`allow read, write: if false;`).
- Citizen user profiles (`/users/{userId}`) permit read operations only by the authenticated profile owner or an administrator, blocking public profile enumeration and preventing unauthorized self-assignment of administrative roles.
- Public complaint and tanker booking creation is permitted subject to strict schema validation functions, while deletion is restricted strictly to administrators.

The application includes an automated test runner (`test_runner.ts`) with 19 functional and regression tests verifying complaint formatting, tanker date bounds, OTP verification, client reload persistence, duplicate order rejection, cloud write failure transparency, remote-to-local deduplication, and role-based privilege guards.

### Design Limitations
The synchronization layer relies on a basic append/latest merge strategy rather than a distributed conflict-free replicated data type (CRDT) or vector clocks, limiting multi-device concurrent conflict resolution. Furthermore, administrative authorization currently relies on email matching alongside document lookups rather than cryptographically signed Firebase Custom Claims.

# Research Impact Statement

At the time of this submission, JalSeva is an academic software engineering prototype developed by an undergraduate student researcher. It is supported by a public GitHub repository, a demonstrator deployment on Vercel, and a documented technical report archived on Zenodo [@yadav2026jalseva].

The repository provides verified automated tests and a documented architecture for dual-layer persistence and civic workflow modeling. However, no independent municipal deployment, adoption by external research teams, peer-reviewed clinical/field study, or formal performance benchmarking has been established. Consequently, **the project does not claim realized external research impact or broad community adoption**. Its immediate value lies in providing a reproducible, transparent software engineering artifact and educational reference for researchers and students investigating civic technology and web-based public utility interfaces.

# AI Usage Disclosure

Google AI Studio and Google Gemini models were utilized during the prototyping, code organization, and refactoring of this web application. ChatGPT assisted in drafting and structuring the initial manuscript and submission-support documentation. All source code, architectural designs, automated test cases, and manuscript text were thoroughly reviewed, edited, verified, and validated by the author, who assumes full intellectual responsibility for the final submission.

# Acknowledgements

The author acknowledges the Department of Information Technology at Shree L. R. Tiwari College of Engineering (Mira-Bhayandar, Maharashtra, India) for supporting this undergraduate research and software engineering effort.

# References

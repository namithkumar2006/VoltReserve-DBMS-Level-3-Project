# VoltReserve: EV Charging Network & Smart Reservation Management System

**DBMS Experiential Learning – Level 3 Project**  
**Department of Computer Science and Engineering, PES University**  
**Course Instructor:** Dr. Nagasundari S  

---

### Team Members & Contributions
* **Namith Kumar Chandrakumar (SRN: PES1UG24AM171)**:  
  * Relational Database Design (ER Modeling, reduction to BCNF relational schema).
  * Implementation of DDL constraints, foreign keys, compound indexes, and database views.
  * Next.js Frontend Development: Customer Portal, Station Search, Filter Engine, User Registration & Authentication UI.
* **Kushal G (SRN: PES1UG24AM145)**:  
  * Database Concurrency Control & ACID Transaction Procedures (`sp_create_reservation_atomic`).
  * Automated State Transition Triggers (`trg_check_reservation_overlap`, `trg_on_session_start`, `trg_on_reservation_cancelled`).
  * NoSQL MongoDB Aggregation Pipeline for high-frequency IoT charger telemetry and thermal health monitoring.
  * Next.js Backend API Routes, Live Charging Simulator, Admin Analytics Dashboard (CTEs & Window Functions).

---

## 1. Problem Statement & Objectives
Public electric vehicle (EV) charging suffers from chronic "charger anxiety": drivers arrive at charging hubs only to find long queues, broken gun connectors, or conflicting reservations. 

**VoltReserve** resolves this real-world problem through an enterprise-grade database system that:
1. **Prevents Overlapping Bookings at the Database Engine Level**: Employs atomic row-level locks and overlap constraints `(StartA < EndB AND EndA > StartB)` so two drivers can never double-book the same charger.
2. **Automates Charger States via DBMS Triggers**: Transitions charger hardware states (`AVAILABLE` ➔ `RESERVED` ➔ `OCCUPIED` ➔ `AVAILABLE`) reactively without application polling.
3. **Multi-Paradigm Hybrid Storage (SQL + NoSQL)**:
   * **SQL (PostgreSQL/MySQL)**: Enforces ACID guarantees, relational integrity, and financial accounting for Users, Vehicles, Stations, Tariffs, and Billing.
   * **NoSQL (MongoDB)**: Efficiently ingests high-frequency polymorphic IoT telemetry (voltage, current, battery pack temperature, cooling RPM) and runs aggregation pipelines to prevent cell degradation.
4. **Advanced Analytical Insights**: Uses Common Table Expressions (CTEs) and Window Functions (`DENSE_RANK() OVER (PARTITION BY city)`) to classify peak load hours and rank station revenue.

---

## 2. Technology Stack
* **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons.
* **Backend**: Next.js Route Handlers (RESTful API), Server-side Transaction Execution.
* **Database Paradigms**:
  * **Relational / SQL**: PostgreSQL / MySQL compatible DDL/DML, PL/pgSQL Stored Procedures, Triggers, Views, CTEs, Window Functions.
  * **NoSQL**: MongoDB document schemas and `$match ➔ $group ➔ $cond ➔ $project` Aggregation Pipelines.
* **Version Control**: Git & GitHub.

---

## 3. Database Architecture & Schema Design (BCNF)
The relational schema comprises 8 core entities:
1. `users`: Stores drivers and network administrators with Role-Based Access Control (`CUSTOMER`, `ADMIN`).
2. `vehicles`: Driver EV specifications (Make, Model, Registration, Battery Capacity, Connector Type) with `ON DELETE CASCADE`.
3. `charging_stations`: Geographic station hubs across Bengaluru (Indiranagar, Koramangala, Whitefield, Electronic City, MG Road).
4. `tariffs`: Station pricing rules with base kWh rates, peak-hour surcharges (17:00–22:00), and idle fees.
5. `chargers`: Hardware charging guns (`GUN-1A`, `GUN-2A`) with power ratings (22kW AC to 150kW Ultra DC) and status check constraints.
6. `reservations`: Temporal booking records protected by concurrency triggers.
7. `charging_sessions`: Real-time session telemetry, initial/final SoC%, kWh energy delivered, and financial line items with 18% GST.
8. `user_reviews`: Customer ratings (1-5) and operational feedback.

### Key Database Scripts:
* `database/schema.sql`: Full DDL with constraints and indexes.
* `database/triggers_procedures.sql`: Concurrency transaction procedure and state transition triggers.
* `database/views_analytics.sql`: SQL Views, CTEs, and Window Functions.
* `database/seed.sql`: Realistic Bengaluru charging network dataset.
* `database/nosql_telemetry.js`: MongoDB collection models and thermal stress aggregation pipelines.

---

## 4. Step-by-Step Execution Guide

### Prerequisites:
* Node.js v18+ or v20+ or v24+
* npm or pnpm or yarn
* Git

### Step 1: Clone or Navigate to the Repository
```bash
cd voltreserve-ev
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

### Step 4: Instant Evaluation Walkthrough
VoltReserve includes **1-Click Evaluation Shortcuts** on the landing page and login screen:
1. **Customer Evaluation Demo**:
   * Click **"Log In as Customer (EV Driver)"** (Logs in as *Namith Kumar Chandrakumar*).
   * Go to **"Explore Stations"** ➔ Filter by **Fast DC (&ge;50kW)**.
   * Pick an available charger (e.g. at *Indiranagar 100ft Hub*) and click **Reserve**.
   * Pick a time slot and confirm booking (observe atomic concurrency verification).
   * Navigate to **"Reservations & Charging"** ➔ Click **"Plug In & Charge"**.
   * Observe the **Live Hardware Charging Simulator** stream real-time SoC%, kW power rate, and cost.
   * Click **"Stop & Generate Bill"** ➔ View the instant GST Tax Invoice in **"Billing"**.
2. **Administrator Evaluation Demo**:
   * Switch role or click **"Log In as Station Administrator"** (`admin@ev.com`).
   * Access **"Admin Hub"**:
     * View live charger status across Bengaluru.
     * Toggle any charger into **"UNDER_MAINTENANCE"** (observe immediate exclusion from driver bookings).
     * Review the **Peak-Hour Traffic CTE** breakdown.
     * Inspect the **Station Revenue Rankings** calculated with `DENSE_RANK()`.
     * Inspect the **MongoDB Aggregation Pipeline** monitoring charger thermal health.
3. **Professor/TA SQL Viva Console**:
   * Navigate to **"SQL Playground"** (`/admin/sql-playground`).
   * Select any syllabus demonstration query (CTE, Window Function, Views, or MongoDB Aggregation) and click **"Run Query Live"** to inspect the live query syntax, syllabus mapping, and execution table!

---

## 5. Advanced DBMS Syllabus Mapping
| Syllabus Unit | Concept Implemented | Project Component |
|---|---|---|
| **Unit 1** | ER Modeling & Relational Schema | `database/schema.sql` (Tables, Foreign Keys, CHECK constraints) |
| **Unit 1 & 2** | Relational Views & Aggregates | `vw_station_live_status` (Multi-table join, conditional SUM/CASE) |
| **Unit 2** | Concurrency & Overlap Prevention | `sp_create_reservation_atomic` (Exclusive row lock, interval collision check) |
| **Unit 2** | Automated Hardware State Triggers | `trg_on_session_start`, `trg_on_reservation_cancelled` |
| **Unit 2 & 3** | CTE (Common Table Expressions) | `WITH HourlyReservations AS ...` for peak demand classification |
| **Unit 2 & 3** | Window Functions | `DENSE_RANK() OVER (PARTITION BY city ORDER BY total_revenue DESC)` |
| **Unit 3** | Normalization (1NF to BCNF) | Formal functional dependency decomposition proof |
| **Unit 4** | NoSQL MongoDB Aggregation Pipeline | `database/nosql_telemetry.js` ($match, $group, $cond, $project) |
| **Unit 4** | Full-Stack Next.js Integration | Next.js 14 App Router, REST APIs, dynamic UI/UX |

---
*Created for PES University DBMS Experiential Learning - Level 3.*

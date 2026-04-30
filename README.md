# ☕ Coffee Traceability System

## A complete farm-to-export traceability platform for Ethiopian coffee

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [User Roles & Credentials](#user-roles--credentials)
- [System Workflow](#system-workflow)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🎯 Overview

The **Coffee Traceability System** is a full-stack web application designed to track coffee from farm to export with complete transparency. Built for Ethiopian coffee exporters, cooperatives, farmers, and international buyers, this system ensures EUDR compliance and provides QR-code-based traceability.

### What Problem Does It Solve?

| Problem | Solution |
|---------|----------|
| Coffee origin cannot be verified | GPS-tracked farms with QR codes |
| EUDR compliance is complex | Automated compliance reporting |
| Export documentation is scattered | Centralized shipment management |
| Quality data is not standardized | SCA cupping form with scores |
| Buyers don't trust origin claims | Public traceability via QR scan |

---

## ✨ Features

### Role-Based Access (5 Roles)

| Role | Capabilities |
|------|--------------|
| **Admin** | Full system control, user management |
| **Exporter** | Create farms, farmers, lots, shipments |
| **Cooperative** | View member farmers and their production |
| **Farmer** | View own farms and lots, download QR codes |
| **Buyer** | Browse lots, trace coffee, view reports |

### Core Features

- ✅ **Farmer Management** - Register farmers with contact details
- ✅ **Farm Management** - GPS coordinates, altitude, area, coffee variety
- ✅ **Lot Management** - Unique lot numbers, harvest tracking, QR codes
- ✅ **Traceability Timeline** - Full journey from harvest to export
- ✅ **Quality Assessment** - SCA cupping scores (fragrance, flavor, acidity, etc.)
- ✅ **Shipment Management** - Export documentation, container tracking
- ✅ **EUDR Compliance** - Deforestation-free declaration, GPS validation
- ✅ **QR Code System** - Generate, download, and scan QR codes for each lot
- ✅ **Public Trace Page** - Anyone can scan QR to view lot journey
- ✅ **PDF Reports** - Export EUDR compliance reports
- ✅ **Email Notifications** - Alerts on lot creation and status changes
- ✅ **Amharic Language Support** - Full localization for Ethiopian users
- ✅ **Mobile Responsive** - Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **PostgreSQL** | Database |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **QRCode** | QR code generation |
| **Nodemailer** | Email notifications |
| **Multer** | File uploads |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Tailwind CSS** | Styling |
| **React Router v6** | Routing |
| **Axios** | API calls |
| **Leaflet** | Interactive maps |
| **Recharts** | Charts and analytics |
| **jsPDF** | PDF generation |
| **Lucide React** | Icons |

### Database
| Table | Purpose |
|-------|---------|
| users | Authentication and roles |
| farmers | Coffee farmer profiles |
| farms | Farm locations with GPS |
| lots | Coffee harvest batches |
| trace_events | Timeline events |
| quality_assessments | SCA cupping scores |
| shipments | Export documentation |
| compliance_documents | EUDR compliance files |

---

## 🏗️ System Architecture
┌─────────────────────────────────────────────────────────────┐
│ CLIENT (React) │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │ Admin │ │Exporter │ │ Coop │ │ Farmer │ │ Buyer ││
│ │Dashboard│ │Dashboard│ │Dashboard│ │Dashboard│ │Dashboard││
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘│
└─────────────────────────────┬───────────────────────────────┘
│ HTTPS / WebSocket
┌─────────────────────────────▼───────────────────────────────┐
│ API GATEWAY (Express) │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │ Auth │ │Farmers │ │ Farms │ │ Lots │ │Shipments││
│ │ Routes │ │ Routes │ │ Routes │ │ Routes │ │ Routes ││
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘│
└─────────────────────────────┬───────────────────────────────┘
│
┌─────────────────────────────▼───────────────────────────────┐
│ PostgreSQL Database │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │ users │ │farmers │ │ farms │ │ lots │ │shipments││
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘│
└─────────────────────────────────────────────────────────────┘

---

## 📥 Installation

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18+ |
| PostgreSQL | 14+ |
| npm or yarn | Latest |

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/coffee-traceability.git
cd coffee-traceability

# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE coffee_traceability_db;

# Connect to database
\c coffee_traceability_db;

# Run schema (copy and paste the schema.sql content)
PORT=5001
NODE_ENV=development
JWT_SECRET=your_secret_key_here

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=coffee_traceability_db

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_EMAIL=admin@coffee.com
FRONTEND_URL=http://localhost:3000
1. ADMIN/EXPORTER
   ├── Create Farmer (name, contact, cooperative)
   ├── Create Farm (GPS coordinates, altitude, variety)
   └── Create Lot (harvest date, quantity, processing method)
        │
        ▼
2. SYSTEM AUTOMATION
   ├── Generate unique lot number (LOT0001)
   ├── Create QR code for lot
   └── Send email notification
        │
        ▼
3. TRACEABILITY EVENTS
   ├── Harvest → Processing → Drying → Storage → Export
   └── Each event adds to timeline
        │
        ▼
4. QUALITY ASSESSMENT (Optional)
   ├── SCA cupping scores (fragrance, flavor, acidity, etc.)
   └── Certify quality
        │
        ▼
5. SHIPMENT
   ├── Select lots for export
   ├── Add container, shipping line, bill of lading
   └── EUDR compliance check
        │
        ▼
6. PUBLIC TRACEABILITY
   ├── QR code on coffee bag
   └── Consumer scans → sees full journey
   👥 User Roles & Credentials
Role	Email	Password	Access Level
Admin	admin@coffee.com	admin123	Full system control
Exporter	exporter@coffee.com	admin123	Create farmers, farms, lots, shipments
Cooperative	coop@coffee.com	admin123	View member farmers and farms
Farmer	farmer@coffee.com	admin123	View own farms and lots
Buyer	buyer@coffee.com	admin123	Browse lots and traceability
📡 API Documentation
Authentication Endpoints
Method	Endpoint	Description
POST	/api/auth/login	User login
GET	/api/auth/me	Get current user
Farmers Endpoints
Method	Endpoint	Description
GET	/api/farmers	Get all farmers
GET	/api/farmers/:id	Get single farmer
POST	/api/farmers	Create farmer
PUT	/api/farmers/:id	Update farmer
DELETE	/api/farmers/:id	Delete farmer
Farms Endpoints
Method	Endpoint	Description
GET	/api/farms	Get all farms
GET	/api/farms/:id	Get single farm
POST	/api/farms	Create farm
PUT	/api/farms/:id	Update farm
DELETE	/api/farms/:id	Delete farm
POST	/api/farms/:id/upload	Upload farm image
Lots Endpoints
Method	Endpoint	Description
GET	/api/lots	Get all lots
GET	/api/lots/:id	Get single lot
POST	/api/lots	Create lot
PUT	/api/lots/:id/status	Update lot status
DELETE	/api/lots/:id	Delete lot
GET	/api/lots/qr/:lotNumber	Generate QR code
Trace Events Endpoints
Method	Endpoint	Description
POST	/api/trace/lots/:lotId/events	Add trace event
GET	/api/trace/lots/:lotId/timeline	Get timeline
Shipments Endpoints
Method	Endpoint	Description
GET	/api/shipments	Get all shipments
GET	/api/shipments/:id	Get single shipment
POST	/api/shipments	Create shipment
Public Endpoints
Method	Endpoint	Description
GET	/api/public/trace/:lotNumber	Public trace page (no auth)
📁 Project Structure
text
coffee-traceability/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── farmerController.js
│   │   │   ├── farmController.js
│   │   │   ├── lotController.js
│   │   │   ├── qualityController.js
│   │   │   ├── shipmentController.js
│   │   │   ├── traceController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── farmers.js
│   │   │   ├── farms.js
│   │   │   ├── lots.js
│   │   │   ├── public.js
│   │   │   ├── shipments.js
│   │   │   ├── trace.js
│   │   │   └── users.js
│   │   ├── services/
│   │   │   └── emailService.js
│   │   └── server.js
│   ├── .env
│   ├── package.json
│   └── schema.sql
└── client/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── Layout/
    │   │   │   ├── Header.js
    │   │   │   └── Sidebar.js
    │   │   └── charts/
    │   │       └── LotChart.js
    │   ├── contexts/
    │   │   └── LanguageContext.js
    │   ├── i18n/
    │   │   └── am.js
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   └── AdminDashboard.js
    │   │   ├── buyer/
    │   │   │   ├── BuyerDashboard.js
    │   │   │   └── BuyerLots.js
    │   │   ├── coop/
    │   │   │   ├── CoopDashboard.js
    │   │   │   ├── CoopFarmers.js
    │   │   │   └── CoopFarms.js
    │   │   ├── exporter/
    │   │   │   └── ExporterDashboard.js
    │   │   ├── farmer/
    │   │   │   ├── FarmerDashboard.js
    │   │   │   ├── FarmerFarms.js
    │   │   │   └── FarmerLots.js
    │   │   ├── Dashboard.js
    │   │   ├── Farmers.js
    │   │   ├── Farms.js
    │   │   ├── Login.js
    │   │   ├── Lots.js
    │   │   ├── PublicTrace.js
    │   │   ├── Shipments.js
    │   │   └── Traceability.js
    │   ├── utils/
    │   │   └── pdfExport.js
    │   ├── App.js
    │   ├── index.css
    │   └── index.js
    ├── .env
    ├── package.json
    └── tailwind.config.js
🗄️ Database Schema
ER Diagram
text
┌─────────┐     ┌─────────┐     ┌─────────┐
│  users  │────<│farmers  │────<│  farms  │
└─────────┘     └─────────┘     └────┬────┘
                                     │
                                     ▼
┌─────────┐     ┌─────────┐     ┌─────────┐
│shipments│<────│  lots   │────>│ trace   │
└─────────┘     └────┬────┘     │ events  │
                     │          └─────────┘
                     ▼
              ┌─────────────┐
              │  quality    │
              │ assessments │
              └─────────────┘
Key Tables
users

Column	Type	Description
id	SERIAL	Primary key
name	VARCHAR(100)	User's full name
email	VARCHAR(100)	Login email (unique)
password	VARCHAR(255)	Hashed password
role	VARCHAR(20)	admin, exporter, coop, farmer, buyer
farmers

Column	Type	Description
id	SERIAL	Primary key
farmer_code	VARCHAR(50)	Unique code (FARM0001)
name	VARCHAR(100)	Farmer's name
phone	VARCHAR(20)	Contact number
cooperative_name	VARCHAR(100)	Cooperative name
user_id	INTEGER	Link to users table
farms

Column	Type	Description
id	SERIAL	Primary key
farm_code	VARCHAR(50)	Unique code
farmer_id	INTEGER	Link to farmers
latitude	DECIMAL(10,8)	GPS latitude
longitude	DECIMAL(11,8)	GPS longitude
altitude	INTEGER	Elevation in meters
coffee_variety	VARCHAR(100)	Coffee variety
lots

Column	Type	Description
id	SERIAL	Primary key
lot_number	VARCHAR(50)	Unique lot code
farm_id	INTEGER	Link to farms
harvest_date	DATE	Harvest date
quantity_kg	DECIMAL(10,2)	Weight in kg
processing_method	VARCHAR(50)	washed, natural, honey
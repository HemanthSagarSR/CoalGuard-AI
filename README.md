# 🏭 CoalGuard AI

> **A local-first governance, compliance, and risk monitoring platform for coal-mine operations.**

CoalGuard AI is a portfolio-ready web application for exploring mine governance data, monitoring compliance and violations, reviewing inspections, assessing operational risk, and generating management-oriented reports.

The public version is designed to run **independently on a developer's machine**. It does not require a hosted backend or third-party project builder.

## ✨ Features

- 📊 Executive governance dashboard
- ⛏️ Mine catalog with search, filtering, and sorting
- 📋 Mine-level compliance tracking
- 🔎 Inspection management
- ⚠️ Violation tracking and status updates
- 👷 Contractor risk monitoring
- 🧠 Risk intelligence and explainable risk factors
- 🗺️ GIS map view
- 💬 Local governance assistant
- 📑 Reports and analytics
- 🧾 Hash-chain audit trail integrity checks
- 🔔 Alert center
- ⚙️ Settings and demo-data controls
- 🔐 Local demo authentication
- 💾 Persistent browser storage using `localStorage`
- 🧪 Synthetic demonstration data

## 🖥️ Application

The application is a frontend-first local demo. On first launch it loads a synthetic dataset containing mines, compliance requirements, inspections, violations, contractors, alerts, and audit records.

No external service is required for the core demo.

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│      React + TypeScript      │
│           Vite App           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Local Data Layer       │
│  React hooks + local state   │
│        localStorage          │
└──────────────┬───────────────┘
               │
       ┌───────┼─────────┐
       ▼       ▼         ▼
     Mines  Compliance  Risk
       │       │         │
       ├───────┼─────────┤
       ▼       ▼         ▼
 Inspections Violations Alerts
       │       │         │
       └───────┼─────────┘
               ▼
       Dashboard / Reports
```

## 🧰 Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Recharts
- Leaflet / React Leaflet
- Lucide React

**Application data**
- TypeScript local data layer
- Browser `localStorage`
- Synthetic demo dataset

**Development**
- npm
- ESLint
- Prettier
- Git / GitHub

## 📁 Project Structure

```text
CoalGuard-AI/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   │   ├── local-api.ts
│   │   ├── local-data.ts
│   │   └── local-db.ts
│   ├── pages/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🚀 Run Locally

### Prerequisites

Install:

- Node.js 18+ (Node.js 20+ recommended)
- npm

### 1. Clone

```bash
git clone https://github.com/HemanthSagarSR/CoalGuard-AI.git
cd CoalGuard-AI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open the URL shown by Vite, normally:

```text
http://localhost:5173
```

### 4. Production build

```bash
npm run build
```

### 5. Preview the production build

```bash
npm run preview
```

## 🔐 Demo Authentication

CoalGuard AI V1 uses local demo authentication so the application can run without an external identity provider.

You can use:

**Continue as Guest**

or enter an email and complete the local six-digit verification step.

> This authentication is intended for demonstration purposes and is not suitable for production security.

## 💾 Data & Persistence

The public V1 uses browser `localStorage` for persistence.

That means:

- Data stays on the local browser.
- No database account is required.
- The application works offline after dependencies are installed.
- Different browsers/profiles have separate demo data.

To reset the local demo data, clear the site's `localStorage` for the application and reload.

## 🤖 Local Assistant

The governance assistant works locally using the application's synthetic dataset.

It can answer questions such as:

- Which mines are high risk?
- What compliance items are overdue?
- How many open violations are there?
- Which mine currently has the highest risk score?

No external AI API key is required for the V1 demo.

## 🧾 Audit Trail

The application includes an audit-trail demonstration using a simple hash chain.

Each record stores:

- Previous hash
- Current hash
- Action
- Entity
- Entity ID
- Timestamp

The Audit page can verify whether the stored chain is internally consistent.

> This is an educational integrity demonstration, not a replacement for a production-grade tamper-evident logging system.

## 📊 Demo Data

The included data is **synthetic demonstration data** created for the project.

It should not be interpreted as live operational information about real mines, companies, workers, contractors, or incidents.

## 🔒 Security Notes

The public repository intentionally contains:

- No API keys
- No private keys
- No production credentials
- No hosted database credentials
- No external authentication secrets
- No local databases
- No dependency on a project-builder account

The `.gitignore` excludes common local artifacts such as:

```text
node_modules/
dist/
.env
*.local
```

## 🗺️ Roadmap

### V1 — Current

- [x] Governance dashboard
- [x] Mine catalog
- [x] Compliance monitoring
- [x] Inspection management
- [x] Violation management
- [x] Contractor risk
- [x] Risk intelligence
- [x] GIS map
- [x] Local assistant
- [x] Reports
- [x] Audit trail
- [x] Alerts
- [x] Local persistence
- [x] Standalone setup

### V2 — Planned

- [ ] Real backend API
- [ ] PostgreSQL persistence
- [ ] Secure production authentication
- [ ] Role-based authorization
- [ ] Real-time alerts
- [ ] External GIS/data integrations
- [ ] Advanced predictive risk models
- [ ] Automated compliance document ingestion
- [ ] Production-grade audit logging
- [ ] Deployment configuration

## ⚠️ Disclaimer

CoalGuard AI is an educational/portfolio project using synthetic data.

Risk scores, compliance information, alerts, and recommendations are demonstrations and should not be used as the sole basis for real-world mining, safety, regulatory, or operational decisions.

## 👨‍💻 Author

**Hemanth Sagar S R**

Computer Science student interested in Artificial Intelligence, Machine Learning, Cybersecurity, and software development.

GitHub: https://github.com/HemanthSagarSR

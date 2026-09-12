I checked the **current README on your actual OpsGuard GitHub repository**. The current README is very short: it has the project description, local development commands, environment variables, Vercel/GitHub Actions notes, and scripts, but it does **not yet include your four screenshots, architecture, feature documentation, tech stack, or portfolio presentation**. ([GitHub][1])

I also checked the actual repository structure, which confirms `.github/workflows`, `scripts`, `src`, `supabase`, `SECURITY.md`, `vercel.json`, `vitest.config.ts`, and the other project files are present. ([GitHub][1])

Below is the **corrected final README**, based on the actual repository information plus the four screenshots you provided.

> **Important:** Put your screenshots at `docs/screenshots/` with these exact names:
> `dashboard.png`, `monitoring.png`, `sla-uptime.png`, `incident-tickets.png`.

````markdown
# 🛡️ OpsGuard

### Real-Time Incident Response & Operations Control Platform

> **Observe. Respond. Resolve.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-E50914?style=for-the-badge)](https://opsguard-j7ygzrnec-monish3905.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-111111?style=for-the-badge&logo=github)](https://github.com/Monish03905/OpsGuard)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

---

## 🚀 Overview

**OpsGuard** is a real-time incident response and operations control platform designed to help teams monitor services, track incidents, manage operational tickets, monitor SLAs, and organize operational workflows from a centralized interface.

The platform brings together key reliability and incident-response workflows:

```text
Monitoring
     ↓
Service Health
     ↓
Incident Detection
     ↓
Ticket Management
     ↓
Investigation & Response
     ↓
SLA Tracking
     ↓
Resolution
````

OpsGuard was built with a focus on practical software engineering practices including:

* Full-stack web development
* Database integration
* Operational monitoring
* Incident management
* SLA tracking
* Automated testing
* Security validation
* CI/CD
* Cloud deployment

---

# 🎯 Problem

When a software system experiences operational problems, engineering teams need visibility into several areas at the same time.

For example:

* Are services healthy?
* Are there active incidents?
* How many tickets are open?
* What is the current uptime?
* Are SLA targets being met?
* Which incidents require attention?
* Are there errors or warnings?
* Which incidents have been resolved?

Without a centralized operational interface, this information can become difficult to track.

**OpsGuard** provides a unified interface for monitoring operational health and managing incident-response workflows.

---

# ✨ Key Features

## 📊 Operations Control Dashboard

The main dashboard provides a centralized overview of the operational state of the platform.

### Dashboard includes

* Active incidents
* Open tickets
* System uptime
* Log errors
* Live incident feed
* Resolved incidents
* Total logs
* Overall system health

The dashboard acts as the central control surface for operational visibility.

---

## 🖥️ Infrastructure & Service Monitoring

OpsGuard includes a dedicated monitoring dashboard for service and infrastructure health.

### Monitoring capabilities

* Active services
* Total logs
* Active incidents
* System health
* CPU usage visualization
* Memory usage visualization
* 24-hour metric visualization
* Service health visibility

The monitoring dashboard provides a visual representation of operational metrics and system status.

---

## 🚨 Incident Response

OpsGuard provides an incident-oriented workflow for tracking operational issues.

### Incident capabilities

* Incident creation
* Incident tracking
* Incident status management
* Incident priority management
* Incident searching
* Incident filtering
* Resolution tracking
* Operational ticket workflows

---

## 🎫 Incident Ticket Management

The dedicated ticket system provides structured management of operational incidents.

### Features

* Create new tickets
* Search tickets
* Filter tickets by status
* Filter tickets by priority
* Track ticket state
* Track resolution
* Export ticket data as CSV

### Supported Statuses

```text
Investigating
Warning
Resolved
```

### Priority Levels

```text
P1
P2
P3
```

---

## ⏱️ SLA & Uptime Monitoring

OpsGuard provides a dedicated SLA and uptime interface for monitoring service reliability.

### SLA capabilities

* Total services
* SLA compliance
* SLA targets
* At-risk services
* Breached services
* Current uptime
* Response-time targets
* Service-level status

Example:

```text
Service: API Gateway

Target SLA:       99.9%
Response Target:  300ms
Current Uptime:   99.85%
Status:           MET
```

---

# 🖼️ Application Screenshots

## 01 — Operations Control Dashboard

The central dashboard provides an overview of incidents, tickets, uptime, logs, and overall system health.

![OpsGuard Operations Dashboard](docs/screenshots/dashboard.png)

---

## 02 — Infrastructure Monitoring Dashboard

The monitoring dashboard provides visibility into services, logs, incidents, system health, CPU usage, and memory usage.

![OpsGuard Monitoring Dashboard](docs/screenshots/monitoring.png)

---

## 03 — SLA & Uptime

Track service-level targets, uptime, response-time targets, and SLA status.

![OpsGuard SLA and Uptime Dashboard](docs/screenshots/sla-uptime.png)

---

## 04 — Incident Ticket System

Manage operational tickets using search, status filters, priority filters, ticket creation, resolution tracking, and CSV export.

![OpsGuard Incident Ticket System](docs/screenshots/incident-tickets.png)

---

# 🏗️ Architecture

```text
                         ┌─────────────────────────┐
                         │        OpsGuard         │
                         │ Operations Control App  │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │     React Frontend      │
                         │  TypeScript + Vite      │
                         └────────────┬────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
       │  Dashboard   │       │  Monitoring  │       │ SLA & Uptime │
       └──────────────┘       └──────────────┘       └──────────────┘
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      │
                                      ▼
                              ┌────────────────┐
                              │ Incident/Ticket│
                              │    Workflows   │
                              └───────┬────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │        Supabase         │
                         │  Data + Authentication  │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │       PostgreSQL        │
                         └─────────────────────────┘
```

---

# 🧰 Technology Stack

## Frontend

* React
* TypeScript
* Vite
* React Router
* Tailwind CSS
* Radix UI
* Framer Motion
* Lucide React

## Data & Application Services

* Supabase
* PostgreSQL
* Supabase JavaScript Client
* React Query
* Zod

## Visualization

* Recharts

## Testing & Quality

* Vitest
* React Testing Library
* ESLint
* TypeScript

## DevOps & Deployment

* GitHub Actions
* Vercel
* Automated build validation
* Security validation
* Dependency auditing

---

# 🔐 Security

Security is treated as part of the development workflow.

OpsGuard includes repository-level security validation covering areas such as:

* Hardcoded secrets
* Exposed service credentials
* API keys and tokens
* Privileged frontend credentials
* Unsafe `eval` / `Function` usage
* Supabase Row Level Security configuration
* Dependency vulnerabilities
* TypeScript validation
* ESLint validation
* Test validation
* Production build validation

Run the local security checks with:

```bash
npm run security
```

For additional security information, see:

[`SECURITY.md`](SECURITY.md)

---

# 🧪 Testing & Quality

OpsGuard includes automated development checks for code quality and application reliability.

### Run tests

```bash
npm run test
```

### Run linting

```bash
npm run lint
```

### Create a production build

```bash
npm run build
```

### Run security validation

```bash
npm run security
```

---

# ⚙️ Getting Started

## Prerequisites

Make sure you have installed:

* Node.js
* npm
* Git
* A Supabase project

---

## 1. Clone the repository

```bash
git clone https://github.com/Monish03905/OpsGuard.git
```

```bash
cd OpsGuard
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create your local environment file:

```bash
cp .env.example .env
```

Configure the required Supabase variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

> ⚠️ Never commit private credentials, service-role keys, or other sensitive secrets to GitHub.

---

## 4. Start the development server

```bash
npm run dev
```

The application will start using the Vite development server.

---

# 📜 Available Scripts

| Command            | Description                       |
| ------------------ | --------------------------------- |
| `npm run dev`      | Start the Vite development server |
| `npm run build`    | Create a production build         |
| `npm run lint`     | Run ESLint                        |
| `npm run test`     | Run the test suite                |
| `npm run security` | Run repository security checks    |

---

# ☁️ Deployment

OpsGuard is deployed using **Vercel**.

The project includes Vercel configuration for SPA route handling.

### Production Application

🌐 **Live Demo**

[https://opsguard-j7ygzrnec-monish3905.vercel.app/](https://opsguard-j7ygzrnec-monish3905.vercel.app/)

### Source Code

💻 **GitHub Repository**

[https://github.com/Monish03905/OpsGuard](https://github.com/Monish03905/OpsGuard)

---

# 🔄 Operational Workflow

```text
┌─────────────────┐
│    MONITORING   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SERVICE HEALTH │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     DETECT      │
│     ISSUE       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CREATE TICKET  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  INVESTIGATE &  │
│     RESPOND     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     RESOLVE     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SLA & UPTIME   │
│     TRACKING    │
└─────────────────┘
```

---

# 📁 Project Structure

```text
OpsGuard/
│
├── .github/
│   └── workflows/
│
├── public/
│
├── scripts/
│
├── src/
│
├── supabase/
│
├── docs/
│   └── screenshots/
│       ├── dashboard.png
│       ├── monitoring.png
│       ├── sla-uptime.png
│       └── incident-tickets.png
│
├── .env.example
├── .gitignore
├── SECURITY.md
├── README.md
├── package.json
├── package-lock.json
├── bun.lock
├── components.json
├── eslint.config.js
├── index.html
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vercel.json
├── vite.config.ts
└── vitest.config.ts
```

---

# 🔄 Development & Engineering Workflow

OpsGuard follows a production-oriented development workflow:

```text
Architecture
     ↓
UI & Application Development
     ↓
Database Integration
     ↓
Testing
     ↓
Security Validation
     ↓
CI/CD
     ↓
Production Build
     ↓
Cloud Deployment
```

The project combines application development with testing, security checks, automated validation, and deployment.

---

# 🛣️ Future Roadmap

## Reliability Engineering

* Real-time service health improvements
* Automated SLA breach detection
* Escalation policies
* Incident timelines
* Advanced uptime analytics

## Incident Response

* Automated incident severity classification
* Intelligent incident assignment
* On-call scheduling
* Notification integrations
* Slack integration
* Microsoft Teams integration

## Security

* Role-based access control
* Advanced audit logs
* Permission management
* Security event monitoring

## AI & Automation

* AI-assisted incident summaries
* Root-cause analysis assistance
* Automated incident classification
* Predictive SLA breach detection
* Intelligent remediation recommendations

## Platform

* Multi-organization support
* Custom dashboards
* Advanced analytics
* Webhook integrations
* External API integrations

---

# 🎓 Engineering Learnings

Building OpsGuard provided practical experience with:

* Full-stack web development
* React and TypeScript
* Vite-based application development
* Database-driven applications
* Supabase and PostgreSQL
* Operational dashboard design
* Incident management workflows
* SLA and uptime concepts
* Data visualization
* Automated testing
* Security validation
* CI/CD
* Cloud deployment
* DevOps/SRE-oriented engineering

---

# ⭐ Why OpsGuard?

OpsGuard demonstrates practical experience across several areas of modern software engineering:

```text
             ┌──────────────────┐
             │     Frontend     │
             └────────┬─────────┘
                      │
             ┌────────▼─────────┐
             │   Data / Backend │
             └────────┬─────────┘
                      │
             ┌────────▼─────────┐
             │     DevOps       │
             └────────┬─────────┘
                      │
             ┌────────▼─────────┐
             │     Testing      │
             └────────┬─────────┘
                      │
             ┌────────▼─────────┐
             │     Security     │
             └────────┬─────────┘
                      │
             ┌────────▼─────────┐
             │ Cloud Deployment │
             └────────┬─────────┘
                      │
             ┌────────▼─────────┐
             │   Reliability    │
             └──────────────────┘
```

The goal was to build a practical operational platform rather than only a visual dashboard.

---

# 👨‍💻 Author

## Monish Ratan

AI & Data Science Undergraduate

### Areas of Interest

* Software Engineering
* Full-Stack Development
* AI/ML
* Cloud Computing
* DevOps
* Backend Engineering
* Computer Vision

### Profiles

* GitHub: [https://github.com/Monish03905](https://github.com/Monish03905)
* LinkedIn: [https://www.linkedin.com/in/monish-ratan-259695247/](https://www.linkedin.com/in/monish-ratan-259695247/)
* LeetCode: [https://leetcode.com/u/KL2400080018/](https://leetcode.com/u/KL2400080018/)

---

# 🔗 Project Links

### 🌐 Live Demo

[https://opsguard-j7ygzrnec-monish3905.vercel.app/](https://opsguard-j7ygzrnec-monish3905.vercel.app/)

### 💻 GitHub Repository

[https://github.com/Monish03905/OpsGuard](https://github.com/Monish03905/OpsGuard)

---

# 🛡️ OpsGuard

> **Observe. Respond. Resolve.**

Built with a focus on **operational visibility, reliability, engineering discipline, security, testing, and real-world incident response workflows.**

```

### One important correction I made

I **removed the earlier claim that OpsGuard combines Prometheus, Grafana, and AI-powered anomaly detection** from the README. Your current GitHub README itself doesn't document those integrations, and your screenshots alone aren't enough to establish that they're actually implemented. The safer version above describes the monitoring functionality you actually showed. :contentReference[oaicite:2]{index=2}

Also, your current GitHub repository does **not yet show a `docs/screenshots/` folder** in the repository file listing, so after replacing the README, make sure you actually upload the four screenshots there; otherwise GitHub will show broken image links. :contentReference[oaicite:3]{index=3}

After that, your README will look substantially more like a **serious portfolio/production project** rather than a basic student repository.
```

[1]: https://github.com/Monish03905/OpsGuard "GitHub - Monish03905/OpsGuard · GitHub"

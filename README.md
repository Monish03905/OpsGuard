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
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

---

## 🚀 Overview

**OpsGuard** is a modern incident response and operations control platform designed to provide a centralized interface for monitoring services, tracking operational health, managing incidents, and monitoring service-level objectives.

The platform brings operational workflows together in one system:

```text
Monitoring
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

OpsGuard was built with a focus on **production-oriented software engineering, reliability workflows, security validation, automated testing, CI/CD, and cloud deployment**.

---

## 🎯 Problem

Modern engineering teams need visibility across multiple operational areas:

* Is the system healthy?
* Are services available?
* Are there active incidents?
* Which tickets need attention?
* Are SLA targets being met?
* What is the current uptime?
* Are there errors or warnings?
* Which incidents are resolved?

OpsGuard provides a unified operational interface to answer these questions and organize incident-response workflows.

---

# ✨ Key Features

## 📊 Operations Control Dashboard

The main dashboard provides a centralized view of operational health.

### Includes

* Active incident overview
* Open ticket tracking
* System uptime
* Log error monitoring
* Live incident feed
* Resolved incident tracking
* Total log visibility
* Overall system health

The dashboard is designed as an operational control surface rather than a simple analytics page.

---

## 🖥️ Infrastructure & Service Monitoring

OpsGuard includes a dedicated monitoring dashboard for infrastructure and service health.

### Monitoring capabilities

* Active services
* Total logs
* Active incidents
* System health
* CPU usage visualization
* Memory usage visualization
* 24-hour monitoring charts
* Service health visibility

The monitoring interface provides a visual representation of operational metrics and system status.

---

## 🚨 Incident Response & Ticket Management

The incident ticket system provides a structured workflow for managing operational issues.

### Features

* Create new incident tickets
* Search tickets
* Filter by status
* Filter by priority
* Track incident state
* Track resolution
* Export ticket data as CSV

### Incident States

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

OpsGuard provides a dedicated SLA and uptime interface for tracking service reliability.

### Includes

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

Target SLA:      99.9%
Response Target: 300ms
Current Uptime:  99.85%
Status:          MET
```

---

# 🖼️ Application Screenshots

## 01 — Operations Control Dashboard

The central dashboard provides a unified operational view of incidents, tickets, uptime, logs, and system health.

![OpsGuard Operations Dashboard](docs/screenshots/dashboard.png)

---

## 02 — Infrastructure Monitoring Dashboard

Monitor service health, active services, logs, incidents, CPU usage, and memory usage through a dedicated infrastructure monitoring interface.

![OpsGuard Monitoring Dashboard](docs/screenshots/monitoring.png)

---

## 03 — SLA & Uptime

Track service-level targets, uptime, response-time targets, SLA compliance, and service reliability.

![OpsGuard SLA and Uptime](docs/screenshots/sla-uptime.png)

---

## 04 — Incident Ticket System

Manage operational tickets with searching, status filters, priority filters, ticket creation, resolution tracking, and CSV export.

![OpsGuard Incident Tickets](docs/screenshots/incident-tickets.png)

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      OpsGuard        │
                         │ Operations Platform  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    React Frontend    │
                         │  TypeScript + Vite   │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
      │  Dashboard   │      │   Incident   │      │ SLA & Uptime │
      │              │      │   Tickets    │      │  Monitoring  │
      └──────────────┘      └──────────────┘      └──────────────┘
              │                     │                     │
              └─────────────────────┼─────────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Supabase        │
                         │ Authentication + DB  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      PostgreSQL      │
                         └──────────────────────┘
```

---

# 🧰 Technology Stack

## Frontend

* React 18
* TypeScript
* Vite
* React Router
* Tailwind CSS
* Radix UI
* Framer Motion
* Lucide React

## Data & Backend

* Supabase
* PostgreSQL
* Supabase JavaScript Client
* React Query
* Zod

## Visualization

* Recharts

## Testing

* Vitest
* React Testing Library
* TypeScript
* ESLint

## DevOps & Deployment

* GitHub Actions
* Vercel
* Automated build validation
* Security validation
* Dependency auditing

---

# 🔐 Security

Security is integrated into the development workflow.

OpsGuard includes automated validation for:

* Hardcoded secrets
* Exposed service-role keys
* API credentials
* AWS credentials
* GitHub tokens
* Unsafe `eval` / `Function` usage
* Privileged frontend credentials
* Supabase Row Level Security configuration
* TypeScript errors
* Build failures
* Test failures
* ESLint issues
* Dependency vulnerabilities

Run the local security checks with:

```bash
npm run security
```

Additional security information is available in:

```text
SECURITY.md
```

---

# 🧪 Testing & Quality

OpsGuard uses automated development checks to improve reliability and maintainability.

### Run tests

```bash
npm run test
```

### Run linting

```bash
npm run lint
```

### Build the application

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

Make sure you have the following installed:

* Node.js
* npm
* Git
* Supabase project

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

Create a `.env` file from the provided example:

```bash
cp .env.example .env
```

Configure:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

> ⚠️ Never commit private credentials, service-role keys, or sensitive secrets to GitHub.

---

## 4. Start the development server

```bash
npm run dev
```

The application will start using the Vite development server.

---

# 📜 Available Scripts

| Command            | Description              |
| ------------------ | ------------------------ |
| `npm run dev`      | Start development server |
| `npm run build`    | Create production build  |
| `npm run lint`     | Run ESLint               |
| `npm run test`     | Run automated tests      |
| `npm run security` | Run security validation  |

---

# ☁️ Deployment

OpsGuard is deployed using **Vercel**.

The repository includes Vercel configuration for SPA routing and production deployment.

### 🌐 Live Application

[https://opsguard-j7ygzrnec-monish3905.vercel.app/](https://opsguard-j7ygzrnec-monish3905.vercel.app/)

### 💻 Source Code

[https://github.com/Monish03905/OpsGuard](https://github.com/Monish03905/OpsGuard)

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
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   └── ...
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
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
├── vite.config.ts
└── README.md
```

---

# 🔄 Operational Workflow

```text
┌───────────────┐
│   MONITORING  │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│    DETECT     │
│    ISSUE      │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ CREATE TICKET │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ INVESTIGATE   │
│   & RESPOND   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│    RESOLVE    │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ SLA & UPTIME  │
│    TRACKING   │
└───────────────┘
```

---

# 🛣️ Future Roadmap

## Reliability Engineering

* Real-time service health monitoring
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

* AI-powered incident summaries
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

# 🎓 Key Engineering Learnings

Building OpsGuard provided practical experience with:

* Full-stack web development
* React and TypeScript
* Database-driven applications
* Supabase and PostgreSQL
* Operational dashboard development
* Incident management workflows
* SLA and uptime monitoring concepts
* Data visualization
* Automated testing
* Security validation
* CI/CD
* Cloud deployment
* DevOps/SRE-oriented software engineering

---

# 💡 Engineering Approach

OpsGuard was developed around a production-oriented engineering workflow:

```text
             ┌──────────────┐
             │ Architecture │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │ Development  │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │   Database   │
             │ Integration  │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │   Testing    │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │   Security   │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │    CI/CD     │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │  Deployment  │
             └──────────────┘
```

The goal was to build more than a visually appealing dashboard — the project was structured around practical software engineering, reliability, testing, security, and deployment practices.

---

# ⭐ Why This Project Matters

OpsGuard demonstrates practical experience across multiple areas of modern software engineering:

```text
Frontend
   +
Backend / Data
   +
DevOps
   +
Testing
   +
Security
   +
Cloud Deployment
   +
Reliability Engineering
```

It represents a practical attempt to combine these areas into one cohesive engineering project.

---

# 👨‍💻 Author

## Monish Ratan

AI & Data Science Undergraduate

Interested in:

* Software Engineering
* Full-Stack Development
* AI/ML
* Cloud Computing
* DevOps
* Computer Vision
* Backend Engineering

### Profiles

* GitHub: [https://github.com/Monish03905](https://github.com/Monish03905)
* LinkedIn: [https://www.linkedin.com/in/monish-ratan-259695247/](https://www.linkedin.com/in/monish-ratan-259695247/)
* LeetCode: [https://leetcode.com/u/KL2400080018/](https://leetcode.com/u/KL2400080018/)

---

# 📌 Project Links

🌐 **Live Demo**

[https://opsguard-j7ygzrnec-monish3905.vercel.app/](https://opsguard-j7ygzrnec-monish3905.vercel.app/)

💻 **GitHub Repository**

[https://github.com/Monish03905/OpsGuard](https://github.com/Monish03905/OpsGuard)

---

## 🛡️ OpsGuard

> **Observe. Respond. Resolve.**

Built with a focus on **reliability, operational visibility, engineering discipline, and real-world incident response workflows.**

```
```

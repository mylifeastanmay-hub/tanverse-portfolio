# 🌌 Tanverse: Cyberpunk Full-Stack Portfolio & Admin HUD

An immersive, high-fidelity developer portfolio ecosystem featuring an interactive landing page client, a secure administrative HUD control panel, and a serverless Express API backend. The system is designed to run on a dual-engine database architecture (Postgres/SQLite) with permanent asset uploads powered by Vercel Blob.

---

## 🔗 Live Deployments
* **Main Website (Client):** [https://tanverse-portfolio-client.vercel.app](https://tanverse-portfolio-client.vercel.app)
* **Admin HUD Portal:** [https://tanverse-portfolio-admin.vercel.app](https://tanverse-portfolio-admin.vercel.app)
* **Backend API Server:** [https://tanverse-portfolio-backend.vercel.app](https://tanverse-portfolio-backend.vercel.app)

---

## ⚡ Key Features

### 🌌 Immersive Portfolio Client
* **HTML5 Canvas Space Grid:** A fullscreen mouse-reactive particle background drawing connections and warp-stretching dynamically based on cursor movement and viewport scroll velocity.
* **3D Rotating Card Carousel:** A 3D deck carousel displaying projects in perspective with spring-physics mouse tilt tracking and dynamic custom cursors.
* **CPU Career Circuit board:** A technical career timeline designed as a CPU node branching to organization milestones with pulsing vector animation packets.
* **Web Audio UI Soundscape:** An integrated synthesizer engine generating futuristic glide sweeps and transient click tones during navigation.

### 🛠️ Secure Admin HUD Dashboard
* **Dynamic CRUD Managers:** Complete administration portals to add, delete, and modify skills, projects, certificates, experiences, and contact details.
* **Live SVG Vector Editor:** Input custom brand vectors and review them in a real-time preview card template.
* **Visual Color Swatches & Swapping:** Integrated color pickers linked to text values, featuring opacity conversion rules to sync neon color glows.
* **Sequence Re-ordering:** Instantly adjust lists display sequences using database order swapping triggers.

### ☁️ Cloud Infrastructure & Backend
* **Dual-Engine Database Layout:** Built-in adapter targeting cloud PostgreSQL (Neon) with a local SQLite file database fallback for local dev.
* **Vercel Blob Integrations:** Ephemeral serverless container storage is bypassed by uploading assets directly to Vercel Blob CDN.
* **Telemetry & Analytics HUD:** Real-time logging of visitor IP, device agents, and geo-locations mapped to custom administrative bar charts.

---

## 🛠️ Technology Stack
* **Frontend client:** React, Vite, CSS, Web Audio API, Canvas particle vectors
* **Admin panel:** React, TypeScript, Vite, Glassmorphism design system
* **Backend API:** Node.js, Express, JWT Security
* **Data & Storage:** PostgreSQL (Neon), SQLite (Local Fallback), Vercel Blob Storage

---

## 🚀 Local Development Setup

### Prerequisites
* Node.js (v18+)
* npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mylifeastanmay-hub/tanverse-portfolio.git
   cd tanverse-portfolio
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   ```

3. **Install sub-project dependencies:**
   ```bash
   # Install backend dependencies
   cd server
   npm install
   cd ..

   # Install admin dependencies
   cd admin
   npm install
   cd ..
   ```

4. **Environment Variables Config:**
   Create a `.env` file in the `server/` directory:
   ```env
   PORT=5000
   JWT_SECRET=your_custom_secret_key
   ADMIN_PASSWORD=admin123
   DB_TYPE=sqlite
   ```

5. **Start concurrent development servers:**
   From the project root directory, run:
   ```bash
   npm run dev
   ```
   This will boot up the local dev instances concurrently:
   * **Main client:** http://localhost:5174
   * **Admin HUD:** http://localhost:5175
   * **API Backend:** http://localhost:5000

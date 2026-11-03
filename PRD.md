# Project Requirements Document (PRD) - Tanverse Portfolio (v2.0 Major Update)

## Overview
Personal portfolio web application featuring interactive UI, 3D elements, project showcases, credentials fan deck, and administrative CMS.

## Architecture
- **Client**: React 18, TypeScript, Vite, TailwindCSS, Framer Motion, Three.js / HTML5 Canvas, Web Audio API
- **Server**: Node.js / Express, SQLite / PostgreSQL / MSSQL dual-engine adapter, Vercel Blob
- **Admin**: React + TypeScript Portfolio Management HUD (`admin/`)

## Atomic Task Backlog (3-Agent Pipeline: GSD -> Ralph Loop -> CodeRabbit)

### Phase 1: Portfolio Content Expansion (Projects, Experience & Credentials)
- [x] **Task 1.1**: Create 6 custom high-resolution SVG telemetry diagrams in `src/assets/projects/` for the 2 new flagship systems:
  - **AI Precision Irrigation System** (`ai-irrigation-hero.svg`, `ai-irrigation-sub1.svg`, `ai-irrigation-sub2.svg`) — 94.6% Hybrid ML accuracy, ACO multi-zone scheduler, 32.1% water & 20.7% GHG reduction.
  - **VTON Antigravity** (`vton-hero.svg`, `vton-sub1.svg`, `vton-sub2.svg`) — Cross-Site Virtual Try-On Chrome Extension (MV3) + FastAPI CV/IDM-VTON pipeline.
- [x] **Task 1.2**: Expand `PROJECTS` in `src/App.tsx` (and `defaultProjects` in `server/db.js` + `README.md`) to 10 flagship engineering projects, updating the `SectionTransition` counter (`10+ Flagship Projects`, `6 Tech & Leadership Roles`, `30+ Technologies Mastered`).
- [x] **Task 1.3**: Expand `experienceData` in `src/App.tsx` and `defaultExperiences` in `server/db.js` to include **Event Management Head — Prarambh 2025** alongside the 5 existing engineering & leadership roles.
- [x] **Task 1.4**: Expand `CERTIFICATES` in `src/App.tsx` and `defaultCertificates` in `server/db.js` with **Python for Data Science (NPTEL Certification 2026)** and **Introduction to Android Mobile Application Development (Meta / Coursera)**.

### Phase 2: UI/UX, 3D Visuals (`SpaceCanvas.tsx`) & Interactive Animations (`src/App.tsx`)
- [x] **Task 2.1**: Upgrade `src/components/SpaceCanvas.tsx` with 3D depth-layered particles (`z`-depth parallax), interactive click shockwave ripples, cyber data-pulse streaks along constellation edges, `document.hidden` pause optimization, and `prefers-reduced-motion` support.
- [x] **Task 2.2**: Add a floating glassmorphic Sticky HUD Navbar with active section scroll-spy, quick section jump links, and a global Cyber Audio Synthesizer Mute/Unmute toggle (`isAudioMuted`).
- [x] **Task 2.3**: Upgrade the **Skills 3D Hologram Diagnostic Modal** in `src/App.tsx` so clicking any floating 3D skill node displays its full diagnostic telemetry: description, animated proficiency bars (`toolsStats`), tool tags, linked flagship projects, and live memory/CPU telemetry.
- [x] **Task 2.4**: Upgrade the **Projects 3D Deck Carousel** with interactive category filter pills, keyboard arrow navigation (`ArrowLeft` / `ArrowRight`), and quick-jump pagination dots/badges below the deck.

### Phase 3: Backend API (`server/`) & Admin HUD Portal (`admin/`) Synchronization
- [x] **Task 3.1**: Extend the `projects` table schema and CRUD endpoints in `server/db.js` and `server/index.js` to persist and return `description`, `tech`, `metrics`, and `github_url` (with automatic `ALTER TABLE` migration and array parsing in `/api/portfolio`), fixing the bug where backend-loaded projects lacked descriptions, metrics chips, and GitHub links.
- [x] **Task 3.2**: Update `admin/src/App.tsx` Projects CRUD form and cards to support editing `description`, `tech` (comma-separated), `metrics` (comma-separated), and `github_url`, plus resolve image asset keys cleanly.

### Phase 4: Original Backlog Verification & CodeRabbit Review
- [x] **Task 4.1**: Audit responsive design across mobile (`375px`), tablet (`768px`), and desktop (`1440px`), ensuring mobile skill nodes (`clamp(16%, ..., 84%)`) and project cards never overflow horizontally.
- [x] **Task 4.2**: Verify client (`npm run build`), admin (`npm --prefix admin run build`), and server syntax (`node --check server/index.js` & `node --check server/db.js`) build cleanly with zero TypeScript or bundler errors.
- [x] **Task 4.3**: Run CodeRabbit review (`coderabbit review --agent --uncommitted`) and remediate any critical/major findings.

### Phase 5: Vante 3D Ribbon Scroll Hero — Custom Project Photo Slides & Accessible Links (`#projects`)
- [x] **Task 5.1**: Remove the generic external Vante R2 videos and replace them in `src/components/VanteSection.tsx` with dynamic `THREE.CanvasTexture` slides rendering all 10 Tanverse flagship projects' own photos (`col2Img`, `col1Img1`, `col1Img2`) with smooth horizontal parallax slide transitions + Ken Burns zoom and project telemetry HUD overlays.
- [x] **Task 5.2**: Slide all 10 project photo cards along the 3D `CatmullRomCurve3` rail (with backface `uv.x` shader flipping so photos/text are never mirrored) and land them into the 3×2 grid.
- [x] **Task 5.3**: Add accessible HTML action link overlays (`Open Live ↗`, `GitHub ↗`, and `Details` modal trigger) directly aligned over every landed card in the 3×2 grid, plus `←` / `→` batch pagination and bottom quick-jump project buttons.
- [x] **Task 5.4**: Verify production build (`npm run build`), update `PRD.md` & `progress.txt`, and deploy/open in Chrome.

### Phase 6: Interactive Cursor-Tracking Hero Avatar Eyes & Dynamic Emotions (`InteractiveHeroAvatar`)
- [x] **Task 6.1**: Map exact 1254×1254 eye socket coordinates inside the glasses frames of `tanverse-avatar-cutout.png` (`leftEye: [477..595, 635..742]`, `rightEye: [721..843, 635..742]`).
- [x] **Task 6.2**: Build `InteractiveHeroAvatar` in `src/App.tsx` with a 1254×1254 `<canvas>` overlay rendering 3D Pixar-shaded sclera, cursor-tracking chestnut irises/pupils, specular catchlights, natural blinking, 3D head tilt, and 6 dynamic emotions (`curious`, `happy`, `amazed`, `cyber`, `wink`, `love`) driven automatically by cursor velocity/position and clickable mood cycling.
- [x] **Task 6.3**: Build, commit, push to `origin/master`, verify live Vercel production deployment, and open https://tanverse-portfolio-client.vercel.app/ in Chrome.

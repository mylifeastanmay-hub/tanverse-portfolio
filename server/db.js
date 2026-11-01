import sql from 'mssql';
import sqlite3 from 'sqlite3';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const DB_TYPE = process.env.DB_TYPE || (process.env.POSTGRES_URL || process.env.DATABASE_URL ? 'postgres' : 'sqlite');
let sqliteDbPath = process.env.SQLITE_PATH || './data/portfolio.db';

if (process.env.VERCEL && DB_TYPE === 'sqlite') {
  const targetPath = '/tmp/portfolio.db';
  try {
    const sourcePath = path.resolve(process.cwd(), 'data', 'portfolio.db');
    const sourcePathAlt = path.resolve(process.cwd(), 'server', 'data', 'portfolio.db');
    const finalSource = fs.existsSync(sourcePath) ? sourcePath : (fs.existsSync(sourcePathAlt) ? sourcePathAlt : null);
    
    if (finalSource) {
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.copyFileSync(finalSource, targetPath);
      console.log(`Copied database from ${finalSource} to ${targetPath}`);
    }
  } catch (err) {
    console.error('Failed to copy database to /tmp:', err.message);
  }
  sqliteDbPath = targetPath;
}

let mssqlPool = null;
let sqliteDb = null;
let pgPool = null;
let activeDbType = 'sqlite';

// Auto-create data directory for SQLite if it doesn't exist
const sqliteDir = path.dirname(sqliteDbPath);
if (DB_TYPE === 'sqlite' && !fs.existsSync(sqliteDir) && !process.env.VERCEL) {
  fs.mkdirSync(sqliteDir, { recursive: true });
}

// Default Seed Data
const defaultContact = {
  email: 'tanmayverse776@gmail.com',
  phone: '+91 XXXXXXXXXX',
  location: "SVKM's NMIMS MPSTME, Shirpur / Maharashtra, India",
  github_url: 'https://github.com/mylifeastanmay-hub',
  linkedin_url: 'https://linkedin.com/in/tanmaydhoot'
};

const defaultSkills = [
  { num: '01', title: 'Python', category: 'AI / Distributed', desc: 'Engineering edge AI runtimes, ExecuTorch models, PyTorch neural vision pipelines, and asynchronous microservices.', glow_color: 'rgba(55, 118, 171, 0.45)', tools: 'PyTorch, ExecuTorch, FastAPI, NumPy, Pandas, OpenCV, Ray', display_order: 1 },
  { num: '02', title: 'C++', category: 'Low-Latency Systems', desc: 'Developing ultra-fast compute engines, SIMD vectorization, zero-copy packet processing, and algorithmic trees.', glow_color: 'rgba(0, 89, 156, 0.45)', tools: 'C++20, Boost.Asio, SIMD (AVX2), Zero-Copy Networking, CMake, GDB', display_order: 2 },
  { num: '03', title: 'C', category: 'Core Systems & Edge', desc: 'Hardware-level memory management, pointer arithmetic, manual heap allocation, and POSIX system call optimizations.', glow_color: 'rgba(57, 73, 171, 0.45)', tools: 'Pointer Arithmetic, Linux ABI, System Calls, Embedded Drivers', display_order: 3 },
  { num: '04', title: 'DSA', category: 'Algorithms & Discrete', desc: 'Architecting distributed hash tables (Kademlia DHT), Bloom filters, graph traversal, and high-throughput indexes.', glow_color: 'rgba(0, 242, 254, 0.45)', tools: 'Kademlia DHT, Bloom Filters, Consistent Hashing, Graph Theory, DP', display_order: 4 },
  { num: '05', title: 'DBMS', category: 'Data Architecture', desc: 'Designing resilient distributed storage, high-volume transactional schemas, Redis sentinel clusters, and SQL pools.', glow_color: 'rgba(182, 0, 168, 0.45)', tools: 'PostgreSQL, Redis Sentinel, ClickHouse, Connection Pooling, WAL', display_order: 5 },
  { num: '06', title: 'React JS & Vite', category: 'Frontend & WebGL', desc: 'Building responsive 3D cybernetic web applications, custom WebGL canvas shaders, Three.js scenes, and audio synthesizers.', glow_color: 'rgba(97, 218, 251, 0.45)', tools: 'React 18, Vite, Three.js, React Three Fiber, Web Audio API', display_order: 6 },
  { num: '07', title: 'TypeScript', category: 'Strict Typing', desc: 'Enforcing bulletproof type safety across distributed API payloads, abstract syntax trees, and full-stack modules.', glow_color: 'rgba(49, 120, 198, 0.45)', tools: 'Generics, Abstract Syntax Trees, Strict Nulls, Zod Schemas', display_order: 7 },
  { num: '08', title: 'Tailwind CSS', category: 'Modern UI/UX', desc: 'Crafting futuristic cyberpunk glassmorphism interfaces, fluid reactive layouts, and smooth 60fps micro-interactions.', glow_color: 'rgba(56, 189, 248, 0.45)', tools: 'Tailwind CSS, Framer Motion, Glassmorphism, 3D Matrix Transforms', display_order: 8 }
];

const defaultProjects = [
  {
    num: '01',
    name: 'Sentinel Swarm PRO',
    category: 'Edge AI / On-Device Security',
    url: 'https://github.com/mylifeastanmay-hub/sentinel-swarm',
    github_url: 'https://github.com/mylifeastanmay-hub/sentinel-swarm',
    description: 'Zero-cloud on-device ExecuTorch INT8 anomaly detection sentinel with sub-3ms inference latency, multi-agent decentralized coordination, and zero cloud data egress.',
    tech: 'ExecuTorch, PyTorch INT8, Edge AI, Python, Decentralized Swarm',
    metrics: '<3ms Latency, 100% On-Device, INT8 Quantized, Zero Cloud Egress',
    col1Img1: 'sentinelSwarmSub1',
    col1Img2: 'sentinelSwarmSub2',
    col2Img: 'sentinelSwarmHero',
    display_order: 1
  },
  {
    num: '02',
    name: 'AI Precision Irrigation',
    category: 'AI & IoT / Sustainable Agritech',
    url: 'https://github.com/mylifeastanmay-hub/ai-precision-irrigation',
    github_url: 'https://github.com/mylifeastanmay-hub/ai-precision-irrigation',
    description: 'End-to-end sustainable smart irrigation platform combining a Hybrid Stacked ML soil moisture forecasting engine (LSTM + XGBoost + Random Forest) with Ant Colony Optimization (ACO) multi-zone scheduling, ESP32 MQTT telemetry, and multilingual farmer voice advisories.',
    tech: 'FastAPI, PyTorch LSTM, XGBoost, Ant Colony Opt, ESP32 / MQTT, React 18',
    metrics: '94.6% ML Accuracy, -32.1% Water Saved, -32.4% Pump Energy, R² = 0.961',
    col1Img1: 'aiIrrigationSub1',
    col1Img2: 'aiIrrigationSub2',
    col2Img: 'aiIrrigationHero',
    display_order: 2
  },
  {
    num: '03',
    name: 'VTON Antigravity',
    category: 'Computer Vision / Chrome Extension',
    url: 'https://github.com/mylifeastanmay-hub/vton-antigravity',
    github_url: 'https://github.com/mylifeastanmay-hub/vton-antigravity',
    description: 'Cross-site AI Virtual Try-On platform uniting a Manifest V3 Chrome Extension (universal DOM garment scraper & guided webcam studio) with an async FastAPI local CV warping & IDM-VTON cloud diffusion backend, split-view comparison slider, and wardrobe archive.',
    tech: 'FastAPI, OpenCV / PIL, IDM-VTON Diffusion, Chrome MV3, React 18, TypeScript',
    metrics: 'Universal DOM Scraper, Dual Local/Cloud VTON, Split-View Slider, MV3 Side-Drawer',
    col1Img1: 'vtonSub1',
    col1Img2: 'vtonSub2',
    col2Img: 'vtonHero',
    display_order: 3
  },
  {
    num: '04',
    name: 'AegisGateway',
    category: 'Enterprise AI Security Proxy',
    url: 'https://github.com/mylifeastanmay-hub/aegis-gateway',
    github_url: 'https://github.com/mylifeastanmay-hub/aegis-gateway',
    description: 'High-throughput reverse proxy protecting LLMs and AI endpoints with token-bucket rate limiting, prompt injection defenses, and sub-4ms P99 latency.',
    tech: 'FastAPI, Redis, Docker, Python, Reverse Proxy, Security',
    metrics: 'P99 <4ms, Token Bucket, Injection Defense, Docker Container',
    col1Img1: 'aegisGatewaySub1',
    col1Img2: 'aegisGatewaySub2',
    col2Img: 'aegisGatewayHero',
    display_order: 4
  },
  {
    num: '05',
    name: 'Anantam Agri Dashboard',
    category: 'Autonomous UAV & Agritech',
    url: 'https://github.com/mylifeastanmay-hub/anantam-agri-dashboard',
    github_url: 'https://github.com/mylifeastanmay-hub/anantam-agri-dashboard',
    description: 'Fullstack agricultural operations suite with real-time autonomous drone flight path monitoring, live NDVI crop stress spatial mapping, and predictive disease incidence analytics.',
    tech: 'React 18, Vite, Tailwind CSS, Recharts, UAV Telemetry, IoT',
    metrics: 'Real-time Flight Telemetry, Spatial NDVI, Sub-second Charts, Interactive UI',
    col1Img1: 'anantamAgriSub1',
    col1Img2: 'anantamAgriSub2',
    col2Img: 'anantamAgriHero',
    display_order: 5
  },
  {
    num: '06',
    name: 'AI ATS Resume Analyzer',
    category: 'NLP & Career Intelligence',
    url: 'https://github.com/mylifeastanmay-hub/ai-resume-builder',
    github_url: 'https://github.com/mylifeastanmay-hub/ai-resume-builder',
    description: 'AI-powered resume parser and job-fitment engine providing candidate ATS match scoring, missing keyword detection, and customized recommendation generation.',
    tech: 'Streamlit, Python, NLP, PDFPlumber, Scikit-Learn',
    metrics: '94.2% ATS Scorer, Multi-format Parsing, Semantic Fitment, Instant PDF Reports',
    col1Img1: 'aiResumeSub1',
    col1Img2: 'aiResumeSub2',
    col2Img: 'aiResumeHero',
    display_order: 6
  },
  {
    num: '07',
    name: 'MeshWeaver P2P Mesh',
    category: 'Distributed Systems & DHT',
    url: 'https://github.com/mylifeastanmay-hub/meshweaver',
    github_url: 'https://github.com/mylifeastanmay-hub/meshweaver',
    description: 'Decentralized peer-to-peer compute network and task broker built on Kademlia DHT routing with fault-tolerant worker distribution and cryptographic task verification.',
    tech: 'Python, Asyncio, Kademlia DHT, P2P Networking, Distributed Systems',
    metrics: 'O(log N) Routing, Fault-Tolerant, Pure Python, Zero Single Point of Failure',
    col1Img1: 'meshweaverSub1',
    col1Img2: 'meshweaverSub2',
    col2Img: 'meshweaverHero',
    display_order: 7
  },
  {
    num: '08',
    name: 'FUTURE_PE_01 Prompt Engine',
    category: 'GenAI & Cognitive Systems',
    url: 'https://github.com/mylifeastanmay-hub/FUTURE_PE_01',
    github_url: 'https://github.com/mylifeastanmay-hub/FUTURE_PE_01',
    description: 'Production prompt engineering architecture with multi-persona cognitive frameworks, automated few-shot calibration, and strict Pydantic JSON validation schemas.',
    tech: 'Prompt Engineering, GenAI, Few-Shot Calibration, JSON Schemas, LLM Agents',
    metrics: '100% Validated JSON, Multi-Persona, Cognitive Trees, Automated Evaluation',
    col1Img1: 'futurePeSub1',
    col1Img2: 'futurePeSub2',
    col2Img: 'futurePeHero',
    display_order: 8
  },
  {
    num: '09',
    name: 'Grand Azure Enterprise',
    category: 'Fullstack Flask & ORM',
    url: 'https://github.com/mylifeastanmay-hub/grand-azure-hotel',
    github_url: 'https://github.com/mylifeastanmay-hub/grand-azure-hotel',
    description: 'Comprehensive hospitality enterprise suite with 3NF relational database architecture, SQLAlchemy query optimization, automated background task orchestration, and dynamic PDF invoice generation.',
    tech: 'Flask 3.0, SQLAlchemy, MySQL, APScheduler, ReportLab',
    metrics: '3NF Relational Schema, Zero Redundancy, Async Jobs, Dynamic Invoicing',
    col1Img1: 'grandAzureSub1',
    col1Img2: 'grandAzureSub2',
    col2Img: 'grandAzureHero',
    display_order: 9
  },
  {
    num: '10',
    name: 'Tanverse 3D Universe',
    category: 'Creative WebGL & 3D Systems',
    url: 'https://github.com/mylifeastanmay-hub/tanverse-portfolio',
    github_url: 'https://github.com/mylifeastanmay-hub/tanverse-portfolio',
    description: 'Immersive personal developer universe engineered with Three.js, React Three Fiber, Framer Motion spring physics, and a custom Web Audio synthesizer.',
    tech: 'React 18, Three.js, React Three Fiber, Tailwind CSS, Web Audio API',
    metrics: '60 FPS WebGL, Synthesizer Audio, Glassmorphism 3D, Vite Optimized',
    col1Img1: 'portfolioSkillsMockup',
    col1Img2: 'portfolioExperienceMockup',
    col2Img: 'portfolioHeroMockup',
    display_order: 10
  }
];

const defaultExperiences = [
  {
    role: 'Prompt Engineering & AI Intern',
    organization: 'Future Interns',
    period: 'Aug 2026 - Sep 2026',
    description: 'Engineered production-grade prompt templates, few-shot conditioning pipelines, and automated LLM benchmarking suites. Validated hallucination mitigation with RAG integration (CIN: FIT/AUG26/PE3831).',
    glow_color: '#00F2FE',
    icon_svg: `<svg class="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="15" width="70" height="70" rx="16" stroke="#00F2FE" stroke-width="2.5" fill="rgba(0, 242, 254, 0.05)"/><path d="M30 45 L50 30 L70 45 L50 60 Z" stroke="#00F2FE" stroke-width="2.5" fill="none"/><line x1="50" y1="60" x2="50" y2="76" stroke="#00F2FE" stroke-width="2.5"/><circle cx="50" cy="50" r="4" fill="#00F2FE"/></svg>`,
    display_order: 1
  },
  {
    role: 'Lead Module Builder & Contributor',
    organization: 'ZeTheta Algorithms / EduForge',
    period: 'Jul 2026 - Aug 2026',
    description: 'Engineered quantitative algorithmic compute modules, Black-Scholes options pricing estimators, and interactive Monte Carlo portfolio risk analytics tools with responsive client-side visualizations.',
    glow_color: '#10B981',
    icon_svg: `<svg class="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="38" stroke="#10B981" stroke-width="2.5" stroke-dasharray="6 4" fill="none"/><polygon points="50,22 75,68 25,68" stroke="#10B981" stroke-width="2.5" fill="rgba(16, 185, 129, 0.1)"/><circle cx="50" cy="52" r="5" fill="#10B981"/></svg>`,
    display_order: 2
  },
  {
    role: 'Marketing Specialist',
    organization: 'App Development Club, NMIMS Shirpur',
    period: '2025 - Present',
    description: 'Spearheading developer outreach, technical hackathon logistics, and collaborative full-stack projects for NMIMS student community, accelerating campus-wide tech engagement.',
    glow_color: '#00E676',
    icon_svg: `<svg class="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="adcRingGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4A90E2" /><stop offset="50%" stop-color="#00E676" /><stop offset="100%" stop-color="#00FF88" /></linearGradient></defs><circle cx="50" cy="50" r="38" stroke="url(#adcRingGrad)" stroke-width="4" fill="rgba(0, 230, 118, 0.05)"/><path d="M38 44 L50 32 L62 44 M50 34 L50 66" stroke="#00E676" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    display_order: 3
  },
  {
    role: 'Associate Core - Marketing',
    organization: 'AMBIORA TechFest',
    period: 'Mar 2026',
    description: "Core member of the marketing leadership team for Ambiora'26, responsible for national event promotion, tech participant outreach, brand sponsorship visibility, and multi-team collaboration.",
    glow_color: '#FFB800',
    icon_svg: `<svg class="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" stroke="#FFB800" stroke-width="2.5" /><circle cx="50" cy="50" r="42" stroke="rgba(255, 184, 0, 0.1)" stroke-width="1.5" /><line x1="38" y1="12" x2="65" y2="58" stroke="#FFB800" stroke-width="3" stroke-linecap="round" /><line x1="22" y1="78" x2="49" y2="32" stroke="#FFB800" stroke-width="3" stroke-linecap="round" /><line x1="82" y1="62" x2="35" y2="62" stroke="#FFB800" stroke-width="3" stroke-linecap="round" /><circle cx="38" cy="12" r="3.5" fill="#0C0C0C" stroke="#FFB800" stroke-width="2.5" /><circle cx="22" cy="78" r="3.5" fill="#0C0C0C" stroke="#FFB800" stroke-width="2.5" /><circle cx="82" cy="62" r="3.5" fill="#0C0C0C" stroke="#FFB800" stroke-width="2.5" /><path d="M 49 42 L 39 60 L 59 60 Z" stroke="#FFB800" stroke-width="2.5" stroke-linejoin="round" fill="none" /></svg>`,
    display_order: 4
  },
  {
    role: 'Marketing Core',
    organization: 'Protsahan',
    period: 'Feb 2026',
    description: "Core member of the outreach and sponsor management team for Protsahan'26, driving event promotion, audience outreach, social media engagement, and expanding the fest's pan-India footfall.",
    glow_color: '#B600A8',
    icon_svg: `<svg class="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="protsahanGrad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FF6D00" /><stop offset="50%" stop-color="#FF4081" /><stop offset="100%" stop-color="#B600A8" /></linearGradient></defs><path d="M 18 22 C 38 19, 72 19, 82 28 C 92 37, 90 53, 72 56 C 58 58, 44 48, 40 53 C 36 58, 36 73, 50 88 L 48 93 C 35 83, 28 68, 28 50 C 28 36, 34 30, 22 30 Z" fill="url(#protsahanGrad)" stroke="#FFFFFF" stroke-width="2" /><path d="M 38 27 C 52 27, 68 31, 75 39" stroke="#FFFFFF" stroke-width="2.5" opacity="0.75" stroke-linecap="round" /><path d="M 40 42 C 52 44, 62 49, 67 52" stroke="#FFFFFF" stroke-width="1.8" opacity="0.6" stroke-linecap="round" /><circle cx="41" cy="70" r="2.5" fill="#FFFFFF" opacity="0.8" /><line x1="43.5" y1="70" x2="43.5" y2="59" stroke="#FFFFFF" stroke-width="1.5" opacity="0.8" /></svg>`,
    display_order: 5
  },
  {
    role: 'Event Management Head',
    organization: 'Prarambh 2025, NMIMS Shirpur',
    period: 'Sep 2025',
    description: "Led end-to-end event operations, venue logistics, stage scheduling, and cross-functional volunteer coordination for Prarambh'25 at SVKM's NMIMS Mukesh Patel Technology Park, delivering seamless execution across flagship student events.",
    glow_color: '#EC4899',
    icon_svg: `<svg class="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" stroke="#EC4899" stroke-width="2.5" /><circle cx="50" cy="50" r="41" stroke="rgba(236, 72, 153, 0.15)" stroke-width="1.5" /><polygon points="50,22 58,40 78,42 63,55 67,75 50,64 33,75 37,55 22,42 42,40" fill="#1F0916" stroke="#EC4899" stroke-width="2.5" stroke-linejoin="round" /><circle cx="50" cy="50" r="5" fill="#00F2FE" /></svg>`,
    display_order: 6
  }
];

const defaultCertificates = [
  {
    course: 'Google AI Fundamentals',
    issuer: 'Google',
    platform: 'Coursera',
    date: 'Jun 2026',
    verify_url: 'https://coursera.org/verify/NFAGLH20ZUAB',
    glow_color: '#4285F4',
    logo_svg: `<svg viewBox="0 0 48 48" class="w-8 h-8" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 3.2 29.5 1 24 1 14.8 1 7 6.7 3.7 14.7l7 5.4C12.4 14 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7C43.2 37 46.5 31.2 46.5 24.5z"/><path fill="#FBBC05" d="M10.7 28.5A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.7-4.5l-7-5.4A23.2 23.2 0 0 0 .8 24c0 3.8.9 7.4 2.5 10.6l7.4-6.1z"/><path fill="#34A853" d="M24 47c5.5 0 10.1-1.8 13.5-4.9l-7.4-5.7c-1.8 1.2-4 1.9-6.1 1.9-6.3 0-11.6-4.5-13.3-10.5l-7.4 6.1C7.1 41.4 14.9 47 24 47z"/></svg>`,
    display_order: 1,
    deck_name: 'Google'
  },
  {
    course: 'Google AI Professional Track',
    issuer: 'Google',
    platform: 'Google Cloud Skills Boost',
    date: 'Jul 2026',
    verify_url: 'https://coursera.org/verify/NFAGLH20ZUAB',
    glow_color: '#00F2FE',
    logo_svg: `<svg viewBox="0 0 48 48" class="w-8 h-8" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="20" stroke="#00F2FE" stroke-width="2" fill="rgba(0, 242, 254, 0.1)"/><polygon points="24,12 34,30 14,30" fill="#00F2FE"/></svg>`,
    display_order: 2,
    deck_name: 'Google'
  },
  {
    course: 'Amazon ML Summer School 2026',
    issuer: 'Amazon Science',
    platform: 'Amazon Science / ML Programs',
    date: 'Jul 2026',
    verify_url: 'https://amazon.science',
    glow_color: '#FF9900',
    logo_svg: `<svg viewBox="0 0 48 48" class="w-8 h-8" xmlns="http://www.w3.org/2000/svg"><path fill="#FF9900" d="M24 6C14.1 6 6 14.1 6 24s8.1 18 18 18 18-8.1 18-18S33.9 6 24 6zm10 24c-5 4-15 4-20 0 0 0 4 2 10 2s10-2 10-2z"/></svg>`,
    display_order: 3,
    deck_name: 'Amazon Science'
  },
  {
    course: 'Prompt Engineering & Cognitive Systems',
    issuer: 'Future Interns',
    platform: 'Future Interns (CIN: FIT/AUG26/PE3831)',
    date: 'Aug 2026',
    verify_url: 'https://github.com/mylifeastanmay-hub/FUTURE_PE_01',
    glow_color: '#8A2BE2',
    logo_svg: `<svg viewBox="0 0 48 48" class="w-8 h-8" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="32" height="32" rx="8" fill="rgba(138, 43, 226, 0.15)" stroke="#8A2BE2" stroke-width="2"/><text x="14" y="29" fill="#8A2BE2" font-size="14" font-weight="900" font-family="sans-serif">FI</text></svg>`,
    display_order: 4,
    deck_name: 'Future Interns'
  },
  {
    course: 'Lead Module Builder & Quant Tools',
    issuer: 'ZeTheta / EduForge',
    platform: 'EduForge Engineering',
    date: 'Jul - Aug 2026',
    verify_url: 'https://github.com/mylifeastanmay-hub/anantam-agri-dashboard',
    glow_color: '#10B981',
    logo_svg: `<svg viewBox="0 0 48 48" class="w-8 h-8" xmlns="http://www.w3.org/2000/svg"><polygon points="24,8 40,38 8,38" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" stroke-width="2"/><text x="18" y="32" fill="#10B981" font-size="16" font-weight="bold">θ</text></svg>`,
    display_order: 5,
    deck_name: 'ZeTheta / EduForge'
  },
  {
    course: 'Python for Data Science (NPTEL Certification)',
    issuer: 'NPTEL / IIT',
    platform: 'NPTEL SWAYAM',
    date: '2026',
    verify_url: 'https://nptel.ac.in',
    glow_color: '#F59E0B',
    logo_svg: `<svg viewBox="0 0 48 48" class="w-8 h-8" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="10" fill="#1C1408" stroke="#F59E0B" stroke-width="2"/><circle cx="24" cy="24" r="11" fill="none" stroke="#F59E0B" stroke-width="2.2" stroke-dasharray="4 2"/><text x="24" y="28" fill="#F59E0B" font-size="10" font-weight="900" text-anchor="middle" font-family="monospace">IIT</text></svg>`,
    display_order: 6,
    deck_name: 'NPTEL / IIT'
  },
  {
    course: 'Introduction to Android Mobile Application Development',
    issuer: 'Meta',
    platform: 'Coursera',
    date: '2026',
    verify_url: 'https://www.coursera.org/learn/introduction-to-android-mobile-application-development',
    glow_color: '#0668E1',
    logo_svg: `<svg viewBox="0 0 48 48" class="w-8 h-8" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="10" fill="#071324" stroke="#0668E1" stroke-width="2"/><path d="M12 29 C12 20, 18 17, 24 24 C30 31, 36 28, 36 19 C36 14, 31 14, 24 22 C17 30, 12 33, 12 29 Z" fill="none" stroke="#00F2FE" stroke-width="2.8" stroke-linecap="round"/></svg>`,
    display_order: 7,
    deck_name: 'Meta'
  }
];

export async function initDatabase() {
  if (DB_TYPE === 'postgres') {
    try {
      const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
      console.log('Connecting to PostgreSQL database...');
      pgPool = new pg.Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false
        }
      });
      activeDbType = 'postgres';
      console.log('Connected to PostgreSQL successfully.');
      await setupPostgresTables();
      return;
    } catch (err) {
      console.warn('PostgreSQL connection failed. Falling back to SQLite.');
      console.error(err.message);
    }
  }

  if (DB_TYPE === 'mssql') {
    const config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      options: {
        encrypt: true,
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
        connectTimeout: 5000 // fail fast if not running
      }
    };

    try {
      console.log(`Connecting to SQL Server at ${config.server}...`);
      mssqlPool = await sql.connect(config);
      activeDbType = 'mssql';
      console.log('Connected to SQL Server successfully.');
      await setupMssqlTables();
      return;
    } catch (err) {
      console.warn('SQL Server connection failed. Falling back to SQLite.');
      console.error(err.message);
    }
  }

  // SQLite Init (Fallback or Explicit)
  console.log(`Initializing SQLite database at ${sqliteDbPath}...`);
  activeDbType = 'sqlite';
  sqliteDb = new sqlite3.Database(sqliteDbPath, (err) => {
    if (err) {
      console.error('Failed to open SQLite database:', err.message);
      process.exit(1);
    }
  });

  await setupSqliteTables();
}

// SQL Helper execution helper
export async function query(sqlStr, params = []) {
  if (activeDbType === 'postgres') {
    let convertedSql = sqlStr;
    params.forEach((_, index) => {
      convertedSql = convertedSql.replace('?', `$${index + 1}`);
    });
    const result = await pgPool.query(convertedSql, params);
    return result.rows || [];
  } else if (activeDbType === 'mssql') {
    const request = mssqlPool.request();
    // Convert array params into named parameters @p0, @p1, etc.
    let convertedSql = sqlStr;
    params.forEach((param, index) => {
      const paramName = `p${index}`;
      request.input(paramName, param);
      // Replace positional ? with named @pX
      // Be careful: regex replaces the first occurrence of ?
      convertedSql = convertedSql.replace('?', `@${paramName}`);
    });
    const result = await request.query(convertedSql);
    return result.recordset || [];
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sqlStr, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

// Helper to run non-select statements
export async function run(sqlStr, params = []) {
  if (activeDbType === 'postgres') {
    const res = await query(sqlStr, params);
    return { id: res[0]?.id || null, changes: res.length };
  } else if (activeDbType === 'mssql') {
    return query(sqlStr, params);
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.run(sqlStr, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }
}

// Table setup functions
async function setupMssqlTables() {
  // Create tables if they don't exist
  await mssqlPool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'contact_info')
    CREATE TABLE contact_info (
      id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      email VARCHAR(255),
      phone VARCHAR(50),
      location VARCHAR(255),
      github_url VARCHAR(255),
      linkedin_url VARCHAR(255),
      avatar_url VARCHAR(500)
    );

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('contact_info') AND name = 'avatar_url')
    BEGIN
        ALTER TABLE contact_info ADD avatar_url VARCHAR(500) NULL;
    END

    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'skills')
    CREATE TABLE skills (
      id INT IDENTITY(1,1) PRIMARY KEY,
      num VARCHAR(50),
      title VARCHAR(100),
      category VARCHAR(100),
      desc_text TEXT,
      glow_color VARCHAR(100),
      tools VARCHAR(255),
      display_order INT,
      logo_svg TEXT
    );

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('skills') AND name = 'logo_svg')
    BEGIN
        ALTER TABLE skills ADD logo_svg VARCHAR(MAX) NULL;
    END

    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'projects')
    CREATE TABLE projects (
      id INT IDENTITY(1,1) PRIMARY KEY,
      num VARCHAR(50),
      name VARCHAR(100),
      category VARCHAR(100),
      url VARCHAR(255),
      github_url VARCHAR(255),
      description TEXT,
      tech VARCHAR(500),
      metrics VARCHAR(500),
      col1Img1 VARCHAR(255),
      col1Img2 VARCHAR(255),
      col2Img VARCHAR(255),
      display_order INT
    );

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('projects') AND name = 'description')
    BEGIN
        ALTER TABLE projects ADD description TEXT NULL;
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('projects') AND name = 'tech')
    BEGIN
        ALTER TABLE projects ADD tech VARCHAR(500) NULL;
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('projects') AND name = 'metrics')
    BEGIN
        ALTER TABLE projects ADD metrics VARCHAR(500) NULL;
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('projects') AND name = 'github_url')
    BEGIN
        ALTER TABLE projects ADD github_url VARCHAR(255) NULL;
    END

    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'experiences')
    CREATE TABLE experiences (
      id INT IDENTITY(1,1) PRIMARY KEY,
      role VARCHAR(100),
      organization VARCHAR(150),
      period VARCHAR(100),
      description TEXT,
      glow_color VARCHAR(100),
      icon_svg TEXT,
      display_order INT,
      certificate_url VARCHAR(500)
    );

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('experiences') AND name = 'certificate_url')
    BEGIN
        ALTER TABLE experiences ADD certificate_url VARCHAR(500) NULL;
    END

    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'certificates')
    CREATE TABLE certificates (
      id INT IDENTITY(1,1) PRIMARY KEY,
      course VARCHAR(150),
      issuer VARCHAR(100),
      platform VARCHAR(100),
      date VARCHAR(50),
      verify_url VARCHAR(500),
      glow_color VARCHAR(100),
      logo_svg TEXT,
      display_order INT,
      deck_name VARCHAR(100),
      pdf_url VARCHAR(500)
    );

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('certificates') AND name = 'deck_name')
    BEGIN
        ALTER TABLE certificates ADD deck_name VARCHAR(100) NULL;
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('certificates') AND name = 'pdf_url')
    BEGIN
        ALTER TABLE certificates ADD pdf_url VARCHAR(500) NULL;
    END

    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'visits')
    CREATE TABLE visits (
      id INT IDENTITY(1,1) PRIMARY KEY,
      timestamp VARCHAR(100),
      ip VARCHAR(100),
      country VARCHAR(100),
      city VARCHAR(100),
      user_agent VARCHAR(500)
    );

    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'messages')
    CREATE TABLE messages (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255),
      message TEXT,
      timestamp VARCHAR(100)
    );
  `);

  // Seed if empty
  const contactCheck = await mssqlPool.request().query('SELECT COUNT(*) as count FROM contact_info');
  if (contactCheck.recordset[0].count === 0) {
    console.log('Seeding SQL Server contact_info...');
    await mssqlPool.request()
      .input('email', defaultContact.email)
      .input('phone', defaultContact.phone)
      .input('location', defaultContact.location)
      .input('github', defaultContact.github_url)
      .input('linkedin', defaultContact.linkedin_url)
      .query('INSERT INTO contact_info (email, phone, location, github_url, linkedin_url) VALUES (@email, @phone, @location, @github, @linkedin)');
  }

  const skillsCheck = await mssqlPool.request().query('SELECT COUNT(*) as count FROM skills');
  if (skillsCheck.recordset[0].count === 0) {
    console.log('Seeding SQL Server skills...');
    for (const skill of defaultSkills) {
      await mssqlPool.request()
        .input('num', skill.num)
        .input('title', skill.title)
        .input('category', skill.category)
        .input('desc', skill.desc)
        .input('glow', skill.glow_color)
        .input('tools', skill.tools)
        .input('order', skill.display_order)
        .query('INSERT INTO skills (num, title, category, desc_text, glow_color, tools, display_order) VALUES (@num, @title, @category, @desc, @glow, @tools, @order)');
    }
  }

  const projectsCheck = await mssqlPool.request().query('SELECT COUNT(*) as count FROM projects');
  if (projectsCheck.recordset[0].count === 0) {
    console.log('Seeding SQL Server projects...');
    for (const p of defaultProjects) {
      await mssqlPool.request()
        .input('num', p.num)
        .input('name', p.name)
        .input('cat', p.category)
        .input('url', p.url)
        .input('github', p.github_url || p.url)
        .input('desc', p.description || '')
        .input('tech', p.tech || '')
        .input('metrics', p.metrics || '')
        .input('img1', p.col1Img1)
        .input('img2', p.col1Img2)
        .input('img3', p.col2Img)
        .input('order', p.display_order)
        .query('INSERT INTO projects (num, name, category, url, github_url, description, tech, metrics, col1Img1, col1Img2, col2Img, display_order) VALUES (@num, @name, @cat, @url, @github, @desc, @tech, @metrics, @img1, @img2, @img3, @order)');
    }
  }

  const expCheck = await mssqlPool.request().query('SELECT COUNT(*) as count FROM experiences');
  if (expCheck.recordset[0].count === 0) {
    console.log('Seeding SQL Server experiences...');
    for (const e of defaultExperiences) {
      await mssqlPool.request()
        .input('role', e.role)
        .input('org', e.organization)
        .input('period', e.period)
        .input('desc', e.description)
        .input('glow', e.glow_color)
        .input('svg', e.icon_svg)
        .input('order', e.display_order)
        .query('INSERT INTO experiences (role, organization, period, description, glow_color, icon_svg, display_order) VALUES (@role, @org, @period, @desc, @glow, @svg, @order)');
    }
  }

  const certsCheck = await mssqlPool.request().query('SELECT COUNT(*) as count FROM certificates');
  if (certsCheck.recordset[0].count === 0) {
    console.log('Seeding SQL Server certificates...');
    for (const c of defaultCertificates) {
      await mssqlPool.request()
        .input('course', c.course)
        .input('issuer', c.issuer)
        .input('platform', c.platform)
        .input('date', c.date)
        .input('url', c.verify_url)
        .input('glow', c.glow_color)
        .input('logo', c.logo_svg)
        .input('order', c.display_order)
        .input('deck', c.deck_name || c.issuer)
        .input('pdf', c.pdf_url || '')
        .query('INSERT INTO certificates (course, issuer, platform, date, verify_url, glow_color, logo_svg, display_order, deck_name, pdf_url) VALUES (@course, @issuer, @platform, @date, @url, @glow, @logo, @order, @deck, @pdf)');
    }
  }
}

async function setupSqliteTables() {
  return new Promise((resolve, reject) => {
    sqliteDb.serialize(async () => {
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS contact_info (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          email TEXT,
          phone TEXT,
          location TEXT,
          github_url TEXT,
          linkedin_url TEXT,
          avatar_url TEXT
        )
      `);

      sqliteDb.run("ALTER TABLE contact_info ADD COLUMN avatar_url TEXT", (alterErr) => {
        // Ignore error if column already exists
      });

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS skills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          num TEXT,
          title TEXT,
          category TEXT,
          desc_text TEXT,
          glow_color TEXT,
          tools TEXT,
          display_order INTEGER,
          logo_svg TEXT
        )
      `, async (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Safe ALTER TABLE to add logo_svg column to existing skills DB
        sqliteDb.run("ALTER TABLE skills ADD COLUMN logo_svg TEXT", (alterErr) => {
          // Ignore error if column already exists
        });
      });

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          num TEXT,
          name TEXT,
          category TEXT,
          url TEXT,
          github_url TEXT,
          description TEXT,
          tech TEXT,
          metrics TEXT,
          col1Img1 TEXT,
          col1Img2 TEXT,
          col2Img TEXT,
          display_order INTEGER
        )
      `);

      sqliteDb.run("ALTER TABLE projects ADD COLUMN github_url TEXT", () => {});
      sqliteDb.run("ALTER TABLE projects ADD COLUMN description TEXT", () => {});
      sqliteDb.run("ALTER TABLE projects ADD COLUMN tech TEXT", () => {});
      sqliteDb.run("ALTER TABLE projects ADD COLUMN metrics TEXT", () => {});

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS experiences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          role TEXT,
          organization TEXT,
          period TEXT,
          description TEXT,
          glow_color TEXT,
          icon_svg TEXT,
          display_order INTEGER,
          certificate_url TEXT
        )
      `, async (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Safe ALTER TABLE to add certificate_url column to existing DB
        sqliteDb.run("ALTER TABLE experiences ADD COLUMN certificate_url TEXT", (alterErr) => {
          // Ignore error if column already exists
        });

        // Create certificates table
        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS certificates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course TEXT,
            issuer TEXT,
            platform TEXT,
            date TEXT,
            verify_url TEXT,
            glow_color TEXT,
            logo_svg TEXT,
            display_order INTEGER,
            deck_name TEXT,
            pdf_url TEXT
          )
        `);

        // Safe ALTER TABLE to add deck_name column to existing DB
        sqliteDb.run("ALTER TABLE certificates ADD COLUMN deck_name TEXT", (alterErr) => {
          // Ignore error if column already exists
        });

        // Safe ALTER TABLE to add pdf_url column to existing DB
        sqliteDb.run("ALTER TABLE certificates ADD COLUMN pdf_url TEXT", (alterErr) => {
          // Ignore error if column already exists
        });

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS visits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            ip TEXT,
            country TEXT,
            city TEXT,
            user_agent TEXT
          )
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            message TEXT,
            timestamp TEXT
          )
        `);

        // Seed if empty
        try {
          const contactCheck = await query('SELECT COUNT(*) as count FROM contact_info');
          if (contactCheck[0].count === 0) {
            console.log('Seeding SQLite contact_info...');
            await run('INSERT INTO contact_info (id, email, phone, location, github_url, linkedin_url) VALUES (1, ?, ?, ?, ?, ?)', [
              defaultContact.email, defaultContact.phone, defaultContact.location, defaultContact.github_url, defaultContact.linkedin_url
            ]);
          }

          const skillsCheck = await query('SELECT COUNT(*) as count FROM skills');
          if (skillsCheck[0].count === 0) {
            console.log('Seeding SQLite skills...');
            for (const s of defaultSkills) {
              await run('INSERT INTO skills (num, title, category, desc_text, glow_color, tools, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)', [
                s.num, s.title, s.category, s.desc, s.glow_color, s.tools, s.display_order
              ]);
            }
          }

          const projectsCheck = await query('SELECT COUNT(*) as count FROM projects');
          if (projectsCheck[0].count === 0) {
            console.log('Seeding SQLite projects...');
            for (const p of defaultProjects) {
              await run('INSERT INTO projects (num, name, category, url, github_url, description, tech, metrics, col1Img1, col1Img2, col2Img, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                p.num, p.name, p.category, p.url, p.github_url || p.url, p.description || '', p.tech || '', p.metrics || '', p.col1Img1, p.col1Img2, p.col2Img, p.display_order
              ]);
            }
          } else {
            // Backfill missing projects & descriptions on existing SQLite DBs
            for (const p of defaultProjects) {
              const existing = await query('SELECT id, description FROM projects WHERE name = ?', [p.name]);
              if (existing.length === 0) {
                await run('INSERT INTO projects (num, name, category, url, github_url, description, tech, metrics, col1Img1, col1Img2, col2Img, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                  p.num, p.name, p.category, p.url, p.github_url || p.url, p.description || '', p.tech || '', p.metrics || '', p.col1Img1, p.col1Img2, p.col2Img, p.display_order
                ]);
              } else if (!existing[0].description) {
                await run('UPDATE projects SET num = ?, category = ?, url = ?, github_url = ?, description = ?, tech = ?, metrics = ?, col1Img1 = ?, col1Img2 = ?, col2Img = ?, display_order = ? WHERE id = ?', [
                  p.num, p.category, p.url, p.github_url || p.url, p.description || '', p.tech || '', p.metrics || '', p.col1Img1, p.col1Img2, p.col2Img, p.display_order, existing[0].id
                ]);
              }
            }
          }

          const expCheck = await query('SELECT COUNT(*) as count FROM experiences');
          if (expCheck[0].count === 0) {
            console.log('Seeding SQLite experiences...');
            for (const e of defaultExperiences) {
              await run('INSERT INTO experiences (role, organization, period, description, glow_color, icon_svg, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)', [
                e.role, e.organization, e.period, e.description, e.glow_color, e.icon_svg, e.display_order
              ]);
            }
          } else {
            for (const e of defaultExperiences) {
              const existingExp = await query('SELECT id FROM experiences WHERE role = ? AND organization = ?', [e.role, e.organization]);
              if (existingExp.length === 0 && e.role === 'Event Management Head') {
                await run('INSERT INTO experiences (role, organization, period, description, glow_color, icon_svg, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)', [
                  e.role, e.organization, e.period, e.description, e.glow_color, e.icon_svg, e.display_order
                ]);
              }
            }
          }

          const certCheck = await query('SELECT COUNT(*) as count FROM certificates');
          if (certCheck[0].count === 0) {
            console.log('Seeding SQLite certificates...');
            for (const c of defaultCertificates) {
              await run('INSERT INTO certificates (course, issuer, platform, date, verify_url, glow_color, logo_svg, display_order, deck_name, pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                c.course, c.issuer, c.platform, c.date, c.verify_url, c.glow_color, c.logo_svg, c.display_order, c.deck_name || c.issuer, c.pdf_url || ''
              ]);
            }
          } else {
            for (const c of defaultCertificates) {
              const existingCert = await query('SELECT id FROM certificates WHERE course = ?', [c.course]);
              if (existingCert.length === 0 && (c.issuer === 'NPTEL / IIT' || c.issuer === 'Meta')) {
                await run('INSERT INTO certificates (course, issuer, platform, date, verify_url, glow_color, logo_svg, display_order, deck_name, pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                  c.course, c.issuer, c.platform, c.date, c.verify_url, c.glow_color, c.logo_svg, c.display_order, c.deck_name || c.issuer, c.pdf_url || ''
                ]);
              }
            }
          }

          resolve();
        } catch (seedErr) {
          reject(seedErr);
        }
      });
    });
  });
}

async function setupPostgresTables() {
  // Create tables if they don't exist
  await query(`
    CREATE TABLE IF NOT EXISTS contact_info (
      id INT PRIMARY KEY,
      email VARCHAR(255),
      phone VARCHAR(50),
      location VARCHAR(255),
      github_url VARCHAR(255),
      linkedin_url VARCHAR(255),
      avatar_url VARCHAR(500)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS skills (
      id SERIAL PRIMARY KEY,
      num VARCHAR(50),
      title VARCHAR(100),
      category VARCHAR(100),
      desc_text TEXT,
      glow_color VARCHAR(100),
      tools VARCHAR(255),
      display_order INT,
      logo_svg TEXT
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      num VARCHAR(50),
      name VARCHAR(100),
      category VARCHAR(100),
      url VARCHAR(255),
      github_url VARCHAR(255),
      description TEXT,
      tech VARCHAR(500),
      metrics VARCHAR(500),
      col1Img1 VARCHAR(255),
      col1Img2 VARCHAR(255),
      col2Img VARCHAR(255),
      display_order INT
    )
  `);

  try {
    await query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_url VARCHAR(255)");
    await query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT");
    await query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS tech VARCHAR(500)");
    await query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS metrics VARCHAR(500)");
  } catch (e) {
    // Ignore
  }

  await query(`
    CREATE TABLE IF NOT EXISTS experiences (
      id SERIAL PRIMARY KEY,
      role VARCHAR(100),
      organization VARCHAR(150),
      period VARCHAR(100),
      description TEXT,
      glow_color VARCHAR(100),
      icon_svg TEXT,
      display_order INT,
      certificate_url VARCHAR(500)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS certificates (
      id SERIAL PRIMARY KEY,
      course VARCHAR(150),
      issuer VARCHAR(100),
      platform VARCHAR(100),
      date VARCHAR(50),
      verify_url VARCHAR(500),
      glow_color VARCHAR(100),
      logo_svg TEXT,
      display_order INT,
      deck_name VARCHAR(100),
      pdf_url VARCHAR(500)
    )
  `);

  try {
    await query("ALTER TABLE certificates ADD COLUMN IF NOT EXISTS deck_name VARCHAR(100)");
  } catch (e) {
    // Ignore
  }

  try {
    await query("ALTER TABLE certificates ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(500)");
  } catch (e) {
    // Ignore
  }

  await query(`
    CREATE TABLE IF NOT EXISTS visits (
      id SERIAL PRIMARY KEY,
      timestamp VARCHAR(100),
      ip VARCHAR(100),
      country VARCHAR(100),
      city VARCHAR(100),
      user_agent VARCHAR(500)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255),
      message TEXT,
      timestamp VARCHAR(100)
    )
  `);

  // Seed default data if empty
  const contactCheck = await query('SELECT COUNT(*) as count FROM contact_info');
  if (parseInt(contactCheck[0].count, 10) === 0) {
    console.log('Seeding PostgreSQL contact_info...');
    await run('INSERT INTO contact_info (id, email, phone, location, github_url, linkedin_url) VALUES (1, ?, ?, ?, ?, ?)', [
      defaultContact.email, defaultContact.phone, defaultContact.location, defaultContact.github_url, defaultContact.linkedin_url
    ]);
  }

  const skillsCheck = await query('SELECT COUNT(*) as count FROM skills');
  if (parseInt(skillsCheck[0].count, 10) === 0) {
    console.log('Seeding PostgreSQL skills...');
    for (const s of defaultSkills) {
      await run('INSERT INTO skills (num, title, category, desc_text, glow_color, tools, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        s.num, s.title, s.category, s.desc, s.glow_color, s.tools, s.display_order
      ]);
    }
  }

  const projectsCheck = await query('SELECT COUNT(*) as count FROM projects');
  if (parseInt(projectsCheck[0].count, 10) === 0) {
    console.log('Seeding PostgreSQL projects...');
    for (const p of defaultProjects) {
      await run('INSERT INTO projects (num, name, category, url, github_url, description, tech, metrics, col1Img1, col1Img2, col2Img, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        p.num, p.name, p.category, p.url, p.github_url || p.url, p.description || '', p.tech || '', p.metrics || '', p.col1Img1, p.col1Img2, p.col2Img, p.display_order
      ]);
    }
  }

  const expCheck = await query('SELECT COUNT(*) as count FROM experiences');
  if (parseInt(expCheck[0].count, 10) === 0) {
    console.log('Seeding PostgreSQL experiences...');
    for (const e of defaultExperiences) {
      await run('INSERT INTO experiences (role, organization, period, description, glow_color, icon_svg, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        e.role, e.organization, e.period, e.description, e.glow_color, e.icon_svg, e.display_order
      ]);
    }
  }

  const certCheck = await query('SELECT COUNT(*) as count FROM certificates');
  if (parseInt(certCheck[0].count, 10) === 0) {
    console.log('Seeding PostgreSQL certificates...');
    for (const c of defaultCertificates) {
      await run('INSERT INTO certificates (course, issuer, platform, date, verify_url, glow_color, logo_svg, display_order, deck_name, pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        c.course, c.issuer, c.platform, c.date, c.verify_url, c.glow_color, c.logo_svg, c.display_order, c.deck_name || c.issuer, c.pdf_url || ''
      ]);
    }
  }
}

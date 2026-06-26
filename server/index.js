// Polyfills for PDFJS legacy text rendering in Serverless Environments (Vercel)
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {};
}
if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = class ImageData {};
}
if (typeof globalThis.Path2D === 'undefined') {
  globalThis.Path2D = class Path2D {};
}

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { initDatabase, query, run } from './db.js';
import { put } from '@vercel/blob';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cyberpunk_secret_key_9999';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Auto-create uploads directory
const uploadsDir = process.env.VERCEL
  ? '/tmp/uploads'
  : path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
// Set JSON body size limit to 10MB to accommodate base64 images
app.use(express.json({ limit: '10mb' }));

// Disable API Caching
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use('/uploads', express.static(uploadsDir));

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
}

// 1. PUBLIC ENDPOINTS

// Get All Portfolio Data
app.get('/api/portfolio', async (req, res) => {
  try {
    const contact = await query('SELECT * FROM contact_info WHERE id = 1');
    const skills = await query('SELECT * FROM skills ORDER BY display_order ASC, id ASC');
    const projects = await query('SELECT * FROM projects ORDER BY display_order ASC, id ASC');
    const experiences = await query('SELECT * FROM experiences ORDER BY display_order ASC, id ASC');
    const certificates = await query('SELECT * FROM certificates ORDER BY display_order ASC, id ASC');

    // Parse tools string array for each skill
    const parsedSkills = skills.map(s => ({
      ...s,
      tools: s.tools ? s.tools.split(',').map(t => t.trim()) : [],
      // For compatible React rendering
      desc: s.desc_text, 
      glowColor: s.glow_color,
      toolsStats: s.tools ? s.tools.split(',').map(t => ({ name: t.trim(), level: 90 })) : []
    }));

    // Parse project image object structure
    const parsedProjects = projects.map(p => ({
      ...p,
      images: {
        col1Img1: p.col1Img1,
        col1Img2: p.col1Img2,
        col2Img: p.col2Img
      }
    }));

    // Format experiences
    const parsedExperiences = experiences.map(e => ({
      ...e,
      glowColor: e.glow_color,
      icon: e.icon_svg // Raw SVG string to render on frontend
    }));

    res.json({
      contact: contact[0] || {},
      skills: parsedSkills,
      projects: parsedProjects,
      experiences: parsedExperiences,
      certificates: certificates
    });
  } catch (err) {
    console.error('Error fetching portfolio:', err);
    res.status(500).json({ error: 'Failed to retrieve portfolio data.' });
  }
});

// Admin Authentication Login
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET);
    return res.json({ token });
  }
  res.status(401).json({ error: 'Incorrect administrator password.' });
});

// 2. ADMIN PROTECTED CRUD ENDPOINTS

// Contact Info
app.get('/api/contact', authenticateToken, async (req, res) => {
  try {
    const contact = await query('SELECT * FROM contact_info WHERE id = 1');
    res.json(contact[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/contact', authenticateToken, async (req, res) => {
  const { email, phone, location, github_url, linkedin_url, avatar_url } = req.body;
  try {
    await run(
      'UPDATE contact_info SET email = ?, phone = ?, location = ?, github_url = ?, linkedin_url = ?, avatar_url = ? WHERE id = 1',
      [email, phone, location, github_url, linkedin_url, avatar_url || null]
    );
    res.json({ success: true, message: 'Contact information updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Image Upload Endpoint (Handles base64-encoded files securely)
app.post('/api/upload', authenticateToken, async (req, res) => {
  const { filename, base64Data } = req.body;
  if (!filename || !base64Data) {
    return res.status(400).json({ error: 'Missing filename or base64Data payload.' });
  }

  try {
    // Validate base64 data format
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image encoding format.' });
    }

    const type = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    
    // Sanitize filename to prevent path traversal issues
    const baseName = path.basename(filename).replace(/[^a-zA-Z0-9.\-_]/g, '');
    const safeFilename = `${Date.now()}_${baseName}`;

    // 1. If Vercel Blob is configured, upload to it permanently
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      console.log(`Uploading ${safeFilename} to Vercel Blob...`);
      const blob = await put(safeFilename, buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      console.log(`Uploaded successfully. Blob URL: ${blob.url}`);
      return res.json({ success: true, url: blob.url });
    }

    // 2. Local fallback for local development or if token is missing
    const filepath = path.join(uploadsDir, safeFilename);
    await fs.promises.writeFile(filepath, buffer);

    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const publicUrl = `${protocol}://${host}/uploads/${safeFilename}`;
    res.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error('Image upload write error:', err);
    res.status(500).json({ error: 'Failed to write uploaded image.' });
  }
});

// Spacing normalization helpers for PDF text
const cleanTextHeuristics = (t) => {
  if (!t) return '';
  return t.split('\n').map(line => {
    let cleaned = line;
    let prev;
    do {
      prev = cleaned;
      cleaned = cleaned.replace(/([a-zA-Z])\s([a-z])/g, '$1$2');
      cleaned = cleaned.replace(/([0-9])\s([0-9])/g, '$1$2');
    } while (cleaned !== prev);
    return cleaned.trim();
  }).join('\n');
};

const extractCourseName = (t) => {
  const cleaned = cleanTextHeuristics(t);
  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
  
  for (let i = 0; i < lines.length; i++) {
    const lineClean = lines[i].toLowerCase().replace(/\s+/g, '');
    if (lineClean.includes('successfullycompleted') || lineClean.includes('completedtheonline') || lineClean.includes('hascompleted')) {
      for (let j = i - 1; j >= 0; j--) {
        const candidate = lines[j];
        const candClean = candidate.toLowerCase().replace(/\s+/g, '');
        if (candClean.includes('onlinecourse') || 
            candClean.includes('authorizedby') || 
            candClean.includes('offeredthrough') ||
            candClean.includes('specialization') ||
            candClean.includes('professionalcertificate')) {
          continue;
        }
        if (/\b\d{4}\b/.test(candidate)) {
          continue;
        }
        if (candidate.length > 2 && candidate.length < 120) {
          return candidate;
        }
      }
    }
  }

  const cleanText = t.replace(/\s+/g, ' ');
  const pattern1 = /successfully completed\s+([\s\S]+?)\s+(?:an?\s+online|online|a\s+course|authorized by|offered through)/i;
  let match = cleanText.match(pattern1);
  if (match && match[1]) {
    const course = match[1].trim();
    if (course.length > 3 && course.length < 120) return course;
  }
  
  const pattern2 = /successfully completed the online course\s+([\s\S]+?)(?:\s+offered\s+through|\s+authorized\s+by|\s+a\s+course|\s+under\s+the)/i;
  match = cleanText.match(pattern2);
  if (match && match[1]) {
    const course = match[1].trim();
    if (course.length > 3 && course.length < 120) return course;
  }

  return 'AI Certification Course';
};

const extractIssuer = (t) => {
  const lower = t.toLowerCase();
  if (lower.includes('google')) return 'Google';
  if (lower.includes('meta')) return 'Meta';
  if (lower.includes('ibm')) return 'IBM';
  if (lower.includes('microsoft')) return 'Microsoft';
  if (lower.includes('stanford')) return 'Stanford';
  if (lower.includes('amazon') || lower.includes('aws')) return 'Amazon Web Services';
  if (lower.includes('deeplearning.ai') || lower.includes('deeplearning')) return 'DeepLearning.AI';
  if (lower.includes('nvidia')) return 'NVIDIA';
  if (lower.includes('hugging face') || lower.includes('huggingface')) return 'Hugging Face';
  if (lower.includes('openai')) return 'OpenAI';
  
  const cleanedLower = cleanTextHeuristics(t).toLowerCase();
  if (cleanedLower.includes('google')) return 'Google';
  if (cleanedLower.includes('meta')) return 'Meta';
  if (cleanedLower.includes('ibm')) return 'IBM';
  if (cleanedLower.includes('microsoft')) return 'Microsoft';
  if (cleanedLower.includes('stanford')) return 'Stanford';
  if (cleanedLower.includes('amazon') || cleanedLower.includes('aws')) return 'Amazon Web Services';
  if (cleanedLower.includes('deeplearning')) return 'DeepLearning.AI';
  if (cleanedLower.includes('nvidia')) return 'NVIDIA';
  if (cleanedLower.includes('huggingface') || cleanedLower.includes('hugging face')) return 'Hugging Face';
  if (cleanedLower.includes('openai')) return 'OpenAI';
  
  return 'Google';
};

const extractPlatform = (t) => {
  const lower = t.toLowerCase();
  if (lower.includes('coursera')) return 'Coursera';
  if (lower.includes('edx')) return 'edX';
  if (lower.includes('udacity')) return 'Udacity';
  if (lower.includes('udemy')) return 'Udemy';
  
  const cleanedLower = cleanTextHeuristics(t).toLowerCase();
  if (cleanedLower.includes('coursera')) return 'Coursera';
  if (cleanedLower.includes('edx')) return 'edX';
  if (cleanedLower.includes('udacity')) return 'Udacity';
  if (cleanedLower.includes('udemy')) return 'Udemy';
  
  return 'Coursera';
};

const extractDuration = (t) => {
  const cleanText = t.replace(/\s+/g, ' ');
  const hoursRegex = /\b(\d+)\s*(?:hours|hrs)\b/i;
  let match = cleanText.match(hoursRegex);
  if (match && match[1]) return `${match[1]} hours`;
  const weeksRegex = /\b(\d+)\s*(?:weeks|wks)\b/i;
  match = cleanText.match(weeksRegex);
  if (match && match[1]) return `${match[1]} weeks`;
  return '';
};

const extractDate = (t) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
                  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const duration = extractDuration(t);
  const suffix = duration ? ` • ${duration}` : '';

  const cleaned = cleanTextHeuristics(t);

  const dateRegex = /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2},?\s+)?(\d{4})\b/i;
  let match = cleaned.match(dateRegex);
  if (match) {
    const monthStr = match[1];
    const yearStr = match[3];
    const shortMonth = monthStr.substring(0, 3);
    const capitalizedMonth = shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1).toLowerCase();
    return `${capitalizedMonth} ${yearStr}${suffix}`;
  }

  const format2 = /\b(\d{1,2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*-(\d{4})\b/i;
  match = cleaned.match(format2);
  if (match) {
    const monthStr = match[2];
    const yearStr = match[3];
    const shortMonth = monthStr.substring(0, 3);
    const capitalizedMonth = shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1).toLowerCase();
    return `${capitalizedMonth} ${yearStr}${suffix}`;
  }

  const format3 = /\b(\d{4})-(\d{2})-(\d{2})\b/;
  match = cleaned.match(format3);
  if (match) {
    const yearStr = match[1];
    const monthNum = parseInt(match[2], 10);
    if (monthNum >= 1 && monthNum <= 12) {
      const capitalizedMonth = months[monthNum - 1].substring(0, 3);
      return `${capitalizedMonth} ${yearStr}${suffix}`;
    }
  }

  match = t.match(dateRegex);
  if (match) {
    const monthStr = match[1];
    const yearStr = match[3];
    const shortMonth = monthStr.substring(0, 3);
    const capitalizedMonth = shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1).toLowerCase();
    return `${capitalizedMonth} ${yearStr}${suffix}`;
  }

  const now = new Date();
  const currentMonth = months[now.getMonth()].substring(0, 3);
  return `${currentMonth} ${now.getFullYear()}${suffix}`;
};

const extractVerifyUrl = (t) => {
  const cleanNoSpaces = t.replace(/\s+/g, '');
  const courseraVerifyRegex = /coursera\.org\/verify\/([a-z0-9]{12})/i;
  const courseraMatch = cleanNoSpaces.match(courseraVerifyRegex);
  if (courseraMatch) {
    return 'https://coursera.org/verify/' + courseraMatch[1].toUpperCase();
  }

  const genericVerifyRegex = /(?:https?:\/\/)?(?:www\.)?([a-z0-9.-]+\.[a-z]{2,}\/[a-z0-9\-._~%!$&'()*+,;=:@/]*?(?:verify|credential|certificate)[a-z0-9\-._~%!$&'()*+,;=:@/]{5,20})/i;
  const genericMatch = cleanNoSpaces.match(genericVerifyRegex);
  if (genericMatch) {
    let url = genericMatch[1];
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    if (!url.includes('/uploads/') && !url.includes('vercel-storage.com')) {
      return url;
    }
  }

  const urlRegex = /https?:\/\/[^\s]+/g;
  const allUrls = t.match(urlRegex) || [];
  for (const url of allUrls) {
    const cleanUrl = url.replace(/[.,;:)\]]+$/, '');
    if (!cleanUrl.includes('/uploads/') && !cleanUrl.includes('vercel-storage.com')) {
      return cleanUrl;
    }
  }

  return '';
};

const getGlowColor = (issuer) => {
  switch (issuer) {
    case 'Google': return '#4285F4';
    case 'Meta': return '#0668E1';
    case 'IBM': return '#052FAD';
    case 'Microsoft': return '#F25022';
    case 'Stanford': return '#8C1515';
    case 'Amazon Web Services': return '#FF9900';
    case 'DeepLearning.AI': return '#FF6B00';
    case 'NVIDIA': return '#76B900';
    case 'Hugging Face': return '#FFD21E';
    case 'OpenAI': return '#00A3A3';
    default: return '#00F2FE';
  }
};

const getLogoSvg = (issuer) => {
  if (issuer === 'Google') {
    return `<svg viewBox="0 0 48 48" class="w-8 h-8" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 3.2 29.5 1 24 1 14.8 1 7 6.7 3.7 14.7l7 5.4C12.4 14 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7C43.2 37 46.5 31.2 46.5 24.5z"/><path fill="#FBBC05" d="M10.7 28.5A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.7-4.5l-7-5.4A23.2 23.2 0 0 0 .8 24c0 3.8.9 7.4 2.5 10.6l7.4-6.1z"/><path fill="#34A853" d="M24 47c5.5 0 10.1-1.8 13.5-4.9l-7.4-5.7c-1.8 1.2-4 1.9-6.1 1.9-6.3 0-11.6-4.5-13.3-10.5l-7.4 6.1C7.1 41.4 14.9 47 24 47z"/></svg>`;
  }
  if (issuer === 'Meta') {
    return `<svg viewBox="0 0 24 24" class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="#0668E1"><path d="M18.896 11.233c.462-1.782.502-3.238.125-4.321C18.423 5.16 16.92 4 14.945 4c-1.705 0-3.328.784-4.343 2.195C9.587 4.784 7.964 4 6.259 4c-1.975 0-3.478 1.16-4.076 2.912-.377 1.083-.337 2.539.125 4.321C2.96 13.67 4.417 17 9.587 17c1.015 0 2.015-.224 2.015-.224s1-.224 2.015-.224c5.17 0 6.627-3.33 7.279-5.767zM12 15c-3.86 0-4.957-2.613-5.438-4.469-.328-1.266-.3-2.125-.125-2.625.219-.625.75-.906 1.438-.906.656 0 1.281.344 1.719.969C10.094 8.625 10.75 10.5 12 10.5s1.906-1.875 2.406-2.531c.438-.625 1.063-.969 1.719-.969.688 0 1.219.281 1.438.906.175.5.203 1.359-.125 2.625C16.957 12.387 15.86 15 12 15z"/></svg>`;
  }
  if (issuer === 'IBM') {
    return `<svg viewBox="0 0 24 24" class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="#052FAD"><rect y="2" width="24" height="1"/><rect y="4.5" width="24" height="1"/><rect y="7" width="24" height="1"/><rect y="9.5" width="24" height="1"/><rect y="12" width="24" height="1"/><rect y="14.5" width="24" height="1"/><rect y="17" width="24" height="1"/><rect y="19.5" width="24" height="1"/></svg>`;
  }
  if (issuer === 'Microsoft') {
    return `<svg viewBox="0 0 23 23" class="w-8 h-8" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="11" height="11" fill="#F25022"/><rect x="12" y="0" width="11" height="11" fill="#7FBA00"/><rect x="0" y="12" width="11" height="11" fill="#00A4EF"/><rect x="12" y="12" width="11" height="11" fill="#FFB900"/></svg>`;
  }
  if (issuer === 'Amazon Web Services') {
    return `<svg viewBox="0 0 24 24" class="w-8 h-8" fill="none" stroke="#FF9900" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M4 15c4.5 4 11.5 4 16 0" stroke-linecap="round"/><path d="M18 12l2 3-3 1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  if (issuer === 'Stanford') {
    return `<svg viewBox="0 0 24 24" class="w-8 h-8" fill="none" stroke="#8C1515" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="rgba(140, 21, 21, 0.1)"/><path d="M12 22V12M12 12l-4 4m4-4l4 4" stroke-linecap="round"/></svg>`;
  }
  if (issuer === 'DeepLearning.AI') {
    return `<svg viewBox="0 0 24 24" class="w-8 h-8" fill="none" stroke="#FF6B00" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke-dasharray="4 4"/><circle cx="12" cy="12" r="4" fill="#FF6B00"/><circle cx="6" cy="6" r="1.5" fill="#FF6B00"/><circle cx="18" cy="18" r="1.5" fill="#FF6B00"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
};

// Parse certificate PDF to extract details
app.post('/api/parse-pdf', authenticateToken, async (req, res) => {
  const { base64Data, pdfUrl } = req.body;
  if (!base64Data && !pdfUrl) {
    return res.status(400).json({ error: 'Missing base64Data or pdfUrl payload.' });
  }

  try {
    let buffer;
    if (base64Data) {
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid base64 encoding format.' });
      }
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      console.log(`Downloading PDF to parse from URL: ${pdfUrl}`);
      const fetchResponse = await fetch(pdfUrl);
      if (!fetchResponse.ok) {
        return res.status(400).json({ error: `Failed to fetch PDF from URL: ${fetchResponse.statusText}` });
      }
      const arrayBuffer = await fetchResponse.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }
    
    // Parse PDF text
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const textResult = await parser.getText();
    const text = textResult.text;

    const issuer = extractIssuer(text);
    const course = extractCourseName(text);
    const platform = extractPlatform(text);
    const date = extractDate(text);
    const verify_url = extractVerifyUrl(text);
    const glow_color = getGlowColor(issuer);
    const logo_svg = getLogoSvg(issuer);

    res.json({
      success: true,
      course,
      issuer,
      platform,
      date,
      verify_url,
      glow_color,
      logo_svg,
      deck_name: issuer
    });
  } catch (err) {
    console.error('PDF parsing error:', err);
    res.status(500).json({ error: 'Failed to parse PDF.' });
  }
});

// Test route for PDF parsing debug
app.get('/api/test-parse', async (req, res) => {
  const { pdfUrl } = req.query;
  if (!pdfUrl) {
    return res.status(400).json({ error: 'Missing pdfUrl parameter.' });
  }

  try {
    console.log(`Downloading test PDF from URL: ${pdfUrl}`);
    const fetchResponse = await fetch(pdfUrl);
    if (!fetchResponse.ok) {
      return res.status(400).json({ error: `Failed to fetch PDF: ${fetchResponse.statusText}` });
    }
    const arrayBuffer = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const textResult = await parser.getText();
    const text = textResult.text;


    res.json({
      success: true,
      rawTextLength: text.length,
      rawTextSample: text.substring(0, 2000),
      extracted: {
        course: extractCourseName(text),
        issuer: extractIssuer(text),
        platform: extractPlatform(text),
        date: extractDate(text),
        verify_url: extractVerifyUrl(text)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// SKILLS CRUD
app.post('/api/skills', authenticateToken, async (req, res) => {
  const { num, title, category, desc, glow_color, tools, display_order, logo_svg } = req.body;
  try {
    await run(
      'INSERT INTO skills (num, title, category, desc_text, glow_color, tools, display_order, logo_svg) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [num, title, category, desc, glow_color, tools, display_order || 99, logo_svg || '']
    );
    res.json({ success: true, message: 'Skill successfully created.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/skills/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { num, title, category, desc, glow_color, tools, display_order, logo_svg } = req.body;
  try {
    await run(
      'UPDATE skills SET num = ?, title = ?, category = ?, desc_text = ?, glow_color = ?, tools = ?, display_order = ?, logo_svg = ? WHERE id = ?',
      [num, title, category, desc, glow_color, tools, display_order, logo_svg || '', id]
    );
    res.json({ success: true, message: 'Skill successfully updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/skills/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM skills WHERE id = ?', [id]);
    res.json({ success: true, message: 'Skill deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PROJECTS CRUD
app.post('/api/projects', authenticateToken, async (req, res) => {
  const { num, name, category, url, col1Img1, col1Img2, col2Img, display_order } = req.body;
  try {
    await run(
      'INSERT INTO projects (num, name, category, url, col1Img1, col1Img2, col2Img, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [num, name, category, url, col1Img1, col1Img2, col2Img, display_order || 99]
    );
    res.json({ success: true, message: 'Project successfully created.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { num, name, category, url, col1Img1, col1Img2, col2Img, display_order } = req.body;
  try {
    await run(
      'UPDATE projects SET num = ?, name = ?, category = ?, url = ?, col1Img1 = ?, col1Img2 = ?, col2Img = ?, display_order = ? WHERE id = ?',
      [num, name, category, url, col1Img1, col1Img2, col2Img, display_order, id]
    );
    res.json({ success: true, message: 'Project successfully updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ success: true, message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// EXPERIENCES CRUD
app.post('/api/experiences', authenticateToken, async (req, res) => {
  const { role, organization, period, description, glow_color, icon_svg, display_order, certificate_url } = req.body;
  try {
    await run(
      'INSERT INTO experiences (role, organization, period, description, glow_color, icon_svg, display_order, certificate_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [role, organization, period, description, glow_color, icon_svg, display_order || 99, certificate_url || '']
    );
    res.json({ success: true, message: 'Experience entry successfully created.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/experiences/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { role, organization, period, description, glow_color, icon_svg, display_order, certificate_url } = req.body;
  try {
    await run(
      'UPDATE experiences SET role = ?, organization = ?, period = ?, description = ?, glow_color = ?, icon_svg = ?, display_order = ?, certificate_url = ? WHERE id = ?',
      [role, organization, period, description, glow_color, icon_svg, display_order, certificate_url || '', id]
    );
    res.json({ success: true, message: 'Experience entry successfully updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/experiences/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM experiences WHERE id = ?', [id]);
    res.json({ success: true, message: 'Experience entry deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CERTIFICATES CRUD
app.post('/api/certificates', authenticateToken, async (req, res) => {
  const { course, issuer, platform, date, verify_url, glow_color, logo_svg, display_order, deck_name, pdf_url } = req.body;
  try {
    await run(
      'INSERT INTO certificates (course, issuer, platform, date, verify_url, glow_color, logo_svg, display_order, deck_name, pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [course, issuer, platform, date, verify_url, glow_color, logo_svg, display_order || 99, deck_name || issuer || 'Other', pdf_url || '']
    );
    res.json({ success: true, message: 'Certificate successfully created.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/certificates/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { course, issuer, platform, date, verify_url, glow_color, logo_svg, display_order, deck_name, pdf_url } = req.body;
  try {
    await run(
      'UPDATE certificates SET course = ?, issuer = ?, platform = ?, date = ?, verify_url = ?, glow_color = ?, logo_svg = ?, display_order = ?, deck_name = ?, pdf_url = ? WHERE id = ?',
      [course, issuer, platform, date, verify_url, glow_color, logo_svg, display_order, deck_name || issuer || 'Other', pdf_url || '', id]
    );
    res.json({ success: true, message: 'Certificate successfully updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/certificates/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM certificates WHERE id = ?', [id]);
    res.json({ success: true, message: 'Certificate deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Telemetry & Visitor Logging
app.post('/api/visits', async (req, res) => {
  const { ip, country, city, user_agent } = req.body;
  const timestamp = new Date().toISOString();
  try {
    await run(
      'INSERT INTO visits (timestamp, ip, country, city, user_agent) VALUES (?, ?, ?, ?, ?)',
      [timestamp, ip || 'Unknown', country || 'Unknown', city || 'Unknown', user_agent || req.headers['user-agent'] || 'Unknown']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Live Messages / Contact Submissions
app.post('/api/messages', async (req, res) => {
  const { name, email, message } = req.body;
  const timestamp = new Date().toISOString();
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing message fields.' });
  }
  try {
    await run(
      'INSERT INTO messages (name, email, message, timestamp) VALUES (?, ?, ?, ?)',
      [name, email, message, timestamp]
    );
    res.json({ success: true, message: 'Message recorded.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Authorized Analytics HUD
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const visits = await query('SELECT * FROM visits ORDER BY id DESC');
    const messages = await query('SELECT * FROM messages ORDER BY id DESC');

    // Calculate aggregated metrics
    const totalVisits = visits.length;
    const totalMessages = messages.length;

    // Unique countries count
    const uniqueCountries = [...new Set(visits.map(v => v.country).filter(Boolean))].length;

    // Geography breakdown for chart metrics (top 5 countries)
    const countryCounts = {};
    visits.forEach(v => {
      const c = v.country || 'Unknown';
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    });
    const countryBreakdown = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // City breakdown
    const cityCounts = {};
    visits.forEach(v => {
      const c = v.city || 'Unknown';
      cityCounts[c] = (cityCounts[c] || 0) + 1;
    });
    const cityBreakdown = Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      metrics: {
        totalVisits,
        totalMessages,
        uniqueCountries
      },
      recentVisits: visits.slice(0, 20),
      recentMessages: messages,
      countryBreakdown,
      cityBreakdown
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Message
app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM messages WHERE id = ?', [id]);
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// JWT Token Auto-Renewal
app.post('/api/refresh-token', authenticateToken, (req, res) => {
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET);
  res.json({ token });
});

// Initialize database and start server
if (!process.env.VERCEL) {
  initDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });
} else {
  // On Vercel, initialize database asynchronously
  initDatabase().catch(err => {
    console.error('Database initialization failed on Vercel:', err);
  });
}

export default app;

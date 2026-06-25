import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { initDatabase, query, run } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cyberpunk_secret_key_9999';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Auto-create uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
// Set JSON body size limit to 10MB to accommodate base64 images
app.use(express.json({ limit: '10mb' }));
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
    const filepath = path.join(uploadsDir, safeFilename);

    await fs.promises.writeFile(filepath, buffer);

    const publicUrl = `http://localhost:${PORT}/uploads/${safeFilename}`;
    res.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error('Image upload write error:', err);
    res.status(500).json({ error: 'Failed to write uploaded image to disk.' });
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
  const { course, issuer, platform, date, verify_url, glow_color, logo_svg, display_order } = req.body;
  try {
    await run(
      'INSERT INTO certificates (course, issuer, platform, date, verify_url, glow_color, logo_svg, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [course, issuer, platform, date, verify_url, glow_color, logo_svg, display_order || 99]
    );
    res.json({ success: true, message: 'Certificate successfully created.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/certificates/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { course, issuer, platform, date, verify_url, glow_color, logo_svg, display_order } = req.body;
  try {
    await run(
      'UPDATE certificates SET course = ?, issuer = ?, platform = ?, date = ?, verify_url = ?, glow_color = ?, logo_svg = ?, display_order = ? WHERE id = ?',
      [course, issuer, platform, date, verify_url, glow_color, logo_svg, display_order, id]
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
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});

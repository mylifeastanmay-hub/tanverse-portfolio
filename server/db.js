import sql from 'mssql';
import sqlite3 from 'sqlite3';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const DB_TYPE = process.env.DB_TYPE || (process.env.POSTGRES_URL || process.env.DATABASE_URL ? 'postgres' : 'sqlite');
const sqliteDbPath = process.env.SQLITE_PATH || './data/portfolio.db';

let mssqlPool = null;
let sqliteDb = null;
let pgPool = null;
let activeDbType = 'sqlite';

// Auto-create data directory for SQLite if it doesn't exist
const sqliteDir = path.dirname(sqliteDbPath);
if (DB_TYPE === 'sqlite' && !fs.existsSync(sqliteDir)) {
  fs.mkdirSync(sqliteDir, { recursive: true });
}

// Default Seed Data
const defaultContact = {
  email: 'tanmayverse776@gmail.com',
  phone: '+91 XXXXXXXXXX',
  location: 'Maharashtra, India',
  github_url: 'https://github.com/tanmay-dhoot',
  linkedin_url: 'https://www.linkedin.com/in/tanmay-dhoot-402949257'
};

const defaultSkills = [
  { num: '01', title: 'Python', category: 'Backend/AI', desc: 'Creating artificial intelligence models, deep neural networks, and automated backend scripts.', glow_color: 'rgba(55, 118, 171, 0.45)', tools: 'TensorFlow, Jupyter, Pandas, NumPy', display_order: 1 },
  { num: '02', title: 'C++', category: 'Languages', desc: 'Structuring algorithmic computations, solving competitive challenges, and running high-speed compute loops.', glow_color: 'rgba(0, 89, 156, 0.45)', tools: 'GDB, GCC, CMake, DSA Foundations', display_order: 2 },
  { num: '03', title: 'C', category: 'Systems', desc: 'Managing low-level memory layout, pointer variables, compile links, and basic hardware calls.', glow_color: 'rgba(57, 73, 171, 0.45)', tools: 'Pointer Ops, Memory Allocation, Assembly Base', display_order: 3 },
  { num: '04', title: 'DSA', category: 'Core CS', desc: 'Optimizing code execution runtime, building trees/graphs, and minimizing space requirements.', glow_color: 'rgba(0, 242, 254, 0.45)', tools: 'Big-O Notation, Graph Traversal, Search Trees', display_order: 4 },
  { num: '05', title: 'DBMS', category: 'Infrastructure', desc: 'Designing relational database layouts, executing SQL queries, indexing entries, and linking API data stores.', glow_color: 'rgba(182, 0, 168, 0.45)', tools: 'PostgreSQL, SQL Queries, DB Normalization', display_order: 5 }
];

const defaultProjects = [
  { num: '01', name: 'Foundly Platform', category: 'Personal Product', url: 'https://foundly-theta.vercel.app/', col1Img1: 'foundlyHero', col1Img2: 'foundlyStudent', col2Img: 'foundlyHero', display_order: 1 },
  { num: '02', name: 'Interactive 3D Portfolio', category: 'Personal Showcase', url: 'https://github.com/tanmay-dhoot/3d-portfolio', col1Img1: '', col1Img2: '', col2Img: '', display_order: 2 }
];

const defaultExperiences = [
  {
    role: 'Associate core',
    organization: 'AMBIORA TechFest',
    period: 'Mar 2026',
    description: "Core member of the marketing team for Ambiora'26, responsible for event promotion, participant outreach, social media engagement, and brand visibility. Collaborated with multiple teams to enhance the fest's reach and impact.",
    glow_color: '#00F2FE',
    icon_svg: `<svg class="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" stroke="#00F2FE" stroke-width="2.5" /><circle cx="50" cy="50" r="42" stroke="rgba(0, 242, 254, 0.1)" stroke-width="1.5" /><line x1="38" y1="12" x2="65" y2="58" stroke="#00F2FE" stroke-width="3" stroke-linecap="round" /><line x1="22" y1="78" x2="49" y2="32" stroke="#00F2FE" stroke-width="3" stroke-linecap="round" /><line x1="82" y1="62" x2="35" y2="62" stroke="#00F2FE" stroke-width="3" stroke-linecap="round" /><circle cx="38" cy="12" r="3.5" fill="#0C0C0C" stroke="#00F2FE" stroke-width="2.5" /><circle cx="22" cy="78" r="3.5" fill="#0C0C0C" stroke="#00F2FE" stroke-width="2.5" /><circle cx="82" cy="62" r="3.5" fill="#0C0C0C" stroke="#00F2FE" stroke-width="2.5" /><path d="M 49 42 L 39 60 L 59 60 Z" stroke="#00F2FE" stroke-width="2.5" stroke-linejoin="round" fill="none" /></svg>`,
    display_order: 1
  },
  {
    role: 'Marketing core',
    organization: 'Protsahan',
    period: 'Feb 2026',
    description: "Core member of the marketing team for Protsahan'26, responsible for event promotion, audience outreach, social media engagement, and enhancing the fest's visibility. Collaborated with multiple teams to ensure successful execution and greater participation.",
    glow_color: '#B600A8',
    icon_svg: `<svg class="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="protsahanGrad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FF6D00" /><stop offset="50%" stop-color="#FF4081" /><stop offset="100%" stop-color="#B600A8" /></linearGradient></defs><path d="M 18 22 C 38 19, 72 19, 82 28 C 92 37, 90 53, 72 56 C 58 58, 44 48, 40 53 C 36 58, 36 73, 50 88 L 48 93 C 35 83, 28 68, 28 50 C 28 36, 34 30, 22 30 Z" fill="url(#protsahanGrad)" stroke="#FFFFFF" stroke-width="2" /><path d="M 38 27 C 52 27, 68 31, 75 39" stroke="#FFFFFF" stroke-width="2.5" opacity="0.75" stroke-linecap="round" /><path d="M 40 42 C 52 44, 62 49, 67 52" stroke="#FFFFFF" stroke-width="1.8" opacity="0.6" stroke-linecap="round" /><circle cx="41" cy="70" r="2.5" fill="#FFFFFF" opacity="0.8" /><line x1="43.5" y1="70" x2="43.5" y2="59" stroke="#FFFFFF" stroke-width="1.5" opacity="0.8" /></svg>`,
    display_order: 2
  },
  {
    role: 'Marketing Specialist',
    organization: 'App Development Club, NMIMS Shirpur',
    period: '2025 - Present',
    description: "Part of the Marketing Team at the App Development Club, working on event promotions, audience engagement, and outreach activities to expand the club's reach and impact.",
    glow_color: '#D7E2EA',
    icon_svg: `<svg class="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="adcRingGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4A90E2" /><stop offset="50%" stop-color="#00E676" /><stop offset="100%" stop-color="#00FF88" /></linearGradient></defs><path d="M 12 28 A 12 12 0 0 1 34 22 L 32 30 Z" fill="#78C257" /><line x1="20" y1="21" x2="16" y2="13" stroke="#78C257" stroke-width="2" stroke-linecap="round" /><line x1="28" y1="21" x2="32" y2="13" stroke="#78C257" stroke-width="2" stroke-linecap="round" /><circle cx="21" cy="24" r="1" fill="#000000" /><circle cx="29" cy="24" r="1" fill="#000000" /><path d="M 68 18 C 72 15, 78 18, 80 22 C 77 24, 76 28, 79 31 C 76 35, 72 35, 70 33 C 68 35, 64 33, 64 30 C 64 25, 68 21, 68 18 Z" fill="#555555" /><path d="M 74 15 C 74 12, 77 10, 79 10 C 79 12, 77 15, 74 15 Z" fill="#555555" /><path d="M 62 68 L 78 52 L 78 68 Z" fill="#3F51B5" /><path d="M 62 68 L 78 68 L 78 84 Z" fill="#00BCD4" /><circle cx="50" cy="50" r="34" stroke="url(#adcRingGrad)" stroke-width="5" /><circle cx="50" cy="50" r="31" fill="#FFFFFF" /><text x="31" y="59" fill="#00C853" font-size="24" font-weight="900" font-family="'Kanit', sans-serif">A</text><text x="57" y="59" fill="#2979FF" font-size="24" font-weight="900" font-family="'Kanit', sans-serif">D</text><path d="M 48 38 L 54 38 L 51 60 Z" fill="#757575" /><path d="M 47 36 L 55 36 L 51 62 Z" stroke="#00C853" stroke-width="1.2" fill="none" /></svg>`,
    display_order: 3
  }
];

const defaultCertificates = [
  {
    course: 'AI Fundamentals',
    issuer: 'Google',
    platform: 'Coursera',
    date: 'Jun 2026',
    verify_url: 'https://coursera.org/verify/NFAGLH20ZUAB',
    glow_color: '#4285F4',
    logo_svg: `<svg viewBox="0 0 48 48" class="w-8 h-8" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 3.2 29.5 1 24 1 14.8 1 7 6.7 3.7 14.7l7 5.4C12.4 14 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7C43.2 37 46.5 31.2 46.5 24.5z"/><path fill="#FBBC05" d="M10.7 28.5A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.7-4.5l-7-5.4A23.2 23.2 0 0 0 .8 24c0 3.8.9 7.4 2.5 10.6l7.4-6.1z"/><path fill="#34A853" d="M24 47c5.5 0 10.1-1.8 13.5-4.9l-7.4-5.7c-1.8 1.2-4 1.9-6.1 1.9-6.3 0-11.6-4.5-13.3-10.5l-7.4 6.1C7.1 41.4 14.9 47 24 47z"/></svg>`,
    display_order: 1
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
      col1Img1 VARCHAR(255),
      col1Img2 VARCHAR(255),
      col2Img VARCHAR(255),
      display_order INT
    );

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
      display_order INT
    );

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
        .input('img1', p.col1Img1)
        .input('img2', p.col1Img2)
        .input('img3', p.col2Img)
        .input('order', p.display_order)
        .query('INSERT INTO projects (num, name, category, url, col1Img1, col1Img2, col2Img, display_order) VALUES (@num, @name, @cat, @url, @img1, @img2, @img3, @order)');
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
        .query('INSERT INTO certificates (course, issuer, platform, date, verify_url, glow_color, logo_svg, display_order) VALUES (@course, @issuer, @platform, @date, @url, @glow, @logo, @order)');
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
          col1Img1 TEXT,
          col1Img2 TEXT,
          col2Img TEXT,
          display_order INTEGER
        )
      `);

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
            display_order INTEGER
          )
        `);

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
              await run('INSERT INTO projects (num, name, category, url, col1Img1, col1Img2, col2Img, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
                p.num, p.name, p.category, p.url, p.col1Img1, p.col1Img2, p.col2Img, p.display_order
              ]);
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
          }

          const certCheck = await query('SELECT COUNT(*) as count FROM certificates');
          if (certCheck[0].count === 0) {
            console.log('Seeding SQLite certificates...');
            for (const c of defaultCertificates) {
              await run('INSERT INTO certificates (course, issuer, platform, date, verify_url, glow_color, logo_svg, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
                c.course, c.issuer, c.platform, c.date, c.verify_url, c.glow_color, c.logo_svg, c.display_order
              ]);
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
      col1Img1 VARCHAR(255),
      col1Img2 VARCHAR(255),
      col2Img VARCHAR(255),
      display_order INT
    )
  `);

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
      display_order INT
    )
  `);

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
      await run('INSERT INTO projects (num, name, category, url, col1Img1, col1Img2, col2Img, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
        p.num, p.name, p.category, p.url, p.col1Img1, p.col1Img2, p.col2Img, p.display_order
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
      await run('INSERT INTO certificates (course, issuer, platform, date, verify_url, glow_color, logo_svg, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
        c.course, c.issuer, c.platform, c.date, c.verify_url, c.glow_color, c.logo_svg, c.display_order
      ]);
    }
  }
}

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  LogOut, 
  Trash2, 
  Edit, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Mail, 
  Phone, 
  MapPin, 
  Folder, 
  Award, 
  Cpu, 
  Globe, 
  Check, 
  X,
  BadgeCheck,
  Activity
} from 'lucide-react';

const GithubIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// Interfaces matching backend models
interface Skill {
  id: number;
  num: string;
  title: string;
  category: string;
  desc_text?: string;
  desc?: string; // mapped by backend
  glow_color: string;
  tools: string | string[];
  display_order: number;
  logo_svg?: string;
}

interface Project {
  id: number;
  num: string;
  name: string;
  category: string;
  url: string;
  col1Img1: string;
  col1Img2: string;
  col2Img: string;
  display_order: number;
}

interface Experience {
  id: number;
  role: string;
  organization: string;
  period: string;
  description: string;
  glow_color: string;
  icon_svg: string;
  display_order: number;
  certificate_url?: string;
}

interface Certificate {
  id: number;
  course: string;
  issuer: string;
  platform: string;
  date: string;
  verify_url: string;
  glow_color: string;
  logo_svg: string;
  display_order: number;
  deck_name?: string;
  pdf_url?: string;
}

interface Contact {
  email: string;
  phone: string;
  location: string;
  github_url: string;
  linkedin_url: string;
  avatar_url?: string;
}

interface ImageUploaderProps {
  label: string;
  id: string;
  value: string;
  onChange: (url: string) => void;
  token: string | null;
}

function ImageUploader({ label, id, value, onChange, token }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              filename: file.name,
              base64Data
            })
          });

          const data = await response.json();
          if (response.ok && data.url) {
            onChange(data.url);
          } else {
            setError(data.error || 'Upload failed.');
          }
        } catch (err) {
          setError('Failed to reach upload server.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to read file.');
      setIsUploading(false);
    }
  };

  return (
    <div className="form-group" style={{ marginBottom: '16px' }}>
      <label className="form-label" htmlFor={id}>{label}</label>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
        <input 
          id={id} 
          type="text" 
          className="form-input" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          placeholder="Upload file or enter URL..."
          style={{ flexGrow: 1 }}
        />
        
        <label className="btn btn-secondary" style={{ 
          cursor: 'pointer', 
          flexShrink: 0, 
          padding: '8px 12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          fontSize: '0.8rem',
          margin: 0
        }}>
          {isUploading ? (
            <div className="spinner" style={{ width: '14px', height: '14px', margin: 0 }}></div>
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          <span>Upload</span>
          <input 
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>

      {error && (
        <p style={{ color: 'var(--color-rose)', fontSize: '0.75rem', marginTop: '4px', margin: 0 }}>
          {error}
        </p>
      )}

      {value && (
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Preview:</span>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '6px', 
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={value} 
              alt="Preview" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const convertToHex = (colorStr: string): string => {
  if (!colorStr) return '#00f2fe';
  const str = colorStr.trim();
  if (str.startsWith('#')) {
    if (str.length === 4) {
      return '#' + str[1] + str[1] + str[2] + str[2] + str[3] + str[3];
    }
    return str.substring(0, 7);
  }
  if (str.startsWith('rgba') || str.startsWith('rgb')) {
    const matches = str.match(/\d+/g);
    if (matches && matches.length >= 3) {
      const r = parseInt(matches[0]);
      const g = parseInt(matches[1]);
      const b = parseInt(matches[2]);
      return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    }
  }
  return '#00f2fe';
};

const hexToRgba = (hex: string, alpha = 0.45): string => {
  const matches = hex.match(/[a-fA-F0-9]{2}/g);
  if (matches && matches.length >= 3) {
    const r = parseInt(matches[0], 16);
    const g = parseInt(matches[1], 16);
    const b = parseInt(matches[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
};

interface LogoUploaderProps {
  id: string;
  onUploadComplete: (htmlImgTag: string) => void;
  token: string | null;
  imgClass?: string;
}

function LogoUploader({ id, onUploadComplete, token, imgClass = "w-14 h-14 object-contain" }: LogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [blendMode, setBlendMode] = useState<'none' | 'white' | 'black'>('white');
  const [error, setError] = useState('');

  const processAndUpload = async (file: File) => {
    setIsUploading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        let base64Data = reader.result as string;

        if (blendMode === 'white' || blendMode === 'black') {
          base64Data = await new Promise<string>((resolve) => {
            const img = new Image();
            img.src = base64Data;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                resolve(base64Data);
                return;
              }
              ctx.drawImage(img, 0, 0);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;
              const w = canvas.width;
              const h = canvas.height;
              const visited = new Uint8Array(w * h);
              const queue: [number, number][] = [];

              const checkAndAdd = (x: number, y: number) => {
                const idx = y * w + x;
                if (visited[idx]) return;
                visited[idx] = 1;

                const pIdx = idx * 4;
                const r = data[pIdx];
                const g = data[pIdx+1];
                const b = data[pIdx+2];

                if (blendMode === 'white') {
                  if (r > 215 && g > 215 && b > 215) {
                    queue.push([x, y]);
                  }
                } else if (blendMode === 'black') {
                  if (r < 40 && g < 40 && b < 40) {
                    queue.push([x, y]);
                  }
                }
              };

              for (const x of [0, w - 1]) {
                for (let y = 0; y < h; y++) checkAndAdd(x, y);
              }
              for (const y of [0, h - 1]) {
                for (let x = 0; x < w; x++) checkAndAdd(x, y);
              }

              while (queue.length > 0) {
                const [cx, cy] = queue.shift()!;
                const idx = cy * w + cx;
                const pIdx = idx * 4;
                data[pIdx+3] = 0;

                const neighbors = [
                  [cx + 1, cy],
                  [cx - 1, cy],
                  [cx, cy + 1],
                  [cx, cy - 1]
                ];

                for (const [nx, ny] of neighbors) {
                  if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                    const nIdx = ny * w + nx;
                    if (!visited[nIdx]) {
                      visited[nIdx] = 1;
                      const npIdx = nIdx * 4;
                      const nr = data[npIdx];
                      const ng = data[npIdx+1];
                      const nb = data[npIdx+2];

                      if (blendMode === 'white') {
                        if (nr > 215 && ng > 215 && nb > 215) {
                          queue.push([nx, ny]);
                        }
                      } else if (blendMode === 'black') {
                        if (nr < 40 && ng < 40 && nb < 40) {
                          queue.push([nx, ny]);
                        }
                      }
                    }
                  }
                }
              }

              ctx.putImageData(imageData, 0, 0);
              resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve(base64Data);
          });
        }

        try {
          const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              filename: file.name.endsWith('.png') ? file.name : 'logo.png',
              base64Data
            })
          });

          const resData = await response.json();
          if (response.ok && resData.url) {
            const htmlString = `<img src="${resData.url}" class="${imgClass}" />`;
            onUploadComplete(htmlString);
          } else {
            setError(resData.error || 'Upload failed.');
          }
        } catch (err) {
          setError('Upload failed to connect to backend.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to read image file.');
      setIsUploading(false);
    }
  };

  return (
    <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-cyan)', fontWeight: 'bold' }}>Logo Upload Engine</span>
        <label className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer', margin: 0 }}>
          {isUploading ? (
            <div className="spinner" style={{ width: '12px', height: '12px', margin: '0 4px 0 0' }}></div>
          ) : (
            <Plus className="w-3 h-3" style={{ marginRight: '4px' }} />
          )}
          <span>Upload Image</span>
          <input 
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processAndUpload(file);
            }}
            disabled={isUploading}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Processing:</span>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name={`blend-${id}`}
            checked={blendMode === 'white'} 
            onChange={() => setBlendMode('white')} 
          />
          <span>Remove White Bg</span>
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name={`blend-${id}`}
            checked={blendMode === 'black'} 
            onChange={() => setBlendMode('black')} 
          />
          <span>Remove Black Bg</span>
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name={`blend-${id}`}
            checked={blendMode === 'none'} 
            onChange={() => setBlendMode('none')} 
          />
          <span>Original (PNG)</span>
        </label>
      </div>

      {error && (
        <p style={{ color: 'var(--color-rose)', fontSize: '0.7rem', margin: 0 }}>{error}</p>
      )}
    </div>
  );
}

type TabType = 'skills' | 'projects' | 'experiences' | 'certificates' | 'contact' | 'analytics';

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // App State
  const [activeTab, setActiveTab] = useState<TabType>('skills');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [, setContact] = useState<Contact>({
    email: '',
    phone: '',
    location: '',
    github_url: '',
    linkedin_url: '',
    avatar_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'online' | 'offline'>('online');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('12:00:00');

  // Modal / Editing State
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
  
  // Form States
  const [skillForm, setSkillForm] = useState({
    num: '',
    title: '',
    category: '',
    desc: '',
    glow_color: 'rgba(0, 242, 254, 0.45)',
    tools: '',
    display_order: 1,
    logo_svg: ''
  });

  const [projectForm, setProjectForm] = useState({
    num: '',
    name: '',
    category: '',
    url: '',
    col1Img1: '',
    col1Img2: '',
    col2Img: '',
    display_order: 1
  });

  const [experienceForm, setExperienceForm] = useState({
    role: '',
    organization: '',
    period: '',
    description: '',
    glow_color: '#00F2FE',
    icon_svg: '',
    display_order: 1,
    certificate_url: ''
  });

  const [certificateForm, setCertificateForm] = useState({
    course: '',
    issuer: '',
    platform: '',
    date: '',
    verify_url: '',
    glow_color: '#4285F4',
    logo_svg: '',
    display_order: 1,
    deck_name: '',
    pdf_url: ''
  });

  const [isPdfProcessing, setIsPdfProcessing] = useState(false);

  const [contactForm, setContactForm] = useState<Contact>({
    email: '',
    phone: '',
    location: '',
    github_url: '',
    linkedin_url: '',
    avatar_url: ''
  });

  // Alerts toast
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  const handlePdfUploadAndParse = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      showAlert('Please select a PDF file.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showAlert('PDF file must be under 10MB.', 'error');
      return;
    }

    setIsPdfProcessing(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          // 1. Extract Details
          const parseRes = await fetch(`${API_BASE}/parse-pdf`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ base64Data })
          });

          if (!parseRes.ok) {
            throw new Error('Failed to parse PDF metadata.');
          }

          const parseData = await parseRes.json();
          if (parseData.success) {
            setCertificateForm(prev => ({
              ...prev,
              course: parseData.course || prev.course,
              issuer: parseData.issuer || prev.issuer,
              platform: parseData.platform || prev.platform,
              date: parseData.date || prev.date,
              verify_url: parseData.verify_url || prev.verify_url,
              glow_color: parseData.glow_color || prev.glow_color,
              logo_svg: parseData.logo_svg || prev.logo_svg,
              deck_name: parseData.deck_name || prev.deck_name
            }));
            showAlert('PDF parsed successfully! Details loaded.');
          }

          // 2. Upload PDF
          const uploadRes = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              filename: file.name,
              base64Data
            })
          });

          const uploadData = await uploadRes.json();
          if (uploadRes.ok && uploadData.url) {
            setCertificateForm(prev => ({
              ...prev,
              pdf_url: uploadData.url
            }));
            showAlert('PDF uploaded and attached.');
          } else {
            showAlert('PDF parsed but file upload failed.', 'error');
          }
        } catch (err: any) {
          showAlert(err.message || 'Error processing PDF.', 'error');
        } finally {
          setIsPdfProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showAlert('Error reading file.', 'error');
      setIsPdfProcessing(false);
    }
  };

  // Check login on load
  useEffect(() => {
    if (token) {
      fetchPortfolioData();
    }
  }, [token]);

  // Load analytics when switching tab
  useEffect(() => {
    if (token && activeTab === 'analytics') {
      fetchAnalyticsData();
    }
  }, [token, activeTab]);

  // Session timer ticker
  useEffect(() => {
    if (!token) return;
    
    const decoded = parseJwt(token);
    if (!decoded) {
      setTimeLeft('Expired');
      return;
    }

    if (!decoded.exp) {
      setTimeLeft('PERMANENT');
      return;
    }

    const expTime = decoded.exp * 1000;

    const updateCountdown = () => {
      const now = Date.now();
      const diff = expTime - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        handleLogout();
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      const hStr = h.toString().padStart(2, '0');
      const mStr = m.toString().padStart(2, '0');
      const sStr = s.toString().padStart(2, '0');

      setTimeLeft(`${hStr}:${mStr}:${sStr}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
        showAlert('Logged in successfully!');
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (err) {
      setLoginError('Could not reach backend server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    showAlert('Logged out');
  };

  const fetchPortfolioData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/portfolio`);
      if (response.ok) {
        const data = await response.json();
        setSkills(data.skills || []);
        setProjects(data.projects || []);
        setExperiences(data.experiences || []);
        setCertificates(data.certificates || []);
        if (data.contact) {
          setContact(data.contact);
          setContactForm(data.contact);
        }
        setDbStatus('online');
      } else {
        setDbStatus('offline');
        showAlert('Failed to retrieve portfolio data.', 'error');
      }
    } catch (err) {
      setDbStatus('offline');
      showAlert('Backend API is offline or unreachable.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    if (!token) return;
    setIsAnalyticsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
        }
        showAlert('Failed to retrieve analytics data.', 'error');
      }
    } catch (err) {
      showAlert('Analytics API is offline or unreachable.', 'error');
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this transmission log?')) return;
    try {
      const response = await fetch(`${API_BASE}/messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        showAlert('Transmission log cleared.');
        fetchAnalyticsData();
      } else {
        showAlert('Failed to clear transmission log.', 'error');
      }
    } catch (err) {
      showAlert('API error occurred.', 'error');
    }
  };

  const renewSession = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/refresh-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('admin_token', data.token);
          setToken(data.token);
          showAlert('Session successfully extended by 12 hours.');
        }
      } else {
        showAlert('Failed to refresh credentials.', 'error');
      }
    } catch (err) {
      showAlert('API error occurred during refresh.', 'error');
    }
  };

  // General CRUD helper
  const apiCall = async (endpoint: string, method: string, body: any = null) => {
    if (!token) return null;
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const config: RequestInit = { method, headers };
      if (body) {
        config.body = JSON.stringify(body);
      }
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      if (response.status === 401 || response.status === 403) {
        handleLogout();
        showAlert('Session expired. Please log in again.', 'error');
        return null;
      }
      return response;
    } catch (err) {
      showAlert('API connection lost.', 'error');
      return null;
    }
  };

  // Open forms for editing or adding
  const openModal = (type: 'add' | 'edit', item: any = null) => {
    setModalType(type);
    setEditingItem(item);

    if (activeTab === 'skills') {
      if (type === 'edit' && item) {
        setSkillForm({
          num: item.num || '',
          title: item.title || '',
          category: item.category || '',
          desc: item.desc_text || item.desc || '',
          glow_color: item.glow_color || 'rgba(0, 242, 254, 0.45)',
          tools: Array.isArray(item.tools) ? item.tools.join(', ') : (item.tools || ''),
          display_order: item.display_order || 1,
          logo_svg: item.logo_svg || ''
        });
      } else {
        // Auto calculate display order
        const maxOrder = skills.reduce((max, s) => s.display_order > max ? s.display_order : max, 0);
        const nextNum = String(skills.length + 1).padStart(2, '0');
        setSkillForm({
          num: nextNum,
          title: '',
          category: '',
          desc: '',
          glow_color: 'rgba(0, 242, 254, 0.45)',
          tools: '',
          display_order: maxOrder + 1,
          logo_svg: ''
        });
      }
    } else if (activeTab === 'projects') {
      if (type === 'edit' && item) {
        setProjectForm({
          num: item.num || '',
          name: item.name || '',
          category: item.category || '',
          url: item.url || '',
          col1Img1: item.col1Img1 || '',
          col1Img2: item.col1Img2 || '',
          col2Img: item.col2Img || '',
          display_order: item.display_order || 1
        });
      } else {
        const maxOrder = projects.reduce((max, p) => p.display_order > max ? p.display_order : max, 0);
        const nextNum = String(projects.length + 1).padStart(2, '0');
        setProjectForm({
          num: nextNum,
          name: '',
          category: '',
          url: '',
          col1Img1: '',
          col1Img2: '',
          col2Img: '',
          display_order: maxOrder + 1
        });
      }
      } else if (activeTab === 'experiences') {
        if (type === 'edit' && item) {
          setExperienceForm({
            role: item.role || '',
            organization: item.organization || '',
            period: item.period || '',
            description: item.description || '',
            glow_color: item.glow_color || '#00F2FE',
            icon_svg: item.icon_svg || item.icon || '',
            display_order: item.display_order || 1,
            certificate_url: item.certificate_url || ''
          });
        } else {
          const maxOrder = experiences.reduce((max, e) => e.display_order > max ? e.display_order : max, 0);
          setExperienceForm({
            role: '',
            organization: '',
            period: '',
            description: '',
            glow_color: '#00F2FE',
            icon_svg: '<svg class="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">\n  <circle cx="50" cy="50" r="45" stroke="#00F2FE" stroke-width="2.5" />\n</svg>',
            display_order: maxOrder + 1,
            certificate_url: ''
          });
        }
      } else if (activeTab === 'certificates') {
        if (type === 'edit' && item) {
          setCertificateForm({
            course: item.course || '',
            issuer: item.issuer || '',
            platform: item.platform || '',
            date: item.date || '',
            verify_url: item.verify_url || '',
            glow_color: item.glow_color || '#4285F4',
            logo_svg: item.logo_svg || '',
            display_order: item.display_order || 1,
            deck_name: item.deck_name || item.deckName || '',
            pdf_url: item.pdf_url || item.pdfUrl || ''
          });
        } else {
          const maxOrder = certificates.reduce((max, c) => c.display_order > max ? c.display_order : max, 0);
          setCertificateForm({
            course: '',
            issuer: '',
            platform: '',
            date: '',
            verify_url: '',
            glow_color: '#4285F4',
            logo_svg: '<svg viewBox="0 0 48 48" class="w-8 h-8" xmlns="http://www.w3.org/2000/svg">\n  <path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 3.2 29.5 1 24 1 14.8 1 7 6.7 3.7 14.7l7 5.4C12.4 14 17.7 9.5 24 9.5z"/>\n  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7C43.2 37 46.5 31.2 46.5 24.5z"/>\n  <path fill="#FBBC05" d="M10.7 28.5A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.7-4.5l-7-5.4A23.2 23.2 0 0 0 .8 24c0 3.8.9 7.4 2.5 10.6l7.4-6.1z"/>\n  <path fill="#34A853" d="M24 47c5.5 0 10.1-1.8 13.5-4.9l-7.4-5.7c-1.8 1.2-4 1.9-6.1 1.9-6.3 0-11.6-4.5-13.3-10.5l-7.4 6.1C7.1 41.4 14.9 47 24 47z"/>\n</svg>',
            display_order: maxOrder + 1,
            deck_name: '',
            pdf_url: ''
          });
        }
      }
  };

  const closeModal = () => {
    setModalType(null);
    setEditingItem(null);
  };

  // Submit forms
  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      num: skillForm.num,
      title: skillForm.title,
      category: skillForm.category,
      desc: skillForm.desc,
      glow_color: skillForm.glow_color,
      tools: skillForm.tools,
      display_order: Number(skillForm.display_order),
      logo_svg: skillForm.logo_svg
    };

    let response;
    if (modalType === 'edit' && editingItem) {
      response = await apiCall(`/skills/${editingItem.id}`, 'PUT', payload);
    } else {
      response = await apiCall('/skills', 'POST', payload);
    }

    if (response && response.ok) {
      showAlert(modalType === 'edit' ? 'Skill updated!' : 'Skill created!');
      closeModal();
      fetchPortfolioData();
    } else {
      showAlert('Failed to save skill.', 'error');
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      num: projectForm.num,
      name: projectForm.name,
      category: projectForm.category,
      url: projectForm.url,
      col1Img1: projectForm.col1Img1,
      col1Img2: projectForm.col1Img2,
      col2Img: projectForm.col2Img,
      display_order: Number(projectForm.display_order)
    };

    let response;
    if (modalType === 'edit' && editingItem) {
      response = await apiCall(`/projects/${editingItem.id}`, 'PUT', payload);
    } else {
      response = await apiCall('/projects', 'POST', payload);
    }

    if (response && response.ok) {
      showAlert(modalType === 'edit' ? 'Project updated!' : 'Project created!');
      closeModal();
      fetchPortfolioData();
    } else {
      showAlert('Failed to save project.', 'error');
    }
  };

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      role: experienceForm.role,
      organization: experienceForm.organization,
      period: experienceForm.period,
      description: experienceForm.description,
      glow_color: experienceForm.glow_color,
      icon_svg: experienceForm.icon_svg,
      display_order: Number(experienceForm.display_order),
      certificate_url: experienceForm.certificate_url
    };

    let response;
    if (modalType === 'edit' && editingItem) {
      response = await apiCall(`/experiences/${editingItem.id}`, 'PUT', payload);
    } else {
      response = await apiCall('/experiences', 'POST', payload);
    }

    if (response && response.ok) {
      showAlert(modalType === 'edit' ? 'Experience entry updated!' : 'Experience entry created!');
      closeModal();
      fetchPortfolioData();
    } else {
      showAlert('Failed to save experience entry.', 'error');
    }
  };

  const handleCertificateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      course: certificateForm.course,
      issuer: certificateForm.issuer,
      platform: certificateForm.platform,
      date: certificateForm.date,
      verify_url: certificateForm.verify_url,
      glow_color: certificateForm.glow_color,
      logo_svg: certificateForm.logo_svg,
      display_order: Number(certificateForm.display_order),
      deck_name: certificateForm.deck_name || certificateForm.issuer,
      pdf_url: certificateForm.pdf_url || ''
    };

    let response;
    if (modalType === 'edit' && editingItem) {
      response = await apiCall(`/certificates/${editingItem.id}`, 'PUT', payload);
    } else {
      response = await apiCall('/certificates', 'POST', payload);
    }

    if (response && response.ok) {
      showAlert(modalType === 'edit' ? 'Certificate updated!' : 'Certificate created!');
      closeModal();
      fetchPortfolioData();
    } else {
      showAlert('Failed to save certificate.', 'error');
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await apiCall('/contact', 'PUT', contactForm);
    if (response && response.ok) {
      showAlert('Contact information successfully updated!');
      fetchPortfolioData();
    } else {
      showAlert('Failed to update contact info.', 'error');
    }
  };

  // Delete methods
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    let response;
    if (activeTab === 'skills') {
      response = await apiCall(`/skills/${id}`, 'DELETE');
    } else if (activeTab === 'projects') {
      response = await apiCall(`/projects/${id}`, 'DELETE');
    } else if (activeTab === 'experiences') {
      response = await apiCall(`/experiences/${id}`, 'DELETE');
    } else if (activeTab === 'certificates') {
      response = await apiCall(`/certificates/${id}`, 'DELETE');
    }

    if (response && response.ok) {
      showAlert('Item deleted.');
      fetchPortfolioData();
    } else {
      showAlert('Delete operation failed.', 'error');
    }
  };

  // Reordering helpers
  const handleMoveOrder = async (item: any, direction: 'up' | 'down') => {
    let list: any[] = [];
    let endpoint = '';
    if (activeTab === 'skills') {
      list = [...skills];
      endpoint = '/skills';
    } else if (activeTab === 'projects') {
      list = [...projects];
      endpoint = '/projects';
    } else if (activeTab === 'experiences') {
      list = [...experiences];
      endpoint = '/experiences';
    } else if (activeTab === 'certificates') {
      list = [...certificates];
      endpoint = '/certificates';
    }

    const currentIndex = list.findIndex(i => i.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return; // boundary out

    const targetItem = list[targetIndex];
    
    // Swap display_order in state
    const tempOrder = item.display_order;
    item.display_order = targetItem.display_order;
    targetItem.display_order = tempOrder;

    const getPayload = (i: any) => {
      if (activeTab === 'skills') {
        return {
          num: i.num,
          title: i.title,
          category: i.category,
          desc: i.desc_text || i.desc || '',
          glow_color: i.glow_color,
          tools: Array.isArray(i.tools) ? i.tools.join(', ') : i.tools,
          display_order: i.display_order,
          logo_svg: i.logo_svg || ''
        };
      }
      if (activeTab === 'projects') {
        return {
          num: i.num,
          name: i.name,
          category: i.category,
          url: i.url,
          col1Img1: i.col1Img1,
          col1Img2: i.col1Img2,
          col2Img: i.col2Img,
          display_order: i.display_order
        };
      }
      if (activeTab === 'experiences') {
        return {
          role: i.role,
          organization: i.organization,
          period: i.period,
          description: i.description,
          glow_color: i.glow_color,
          icon_svg: i.icon_svg || i.icon || '',
          display_order: i.display_order,
          certificate_url: i.certificate_url || ''
        };
      }
      if (activeTab === 'certificates') {
        return {
          course: i.course,
          issuer: i.issuer,
          platform: i.platform,
          date: i.date,
          verify_url: i.verify_url,
          glow_color: i.glow_color,
          logo_svg: i.logo_svg,
          display_order: i.display_order,
          deck_name: i.deck_name || i.issuer,
          pdf_url: i.pdf_url || ''
        };
      }
      return i;
    };

    // Send PUT updates for both
    const update1 = apiCall(`${endpoint}/${item.id}`, 'PUT', getPayload(item));
    const update2 = apiCall(`${endpoint}/${targetItem.id}`, 'PUT', getPayload(targetItem));

    const [res1, res2] = await Promise.all([update1, update2]);

    if (res1 && res1.ok && res2 && res2.ok) {
      showAlert('Display order updated.');
      fetchPortfolioData();
    } else {
      showAlert('Failed to update ordering.', 'error');
    }
  };

  if (!token) {
    return (
      <div className="login-screen">
        <div className="glass-panel login-card">
          <div className="login-header">
            <div className="login-logo">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="login-title">Tanverse Panel</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Portfolio Administrator Authorization
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="pass">Admin Password</label>
              <input
                id="pass"
                type="password"
                required
                className="form-input"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {loginError && (
              <p style={{ color: 'var(--color-rose)', fontSize: '0.85rem', textAlign: 'center' }}>
                {loginError}
              </p>
            )}

            <button type="submit" className="btn btn-primary" disabled={isLoggingIn} style={{ width: '100%' }}>
              {isLoggingIn ? <div className="spinner" style={{ width: '16px', height: '16px' }}></div> : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Toast Alert */}
      {alert && (
        <div className={`alert-toast ${alert.type}`}>
          {alert.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="dashboard-header">
        <div className="brand-title">
          <div style={{ padding: '6px', background: 'rgba(0, 242, 254, 0.1)', borderRadius: '8px' }}>
            <Cpu className="w-6 h-6 text-[#00f2fe]" />
          </div>
          <div>
            <div className="brand-text">TANVERSE HUD</div>
            <p style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>
              PORTFOLIO CORE ENGINE
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(0, 242, 254, 0.2)',
            padding: '6px 12px',
            borderRadius: '6px',
            color: '#00f2fe',
            boxShadow: '0 0 10px rgba(0, 242, 254, 0.05)'
          }}>
            <span>SESSION: {timeLeft}</span>
            {timeLeft !== 'PERMANENT' && (
              <button 
                onClick={renewSession}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  textDecoration: 'underline',
                  padding: '0 2px',
                  marginLeft: '4px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#00f2fe'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
              >
                Renew
              </button>
            )}
          </div>

          <div className={`status-badge ${dbStatus === 'offline' ? 'offline' : ''}`}>
            <span style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              background: dbStatus === 'offline' ? 'var(--color-rose)' : 'var(--color-emerald)',
              boxShadow: dbStatus === 'offline' ? '0 0 6px var(--color-rose)' : '0 0 6px var(--color-emerald)'
            }}></span>
            {dbStatus === 'offline' ? 'DATABASE ERROR' : 'DB SYS ONLINE'}
          </div>

          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="nav-tabs">
        <button 
          onClick={() => setActiveTab('skills')} 
          className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
        >
          <Cpu className="w-4 h-4" />
          Skills Section
        </button>
        <button 
          onClick={() => setActiveTab('projects')} 
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
        >
          <Folder className="w-4 h-4" />
          Projects list
        </button>
        <button 
          onClick={() => setActiveTab('experiences')} 
          className={`tab-btn ${activeTab === 'experiences' ? 'active' : ''}`}
        >
          <Award className="w-4 h-4" />
          Experiences
        </button>
        <button 
          onClick={() => setActiveTab('certificates')} 
          className={`tab-btn ${activeTab === 'certificates' ? 'active' : ''}`}
        >
          <BadgeCheck className="w-4 h-4" />
          Certificates
        </button>
        <button 
          onClick={() => setActiveTab('contact')} 
          className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
        >
          <Globe className="w-4 h-4" />
          Contact & Social links
        </button>
        <button 
          onClick={() => setActiveTab('analytics')} 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
        >
          <Activity className="w-4 h-4" />
          System Analytics
        </button>
      </nav>

      {/* Main dashboard content */}
      <main className="dashboard-grid">
        {isLoading ? (
          <div className="glass-panel loader-container">
            <div className="spinner"></div>
            <p>Fetching database streams...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* SKILLS TAB */}
            {activeTab === 'skills' && (
              <div>
                <div className="section-header">
                  <div>
                    <h2 className="section-title">
                      <Cpu className="text-[#00f2fe]" /> Skills Catalog
                    </h2>
                    <p className="section-subtitle">Add preset technology skillsets or new vectors</p>
                  </div>
                  <button onClick={() => openModal('add')} className="btn btn-primary">
                    <Plus className="w-4 h-4" />
                    <span>Add Skill</span>
                  </button>
                </div>

                <div className="crud-list-grid">
                  {skills.map((skill, index) => (
                    <div key={skill.id} className="glass-panel item-card glass-panel-cyan">
                      <div className="item-card-header">
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          {skill.logo_svg && (
                            <div 
                              style={{ 
                                width: '44px', 
                                height: '44px', 
                                background: 'rgba(255,255,255,0.03)', 
                                borderRadius: '8px', 
                                padding: '6px', 
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }} 
                              dangerouslySetInnerHTML={{ __html: skill.logo_svg }} 
                            />
                          )}
                          <div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span className="item-badge">#{skill.num}</span>
                              <span className="item-badge" style={{ color: skill.glow_color }}>{skill.category}</span>
                            </div>
                            <h3 className="item-title">{skill.title}</h3>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          Pos: {skill.display_order}
                        </div>
                      </div>

                      <p className="item-desc">{skill.desc_text || skill.desc}</p>
                      
                      <div className="form-group">
                        <div className="form-label" style={{ fontSize: '0.65rem' }}>Tools List</div>
                        <div className="tag-container">
                          {(Array.isArray(skill.tools) ? skill.tools : String(skill.tools || '').split(',')).map((t, idx) => (
                            <span key={idx} className="tag">{String(t).trim()}</span>
                          ))}
                        </div>
                      </div>

                      <div className="order-controls">
                        <button 
                          onClick={() => handleMoveOrder(skill, 'up')}
                          disabled={index === 0}
                          className="order-btn" 
                          title="Move up"
                          style={{ opacity: index === 0 ? 0.3 : 1 }}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleMoveOrder(skill, 'down')}
                          disabled={index === skills.length - 1}
                          className="order-btn" 
                          title="Move down"
                          style={{ opacity: index === skills.length - 1 ? 0.3 : 1 }}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="item-actions">
                        <button onClick={() => openModal('edit', skill)} className="btn btn-secondary btn-icon-only" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(skill.id)} className="btn btn-danger btn-icon-only" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {skills.length === 0 && (
                    <div className="col-span-full text-center" style={{ padding: '40px', color: 'var(--color-text-secondary)' }}>
                      No skills found in database. Create one above!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PROJECTS TAB */}
            {activeTab === 'projects' && (
              <div>
                <div className="section-header">
                  <div>
                    <h2 className="section-title">
                      <Folder className="text-[#00f2fe]" /> Projects Catalog
                    </h2>
                    <p className="section-subtitle">Manage showcased web products and code repositories</p>
                  </div>
                  <button onClick={() => openModal('add')} className="btn btn-primary">
                    <Plus className="w-4 h-4" />
                    <span>Add Project</span>
                  </button>
                </div>

                <div className="crud-list-grid">
                  {projects.map((project, index) => (
                    <div key={project.id} className="glass-panel item-card glass-panel-cyan">
                      <div className="item-card-header">
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className="item-badge">#{project.num}</span>
                            <span className="item-badge" style={{ color: 'var(--color-cyan)' }}>{project.category}</span>
                          </div>
                          <h3 className="item-title">{project.name}</h3>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          Pos: {project.display_order}
                        </div>
                      </div>

                      <div className="form-group">
                        <div className="form-label" style={{ fontSize: '0.65rem' }}>Image Asset Keys</div>
                        <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                          Col 1 Img 1: <span style={{ color: '#fff' }}>{project.col1Img1 || 'None'}</span><br />
                          Col 1 Img 2: <span style={{ color: '#fff' }}>{project.col1Img2 || 'None'}</span><br />
                          Col 2 Img: <span style={{ color: '#fff' }}>{project.col2Img || 'None'}</span>
                        </p>
                      </div>

                      <div className="form-group">
                        <div className="form-label" style={{ fontSize: '0.65rem' }}>Project Link</div>
                        <a href={project.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--color-cyan)', textDecoration: 'none' }} className="mono">
                          {project.url}
                        </a>
                      </div>

                      <div className="order-controls">
                        <button 
                          onClick={() => handleMoveOrder(project, 'up')}
                          disabled={index === 0}
                          className="order-btn" 
                          title="Move up"
                          style={{ opacity: index === 0 ? 0.3 : 1 }}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleMoveOrder(project, 'down')}
                          disabled={index === projects.length - 1}
                          className="order-btn" 
                          title="Move down"
                          style={{ opacity: index === projects.length - 1 ? 0.3 : 1 }}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="item-actions">
                        <button onClick={() => openModal('edit', project)} className="btn btn-secondary btn-icon-only" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(project.id)} className="btn btn-danger btn-icon-only" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="col-span-full text-center" style={{ padding: '40px', color: 'var(--color-text-secondary)' }}>
                      No projects found. Build some records!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EXPERIENCES TAB */}
            {activeTab === 'experiences' && (
              <div>
                <div className="section-header">
                  <div>
                    <h2 className="section-title">
                      <Award className="text-[#b600a8]" /> Experiences Timeline
                    </h2>
                    <p className="section-subtitle">Manage organization milestones, roles, and glow graphics</p>
                  </div>
                  <button onClick={() => openModal('add')} className="btn btn-primary">
                    <Plus className="w-4 h-4" />
                    <span>Add Experience</span>
                  </button>
                </div>

                <div className="crud-list-grid">
                  {experiences.map((exp, index) => (
                    <div key={exp.id} className="glass-panel item-card glass-panel-magenta">
                      <div className="item-card-header">
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          {exp.icon_svg && (
                            <div className="svg-preview" dangerouslySetInnerHTML={{ __html: exp.icon_svg }} />
                          )}
                          <div>
                            <span className="item-badge" style={{ color: exp.glow_color }}>{exp.period}</span>
                            <h3 className="item-title">{exp.role}</h3>
                            <div className="item-subtitle">{exp.organization}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          Pos: {exp.display_order}
                        </div>
                      </div>

                      <p className="item-desc">{exp.description}</p>
                      {exp.certificate_url && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-cyan)', marginTop: '6px' }} className="mono truncate">
                          Cert: <a href={exp.certificate_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-cyan)', textDecoration: 'underline' }}>{exp.certificate_url}</a>
                        </div>
                      )}

                      <div className="order-controls">
                        <button 
                          onClick={() => handleMoveOrder(exp, 'up')}
                          disabled={index === 0}
                          className="order-btn" 
                          title="Move up"
                          style={{ opacity: index === 0 ? 0.3 : 1 }}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleMoveOrder(exp, 'down')}
                          disabled={index === experiences.length - 1}
                          className="order-btn" 
                          title="Move down"
                          style={{ opacity: index === experiences.length - 1 ? 0.3 : 1 }}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="item-actions">
                        <button onClick={() => openModal('edit', exp)} className="btn btn-secondary btn-icon-only" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(exp.id)} className="btn btn-danger btn-icon-only" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {experiences.length === 0 && (
                    <div className="col-span-full text-center" style={{ padding: '40px', color: 'var(--color-text-secondary)' }}>
                      No experience records found in database.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CERTIFICATES TAB */}
            {activeTab === 'certificates' && (
              <div>
                <div className="section-header">
                  <div>
                    <h2 className="section-title">
                      <BadgeCheck className="text-[#00f2fe]" /> Credentials & Certifications
                    </h2>
                    <p className="section-subtitle">Manage company certifications, external links and vector logos</p>
                  </div>
                  <button onClick={() => openModal('add')} className="btn btn-primary">
                    <Plus className="w-4 h-4" />
                    <span>Add Certificate</span>
                  </button>
                </div>

                <div className="crud-list-grid">
                  {certificates.map((cert, index) => (
                    <div key={cert.id} className="glass-panel item-card" style={{ borderColor: cert.glow_color + '40' }}>
                      <div className="item-card-header">
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className="item-badge" style={{ color: cert.glow_color }}>{cert.platform}</span>
                            <span className="item-badge" style={{ opacity: 0.7 }}>{cert.date}</span>
                          </div>
                          <h3 className="item-title">{cert.course}</h3>
                          <div className="item-subtitle">Authorized by {cert.issuer} • Deck: {cert.deck_name || cert.issuer || 'Other'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div 
                            style={{ 
                              width: '44px', 
                              height: '44px', 
                              background: 'rgba(255,255,255,0.03)', 
                              borderRadius: '8px', 
                              padding: '6px', 
                              border: '1px solid rgba(255,255,255,0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }} 
                            dangerouslySetInnerHTML={{ __html: cert.logo_svg }} 
                          />
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                            Pos: {cert.display_order}
                          </div>
                        </div>
                      </div>

                      {cert.verify_url && (
                        <div style={{ marginTop: '12px' }}>
                          <a href={cert.verify_url} target="_blank" rel="noreferrer" className="mono" style={{ fontSize: '0.7rem', color: 'var(--color-cyan)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            Verify Certificate Link
                          </a>
                        </div>
                      )}

                      <div className="order-controls">
                        <button 
                          onClick={() => handleMoveOrder(cert, 'up')}
                          disabled={index === 0}
                          className="order-btn" 
                          title="Move up"
                          style={{ opacity: index === 0 ? 0.3 : 1 }}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleMoveOrder(cert, 'down')}
                          disabled={index === certificates.length - 1}
                          className="order-btn" 
                          title="Move down"
                          style={{ opacity: index === certificates.length - 1 ? 0.3 : 1 }}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="item-actions">
                        <button onClick={() => openModal('edit', cert)} className="btn btn-secondary btn-icon-only" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cert.id)} className="btn btn-danger btn-icon-only" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {certificates.length === 0 && (
                    <div className="col-span-full text-center" style={{ padding: '40px', color: 'var(--color-text-secondary)' }}>
                      No certificates found in database. Create one above!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CONTACT INFO TAB */}
            {activeTab === 'contact' && (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div className="section-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', marginBottom: '24px' }}>
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-wider text-white">
                      CONTACT & SOCIAL LINKS
                    </h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Configure email, social media integrations and resume profile photo
                    </p>
                  </div>
                </div>

                <form onSubmit={handleContactSubmit}>
                  <div className="details-grid" style={{ gap: '20px' }}>
                    <div>
                      <label htmlFor="email-input" className="form-label">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Mail className="w-3.5 h-3.5" /> Email Address</span>
                      </label>
                      <input 
                        id="email-input" 
                        type="email" 
                        className="form-input" 
                        value={contactForm.email} 
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="phone-input" className="form-label">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Phone className="w-3.5 h-3.5" /> Phone Number</span>
                      </label>
                      <input 
                        id="phone-input" 
                        type="text" 
                        className="form-input" 
                        value={contactForm.phone} 
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="location-input" className="form-label">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><MapPin className="w-3.5 h-3.5" /> Physical Location</span>
                      </label>
                      <input 
                        id="location-input" 
                        type="text" 
                        className="form-input" 
                        value={contactForm.location} 
                        onChange={(e) => setContactForm({ ...contactForm, location: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="github-input" className="form-label">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><GithubIcon /> GitHub Profile URL</span>
                      </label>
                      <input 
                        id="github-input" 
                        type="url" 
                        className="form-input" 
                        value={contactForm.github_url} 
                        onChange={(e) => setContactForm({ ...contactForm, github_url: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-span-full">
                      <label htmlFor="linkedin-input" className="form-label">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><LinkedinIcon /> LinkedIn Profile URL</span>
                      </label>
                      <input 
                        id="linkedin-input" 
                        type="url" 
                        className="form-input" 
                        value={contactForm.linkedin_url} 
                        onChange={(e) => setContactForm({ ...contactForm, linkedin_url: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-span-full">
                      <ImageUploader 
                        label="Profile Avatar Photo (URL or upload)"
                        id="avatar-input"
                        value={contactForm.avatar_url || ''}
                        onChange={(url) => setContactForm({ ...contactForm, avatar_url: url })}
                        token={token}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button type="submit" className="btn btn-primary">
                      <Check className="w-4 h-4" />
                      <span>Update Contact Info</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="section-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', marginBottom: '0px' }}>
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-wider text-white" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Activity className="w-6 h-6 text-[#00f2fe]" />
                      SYSTEM TELEMETRY & ANALYTICS HUD
                    </h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Real-time visitor logs, geography distribution, and user inquiries database
                    </p>
                  </div>
                  <button 
                    onClick={fetchAnalyticsData} 
                    className="btn btn-secondary" 
                    style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                    disabled={isAnalyticsLoading}
                  >
                    <span>{isAnalyticsLoading ? 'SYNCING...' : 'FORCE REFRESH'}</span>
                  </button>
                </div>

                {isAnalyticsLoading && !analyticsData ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
                    ESTABLISHING SECURITY SHIELD DATA SYNC LINK...
                  </div>
                ) : !analyticsData ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-rose)' }}>
                    Failed to sync with analytics node.
                  </div>
                ) : (
                  <>
                    {/* KPI Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                      <div className="glass-panel" style={{ padding: '20px', borderLeft: '3px solid var(--color-cyan)', background: 'rgba(0, 242, 254, 0.02)' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>TOTAL TRAFFIC visits</p>
                        <h3 className="mono" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginTop: '6px', textShadow: '0 0 10px rgba(0, 242, 254, 0.2)' }}>{analyticsData.metrics.totalVisits}</h3>
                      </div>
                      <div className="glass-panel" style={{ padding: '20px', borderLeft: '3px solid var(--color-emerald)', background: 'rgba(16, 185, 129, 0.02)' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>UNIQUE REGIONS countries</p>
                        <h3 className="mono" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginTop: '6px', textShadow: '0 0 10px rgba(16, 185, 129, 0.2)' }}>{analyticsData.metrics.uniqueCountries}</h3>
                      </div>
                      <div className="glass-panel" style={{ padding: '20px', borderLeft: '3px solid var(--color-magenta)', background: 'rgba(182, 0, 168, 0.02)' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>DATABASE MESSAGES inbox</p>
                        <h3 className="mono" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginTop: '6px', textShadow: '0 0 10px rgba(182, 0, 168, 0.2)' }}>{analyticsData.metrics.totalMessages}</h3>
                      </div>
                    </div>

                    {/* Breakdown and Logs Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginTop: '10px' }} className="details-grid">
                      {/* Left: Geography Breakdown */}
                      <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'white', letterSpacing: '0.05em', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                          VISITOR GEOGRAPHY DISTRIBUTION
                        </h3>
                        {analyticsData.countryBreakdown.length === 0 ? (
                          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>No location logs captured yet.</p>
                        ) : (
                          <div>
                            {analyticsData.countryBreakdown.map((item: any, idx: number) => {
                              const maxVal = Math.max(...analyticsData.countryBreakdown.map((c: any) => c.count));
                              const pct = maxVal > 0 ? (item.count / maxVal) * 100 : 0;
                              return (
                                <div key={idx} style={{ marginBottom: '16px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
                                    <span style={{ fontWeight: 500 }}>{item.country}</span>
                                    <span className="mono" style={{ color: 'var(--color-cyan)' }}>{item.count} visits</span>
                                  </div>
                                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{
                                      width: `${pct}%`,
                                      height: '100%',
                                      background: 'linear-gradient(to right, var(--color-cyan), var(--color-magenta))',
                                      boxShadow: '0 0 6px var(--color-cyan)',
                                      borderRadius: '3px'
                                    }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Right: Telemetry Logs */}
                      <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'white', letterSpacing: '0.05em', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                          LIVE TELEMETRY LOGS (RECENT 20)
                        </h3>
                        {analyticsData.recentVisits.length === 0 ? (
                          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>No visit telemetry records stored.</p>
                        ) : (
                          <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', background: 'rgba(0,0,0,0.15)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', textAlign: 'left' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid rgba(0, 242, 254, 0.2)', color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
                                  <th style={{ padding: '8px' }}>TIME</th>
                                  <th style={{ padding: '8px' }}>IP</th>
                                  <th style={{ padding: '8px' }}>LOCATION</th>
                                </tr>
                              </thead>
                              <tbody>
                                {analyticsData.recentVisits.map((v: any, index: number) => (
                                  <tr key={v.id || index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                                    <td style={{ padding: '8px', color: 'var(--color-text-secondary)' }}>{new Date(v.timestamp).toLocaleTimeString()}</td>
                                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{v.ip}</td>
                                    <td style={{ padding: '8px' }}>{v.city}, {v.country}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Message Manager */}
                    <div style={{ marginTop: '16px' }}>
                      <h3 className="text-lg font-semibold uppercase text-white tracking-wider" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail className="w-5 h-5 text-[#b600a8]" />
                        <span>DATABASE MESSAGES INBOX ({analyticsData.metrics.totalMessages})</span>
                      </h3>
                      {analyticsData.recentMessages.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                          No message records stored in database.
                        </div>
                      ) : (
                        <div className="crud-list-grid">
                          {analyticsData.recentMessages.map((m: any) => (
                            <div key={m.id} className="glass-panel item-card" style={{ borderLeft: '3px solid var(--color-magenta)', minHeight: '160px', justifyContent: 'space-between' }}>
                              <div>
                                <div className="item-card-header" style={{ marginBottom: '10px' }}>
                                  <div>
                                    <h4 style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{m.name}</h4>
                                    <a href={`mailto:${m.email}`} style={{ fontSize: '0.75rem', color: 'var(--color-cyan)', textDecoration: 'underline' }}>{m.email}</a>
                                  </div>
                                  <button 
                                    onClick={() => handleDeleteMessage(m.id)} 
                                    className="btn btn-secondary" 
                                    style={{ padding: '6px', color: 'var(--color-rose)', borderColor: 'rgba(244, 63, 94, 0.2)' }}
                                    title="Delete transmission log"
                                  >
                                    <Trash2 className="w-4.5 h-4.5" />
                                  </button>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '6px', whiteSpace: 'pre-wrap', marginBottom: '10px' }}>
                                  {m.message}
                                </p>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                                <span>MSG_ID: {m.id}</span>
                                <span>{new Date(m.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        )}
      </main>

      {/* MODAL OVERLAYS FOR CREATE/EDIT */}
      {modalType && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            
            <div className="modal-header">
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {modalType === 'edit' ? 'Edit Portfolio Element' : 'Create Portfolio Element'}
              </h3>
              <button onClick={closeModal} className="btn btn-secondary btn-icon-only" style={{ borderRadius: '50%' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SKILLS FORM */}
            {activeTab === 'skills' && (
              <form onSubmit={handleSkillSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="details-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="skill-num">ID Num Badge</label>
                    <input 
                      id="skill-num" 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 06" 
                      value={skillForm.num} 
                      onChange={(e) => setSkillForm({ ...skillForm, num: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="skill-title">Title</label>
                    <input 
                      id="skill-title" 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Docker" 
                      value={skillForm.title} 
                      onChange={(e) => setSkillForm({ ...skillForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="skill-cat">Category</label>
                    <input 
                      id="skill-cat" 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Infrastructure" 
                      value={skillForm.category} 
                      onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="skill-glow">Glow Color (CSS/RGBA/HEX)</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        id="skill-glow" 
                        type="text" 
                        className="form-input" 
                        placeholder="rgba(0, 242, 254, 0.45)" 
                        value={skillForm.glow_color} 
                        onChange={(e) => setSkillForm({ ...skillForm, glow_color: e.target.value })}
                        required
                        style={{ flexGrow: 1 }}
                      />
                      <input 
                        type="color" 
                        value={convertToHex(skillForm.glow_color)}
                        onChange={(e) => setSkillForm({ ...skillForm, glow_color: hexToRgba(e.target.value) })}
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          padding: '2px', 
                          background: 'rgba(255,255,255,0.05)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '6px', 
                          cursor: 'pointer' 
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group col-span-full">
                    <label className="form-label" htmlFor="skill-tools">Sub-Tools / Stack (Comma-separated)</label>
                    <input 
                      id="skill-tools" 
                      type="text" 
                      className="form-input" 
                      placeholder="Docker Compose, Kubernetes, CI/CD" 
                      value={skillForm.tools} 
                      onChange={(e) => setSkillForm({ ...skillForm, tools: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-full">
                    <label className="form-label" htmlFor="skill-desc">Description</label>
                    <textarea 
                      id="skill-desc" 
                      className="form-input form-textarea" 
                      placeholder="Provide descriptive details of skill applications..." 
                      value={skillForm.desc} 
                      onChange={(e) => setSkillForm({ ...skillForm, desc: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-full">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="form-label" htmlFor="skill-svg">Custom Logo SVG / Image tag</label>
                      <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--color-cyan)' }}>Live Preview:</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <textarea 
                        id="skill-svg" 
                        className="form-input form-textarea mono" 
                        style={{ fontSize: '0.75rem', height: '120px' }}
                        placeholder="<svg ...>...</svg> or <img ... />" 
                        value={skillForm.logo_svg} 
                        onChange={(e) => setSkillForm({ ...skillForm, logo_svg: e.target.value })}
                      />
                      <div 
                        className="svg-preview" 
                        style={{ 
                          flexShrink: 0, 
                          width: '120px', 
                          height: '120px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '16px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px'
                        }} 
                        dangerouslySetInnerHTML={{ __html: skillForm.logo_svg }} 
                      />
                    </div>
                    <LogoUploader 
                      id="skill-logo-upload"
                      onUploadComplete={(htmlTag) => setSkillForm({ ...skillForm, logo_svg: htmlTag })}
                      token={token}
                      imgClass="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="skill-order">Display Order Index</label>
                    <input 
                      id="skill-order" 
                      type="number" 
                      className="form-input" 
                      value={skillForm.display_order} 
                      onChange={(e) => setSkillForm({ ...skillForm, display_order: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            )}

            {/* PROJECTS FORM */}
            {activeTab === 'projects' && (
              <form onSubmit={handleProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="details-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="proj-num">ID Num Badge</label>
                    <input 
                      id="proj-num" 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 03" 
                      value={projectForm.num} 
                      onChange={(e) => setProjectForm({ ...projectForm, num: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="proj-name">Project Name</label>
                    <input 
                      id="proj-name" 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. AI Engine" 
                      value={projectForm.name} 
                      onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="proj-cat">Category / Headline</label>
                    <input 
                      id="proj-cat" 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Personal Product" 
                      value={projectForm.category} 
                      onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="proj-url">Live Link URL</label>
                    <input 
                      id="proj-url" 
                      type="url" 
                      className="form-input" 
                      placeholder="https://..." 
                      value={projectForm.url} 
                      onChange={(e) => setProjectForm({ ...projectForm, url: e.target.value })}
                      required
                    />
                  </div>

                  <ImageUploader 
                    label="Col 1 Image 1 (Local key, URL, or upload)"
                    id="proj-img1"
                    value={projectForm.col1Img1}
                    onChange={(url) => setProjectForm({ ...projectForm, col1Img1: url })}
                    token={token}
                  />

                  <ImageUploader 
                    label="Col 1 Image 2 (Local key, URL, or upload)"
                    id="proj-img2"
                    value={projectForm.col1Img2}
                    onChange={(url) => setProjectForm({ ...projectForm, col1Img2: url })}
                    token={token}
                  />

                  <div className="col-span-full">
                    <ImageUploader 
                      label="Col 2 Hero Image (Local key, URL, or upload)"
                      id="proj-img3"
                      value={projectForm.col2Img}
                      onChange={(url) => setProjectForm({ ...projectForm, col2Img: url })}
                      token={token}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="proj-order">Display Order Index</label>
                    <input 
                      id="proj-order" 
                      type="number" 
                      className="form-input" 
                      value={projectForm.display_order} 
                      onChange={(e) => setProjectForm({ ...projectForm, display_order: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            )}

            {/* EXPERIENCES FORM */}
            {activeTab === 'experiences' && (
              <form onSubmit={handleExperienceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="details-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="exp-role">Role Title</label>
                    <input 
                      id="exp-role" 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Lead Developer" 
                      value={experienceForm.role} 
                      onChange={(e) => setExperienceForm({ ...experienceForm, role: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="exp-org">Organization</label>
                    <input 
                      id="exp-org" 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Acme Corp" 
                      value={experienceForm.organization} 
                      onChange={(e) => setExperienceForm({ ...experienceForm, organization: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="exp-period">Time Period</label>
                    <input 
                      id="exp-period" 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 2025 - Present" 
                      value={experienceForm.period} 
                      onChange={(e) => setExperienceForm({ ...experienceForm, period: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="exp-glow">Theme Color (Glow Graphic)</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        id="exp-glow" 
                        type="text" 
                        className="form-input" 
                        placeholder="#00F2FE" 
                        value={experienceForm.glow_color} 
                        onChange={(e) => setExperienceForm({ ...experienceForm, glow_color: e.target.value })}
                        required
                        style={{ flexGrow: 1 }}
                      />
                      <input 
                        type="color" 
                        value={convertToHex(experienceForm.glow_color)}
                        onChange={(e) => setExperienceForm({ ...experienceForm, glow_color: e.target.value })}
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          padding: '2px', 
                          background: 'rgba(255,255,255,0.05)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '6px', 
                          cursor: 'pointer' 
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group col-span-full">
                    <label className="form-label" htmlFor="exp-desc">Role Description</label>
                    <textarea 
                      id="exp-desc" 
                      className="form-input form-textarea" 
                      placeholder="Describe achievements and responsibilities in this role..." 
                      value={experienceForm.description} 
                      onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-full">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="form-label" htmlFor="exp-svg">Custom SVG Vector XML</label>
                      <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--color-cyan)' }}>Live Preview:</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <textarea 
                        id="exp-svg" 
                        className="form-input form-textarea mono" 
                        style={{ fontSize: '0.75rem', height: '120px' }}
                        placeholder="<svg ...>...</svg>" 
                        value={experienceForm.icon_svg} 
                        onChange={(e) => setExperienceForm({ ...experienceForm, icon_svg: e.target.value })}
                        required
                      />
                      <div className="svg-preview" style={{ flexShrink: 0, width: '120px', height: '120px' }} dangerouslySetInnerHTML={{ __html: experienceForm.icon_svg }} />
                    </div>
                    <LogoUploader 
                      id="exp-logo-upload"
                      onUploadComplete={(htmlTag) => setExperienceForm({ ...experienceForm, icon_svg: htmlTag })}
                      token={token}
                      imgClass="w-14 h-14 object-contain"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="exp-order">Display Order Index</label>
                    <input 
                      id="exp-order" 
                      type="number" 
                      className="form-input" 
                      value={experienceForm.display_order} 
                      onChange={(e) => setExperienceForm({ ...experienceForm, display_order: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="exp-cert">Certificate Link / URL</label>
                    <input 
                      id="exp-cert" 
                      type="url" 
                      className="form-input" 
                      placeholder="https://..." 
                      value={experienceForm.certificate_url} 
                      onChange={(e) => setExperienceForm({ ...experienceForm, certificate_url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            )}

            {/* CERTIFICATES FORM */}
            {activeTab === 'certificates' && (
              <form onSubmit={handleCertificateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* 🚀 PDF Upload & Auto-fill */}
                <div className="glass-panel" style={{ padding: '16px', border: '1px dashed var(--color-cyan)', borderRadius: '12px', background: 'rgba(0, 242, 254, 0.02)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-cyan)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      PDF Auto-Fill & Attachment
                    </span>
                    {isPdfProcessing && (
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>Processing PDF...</span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="file" 
                      accept=".pdf"
                      id="cert-pdf-upload"
                      style={{ display: 'none' }}
                      onChange={handlePdfUploadAndParse}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => document.getElementById('cert-pdf-upload')?.click()}
                      disabled={isPdfProcessing}
                      style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8rem', padding: '10px' }}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      {certificateForm.pdf_url ? 'Change PDF Certificate File' : 'Upload PDF (Auto-fill Details)'}
                    </button>
                    {certificateForm.pdf_url && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setCertificateForm({ ...certificateForm, pdf_url: '' })}
                        style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}
                        title="Remove Attached PDF"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {certificateForm.pdf_url && (
                    <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Attached PDF: <a href={certificateForm.pdf_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-cyan)', textDecoration: 'underline' }} onClick={(e) => e.stopPropagation()}>{certificateForm.pdf_url.split('/').pop()}</a>
                    </div>
                  )}
                </div>

                <div className="details-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="cert-course">Course Name</label>
                    <input 
                      id="cert-course" 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. AI Fundamentals" 
                      value={certificateForm.course} 
                      onChange={(e) => setCertificateForm({ ...certificateForm, course: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="cert-issuer">Authorized Issuer</label>
                    <input 
                      id="cert-issuer" 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Google" 
                      value={certificateForm.issuer} 
                      onChange={(e) => setCertificateForm({ ...certificateForm, issuer: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="cert-deck-name">Deck Name (Group / Sub-topic)</label>
                    <input 
                      id="cert-deck-name" 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Google or Google ML (Leave empty to use Issuer)" 
                      value={certificateForm.deck_name} 
                      onChange={(e) => setCertificateForm({ ...certificateForm, deck_name: e.target.value })}
                    />
                    {certificates.length > 0 && (() => {
                      const existingDecks = Array.from(new Set(
                        certificates.map(c => c.deck_name || c.issuer)
                      )).filter(Boolean);
                      if (existingDecks.length === 0) return null;
                      return (
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280', alignSelf: 'center' }}>Use existing deck:</span>
                          {existingDecks.map(deckName => (
                            <button
                              key={deckName}
                              type="button"
                              onClick={() => setCertificateForm({ ...certificateForm, deck_name: deckName })}
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.7rem',
                                borderRadius: '4px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#c8d0d9',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(0, 242, 254, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                              }}
                            >
                              {deckName}
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="cert-platform">Hosting Platform</label>
                    <input 
                      id="cert-platform" 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Coursera" 
                      value={certificateForm.platform} 
                      onChange={(e) => setCertificateForm({ ...certificateForm, platform: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="cert-date">Date Issued</label>
                    <input 
                      id="cert-date" 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Jun 2026" 
                      value={certificateForm.date} 
                      onChange={(e) => setCertificateForm({ ...certificateForm, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-full">
                    <label className="form-label" htmlFor="cert-url">Verification URL</label>
                    <input 
                      id="cert-url" 
                      type="url" 
                      className="form-input" 
                      placeholder="https://coursera.org/verify/..." 
                      value={certificateForm.verify_url} 
                      onChange={(e) => setCertificateForm({ ...certificateForm, verify_url: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="cert-glow">Theme Color (Glow/Hex/RGBA)</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        id="cert-glow" 
                        type="text" 
                        className="form-input" 
                        placeholder="#4285F4" 
                        value={certificateForm.glow_color} 
                        onChange={(e) => setCertificateForm({ ...certificateForm, glow_color: e.target.value })}
                        required
                        style={{ flexGrow: 1 }}
                      />
                      <input 
                        type="color" 
                        value={convertToHex(certificateForm.glow_color)}
                        onChange={(e) => setCertificateForm({ ...certificateForm, glow_color: e.target.value })}
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          padding: '2px', 
                          background: 'rgba(255,255,255,0.05)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '6px', 
                          cursor: 'pointer' 
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="cert-order">Display Order Index</label>
                    <input 
                      id="cert-order" 
                      type="number" 
                      className="form-input" 
                      value={certificateForm.display_order} 
                      onChange={(e) => setCertificateForm({ ...certificateForm, display_order: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-full">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="form-label" htmlFor="cert-svg">Company / Platform SVG Code</label>
                      <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--color-cyan)' }}>Live Preview:</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <textarea 
                        id="cert-svg" 
                        className="form-input form-textarea mono" 
                        style={{ fontSize: '0.75rem', height: '120px' }}
                        placeholder="<svg ...>...</svg>" 
                        value={certificateForm.logo_svg} 
                        onChange={(e) => setCertificateForm({ ...certificateForm, logo_svg: e.target.value })}
                        required
                      />
                      <div 
                        className="svg-preview" 
                        style={{ 
                          flexShrink: 0, 
                          width: '120px', 
                          height: '120px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '16px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px'
                        }} 
                        dangerouslySetInnerHTML={{ __html: certificateForm.logo_svg }} 
                      />
                    </div>
                    <LogoUploader 
                      id="cert-logo-upload"
                      onUploadComplete={(htmlTag) => setCertificateForm({ ...certificateForm, logo_svg: htmlTag })}
                      token={token}
                      imgClass="w-8 h-8 object-contain"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

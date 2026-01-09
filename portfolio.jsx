import React, { useState, useEffect } from 'react';
import { 
  Home, 
  FolderOpen, 
  Mail, 
  Github, 
  Linkedin, 
  ExternalLink, 
  ArrowRight, 
  Code2, 
  Brain, 
  Camera, 
  Activity,
  ChevronLeft,
  Send,
  MapPin,
  Phone,
  AtSign,
  Layers,
  Cpu,
  Database,
  Globe,
  User,
  Menu,
  X
} from 'lucide-react';

// ============================================
// CONFIGURATION - Easy to modify
// ============================================
const CONFIG = {
  name: "Baraka",
  title: "ML/AI Engineer",
  tagline: "Computer Science Senior at Virginia Tech",
  email: "baraka@vt.edu",
  phone: "+1 (540) 000-0000",
  location: "Blacksburg, VA",
  github: "github.com/baraka",
  linkedin: "linkedin.com/in/baraka",
  
  colors: {
    primary: "#0078D4", // Microsoft Blue
    primaryLight: "#2B88D8",
    primaryDark: "#005A9E",
    accent: "#00A4EF",
    dark: "#0A1628",
    darkSecondary: "#162038",
    glass: "rgba(255, 255, 255, 0.08)",
    glassBorder: "rgba(255, 255, 255, 0.12)",
    glassHover: "rgba(255, 255, 255, 0.15)",
    text: "#FFFFFF",
    textSecondary: "rgba(255, 255, 255, 0.7)",
    textMuted: "rgba(255, 255, 255, 0.5)"
  }
};

const PROJECTS = [
  {
    id: "basketball-analyzer",
    title: "AI Basketball Game Analyzer",
    shortDesc: "Computer vision system for real-time basketball game analysis",
    icon: Activity,
    tags: ["Computer Vision", "Deep Learning", "Python", "YOLO"],
    gradient: "linear-gradient(135deg, #0078D4 0%, #00A4EF 100%)",
    featured: true
  },
  {
    id: "clapperboard-detector",
    title: "Clapperboard Detector Model",
    shortDesc: "ML model for automatic clapperboard detection in video production",
    icon: Camera,
    tags: ["Machine Learning", "Object Detection", "TensorFlow", "OpenCV"],
    gradient: "linear-gradient(135deg, #005A9E 0%, #0078D4 100%)",
    featured: false
  },
  {
    id: "camera-booking",
    title: "Full Stack Camera Booking App",
    shortDesc: "Complete equipment rental management system with mobile app",
    icon: Layers,
    tags: ["React Native", "Node.js", "PostgreSQL", "REST API"],
    gradient: "linear-gradient(135deg, #00A4EF 0%, #2B88D8 100%)",
    featured: false
  }
];

const SKILLS = [
  { name: "Python", icon: Code2 },
  { name: "TensorFlow", icon: Brain },
  { name: "PyTorch", icon: Cpu },
  { name: "Computer Vision", icon: Camera },
  { name: "React", icon: Globe },
  { name: "Node.js", icon: Database }
];

// ============================================
// STYLES
// ============================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  :root {
    --primary: ${CONFIG.colors.primary};
    --primary-light: ${CONFIG.colors.primaryLight};
    --primary-dark: ${CONFIG.colors.primaryDark};
    --accent: ${CONFIG.colors.accent};
    --dark: ${CONFIG.colors.dark};
    --dark-secondary: ${CONFIG.colors.darkSecondary};
    --glass: ${CONFIG.colors.glass};
    --glass-border: ${CONFIG.colors.glassBorder};
    --glass-hover: ${CONFIG.colors.glassHover};
    --text: ${CONFIG.colors.text};
    --text-secondary: ${CONFIG.colors.textSecondary};
    --text-muted: ${CONFIG.colors.textMuted};
  }
  
  body {
    font-family: 'Rubik', sans-serif;
    background: var(--dark);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }
  
  .app-container {
    min-height: 100vh;
    background: 
      radial-gradient(ellipse at 20% 0%, rgba(0, 120, 212, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 100%, rgba(0, 164, 239, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(43, 136, 216, 0.05) 0%, transparent 70%),
      var(--dark);
    position: relative;
  }
  
  .app-container::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 0;
  }
  
  /* Glass Card Effect */
  .glass-card {
    background: var(--glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .glass-card:hover {
    background: var(--glass-hover);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-4px);
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 60px rgba(0, 120, 212, 0.1);
  }
  
  /* Navigation */
  .nav-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 20px 40px;
  }
  
  .nav-inner {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .nav-glass {
    background: rgba(10, 22, 40, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 12px 24px;
  }
  
  .logo {
    font-size: 24px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
  }
  
  .nav-links {
    display: flex;
    gap: 8px;
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-family: 'Rubik', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 10px;
    transition: all 0.2s ease;
  }
  
  .nav-link:hover {
    color: var(--text);
    background: var(--glass);
  }
  
  .nav-link.active {
    color: var(--text);
    background: var(--glass);
  }
  
  .nav-link svg {
    width: 18px;
    height: 18px;
  }
  
  .mobile-menu-btn {
    display: none;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    padding: 10px;
    color: var(--text);
    cursor: pointer;
  }
  
  .mobile-nav {
    display: none;
    position: fixed;
    top: 80px;
    left: 20px;
    right: 20px;
    background: rgba(10, 22, 40, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 20px;
    z-index: 999;
  }
  
  .mobile-nav.open {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  /* Main Content */
  .main-content {
    padding-top: 120px;
    padding-bottom: 60px;
    min-height: 100vh;
    position: relative;
    z-index: 1;
  }
  
  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
  }
  
  /* Hero Section */
  .hero-section {
    display: flex;
    align-items: center;
    min-height: calc(100vh - 200px);
    gap: 80px;
  }
  
  .hero-content {
    flex: 1;
  }
  
  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 100px;
    font-size: 13px;
    font-weight: 500;
    color: var(--accent);
    margin-bottom: 24px;
    animation: fadeInUp 0.6s ease forwards;
    opacity: 0;
  }
  
  .hero-badge svg {
    width: 16px;
    height: 16px;
  }
  
  .hero-title {
    font-size: 72px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -2px;
    margin-bottom: 24px;
    animation: fadeInUp 0.6s ease forwards;
    animation-delay: 0.1s;
    opacity: 0;
  }
  
  .hero-title .gradient-text {
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .hero-subtitle {
    font-size: 20px;
    font-weight: 400;
    color: var(--text-secondary);
    margin-bottom: 40px;
    max-width: 500px;
    line-height: 1.6;
    animation: fadeInUp 0.6s ease forwards;
    animation-delay: 0.2s;
    opacity: 0;
  }
  
  .hero-buttons {
    display: flex;
    gap: 16px;
    animation: fadeInUp 0.6s ease forwards;
    animation-delay: 0.3s;
    opacity: 0;
  }
  
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 16px 32px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-family: 'Rubik', sans-serif;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 120, 212, 0.3);
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 120, 212, 0.4);
  }
  
  .btn-primary svg {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
  }
  
  .btn-primary:hover svg {
    transform: translateX(4px);
  }
  
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 16px 32px;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    color: var(--text);
    font-family: 'Rubik', sans-serif;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .btn-secondary:hover {
    background: var(--glass-hover);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .hero-visual {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeInUp 0.6s ease forwards;
    animation-delay: 0.4s;
    opacity: 0;
  }
  
  .hero-graphic {
    width: 400px;
    height: 400px;
    position: relative;
  }
  
  .hero-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    animation: float 6s ease-in-out infinite;
  }
  
  .hero-orb-1 {
    width: 300px;
    height: 300px;
    background: var(--primary);
    top: 50px;
    left: 50px;
    opacity: 0.4;
  }
  
  .hero-orb-2 {
    width: 200px;
    height: 200px;
    background: var(--accent);
    bottom: 50px;
    right: 50px;
    opacity: 0.3;
    animation-delay: -2s;
  }
  
  .hero-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 350px;
    height: 350px;
    border: 2px solid var(--glass-border);
    border-radius: 50%;
    animation: rotate 20s linear infinite;
  }
  
  .hero-ring::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    width: 20px;
    height: 20px;
    background: var(--accent);
    border-radius: 50%;
    box-shadow: 0 0 30px var(--accent);
  }
  
  /* Skills Section */
  .skills-section {
    margin-top: 80px;
    animation: fadeInUp 0.6s ease forwards;
    animation-delay: 0.5s;
    opacity: 0;
  }
  
  .skills-grid {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .skill-tag {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 100px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    transition: all 0.3s ease;
  }
  
  .skill-tag:hover {
    background: var(--glass-hover);
    color: var(--text);
    border-color: var(--primary);
  }
  
  .skill-tag svg {
    width: 16px;
    height: 16px;
    color: var(--primary);
  }
  
  /* Projects Page */
  .page-header {
    text-align: center;
    margin-bottom: 60px;
  }
  
  .page-title {
    font-size: 48px;
    font-weight: 800;
    letter-spacing: -1px;
    margin-bottom: 16px;
  }
  
  .page-subtitle {
    font-size: 18px;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
  }
  
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 32px;
  }
  
  .project-card {
    padding: 32px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  
  .project-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  
  .project-card:hover::before {
    transform: scaleX(1);
  }
  
  .project-icon-wrapper {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    position: relative;
  }
  
  .project-icon-wrapper svg {
    width: 32px;
    height: 32px;
    color: white;
    position: relative;
    z-index: 1;
  }
  
  .project-card-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .project-card-title svg {
    width: 20px;
    height: 20px;
    color: var(--primary);
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.3s ease;
  }
  
  .project-card:hover .project-card-title svg {
    opacity: 1;
    transform: translateX(0);
  }
  
  .project-card-desc {
    font-size: 16px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 24px;
  }
  
  .project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .project-tag {
    padding: 6px 14px;
    background: rgba(0, 120, 212, 0.15);
    border-radius: 100px;
    font-size: 12px;
    font-weight: 500;
    color: var(--accent);
  }
  
  .featured-badge {
    position: absolute;
    top: 20px;
    right: 20px;
    padding: 6px 12px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  /* Project Detail Page */
  .project-detail {
    max-width: 900px;
    margin: 0 auto;
  }
  
  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    color: var(--text-secondary);
    font-family: 'Rubik', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 40px;
    transition: all 0.2s ease;
  }
  
  .back-button:hover {
    background: var(--glass-hover);
    color: var(--text);
  }
  
  .back-button svg {
    width: 18px;
    height: 18px;
  }
  
  .project-detail-header {
    margin-bottom: 48px;
  }
  
  .project-detail-icon {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32px;
  }
  
  .project-detail-icon svg {
    width: 40px;
    height: 40px;
    color: white;
  }
  
  .project-detail-title {
    font-size: 48px;
    font-weight: 800;
    letter-spacing: -1px;
    margin-bottom: 16px;
  }
  
  .project-detail-desc {
    font-size: 20px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 32px;
  }
  
  .project-detail-content {
    padding: 48px;
  }
  
  .content-placeholder {
    text-align: center;
    padding: 80px 40px;
    color: var(--text-muted);
  }
  
  .content-placeholder svg {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .content-placeholder p {
    font-size: 16px;
  }
  
  /* Contact Page */
  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    max-width: 1000px;
    margin: 0 auto;
  }
  
  .contact-info {
    padding: 48px;
  }
  
  .contact-info h3 {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 16px;
  }
  
  .contact-info > p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 40px;
  }
  
  .contact-item {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    color: var(--text-secondary);
    transition: color 0.2s ease;
  }
  
  .contact-item:hover {
    color: var(--text);
  }
  
  .contact-item-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .contact-item-icon svg {
    width: 20px;
    height: 20px;
    color: var(--primary);
  }
  
  .contact-item-text {
    flex: 1;
  }
  
  .contact-item-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    margin-bottom: 4px;
  }
  
  .contact-item-value {
    font-size: 16px;
    font-weight: 500;
  }
  
  .social-links {
    display: flex;
    gap: 12px;
    margin-top: 40px;
  }
  
  .social-link {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    transition: all 0.2s ease;
    cursor: pointer;
  }
  
  .social-link:hover {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
  }
  
  .social-link svg {
    width: 20px;
    height: 20px;
  }
  
  .contact-form {
    padding: 48px;
  }
  
  .contact-form h3 {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 32px;
  }
  
  .form-group {
    margin-bottom: 24px;
  }
  
  .form-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }
  
  .form-input {
    width: 100%;
    padding: 16px 20px;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    color: var(--text);
    font-family: 'Rubik', sans-serif;
    font-size: 16px;
    transition: all 0.2s ease;
    outline: none;
  }
  
  .form-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(0, 120, 212, 0.1);
  }
  
  .form-input::placeholder {
    color: var(--text-muted);
  }
  
  .form-textarea {
    resize: vertical;
    min-height: 150px;
  }
  
  .submit-btn {
    width: 100%;
    padding: 18px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-family: 'Rubik', sans-serif;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 120, 212, 0.3);
  }
  
  .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 120, 212, 0.4);
  }
  
  .submit-btn svg {
    width: 20px;
    height: 20px;
  }
  
  /* Animations */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
  
  @keyframes rotate {
    from {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
  
  /* Responsive */
  @media (max-width: 1024px) {
    .hero-section {
      flex-direction: column;
      text-align: center;
      gap: 60px;
    }
    
    .hero-subtitle {
      margin: 0 auto 40px;
    }
    
    .hero-buttons {
      justify-content: center;
    }
    
    .hero-graphic {
      width: 300px;
      height: 300px;
    }
    
    .hero-orb-1 {
      width: 200px;
      height: 200px;
    }
    
    .hero-orb-2 {
      width: 150px;
      height: 150px;
    }
    
    .hero-ring {
      width: 250px;
      height: 250px;
    }
    
    .skills-section {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .skills-grid {
      justify-content: center;
    }
    
    .contact-grid {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 768px) {
    .nav-container {
      padding: 16px 20px;
    }
    
    .nav-links {
      display: none;
    }
    
    .mobile-menu-btn {
      display: flex;
    }
    
    .container {
      padding: 0 20px;
    }
    
    .hero-title {
      font-size: 42px;
    }
    
    .hero-subtitle {
      font-size: 16px;
    }
    
    .hero-buttons {
      flex-direction: column;
      width: 100%;
    }
    
    .btn-primary,
    .btn-secondary {
      width: 100%;
      justify-content: center;
    }
    
    .projects-grid {
      grid-template-columns: 1fr;
    }
    
    .project-detail-title {
      font-size: 32px;
    }
    
    .page-title {
      font-size: 36px;
    }
  }
`;

// ============================================
// COMPONENTS
// ============================================

// Navigation Component
const Navigation = ({ currentPage, setCurrentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'contact', label: 'Contact', icon: Mail }
  ];
  
  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
  };
  
  return (
    <nav className="nav-container">
      <div className="nav-inner">
        <div className="nav-glass" style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <div className="logo" onClick={() => setCurrentPage('home')} style={{ cursor: 'pointer' }}>
            {CONFIG.name}
          </div>
          <div className="nav-links">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <item.icon />
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            <item.icon />
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

// Home Page Component
const HomePage = ({ setCurrentPage }) => {
  return (
    <div className="container">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Brain />
            ML/AI Engineering Portfolio
          </div>
          <h1 className="hero-title">
            Hi, I'm <span className="gradient-text">{CONFIG.name}</span>
          </h1>
          <p className="hero-subtitle">
            {CONFIG.tagline}. Passionate about building intelligent systems that solve real-world problems through machine learning and artificial intelligence.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => setCurrentPage('projects')}>
              View Projects
              <ArrowRight />
            </button>
            <button className="btn-secondary" onClick={() => setCurrentPage('contact')}>
              <Mail />
              Get in Touch
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-graphic">
            <div className="hero-orb hero-orb-1"></div>
            <div className="hero-orb hero-orb-2"></div>
            <div className="hero-ring"></div>
          </div>
        </div>
      </section>
      
      <section className="skills-section">
        <div className="skills-grid">
          {SKILLS.map((skill, index) => (
            <div key={index} className="skill-tag">
              <skill.icon />
              {skill.name}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Projects Page Component
const ProjectsPage = ({ setCurrentPage, setSelectedProject }) => {
  const handleProjectClick = (projectId) => {
    setSelectedProject(projectId);
    setCurrentPage('project-detail');
  };
  
  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Featured Projects</h1>
        <p className="page-subtitle">
          A collection of my work in machine learning, computer vision, and full-stack development
        </p>
      </header>
      
      <div className="projects-grid">
        {PROJECTS.map((project) => (
          <div 
            key={project.id}
            className="glass-card project-card"
            onClick={() => handleProjectClick(project.id)}
          >
            {project.featured && <span className="featured-badge">Featured</span>}
            <div 
              className="project-icon-wrapper"
              style={{ background: project.gradient }}
            >
              <project.icon />
            </div>
            <h3 className="project-card-title">
              {project.title}
              <ArrowRight />
            </h3>
            <p className="project-card-desc">{project.shortDesc}</p>
            <div className="project-tags">
              {project.tags.map((tag, index) => (
                <span key={index} className="project-tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Project Detail Page Component
const ProjectDetailPage = ({ projectId, setCurrentPage }) => {
  const project = PROJECTS.find(p => p.id === projectId);
  
  if (!project) {
    return (
      <div className="container">
        <p>Project not found</p>
      </div>
    );
  }
  
  return (
    <div className="container">
      <div className="project-detail">
        <button className="back-button" onClick={() => setCurrentPage('projects')}>
          <ChevronLeft />
          Back to Projects
        </button>
        
        <header className="project-detail-header">
          <div 
            className="project-detail-icon"
            style={{ background: project.gradient }}
          >
            <project.icon />
          </div>
          <h1 className="project-detail-title">{project.title}</h1>
          <p className="project-detail-desc">{project.shortDesc}</p>
          <div className="project-tags">
            {project.tags.map((tag, index) => (
              <span key={index} className="project-tag">{tag}</span>
            ))}
          </div>
        </header>
        
        <div className="glass-card project-detail-content">
          <div className="content-placeholder">
            <Layers />
            <p>Project content coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Contact Page Component
const ContactPage = () => {
  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Get in Touch</h1>
        <p className="page-subtitle">
          I'm always open to discussing new projects, opportunities, or collaborations
        </p>
      </header>
      
      <div className="contact-grid">
        <div className="glass-card contact-info">
          <h3>Contact Information</h3>
          <p>Feel free to reach out through any of the following channels</p>
          
          <div className="contact-item">
            <div className="contact-item-icon">
              <AtSign />
            </div>
            <div className="contact-item-text">
              <div className="contact-item-label">Email</div>
              <div className="contact-item-value">{CONFIG.email}</div>
            </div>
          </div>
          
          <div className="contact-item">
            <div className="contact-item-icon">
              <Phone />
            </div>
            <div className="contact-item-text">
              <div className="contact-item-label">Phone</div>
              <div className="contact-item-value">{CONFIG.phone}</div>
            </div>
          </div>
          
          <div className="contact-item">
            <div className="contact-item-icon">
              <MapPin />
            </div>
            <div className="contact-item-text">
              <div className="contact-item-label">Location</div>
              <div className="contact-item-value">{CONFIG.location}</div>
            </div>
          </div>
          
          <div className="social-links">
            <a className="social-link" href={`https://${CONFIG.github}`} target="_blank" rel="noopener noreferrer">
              <Github />
            </a>
            <a className="social-link" href={`https://${CONFIG.linkedin}`} target="_blank" rel="noopener noreferrer">
              <Linkedin />
            </a>
          </div>
        </div>
        
        <div className="glass-card contact-form">
          <h3>Send a Message</h3>
          
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" placeholder="John Doe" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="john@example.com" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input type="text" className="form-input" placeholder="Project Inquiry" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-input form-textarea" placeholder="Tell me about your project..."></textarea>
          </div>
          
          <button className="submit-btn">
            Send Message
            <Send />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================
export default function Portfolio() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null);
  
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'projects':
        return <ProjectsPage setCurrentPage={setCurrentPage} setSelectedProject={setSelectedProject} />;
      case 'project-detail':
        return <ProjectDetailPage projectId={selectedProject} setCurrentPage={setCurrentPage} />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };
  
  return (
    <>
      <style>{styles}</style>
      <div className="app-container">
        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    </>
  );
}

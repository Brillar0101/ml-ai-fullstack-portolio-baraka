import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  FileText,
  Github,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Layers,
  Target,
  Zap,
  Users,
  Building2,
  Workflow,
  BarChart3,
  Code2,
  BookOpen,
  Mail,
  ArrowRight,
  Camera,
  Film,
  Box,
  Timer,
  Gauge,
  TrendingUp,
  Image,
  Video,
  Settings,
  Package,
  Lightbulb,
  XCircle,
  Award,
  X,
  Smartphone,
  CreditCard,
  ShoppingCart,
  Calendar,
  Star,
  Shield,
  Server,
  Globe,
  Layout,
  Monitor
} from 'lucide-react';
import './PSIVRentalsProject.css';
import DatabaseSchemaDiagram from '../components/diagrams/DatabaseSchemaDiagram';
import SystemArchitectureDiagram from '../components/diagrams/SystemArchitectureDiagram';

const PSIVRentalsProject = () => {
  const [activeSection, setActiveSection] = useState('demo');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState({ src: '', alt: '' });

  // Slideshow state for app screens
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slideSpeed, setSlideSpeed] = useState(2000);

  // Toggle between mobile app and admin dashboard
  const [activeDevice, setActiveDevice] = useState('mobile');
  const [adminSlide, setAdminSlide] = useState(0);

  const openLightbox = (src, alt) => {
    setLightboxImage({ src, alt });
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  // Mobile App screenshots for slideshow
  const appScreenshots = [
    { src: '/assets/images/psiv-rentals/screen-01.PNG', alt: 'Home Screen' },
    { src: '/assets/images/psiv-rentals/screen-02.PNG', alt: 'Equipment Browse' },
    { src: '/assets/images/psiv-rentals/screen-03.PNG', alt: 'Equipment Details' },
    { src: '/assets/images/psiv-rentals/screen-04.PNG', alt: 'Cart View' },
    { src: '/assets/images/psiv-rentals/screen-05.PNG', alt: 'Checkout Flow' },
    { src: '/assets/images/psiv-rentals/screen-06.PNG', alt: 'Booking Confirmation' },
    { src: '/assets/images/psiv-rentals/screen-07.PNG', alt: 'My Bookings' },
    { src: '/assets/images/psiv-rentals/screen-08.PNG', alt: 'Profile Screen' }
  ];

  // Admin Dashboard screenshots
  const adminScreenshots = [
    { src: '/assets/images/psiv-rentals/admin-dashboard.png', alt: 'Dashboard Overview' },
    { src: '/assets/images/psiv-rentals/admin-equipment.png', alt: 'Equipment Management' },
    { src: '/assets/images/psiv-rentals/admin-bookings.png', alt: 'Bookings Management' },
    { src: '/assets/images/psiv-rentals/admin-categories.png', alt: 'Categories Management' },
    { src: '/assets/images/psiv-rentals/admin-promo.png', alt: 'Promo Codes' },
    { src: '/assets/images/psiv-rentals/admin-login.png', alt: 'Admin Login' }
  ];

  // Get current screenshots based on active device
  const currentScreenshots = activeDevice === 'mobile' ? appScreenshots : adminScreenshots;
  const currentIndex = activeDevice === 'mobile' ? currentSlide : adminSlide;
  const setCurrentIndex = activeDevice === 'mobile' ? setCurrentSlide : setAdminSlide;

  // Slideshow auto-play effect
  useEffect(() => {
    if (!isPlaying || currentScreenshots.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % currentScreenshots.length);
    }, slideSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, slideSpeed, currentScreenshots.length, activeDevice]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % currentScreenshots.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + currentScreenshots.length) % currentScreenshots.length);

  const metrics = [
    { label: 'Mobile Screens', value: '74+', icon: Smartphone },
    { label: 'API Endpoints', value: '65+', icon: Server },
    { label: 'Database Tables', value: '11', icon: Database },
    { label: 'Equipment Categories', value: '5+', icon: Package },
    { label: 'API Response', value: '<200ms', icon: Zap },
    { label: 'App Launch', value: '<3s', icon: Timer }
  ];

  const techStack = {
    mobile: [
      { name: 'React Native', desc: 'Cross-Platform Framework' },
      { name: 'Expo SDK 54', desc: 'Development Platform' },
      { name: 'TypeScript', desc: 'Type Safety' },
      { name: 'Zustand', desc: 'State Management' },
      { name: 'React Query', desc: 'Server State' },
      { name: 'React Navigation', desc: 'Navigation' }
    ],
    backend: [
      { name: 'Node.js + Express', desc: 'API Server' },
      { name: 'PostgreSQL', desc: 'Primary Database' },
      { name: 'Redis', desc: 'Caching & Sessions' },
      { name: 'JWT', desc: 'Authentication' },
      { name: 'Stripe SDK', desc: 'Payment Processing' },
      { name: 'AWS S3', desc: 'File Storage' }
    ],
    admin: [
      { name: 'React 19', desc: 'UI Framework' },
      { name: 'React Router 7', desc: 'Routing' },
      { name: 'Recharts', desc: 'Data Visualization' },
      { name: 'Axios', desc: 'HTTP Client' }
    ]
  };

  const features = {
    customer: [
      { icon: Users, title: 'User Auth', desc: 'JWT-based secure login & registration' },
      { icon: Camera, title: 'Equipment Browse', desc: 'Categories, search, filters & sorting' },
      { icon: Calendar, title: 'Booking Flow', desc: 'Date selection with availability check' },
      { icon: ShoppingCart, title: 'Cart System', desc: 'Multi-item cart with quantity management' },
      { icon: CreditCard, title: 'Payments', desc: 'Stripe integration with Apple Pay' },
      { icon: Star, title: 'Reviews', desc: 'Rate and review rented equipment' }
    ],
    admin: [
      { icon: Package, title: 'Inventory', desc: 'Add, edit, manage equipment stock' },
      { icon: Calendar, title: 'Bookings', desc: 'View, update, cancel bookings' },
      { icon: Target, title: 'Promo Codes', desc: 'Create and manage discount codes' },
      { icon: BarChart3, title: 'Analytics', desc: 'Search trends & business metrics' }
    ]
  };

  const challenges = [
    {
      challenge: 'Real-time availability tracking across concurrent bookings',
      solution: 'Implemented PostgreSQL date range queries with conflict detection algorithm achieving O(log n) lookup time'
    },
    {
      challenge: 'Handling complex pricing with daily/weekly rates and discounts',
      solution: 'Built a dynamic pricing engine that calculates optimal rates based on rental duration with tax and promo support'
    },
    {
      challenge: 'Secure payment processing with multiple failure scenarios',
      solution: 'Integrated Stripe with proper error handling, payment intent flow, and webhook support for async events'
    },
    {
      challenge: 'Managing state across 74+ screens without performance issues',
      solution: 'Used Zustand for lightweight global state and React Query for server state with automatic caching'
    }
  ];

  const futureWork = [
    'Email notifications via SendGrid for booking confirmations',
    'Push notifications for rental reminders',
    'AI-powered equipment recommendations',
    'Multi-location support with pickup scheduling'
  ];

  return (
    <div className="project-page psiv-project">
      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <X />
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage.src} alt={lightboxImage.alt} />
            <p className="lightbox-caption">{lightboxImage.alt}</p>
          </div>
        </div>
      )}

      {/* Back Button */}
      <Link to="/projects" className="back-button">
        <ChevronLeft />
        <span>Back to Projects</span>
      </Link>

      {/* Section 0: Header */}
      <header className="project-header">
        <div className="header-content">
          <div className="project-icon-large">
            <Smartphone />
          </div>
          <div className="header-text">
            <div className="project-badges">
              <span className="badge featured">
                <Award />
                Full-Stack Application
              </span>
              <span className="badge platform">
                <Globe />
                iOS & Android
              </span>
            </div>
            <h1>PSIV Rentals</h1>
            <p className="project-tagline">
              Equipment Rental Platform for Photography & Videography Gear
            </p>
            <div className="project-tags">
              <span className="tag">React Native</span>
              <span className="tag">Node.js</span>
              <span className="tag">PostgreSQL</span>
              <span className="tag">Stripe</span>
              <span className="tag">TypeScript</span>
              <span className="tag">AWS S3</span>
            </div>
            <div className="header-ctas">
              <a href="https://github.com/Brillar0101/psiv-rentals" target="_blank" rel="noopener noreferrer" className="cta-primary">
                <Github />
                View on GitHub
              </a>
              <a href="#demo" className="cta-secondary">
                <Play />
                View Demo
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Section 1: Demo / Screenshots */}
      <section className="project-section" id="demo">
        <div className="section-header">
          <Layout />
          <h2>Application Screenshots</h2>
        </div>
        <div className="demo-content">
          <div className="app-preview glass-card">
            {/* Device Toggle Buttons */}
            <div className="device-toggle">
              <button
                className={`toggle-btn ${activeDevice === 'mobile' ? 'active' : ''}`}
                onClick={() => setActiveDevice('mobile')}
              >
                <Smartphone />
                <span>Mobile App</span>
              </button>
              <button
                className={`toggle-btn ${activeDevice === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveDevice('admin')}
              >
                <Monitor />
                <span>Admin Dashboard</span>
              </button>
            </div>

            {/* Device Preview */}
            <div className="device-preview-container">
              {activeDevice === 'mobile' ? (
                /* Phone Mockup - Customer App */
                <div className="phone-mockup">
                  <div className="phone-frame">
                    <div className="phone-screen">
                      <img
                        src={currentScreenshots[currentIndex]?.src}
                        alt={currentScreenshots[currentIndex]?.alt}
                        onClick={() => openLightbox(currentScreenshots[currentIndex]?.src, currentScreenshots[currentIndex]?.alt)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Laptop Mockup - Admin Dashboard */
                <div className="laptop-mockup">
                  <div className="laptop-frame">
                    <div className="laptop-screen">
                      <img
                        src={currentScreenshots[currentIndex]?.src}
                        alt={currentScreenshots[currentIndex]?.alt}
                        onClick={() => openLightbox(currentScreenshots[currentIndex]?.src, currentScreenshots[currentIndex]?.alt)}
                      />
                    </div>
                  </div>
                  <div className="laptop-base"></div>
                </div>
              )}
            </div>

            {/* Slideshow Controls */}
            <div className="slideshow-controls">
              <button className="control-btn" onClick={prevSlide}>
                <ChevronLeft />
              </button>
              <button
                className={`control-btn play-btn ${isPlaying ? 'playing' : ''}`}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause /> : <Play />}
              </button>
              <button className="control-btn" onClick={nextSlide}>
                <ChevronRight />
              </button>
            </div>
            <div className="slide-counter">
              {currentIndex + 1} / {currentScreenshots.length}
            </div>
            <p className="slide-caption">{currentScreenshots[currentIndex]?.alt}</p>
          </div>
        </div>
      </section>

      {/* Section 2: Problem Statement */}
      <section className="project-section">
        <div className="section-header">
          <AlertCircle />
          <h2>The Problem</h2>
        </div>
        <div className="problem-grid">
          <div className="glass-card problem-card">
            <div className="problem-icon">
              <XCircle />
            </div>
            <h3>Poor User Experience</h3>
            <p>
              Existing rental solutions have outdated interfaces and complex booking processes 
              that frustrate photographers looking for quick equipment access.
            </p>
          </div>
          <div className="glass-card problem-card">
            <div className="problem-icon">
              <Clock />
            </div>
            <h3>No Real-Time Availability</h3>
            <p>
              Manual inventory tracking leads to double bookings and disappointed customers 
              when equipment isn't available as expected.
            </p>
          </div>
          <div className="glass-card problem-card success-card">
            <div className="problem-icon success">
              <CheckCircle />
            </div>
            <h3>What Success Looks Like</h3>
            <p>
              A modern mobile-first experience with real-time availability, seamless payments, 
              and comprehensive admin tools for business management.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Who Uses This */}
      <section className="project-section">
        <div className="section-header">
          <Users />
          <h2>Who Uses This</h2>
        </div>
        <div className="users-content">
          <div className="glass-card users-card">
            <h3>Target Users</h3>
            <ul className="users-list">
              <li>
                <Camera />
                <span>Independent photographers and videographers</span>
              </li>
              <li>
                <Video />
                <span>Content creators and social media influencers</span>
              </li>
              <li>
                <Building2 />
                <span>Small production companies</span>
              </li>
              <li>
                <Users />
                <span>Photography students and hobbyists</span>
              </li>
            </ul>
          </div>
          <div className="glass-card users-card">
            <h3>Equipment Categories</h3>
            <ul className="users-list">
              <li>
                <Camera />
                <span>Cameras (DSLR, Mirrorless, Cinema)</span>
              </li>
              <li>
                <Target />
                <span>Lenses (Prime, Zoom, Specialty)</span>
              </li>
              <li>
                <Zap />
                <span>Lighting (Strobes, LED, Modifiers)</span>
              </li>
              <li>
                <Box />
                <span>Audio (Mics, Recorders, Mixers)</span>
              </li>
              <li>
                <Package />
                <span>Accessories (Tripods, Gimbals, Bags)</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 4: Solution Overview - System Architecture Diagram */}
      <section className="project-section">
        <div className="section-header">
          <Lightbulb />
          <h2>My Solution</h2>
        </div>
        <div className="solution-content">
          {/* System Architecture Diagram - SVG Component */}
          <div className="diagram-container">
            <div className="diagram-header">
              <Workflow />
              <h3>Complete System Architecture (4-Tier)</h3>
            </div>
            <div className="diagram-image-container">
              <SystemArchitectureDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Features */}
      <section className="project-section">
        <div className="section-header">
          <Layers />
          <h2>Features</h2>
        </div>
        <div className="features-content">
          <div className="glass-card features-card">
            <h3>
              <Smartphone />
              Customer App (74+ Screens)
            </h3>
            <div className="features-grid">
              {features.customer.map((feature, index) => (
                <div key={index} className="feature-item">
                  <feature.icon />
                  <div>
                    <h4>{feature.title}</h4>
                    <p>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card features-card">
            <h3>
              <Monitor />
              Admin Dashboard
            </h3>
            <div className="features-grid">
              {features.admin.map((feature, index) => (
                <div key={index} className="feature-item">
                  <feature.icon />
                  <div>
                    <h4>{feature.title}</h4>
                    <p>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Results / Metrics */}
      <section className="project-section">
        <div className="section-header">
          <BarChart3 />
          <h2>Project Metrics</h2>
        </div>
        <div className="results-content">
          <div className="metrics-grid">
            {metrics.map((metric, index) => (
              <div key={index} className="glass-card metric-card">
                <metric.icon />
                <span className="metric-value">{metric.value}</span>
                <span className="metric-label">{metric.label}</span>
              </div>
            ))}
          </div>

          {/* API Endpoints Summary */}
          <div className="glass-card api-summary">
            <h3>API Endpoints (65+)</h3>
            <div className="api-grid">
              <div className="api-category">
                <span className="api-name">Auth</span>
                <span className="api-count">7</span>
                <span className="api-desc">Signup, Login, Profile, Password</span>
              </div>
              <div className="api-category">
                <span className="api-name">Equipment</span>
                <span className="api-count">10</span>
                <span className="api-desc">CRUD, Search, Images</span>
              </div>
              <div className="api-category">
                <span className="api-name">Bookings</span>
                <span className="api-count">12</span>
                <span className="api-desc">CRUD, Status, Extensions</span>
              </div>
              <div className="api-category">
                <span className="api-name">Payments</span>
                <span className="api-count">3</span>
                <span className="api-desc">Intent, Confirm, Status</span>
              </div>
              <div className="api-category">
                <span className="api-name">Cart</span>
                <span className="api-count">6</span>
                <span className="api-desc">Add, Update, Delete, Checkout</span>
              </div>
              <div className="api-category">
                <span className="api-name">Promo</span>
                <span className="api-count">12</span>
                <span className="api-desc">Validate, Apply, Admin CRUD</span>
              </div>
            </div>
          </div>

          {/* Database Schema Diagram - SVG Component */}
          <div className="diagram-section">
            <div className="diagram-container">
              <div className="diagram-header">
                <Database />
                <h3>Complete Database Schema (10 Tables with Relationships)</h3>
              </div>
              <div className="diagram-image-container">
                <DatabaseSchemaDiagram />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Challenges & Lessons */}
      <section className="project-section">
        <div className="section-header">
          <Lightbulb />
          <h2>Challenges & Lessons Learned</h2>
        </div>
        <div className="challenges-content">
          <div className="challenges-list">
            {challenges.map((item, index) => (
              <div key={index} className="glass-card challenge-card">
                <div className="challenge-header">
                  <AlertCircle />
                  <h4>Challenge</h4>
                </div>
                <p className="challenge-text">{item.challenge}</p>
                <div className="solution-header">
                  <CheckCircle />
                  <h4>Solution</h4>
                </div>
                <p className="solution-text">{item.solution}</p>
              </div>
            ))}
          </div>

          <div className="glass-card future-work">
            <h3>
              <ArrowRight />
              Future Roadmap
            </h3>
            <ul className="future-list">
              {futureWork.map((item, index) => (
                <li key={index}>
                  <Target />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Section 8: Tech Stack */}
      <section className="project-section">
        <div className="section-header">
          <Code2 />
          <h2>Tech Stack</h2>
        </div>
        <div className="tech-content">
          <div className="tech-card">
            <div className="tech-card-icon">
              <Smartphone />
            </div>
            <h3>Mobile App</h3>
            <div className="tech-list">
              {techStack.mobile.map((tech, index) => (
                <div key={index} className="tech-item">
                  <span className="tech-name">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="tech-card">
            <div className="tech-card-icon">
              <Server />
            </div>
            <h3>Backend</h3>
            <div className="tech-list">
              {techStack.backend.map((tech, index) => (
                <div key={index} className="tech-item">
                  <span className="tech-name">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="tech-card">
            <div className="tech-card-icon">
              <Monitor />
            </div>
            <h3>Admin Dashboard</h3>
            <div className="tech-list">
              {techStack.admin.map((tech, index) => (
                <div key={index} className="tech-item">
                  <span className="tech-name">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Links */}
      <section className="project-section">
        <div className="section-header">
          <BookOpen />
          <h2>Links & Resources</h2>
        </div>
        <div className="links-content">
          <div className="links-grid">
            <a href="https://github.com/Brillar0101/psiv-rentals" target="_blank" rel="noopener noreferrer" className="glass-card link-card">
              <Github />
              <span className="link-title">GitHub Repository</span>
              <span className="link-url">github.com/Brillar0101/psiv-rentals</span>
            </a>
            <a href="https://github.com/Brillar0101/psiv-rentals-admin" target="_blank" rel="noopener noreferrer" className="glass-card link-card">
              <Monitor />
              <span className="link-title">Admin Dashboard Repo</span>
              <span className="link-url">github.com/Brillar0101/psiv-rentals-admin</span>
            </a>
            <a href="https://github.com/Brillar0101/psiv-rentals-api" target="_blank" rel="noopener noreferrer" className="glass-card link-card">
              <Server />
              <span className="link-title">API Backend Repo</span>
              <span className="link-url">github.com/Brillar0101/psiv-rentals-api</span>
            </a>
          </div>

          <div className="glass-card contact-cta">
            <h3>Interested in this project?</h3>
            <p>I'd love to discuss the technical implementation or potential collaborations.</p>
            <Link to="/contact" className="cta-primary">
              <Mail />
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PSIVRentalsProject;

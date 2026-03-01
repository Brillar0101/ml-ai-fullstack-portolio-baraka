import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ContactPage from './pages/ContactPage';
import ProtectedRoute from './components/ProtectedRoute';
import { usePageTracking } from './hooks/useAnalytics';
import { CONFIG } from './config';
import './styles/global.css';

// Lazy-load heavy project pages
const ClapperboardProject = lazy(() => import('./pages/ClapperboardProject'));
const PSIVRentalsProject = lazy(() => import('./pages/PSIVRentalsProject'));
const SwishVisionProject = lazy(() => import('./pages/SwishVisionProject'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const PixelMonarchProject = lazy(() => import('./pages/PixelMonarchProject'));
const TouhouProject = lazy(() => import('./pages/TouhouProject'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));

// Lazy-load admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia'));

// Page titles for each route
const pageTitles = {
  '/': 'Home',
  '/projects': 'Projects',
  '/contact': 'Contact',
  '/projects/clapperboard': 'Clapperboard Detection',
  '/projects/psiv-rentals': 'PSIV Rentals',
  '/projects/swishvision': 'SwishVision',
  '/projects/pixel-monarch': 'Pixel Monarch',
  '/projects/touhou': 'Touhou',
  '/about': 'About',
  '/blog': 'Blog'
};

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      color: 'var(--text-muted)',
      fontSize: '14px'
    }}>
      Loading...
    </div>
  );
}

export default function App() {
  const location = useLocation();

  // Track page views
  usePageTracking();

  // Update document title based on route
  useEffect(() => {
    const pageTitle = pageTitles[location.pathname] || 'Home';
    document.title = `${pageTitle} | ${CONFIG.name}, Computer Engineer`;
  }, [location.pathname]);

  const isHomePage = location.pathname === '/';
  const isContactPage = location.pathname === '/contact';
  const isAdminPage = location.pathname.startsWith('/admin');
  const isFullPage = isHomePage || isContactPage;

  // Lock body scroll on full-page routes (home, contact)
  useEffect(() => {
    if (isFullPage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isFullPage]);

  return (
    <div className="app-container">
      {!isAdminPage && <Navigation />}
      <main className={`main-content ${isFullPage ? 'no-scroll' : ''} ${isAdminPage ? 'admin-page' : ''}`}>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/projects/clapperboard" element={<ClapperboardProject />} />
            <Route path="/projects/psiv-rentals" element={<PSIVRentalsProject />} />
            <Route path="/projects/swishvision" element={<SwishVisionProject />} />
            <Route path="/projects/pixel-monarch" element={<PixelMonarchProject />} />
            <Route path="/projects/touhou" element={<TouhouProject />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="media" element={<AdminMedia />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

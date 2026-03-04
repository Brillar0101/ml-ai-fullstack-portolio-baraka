import React, { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { usePublicPage } from '../hooks/usePublicPage';
import {
  GraduationCap,
  Target,
  Download,
  FileText,
  Brain,
  Globe,
  Cpu,
  Wrench,
  Github,
  Linkedin,
  Mail
} from 'lucide-react';
import { CONFIG } from '../config';
import './AboutPage.css';

const devicon = (slug, variant = 'original') =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-${variant}.svg`;

const skillCategories = [
  {
    title: 'ML / AI',
    icon: Brain,
    skills: [
      { name: 'PyTorch', logo: devicon('pytorch') },
      { name: 'TensorFlow', logo: devicon('tensorflow') },
      { name: 'YOLOv8', logo: null },
      { name: 'SAM2', logo: null },
      { name: 'OpenCV', logo: devicon('opencv') },
      { name: 'Scikit-learn', logo: devicon('scikitlearn') },
      { name: 'Hugging Face', logo: null },
      { name: 'ONNX', logo: null },
    ]
  },
  {
    title: 'Web Development',
    icon: Globe,
    skills: [
      { name: 'React', logo: devicon('react') },
      { name: 'Next.js', logo: devicon('nextjs'), invert: true },
      { name: 'Node.js', logo: devicon('nodejs') },
      { name: 'FastAPI', logo: devicon('fastapi') },
      { name: 'PostgreSQL', logo: devicon('postgresql') },
      { name: 'Supabase', logo: devicon('supabase') },
      { name: 'Tailwind CSS', logo: devicon('tailwindcss') },
    ]
  },
  {
    title: 'Embedded Systems',
    icon: Cpu,
    skills: [
      { name: 'MSP432', logo: null },
      { name: 'C', logo: devicon('c') },
      { name: 'UART', logo: null },
      { name: 'SPI', logo: null },
      { name: 'ADC14', logo: null },
      { name: 'Timer32', logo: null },
      { name: 'Bare Metal', logo: null },
      { name: 'ARM Cortex-M', logo: null },
    ]
  },
  {
    title: 'Tools & Platforms',
    icon: Wrench,
    skills: [
      { name: 'Git', logo: devicon('git') },
      { name: 'Docker', logo: devicon('docker') },
      { name: 'Linux', logo: devicon('linux') },
      { name: 'Vercel', logo: null },
      { name: 'AWS', logo: devicon('amazonwebservices', 'plain-wordmark'), invert: true },
      { name: 'Roboflow', logo: null },
      { name: 'Jupyter', logo: devicon('jupyter') },
      { name: 'VS Code', logo: devicon('vscode') },
    ]
  }
];

const PageRenderer = lazy(() => import('../builder/components/PageRenderer').then(m => ({ default: m.PageRenderer })));

const getPhotoCrop = () => {
  try {
    const saved = localStorage.getItem('profile_photo_crop');
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
};

const AboutPage = () => {
  const { content, loading } = usePublicPage('/about');
  const photoCrop = getPhotoCrop();

  if (loading) return <div style={{ minHeight: '60vh' }} />;
  if (content) return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <PageRenderer craftState={content} />
    </Suspense>
  );

  return (
    <div className="about-page">
      {/* Hero Bio — Micron style */}
      <div className="about-hero">
        <div className="about-hero-bg" />
        <div className="about-hero-content">
          <div className="about-hero-photo">
            <img
              src="/assets/images/profile.jpg"
              alt="Barakaeli Lawuo"
              style={photoCrop ? {
                transform: `scale(${photoCrop.zoom})`,
                transformOrigin: `${50 - photoCrop.position.x}% ${50 - photoCrop.position.y}%`,
              } : undefined}
            />
          </div>
          <div className="about-hero-text">
            <p className="about-hero-quote">
              "I build intelligent systems at the intersection of hardware and
              software, from training computer vision models to programming
              bare metal microcontrollers."
            </p>
            <p className="about-hero-name">Barakaeli Lawuo</p>
            <p className="about-hero-role">Computer Engineer, Virginia Tech</p>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Education + Career Goals */}
        <section className="about-section">
          <div className="about-info-grid">
            {/* Education */}
            <div className="about-info-card">
              <h3>Virginia Tech</h3>
              <p className="about-degree">B.S. Computer Engineering</p>
              <p className="about-grad">Expected Graduation: 2027</p>
              <p className="about-location">Blacksburg, Virginia</p>
            </div>

            {/* Career Goals */}
            <div className="about-info-card">
              <h3>Career Goals</h3>
              <p>
                I want to work on systems that bridge the gap between intelligent
                software and physical hardware. Whether that means deploying ML
                models on edge devices, building computer vision pipelines, or
                architecting full stack platforms that use AI to solve real problems.
              </p>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="about-section">
          <div className="about-section-header">
            <Wrench />
            <h2>Skills & Technologies</h2>
          </div>
          <div className="about-skills-grid">
            {skillCategories.map((cat) => (
              <div key={cat.title} className="about-skill-card">
                <div className="about-skill-card-header">
                  <cat.icon />
                  <h3>{cat.title}</h3>
                </div>
                <div className="about-skill-pills">
                  {cat.skills.map((skill, i) => (
                    <span key={i} className="about-skill-pill">
                      {skill.logo ? (
                        <img
                          src={skill.logo}
                          alt=""
                          className={skill.invert ? 'invert' : ''}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : null}
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Resume */}
        <section className="about-section">
          <div className="about-section-header">
            <FileText />
            <h2>Resume</h2>
          </div>
          <div className="about-resume-wrap">
            <iframe
              src="/assets/resume.pdf"
              title="Resume"
            />
            <div className="about-resume-actions">
              <a href="/assets/resume.pdf" download className="btn-primary">
                <Download size={16} />
                Download Resume
              </a>
            </div>
          </div>
        </section>

        {/* Connect */}
        <section className="about-section">
          <div className="about-section-header">
            <Mail />
            <h2>Connect</h2>
          </div>
          <div className="about-connect-links">
            <a href={`https://${CONFIG.github}`} target="_blank" rel="noopener noreferrer" className="about-connect-link">
              <Github />
              GitHub
            </a>
            <a href={`https://${CONFIG.linkedin}`} target="_blank" rel="noopener noreferrer" className="about-connect-link">
              <Linkedin />
              LinkedIn
            </a>
            <Link to="/contact" className="about-connect-link">
              <Mail />
              Contact Me
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;

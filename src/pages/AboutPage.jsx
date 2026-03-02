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
      { name: 'Bare-Metal', logo: null },
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
    <div className="about-page container">
      <header className="page-header">
        <p className="eyebrow">About</p>
        <h1 className="page-title">About Me</h1>
      </header>

      {/* Bio */}
      <section className="about-section">
        <div className="about-bio-grid">
          <div className="about-photo">
            <img
              src="/assets/images/profile.jpg"
              alt="Barakaeli Lawuo"
              className="about-photo-img"
              style={photoCrop ? {
                transform: `scale(${photoCrop.zoom})`,
                transformOrigin: `${50 - photoCrop.position.x}% ${50 - photoCrop.position.y}%`,
              } : undefined}
            />
          </div>
          <div className="about-bio-text">
            <h2>Barakaeli Lawuo</h2>
            <p className="about-role">Computer Engineer</p>
            <p>
              I am a Computer Engineering student at Virginia Tech with a passion for
              building intelligent systems that sit at the intersection of hardware and software.
              My work spans machine learning, embedded systems, and full-stack web development.
            </p>
            <p>
              I enjoy tackling challenging problems that require both low-level hardware
              understanding and high-level software design, from training computer vision
              models to programming bare-metal microcontrollers.
            </p>
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="about-section">
        <div className="section-header">
          <GraduationCap />
          <h2>Education</h2>
        </div>
        <div className="info-card about-education-card">
          <h3>Virginia Tech</h3>
          <p className="about-degree">B.S. Computer Engineering</p>
          <p className="about-grad">Expected Graduation: 2027</p>
          <p>Blacksburg, Virginia</p>
        </div>
      </section>

      {/* Career Goals */}
      <section className="about-section">
        <div className="section-header">
          <Target />
          <h2>Career Goals</h2>
        </div>
        <div className="content-block">
          <p>
            I want to work on systems that bridge the gap between intelligent software
            and physical hardware. Whether that means deploying ML models on edge devices,
            building computer vision pipelines, or architecting full-stack platforms
            that use AI to solve real problems, I want to be at the center of it.
          </p>
        </div>
      </section>

      {/* Skills */}
      <section className="about-section">
        <div className="section-header">
          <Wrench />
          <h2>Skills & Technologies</h2>
        </div>
        <div className="skill-marquee-container">
          {skillCategories.map((cat) => (
            <div key={cat.title} className="skill-marquee-row">
              <h3 className="skill-marquee-title">
                <cat.icon size={18} />
                {cat.title}
              </h3>
              <div className="skill-marquee">
                <div className="skill-marquee-track">
                  {cat.skills.map((skill, i) => (
                    <div key={i} className="skill-marquee-item">
                      {skill.logo ? (
                        <img
                          src={skill.logo}
                          alt=""
                          className={`skill-logo${skill.invert ? ' skill-logo-invert' : ''}`}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="skill-logo-text">{skill.name.charAt(0)}</span>
                      )}
                      <span className="skill-name">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resume */}
      <section className="about-section">
        <div className="section-header">
          <FileText />
          <h2>Resume</h2>
        </div>
        <div className="about-resume-embed">
          <iframe
            src="/assets/resume.pdf"
            title="Resume"
            className="resume-viewer"
          />
          <a
            href="/assets/resume.pdf"
            download
            className="btn-primary resume-download-btn"
          >
            <Download size={16} />
            Download Resume
          </a>
        </div>
      </section>

      {/* Connect */}
      <section className="about-section">
        <div className="section-header">
          <Mail />
          <h2>Connect</h2>
        </div>
        <div className="about-connect-links">
          <a href={`https://${CONFIG.github}`} target="_blank" rel="noopener noreferrer" className="cta-secondary">
            <Github size={16} />
            GitHub
          </a>
          <a href={`https://${CONFIG.linkedin}`} target="_blank" rel="noopener noreferrer" className="cta-secondary">
            <Linkedin size={16} />
            LinkedIn
          </a>
          <Link to="/contact" className="cta-secondary">
            <Mail size={16} />
            Contact Me
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

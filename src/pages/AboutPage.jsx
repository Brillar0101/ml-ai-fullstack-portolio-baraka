import React from 'react';
import { Link } from 'react-router-dom';
import {
  User,
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

const skillCategories = [
  {
    title: 'ML / AI',
    icon: Brain,
    skills: ['PyTorch', 'TensorFlow', 'YOLOv8', 'SAM2', 'OpenCV', 'Scikit-learn', 'Hugging Face', 'ONNX']
  },
  {
    title: 'Web Development',
    icon: Globe,
    skills: ['React', 'Next.js', 'Node.js', 'FastAPI', 'PostgreSQL', 'Supabase', 'Tailwind CSS']
  },
  {
    title: 'Embedded Systems',
    icon: Cpu,
    skills: ['MSP432', 'C', 'UART', 'SPI', 'ADC14', 'Timer32', 'Bare-Metal', 'ARM Cortex-M']
  },
  {
    title: 'Tools & Platforms',
    icon: Wrench,
    skills: ['Git', 'Docker', 'Linux', 'Vercel', 'AWS', 'Roboflow', 'Jupyter', 'VS Code']
  }
];

const AboutPage = () => {
  return (
    <div className="about-page container">
      <header className="page-header">
        <p className="eyebrow">About</p>
        <h1 className="page-title">About Me</h1>
      </header>

      {/* Bio */}
      <section className="about-section">
        <div className="about-bio-grid">
          <div className="about-photo-placeholder">
            <User size={64} />
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
        <div className="cards-grid two-col">
          {skillCategories.map((cat) => (
            <div key={cat.title} className="info-card">
              <div className="card-icon">
                <cat.icon />
              </div>
              <h3>{cat.title}</h3>
              <div className="about-skill-tags">
                {cat.skills.map((skill) => (
                  <span key={skill} className="tag">{skill}</span>
                ))}
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

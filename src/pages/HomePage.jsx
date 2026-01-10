import React from 'react';
import { Brain, ArrowRight, Mail, Code2, Cpu, Camera, Globe, Database, Github, Linkedin, MapPin, Play } from 'lucide-react';
import { CONFIG } from '../config';
import './HomePage.css';

const SKILLS = [
  { name: "Python", icon: Code2 },
  { name: "TensorFlow", icon: Brain },
  { name: "PyTorch", icon: Cpu },
  { name: "Computer Vision", icon: Camera },
  { name: "React", icon: Globe },
  { name: "Node.js", icon: Database }
];

const HomePage = ({ setCurrentPage }) => {
  return (
    <div className="hero-wrapper">
      {/* Video Background Placeholder - Replace src with your video */}
      <div className="video-background">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="background-video"
          poster="/assets/images/home/video-poster.jpg"
        >
          {/* Add your video source here */}
          {/* <source src="/assets/videos/your-video.mp4" type="video/mp4" /> */}
        </video>
        <div className="video-overlay"></div>
      </div>

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
              Computer Engineering Senior at Virginia Tech (May 2027). Passionate about building intelligent systems that solve real-world problems through machine learning and artificial intelligence.
            </p>

            <div className="hero-location">
              <MapPin />
              <span>{CONFIG.location}</span>
            </div>

            <div className="skills-inline">
              {SKILLS.map((skill, index) => (
                <div key={index} className="skill-tag">
                  <skill.icon />
                  {skill.name}
                </div>
              ))}
            </div>

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

            <div className="social-links">
              <a href={`https://${CONFIG.github}`} target="_blank" rel="noopener noreferrer" className="social-link">
                <Github />
              </a>
              <a href={`https://${CONFIG.linkedin}`} target="_blank" rel="noopener noreferrer" className="social-link">
                <Linkedin />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;

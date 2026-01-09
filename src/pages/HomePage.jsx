import React from 'react';
import { Brain, ArrowRight, Mail, Code2, Cpu, Camera, Globe, Database, Github, Linkedin, MapPin } from 'lucide-react';
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
        <div className="hero-visual">
          <div className="hero-image-container">
            <img 
              src="/assets/images/home/baraka_pier39.jpg" 
              alt="Baraka - ML/AI Engineer"
              className="hero-headshot"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

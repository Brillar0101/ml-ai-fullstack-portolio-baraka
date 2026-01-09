import React from 'react';
import { AtSign, Phone, MapPin, Github, Linkedin, Send } from 'lucide-react';
import { CONFIG } from '../config';
import './ContactPage.css';

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
            <a 
              className="social-link" 
              href={`https://${CONFIG.github}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Github />
            </a>
            <a 
              className="social-link" 
              href={`https://${CONFIG.linkedin}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Linkedin />
            </a>
          </div>
        </div>
        
        <div className="glass-card contact-form">
          <h3>Send a Message</h3>
          
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" placeholder="First and Last Name" />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input type="text" className="form-input" placeholder="Project Inquiry" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea 
              className="form-input form-textarea" 
              placeholder="Tell me about your project..."
            ></textarea>
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

export default ContactPage;

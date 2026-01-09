import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { AtSign, Phone, MapPin, Github, Linkedin, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { CONFIG } from '../config';
import './ContactPage.css';

const ContactPage = () => {
  const formRef = useRef();
  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.from_name || !formData.from_email || !formData.message) {
      setStatus({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await emailjs.sendForm(
        CONFIG.emailjs.serviceId,
        CONFIG.emailjs.templateId,
        formRef.current,
        CONFIG.emailjs.publicKey
      );

      setStatus({ type: 'success', message: 'Message sent successfully! I\'ll get back to you soon.' });
      setFormData({ from_name: '', from_email: '', subject: '', message: '' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to send message. Please try again or email me directly.' });
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <form ref={formRef} onSubmit={handleSubmit} className="glass-card contact-form">
          <h3>Send a Message</h3>

          {status.message && (
            <div className={`form-status ${status.type}`}>
              {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {status.message}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="from_name"
              className="form-input"
              placeholder="First and Last Name"
              value={formData.from_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="from_email"
              className="form-input"
              placeholder="your@email.com"
              value={formData.from_email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              name="subject"
              className="form-input"
              placeholder="Project Inquiry"
              value={formData.subject}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message *</label>
            <textarea
              name="message"
              className="form-input form-textarea"
              placeholder="Tell me about your project..."
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                Sending...
                <Loader className="spin" />
              </>
            ) : (
              <>
                Send Message
                <Send />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;

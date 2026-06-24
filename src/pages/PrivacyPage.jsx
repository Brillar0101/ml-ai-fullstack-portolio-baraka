import React, { useEffect } from 'react';
import { CONFIG } from '../config';
import './PrivacyPage.css';

const LAST_UPDATED = 'June 2026';

const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container privacy-page">
      <header className="page-header">
        <p className="eyebrow">Legal</p>
        <h1 className="page-title">Privacy</h1>
        <p className="page-subtitle">
          How this site handles the small amount of data it collects. Last updated {LAST_UPDATED}.
        </p>
      </header>

      <section className="privacy-section">
        <h2>The short version</h2>
        <p>
          This is a personal portfolio. It does not sell your data, run advertising,
          or share your information with third parties for marketing. The only data
          collected is what you actively submit through the contact form and basic,
          anonymous usage analytics.
        </p>
      </section>

      <section className="privacy-section">
        <h2>Contact form</h2>
        <p>
          When you send a message, the name, email address, and message you enter are
          delivered to my inbox using a third-party email delivery service (EmailJS).
          This information is used solely to read and reply to your message. It is not
          added to a mailing list.
        </p>
      </section>

      <section className="privacy-section">
        <h2>Analytics</h2>
        <p>
          The site records anonymous usage events (such as which pages are viewed) to
          understand what content is useful. These events are not tied to your identity
          and are stored in a private database. No advertising or cross-site tracking
          cookies are used.
        </p>
      </section>

      <section className="privacy-section">
        <h2>Embedded video</h2>
        <p>
          The home page embeds a background video from YouTube using its privacy-enhanced
          (&ldquo;no-cookie&rdquo;) domain, which avoids setting tracking cookies unless
          you interact with the video.
        </p>
      </section>

      <section className="privacy-section">
        <h2>Your choices</h2>
        <p>
          If you have submitted a message and would like it deleted, or have any question
          about data on this site, email{' '}
          <a href={`mailto:${CONFIG.email}`}>{CONFIG.email}</a> and I will take care of it.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPage;

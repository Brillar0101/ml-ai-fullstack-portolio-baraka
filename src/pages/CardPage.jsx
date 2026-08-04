import React, { useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import {
  Download, Github, Linkedin, Mail, Phone, ArrowRight, Cpu,
  UserPlus, Nfc, CheckCircle, AlertCircle, Loader
} from 'lucide-react';
import { CONFIG } from '../config';
import './CardPage.css';

// Landing page for NeuralCard (the PCB business card): NFC tap and QR scan
// both arrive here. Primary action is saving the vCard; /public/card.vcf must
// be kept in sync with CONFIG when contact details change.
//
// Two-way exchange: the lead form emails their details back via the same
// EmailJS template the contact page uses. On Android Chrome, Web NFC can
// additionally write their vCard INTO the card's ST25DV tag (the ESP32 reads
// it over I2C later) -- no server involved. iOS has no Web NFC, so iPhone
// users only see the email form.
const telHref = `tel:${CONFIG.phone.replace(/[^+\d]/g, '')}`;

const buildVcard = ({ name, email, phone }) => [
  'BEGIN:VCARD',
  'VERSION:3.0',
  `FN:${name}`,
  email ? `EMAIL;TYPE=INTERNET:${email}` : null,
  phone ? `TEL;TYPE=CELL:${phone}` : null,
  'END:VCARD'
].filter(Boolean).join('\r\n');

const CardPage = () => {
  const [params] = useSearchParams();
  const drew = params.get('drew');
  const viaNfc = params.get('src') === 'nfc';

  const formRef = useRef(null);
  const [showExchange, setShowExchange] = useState(false);
  const [lead, setLead] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState(null);         // { type, message } | null
  const [nfcStatus, setNfcStatus] = useState(null);   // same shape, for Web NFC
  const canWebNfc = typeof window !== 'undefined' && 'NDEFReader' in window;

  const onLeadChange = (e) =>
    setLead((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const sendLead = async (e) => {
    e.preventDefault();
    if (!lead.name.trim() || !lead.email.trim()) {
      setStatus({ type: 'error', message: 'Name and email are required.' });
      return;
    }
    setStatus({ type: 'sending', message: 'Sending…' });
    try {
      // Reuses the contact-page template: subject/message carry the lead.
      await emailjs.send(
        CONFIG.emailjs.serviceId,
        CONFIG.emailjs.templateId,
        {
          from_name: lead.name,
          from_email: lead.email,
          subject: 'NeuralCard lead — contact exchange',
          message: `Phone: ${lead.phone || '(not given)'}\nVia: ${viaNfc ? 'NFC tap' : 'QR scan'}`
        },
        CONFIG.emailjs.publicKey
      );
      setStatus({ type: 'success', message: "Got it — I have your details. I'll reach out." });
      setLead({ name: '', email: '', phone: '' });
    } catch (error) {
      // Surface the EmailJS reason (e.g. an expired provider grant) instead of
      // a blind failure -- a 412 here once hid "reconnect your Outlook account".
      const detail = error?.text ? ` (${error.text})` : '';
      setStatus({ type: 'error', message: `Could not send${detail}. Email me instead: ${CONFIG.email}` });
    }
  };

  // Android Chrome only. Writes the visitor's vCard into the card's NFC tag;
  // requires them to hold the card to their phone while this runs.
  const writeToCard = async () => {
    if (!lead.name.trim()) {
      setNfcStatus({ type: 'error', message: 'Fill in your name first.' });
      return;
    }
    setNfcStatus({ type: 'sending', message: 'Hold the card to the back of your phone…' });
    try {
      const ndef = new window.NDEFReader();
      await ndef.write({
        records: [{
          recordType: 'mime',
          mediaType: 'text/vcard',
          data: new TextEncoder().encode(buildVcard(lead))
        }]
      });
      setNfcStatus({ type: 'success', message: 'Written to the card itself. No cloud involved.' });
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === 'AbortError';
      setNfcStatus({
        type: 'error',
        message: aborted ? 'Tap cancelled.' : 'Write failed — use the send button instead.'
      });
    }
  };

  const StatusLine = ({ s }) => s && (
    <p className={`card-status card-status-${s.type}`} role="status">
      {s.type === 'success' && <CheckCircle size={14} aria-hidden="true" />}
      {s.type === 'error' && <AlertCircle size={14} aria-hidden="true" />}
      {s.type === 'sending' && <Loader size={14} className="card-spin" aria-hidden="true" />}
      {s.message}
    </p>
  );

  return (
    <div className="card-page">
      <div className="card-panel">
        {drew !== null && (
          <p className="card-drew">
            The card saw you draw a <strong>{drew}</strong>.
          </p>
        )}

        <div className="card-avatar" aria-hidden="true">BL</div>

        <h1>Barakaeli Lawuo</h1>
        <p className="card-title">{CONFIG.title} · {CONFIG.tagline}</p>
        <p className="card-context">
          <Cpu size={14} aria-hidden="true" />
          {viaNfc
            ? 'You tapped NeuralCard — a neural network you can hold.'
            : 'You scanned NeuralCard — a neural network you can hold.'}
        </p>

        {/* No `download` attribute: forcing a download makes iOS Safari show the
            "Do you want to download card.vcf?" prompt and drop the file in
            Files. A plain navigation to a text/vcard response opens the native
            contact preview sheet instead (Create New Contact / Add to Existing)
            -- the same flow dot.cards and Popl use. iOS offers no way to write
            to Contacts from the web beyond this sheet. */}
        <a className="card-save" href="/card.vcf">
          <Download size={18} aria-hidden="true" />
          Save my contact
        </a>

        <div className="card-links">
          <a href={`https://${CONFIG.github}`} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Github size={20} />
          </a>
          <a href={`https://${CONFIG.linkedin}`} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Linkedin size={20} />
          </a>
          <a href={`mailto:${CONFIG.email}`} aria-label="Email">
            <Mail size={20} />
          </a>
          <a href={telHref} aria-label="Call">
            <Phone size={20} />
          </a>
        </div>

        {!showExchange ? (
          <button className="card-exchange-toggle" type="button" onClick={() => setShowExchange(true)}>
            <UserPlus size={16} aria-hidden="true" />
            Share your contact back
          </button>
        ) : (
          <form ref={formRef} className="card-exchange" onSubmit={sendLead}>
            <input
              name="name" type="text" placeholder="Your name" autoComplete="name"
              value={lead.name} onChange={onLeadChange} required
            />
            <input
              name="email" type="email" placeholder="Your email" autoComplete="email"
              value={lead.email} onChange={onLeadChange} required
            />
            <input
              name="phone" type="tel" placeholder="Your phone (optional)" autoComplete="tel"
              value={lead.phone} onChange={onLeadChange}
            />
            <div className="card-exchange-actions">
              <button type="submit" disabled={status?.type === 'sending'}>
                Send to Barakaeli
              </button>
              {canWebNfc && (
                <button type="button" onClick={writeToCard} disabled={nfcStatus?.type === 'sending'}>
                  <Nfc size={16} aria-hidden="true" />
                  Write onto the card
                </button>
              )}
            </div>
            <StatusLine s={status} />
            {canWebNfc && <StatusLine s={nfcStatus} />}
          </form>
        )}

        <Link className="card-portfolio" to="/">
          Explore the portfolio
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};

export default CardPage;

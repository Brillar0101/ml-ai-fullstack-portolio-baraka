import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, Github, Linkedin, Mail, ArrowRight, Cpu } from 'lucide-react';
import { CONFIG } from '../config';
import './CardPage.css';

// Landing page for NeuralCard (the PCB business card): NFC tap and QR scan
// both arrive here. Primary action is saving the vCard; /public/card.vcf must
// be kept in sync with CONFIG when contact details change.
const CardPage = () => {
  const [params] = useSearchParams();
  const drew = params.get('drew');
  const viaNfc = params.get('src') === 'nfc';

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

        <a className="card-save" href="/card.vcf" download="Barakaeli-Lawuo.vcf">
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
        </div>

        <Link className="card-portfolio" to="/">
          Explore the portfolio
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};

export default CardPage;

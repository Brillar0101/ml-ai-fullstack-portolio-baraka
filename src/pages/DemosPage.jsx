import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { DEMOS } from '../data/demos';
import { publishedItems } from '../lib/publishing';
import './DemosPage.css';

export default function DemosPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const live = publishedItems(DEMOS);

  return (
    <div className="demos-page">
      <div className="demos-hero">
        <div className="demos-hero-bg" />
        <div className="demos-hero-content">
          <p className="demos-hero-eyebrow">Interactive labs</p>
          <h1 className="demos-hero-title">AI Engineering, by doing</h1>
          <p className="demos-hero-desc">
            A hands-on series on building with foundation models. Every demo runs in your browser,
            no setup and no IDE. Move the sliders, edit the code, press run. The goal is simple:
            finish a lab and walk away understanding the idea as well as you would from a deep read.
          </p>
        </div>
      </div>

      <div className="container">
        {live.length === 0 ? (
          <div className="demos-empty">
            <p className="demos-empty-title">Labs are on the way</p>
            <p className="demos-empty-desc">The series publishes one lab at a time. Check back soon.</p>
          </div>
        ) : (
          <div className="demos-grid">
            {live.map((demo) => (
              <Link to={demo.route} className="demo-card" key={demo.id}>
                <div className="demo-card-body">
                  <div className="demo-card-top">
                    <span className="demo-card-chapter">{demo.chapter}</span>
                    {demo.runnable && (
                      <span className="demo-card-run"><Play size={11} /> runnable</span>
                    )}
                  </div>
                  <h2 className="demo-card-title">{demo.title}</h2>
                  <p className="demo-card-desc">{demo.excerpt}</p>
                  <div className="demo-card-tags">
                    {demo.tags.map((t, i) => <span className="demo-card-tag" key={i}>{t}</span>)}
                  </div>
                  <div className="demo-card-link">Open lab <ArrowRight size={16} /></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

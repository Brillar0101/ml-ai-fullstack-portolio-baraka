import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Server,
  Database,
  Shield,
  Layers,
  CreditCard,
  Cloud,
  Settings,
  ArrowRight,
  Workflow,
  Users,
  Lock,
  Zap
} from 'lucide-react';
import './DiagramStyles.css';

const SystemArchitectureDiagram = () => {
  const [hoveredTier, setHoveredTier] = useState(null);

  const tiers = [
    {
      id: 'client',
      label: 'LAYER 1',
      name: 'Client',
      color: '#0A84FF',
      components: [
        {
          id: 'mobile',
          name: 'Mobile App',
          icon: Smartphone,
          tech: 'React Native + Expo',
          features: ['TypeScript', 'Zustand (State)', 'React Query', 'React Navigation'],
          stat: '74+ Screens'
        },
        {
          id: 'admin',
          name: 'Admin Dashboard',
          icon: Monitor,
          tech: 'React 19 + TypeScript',
          features: ['React Router 7', 'Recharts', 'TailwindCSS'],
          stat: 'Full CRUD Management'
        }
      ],
      extras: {
        title: 'Target Users',
        items: ['Photographers', 'Videographers', 'Content Creators', 'Production Companies', 'Students']
      }
    },
    {
      id: 'gateway',
      label: 'LAYER 2',
      name: 'API Gateway',
      color: '#00D4AA',
      components: [
        {
          id: 'express',
          name: 'Express Server',
          icon: Server,
          tech: 'Node.js + Express',
          features: ['Port: 5000', 'Helmet.js (Security)', 'CORS Enabled', 'JSON Parser'],
          stat: '65+ API Endpoints'
        },
        {
          id: 'middleware',
          name: 'Middleware',
          icon: Shield,
          tech: 'Authentication Layer',
          features: ['JWT Verification', 'Role-based Access', 'Multer (File Upload)', 'Rate Limiting'],
          stat: null
        }
      ],
      extras: {
        title: 'API Routes',
        items: ['/api/auth (7)', '/api/equipment (10)', '/api/bookings (12)', '/api/payment (3)', '/api/promo (12)', '/api/reviews (4)']
      }
    },
    {
      id: 'business',
      label: 'LAYER 3',
      name: 'Business Logic',
      color: '#6366F1',
      components: [
        {
          id: 'services',
          name: 'Services',
          icon: Settings,
          tech: 'Service Layer',
          features: ['PaymentService (Stripe)', 'S3Service (Images)', 'PricingEngine'],
          stat: 'Core Business Rules'
        },
        {
          id: 'models',
          name: 'Models (DAL)',
          icon: Layers,
          tech: 'Data Access Layer',
          features: ['UserModel', 'EquipmentModel', 'BookingModel', 'ReviewModel'],
          stat: 'O(log n) Availability'
        }
      ],
      extras: {
        title: 'Controllers',
        items: ['auth.controller', 'equipment.controller', 'booking.controller', 'payment.controller', 'promo.controller', 'review.controller', 'category.controller', 'analytics.controller']
      }
    },
    {
      id: 'data',
      label: 'LAYER 4',
      name: 'Data & External',
      color: '#A855F7',
      components: [
        {
          id: 'postgres',
          name: 'PostgreSQL',
          icon: Database,
          tech: '10 Tables • UUID PKs',
          features: ['users, equipment, bookings', 'reviews, promo_codes', 'user_credits, transactions'],
          stat: '20 connections pool'
        }
      ],
      external: [
        { name: 'Stripe', items: ['Payment Intents', 'Refunds', 'Webhooks', 'Apple Pay'] },
        { name: 'AWS S3', items: ['Equipment Images', 'Profile Pictures', 'Auto Cleanup'] }
      ],
      extras: {
        title: 'Key Features',
        items: ['Dynamic Pricing', 'User Credits', 'Promo Codes', 'Search Analytics', 'Reviews System']
      }
    }
  ];

  const TierComponent = ({ component, color }) => {
    const Icon = component.icon;

    return (
      <div className="arch-component" style={{ '--tier-color': color }}>
        <div className="arch-component-header">
          <Icon size={18} />
          <span className="arch-component-name">{component.name}</span>
        </div>
        <div className="arch-component-body">
          <div className="arch-component-tech">{component.tech}</div>
          <div className="arch-component-features">
            {component.features.map((feature, idx) => (
              <span key={idx} className="arch-feature">{feature}</span>
            ))}
          </div>
          {component.stat && (
            <div className="arch-component-stat">{component.stat}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="arch-diagram-container">
      <div className="arch-diagram-header">
        <div className="arch-diagram-title">
          <Workflow size={24} />
          <h3>System Architecture</h3>
        </div>
        <div className="arch-diagram-subtitle">
          4-Tier Architecture • React Native + Node.js + PostgreSQL
        </div>
      </div>

      <div className="arch-tiers-grid">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className="arch-tier"
            style={{ '--tier-color': tier.color }}
            onMouseEnter={() => setHoveredTier(tier.id)}
            onMouseLeave={() => setHoveredTier(null)}
          >
            <div className="arch-tier-header">
              <div className="arch-tier-label">{tier.label}</div>
              <div className="arch-tier-name">{tier.name}</div>
            </div>

            {tier.components.map((component) => (
              <TierComponent key={component.id} component={component} color={tier.color} />
            ))}

            {tier.external && (
              <div className="arch-external-grid">
                {tier.external.map((ext, idx) => (
                  <div key={idx} className="arch-external-card" style={{ '--tier-color': tier.color }}>
                    <div className="arch-external-header">{ext.name}</div>
                    <div className="arch-external-body">
                      {ext.items.map((item, i) => (
                        <div key={i} className="arch-external-item">{item}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tier.extras && (
              <div className="arch-mini-component">
                <div className="arch-mini-header">{tier.extras.title}</div>
                <div className="arch-mini-list">
                  {tier.extras.items.map((item, idx) => (
                    <div key={idx} className="arch-mini-item">• {item}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="arch-flow-container">
        <div className="arch-flow-title">Request Flow</div>
        <div className="arch-flow-diagram">
          <div className="arch-flow-step">
            <div className="arch-flow-node" style={{ '--node-color': '#0A84FF' }}>
              <Smartphone size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Client
            </div>
            <div className="arch-flow-arrow">
              <ArrowRight size={16} />
              <span className="arch-flow-label">REST</span>
            </div>
          </div>
          <div className="arch-flow-step">
            <div className="arch-flow-node" style={{ '--node-color': '#00D4AA' }}>
              <Lock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              API Gateway
            </div>
            <div className="arch-flow-arrow">
              <ArrowRight size={16} />
              <span className="arch-flow-label">JWT Auth</span>
            </div>
          </div>
          <div className="arch-flow-step">
            <div className="arch-flow-node" style={{ '--node-color': '#6366F1' }}>
              <Zap size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Business Logic
            </div>
            <div className="arch-flow-arrow">
              <ArrowRight size={16} />
              <span className="arch-flow-label">SQL</span>
            </div>
          </div>
          <div className="arch-flow-step">
            <div className="arch-flow-node" style={{ '--node-color': '#A855F7' }}>
              <Database size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Data Layer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemArchitectureDiagram;

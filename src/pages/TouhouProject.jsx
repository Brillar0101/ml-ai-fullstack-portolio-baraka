import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Github,
  ExternalLink,
  AlertCircle,
  ArrowRight,
  Cpu,
  Layers,
  Target,
  Zap,
  Workflow,
  Mail,
  Monitor,
  Timer,
  Gamepad2,
  Shield,
  Lightbulb,
  Settings,
  ToggleLeft,
  CircuitBoard,
  Crosshair,
  Heart,
  X,
  Play
} from 'lucide-react';
import './TouhouProject.css';

/* ============================================
   Architecture Pipeline Diagram
   4-Layer: Application → HAL → TI DriverLib → Hardware
   ============================================ */
const ArchPipelineDiagram = () => {
  const [hovered, setHovered] = useState(null);

  const layers = [
    {
      id: 'app',
      label: 'LAYER 3',
      name: 'Application',
      color: '#0068FF',
      icon: Crosshair,
      details: ['Game FSM (6 states)', 'Bullet Pool Manager', 'Collision Detection', 'Score System', 'Power-Up Logic'],
      output: 'Game Experience'
    },
    {
      id: 'hal',
      label: 'LAYER 2',
      name: 'HAL',
      color: '#14B8A6',
      icon: Layers,
      details: ['Joystick (ADC14)', 'Button Debounce', 'UART Comms', 'LCD Graphics', 'Software Timers'],
      output: 'Hardware API'
    },
    {
      id: 'driver',
      label: 'LAYER 1',
      name: 'TI DriverLib',
      color: '#8B5CF6',
      icon: Cpu,
      details: ['GPIO Registers', 'ADC14 Multi-Seq', 'eUSCI (SPI/UART)', 'Timer32', 'Interrupt Controller'],
      output: 'Register Access'
    },
    {
      id: 'hw',
      label: 'HARDWARE',
      name: 'MSP432 + BoosterPack',
      color: '#F59E0B',
      icon: CircuitBoard,
      details: ['ARM Cortex-M4F @ 48MHz', '128x128 ST7735 LCD', 'Analog Joystick', '5 Buttons', 'UART Debug Port'],
      output: 'Physical I/O'
    }
  ];

  return (
    <div className="ml-pipeline-container">
      <div className="ml-pipeline-header">
        <div className="ml-pipeline-title">
          <Layers size={24} />
          <h3>System Architecture</h3>
        </div>
        <div className="ml-pipeline-subtitle">
          3-Layer Design • Joystick + ADC • Non-Blocking Game Loop
        </div>
      </div>
      <div className="ml-pipeline-flow">
        {layers.map((layer, i) => (
          <React.Fragment key={layer.id}>
            <div
              className={`ml-stage-card ${hovered === layer.id ? 'hovered' : ''}`}
              style={{ '--stage-color': layer.color }}
              onMouseEnter={() => setHovered(layer.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="ml-stage-header">
                <span className="ml-stage-label">{layer.label}</span>
                <div className="ml-stage-icon" style={{ background: layer.color }}>
                  <layer.icon size={20} />
                </div>
              </div>
              <div className="ml-stage-name">{layer.name}</div>
              <div className="ml-stage-details">
                {layer.details.map((d, j) => (
                  <div key={j} className="ml-stage-detail">
                    <span className="ml-detail-dot" style={{ background: layer.color }} />
                    {d}
                  </div>
                ))}
              </div>
              <div className="ml-stage-output">
                <ArrowRight size={14} />
                <span>{layer.output}</span>
              </div>
            </div>
            {i < layers.length - 1 && (
              <div className="ml-flow-connector">
                <ArrowRight size={20} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="ml-models-summary">
        <div className="ml-summary-title">HAL Modules</div>
        <div className="ml-summary-items">
          <div className="ml-summary-item" style={{ '--item-color': '#0068FF' }}>
            <span className="ml-summary-name">Joystick</span>
            <span className="ml-summary-task">ADC14 12-bit</span>
          </div>
          <div className="ml-summary-item" style={{ '--item-color': '#14B8A6' }}>
            <span className="ml-summary-name">Button</span>
            <span className="ml-summary-task">5 Debounced</span>
          </div>
          <div className="ml-summary-item" style={{ '--item-color': '#8B5CF6' }}>
            <span className="ml-summary-name">UART</span>
            <span className="ml-summary-task">9600 Baud</span>
          </div>
          <div className="ml-summary-item" style={{ '--item-color': '#EC4899' }}>
            <span className="ml-summary-name">LCD</span>
            <span className="ml-summary-task">128x128 SPI</span>
          </div>
          <div className="ml-summary-item" style={{ '--item-color': '#F59E0B' }}>
            <span className="ml-summary-name">Timer</span>
            <span className="ml-summary-task">48 MHz HW</span>
          </div>
          <div className="ml-summary-item" style={{ '--item-color': '#22C55E' }}>
            <span className="ml-summary-name">LED</span>
            <span className="ml-summary-task">7 RGB LEDs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================
   FSM Pipeline Diagram
   6 States: Title → Menu → Instructions/High Scores → Game → Game Over
   ============================================ */
const FSMPipelineDiagram = () => {
  const [hovered, setHovered] = useState(null);

  const states = [
    {
      id: 'title',
      label: 'BOOT',
      name: 'Title Screen',
      color: '#8B5CF6',
      icon: Play,
      details: ['3-second auto-advance', 'Game logo display'],
      output: 'Auto Transition'
    },
    {
      id: 'menu',
      label: 'START',
      name: 'Main Menu',
      color: '#0068FF',
      icon: Gamepad2,
      details: ['Play / Instructions / Scores', 'S1/S2 navigate', 'JS button selects'],
      output: 'User Choice'
    },
    {
      id: 'game',
      label: 'ACTIVE',
      name: 'Game Loop',
      color: '#22C55E',
      icon: Crosshair,
      details: ['Joystick movement', 'Bullet spawning', 'Collision checks', 'Pattern rotation', 'Power-up spawns'],
      output: 'HP Check'
    },
    {
      id: 'gameover',
      label: 'END',
      name: 'Game Over',
      color: '#EF4444',
      icon: AlertCircle,
      details: ['Win or Lose result', 'Score = time + HP*10', 'High score check'],
      output: 'Score'
    },
    {
      id: 'highscores',
      label: 'RECORD',
      name: 'High Scores',
      color: '#F59E0B',
      icon: Target,
      details: ['Top 5 scores', 'Insertion sort', 'JS → Menu'],
      output: 'Restart'
    }
  ];

  return (
    <div className="ml-pipeline-container">
      <div className="ml-pipeline-header">
        <div className="ml-pipeline-title">
          <Workflow size={24} />
          <h3>Game State Machine</h3>
        </div>
        <div className="ml-pipeline-subtitle">
          6 States • Button + Joystick Transitions • Non-Blocking
        </div>
      </div>
      <div className="ml-pipeline-flow">
        {states.map((state, i) => (
          <React.Fragment key={state.id}>
            <div
              className={`ml-stage-card ${hovered === state.id ? 'hovered' : ''}`}
              style={{ '--stage-color': state.color }}
              onMouseEnter={() => setHovered(state.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="ml-stage-header">
                <span className="ml-stage-label">{state.label}</span>
                <div className="ml-stage-icon" style={{ background: state.color }}>
                  <state.icon size={20} />
                </div>
              </div>
              <div className="ml-stage-name">{state.name}</div>
              <div className="ml-stage-details">
                {state.details.map((d, j) => (
                  <div key={j} className="ml-stage-detail">
                    <span className="ml-detail-dot" style={{ background: state.color }} />
                    {d}
                  </div>
                ))}
              </div>
              <div className="ml-stage-output">
                <ArrowRight size={14} />
                <span>{state.output}</span>
              </div>
            </div>
            {i < states.length - 1 && (
              <div className="ml-flow-connector">
                <ArrowRight size={20} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="ml-performance-bar">
        <div className="ml-perf-item">
          <Gamepad2 size={16} />
          <span>Joystick</span>
          <span className="ml-perf-label">Player Movement</span>
        </div>
        <div className="ml-perf-item">
          <ToggleLeft size={16} />
          <span>S1 / S2 / JS</span>
          <span className="ml-perf-label">Menu + Fire</span>
        </div>
        <div className="ml-perf-item">
          <Monitor size={16} />
          <span>128x128</span>
          <span className="ml-perf-label">LCD Display</span>
        </div>
      </div>
    </div>
  );
};

/* ============================================
   Screenshots — selected images with captions
   ============================================ */
const screenshots = [
  {
    src: '/assets/images/touhou/startup.png',
    alt: 'Title screen startup animation',
    caption: 'Title screen with 3-second auto-advance to the main menu'
  },
  {
    src: '/assets/images/touhou/menu.png',
    alt: 'Main menu screen',
    caption: 'Main menu with S1/S2 navigation and joystick selection'
  },
  {
    src: '/assets/images/touhou/gameplay-basic.png',
    alt: 'Player and enemy ships with health displays',
    caption: 'Player ship (bottom) faces the enemy (top) with health counters tracking damage'
  },
  {
    src: '/assets/images/touhou/bullet-patterns.png',
    alt: 'Enemy bullet-hell patterns',
    caption: 'Bullet-hell in action as the enemy fires colored projectile patterns toward the player'
  },
  {
    src: '/assets/images/touhou/gameplay-advanced.png',
    alt: 'Full gameplay with health bars, timer, and multi-colored bullets',
    caption: 'Evolved combat with health bars, survival timer, multi-pattern bullets, and power-up system'
  },
  {
    src: '/assets/images/touhou/game-over.png',
    alt: 'Game over screen with score',
    caption: 'Game over screen showing final score from survival time and remaining health'
  }
];

/* ============================================
   Bullet Patterns Data
   ============================================ */
const bulletPatterns = [
  { name: 'Vertical Rain', desc: 'Straight down from enemy', color: '#EF4444' },
  { name: 'Horizontal Sweep', desc: 'Crosses from left edge', color: '#EAB308' },
  { name: 'Diagonal (L→R)', desc: 'Top-left to bottom-right', color: '#F97316' },
  { name: 'Diagonal (R→L)', desc: 'Top-right to bottom-left', color: '#EC4899' },
  { name: 'Dual Convergence', desc: 'Both sides closing in', color: '#A855F7' },
  { name: 'Random Drop', desc: 'Random vertical positions', color: '#22C55E' }
];

const TouhouProject = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState('');
  const [lightboxAlt, setLightboxAlt] = useState('');

  const videoId = null;

  const openLightbox = (src, alt) => {
    setLightboxSrc(src);
    setLightboxAlt(alt);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && lightboxOpen) closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen]);

  return (
    <div className="project-page">
      {/* Navigation */}
      <Link to="/projects" className="back-btn">
        <ChevronLeft />
        Back to Projects
      </Link>

      {/* Project Header */}
      <header className="project-header">
        <div className="header-content">
          <div className="project-icon-large">
            <Crosshair />
          </div>
          <div className="header-text">
            <div className="project-context">
              <Cpu />
              <span>Embedded Systems</span>
            </div>
            <h1>Touhou</h1>
            <p className="project-tagline">
              A bullet-hell shooter on the MSP432 LaunchPad featuring 6 enemy firing patterns,
              joystick-controlled movement, power-up system, and custom sprite rendering on a 128x128 LCD,
              all running bare-metal with no operating system.
            </p>
            <div className="project-tags">
              <span className="tag">MSP432</span>
              <span className="tag">C</span>
              <span className="tag">ADC14</span>
              <span className="tag">SPI</span>
              <span className="tag">LCD</span>
              <span className="tag">Timer32</span>
              <span className="tag">Bare-Metal</span>
            </div>
            <div className="header-ctas">
              <a href="https://github.com/Brillar0101" target="_blank" rel="noopener noreferrer" className="cta-secondary">
                <Github />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Video Hero */}
      <section className="project-section">
        <div className="touhou-video-hero">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
              title="Touhou Gameplay Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="touhou-video-placeholder">
              <Play />
              <span>Gameplay video coming soon</span>
            </div>
          )}
        </div>
      </section>

      {/* The Challenge */}
      <section className="project-section">
        <div className="section-header">
          <AlertCircle />
          <h2>The Challenge</h2>
        </div>
        <div className="cards-grid">
          <div className="info-card">
            <div className="card-icon"><Crosshair /></div>
            <h3>Bullet-Hell Game</h3>
            <p>Build a Touhou-style shooter with 6 distinct enemy firing patterns, collision detection, and smooth gameplay on a microcontroller</p>
          </div>
          <div className="info-card">
            <div className="card-icon"><Gamepad2 /></div>
            <h3>Joystick Control</h3>
            <p>Read analog joystick via ADC14 with deadzone filtering for precise 2-axis player movement</p>
          </div>
          <div className="info-card highlight">
            <div className="card-icon"><Target /></div>
            <h3>Real-Time Performance</h3>
            <p>Manage 10 concurrent enemy bullets, collision math, sprite rendering, and input polling, all non-blocking</p>
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="project-section">
        <div className="section-header">
          <Monitor />
          <h2>Game Screenshots</h2>
        </div>
        <div className="content-block">
          <p>Captured directly from the 128x128 ST7735 LCD display on the MSP432 LaunchPad.</p>
        </div>
        <div className="screenshot-gallery">
          {screenshots.map((shot, i) => (
            <div
              key={i}
              className="screenshot-card"
              onClick={() => openLightbox(shot.src, shot.alt)}
            >
              <img src={shot.src} alt={shot.alt} loading="lazy" />
              <div className="screenshot-caption">{shot.caption}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Game Mechanics */}
      <section className="project-section">
        <div className="section-header">
          <Crosshair />
          <h2>Game Mechanics</h2>
        </div>
        <div className="content-block">
          <p>A classic bullet-hell shooter where the player dodges enemy projectiles, fires back, and collects power-ups to survive.</p>
        </div>

        <div className="cards-grid two-col">
          <div className="info-card">
            <div className="card-icon"><Shield /></div>
            <h3>Combat System</h3>
            <ul className="bullet-list compact">
              <li><strong>Player HP:</strong> 25, takes 5 damage per enemy bullet hit</li>
              <li><strong>Enemy HP:</strong> 25, takes 5 damage per player bullet hit</li>
              <li><strong>Player fire:</strong> Single cyan bullet, 3 px/frame upward</li>
              <li><strong>Win condition:</strong> Reduce enemy HP to 0</li>
            </ul>
          </div>
          <div className="info-card">
            <div className="card-icon"><Heart /></div>
            <h3>Power-Up System</h3>
            <ul className="bullet-list compact">
              <li><strong>Spawn:</strong> Random position, every 8-12 seconds</li>
              <li><strong>Effect:</strong> +10 HP (capped at 25 max)</li>
              <li><strong>Appearance:</strong> Green circle falling at 1 px/frame</li>
              <li><strong>Collision:</strong> Distance-based with player sprite</li>
            </ul>
          </div>
        </div>

        {/* Bullet Patterns */}
        <div className="content-block">
          <h3 className="subsection-title">Enemy Bullet Patterns</h3>
          <p>The enemy cycles through 6 distinct firing patterns every 5 seconds, each with a unique trajectory and color:</p>
        </div>
        <div className="bullet-pattern-grid">
          {bulletPatterns.map((pattern, i) => (
            <div
              key={i}
              className="bullet-pattern-card"
              style={{ '--pattern-color': pattern.color }}
            >
              <div className="bullet-pattern-name">
                <span className="bullet-pattern-color" style={{ background: pattern.color }} />
                {pattern.name}
              </div>
              <div className="bullet-pattern-desc">{pattern.desc}</div>
            </div>
          ))}
        </div>

        {/* Scoring */}
        <div className="content-block">
          <h3 className="subsection-title">Scoring</h3>
          <p>Your final score rewards both speed and survivability:</p>
        </div>
        <div className="cards-grid">
          <div className="metric-card">
            <div className="metric-value">Time</div>
            <div className="metric-label">Survival seconds</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">HP x 10</div>
            <div className="metric-label">Remaining health</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">Top 5</div>
            <div className="metric-label">High score board</div>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="project-section">
        <div className="section-header">
          <Layers />
          <h2>Architecture</h2>
        </div>
        <div className="content-block">
          <h3 className="subsection-title">Layered Design</h3>
          <p>Clean three-layer architecture with strict separation of concerns. The application layer handles all game logic through the HAL abstraction with no direct register access.</p>
        </div>

        <ArchPipelineDiagram />

        <div className="content-block">
          <h3 className="subsection-title">Finite State Machine</h3>
          <p>The game flows through 6 screen states driven by button presses and joystick input:</p>
        </div>

        <FSMPipelineDiagram />
      </section>

      {/* HAL Design */}
      <section className="project-section">
        <div className="section-header">
          <Settings />
          <h2>Hardware Abstraction Layer</h2>
        </div>
        <div className="content-block">
          <p>The HAL encapsulates all peripheral interactions into modular components. The Touhou project adds joystick (ADC) support on top of the base HAL from Project 1.</p>
        </div>

        <div className="cards-grid two-col">
          <div className="info-card">
            <div className="card-icon"><Gamepad2 /></div>
            <h3>Joystick Module</h3>
            <ul className="bullet-list compact">
              <li>ADC14 12-bit resolution (0-16383 range)</li>
              <li>Deadzone: ±3000 from center (8192)</li>
              <li>Multi-sequence mode for simultaneous X/Y</li>
              <li>Tap detection FSM for button press</li>
            </ul>
          </div>
          <div className="info-card">
            <div className="card-icon"><ToggleLeft /></div>
            <h3>Button Module</h3>
            <ul className="bullet-list compact">
              <li>4-state debounce FSM with 5ms filter</li>
              <li>Edge detection: tap vs. hold</li>
              <li>5 buttons: LaunchPad + BoosterPack + JS</li>
            </ul>
          </div>
          <div className="info-card">
            <div className="card-icon"><Monitor /></div>
            <h3>Graphics Module</h3>
            <ul className="bullet-list compact">
              <li>128x128 ST7735 SPI display</li>
              <li>Custom 8BPP sprite rendering</li>
              <li>Player: 16x16px, Enemy: 16x7px</li>
              <li>Health bar drawing with fill rectangles</li>
            </ul>
          </div>
          <div className="info-card">
            <div className="card-icon"><Timer /></div>
            <h3>Timer Module</h3>
            <ul className="bullet-list compact">
              <li>TIMER32_0 at 48 MHz (20.8ns/tick)</li>
              <li>ISR-based 32-bit rollover tracking</li>
              <li>64-bit cycle arithmetic for long durations</li>
              <li>Multiple concurrent software timers</li>
            </ul>
          </div>
        </div>

      </section>

      {/* Hardware Specs */}
      <section className="project-section">
        <div className="section-header">
          <Zap />
          <h2>Hardware Specs</h2>
        </div>
        <div className="cards-grid four-col">
          <div className="metric-card">
            <div className="metric-icon"><Cpu /></div>
            <div className="metric-value">48 MHz</div>
            <div className="metric-label">ARM Cortex-M4F</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon"><Gamepad2 /></div>
            <div className="metric-value">12-bit</div>
            <div className="metric-label">ADC Joystick</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon"><Monitor /></div>
            <div className="metric-value">128x128</div>
            <div className="metric-label">Color LCD</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon"><Crosshair /></div>
            <div className="metric-value">10</div>
            <div className="metric-label">Max Bullets</div>
          </div>
        </div>
      </section>

      {/* Challenges & Lessons */}
      <section className="project-section">
        <div className="section-header">
          <Lightbulb />
          <h2>Challenges & Lessons Learned</h2>
        </div>
        <div className="cards-grid two-col">
          <div className="info-card">
            <h3>Bullet Pool Management</h3>
            <p>Fixed-size array of 10 bullets with active flags avoids dynamic memory allocation entirely, critical on a system with no heap</p>
          </div>
          <div className="info-card">
            <h3>ADC Joystick Deadzone</h3>
            <p>Without a ±3000 deadzone from center (8192), the joystick drifts constantly due to analog noise, making the game unplayable</p>
          </div>
          <div className="info-card">
            <h3>Pattern Rotation Timing</h3>
            <p>Decoupling pattern switch time (5s) from bullet spawn time (1s) allows overlapping bullets from different patterns, creating the bullet-hell feel</p>
          </div>
          <div className="info-card">
            <h3>Custom Sprite Rendering</h3>
            <p>Player and enemy sprites stored as 8BPP hex arrays in Flash. 256 bytes for the 16x16 player ship, rendered through grlib</p>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="project-section">
        <div className="section-header">
          <Layers />
          <h2>Tech Stack</h2>
        </div>
        <div className="content-block">
          <div className="tech-inline">
            <span className="tech-item">MSP432P401R</span>
            <span className="tech-item">ARM Cortex-M4F</span>
            <span className="tech-item">C</span>
            <span className="tech-item">TI DriverLib</span>
            <span className="tech-item">TI grlib</span>
            <span className="tech-item">Code Composer Studio</span>
            <span className="tech-item">ADC14</span>
            <span className="tech-item">ST7735 LCD</span>
            <span className="tech-item">eUSCI SPI</span>
            <span className="tech-item">Timer32</span>
          </div>

          <h3 className="subsection-title">Hardware Platform</h3>
          <div className="tech-inline">
            <span className="tech-item">MSP-EXP432P401R LaunchPad</span>
            <span className="tech-item">Educational BoosterPack MKII</span>
            <span className="tech-item">Crystalfontz 128x128 LCD</span>
            <span className="tech-item">Analog Joystick (ADC)</span>
            <span className="tech-item">XDS110 Debug Probe</span>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="project-section">
        <div className="section-header">
          <ExternalLink />
          <h2>Links</h2>
        </div>
        <div className="content-block">
          <div className="links-inline">
            <a href="https://github.com/Brillar0101" target="_blank" rel="noopener noreferrer" className="inline-link">
              <Github /> GitHub Profile
            </a>
          </div>
        </div>

        <div className="contact-section">
          <h3>Interested in this project?</h3>
          <p>I'm open to discussing embedded systems, game development on microcontrollers, or technical details.</p>
          <Link to="/contact" className="cta-primary">
            <Mail />
            Get in Touch
          </Link>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="touhou-lightbox" onClick={closeLightbox}>
          <button className="touhou-lightbox-close" onClick={closeLightbox}>
            <X size={24} />
          </button>
          <img
            src={lightboxSrc}
            alt={lightboxAlt}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default TouhouProject;

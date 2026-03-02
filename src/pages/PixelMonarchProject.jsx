import React, { useState } from 'react';
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
  Code2,
  Mail,
  Monitor,
  Radio,
  Timer,
  Gamepad2,
  Crown,
  Shield,
  Lightbulb,
  Box,
  Settings,
  ToggleLeft,
  CircuitBoard
} from 'lucide-react';
import './PixelMonarchProject.css';

/* ============================================
   Architecture Pipeline Diagram
   Same card style as SwishVision ML Pipeline
   ============================================ */
const ArchPipelineDiagram = () => {
  const [hovered, setHovered] = useState(null);

  const layers = [
    {
      id: 'app',
      label: 'LAYER 3',
      name: 'Application',
      color: '#0068FF',
      icon: Crown,
      details: ['Game FSM', 'Event Handler', 'Display Logic', 'Score Tracking'],
      output: 'User Experience'
    },
    {
      id: 'hal',
      label: 'LAYER 2',
      name: 'HAL',
      color: '#14B8A6',
      icon: Layers,
      details: ['LED Control', 'Button Debounce', 'UART Comms', 'LCD Graphics', 'Software Timers'],
      output: 'Hardware API'
    },
    {
      id: 'driver',
      label: 'LAYER 1',
      name: 'TI DriverLib',
      color: '#8B5CF6',
      icon: Cpu,
      details: ['GPIO Registers', 'eUSCI (SPI/UART)', 'Timer32', 'Interrupt Controller'],
      output: 'Register Access'
    },
    {
      id: 'hw',
      label: 'HARDWARE',
      name: 'MSP432 + BoosterPack',
      color: '#F59E0B',
      icon: CircuitBoard,
      details: ['ARM Cortex-M4F', '128x128 LCD', '7 LEDs', '5 Buttons', 'UART Pins'],
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
          3-Layer Design • No Global Variables • Parameter Passing Only
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
            <span className="ml-summary-name">LED</span>
            <span className="ml-summary-task">7 RGB LEDs</span>
          </div>
          <div className="ml-summary-item" style={{ '--item-color': '#14B8A6' }}>
            <span className="ml-summary-name">Button</span>
            <span className="ml-summary-task">5 Debounced</span>
          </div>
          <div className="ml-summary-item" style={{ '--item-color': '#8B5CF6' }}>
            <span className="ml-summary-name">UART</span>
            <span className="ml-summary-task">4 Baud Rates</span>
          </div>
          <div className="ml-summary-item" style={{ '--item-color': '#EC4899' }}>
            <span className="ml-summary-name">LCD</span>
            <span className="ml-summary-task">128x128 SPI</span>
          </div>
          <div className="ml-summary-item" style={{ '--item-color': '#F59E0B' }}>
            <span className="ml-summary-name">Timer</span>
            <span className="ml-summary-task">48 MHz HW</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================
   FSM Pipeline Diagram
   Same card style as SwishVision ML Pipeline
   ============================================ */
const FSMPipelineDiagram = () => {
  const [hovered, setHovered] = useState(null);

  const states = [
    {
      id: 'menu',
      label: 'START',
      name: 'Main Menu',
      color: '#0068FF',
      icon: Gamepad2,
      details: ['Title Screen', 'BB1 → Instructions', 'BB2 → Start Game'],
      output: 'User Choice'
    },
    {
      id: 'instructions',
      label: 'INFO',
      name: 'Instructions',
      color: '#6366F1',
      icon: Box,
      details: ['Game Rules', 'Command Reference', 'BB2 → Back to Menu'],
      output: 'Return'
    },
    {
      id: 'game',
      label: 'ACTIVE',
      name: 'Game Loop',
      color: '#22C55E',
      icon: Crown,
      details: ['Random Events', 'UART Commands', 'Resource Updates', 'Territory Grid'],
      output: 'PE/TR State'
    },
    {
      id: 'gameover',
      label: 'END',
      name: 'Game Over',
      color: '#EF4444',
      icon: AlertCircle,
      details: ['PE ≤ 0 or TR ≤ 0', 'Final Score', 'BB1 → High Scores'],
      output: 'Score'
    },
    {
      id: 'highscores',
      label: 'RECORD',
      name: 'High Scores',
      color: '#F59E0B',
      icon: Target,
      details: ['Top 3 Scores', 'Years Survived', 'BB1 → Main Menu'],
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
          5 States • Button-Driven Transitions • Non-Blocking
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
          <ToggleLeft size={16} />
          <span>BB1 / BB2</span>
          <span className="ml-perf-label">Button Triggers</span>
        </div>
        <div className="ml-perf-item">
          <Radio size={16} />
          <span>SP / AP / IG</span>
          <span className="ml-perf-label">UART Commands</span>
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

const PixelMonarchProject = () => {
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
            <Crown />
          </div>
          <div className="header-text">
            <div className="project-context">
              <Cpu />
              <span>Embedded Systems</span>
            </div>
            <h1>Pixel Monarch</h1>
            <p className="project-tagline">
              A kingdom management game on the MSP432 LaunchPad with a 128x128 LCD display,
              UART serial communication, and a modular hardware abstraction layer.
              Balance your people, treasury, and territory to survive as long as possible.
            </p>
            <div className="project-tags">
              <span className="tag">MSP432</span>
              <span className="tag">C</span>
              <span className="tag">UART</span>
              <span className="tag">SPI</span>
              <span className="tag">LCD</span>
              <span className="tag">FSM</span>
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

      {/* The Problem */}
      <section className="project-section">
        <div className="section-header">
          <AlertCircle />
          <h2>The Challenge</h2>
        </div>
        <div className="cards-grid">
          <div className="info-card">
            <div className="card-icon"><Gamepad2 /></div>
            <h3>Interactive Game</h3>
            <p>Build a fully interactive kingdom game on a resource-constrained microcontroller with no operating system</p>
          </div>
          <div className="info-card">
            <div className="card-icon"><Radio /></div>
            <h3>Serial Communication</h3>
            <p>Handle UART input/output at 4 different baud rates with real time command parsing</p>
          </div>
          <div className="info-card highlight">
            <div className="card-icon"><Target /></div>
            <h3>Non-Blocking</h3>
            <p>Entire system must remain responsive at all times with no blocking calls or busy-waits</p>
          </div>
        </div>
      </section>

      {/* Game Mechanics */}
      <section className="project-section">
        <div className="section-header">
          <Crown />
          <h2>Game Mechanics</h2>
        </div>
        <div className="content-block">
          <p>You rule a kingdom managing two critical resources across 8 territory regions. Random events test your decisions each year.</p>
        </div>

        <div className="cards-grid two-col">
          <div className="info-card">
            <div className="card-icon"><Shield /></div>
            <h3>Resources</h3>
            <ul className="bullet-list compact">
              <li><strong>People (PE):</strong> Your population. Too low and the kingdom collapses</li>
              <li><strong>Treasury (TR):</strong> Gold reserves. Bankruptcy means game over</li>
              <li><strong>Territory:</strong> 8 regions shown as colored grid on LCD</li>
            </ul>
          </div>
          <div className="info-card">
            <div className="card-icon"><Zap /></div>
            <h3>Events</h3>
            <ul className="bullet-list compact">
              <li><strong>Flood:</strong> Costs people and gold to recover</li>
              <li><strong>Famine:</strong> Population suffers, treasury drains</li>
              <li><strong>Raid:</strong> Lose territory if defenses are weak</li>
              <li><strong>Calm:</strong> A period of peace where resources recover</li>
            </ul>
          </div>
        </div>

        <div className="content-block">
          <h3 className="subsection-title">UART Commands</h3>
          <p>Players issue commands via serial terminal to respond to events:</p>
        </div>
        <div className="cards-grid">
          <div className="metric-card">
            <div className="metric-value">SP</div>
            <div className="metric-label">Spend People</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">AP</div>
            <div className="metric-label">Allocate People</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">IG</div>
            <div className="metric-label">Invest Gold</div>
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
          <p>The project follows a clean three-layer architecture with strict separation of concerns. No global variables, everything is passed through parameters.</p>
        </div>

        <ArchPipelineDiagram />

        <div className="content-block">
          <h3 className="subsection-title">Finite State Machine</h3>
          <p>The game is driven by a multi-screen FSM with clean transitions between states:</p>
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
          <p>The HAL encapsulates all hardware interactions into modular, reusable components. Each peripheral has its own construct/refresh/query API following an object-oriented C pattern.</p>
        </div>

        <div className="cards-grid two-col">
          <div className="info-card">
            <div className="card-icon"><ToggleLeft /></div>
            <h3>Button Module</h3>
            <ul className="bullet-list compact">
              <li>4-state debounce FSM with 5ms filter</li>
              <li>Edge detection (tap vs. hold)</li>
              <li>5 buttons: 2 LaunchPad + 2 BoosterPack + Joystick</li>
            </ul>
          </div>
          <div className="info-card">
            <div className="card-icon"><Radio /></div>
            <h3>UART Module</h3>
            <ul className="bullet-list compact">
              <li>eUSCI_A0 with 4 baud rates (9600-57600)</li>
              <li>Non-blocking TX/RX polling</li>
              <li>Hot-swap baud rate via button</li>
            </ul>
          </div>
          <div className="info-card">
            <div className="card-icon"><Monitor /></div>
            <h3>LCD Module</h3>
            <ul className="bullet-list compact">
              <li>128x128 ST7735 SPI display at 16 MHz</li>
              <li>TI Graphics Library (grlib) integration</li>
              <li>Territory grid rendering + text HUD</li>
            </ul>
          </div>
          <div className="info-card">
            <div className="card-icon"><Timer /></div>
            <h3>Timer Module</h3>
            <ul className="bullet-list compact">
              <li>TIMER32_0 hardware timer at 48 MHz</li>
              <li>ISR-based rollover tracking</li>
              <li>Multiple concurrent software timers</li>
            </ul>
          </div>
        </div>

        <div className="media-card code-card">
          <div className="code-header">
            <Code2 />
            <span>HAL Structure (HAL.h)</span>
          </div>
          <pre>
{`struct _HAL {
    // 7 LEDs (LaunchPad + BoosterPack RGB)
    LED launchpadLED1;
    LED launchpadLED2Red, launchpadLED2Green, launchpadLED2Blue;
    LED boosterpackRed, boosterpackGreen, boosterpackBlue;

    // 5 Buttons with debounce FSM
    Button launchpadS1, launchpadS2;
    Button boosterpackS1, boosterpackS2;
    Button boosterpackJS;  // Joystick press

    // UART serial communication
    UART uart;
};`}
          </pre>
        </div>

        <div className="media-card code-card">
          <div className="code-header">
            <Code2 />
            <span>Button Debounce FSM (Button.c)</span>
          </div>
          <pre>
{`// 4-state debounce, filters switch bounce in 5ms
switch (button_p->debounceState) {
    case StableR:  // Stable Released
        if (rawState == PRESSED)
            transition to TransitionRP, start 5ms timer
        break;
    case TransitionRP:  // Released → Pressed
        if (timer expired && rawState == PRESSED)
            confirm PRESSED state
        else if (rawState == RELEASED)
            return to StableR (noise rejected)
        break;
    case StableP:  // Stable Pressed
        if (rawState == RELEASED)
            transition to TransitionPR, start 5ms timer
        break;
    case TransitionPR:  // Pressed → Released
        if (timer expired && rawState == RELEASED)
            confirm RELEASED state
        break;
}`}
          </pre>
        </div>
      </section>

      {/* Key Metrics */}
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
            <div className="metric-icon"><Box /></div>
            <div className="metric-value">256 KB</div>
            <div className="metric-label">Flash Memory</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon"><Monitor /></div>
            <div className="metric-value">128x128</div>
            <div className="metric-label">LCD Display</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon"><Radio /></div>
            <div className="metric-value">4 Baud</div>
            <div className="metric-label">UART Rates</div>
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
            <h3>Non-Blocking Design</h3>
            <p>Every operation must be non-blocking. The LED toggle test (LB1 to LL1) must always respond instantly, proving the system never stalls</p>
          </div>
          <div className="info-card">
            <h3>No Global Variables</h3>
            <p>All state is passed through function parameters. This enforces clean interfaces and makes the code testable and portable</p>
          </div>
          <div className="info-card">
            <h3>Debounce Timing</h3>
            <p>Mechanical switch bounce required a 4-state FSM with 5ms software timers to reliably detect button presses without false triggers</p>
          </div>
          <div className="info-card">
            <h3>Baud Rate Hot-Swap</h3>
            <p>Switching UART baud rates at runtime required careful eUSCI module reconfiguration without dropping data or corrupting state</p>
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
            <span className="tech-item">ST7735 LCD</span>
            <span className="tech-item">eUSCI UART</span>
            <span className="tech-item">eUSCI SPI</span>
            <span className="tech-item">Timer32</span>
          </div>

          <h3 className="subsection-title">Hardware Platform</h3>
          <div className="tech-inline">
            <span className="tech-item">MSP-EXP432P401R LaunchPad</span>
            <span className="tech-item">Educational BoosterPack MKII</span>
            <span className="tech-item">Crystalfontz 128x128 LCD</span>
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
          <p>I'm open to discussing embedded systems, firmware architecture, or technical details.</p>
          <Link to="/contact" className="cta-primary">
            <Mail />
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PixelMonarchProject;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Github,
  AlertCircle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Layers,
  Target,
  Zap,
  Users,
  Building2,
  Workflow,
  BarChart3,
  Code2,
  BookOpen,
  Mail,
  ArrowRight,
  Video,
  TrendingUp,
  Lightbulb,
  XCircle,
  Award,
  X,
  Server,
  Layout,
  Monitor,
  Eye,
  Brain,
  Activity,
  CircleDot,
  Crosshair,
  GitBranch,
  Construction,
  Wrench,
  CheckCircle2,
  Circle,
  PlayCircle,
  Play
} from 'lucide-react';
import './ClapperboardProject.css'; // Base project page styles
import './SwishVisionProject.css';
import MLPipelineDiagram from '../components/diagrams/MLPipelineDiagram';

const SwishVisionProject = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState({ src: '', alt: '' });
  const [lightboxIsVideo, setLightboxIsVideo] = useState(false);

  // Active progress stage for media navigation
  const [activeStage, setActiveStage] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  const openLightbox = (src, alt, isVideo = false) => {
    setLightboxImage({ src, alt });
    setLightboxIsVideo(isVideo);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxIsVideo(false);
  };

  // Development Progress Stages with real screenshots and YouTube videos
  const progressStages = [
    {
      id: 'detection',
      title: 'Stage 1: Player Detection (YOLO)',
      status: 'completed',
      statusLabel: 'Working',
      description: 'Using YOLO for initial player and referee detection. Detection works well in individual frames but struggled with continuous tracking across frames.',
      result: 'Players and referees detected successfully in frames',
      issue: 'Could not hold detection continuously across video frames',
      media: [
        { src: '/assets/images_sv/playerdetection/playerdetection_frame_01.jpg', alt: 'Player Detection Frame 1', type: 'image' },
        { src: '/assets/images_sv/playerdetection/playerdetection_frame_02.jpg', alt: 'Player Detection Frame 2', type: 'image' },
        { src: '/assets/images_sv/playerdetection/playerdetection_frame_03.jpg', alt: 'Player Detection Frame 3', type: 'image' },
        { src: 'https://youtu.be/ZU3JY8lv288', alt: 'Player Detection Video Demo', type: 'youtube', videoId: 'ZU3JY8lv288' }
      ]
    },
    {
      id: 'tracking',
      title: 'Stage 2: Continuous Tracking (SAM2)',
      status: 'completed',
      statusLabel: 'Working',
      description: 'Added SAM2 (Segment Anything Model 2) to make detection continuous across frames. This successfully maintained tracking throughout the video.',
      result: 'Continuous player tracking achieved across video frames',
      issue: 'Players not detected in the first frame remain undetected throughout - still working on a solution',
      media: [
        { src: '/assets/images_sv/playerdetection_tracked/playertracking_frame_01.jpg', alt: 'Player Tracking Frame 1', type: 'image' },
        { src: '/assets/images_sv/playerdetection_tracked/playertracking_frame_02.jpg', alt: 'Player Tracking Frame 2', type: 'image' },
        { src: '/assets/images_sv/playerdetection_tracked/playertracking_frame_03.jpg', alt: 'Player Tracking Frame 3', type: 'image' },
        { src: 'https://youtu.be/NVq8giX8RPI', alt: 'Continuous Tracking Video Demo', type: 'youtube', videoId: 'NVq8giX8RPI' }
      ]
    },
    {
      id: 'tactical',
      title: 'Stage 3: Tactical View (Homography)',
      status: 'completed',
      statusLabel: 'Working',
      description: 'Implemented tactical 2D court view using homography transformation. Players are color-coded by team - red for one team, green for the other, and yellow for referees.',
      result: 'Real-time 2D minimap showing player positions on court',
      issue: null,
      media: [
        { src: '/assets/images_sv/tactical_view/tracking_frame_01.jpg', alt: 'Tactical View Frame 1', type: 'image' },
        { src: '/assets/images_sv/tactical_view/tracking_frame_02.jpg', alt: 'Tactical View Frame 2', type: 'image' },
        { src: '/assets/images_sv/tactical_view/tracking_frame_03.jpg', alt: 'Tactical View Frame 3', type: 'image' },
        { src: 'https://youtu.be/oqUrfFeTF88', alt: 'Tactical View Video Demo', type: 'youtube', videoId: 'oqUrfFeTF88' }
      ]
    },
    {
      id: 'jersey',
      title: 'Stage 4: Jersey Number Detection (SmolVLM2)',
      status: 'in-progress',
      statusLabel: 'In Progress',
      description: 'Using SmolVLM2 vision-language model for jersey number OCR. The model performs well when jersey numbers are visible but struggles with continuous tracking.',
      result: 'Successfully reads jersey numbers when in clear view',
      issue: 'Model guesses when jersey number is not visible, causing tracking inconsistencies. Will improve this.',
      media: [
        { src: 'https://youtu.be/zbFBUAnp77c', alt: 'Jersey Detection Video Demo', type: 'youtube', videoId: 'zbFBUAnp77c' }
      ]
    }
  ];

  // Get current stage media
  const currentStageMedia = progressStages[activeStage]?.media || [];

  // Reset slide when stage changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [activeStage]);

  // Escape key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && lightboxOpen) {
        closeLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % currentStageMedia.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + currentStageMedia.length) % currentStageMedia.length);

  const techStack = {
    mlPipeline: [
      { name: 'YOLO', desc: 'Player Detection' },
      { name: 'SAM2', desc: 'Continuous Tracking' },
      { name: 'SmolVLM2', desc: 'Jersey OCR (VLM)' },
      { name: 'SigLIP', desc: 'Team Classification' },
      { name: 'Homography', desc: 'Court Mapping' },
      { name: 'PyTorch', desc: 'ML Framework' }
    ],
    backend: [
      { name: 'FastAPI', desc: 'Python Backend' },
      { name: 'PostgreSQL', desc: 'Database' },
      { name: 'OpenCV', desc: 'Video Processing' },
      { name: 'Supervision', desc: 'CV Utilities' },
      { name: 'RunPod', desc: 'GPU Cloud' },
      { name: 'Supabase', desc: 'Auth & Storage' }
    ],
    frontend: [
      { name: 'Next.js 15', desc: 'React Framework' },
      { name: 'TypeScript', desc: 'Type Safety' },
      { name: 'TailwindCSS', desc: 'Styling' },
      { name: 'Shadcn/ui', desc: 'UI Components' }
    ]
  };

  const futureWork = [
    'Complete basic analytics (shot detection, possession tracking)',
    'Play-by-play automatic analysis',
    'Real-time live stream processing',
    'Player movement heatmaps and speed tracking'
  ];

  const marketContext = {
    competitors: [
      { name: 'Second Spectrum', price: '$100K+/year', note: 'NBA Official Partner' },
      { name: 'Synergy Sports', price: '$50K+/year', note: 'Pro/College' },
      { name: 'Hudl', price: '$10K+/year', note: 'Basic Analytics' }
    ],
    target: 'College basketball programs that need advanced analytics but cannot afford enterprise solutions'
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} />;
      case 'in-progress': return <Wrench size={16} />;
      case 'pending': return <Circle size={16} />;
      default: return <Circle size={16} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'in-progress': return 'status-in-progress';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  return (
    <div className="project-page swishvision-project">
      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <X />
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {lightboxIsVideo ? (
              <video controls autoPlay style={{ maxWidth: '100%', maxHeight: '80vh' }}>
                <source src={lightboxImage.src} type="video/mp4" />
              </video>
            ) : (
              <img src={lightboxImage.src} alt={lightboxImage.alt} />
            )}
            <p className="lightbox-caption">{lightboxImage.alt}</p>
          </div>
        </div>
      )}

      {/* Back Button */}
      <Link to="/projects" className="back-button">
        <ChevronLeft />
        <span>Back to Projects</span>
      </Link>

      {/* Section 0: Header */}
      <header className="project-header">
        <div className="header-content">
          <div className="project-icon-large">
            <Activity />
          </div>
          <div className="header-text">
            <div className="project-badges">
              <span className="badge featured">
                <Award />
                AI/ML Project
              </span>
              <span className="badge platform">
                <Brain />
                Computer Vision
              </span>
              <span className="badge status-badge">
                <Construction />
                Actively Building
              </span>
            </div>
            <h1>SwishVision</h1>
            <p className="project-tagline">
              AI-Powered Basketball Analytics Platform for College Programs
            </p>
            <div className="project-tags">
              <span className="tag">PyTorch</span>
              <span className="tag">YOLO</span>
              <span className="tag">SAM2</span>
              <span className="tag">FastAPI</span>
              <span className="tag">Next.js</span>
              <span className="tag">PostgreSQL</span>
            </div>
            <div className="header-ctas">
              <a href="https://github.com/Brillar0101/swishvision" target="_blank" rel="noopener noreferrer" className="cta-primary">
                <Github />
                View on GitHub
              </a>
              <a href="#progress" className="cta-secondary">
                <Play />
                See Progress
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Section 1: Project Status - Honest Introduction */}
      <section className="project-section">
        <div className="section-header">
          <Construction />
          <h2>Current Status</h2>
        </div>
        <div className="status-intro glass-card">
          <div className="status-intro-content">
            <h3>This project is actively in development</h3>
            <p>
              My biggest challenge right now is <strong>computing power</strong>. Processing video through multiple ML models
              (YOLO, SAM2, SmolVLM2) requires significant GPU resources, which limits how quickly I can iterate and test.
            </p>
            <div className="status-goals">
              <div className="goal-item">
                <div className="goal-phase">Phase 1 (Current)</div>
                <div className="goal-text">Build all basic analytics - player tracking, team classification, jersey detection, tactical view</div>
              </div>
              <div className="goal-item">
                <div className="goal-phase">Phase 2 (Next)</div>
                <div className="goal-text">Analyze plays - possession tracking, shot detection, play-by-play breakdown</div>
              </div>
              <div className="goal-item">
                <div className="goal-phase">Phase 3 (Future)</div>
                <div className="goal-text">Advanced features - player heatmaps, speed tracking, real-time processing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Development Progress with Real Screenshots */}
      <section className="project-section" id="progress">
        <div className="section-header">
          <Workflow />
          <h2>Development Progress</h2>
        </div>

        {/* Progress Timeline */}
        <div className="progress-timeline">
          {progressStages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <button
                className={`progress-stage-btn ${activeStage === index ? 'active' : ''} ${getStatusClass(stage.status)}`}
                onClick={() => setActiveStage(index)}
              >
                <div className="stage-label-row">
                  <span className="stage-label">STAGE {index + 1}</span>
                  <div className={`stage-icon ${stage.status}`}>
                    {stage.status === 'completed' ? <CheckCircle2 size={18} /> : <Wrench size={18} />}
                  </div>
                </div>
                <span className="stage-name">{stage.title.split(': ')[1].split(' (')[0]}</span>
                <span className="stage-status-label">{stage.statusLabel}</span>
              </button>
              {index < progressStages.length - 1 && (
                <div className={`progress-connector ${stage.status === 'completed' ? 'completed' : ''}`}>
                  <ArrowRight size={16} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Active Stage Content */}
        <div className="progress-stage-content glass-card">
          <div className="stage-header">
            <h3>{progressStages[activeStage].title}</h3>
            <span className={`stage-status-badge ${getStatusClass(progressStages[activeStage].status)}`}>
              {getStatusIcon(progressStages[activeStage].status)}
              {progressStages[activeStage].statusLabel}
            </span>
          </div>

          <p className="stage-description">{progressStages[activeStage].description}</p>

          {/* Media Preview */}
          <div className="stage-media-container">
            <div className="media-preview">
              {currentStageMedia[currentSlide]?.type === 'youtube' ? (
                <div className="youtube-embed">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentStageMedia[currentSlide]?.videoId}`}
                    title={currentStageMedia[currentSlide]?.alt}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : currentStageMedia[currentSlide]?.type === 'video' ? (
                <div
                  className="video-thumbnail"
                  onClick={() => openLightbox(currentStageMedia[currentSlide]?.src, currentStageMedia[currentSlide]?.alt, true)}
                >
                  <video src={currentStageMedia[currentSlide]?.src} muted />
                  <div className="play-overlay">
                    <PlayCircle size={48} />
                    <span>Click to play</span>
                  </div>
                </div>
              ) : (
                <img
                  src={currentStageMedia[currentSlide]?.src}
                  alt={currentStageMedia[currentSlide]?.alt}
                  onClick={() => openLightbox(currentStageMedia[currentSlide]?.src, currentStageMedia[currentSlide]?.alt)}
                />
              )}
            </div>

            {/* Navigation Controls */}
            {currentStageMedia.length > 1 && (
              <div className="slideshow-controls">
                <button className="control-btn" onClick={prevSlide}>
                  <ChevronLeft />
                </button>
                <button className="control-btn" onClick={nextSlide}>
                  <ChevronRight />
                </button>
              </div>
            )}
            <div className="slide-counter">
              {currentSlide + 1} / {currentStageMedia.length}
            </div>
            <p className="slide-caption">{currentStageMedia[currentSlide]?.alt}</p>
          </div>

          {/* Results & Issues */}
          <div className="stage-results">
            <div className="result-item success">
              <CheckCircle />
              <div>
                <span className="result-label">Result</span>
                <p>{progressStages[activeStage].result}</p>
              </div>
            </div>
            {progressStages[activeStage].issue && (
              <div className="result-item issue">
                <AlertCircle />
                <div>
                  <span className="result-label">Current Issue</span>
                  <p>{progressStages[activeStage].issue}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Problem Statement */}
      <section className="project-section">
        <div className="section-header">
          <AlertCircle />
          <h2>The Problem</h2>
        </div>
        <div className="problem-grid">
          <div className="glass-card problem-card">
            <div className="problem-icon">
              <XCircle />
            </div>
            <h3>Expensive Solutions</h3>
            <p>
              Second Spectrum charges $100K+/year and Synergy Sports $50K+/year.
              Most college programs simply cannot afford these analytics tools.
            </p>
          </div>
          <div className="glass-card problem-card">
            <div className="problem-icon">
              <Clock />
            </div>
            <h3>Manual Analysis</h3>
            <p>
              Coaches spend hours manually reviewing game footage to track player
              movements, shots, and tactical patterns.
            </p>
          </div>
          <div className="glass-card problem-card success-card">
            <div className="problem-icon success">
              <CheckCircle />
            </div>
            <h3>SwishVision Solution</h3>
            <p>
              Affordable AI-powered analytics that automatically extracts player
              tracking, shot charts, and tactical insights from game video.
            </p>
          </div>
        </div>

        {/* Market Context */}
        <div className="glass-card market-context">
          <h3>
            <TrendingUp />
            Market Context
          </h3>
          <div className="competitors-grid">
            {marketContext.competitors.map((comp, idx) => (
              <div key={idx} className="competitor-card">
                <span className="competitor-name">{comp.name}</span>
                <span className="competitor-price">{comp.price}</span>
                <span className="competitor-note">{comp.note}</span>
              </div>
            ))}
          </div>
          <p className="target-market">
            <Target />
            <span>Target: {marketContext.target}</span>
          </p>
        </div>
      </section>

      {/* Section 4: Who Uses This */}
      <section className="project-section">
        <div className="section-header">
          <Users />
          <h2>Target Users</h2>
        </div>
        <div className="users-content">
          <div className="glass-card users-card">
            <h3>Primary Users</h3>
            <ul className="users-list">
              <li>
                <Building2 />
                <span>College basketball programs (NCAA D1, D2, D3)</span>
              </li>
              <li>
                <Users />
                <span>Coaching staff for game preparation</span>
              </li>
              <li>
                <BarChart3 />
                <span>Team analysts for performance tracking</span>
              </li>
              <li>
                <Target />
                <span>Player development coordinators</span>
              </li>
            </ul>
          </div>
          <div className="glass-card users-card">
            <h3>Use Cases</h3>
            <ul className="users-list">
              <li>
                <Video />
                <span>Post-game analysis and breakdown</span>
              </li>
              <li>
                <Activity />
                <span>Opponent scouting and preparation</span>
              </li>
              <li>
                <Crosshair />
                <span>Shot selection and efficiency analysis</span>
              </li>
              <li>
                <Layout />
                <span>Defensive/offensive scheme analysis</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 5: ML Pipeline */}
      <section className="project-section">
        <div className="section-header">
          <Workflow />
          <h2>ML Pipeline Architecture</h2>
        </div>
        <div className="solution-content">
          <div className="diagram-container">
            <div className="diagram-header">
              <Brain />
              <h3>Computer Vision Pipeline</h3>
            </div>
            <div className="diagram-image-container">
              <MLPipelineDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Features */}
      <section className="project-section">
        <div className="section-header">
          <Layers />
          <h2>Features</h2>
        </div>
        <div className="features-content">
          <div className="glass-card features-card">
            <h3>
              <Crosshair />
              Detection & Tracking
            </h3>
            <div className="features-grid">
              <div className="feature-item">
                <CheckCircle2 className="feature-done" />
                <div>
                  <h4>Player Detection</h4>
                  <p>YOLO-based detection for players and referees</p>
                </div>
              </div>
              <div className="feature-item">
                <CheckCircle2 className="feature-done" />
                <div>
                  <h4>Continuous Tracking</h4>
                  <p>SAM2-powered frame-to-frame tracking</p>
                </div>
              </div>
              <div className="feature-item">
                <CheckCircle2 className="feature-done" />
                <div>
                  <h4>Team Classification</h4>
                  <p>Color-coded team assignment (red/green)</p>
                </div>
              </div>
              <div className="feature-item">
                <Wrench className="feature-progress" />
                <div>
                  <h4>Jersey OCR</h4>
                  <p>SmolVLM2 number recognition (in progress)</p>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card features-card">
            <h3>
              <BarChart3 />
              Analytics & Visualization
            </h3>
            <div className="features-grid">
              <div className="feature-item">
                <CheckCircle2 className="feature-done" />
                <div>
                  <h4>Tactical 2D View</h4>
                  <p>Real-time minimap with player positions</p>
                </div>
              </div>
              <div className="feature-item">
                <Circle className="feature-pending" />
                <div>
                  <h4>Shot Detection</h4>
                  <p>Coming next phase</p>
                </div>
              </div>
              <div className="feature-item">
                <Circle className="feature-pending" />
                <div>
                  <h4>Possession Tracking</h4>
                  <p>Coming next phase</p>
                </div>
              </div>
              <div className="feature-item">
                <Circle className="feature-pending" />
                <div>
                  <h4>Shot Charts</h4>
                  <p>Coming next phase</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Future Roadmap */}
      <section className="project-section">
        <div className="section-header">
          <Lightbulb />
          <h2>Roadmap</h2>
        </div>
        <div className="challenges-content">
          <div className="glass-card future-work">
            <h3>
              <ArrowRight />
              Next Steps
            </h3>
            <ul className="future-list">
              {futureWork.map((item, index) => (
                <li key={index}>
                  <Target />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Section 8: Tech Stack */}
      <section className="project-section">
        <div className="section-header">
          <Code2 />
          <h2>Tech Stack</h2>
        </div>
        <div className="tech-content">
          <div className="tech-card">
            <div className="tech-card-icon">
              <Brain />
            </div>
            <h3>ML Pipeline</h3>
            <div className="tech-list">
              {techStack.mlPipeline.map((tech, index) => (
                <div key={index} className="tech-item">
                  <span className="tech-name">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="tech-card">
            <div className="tech-card-icon">
              <Server />
            </div>
            <h3>Backend</h3>
            <div className="tech-list">
              {techStack.backend.map((tech, index) => (
                <div key={index} className="tech-item">
                  <span className="tech-name">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="tech-card">
            <div className="tech-card-icon">
              <Monitor />
            </div>
            <h3>Frontend</h3>
            <div className="tech-list">
              {techStack.frontend.map((tech, index) => (
                <div key={index} className="tech-item">
                  <span className="tech-name">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Project Context */}
      <section className="project-section">
        <div className="section-header">
          <GitBranch />
          <h2>Project Context</h2>
        </div>
        <div className="context-content">
          <div className="glass-card context-card">
            <div className="context-item">
              <span className="context-label">Started</span>
              <span className="context-value">August 2025</span>
            </div>
            <div className="context-item">
              <span className="context-label">Type</span>
              <span className="context-value">Solo Project</span>
            </div>
            <div className="context-item">
              <span className="context-label">Status</span>
              <span className="context-value status-dev">Actively Building</span>
            </div>
            <div className="context-item">
              <span className="context-label">Pilot Goal</span>
              <span className="context-value">Virginia Tech Athletics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 10: Links */}
      <section className="project-section">
        <div className="section-header">
          <BookOpen />
          <h2>Links & Resources</h2>
        </div>
        <div className="links-content">
          <div className="links-grid">
            <a href="https://github.com/Brillar0101/swishvision" target="_blank" rel="noopener noreferrer" className="glass-card link-card">
              <Github />
              <span className="link-title">GitHub Repository</span>
              <span className="link-url">github.com/Brillar0101/swishvision</span>
            </a>
          </div>

          <div className="glass-card contact-cta">
            <h3>Interested in this project?</h3>
            <p>I'd love to discuss the ML pipeline, computer vision challenges, or potential collaborations.</p>
            <Link to="/contact" className="cta-primary">
              <Mail />
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SwishVisionProject;

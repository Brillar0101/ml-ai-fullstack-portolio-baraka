import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Github,
  ExternalLink,
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
  Mail,
  ArrowRight,
  Camera,
  Film,
  Box,
  Timer,
  TrendingUp,
  Settings,
  Package,
  Lightbulb,
  XCircle,
  Award,
  X,
  FastForward,
  Rewind,
  SkipBack,
  SkipForward
} from 'lucide-react';
import './ClapperboardProject.css';

const ClapperboardProject = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState({ src: '', alt: '' });

  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slideSpeed, setSlideSpeed] = useState(2000);

  // Failure gallery state
  const [failureIndex, setFailureIndex] = useState(0);

  const openLightbox = (src, alt) => {
    setLightboxImage({ src, alt });
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  // Generate slideshow images
  const negativeImages = Array.from({ length: 22 }, (_, i) => ({
    src: `/assets/images/clapperboard/result_slideshow/result_neg_${String(i).padStart(4, '0')}.jpg`,
    alt: `True Negative ${i + 1} of 22, correctly ignored (no clapperboard)`
  }));

  const positiveImages = Array.from({ length: 111 }, (_, i) => ({
    src: `/assets/images/clapperboard/result_slideshow/result_pos_${String(i).padStart(4, '0')}.jpg`,
    alt: `True Positive ${i + 1} of 111, clapperboard detected`
  }));

  const slideshowImages = [...negativeImages, ...positiveImages];

  const failureCases = [
    {
      src: '/assets/images/clapperboard/result_slideshow/result_pos_0081.jpg',
      alt: 'Failed to detect clapperboard held by person',
      description: 'The model failed to detect the clapperboard being held by the person in the frame.'
    },
    {
      src: '/assets/images/clapperboard/result_slideshow/result_pos_0100.jpg',
      alt: 'Missed second clapperboard, detected police hat as clapperboard',
      description: 'The model detected one clapperboard but missed the second one.'
    },
    {
      src: '/assets/images/clapperboard/result_slideshow/result_neg_0016.jpg',
      alt: 'False positive, iPad detected as clapperboard',
      description: 'The model incorrectly detected an iPad/tablet as a clapperboard with 87.3% confidence.'
    },
    {
      src: '/assets/images/clapperboard/result_slideshow/result_pos_0105.jpg',
      alt: 'Failed to detect blurry clapperboard',
      description: 'The model failed to detect a clapperboard due to motion blur.'
    },
    {
      src: '/assets/images/clapperboard/result_slideshow/result_pos_0020.jpg',
      alt: 'Failed to detect vintage black & white clapperboard',
      description: 'The model failed to detect an old-school, vintage clapperboard.'
    }
  ];

  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, slideSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, slideSpeed, slideshowImages.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
  const nextFailure = () => setFailureIndex((prev) => (prev + 1) % failureCases.length);
  const prevFailure = () => setFailureIndex((prev) => (prev - 1 + failureCases.length) % failureCases.length);

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
            <Camera />
          </div>
          <div className="header-text">
            <div className="project-context">
              <Award />
              <span>Cocreate Slate Detection Challenge</span>
            </div>
            <h1>Clapperboard Detection System</h1>
            <p className="project-tagline">
              Detect clapperboards instantly in footage to speed up editing workflows.
              Built with YOLOv8n achieving 96.4% mAP@0.5 at 48 FPS real-time processing.
            </p>
            <div className="project-tags">
              <span className="tag">Computer Vision</span>
              <span className="tag">Object Detection</span>
              <span className="tag">YOLOv8</span>
              <span className="tag">Video Tools</span>
            </div>
            <div className="header-ctas">
              <a href="https://youtu.be/Bmev1UZnyQY" target="_blank" rel="noopener noreferrer" className="cta-primary">
                <Play />
                Watch Demo
              </a>
              <a href="https://github.com/Brillar0101/Clapperboard_Detector" target="_blank" rel="noopener noreferrer" className="cta-secondary">
                <Github />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Video */}
      <section className="project-section">
        <div className="section-header">
          <Film />
          <h2>Demo</h2>
        </div>
        <div className="media-card">
          <div className="video-embed">
            <iframe
              src="https://www.youtube.com/embed/Bmev1UZnyQY"
              title="Clapperboard Detection Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="project-section">
        <div className="section-header">
          <AlertCircle />
          <h2>The Problem</h2>
        </div>
        <div className="cards-grid">
          <div className="info-card">
            <div className="card-icon"><Clock /></div>
            <h3>Time-Consuming</h3>
            <p>Editors spend hours scrubbing through footage to find clapperboard moments for syncing audio and organizing takes</p>
          </div>
          <div className="info-card">
            <div className="card-icon"><Workflow /></div>
            <h3>Workflow Friction</h3>
            <p>Manual scanning interrupts creative flow and introduces human error in post-production</p>
          </div>
          <div className="info-card highlight">
            <div className="card-icon"><Target /></div>
            <h3>The Goal</h3>
            <p>Automatic detection of clapperboards at ingest with instant timestamp logging</p>
          </div>
        </div>
      </section>

      {/* Who Uses This */}
      <section className="project-section">
        <div className="section-header">
          <Users />
          <h2>Who Uses This</h2>
        </div>
        <div className="cards-grid two-col">
          <div className="info-card">
            <div className="card-icon"><Film /></div>
            <h3>Video Editors</h3>
            <p>Editors and assistant editors working on film, TV, and commercial projects</p>
          </div>
          <div className="info-card">
            <div className="card-icon"><Users /></div>
            <h3>Post-Production Teams</h3>
            <p>Supervisors and teams managing large-scale post-production workflows</p>
          </div>
          <div className="info-card">
            <div className="card-icon"><Building2 /></div>
            <h3>Production Studios</h3>
            <p>Studios processing high volumes of footage daily</p>
          </div>
          <div className="info-card">
            <div className="card-icon"><Database /></div>
            <h3>Asset Management</h3>
            <p>Media asset management systems for search and filtering</p>
          </div>
        </div>
      </section>

      {/* My Solution */}
      <section className="project-section">
        <div className="section-header">
          <Lightbulb />
          <h2>My Solution</h2>
        </div>
        <div className="cards-grid four-col">
          <div className="metric-card">
            <div className="metric-icon"><Cpu /></div>
            <div className="metric-value">YOLOv8n</div>
            <div className="metric-label">Model Architecture</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon"><Layers /></div>
            <div className="metric-value">3.2M</div>
            <div className="metric-label">Parameters</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon"><Zap /></div>
            <div className="metric-value">48 FPS</div>
            <div className="metric-label">Real-time Speed</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon"><Target /></div>
            <div className="metric-value">96.4%</div>
            <div className="metric-label">mAP@0.5</div>
          </div>
        </div>
      </section>

      {/* Build Process */}
      <section className="project-section">
        <div className="section-header">
          <Workflow />
          <h2>Build Process</h2>
        </div>

        <div className="content-block">
          <h3 className="subsection-title">1. Data Collection</h3>
          <p>Assembled 1,288 images of clapperboards from various sources.</p>
          <ul className="bullet-list compact">
            <li>909 training images (71%)</li>
            <li>250 validation images (19%)</li>
            <li>129 test images (10%)</li>
            <li>Includes traditional slates, all-black boards, various orientations</li>
            <li>Hard negatives (whiteboards, clipboards, tablets) included</li>
          </ul>
        </div>

        <div className="media-card">
          <img
            src="/assets/images/clapperboard/dataset-grid.png"
            alt="Dataset grid showing diverse clapperboard samples"
            onClick={() => openLightbox('/assets/images/clapperboard/dataset-grid.png', 'Dataset grid')}
          />
        </div>

        <div className="content-block">
          <h3 className="subsection-title">2. Labeling with Roboflow</h3>
          <p>Used Roboflow for manual bounding box annotation with quality checks.</p>
          <ul className="bullet-list compact">
            <li>Bounding box annotation</li>
            <li>Quality verification passes</li>
            <li>YOLO format export</li>
          </ul>
          <a href="https://app.roboflow.com/baraka/clapperboard-detector-1f24x/models" target="_blank" rel="noopener noreferrer" className="inline-link">
            <ExternalLink /> View Dataset on Roboflow
          </a>
        </div>

        <div className="media-card">
          <img
            src="/assets/images/clapperboard/roboflow-labeling.png"
            alt="Roboflow labeling interface"
            onClick={() => openLightbox('/assets/images/clapperboard/roboflow-labeling.png', 'Roboflow labeling interface')}
          />
        </div>

        <div className="content-block">
          <h3 className="subsection-title">3. Training Configuration</h3>
          <ul className="bullet-list compact">
            <li><strong>Framework:</strong> Ultralytics YOLOv8</li>
            <li><strong>Model:</strong> YOLOv8n (~3.2M params)</li>
            <li><strong>Input Size:</strong> 640x640</li>
            <li><strong>Epochs:</strong> 100</li>
            <li><strong>Optimizer:</strong> AdamW with cosine annealing</li>
            <li><strong>Augmentation:</strong> HSV, flip, scale, translate</li>
          </ul>
        </div>

        <div className="media-card code-card">
          <div className="code-header">
            <Code2 />
            <span>Training Command</span>
          </div>
          <pre>
{`from ultralytics import YOLO

model = YOLO('yolov8n.pt')
results = model.train(
    data='dataset/training_ready/data.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    patience=20
)`}
          </pre>
        </div>

        <div className="media-card">
          <img
            src="/assets/images/clapperboard/training-curves.png"
            alt="Training curves showing model performance"
            onClick={() => openLightbox('/assets/images/clapperboard/training-curves.png', 'Training curves')}
          />
        </div>
      </section>

      {/* Results */}
      <section className="project-section">
        <div className="section-header">
          <BarChart3 />
          <h2>Results</h2>
        </div>

        <div className="cards-grid five-col">
          <div className="metric-card">
            <div className="metric-value">96.4%</div>
            <div className="metric-label">mAP@0.5</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">92.3%</div>
            <div className="metric-label">Precision</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">94.5%</div>
            <div className="metric-label">Recall</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">~48</div>
            <div className="metric-label">FPS</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">20.86ms</div>
            <div className="metric-label">Inference</div>
          </div>
        </div>

        <div className="cards-grid four-col" style={{ marginTop: '24px' }}>
          <div className="stat-card">
            <div className="stat-value">133</div>
            <div className="stat-label">Total Images</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">111</div>
            <div className="stat-label">True Positives</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">22</div>
            <div className="stat-label">True Negatives</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-value">96.2%</div>
            <div className="stat-label">Accuracy</div>
          </div>
        </div>

        {/* Test Results Slideshow */}
        <div className="media-card slideshow-container">
          <h3>Test Results Slideshow</h3>
          <p className="slideshow-subtitle">Browse through all 133 test case results</p>

          <div className="slideshow-viewer">
            <button className="slideshow-nav prev" onClick={prevSlide}>
              <ChevronLeft />
            </button>

            <div className="slideshow-image-container">
              <img
                src={slideshowImages[currentSlide]?.src}
                alt={slideshowImages[currentSlide]?.alt}
                onClick={() => openLightbox(slideshowImages[currentSlide]?.src, slideshowImages[currentSlide]?.alt)}
              />
              <div className="slideshow-counter">
                {currentSlide + 1} / {slideshowImages.length}
              </div>
            </div>

            <button className="slideshow-nav next" onClick={nextSlide}>
              <ChevronRight />
            </button>
          </div>

          <div className="slideshow-controls">
            <button className="control-btn" onClick={() => setSlideSpeed(Math.min(slideSpeed + 500, 5000))} title="Slower">
              <Rewind />
            </button>
            <button className="control-btn" onClick={prevSlide} title="Previous">
              <SkipBack />
            </button>
            <button className={`control-btn play-btn ${isPlaying ? 'playing' : ''}`} onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause /> : <Play />}
            </button>
            <button className="control-btn" onClick={nextSlide} title="Next">
              <SkipForward />
            </button>
            <button className="control-btn" onClick={() => setSlideSpeed(Math.max(slideSpeed - 500, 500))} title="Faster">
              <FastForward />
            </button>
          </div>
        </div>

        {/* Failure Cases */}
        <div className="content-block">
          <h3 className="subsection-title">Failure Analysis (5 cases)</h3>
          <ul className="bullet-list compact">
            <li><XCircle className="bullet-icon error" /> <strong>False Negatives:</strong> Missed clapperboards due to blur, occlusion, or vintage appearance (3 cases)</li>
            <li><XCircle className="bullet-icon error" /> <strong>False Positives:</strong> Incorrectly detected tablets/iPads as clapperboards (1 case)</li>
            <li><XCircle className="bullet-icon error" /> <strong>Partial Detection:</strong> Detected one clapperboard but missed another (1 case)</li>
          </ul>
        </div>

        <div className="media-card">
          <h3>Confusion Matrix</h3>
          <img
            src="/assets/images/clapperboard/confusion-matrix.png"
            alt="Confusion matrix showing model predictions"
            onClick={() => openLightbox('/assets/images/clapperboard/confusion-matrix.png', 'Confusion matrix')}
          />
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
            <h3>Dataset Diversity</h3>
            <p>Curated 1,288 diverse images including traditional slates, all-black boards, and various orientations</p>
          </div>
          <div className="info-card">
            <h3>Label Consistency</h3>
            <p>Used Roboflow for standardized bounding box labeling with quality checks</p>
          </div>
          <div className="info-card">
            <h3>False Positives</h3>
            <p>Added hard negatives (whiteboards, clipboards, tablets) to training set</p>
          </div>
          <div className="info-card">
            <h3>Confidence Tuning</h3>
            <p>Balanced precision/recall with 0.5 threshold achieving 5.4% FP rate</p>
          </div>
        </div>

        <div className="content-block" style={{ marginTop: '24px' }}>
          <h3 className="subsection-title">Future Improvements</h3>
          <div className="cards-grid four-col">
            <div className="future-card">
              <Database />
              <span>Expand dataset</span>
            </div>
            <div className="future-card">
              <Workflow />
              <span>Temporal smoothing</span>
            </div>
            <div className="future-card">
              <Package />
              <span>API/Plugin module</span>
            </div>
            <div className="future-card">
              <Code2 />
              <span>OCR for slate info</span>
            </div>
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
            <span className="tech-item">YOLOv8n</span>
            <span className="tech-item">Ultralytics</span>
            <span className="tech-item">PyTorch</span>
            <span className="tech-item">Roboflow</span>
            <span className="tech-item">OpenCV</span>
            <span className="tech-item">Google Colab</span>
          </div>

          <h3 className="subsection-title">Requirements</h3>
          <div className="requirements-inline">
            <code>ultralytics&gt;=8.0.0</code>
            <code>torch&gt;=2.0.0</code>
            <code>opencv-python&gt;=4.8.0</code>
            <code>numpy&gt;=1.24.0</code>
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
            <a href="https://github.com/Brillar0101/Clapperboard_Detector" target="_blank" rel="noopener noreferrer" className="inline-link">
              <Github /> GitHub Repository
            </a>
            <a href="https://youtu.be/Bmev1UZnyQY" target="_blank" rel="noopener noreferrer" className="inline-link">
              <Play /> Demo Video
            </a>
            <a href="https://app.roboflow.com/baraka/clapperboard-detector-1f24x/models" target="_blank" rel="noopener noreferrer" className="inline-link">
              <Database /> Dataset on Roboflow
            </a>
          </div>
        </div>

        <div className="contact-section">
          <h3>Interested in this project?</h3>
          <p>I'm open to discussing collaborations, opportunities, or technical details.</p>
          <Link to="/contact" className="cta-primary">
            <Mail />
            Get in Touch
          </Link>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              <X />
            </button>
            <img src={lightboxImage.src} alt={lightboxImage.alt} />
            <p className="lightbox-caption">{lightboxImage.alt}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClapperboardProject;

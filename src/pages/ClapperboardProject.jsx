import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  FileText,
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
  BookOpen,
  Mail,
  ArrowRight,
  Camera,
  Film,
  Clapperboard,
  Box,
  Timer,
  Gauge,
  TrendingUp,
  Image,
  Video,
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

const ClapperboardProject = ({ setCurrentPage }) => {
  const [activeSection, setActiveSection] = useState('demo');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState({ src: '', alt: '' });
  
  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slideSpeed, setSlideSpeed] = useState(2000); // 2 seconds default
  
  // Failure gallery state
  const [failureIndex, setFailureIndex] = useState(0);

  const openLightbox = (src, alt) => {
    setLightboxImage({ src, alt });
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  // Generate slideshow images - negative images (0-21) then positive images (0-110)
  const negativeImages = Array.from({ length: 22 }, (_, i) => ({
    src: `/assets/images/clapperboard/result_slideshow/result_neg_${String(i).padStart(4, '0')}.jpg`,
    alt: `True Negative ${i + 1} of 22 - Correctly ignored (no clapperboard)`
  }));
  
  const positiveImages = Array.from({ length: 111 }, (_, i) => ({
    src: `/assets/images/clapperboard/result_slideshow/result_pos_${String(i).padStart(4, '0')}.jpg`,
    alt: `True Positive ${i + 1} of 111 - Clapperboard detected`
  }));
  
  const slideshowImages = [...negativeImages, ...positiveImages];

  // Failure cases with detailed descriptions
  const failureCases = [
    { 
      src: '/assets/images/clapperboard/result_slideshow/result_pos_0081.jpg', 
      alt: 'Failed to detect clapperboard held by person',
      description: 'The model failed to detect the clapperboard being held by the person in the frame. The slate was partially obscured and at an unusual angle.'
    },
    { 
      src: '/assets/images/clapperboard/result_slideshow/result_pos_0100.jpg', 
      alt: 'Missed second clapperboard, detected police hat as clapperboard',
      description: 'The model detected one clapperboard but missed the second one. Additionally, it incorrectly identified a police hat as a clapperboard (false positive).'
    },
    { 
      src: '/assets/images/clapperboard/result_slideshow/result_neg_0016.jpg', 
      alt: 'False positive - iPad detected as clapperboard',
      description: 'The model incorrectly detected an iPad/tablet as a clapperboard with 87.3% confidence. This is a common false positive due to similar rectangular shape.'
    },
    { 
      src: '/assets/images/clapperboard/result_slideshow/result_pos_0105.jpg', 
      alt: 'Failed to detect blurry clapperboard',
      description: 'The model failed to detect a clapperboard due to motion blur. The slate was in motion and too blurry for reliable detection.'
    },
    { 
      src: '/assets/images/clapperboard/result_slideshow/result_pos_0020.jpg', 
      alt: 'Failed to detect vintage black & white clapperboard',
      description: 'The model failed to detect an old-school, vintage clapperboard. The black and white coloring, blur, and aged appearance made it unrecognizable to the model.'
    }
  ];

  // Slideshow auto-play effect
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

  const metrics = [
    { label: 'mAP@0.5', value: '96.4%', icon: Target },
    { label: 'Precision', value: '92.3%', icon: CheckCircle },
    { label: 'Recall', value: '94.5%', icon: TrendingUp },
    { label: 'FPS', value: '~48', icon: Zap },
    { label: 'Inference', value: '20.86ms', icon: Timer },
    { label: 'mAP@0.5:0.95', value: '85.7%', icon: BarChart3 }
  ];

  const techStack = [
    { name: 'YOLOv8n', category: 'Model' },
    { name: 'Ultralytics', category: 'Framework' },
    { name: 'PyTorch', category: 'Backend' },
    { name: 'Roboflow', category: 'Labeling' },
    { name: 'OpenCV', category: 'Processing' },
    { name: 'Google Colab', category: 'Training' }
  ];

  const challenges = [
    {
      challenge: 'Building a clean dataset from varied clapperboard styles',
      solution: 'Curated 1,288 diverse images including traditional slates, all-black boards, and various orientations'
    },
    {
      challenge: 'Label consistency during manual annotation',
      solution: 'Used Roboflow for standardized bounding box labeling with quality checks'
    },
    {
      challenge: 'Handling false positives on similar objects',
      solution: 'Added hard negatives (whiteboards, clipboards, signs, tablets) to training set'
    },
    {
      challenge: 'Choosing confidence thresholds',
      solution: 'Balanced precision/recall with 0.5 threshold achieving 5.4% FP rate and 2.3% FN rate'
    },
    {
      challenge: 'Real-world video variability',
      solution: 'Trained on varied lighting conditions, motion blur, angles, and partial occlusions'
    }
  ];

  const futureWork = [
    'Expand dataset with more diverse clapperboards and environments',
    'Add temporal smoothing across frames to stabilize detections',
    'Package as a simple API or plugin-style module',
    'Benchmark speed/latency for real-time workflows',
    'Add OCR to extract slate information (scene, take, roll)'
  ];

  return (
    <div className="project-page">
      {/* Navigation */}
      <button className="back-btn" onClick={() => setCurrentPage('projects')}>
        <ChevronLeft />
        Back to Projects
      </button>

      {/* Section 0: Project Header */}
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
              <span className="tag">Roboflow</span>
            </div>
            <div className="header-ctas">
              <a href="https://youtu.be/Bmev1UZnyQY" target="_blank" rel="noopener noreferrer" className="cta-primary">
                <Play />
                Watch Demo
              </a>
              <a href="https://app.roboflow.com/baraka/clapperboard-detector-1f24x/models" target="_blank" rel="noopener noreferrer" className="cta-secondary">
                <Database />
                View Dataset
              </a>
              <a href="https://github.com/Brillar0101/Clapperboard_Detector" target="_blank" rel="noopener noreferrer" className="cta-secondary">
                <Github />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Section 1: Demo */}
      <section className="project-section demo-section">
        <div className="section-header">
          <Film />
          <h2>Demo</h2>
        </div>
        <div className="demo-container glass-card">
          <div className="video-embed">
            <iframe
              src="https://www.youtube.com/embed/Bmev1UZnyQY"
              title="Clapperboard Detection Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <p className="demo-caption">
            Real-time detection overlay showing bounding boxes with confidence scores.
            The model processes footage at 48 FPS, detecting clapperboards across various
            orientations, lighting conditions, and partial occlusions.
          </p>
        </div>
      </section>

      {/* Section 2: The Problem */}
      <section className="project-section">
        <div className="section-header">
          <AlertCircle />
          <h2>The Problem</h2>
        </div>
        <div className="problem-grid">
          <div className="glass-card problem-card">
            <div className="problem-icon">
              <Clock />
            </div>
            <h3>Time-Consuming Manual Process</h3>
            <p>
              Editors spend hours scrubbing through footage to find clapperboard moments
              for syncing audio, organizing takes, and logging scenes. This is especially
              painful with high-volume interview or multi-camera shoots.
            </p>
          </div>
          <div className="glass-card problem-card">
            <div className="problem-icon">
              <Workflow />
            </div>
            <h3>Workflow Friction</h3>
            <p>
              Manual scanning interrupts creative flow and introduces human error.
              Missed slates mean re-work, and inconsistent logging creates chaos
              in post-production pipelines.
            </p>
          </div>
          <div className="glass-card problem-card success-card">
            <div className="problem-icon success">
              <CheckCircle />
            </div>
            <h3>What Success Looks Like</h3>
            <p>
              Automatic detection of clapperboards at ingest, instant timestamp logging,
              and seamless integration with existing NLE workflows. No more manual hunting.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Who Uses This */}
      <section className="project-section">
        <div className="section-header">
          <Users />
          <h2>Who Uses This</h2>
        </div>
        <div className="users-content">
          <div className="glass-card users-card">
            <h3>Target Users</h3>
            <ul className="users-list">
              <li>
                <Film />
                <span>Video editors and assistant editors</span>
              </li>
              <li>
                <Users />
                <span>Post-production teams and supervisors</span>
              </li>
              <li>
                <Building2 />
                <span>Studios processing high volumes of footage</span>
              </li>
              <li>
                <Settings />
                <span>Media asset management administrators</span>
              </li>
            </ul>
          </div>
          <div className="glass-card users-card">
            <h3>Integration Points</h3>
            <ul className="users-list">
              <li>
                <Package />
                <span>Plugin/feature in video editing pipelines</span>
              </li>
              <li>
                <Zap />
                <span>Auto-tagging during footage import</span>
              </li>
              <li>
                <Database />
                <span>Media asset management search/filter</span>
              </li>
              <li>
                <Workflow />
                <span>Automated scene/take logging systems</span>
              </li>
            </ul>
          </div>
          <div className="glass-card users-card companies-card">
            <h3>Companies That Could Use This</h3>
            <div className="company-categories">
              <div className="company-category">
                <span className="category-label">NLE Tools</span>
                <div className="company-logos">
                  <div className="company-card">
                    <div className="company-logo-icon">
                      <img src="/assets/images/logos/premiere.png" alt="Adobe Premiere Pro" style={{width: '56px', height: '56px', objectFit: 'contain'}} />
                    </div>
                    <div className="company-info">
                      <span className="company-name">Premiere Pro</span>
                      <span className="company-url">adobe.com</span>
                    </div>
                  </div>
                  <div className="company-card">
                    <div className="company-logo-icon">
                      <img src="/assets/images/logos/davinci.png" alt="DaVinci Resolve" style={{width: '28px', height: '28px', objectFit: 'contain'}} />
                    </div>
                    <div className="company-info">
                      <span className="company-name">DaVinci Resolve</span>
                      <span className="company-url">blackmagicdesign.com</span>
                    </div>
                  </div>
                  <div className="company-card">
                    <div className="company-logo-icon">
                      <img src="/assets/images/logos/avid.png" alt="Avid Media Composer" style={{width: '28px', height: '28px', objectFit: 'contain'}} />
                    </div>
                    <div className="company-info">
                      <span className="company-name">Avid</span>
                      <span className="company-url">avid.com</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="company-category">
                <span className="category-label">Post-Production Platforms</span>
                <div className="company-logos">
                  <div className="company-card">
                    <div className="company-logo-icon">
                      <img src="/assets/images/logos/frame-io.png" alt="Frame.io" style={{width: '28px', height: '28px', objectFit: 'contain'}} />
                    </div>
                    <div className="company-info">
                      <span className="company-name">Frame.io</span>
                      <span className="company-url">frame.io</span>
                    </div>
                  </div>
                  <div className="company-card">
                    <div className="company-logo-icon">
                      <img src="/assets/images/logos/iconik.png" alt="Iconik" style={{width: '28px', height: '28px', objectFit: 'contain'}} />
                    </div>
                    <div className="company-info">
                      <span className="company-name">Iconik</span>
                      <span className="company-url">iconik.io</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="company-category">
                <span className="category-label">AI Editing Startups</span>
                <div className="company-logos">
                  <div className="company-card">
                    <div className="company-logo-icon">
                      <img src="/assets/images/logos/runway.png" alt="Runway ML" style={{width: '28px', height: '28px', objectFit: 'contain'}} />
                    </div>
                    <div className="company-info">
                      <span className="company-name">Runway</span>
                      <span className="company-url">runwayml.com</span>
                    </div>
                  </div>
                  <div className="company-card">
                    <div className="company-logo-icon">
                      <img src="/assets/images/logos/descript.png" alt="Descript" style={{width: '28px', height: '28px', objectFit: 'contain'}} />
                    </div>
                    <div className="company-info">
                      <span className="company-name">Descript</span>
                      <span className="company-url">descript.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Solution Overview */}
      <section className="project-section">
        <div className="section-header">
          <Lightbulb />
          <h2>My Solution</h2>
        </div>
        <div className="solution-content">
          <div className="pipeline-diagram glass-card">
            <h3>Detection Pipeline</h3>
            <div className="pipeline-steps">
              <div className="pipeline-step">
                <div className="step-number">1</div>
                <div className="step-icon"><Database /></div>
                <div className="step-label">Data Collection</div>
                <div className="step-desc">1,288 diverse images</div>
              </div>
              <div className="pipeline-arrow">
                <ArrowRight />
              </div>
              <div className="pipeline-step">
                <div className="step-number">2</div>
                <div className="step-icon"><Box /></div>
                <div className="step-label">Labeling</div>
                <div className="step-desc">Roboflow annotations</div>
              </div>
              <div className="pipeline-arrow">
                <ArrowRight />
              </div>
              <div className="pipeline-step">
                <div className="step-number">3</div>
                <div className="step-icon"><Cpu /></div>
                <div className="step-label">Training</div>
                <div className="step-desc">YOLOv8n, 100 epochs</div>
              </div>
              <div className="pipeline-arrow">
                <ArrowRight />
              </div>
              <div className="pipeline-step">
                <div className="step-number">4</div>
                <div className="step-icon"><Zap /></div>
                <div className="step-label">Inference</div>
                <div className="step-desc">48 FPS real-time</div>
              </div>
            </div>
          </div>
          <div className="solution-details">
            <div className="glass-card solution-card">
              <h4>Model Type</h4>
              <p>YOLOv8n object detector with ~3.2M parameters, optimized for speed and accuracy balance</p>
            </div>
            <div className="glass-card solution-card">
              <h4>Output Format</h4>
              <p>Bounding box coordinates [x1, y1, x2, y2] with confidence score per detection</p>
            </div>
            <div className="glass-card solution-card">
              <h4>What Makes It Valuable</h4>
              <p>Real-time speed (48 FPS), high accuracy (96.4% mAP), robust to real-world conditions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Build Process */}
      <section className="project-section">
        <div className="section-header">
          <Workflow />
          <h2>Build Process</h2>
        </div>
        <div className="build-process">
          {/* Stage 1: Data Collection */}
          <div className="build-stage glass-card">
            <div className="stage-header">
              <div className="stage-number">1</div>
              <h3>Data Collection</h3>
            </div>
            <div className="stage-content">
              <p>
                Assembled 1,288 images of clapperboards from various sources, ensuring diversity
                in slate styles, orientations, lighting conditions, and environments.
              </p>
              <div className="stage-stats">
                <div className="stat">
                  <span className="stat-value">1,288</span>
                  <span className="stat-label">Total Images</span>
                </div>
                <div className="stat">
                  <span className="stat-value">909</span>
                  <span className="stat-label">Train (71%)</span>
                </div>
                <div className="stat">
                  <span className="stat-value">250</span>
                  <span className="stat-label">Validation (19%)</span>
                </div>
                <div className="stat">
                  <span className="stat-value">129</span>
                  <span className="stat-label">Test (10%)</span>
                </div>
              </div>
              <div className="dataset-features">
                <span className="feature"><CheckCircle /> Traditional clapperboards</span>
                <span className="feature"><CheckCircle /> Upside-down orientations</span>
                <span className="feature"><CheckCircle /> All-black slates</span>
                <span className="feature"><CheckCircle /> Partially visible slates</span>
                <span className="feature"><CheckCircle /> Various lighting conditions</span>
                <span className="feature"><CheckCircle /> Hard negatives included</span>
              </div>
              <div className="project-image">
                <img 
                  src="/assets/images/clapperboard/dataset-grid.png" 
                  alt="Dataset grid showing diverse clapperboard samples"
                />
              </div>
            </div>
          </div>

          {/* Stage 2: Labeling */}
          <div className="build-stage glass-card">
            <div className="stage-header">
              <div className="stage-number">2</div>
              <h3>Labeling with Roboflow</h3>
            </div>
            <div className="stage-content">
              <p>
                Used Roboflow for manual bounding box annotation with quality checks.
                Each clapperboard was precisely labeled with consistent standards across the entire dataset.
              </p>
              <div className="labeling-details">
                <div className="detail-item">
                  <Box />
                  <span>Bounding box annotation</span>
                </div>
                <div className="detail-item">
                  <CheckCircle />
                  <span>Quality verification passes</span>
                </div>
                <div className="detail-item">
                  <Settings />
                  <span>YOLO format export</span>
                </div>
              </div>
              <div className="project-image">
                <img 
                  src="/assets/images/clapperboard/roboflow-labeling.png" 
                  alt="Roboflow labeling interface"
                />
              </div>
              <a 
                href="https://app.roboflow.com/baraka/clapperboard-detector-1f24x/models" 
                target="_blank" 
                rel="noopener noreferrer"
                className="roboflow-link"
              >
                <ExternalLink />
                View Dataset on Roboflow
              </a>
            </div>
          </div>

          {/* Stage 3: Training */}
          <div className="build-stage glass-card">
            <div className="stage-header">
              <div className="stage-number">3</div>
              <h3>Training Pipeline</h3>
            </div>
            <div className="stage-content">
              <p>
                Trained YOLOv8n on Google Colab with T4 GPU for 100 epochs.
                Used cosine annealing learning rate schedule with AdamW optimizer.
              </p>
              <div className="training-config">
                <div className="config-item">
                  <span className="config-label">Framework</span>
                  <span className="config-value">Ultralytics YOLOv8</span>
                </div>
                <div className="config-item">
                  <span className="config-label">Model</span>
                  <span className="config-value">YOLOv8n (~3.2M params)</span>
                </div>
                <div className="config-item">
                  <span className="config-label">Input Size</span>
                  <span className="config-value">640x640</span>
                </div>
                <div className="config-item">
                  <span className="config-label">Epochs</span>
                  <span className="config-value">100</span>
                </div>
                <div className="config-item">
                  <span className="config-label">Optimizer</span>
                  <span className="config-value">AdamW</span>
                </div>
                <div className="config-item">
                  <span className="config-label">LR Schedule</span>
                  <span className="config-value">Cosine Annealing</span>
                </div>
                <div className="config-item">
                  <span className="config-label">Early Stopping</span>
                  <span className="config-value">Patience 20</span>
                </div>
                <div className="config-item">
                  <span className="config-label">Augmentation</span>
                  <span className="config-value">HSV, flip, scale, translate</span>
                </div>
              </div>
              <div className="code-snippet">
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
              <div className="project-image">
                <img 
                  src="/assets/images/clapperboard/training-curves.png" 
                  alt="Training curves showing model performance"
                />
              </div>
            </div>
          </div>

          {/* Stage 4: Inference */}
          <div className="build-stage glass-card">
            <div className="stage-header">
              <div className="stage-number">4</div>
              <h3>Inference & Output</h3>
            </div>
            <div className="stage-content">
              <p>
                Model runs inference at 48 FPS on GPU, outputting bounding boxes with confidence scores.
                Configurable thresholds for confidence and IoU allow tuning for specific use cases.
              </p>
              <div className="code-snippet">
                <div className="code-header">
                  <Code2 />
                  <span>Detection API</span>
                </div>
                <pre>
{`from src.detect_clapperboard import detect_clapperboard
import cv2

frame = cv2.imread('test_image.jpg')
result = detect_clapperboard(frame, conf_thresh=0.5)

if result['has_clapperboard']:
    for det in result['detections']:
        print(f"Confidence: {det['confidence']:.2f}")
        print(f"BBox: {det['bbox']}")`}
                </pre>
              </div>
              <div className="output-format glass-card">
                <h4>Output Format</h4>
                <pre>
{`{
  "has_clapperboard": true,
  "detections": [
    {
      "bbox": [x1, y1, x2, y2],
      "confidence": 0.94
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Results */}
      <section className="project-section">
        <div className="section-header">
          <BarChart3 />
          <h2>Results</h2>
        </div>
        <div className="results-content">
          {/* Metrics Grid */}
          <div className="metrics-grid">
            {metrics.map((metric, index) => (
              <div key={index} className="glass-card metric-card">
                <metric.icon />
                <span className="metric-value">{metric.value}</span>
                <span className="metric-label">{metric.label}</span>
              </div>
            ))}
          </div>

          {/* Test Case Results Summary */}
          <div className="glass-card test-summary">
            <h3>Test Case Results</h3>
            <div className="test-summary-grid">
              <div className="test-stat">
                <span className="test-stat-value">133</span>
                <span className="test-stat-label">Total Images Processed</span>
              </div>
              <div className="test-stat positive">
                <span className="test-stat-value">111</span>
                <span className="test-stat-label">True Positives (Clapperboards Detected)</span>
              </div>
              <div className="test-stat positive">
                <span className="test-stat-value">22</span>
                <span className="test-stat-label">True Negatives (Correctly Ignored)</span>
              </div>
              <div className="test-stat highlight">
                <span className="test-stat-value">128/133</span>
                <span className="test-stat-label">Correct Classifications</span>
              </div>
              <div className="test-stat highlight">
                <span className="test-stat-value">91.4%</span>
                <span className="test-stat-label">Average Confidence</span>
              </div>
              <div className="test-stat">
                <span className="test-stat-value">49.6ms</span>
                <span className="test-stat-label">Average Inference Time</span>
              </div>
            </div>
            <div className="detection-rate-bar">
              <span className="rate-label">Accuracy Rate</span>
              <div className="rate-bar-container">
                <div className="rate-bar-fill" style={{ width: '96.2%' }}></div>
              </div>
              <span className="rate-value">96.2%</span>
            </div>
          </div>

          {/* Test Results Slideshow */}
          <div className="glass-card slideshow-container">
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
              <button 
                className="control-btn" 
                onClick={() => setSlideSpeed(Math.min(slideSpeed + 500, 5000))}
                title="Slower"
              >
                <Rewind />
              </button>
              <button 
                className="control-btn"
                onClick={prevSlide}
                title="Previous"
              >
                <SkipBack />
              </button>
              <button 
                className={`control-btn play-btn ${isPlaying ? 'playing' : ''}`}
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause /> : <Play />}
              </button>
              <button 
                className="control-btn"
                onClick={nextSlide}
                title="Next"
              >
                <SkipForward />
              </button>
              <button 
                className="control-btn" 
                onClick={() => setSlideSpeed(Math.max(slideSpeed - 500, 500))}
                title="Faster"
              >
                <FastForward />
              </button>
            </div>
            
            <div className="speed-indicator">
              Speed: {(slideSpeed / 1000).toFixed(1)}s per image
            </div>
          </div>

          {/* Failure Cases Analysis */}
          <div className="glass-card failure-analysis">
            <h3>
              <XCircle />
              Unsuccessful Outcomes Analysis
            </h3>
            <p className="failure-intro">
              The model achieved <strong>96.2% accuracy</strong> (128/133 correct classifications), successfully detecting 
              most true positives and correctly ignoring true negatives. However, there were <strong>5 failures</strong> 
              that highlight areas for improvement.
            </p>
            
            <div className="failure-gallery-viewer">
              <button className="failure-nav prev" onClick={prevFailure}>
                <ChevronLeft />
              </button>
              
              <div className="failure-content">
                <div className="failure-image-container">
                  <img 
                    src={failureCases[failureIndex]?.src} 
                    alt={failureCases[failureIndex]?.alt}
                    onClick={() => openLightbox(failureCases[failureIndex]?.src, failureCases[failureIndex]?.alt)}
                  />
                </div>
                <div className="failure-details">
                  <div className="failure-counter">
                    Case {failureIndex + 1} of {failureCases.length}
                  </div>
                  <h4>{failureCases[failureIndex]?.alt}</h4>
                  <p>{failureCases[failureIndex]?.description}</p>
                </div>
              </div>
              
              <button className="failure-nav next" onClick={nextFailure}>
                <ChevronRight />
              </button>
            </div>
            
            <div className="failure-dots">
              {failureCases.map((_, index) => (
                <button 
                  key={index}
                  className={`failure-dot ${index === failureIndex ? 'active' : ''}`}
                  onClick={() => setFailureIndex(index)}
                />
              ))}
            </div>
            
            <div className="failure-summary">
              <h4>Failure Categories</h4>
              <ul>
                <li><XCircle /> <strong>False Negatives:</strong> Missed clapperboards due to blur, occlusion, unusual angles, or vintage appearance (3 cases)</li>
                <li><XCircle /> <strong>False Positives:</strong> Incorrectly detected tablets/iPads as clapperboards (1 case)</li>
                <li><XCircle /> <strong>Partial Detection:</strong> Detected one clapperboard but missed another in same frame (1 case)</li>
              </ul>
            </div>
          </div>

          {/* Visual Results */}
          <div className="visual-results">
            <div className="glass-card">
              <h3>Confusion Matrix</h3>
              <div className="project-image">
                <img 
                  src="/assets/images/clapperboard/confusion-matrix.png" 
                  alt="Confusion matrix showing model predictions"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Challenges & Lessons */}
      <section className="project-section">
        <div className="section-header">
          <Lightbulb />
          <h2>Challenges & Lessons Learned</h2>
        </div>
        <div className="challenges-content">
          <div className="challenges-list">
            {challenges.map((item, index) => (
              <div key={index} className="glass-card challenge-card">
                <div className="challenge-header">
                  <AlertCircle />
                  <h4>Challenge</h4>
                </div>
                <p className="challenge-text">{item.challenge}</p>
                <div className="solution-header">
                  <CheckCircle />
                  <h4>Solution</h4>
                </div>
                <p className="solution-text">{item.solution}</p>
              </div>
            ))}
          </div>

          <div className="glass-card future-card">
            <h3>
              <ArrowRight />
              If I Had 2 More Weeks
            </h3>
            <ul className="future-list">
              {futureWork.map((item, index) => (
                <li key={index}>
                  <span className="future-bullet"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Section 8: Tech Stack */}
      <section className="project-section">
        <div className="section-header">
          <Layers />
          <h2>Tech Stack</h2>
        </div>
        <div className="tech-stack-grid">
          {techStack.map((tech, index) => (
            <div key={index} className="glass-card tech-card">
              <span className="tech-category">{tech.category}</span>
              <span className="tech-name">{tech.name}</span>
            </div>
          ))}
        </div>
        <div className="glass-card requirements-card">
          <h3>Requirements</h3>
          <div className="requirements-list">
            <code>ultralytics&gt;=8.0.0</code>
            <code>torch&gt;=2.0.0</code>
            <code>torchvision&gt;=0.15.0</code>
            <code>opencv-python&gt;=4.8.0</code>
            <code>numpy&gt;=1.24.0</code>
            <code>Pillow&gt;=10.0.0</code>
          </div>
        </div>
      </section>

      {/* Section 9: Links & Contact */}
      <section className="project-section links-section">
        <div className="section-header">
          <ExternalLink />
          <h2>Links</h2>
        </div>
        <div className="links-grid">
          <a 
            href="https://github.com/Brillar0101/Clapperboard_Detector" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card link-card"
          >
            <Github />
            <span>GitHub Repository</span>
            <ExternalLink className="external-icon" />
          </a>
          <a 
            href="https://youtu.be/Bmev1UZnyQY" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card link-card"
          >
            <Play />
            <span>Demo Video</span>
            <ExternalLink className="external-icon" />
          </a>
          <a 
            href="https://app.roboflow.com/baraka/clapperboard-detector-1f24x/models" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card link-card"
          >
            <Database />
            <span>Dataset on Roboflow</span>
            <ExternalLink className="external-icon" />
          </a>
        </div>

        <div className="glass-card contact-cta">
          <h3>Interested in this project?</h3>
          <p>I'm open to discussing collaborations, opportunities, or technical details.</p>
          <button className="cta-primary" onClick={() => setCurrentPage('contact')}>
            <Mail />
            Get in Touch
          </button>
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

import React, { useState } from 'react';
import {
  Video,
  Cpu,
  Users,
  Eye,
  CircleDot,
  Layout,
  BarChart3,
  ArrowRight,
  Brain,
  Scan,
  Layers,
  Activity,
  MapPin
} from 'lucide-react';
import './DiagramStyles.css';

const MLPipelineDiagram = () => {
  const [hoveredStage, setHoveredStage] = useState(null);

  // Updated to match actual development progress
  const pipelineStages = [
    {
      id: 'input',
      label: 'INPUT',
      name: 'Video Frame',
      color: '#6366F1',
      icon: Video,
      details: ['1920x1080 Resolution', '30 FPS Input', 'MP4/MOV Format'],
      output: 'Raw Frame'
    },
    {
      id: 'detection',
      label: 'STAGE 1',
      name: 'YOLO Detection',
      color: '#0A84FF',
      icon: Scan,
      details: ['Player Detection', 'Referee Detection', 'Per-Frame Analysis'],
      output: 'Bounding Boxes',
      status: 'done'
    },
    {
      id: 'tracking',
      label: 'STAGE 2',
      name: 'SAM2 Tracking',
      color: '#00D4AA',
      icon: Layers,
      details: ['Continuous Tracking', 'Segmentation Masks', 'Frame-to-Frame'],
      output: 'Tracked Objects',
      status: 'done'
    },
    {
      id: 'classification',
      label: 'STAGE 3',
      name: 'Team Classification',
      color: '#A855F7',
      icon: Users,
      details: ['Color Analysis', 'Red/Green Teams', 'Yellow Referees'],
      output: 'Team Labels',
      status: 'done'
    },
    {
      id: 'homography',
      label: 'STAGE 4',
      name: 'Tactical View',
      color: '#14B8A6',
      icon: MapPin,
      details: ['Court Keypoints', 'Homography Transform', '2D Court Mapping'],
      output: 'Court Positions',
      status: 'done'
    },
    {
      id: 'ocr',
      label: 'STAGE 5',
      name: 'Jersey OCR',
      color: '#EC4899',
      icon: Eye,
      details: ['SmolVLM2 VLM', 'Number Recognition', 'In Progress'],
      output: 'Jersey Numbers',
      status: 'in-progress'
    },
    {
      id: 'output',
      label: 'OUTPUT',
      name: 'Analytics',
      color: '#8B5CF6',
      icon: BarChart3,
      details: ['Tactical 2D View', 'Player Positions', 'Team Tracking'],
      output: 'Final Results'
    }
  ];

  const StageCard = ({ stage, index }) => {
    const Icon = stage.icon;
    const isHovered = hoveredStage === stage.id;

    return (
      <div
        className={`ml-stage-card ${isHovered ? 'hovered' : ''} ${stage.status === 'in-progress' ? 'in-progress' : ''}`}
        style={{ '--stage-color': stage.color }}
        onMouseEnter={() => setHoveredStage(stage.id)}
        onMouseLeave={() => setHoveredStage(null)}
      >
        <div className="ml-stage-header">
          <span className="ml-stage-label">{stage.label}</span>
          <div className="ml-stage-icon" style={{ background: stage.color }}>
            <Icon size={20} />
          </div>
        </div>
        <div className="ml-stage-name">{stage.name}</div>
        <div className="ml-stage-details">
          {stage.details.map((detail, idx) => (
            <div key={idx} className="ml-stage-detail">
              <span className="ml-detail-dot" style={{ background: stage.color }}></span>
              {detail}
            </div>
          ))}
        </div>
        <div className="ml-stage-output">
          <ArrowRight size={14} />
          <span>{stage.output}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="ml-pipeline-container">
      <div className="ml-pipeline-header">
        <div className="ml-pipeline-title">
          <Brain size={24} />
          <h3>Computer Vision Pipeline</h3>
        </div>
        <div className="ml-pipeline-subtitle">
          YOLO + SAM2 + SmolVLM2 • PyTorch + OpenCV
        </div>
      </div>

      {/* Main Pipeline Flow */}
      <div className="ml-pipeline-flow">
        {pipelineStages.map((stage, index) => (
          <React.Fragment key={stage.id}>
            <StageCard stage={stage} index={index} />
            {index < pipelineStages.length - 1 && (
              <div className="ml-flow-connector">
                <ArrowRight size={20} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Model Summary - Updated to match actual models */}
      <div className="ml-models-summary">
        <div className="ml-summary-title">Models Used</div>
        <div className="ml-summary-items">
          <div className="ml-summary-item" style={{ '--item-color': '#0A84FF' }}>
            <span className="ml-summary-name">YOLO</span>
            <span className="ml-summary-task">Detection</span>
          </div>
          <div className="ml-summary-item" style={{ '--item-color': '#00D4AA' }}>
            <span className="ml-summary-name">SAM2</span>
            <span className="ml-summary-task">Tracking</span>
          </div>
          <div className="ml-summary-item" style={{ '--item-color': '#14B8A6' }}>
            <span className="ml-summary-name">Homography</span>
            <span className="ml-summary-task">Court Mapping</span>
          </div>
          <div className="ml-summary-item" style={{ '--item-color': '#EC4899' }}>
            <span className="ml-summary-name">SmolVLM2</span>
            <span className="ml-summary-task">Jersey OCR</span>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="ml-performance-bar">
        <div className="ml-perf-item">
          <Activity size={16} />
          <span>Variable</span>
          <span className="ml-perf-label">FPS (GPU dependent)</span>
        </div>
        <div className="ml-perf-item">
          <Cpu size={16} />
          <span>GPU Required</span>
          <span className="ml-perf-label">For Real-time</span>
        </div>
        <div className="ml-perf-item">
          <Video size={16} />
          <span>1080p</span>
          <span className="ml-perf-label">Input Resolution</span>
        </div>
      </div>
    </div>
  );
};

export default MLPipelineDiagram;

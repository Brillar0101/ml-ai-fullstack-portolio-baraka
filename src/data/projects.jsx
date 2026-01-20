import { Camera, Layers } from 'lucide-react';

// Custom Basketball Icon
const Basketball = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v20" />
    <path d="M2 12h20" />
    <path d="M4.93 4.93c4.08 2.4 6.93 6.6 7.07 11.57" />
    <path d="M19.07 4.93c-4.08 2.4-6.93 6.6-7.07 11.57" />
  </svg>
);

export const PROJECTS = [
  {
    id: "swishvision",
    title: "SwishVision",
    shortDesc: "AI-powered basketball analytics platform using YOLO, SAM2, and SmolVLM2 for player tracking and game analysis",
    icon: Basketball,
    tags: ["PyTorch", "YOLO", "SAM2", "FastAPI", "Next.js"],
    gradient: "linear-gradient(135deg, #0A84FF 0%, #40A9FF 100%)",
    featured: true,
    route: "/projects/swishvision"
  },
  {
    id: "clapperboard-detector",
    title: "Clapperboard Detector Model",
    shortDesc: "YOLOv8n detection system achieving 96.4% mAP@0.5 at 48 FPS for video production workflows",
    icon: Camera,
    tags: ["YOLOv8", "Object Detection", "Roboflow", "OpenCV"],
    gradient: "linear-gradient(135deg, #0A84FF 0%, #40A9FF 100%)",
    featured: false,
    route: "/projects/clapperboard"
  },
  {
    id: "psiv-rentals",
    title: "PSIV Rentals",
    shortDesc: "Full-stack equipment rental platform with React Native mobile app, Node.js backend, and admin dashboard",
    icon: Layers,
    tags: ["React Native", "Node.js", "PostgreSQL", "Stripe"],
    gradient: "linear-gradient(135deg, #0A84FF 0%, #40A9FF 100%)",
    featured: false,
    route: "/projects/psiv-rentals"
  }
];

export const SKILLS = [
  { name: "Python", icon: "Code2" },
  { name: "TensorFlow", icon: "Brain" },
  { name: "PyTorch", icon: "Cpu" },
  { name: "Computer Vision", icon: "Camera" },
  { name: "React", icon: "Globe" },
  { name: "Node.js", icon: "Database" }
];

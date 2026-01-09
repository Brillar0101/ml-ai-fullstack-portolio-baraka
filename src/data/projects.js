import { Activity, Camera, Layers } from 'lucide-react';

export const PROJECTS = [
  {
    id: "swishvision",
    title: "SwishVision",
    shortDesc: "AI-powered basketball analytics platform using YOLO, SAM2, and SmolVLM2 for player tracking and game analysis",
    icon: Activity,
    tags: ["PyTorch", "YOLO", "SAM2", "FastAPI", "Next.js"],
    gradient: "linear-gradient(135deg, #FF6B35 0%, #FF8A5C 100%)",
    featured: true,
    route: "swishvision-project"
  },
  {
    id: "clapperboard-detector",
    title: "Clapperboard Detector Model",
    shortDesc: "YOLOv8n detection system achieving 96.4% mAP@0.5 at 48 FPS for video production workflows",
    icon: Camera,
    tags: ["YOLOv8", "Object Detection", "Roboflow", "OpenCV"],
    gradient: "linear-gradient(135deg, #FF6B35 0%, #FF8A5C 100%)",
    featured: false,
    route: "clapperboard-project"
  },
  {
    id: "psiv-rentals",
    title: "PSIV Rentals",
    shortDesc: "Full-stack equipment rental platform with React Native mobile app, Node.js backend, and admin dashboard",
    icon: Layers,
    tags: ["React Native", "Node.js", "PostgreSQL", "Stripe"],
    gradient: "linear-gradient(135deg, #FF6B35 0%, #FF8A5C 100%)",
    featured: false,
    route: "psiv-rentals-project"
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

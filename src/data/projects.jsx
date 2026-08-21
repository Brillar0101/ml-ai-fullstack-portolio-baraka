import { Camera, Layers, Cpu, Crosshair, Music, Radio, Keyboard, CircuitBoard } from 'lucide-react';

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

export const CATEGORIES = [
  { id: 'all', label: 'All Projects' },
  { id: 'ml-ai', label: 'ML / AI' },
  { id: 'embedded', label: 'Embedded Systems' },
  { id: 'hardware', label: 'Hardware Design' }
];

export const PROJECTS = [
  {
    id: "swishvision",
    title: "SwishVision",
    shortDesc: "AI-powered basketball analytics platform using YOLO, SAM2, and SmolVLM2 for player tracking and game analysis",
    icon: Basketball,
    tags: ["PyTorch", "YOLO", "SAM2", "FastAPI", "Next.js"],
    category: "ml-ai",
    featured: true,
    route: "/projects/swishvision"
  },
  {
    id: "clapperboard-detector",
    title: "Clapperboard Detector Model",
    shortDesc: "YOLOv8n detection system achieving 96.4% mAP@0.5 at 48 FPS for video production workflows",
    icon: Camera,
    tags: ["YOLOv8", "Object Detection", "Roboflow", "OpenCV"],
    category: "ml-ai",
    featured: false,
    route: "/projects/clapperboard"
  },
  {
    id: "psiv-rentals",
    title: "PSIV Rentals",
    shortDesc: "Full-stack equipment rental platform with React Native mobile app, Node.js backend, and admin dashboard",
    icon: Layers,
    tags: ["React Native", "Node.js", "PostgreSQL", "Stripe"],
    category: "ml-ai",
    featured: false,
    route: "/projects/psiv-rentals"
  },
  {
    id: "pixel-monarch",
    title: "Pixel Monarch",
    shortDesc: "Kingdom management game on MSP432 LaunchPad with LCD graphics, UART communication, and hardware abstraction layer",
    icon: Cpu,
    tags: ["MSP432", "C", "UART", "SPI", "LCD", "Embedded"],
    category: "embedded",
    featured: true,
    visible: false,
    route: "/projects/pixel-monarch"
  },
  {
    id: "touhou",
    title: "Touhou",
    shortDesc: "Bullet hell shooter on MSP432 with 6 enemy firing patterns, joystick control, power ups, and custom sprite rendering on 128x128 LCD",
    icon: Crosshair,
    tags: ["MSP432", "C", "ADC14", "SPI", "LCD", "Timer32"],
    category: "embedded",
    featured: true,
    route: "/projects/touhou"
  },
  {
    id: "16bit-alu",
    title: "16 Bit Arithmetic Logic Unit",
    shortDesc: "16-bit ALU designed for ECE 2544",
    icon: Cpu,
    tags: ["ECE 2544"],
    category: "hardware",
    featured: false,
    status: "in-development",
    visible: false,
    route: "/projects/16bit-alu"
  },
  {
    id: "3-filter-audio",
    title: "3 Filter Audio System",
    shortDesc: "3 filter audio system developed for IDP",
    icon: Music,
    tags: ["IDP"],
    category: "hardware",
    featured: false,
    status: "in-development",
    visible: false,
    route: "/projects/3-filter-audio"
  },
  {
    id: "neuralcard",
    title: "NeuralCard",
    shortDesc: "Credit-card-sized PCB that runs a neural network: ESP32-S3, a 6-axis IMU, and 24 charlieplexed LEDs wired as the network itself",
    icon: CircuitBoard,
    tags: ["KiCad", "ESP32-S3", "Embedded ML", "C"],
    category: "hardware",
    featured: true,
    route: "/projects/neuralcard"
  },
  {
    id: "agentdeck",
    title: "AgentDeck",
    shortDesc: "RP2040 macropad for supervising AI coding agents: 13 hot-swap keys with per-key RGB, an encoder, a joystick, and a 4-layer PCB",
    icon: Keyboard,
    tags: ["KiCad", "RP2040", "CircuitPython"],
    category: "hardware",
    featured: false,
    route: "/projects/agentdeck"
  },
  {
    id: "uhf-rfid-reader",
    title: "UHF RFID Reader",
    shortDesc: "UHF Gen2 RFID reader that inventories tags and estimates how far each one is with an on-device model (ESP32-S3 + MagicRF M100)",
    icon: Radio,
    tags: ["KiCad", "ESP32-S3", "RFID", "RF PCB"],
    category: "hardware",
    featured: false,
    route: "/projects/uhf-rfid-reader"
  }
];

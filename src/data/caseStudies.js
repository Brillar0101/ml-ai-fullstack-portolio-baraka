// Case-study content in the `project-writeup` skill's JSON shape.
// Renderable fields per section / step: body, bullets[], code + codeLabel,
// image + imageAlt, images[] (gallery), tags[], caption. Sections with no
// content are left out. Prose is written to read like a person wrote it
// (no em dashes, real numbers kept verbatim).

const SLIDE = (name) => `/assets/images/clapperboard/result_slideshow/${name}.jpg`;

// Registry: maps a project route slug (the part after /projects/) to its
// case-study data. A project appears in the new template once it's listed here.
// Populated at the bottom of this file.
export const caseStudies = {};

export const clapperboardCaseStudy = {
  id: 'clapperboard',
  eyebrow: 'ML / AI',
  context: 'Cocreate Slate Detection Challenge',
  headline: 'A clapperboard detector that runs at 48 FPS',
  subhead:
    'A small YOLOv8 model that finds the slate in raw footage so editors stop scrubbing through takes by hand. 96.4% mAP at real-time speed.',
  cover: '/assets/images/clapperboard/good-case-3.png',
  metrics: [
    { value: '96.4%', label: 'mAP@0.5' },
    { value: '94.5%', label: 'recall' },
    { value: '92.3%', label: 'precision' },
    { value: '48 FPS', label: 'real-time speed' },
  ],
  sections: [
    {
      type: 'introduction',
      title: 'Introduction',
      body:
        'Editors line up takes using the clapperboard, and on a long shoot that means scrubbing through hours of footage to find every slate. This model watches the video and marks each clapperboard as it appears, so the sync points and take boundaries are already logged before anyone opens the timeline. It runs on YOLOv8n at about 48 FPS, which is fast enough to process footage rather than single frames.',
    },
    {
      type: 'problem',
      title: 'The problem',
      body:
        'Finding slates by hand is slow and easy to get wrong, and that cost repeats on every shoot. The goal was automatic detection at ingest, with a timestamp logged the moment a clapperboard shows up.',
      bullets: [
        'Editors spend hours scrubbing footage to find clapperboard moments for syncing audio and organizing takes.',
        'Manual scanning breaks creative flow and lets human error into post-production.',
        'Target: detect the slate automatically at ingest and log the timestamp instantly.',
      ],
    },
    {
      type: 'audience',
      title: "Who it's for",
      bullets: [
        'Video editors and assistant editors on film, TV, and commercial work.',
        'Post-production teams managing large pipelines.',
        'Studios processing high volumes of footage daily.',
        'Media asset systems that need footage searchable and filterable.',
      ],
    },
    {
      type: 'process',
      title: 'How it was built',
      steps: [
        {
          title: 'Collecting the data',
          body:
            'I assembled 1,288 clapperboard images and split them 909 / 250 / 129 for training, validation, and test. The set covers traditional slates, all-black boards, and a range of orientations. I deliberately mixed in hard negatives like whiteboards, clipboards, and tablets, since those are exactly what a naive detector trips on.',
          bullets: [
            '909 training images (71%)',
            '250 validation images (19%)',
            '129 test images (10%)',
            'Traditional slates, all-black boards, mixed orientations',
            'Hard negatives included: whiteboards, clipboards, tablets',
          ],
          image: '/assets/images/clapperboard/dataset-grid.png',
          imageAlt: 'Grid of diverse clapperboard samples from the dataset',
        },
        {
          title: 'Labeling in Roboflow',
          body:
            'Every image got a manual bounding box in Roboflow, with a second pass to check label quality before exporting to YOLO format. Consistent boxes matter more than people expect here, because sloppy labels show up later as confident wrong detections.',
          bullets: ['Bounding box annotation', 'Quality verification pass', 'Export to YOLO format'],
          image: '/assets/images/clapperboard/roboflow-labeling.png',
          imageAlt: 'Roboflow labeling interface with a clapperboard annotated',
        },
        {
          title: 'Training the model',
          body:
            'I trained YOLOv8n (about 3.2M parameters) for 100 epochs at 640x640 with AdamW and cosine annealing, plus HSV, flip, scale, and translate augmentation. Nano was a deliberate choice: a larger model would add a point or two of mAP but drop the frame rate below what video needs, and 48 FPS was the target.',
          bullets: [
            'Framework: Ultralytics YOLOv8',
            'Model: YOLOv8n (~3.2M params)',
            'Input size: 640x640, 100 epochs',
            'Optimizer: AdamW with cosine annealing',
            'Augmentation: HSV, flip, scale, translate',
          ],
          code: `from ultralytics import YOLO

model = YOLO('yolov8n.pt')
results = model.train(
    data='dataset/training_ready/data.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    patience=20
)`,
          codeLabel: 'Training command',
          image: '/assets/images/clapperboard/training-curves.png',
          imageAlt: 'Training curves for the YOLOv8n run',
        },
      ],
    },
    {
      type: 'results',
      title: 'Results',
      body:
        'On the 133-frame test set the model reached 96.4% mAP@0.5 with 92.3% precision and 94.5% recall, running at roughly 48 FPS (20.86ms per frame). Of those frames it called 111 true positives and 22 true negatives for 96.2% accuracy. The clean true negatives matter as much as the hits, because a detector that fires on every bright rectangle is useless in an edit. At a 0.5 confidence threshold the false-positive rate sat at 5.4%.',
      bullets: [
        'mAP@0.5: 96.4%  ·  precision: 92.3%  ·  recall: 94.5%',
        'Speed: ~48 FPS (20.86ms inference per frame)',
        '133 test frames: 111 true positives, 22 true negatives, 96.2% accuracy',
        'False-positive rate: 5.4% at a 0.5 confidence threshold',
      ],
      images: [
        { src: SLIDE('result_pos_0025'), alt: 'True positive: clapperboard detected', caption: 'True positive' },
        { src: SLIDE('result_pos_0033'), alt: 'True positive: clapperboard detected', caption: 'True positive' },
        { src: SLIDE('result_pos_0052'), alt: 'True positive: clapperboard detected', caption: 'True positive' },
        { src: SLIDE('result_pos_0063'), alt: 'True positive: clapperboard detected', caption: 'True positive' },
        { src: SLIDE('result_neg_0000'), alt: 'True negative: correctly ignored', caption: 'True negative' },
        { src: SLIDE('result_neg_0006'), alt: 'True negative: correctly ignored', caption: 'True negative' },
      ],
      image: '/assets/images/clapperboard/confusion-matrix.png',
      imageAlt: 'Confusion matrix for the test set',
    },
    {
      type: 'gallery',
      title: 'Where it failed',
      body:
        'The failures were the useful part. Across the test set there were three false negatives from blur, occlusion, or a vintage look, one false positive where an iPad read as a slate at 87.3% confidence, and one partial case where it caught one board but missed a second in the same frame. Most of this traces back to gaps in the training data rather than the model itself.',
      images: [
        { src: SLIDE('result_neg_0016'), alt: 'iPad detected as a clapperboard', caption: 'False positive: an iPad read as a slate at 87.3% confidence.' },
        { src: SLIDE('result_pos_0105'), alt: 'Missed a motion-blurred clapperboard', caption: 'False negative: missed a slate smeared by motion blur.' },
        { src: SLIDE('result_pos_0020'), alt: 'Missed a vintage black and white slate', caption: 'False negative: missed an old black and white board.' },
        { src: SLIDE('result_pos_0081'), alt: 'Missed a held clapperboard', caption: 'False negative: missed a slate a person was holding.' },
        { src: SLIDE('result_pos_0100'), alt: 'Caught one of two clapperboards', caption: 'Partial: caught one board, missed the second in frame.' },
      ],
    },
    {
      type: 'conclusion',
      title: 'What I learned and what is next',
      body:
        'The model is reliable on common digital and chalk slates and gives back clean true negatives, which is what makes it safe to drop into an edit. The weak spots are blur and clapperboard styles that were rare in training. Adding hard negatives early was the single change that cut false positives the most. The next version needs more of the hard cases and a move from single frames to full clips.',
      bullets: [
        'Expand the dataset with blur, vintage boards, and multi-slate frames',
        'Add temporal smoothing so detections are stable across frames',
        'Wrap it in an API or editor plugin module',
        'Add OCR to read scene and take info off the slate',
      ],
    },
    {
      type: 'extra',
      title: 'Tech stack',
      tags: ['YOLOv8n', 'Ultralytics', 'PyTorch', 'Roboflow', 'OpenCV', 'Google Colab'],
    },
  ],
  cta: [
    { label: 'View code', href: 'https://github.com/Brillar0101/Clapperboard_Detector', primary: true },
    { label: 'Watch demo', href: 'https://youtu.be/Bmev1UZnyQY', primary: false },
    { label: 'Dataset on Roboflow', href: 'https://app.roboflow.com/baraka/clapperboard-detector-1f24x/models', primary: false },
  ],
  // Demo video embedded near the top of the page (replaces the old standalone page).
  video: 'https://www.youtube.com/embed/Bmev1UZnyQY',
};

// =====================================================================
// SwishVision
// =====================================================================
const SV = (dir, name) => `/assets/images_sv/${dir}/${name}.jpg`;

export const swishVisionCaseStudy = {
  id: 'swishvision',
  eyebrow: 'ML / AI',
  context: 'Solo project · building since August 2025',
  headline: 'Player tracking and a live tactical view from game film',
  subhead:
    'AI basketball analytics for college programs that cannot pay $50K to $100K a year for the enterprise tools. It pulls player tracking, team colors, and a 2D court view straight from game video.',
  video: 'https://www.youtube.com/embed/oqUrfFeTF88',
  metrics: [
    { value: '5', label: 'ML models in the pipeline' },
    { value: '4', label: 'tracking stages live' },
    { value: '$50K+/yr', label: 'what rival tools cost' },
  ],
  sections: [
    {
      type: 'introduction',
      title: 'Introduction',
      body:
        'Coaches spend hours combing through game footage to track players, shots, and tactics. The tools that automate this cost more than most college programs can spend. SwishVision does the same job from ordinary game video at a price a college team can actually afford, and it is being built solo with Virginia Tech Athletics as the pilot target.',
    },
    {
      type: 'problem',
      title: 'The problem',
      body:
        'The analytics that pro teams rely on are priced for pro budgets, so most college programs go without and fall back on manual film study.',
      bullets: [
        'Second Spectrum costs $100K+/year (NBA official partner).',
        'Synergy Sports costs $50K+/year for pro and college.',
        'Hudl runs about $10K+/year for basic analytics.',
        'Coaches spend hours manually reviewing footage to track movement, shots, and patterns.',
      ],
    },
    {
      type: 'audience',
      title: "Who it's for",
      bullets: [
        'College basketball programs across NCAA D1, D2, and D3.',
        'Coaching staff preparing for games and scouting opponents.',
        'Team analysts tracking performance and efficiency.',
        'Player development coordinators.',
      ],
    },
    {
      type: 'process',
      title: 'How it works',
      steps: [
        {
          title: 'Player detection with YOLO',
          body:
            'YOLO handles the first pass, finding players and referees in each frame. It is solid frame by frame, but on its own it could not hold a track on the same player from one frame to the next.',
          images: [
            { src: SV('playerdetection', 'playerdetection_frame_01'), alt: 'Player detection frame 1', caption: 'Detected players and referees' },
            { src: SV('playerdetection', 'playerdetection_frame_02'), alt: 'Player detection frame 2', caption: 'Detected players and referees' },
            { src: SV('playerdetection', 'playerdetection_frame_03'), alt: 'Player detection frame 3', caption: 'Detected players and referees' },
          ],
        },
        {
          title: 'Continuous tracking with SAM2',
          body:
            'Adding SAM2 (Segment Anything Model 2) carried detections across frames, so a player keeps the same identity through a clip. The open issue is that anyone missed in the first frame stays missing for the rest of it, which I am still working on.',
          images: [
            { src: SV('playerdetection_tracked', 'playertracking_frame_01'), alt: 'Continuous tracking frame 1', caption: 'Tracked across frames' },
            { src: SV('playerdetection_tracked', 'playertracking_frame_02'), alt: 'Continuous tracking frame 2', caption: 'Tracked across frames' },
            { src: SV('playerdetection_tracked', 'playertracking_frame_03'), alt: 'Continuous tracking frame 3', caption: 'Tracked across frames' },
          ],
        },
        {
          title: 'Tactical 2D view with homography',
          body:
            'A homography transform maps the players onto a 2D court, giving a live minimap of where everyone is. Players are color coded by team, red for one side and green for the other, with yellow for referees.',
          images: [
            { src: SV('tactical_view', 'tracking_frame_01'), alt: 'Tactical 2D court view frame 1', caption: '2D court minimap' },
            { src: SV('tactical_view', 'tracking_frame_02'), alt: 'Tactical 2D court view frame 2', caption: '2D court minimap' },
            { src: SV('tactical_view', 'tracking_frame_03'), alt: 'Tactical 2D court view frame 3', caption: '2D court minimap' },
          ],
        },
        {
          title: 'Reading jersey numbers with SmolVLM2',
          body:
            'SmolVLM2, a vision-language model, reads jersey numbers for identity. It does well when a number is clearly in view, but it guesses when the number is hidden, which throws off tracking. Tightening that up is the current focus.',
        },
      ],
    },
    {
      type: 'conclusion',
      title: 'Where it stands and what is next',
      body:
        'Phase one is working: player tracking, team classification, and the tactical view. The hardest constraint right now is compute, since running YOLO, SAM2, and SmolVLM2 over video needs real GPU time and that slows down how fast I can iterate. Next comes the analysis layer.',
      bullets: [
        'Shot detection and possession tracking',
        'Automatic play-by-play breakdown',
        'Real-time processing of a live stream',
        'Player movement heatmaps and speed tracking',
      ],
    },
    {
      type: 'extra',
      title: 'Tech stack',
      tags: [
        'YOLO', 'SAM2', 'SmolVLM2', 'SigLIP', 'Homography', 'PyTorch',
        'FastAPI', 'PostgreSQL', 'OpenCV', 'Supervision', 'RunPod', 'Supabase',
        'Next.js 15', 'TypeScript', 'TailwindCSS', 'shadcn/ui',
      ],
    },
  ],
  cta: [
    { label: 'View code', href: 'https://github.com/Brillar0101/swishvision', primary: true },
    { label: 'Tracking demo', href: 'https://youtu.be/NVq8giX8RPI', primary: false },
  ],
};

// =====================================================================
// PSIV Rentals
// =====================================================================
const PSIV = (name) => `/assets/images/psiv-rentals/${name}`;

export const psivRentalsCaseStudy = {
  id: 'psiv-rentals',
  eyebrow: 'Full-stack',
  context: 'iOS and Android · full-stack build',
  headline: 'An equipment-rental platform with a mobile app, API, and admin back office',
  subhead:
    'Rent photography and video gear from a phone, with real-time availability, Stripe checkout, and a full admin dashboard behind it.',
  metrics: [
    { value: '74+', label: 'mobile screens' },
    { value: '65+', label: 'API endpoints' },
    { value: '11', label: 'database tables' },
    { value: '<200ms', label: 'API response' },
  ],
  sections: [
    {
      type: 'introduction',
      title: 'Introduction',
      body:
        'PSIV Rentals lets photographers and videographers book gear from their phone. Customers browse cameras, lenses, lighting, audio, and accessories, check real availability, and pay through Stripe. Behind it sits an admin dashboard for running the actual rental business: inventory, bookings, promo codes, and analytics.',
    },
    {
      type: 'problem',
      title: 'The problem',
      body:
        'Most rental tools make the simple act of booking a camera harder than it should be, and they break down the moment two people want the same item.',
      bullets: [
        'Existing solutions have dated interfaces and clunky booking flows.',
        'Manual inventory tracking causes double bookings and let-down customers.',
        'Goal: a mobile-first experience with real-time availability, smooth payments, and proper admin tools.',
      ],
    },
    {
      type: 'audience',
      title: "Who it's for",
      bullets: [
        'Independent photographers and videographers.',
        'Content creators and social media influencers.',
        'Small production companies.',
        'Photography students and hobbyists.',
      ],
    },
    {
      type: 'process',
      title: 'How it was built',
      steps: [
        {
          title: 'The mobile app',
          body:
            'The customer app is React Native on Expo, covering 74+ screens from auth through checkout. It handles browsing with search and filters, a date-based booking flow that checks availability, a multi-item cart, Stripe payments with Apple Pay, and reviews on returned gear.',
          bullets: [
            'JWT login and registration',
            'Category browse with search, filters, and sorting',
            'Booking flow with availability check',
            'Multi-item cart with quantities',
            'Stripe payments with Apple Pay',
            'Rate and review rented equipment',
          ],
          images: [
            { src: PSIV('screen-01.PNG'), alt: 'Home screen', caption: 'Home' },
            { src: PSIV('screen-02.PNG'), alt: 'Equipment browse', caption: 'Browse' },
            { src: PSIV('screen-03.PNG'), alt: 'Equipment details', caption: 'Details' },
            { src: PSIV('screen-04.PNG'), alt: 'Cart view', caption: 'Cart' },
            { src: PSIV('screen-05.PNG'), alt: 'Checkout flow', caption: 'Checkout' },
            { src: PSIV('screen-06.PNG'), alt: 'Booking confirmation', caption: 'Confirmation' },
            { src: PSIV('screen-07.PNG'), alt: 'My bookings', caption: 'My bookings' },
            { src: PSIV('screen-08.PNG'), alt: 'Profile screen', caption: 'Profile' },
          ],
        },
        {
          title: 'The backend and API',
          body:
            'A Node and Express API over PostgreSQL exposes 65+ endpoints across auth, equipment, bookings, payments, cart, and promo codes. Responses come back in under 200ms, with Redis handling caching and sessions.',
          bullets: [
            'Auth: 7 endpoints (signup, login, profile, password)',
            'Equipment: 10 endpoints (CRUD, search, images)',
            'Bookings: 12 endpoints (CRUD, status, extensions)',
            'Payments: 3 endpoints (intent, confirm, status)',
            'Cart: 6 endpoints (add, update, delete, checkout)',
            'Promo: 12 endpoints (validate, apply, admin CRUD)',
          ],
        },
        {
          title: 'The admin dashboard',
          body:
            'The back office is a React app where staff manage stock, bookings, discount codes, and watch search trends and business metrics. It is the side that turns the app into something a real rental shop can run on.',
          bullets: [
            'Inventory: add, edit, and manage equipment',
            'Bookings: view, update, and cancel',
            'Promo codes: create and manage discounts',
            'Analytics: search trends and business metrics',
          ],
          images: [
            { src: PSIV('admin-dashboard.png'), alt: 'Admin dashboard overview', caption: 'Dashboard' },
            { src: PSIV('admin-equipment.png'), alt: 'Equipment management', caption: 'Equipment' },
            { src: PSIV('admin-bookings.png'), alt: 'Bookings management', caption: 'Bookings' },
            { src: PSIV('admin-categories.png'), alt: 'Categories management', caption: 'Categories' },
            { src: PSIV('admin-promo.png'), alt: 'Promo codes', caption: 'Promo codes' },
            { src: PSIV('admin-login.png'), alt: 'Admin login', caption: 'Login' },
          ],
        },
        {
          title: 'The parts that were actually hard',
          body:
            'A booking app is mostly edge cases. These were the ones worth solving carefully.',
          bullets: [
            'Real-time availability across concurrent bookings: PostgreSQL date-range queries with conflict detection at O(log n).',
            'Complex pricing with daily and weekly rates plus discounts: a pricing engine that factors duration, tax, and promos.',
            'Payments with many failure modes: Stripe payment-intent flow with error handling and webhooks for async events.',
            'State across 74+ screens: Zustand for global state and React Query for server state with caching.',
          ],
        },
      ],
    },
    {
      type: 'conclusion',
      title: 'What is next',
      bullets: [
        'Email confirmations through SendGrid',
        'Push notifications for rental reminders',
        'Equipment recommendations',
        'Multi-location support with pickup scheduling',
      ],
    },
    {
      type: 'extra',
      title: 'Tech stack',
      tags: [
        'React Native', 'Expo SDK 54', 'TypeScript', 'Zustand', 'React Query',
        'Node.js', 'Express', 'PostgreSQL', 'Redis', 'JWT', 'Stripe', 'AWS S3',
        'React 19', 'React Router 7', 'Recharts',
      ],
    },
  ],
  cta: [
    { label: 'App code', href: 'https://github.com/Brillar0101/psiv-rentals', primary: true },
    { label: 'Admin code', href: 'https://github.com/Brillar0101/psiv-rentals-admin', primary: false },
    { label: 'API code', href: 'https://github.com/Brillar0101/psiv-rentals-api', primary: false },
  ],
};

// =====================================================================
// Touhou
// =====================================================================
const TOUHOU = (name) => `/assets/images/touhou/${name}.jpg`;

export const touhouCaseStudy = {
  id: 'touhou',
  eyebrow: 'Embedded',
  context: 'Bare-metal firmware · MSP432',
  headline: 'A bullet-hell shooter running bare-metal on an MSP432',
  subhead:
    'Six enemy fire patterns, joystick movement, power-ups, and custom sprites on a 128x128 LCD, all non-blocking with no operating system underneath.',
  video: 'https://www.youtube.com/embed/wSuiJyFIlaU',
  metrics: [
    { value: '6', label: 'enemy fire patterns' },
    { value: '10', label: 'concurrent bullets' },
    { value: '48 MHz', label: 'ARM Cortex-M4F' },
    { value: '128x128', label: 'LCD display' },
  ],
  sections: [
    {
      type: 'introduction',
      title: 'Introduction',
      body:
        'Touhou is a classic bullet-hell shooter built on the MSP432 LaunchPad with no operating system to lean on. The player dodges enemy projectiles, fires back, and grabs power-ups, while the firmware juggles up to 10 bullets, collision math, sprite rendering, and input polling without ever blocking.',
    },
    {
      type: 'problem',
      title: 'The challenge',
      body:
        'The hard part is doing all of this on a microcontroller and keeping it smooth. The analog joystick is read through the ADC14 with deadzone filtering for clean 2-axis movement, and every system has to stay responsive with no busy-waits, since a single blocking call would stutter the whole game.',
    },
    {
      type: 'process',
      title: 'How it works',
      steps: [
        {
          title: 'Three-layer architecture',
          body:
            'The code is split into three layers with strict separation. The application layer runs all game logic through the HAL and never touches a register directly.',
          bullets: [
            'Application: game FSM, bullet pool, collision detection, scoring, power-ups',
            'HAL: joystick (ADC14), button debounce, UART, LCD graphics, software timers',
            'TI DriverLib: GPIO, ADC14, eUSCI (SPI/UART), Timer32, interrupts',
            'Hardware: ARM Cortex-M4F at 48 MHz, 128x128 ST7735 LCD, joystick, 5 buttons',
          ],
        },
        {
          title: 'Game state machine',
          body:
            'The game moves through six screen states driven by buttons and the joystick: a title screen that auto-advances, a menu, the active game loop, game over, and a high-scores board.',
          bullets: [
            'BOOT: title screen, 3-second auto-advance',
            'START: main menu (play, instructions, scores)',
            'ACTIVE: movement, bullet spawning, collisions, pattern rotation, power-ups',
            'END: win or lose, score = time + HP x 10',
            'RECORD: top 5 scores via insertion sort',
          ],
        },
        {
          title: 'Game mechanics',
          body:
            'Player and enemy each start at 25 HP and take 5 damage per hit. The player fires a single cyan bullet upward at 3 px/frame, and a green power-up drops every 8 to 12 seconds for +10 HP. The bullet-hell feel comes from six enemy patterns running on their own timers.',
          bullets: [
            'Vertical rain (red), straight down',
            'Horizontal sweep (yellow), across from the left',
            'Diagonal left to right (orange)',
            'Diagonal right to left (pink)',
            'Dual convergence (purple), both sides closing in',
            'Random drop (green), random positions',
          ],
        },
        {
          title: 'Hardware abstraction layer',
          body:
            'Each peripheral is its own module. The Touhou build adds joystick support on top of the base HAL from the first project.',
          bullets: [
            'Joystick: ADC14 at 12-bit, deadzone of +/-3000 from center (8192)',
            'Buttons: 4-state debounce FSM with a 5ms filter, tap vs hold',
            'Graphics: custom 8BPP sprites, 16x16 player and 16x7 enemy, drawn through grlib',
            'Timer: TIMER32_0 at 48 MHz (20.8ns/tick) with 64-bit cycle arithmetic',
          ],
        },
      ],
    },
    {
      type: 'gallery',
      title: 'Screenshots',
      images: [
        { src: TOUHOU('startup'), alt: 'Title screen', caption: 'Title screen with a 3-second auto-advance to the menu.' },
        { src: TOUHOU('menu'), alt: 'Main menu', caption: 'Main menu with S1/S2 navigation and joystick select.' },
        { src: TOUHOU('gameplay-basic'), alt: 'Player and enemy with health', caption: 'Player at the bottom faces the enemy up top, health counters tracking damage.' },
        { src: TOUHOU('bullet-pattern'), alt: 'Enemy bullet pattern', caption: 'Bullet hell in action as the enemy fires colored patterns.' },
        { src: TOUHOU('gameplay-advanced'), alt: 'Full gameplay with bars and timer', caption: 'Health bars, survival timer, multiple bullet patterns, and the power-up system.' },
        { src: TOUHOU('instructions'), alt: 'Instructions screen', caption: 'Instructions screen for controls and mechanics.' },
      ],
    },
    {
      type: 'conclusion',
      title: 'The tricky parts',
      bullets: [
        'Bullet pool: a fixed array of 10 with active flags, so there is no dynamic allocation on a heap-less system.',
        'Joystick deadzone: without +/-3000 around center, analog noise made the stick drift and the game unplayable.',
        'Pattern timing: decoupling pattern rotation (5s) from bullet spawn (1s) lets patterns overlap, which is what makes it feel like bullet hell.',
        'Sprites: stored as 8BPP hex arrays in Flash, 256 bytes for the 16x16 player ship.',
      ],
    },
    {
      type: 'extra',
      title: 'Tech stack',
      tags: ['MSP432P401R', 'ARM Cortex-M4F', 'C', 'TI DriverLib', 'TI grlib', 'ADC14', 'ST7735 LCD', 'eUSCI SPI', 'Timer32', 'Code Composer Studio'],
    },
  ],
  cta: [{ label: 'View code', href: 'https://github.com/Brillar0101', primary: true }],
};

// =====================================================================
// Pixel Monarch
// =====================================================================
export const pixelMonarchCaseStudy = {
  id: 'pixel-monarch',
  eyebrow: 'Embedded',
  context: 'Bare-metal firmware · MSP432',
  headline: 'A kingdom-management game on a bare-metal MSP432',
  subhead:
    'Balance people, treasury, and territory across 8 regions, driven by a finite state machine, UART commands, and a modular hardware abstraction layer, with no blocking calls anywhere.',
  metrics: [
    { value: '48 MHz', label: 'ARM Cortex-M4F' },
    { value: '128x128', label: 'LCD display' },
    { value: '5', label: 'game states' },
    { value: '3-layer', label: 'architecture' },
  ],
  sections: [
    {
      type: 'introduction',
      title: 'Introduction',
      body:
        'Pixel Monarch is a kingdom-management game on the MSP432 LaunchPad. You manage two resources, people and treasury, across 8 territory regions, and random events test your decisions each year. The whole thing runs bare-metal on a 128x128 LCD with UART serial control and a modular HAL.',
    },
    {
      type: 'problem',
      title: 'The challenge',
      body:
        'Build a fully interactive game on a resource-constrained microcontroller with no operating system. It has to take UART input and output at four different baud rates with live command parsing, and stay responsive at all times with no blocking calls or busy-waits.',
    },
    {
      type: 'rules',
      title: 'How the game plays',
      body:
        'You rule a kingdom managing two resources across 8 regions, with random events each year and three UART commands to act.',
      bullets: [
        'People (PE): your population. Too low and the kingdom collapses.',
        'Treasury (TR): gold reserves. Bankruptcy ends the game.',
        'Territory: 8 regions shown as a colored grid on the LCD.',
        'Events: flood, famine, raid, or a calm spell where resources recover.',
        'Commands: SP (spend people), AP (allocate people), IG (invest gold).',
      ],
    },
    {
      type: 'process',
      title: 'How it was built',
      steps: [
        {
          title: 'Layered design',
          body:
            'The project uses a clean three-layer architecture with strict separation of concerns. There are no global variables, everything is passed through parameters, which keeps the interfaces honest and the code portable.',
          bullets: [
            'Application: game FSM, event handler, display logic, score tracking',
            'HAL: LED control, button debounce, UART, LCD graphics, software timers',
            'TI DriverLib: GPIO, eUSCI (SPI/UART), Timer32, interrupts',
            'Hardware: ARM Cortex-M4F, 128x128 LCD, 7 LEDs, 5 buttons, UART',
          ],
        },
        {
          title: 'Finite state machine',
          body:
            'A multi-screen FSM drives the game with clean transitions: a main menu, an instructions screen, the active game loop, game over when people or treasury hit zero, and a high-scores board.',
          bullets: [
            'START: title and main menu',
            'INFO: rules and command reference',
            'ACTIVE: random events, UART commands, resource updates, territory grid',
            'END: game over when PE <= 0 or TR <= 0, final score',
            'RECORD: top 3 scores and years survived',
          ],
        },
        {
          title: 'Hardware abstraction layer',
          body:
            'The HAL wraps every hardware interaction into modular components, each with a construct, refresh, and query API in an object-oriented C style. The struct below is the whole hardware surface in one place.',
          bullets: [
            'Buttons: 4-state debounce FSM with a 5ms filter, edge detection, 5 buttons',
            'UART: eUSCI_A0 with 4 baud rates (9600 to 57600), non-blocking, hot-swappable',
            'LCD: 128x128 ST7735 over SPI at 16 MHz with TI grlib',
            'Timer: TIMER32_0 at 48 MHz with ISR rollover tracking',
          ],
          code: `struct _HAL {
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
};`,
          codeLabel: 'HAL.h',
        },
      ],
    },
    {
      type: 'conclusion',
      title: 'What it taught me',
      bullets: [
        'Non-blocking design: every operation has to return fast. The LED toggle test must always respond instantly, which proves nothing stalls.',
        'No global variables: passing all state through parameters forces clean interfaces and makes the code testable.',
        'Debounce timing: mechanical bounce needed a 4-state FSM with 5ms timers to read presses reliably.',
        'Baud-rate hot-swap: changing UART rates at runtime meant reconfiguring the eUSCI module without dropping data.',
      ],
    },
    {
      type: 'extra',
      title: 'Tech stack',
      tags: ['MSP432P401R', 'ARM Cortex-M4F', 'C', 'TI DriverLib', 'TI grlib', 'ST7735 LCD', 'eUSCI UART', 'eUSCI SPI', 'Timer32', 'Code Composer Studio'],
    },
  ],
  cta: [{ label: 'View code', href: 'https://github.com/Brillar0101', primary: true }],
};

// Register projects so the generic ProjectCaseStudy page can render them.
caseStudies.clapperboard = clapperboardCaseStudy;
caseStudies.swishvision = swishVisionCaseStudy;
caseStudies['psiv-rentals'] = psivRentalsCaseStudy;
caseStudies.touhou = touhouCaseStudy;
caseStudies['pixel-monarch'] = pixelMonarchCaseStudy;

// Case-study content in the `project-writeup` skill's JSON shape.
// Renderable fields per section / step: body, bullets[], code + codeLabel,
// image + imageAlt, images[] (gallery), tags[], caption. Sections with no
// content are left out. Prose is written to read like a person wrote it
// (no em dashes, real numbers kept verbatim).

const SLIDE = (name) => `/assets/images/clapperboard/result_slideshow/${name}.jpg`;

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

// Case-study content in the `project-writeup` skill's JSON shape.
// Sections with no content are simply left out. Anything that doesn't fit a
// standard section goes in an `extra` block. Prose is written to read like a
// person wrote it (no em dashes, no filler, real numbers kept verbatim).

export const clapperboardCaseStudy = {
  id: 'clapperboard',
  eyebrow: 'ML / AI',
  headline: 'A clapperboard detector that runs at 48 FPS',
  subhead:
    'A small YOLOv8 model that finds the slate in raw footage so editors stop scrubbing through takes by hand.',
  cover: '/assets/images/clapperboard/good-case-3.png',
  metrics: [
    { value: '96.4%', label: 'mAP@0.5' },
    { value: '48 FPS', label: 'inference speed' },
    { value: '133', label: 'test frames' },
    { value: 'YOLOv8n', label: 'model (nano)' },
  ],
  sections: [
    {
      type: 'introduction',
      title: 'Introduction',
      body:
        'Editors line up takes using the clapperboard. On a long shoot that means scrubbing through hours of footage to find every slate, which is slow and easy to get wrong. This model watches the video and marks each clapperboard as it appears, so the cut points are already there before anyone opens the timeline.',
    },
    {
      type: 'problem',
      title: 'The problem',
      body:
        'Clapperboards do not look alike. Some are digital, some are the old chalk kind, some are held at an angle or half out of frame, and a lot of them are moving when the slate snaps shut. The detector had to handle that range, stay accurate enough that an editor would trust it, and still run fast enough to keep up with video rather than chew through a clip overnight.',
    },
    {
      type: 'process',
      title: 'How it was built',
      steps: [
        {
          title: 'Collecting and labeling the data',
          body:
            'I gathered clapperboard images from real production stills and video frames, then labeled them in Roboflow as a single class. Augmentation filled in the cases that were thin in the raw set: different angles, lighting, and partial views. One class keeps the problem honest and the model small.',
          artifact: 'screenshot',
          image: '/assets/images/clapperboard/roboflow-labeling.png',
          imageAlt: 'Labeling clapperboards in Roboflow',
        },
        {
          title: 'Picking YOLOv8n',
          body:
            'I went with the nano version of YOLOv8 on purpose. A bigger model would push the mAP up a point or two, but it would also drop the frame rate below what video needs. Nano kept inference at 48 FPS on the test hardware while still clearing 96% mAP, which was the trade I wanted.',
          artifact: 'none',
        },
        {
          title: 'Training and checking the results',
          body:
            'After training I ran the model over a held-out set of 133 frames, 111 with a clapperboard and 22 without. It reached 96.4% mAP@0.5. The true negatives mattered as much as the hits here, because a detector that fires on every bright rectangle is useless to an editor.',
          artifact: 'chart',
          image: '/assets/images/clapperboard/dataset-grid.png',
          imageAlt: 'Grid of detection results across the test set',
        },
        {
          title: 'Looking at what it got wrong',
          body:
            'The failures were the useful part. It read an iPad as a clapperboard at 87.3% confidence, missed a slate that was smeared by motion blur, and skipped an old black and white board it had never really seen in training. In one frame with two clapperboards it only caught one. Most of these trace back to gaps in the data rather than the model itself.',
          artifact: 'screenshot',
          image: '/assets/images/clapperboard/result_slideshow/result_neg_0016.jpg',
          imageAlt: 'False positive: an iPad detected as a clapperboard',
        },
      ],
    },
    {
      type: 'results',
      title: 'Results',
      body:
        'On the test set the model hit 96.4% mAP@0.5 and held 48 FPS, fast enough to run on footage instead of single images. It is reliable on the common digital and chalk slates and gives back clean true negatives, which is what makes it safe to drop into an edit. The weak spots are blur and clapperboard styles that were rare in the training data.',
    },
    {
      type: 'conclusion',
      title: 'What I would change next',
      body:
        'The next version needs more of the hard cases in training: motion blur, vintage boards, and frames with more than one slate. I would also test it on full clips end to end rather than sampled frames, since that is closer to how an editor would actually use it.',
    },
  ],
  cta: [
    { label: 'View code', href: 'https://github.com/Brillar0101', primary: true },
    { label: 'Full breakdown', href: '/projects/clapperboard', primary: false },
  ],
};

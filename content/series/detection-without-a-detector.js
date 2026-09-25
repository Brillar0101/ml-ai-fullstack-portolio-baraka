// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "detection-without-a-detector",
  "title": "Detection without a detector",
  "excerpt": "A normal object detector can only find the categories it was trained to name. Open-vocabulary grounding swaps that fixed list for plain language, and NVIDIA's LocateAnything-3B is a sharp recent example of how.",
  "category": "AI",
  "chapter": "Chapter 10",
  "tags": [
    "Computer Vision",
    "Visual Grounding",
    "Open Vocabulary",
    "VLM"
  ],
  "seriesNum": 41,
  "publishAt": "2026-06-29T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Point a standard object detector at a photo of a busy warehouse and ask it to find the forklift. It will happily box the people, box the truck backed up to the loading door, maybe box a stray carton on the floor, and draw absolutely nothing around the forklift parked in the middle of the shot. The forklift is not hidden. It is large, well lit, and dead center. The detector skips it for one dull reason: it was trained to recognize a fixed list of about eighty kinds of object, and forklift is not on the list."
    },
    {
      "type": "p",
      "text": "That sounds like a harmless quirk until the missing category is a person. In 2018, during a road test of one of Uber's self-driving cars in Tempe, Arizona, the car's perception software saw a woman crossing the road at night while pushing a bicycle, and it could not settle on what she was. Federal investigators later found that it labeled her first as an unknown object, then as a vehicle, then as a bicycle, changing its mind in the seconds before the car struck and killed her. Part of the failure was structural."
    },
    {
      "type": "p",
      "text": "The system reasoned in terms of a fixed menu of categories, and a person walking a bicycle across the middle of a road did not sit cleanly in any of them. I am not going to claim a different model would have saved her, because that crash had many causes and a moving car is a far harder problem than a single still photo. But it is the sharpest illustration of a limit that runs through almost all object detection: a detector can only find the kinds of thing it was handed a name for ahead of time."
    },
    {
      "type": "h2",
      "text": "The closed list problem"
    },
    {
      "type": "p",
      "text": "Picture how a traditional detector is built. Before any training happens, someone writes down the list of categories it will ever know: person, car, dog, chair, and so on, often the eighty categories of a popular research dataset called [COCO](https://arxiv.org/abs/1405.0312). The model then studies thousands of labeled examples of exactly those categories and learns to draw a box around each one."
    },
    {
      "type": "p",
      "text": "That list is the model's entire universe. On the day it ships, its vocabulary is frozen. Show it a pangolin, a forklift, a cracked weld on a pipe, or a fire extinguisher mounted on a wall, and if those were not among the named categories, it has no way to point at them. It is not confused. It is doing precisely what it was built to do, which is to find members of a closed set and ignore everything else."
    },
    {
      "type": "p",
      "text": "Widening that universe is slow and expensive. To add forklift you gather a pile of forklift photos, label every one by hand, and retrain or finetune the model. To add a hundred new categories you do that a hundred times over. For anything rare, the long tail of objects that matter to one warehouse or one inspection job but show up in no general dataset, this is the wall most teams hit. The thing you care about most is often exactly the thing nobody collected a labeled dataset for."
    },
    {
      "type": "h2",
      "text": "Catching behavior, not fingerprints"
    },
    {
      "type": "p",
      "text": "Open-vocabulary grounding throws out the menu. Instead of choosing categories before training and freezing them, you let a person describe what they want in plain language at the moment they want it, and the model points to it. You do not pick from a list. You type \"the forklift,\" or \"the yellow lifting machine,\" or \"the fire extinguisher on the wall,\" and the model returns a box around the matching thing in the image."
    },
    {
      "type": "p",
      "text": "If tomorrow you care about something you never considered today, you just describe the new thing. No retraining, no labeling, no fresh dataset. The vocabulary is as wide as language itself."
    },
    {
      "type": "p",
      "text": "This works because the model learned meaning rather than a list. It was trained on enormous numbers of image-and-text pairs, so it built up a shared sense of how words relate to what is in a picture. The phrase \"lifting machine\" lands near the idea of a forklift in that learned sense, even if the exact word forklift never came up for this particular image, which is why a description the model has never seen can still find the right object."
    },
    {
      "type": "h2",
      "text": "Working one case end to end"
    },
    {
      "type": "p",
      "text": "Go back to the warehouse, this time with an open-vocabulary model like NVIDIA's LocateAnything-3B. You hand it the photo and the single word \"forklift.\" It returns a box, given by corner coordinates, around the machine it earlier had no name for. You change the phrase to \"the fire extinguisher on the wall,\" and without touching the model, without adding a fire-extinguisher category, you get a box around the red cylinder by the door. You ask for \"every pallet on the floor\" and it boxes each one."
    },
    {
      "type": "p",
      "text": "The picture never changed and the model's weights never changed. The only thing that changed was the sentence you gave it. That is the entire shift: the query moved out of a fixed list baked in at training time and into a line of text you write at the moment you ask."
    },
    {
      "type": "h2",
      "text": "The detector's glossary"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Object detection",
          "def": "finding things in an image and drawing a box around each one, with a label for what it is."
        },
        {
          "term": "Bounding box",
          "def": "the rectangle that marks where an object sits, given by its corner coordinates."
        },
        {
          "term": "Closed vocabulary",
          "def": "a fixed list of categories chosen before training. The model can only ever find things on this list."
        },
        {
          "term": "Open vocabulary",
          "def": "finding an object from a free-text description, including kinds of thing the model was never explicitly trained to name."
        },
        {
          "term": "Visual grounding",
          "def": "tying a piece of language to the exact spot in an image it refers to. You give a phrase, the model points."
        },
        {
          "term": "Vision-language model (VLM)",
          "def": "a single model that takes in both an image and text and reasons over the two together."
        }
      ]
    },
    {
      "type": "h2",
      "text": "How LocateAnything actually does it"
    },
    {
      "type": "p",
      "text": "LocateAnything-3B is a vision-language model with about three billion parameters. Two parts sit inside it: a vision encoder that turns the image into a form the model can reason over, and a language model that handles the words."
    },
    {
      "type": "p",
      "text": "The clever part is the output. Instead of a separate detection head that emits boxes, the model simply writes text, and the box is part of that text. Ask it to locate the forklift and it produces the label together with coordinate tokens, a short tagged span carrying four numbers for the corners. Those numbers are normalized to a fixed range from 0 to 1000 regardless of the image's real pixel size, so the same output format works whether the photo is tiny or huge, and your code scales them back to pixels. A point, used when you want a location rather than a region, is written the same way with a single coordinate pair."
    },
    {
      "type": "p",
      "text": "What gives it such a wide vocabulary is the sheer range of what it was trained on. NVIDIA reports building it from roughly twelve million images carrying over a hundred and thirty million text queries and hundreds of millions of boxes, drawn from natural scenes, robotics, driving, graphical user interfaces, and documents. Because the training spanned so many kinds of image and so many ways of describing things, one model can locate ordinary objects, dense clusters of small ones, on-screen buttons, and lines of text in a scanned document, all through the same describe-and-point interface."
    },
    {
      "type": "h2",
      "text": "Parallel box decoding, and why speed matters"
    },
    {
      "type": "p",
      "text": "This design has a catch it has to fight. A language model normally writes one token at a time, each token depending on the ones before it, which is called autoregressive decoding. That is fine for a sentence, but a box is four numbers, and a crowded scene might hold dozens of boxes, so spelling out every coordinate digit one after another gets slow. LocateAnything's headline idea for speed is parallel box decoding: rather than emit a box digit by digit, it predicts the full set of coordinates for a box in a single parallel step. NVIDIA reports this runs up to about two and a half times faster than the token-by-token approach."
    },
    {
      "type": "p",
      "text": "It exposes this as a speed-versus-care dial with three settings. A fast mode always takes the parallel shortcut. A slow mode falls back to plain one-at-a-time decoding, which is more careful on hard cases. The default is a hybrid that takes the fast path first and drops back to the careful path only for boxes it is unsure about, then returns to the fast path. In the warehouse, a clean shot of a single forklift sails through on the fast path, while a cluttered shelf of overlapping parts is where the hybrid earns its keep by slowing down just for the tricky boxes."
    },
    {
      "type": "h2",
      "text": "Try the idea in code"
    },
    {
      "type": "p",
      "text": "The lab below strips the idea down to something you can run right here in the browser. Real grounding models turn an image region and a phrase into vectors and compare their meaning, so here we write those vectors by hand to make the matching visible. Each object gets a short list of numbers standing for its traits, each query gets the same, and a similarity score decides which object a phrase grounds to. A closed-list detector would only ever match objects whose names you fixed in advance, but this open match scores any phrase against every object, which is the whole move shrunk down small enough to read. Change a query, add an object of your own, and watch which one lights up."
    },
    {
      "type": "lab",
      "packages": [
        "numpy"
      ],
      "height": 480,
      "code": "import numpy as np\n\n# A toy \"open vocabulary\" matcher. Real models like\n# LocateAnything turn an image region and a text phrase into\n# vectors and compare their meaning. Here we write the\n# vectors by hand so you can watch the idea run with no\n# model.\n\n# Each object gets a \"meaning\" vector over five made-up\n# traits: [ vehicle, lifting, red, wall_mounted, safety ]\nobjects = {\n    \"forklift\":          np.array([0.9, 0.9, 0.1, 0.0, 0.2]),\n    \"delivery truck\":    np.array([0.9, 0.1, 0.0, 0.0, 0.1]),\n    \"fire extinguisher\": np.array([0.0, 0.0, 0.9, 0.8, 0.9]),\n    \"office chair\":      np.array([0.0, 0.0, 0.0, 0.0, 0.0]),\n}\n\n# Free-text queries, turned into vectors over the same five\n# traits.\nqueries = {\n    \"the yellow lifting machine\":  np.array([0.6, 0.95, 0.0, 0.0, 0.1]),\n    \"something to put out a fire\":  np.array([0.0, 0.0, 0.5, 0.4, 0.95]),\n    \"a vehicle\":                    np.array([0.95, 0.2, 0.0, 0.0, 0.0]),\n}\n\ndef cosine(a, b):\n    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9))\n\nfor q, qv in queries.items():\n    scores = {name: cosine(qv, ov) for name, ov in objects.items()}\n    best = max(scores, key=scores.get)\n    print(f'query: \"{q}\"')\n    print(f'   grounds to: {best}  (score {scores[best]:.2f})\\n')\n\n# Try it: change a query vector, or add an object above, and\n# press Run.\n"
    },
    {
      "type": "h2",
      "text": "Where it breaks"
    },
    {
      "type": "p",
      "text": "Open-vocabulary grounding is not a magic eye, and knowing its edges keeps you out of trouble. A vague phrase gets a vague result: ask for \"the thing on the left\" in a crowded shelf and the model may box confidently around the wrong item, with no hint that it guessed. Descriptions that hinge on fine distinctions, the cracked weld rather than the sound one beside it, are exactly where it can slip. It is also heavier and slower than a small fixed-purpose detector."
    },
    {
      "type": "p",
      "text": "If you only ever need to find people and cars, and you need it in a few milliseconds on a cheap chip, a classic detector trained on those classes will beat a three-billion-parameter model on speed and cost. Open vocabulary buys you flexibility, and you pay for it in compute."
    },
    {
      "type": "p",
      "text": "Two practical limits are worth naming plainly. LocateAnything-3B ships under an NVIDIA license for non-commercial research use, so you can study it and build prototypes, but dropping it inside a product you sell is not permitted without different terms. And a model that points at things in still photos is not the same as a perception system safe enough to drive a car. The Uber case earlier shows the stakes of getting localization wrong in the real world, and nothing here should be read as suggesting a research VLM is ready for that job. It is a flexible tool for finding described things in images, which is already plenty."
    },
    {
      "type": "h2",
      "text": "Detection is a system, not a model"
    },
    {
      "type": "p",
      "text": "A traditional detector is a closed list: fast, cheap, and blind to anything it was not trained to name. Open-vocabulary grounding swaps the list for language, so the question moves from \"is this one of my eighty categories\" to \"here is a sentence, find what it describes,\" and you can change the sentence any time without retraining. LocateAnything-3B is one strong recent example, a vision-language model that writes boxes as text and leans on parallel decoding to stay fast."
    },
    {
      "type": "p",
      "text": "Reach for this kind of model when the things you need to find are open-ended, rare, or unknown until a user asks. Reach for a plain detector when the categories are few, fixed, and raw speed is the priority. The skill is knowing which of those two worlds your problem actually lives in."
    }
  ]
};

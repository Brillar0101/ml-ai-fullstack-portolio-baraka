// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "probabilistic-nature",
  "title": "Why the same prompt gives different answers",
  "excerpt": "A model does not have an answer, it has a distribution of answers and draws one. Why that is by design, and when to turn it off.",
  "category": "AI",
  "tags": [
    "Sampling",
    "Determinism",
    "Reliability"
  ],
  "seriesNum": 31,
  "publishAt": "2026-06-26T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Picture a QA tester filing a bug with a screenshot: she asked the assistant the same question twice and got two different answers, and her report says, reasonably, \"the model is inconsistent, please fix it.\" The engineer who picks up the ticket cannot fix it, because there is nothing broken. The variation she caught is not a defect. It is the way the model is designed to behave, and once you understand why, a whole category of confusing behavior stops being confusing and becomes something you can actually control."
    },
    {
      "type": "p",
      "text": "The short version is that a model does not compute one answer the way a calculator computes one sum. It produces a spread of possible answers with different odds, and then it rolls dice to pick one. Ask twice and you can get two different rolls. That randomness is not a bug bolted onto an otherwise deterministic system. It is built into how the model generates every word."
    },
    {
      "type": "h2",
      "text": "The intuition: a distribution, not an answer"
    },
    {
      "type": "p",
      "text": "Recall how generation actually works. At each step the model does not choose the next word, it produces a score for every word it knows and turns those into probabilities."
    },
    {
      "type": "p",
      "text": "Then a sampler draws one word from that distribution, favoring the likely ones without always taking the single most likely. Because there is a draw at every single step, two runs of the same prompt can diverge at the very first word and wander to completely different but equally valid answers. The model was never going to give you \"the\" answer, because it does not have one. It has a landscape of plausible answers and a habit of sampling from it."
    },
    {
      "type": "h2",
      "text": "Walk a concrete case"
    },
    {
      "type": "p",
      "text": "Ask a model \"suggest a name for a new coffee shop\" and you might get \"Daily Grind.\" Ask again and you might get \"Bean & Gone.\" Neither is more correct than the other, and nothing changed between the two tries except which words the sampler happened to draw. Now notice that this is exactly what you want for that task. A naming tool that returned the identical suggestion every single time would be nearly useless, because the whole point is to explore options. The variability the tester flagged as a bug is, for a creative task, the feature people are paying for."
    },
    {
      "type": "h2",
      "text": "A vocabulary for randomness"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Deterministic",
          "def": "always produces the same output for the same input, like a normal function or a calculator."
        },
        {
          "term": "Probabilistic",
          "def": "produces outputs drawn from a distribution, so the same input can yield different results."
        },
        {
          "term": "Greedy decoding",
          "def": "always taking the single highest-probability next word, which makes generation effectively deterministic."
        },
        {
          "term": "Temperature",
          "def": "the knob that controls how much randomness the sampler uses. At zero it stops sampling and just takes the top word."
        }
      ]
    },
    {
      "type": "h2",
      "text": "When you do not want variety"
    },
    {
      "type": "p",
      "text": "Of course, plenty of tasks are the opposite of naming a coffee shop. If you are extracting the total from an invoice, classifying a support ticket, or pulling a date out of a document, you want the same input to give the same output every time, and a model that wanders is a liability. The fix is built into the same machinery that caused the problem. Turn the temperature down to zero, which tells the model to stop rolling dice and always take its single most likely next word."
    },
    {
      "type": "p",
      "text": "This is greedy decoding, and it makes generation effectively deterministic: the same prompt now produces the same answer, run after run. So the tester was not wrong that the behavior was undesirable for her case. She was wrong that it was a bug. It was a setting."
    },
    {
      "type": "lab",
      "height": 460,
      "title": "The same distribution, four temperatures",
      "caption": "Same seed, same probabilities, one setting changed. At zero the model stops rolling dice entirely. The tester found a default, not a bug.",
      "code": "import random\n\n# Why the same prompt gives different answers. The model\n# does not hold one answer, it holds a distribution and\n# draws from it. Temperature decides how adventurous the\n# draw is.\n\nNEXT_WORD = {\"Daily\": 0.30, \"Bean\": 0.25, \"Morning\": 0.20,\n             \"Roast\": 0.15, \"Ember\": 0.07, \"Zenith\": 0.03}\n\ndef apply_temperature(dist, t):\n    if t == 0:\n        top = max(dist, key=dist.get)          # greedy: always the top word\n        return {w: (1.0 if w == top else 0.0) for w in dist}\n    scaled = {w: p ** (1.0 / t) for w, p in dist.items()}\n    total = sum(scaled.values())\n    return {w: v / total for w, v in scaled.items()}\n\ndef sample(dist, rng):\n    r, acc = rng.random(), 0.0\n    for w, p in dist.items():\n        acc += p\n        if r <= acc:\n            return w\n    return list(dist)[-1]\n\nprint(\"the model's own probabilities for the next word:\")\nprint(\"   \" + \"  \".join(\"%s %.2f\" % (w, p) for w, p in NEXT_WORD.items()))\nprint()\nprint(\"%-14s %-46s %s\" % (\"temperature\", \"10 draws\", \"distinct\"))\nfor t in (0.0, 0.5, 1.0, 1.8):\n    rng = random.Random(11)                    # same seed, so only t changes\n    shifted = apply_temperature(NEXT_WORD, t)\n    draws = [sample(shifted, rng) for _ in range(10)]\n    print(\"%-14.1f %-46s %d\" % (t, \" \".join(draws), len(set(draws))))\n\nprint()\nprint(\"At temperature 0 the model stops rolling dice and takes its top word\")\nprint(\"every time, which is what you want for pulling a total off an invoice.\")\nprint(\"Turn it up and the rare words come into play, which is what you want\")\nprint(\"when you are naming a coffee shop and the obvious answer is boring.\")\nprint(\"Same model, same prompt, one setting. Not a bug: a dial.\")\n\n# Try it: change the seed and run again. At temperature 0\n# nothing moves. At 1.8 everything does. That difference is\n# the whole post in one experiment.\n"
    },
    {
      "type": "h2",
      "text": "The honest caveat about \"deterministic\""
    },
    {
      "type": "p",
      "text": "There is a wrinkle worth knowing so you do not get burned. Even at temperature zero, you cannot always count on byte-for-byte identical output. The provider may update the model behind the same name, different hardware can produce tiny numerical differences that occasionally flip a close call, and some systems do not expose a true zero. So temperature zero gives you strong, practical consistency, not a mathematical guarantee carved in stone. For most uses that distinction never matters, but if you are building something that depends on exact reproducibility, like caching results by their output, treat near-deterministic as near, not absolute, and design for the rare case where it shifts."
    },
    {
      "type": "h2",
      "text": "What this means for testing"
    },
    {
      "type": "p",
      "text": "This changes how you test anything built on a model, which is the deeper lesson under the tester's ticket. You cannot write an assertion that the output equals an exact string and expect it to pass reliably, the way you would for a normal function, because even a good answer can be phrased a dozen ways. Instead you test properties: does the output contain the right total, is it valid JSON, does it answer the question asked, is it under the length limit. For tasks where you do pin the temperature to zero, exact-match tests become more reasonable, but the habit to build is checking that the answer is right rather than that it is identical. This is the same point the evaluation post made, arriving from a different door: with a probabilistic system, you measure whether the output is good, not whether it matches one frozen expected string."
    },
    {
      "type": "h2",
      "text": "Design for the dice"
    },
    {
      "type": "p",
      "text": "A model is probabilistic by design. It holds a distribution over possible answers and samples one, which is why the same prompt can give different replies, and that is a feature for creative work and a hazard for anything that needs one right answer. You control it with the temperature: high for variety, zero for consistency. The tester did not find a bug, she found a default, and knowing which way to set that default for each task is one of the quiet skills that separates a flaky AI feature from a dependable one. Reach for high temperature when you want the model to surprise you, drop it to zero when you need the same answer twice, and stop reading the variation itself as a malfunction to be fixed."
    }
  ]
};

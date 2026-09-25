// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "entropy-cross-entropy",
  "title": "Entropy and cross-entropy, intuitively",
  "excerpt": "The two ideas under every language-model loss and metric, explained without the heavy math.",
  "category": "ML",
  "chapter": "Chapter 3",
  "tags": [
    "Entropy",
    "Cross-entropy",
    "Evaluation"
  ],
  "seriesNum": 23,
  "publishAt": "2026-05-06T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Read this sentence and guess the last word: \"she poured herself a cup of ___.\" You probably thought \"coffee\" or \"tea,\" and you would have been barely surprised to be right, because the sentence made the ending easy. Now guess the last word of \"the next number in the sequence is ___.\" You have no idea, so whatever it turns out to be will surprise you a lot. That feeling, how surprised you are by the actual answer, is the entire idea behind entropy and cross-entropy. The names sound like physics and scare people off, but the concept is something you just did in your head, and it sits directly under how language models are trained and judged."
    },
    {
      "type": "h2",
      "text": "The intuition: measuring surprise"
    },
    {
      "type": "p",
      "text": "Entropy measures how surprising an outcome is on average. If something is nearly certain, like the sun rising, learning it happened surprises you almost not at all, so it carries little information. If something is a coin toss, the result surprises you more."
    },
    {
      "type": "p",
      "text": "A situation with many roughly equal possibilities, like guessing a random number, is high entropy, because whatever happens you did not see it coming. Cross-entropy takes this one useful step further: instead of the surprise in the world, it measures how surprised a specific model is by the real answer. If the model strongly expected the word that actually came next, its cross-entropy on that word is low. If the right word blindsided it, cross-entropy is high. That is the whole machine."
    },
    {
      "type": "h2",
      "text": "Walk why training is just lowering surprise"
    },
    {
      "type": "p",
      "text": "Now connect it to how a model learns. Training a language model means showing it real text and, at each position, measuring how surprised it was by the word that actually came next, then adjusting it to be a little less surprised next time. Over billions of words, \"be less surprised by real language\" forces the model to absorb grammar, facts, and style, because the only way to stop being surprised by what comes next is to actually understand what tends to come next. Cross-entropy is the exact number this process pushes down."
    },
    {
      "type": "p",
      "text": "So when you hear that a model was \"trained to minimize loss,\" the loss is almost always this: the model's average surprise at real text. Learning and un-surprising itself are the same activity."
    },
    {
      "type": "h2",
      "text": "The two entropies, told apart"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Entropy",
          "def": "the average surprise in an outcome. Predictable means low entropy, random means high."
        },
        {
          "term": "Cross-entropy",
          "def": "how surprised a particular model is by the true answer. It is the loss almost every language model is trained to reduce."
        },
        {
          "term": "Perplexity",
          "def": "cross-entropy made friendlier, roughly how many words the model feels it is choosing between at each step."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Why you care, beyond training"
    },
    {
      "type": "p",
      "text": "These are not academic curiosities, they are the numbers behind real decisions. Cross-entropy is the loss nearly every language model minimizes while training, and perplexity, its friendlier cousin, is a common way to compare how well two models predict text."
    },
    {
      "type": "p",
      "text": "When you read that one model has lower perplexity than another, it means it is less surprised by real language, which usually means it predicts better. Perplexity has a nice concrete reading too: a perplexity of 10 means the model is, on average, about as unsure as if it were picking uniformly among 10 words at each step. Lower is more confident and usually better. It gives you a single dial for \"how well does this model see language coming.\""
    },
    {
      "type": "lab",
      "height": 460,
      "title": "Surprise, in bits",
      "caption": "Being confidently wrong is punished hardest, and deliberately so. Training is the act of pushing this number down on real text, over and over.",
      "code": "import math\n\n# Surprise, measured. Entropy is how surprising an outcome\n# is on average. Cross-entropy is how surprised one\n# particular model was by the truth.\n\ndef entropy(dist):\n    return -sum(p * math.log2(p) for p in dist.values() if p > 0)\n\ndef cross_entropy(model_belief, truth):\n    # Surprise at the word that actually came next, in bits.\n    return -math.log2(model_belief.get(truth, 1e-12))\n\nEASY = {\"coffee\": 0.55, \"tea\": 0.35, \"water\": 0.07, \"soup\": 0.03}\nHARD = {str(n): 0.1 for n in range(10)}          # ten equally likely numbers\n\nprint(\"%-34s %-10s %s\" % (\"situation\", \"entropy\", \"reads as\"))\nprint(\"%-34s %-10.2f %s\" % (\"she poured a cup of ___\", entropy(EASY),\n                            \"about %.1f options in play\" % 2 ** entropy(EASY)))\nprint(\"%-34s %-10.2f %s\" % (\"the next number is ___\", entropy(HARD),\n                            \"about %.1f options in play\" % 2 ** entropy(HARD)))\n\nprint()\nprint(\"Now the same sentence, three models, one truth. The word was 'coffee'.\")\nCONFIDENT_RIGHT = {\"coffee\": 0.90, \"tea\": 0.08, \"water\": 0.02}\nUNSURE         = {\"coffee\": 0.34, \"tea\": 0.33, \"water\": 0.33}\nCONFIDENT_WRONG = {\"coffee\": 0.02, \"tea\": 0.90, \"water\": 0.08}\n\nprint(\"%-22s %-14s %s\" % (\"model\", \"cross-entropy\", \"perplexity\"))\nfor name, belief in [(\"confident, right\", CONFIDENT_RIGHT),\n                     (\"unsure\", UNSURE),\n                     (\"confident, wrong\", CONFIDENT_WRONG)]:\n    ce = cross_entropy(belief, \"coffee\")\n    print(\"%-22s %-14.2f %.2f\" % (name, ce, 2 ** ce))\n\nprint()\nprint(\"Being confidently wrong is punished hardest, and that is deliberate.\")\nprint(\"Training pushes this number down, over and over, on real text. A model\")\nprint(\"that stops being surprised by real language has, in the only sense that\")\nprint(\"matters here, learned it.\")\n\n# Try it: set CONFIDENT_WRONG's coffee probability to 0.001\n# and watch the penalty climb. That steepness is why models\n# learn to hedge rather than commit hard to a guess they\n# cannot support.\n"
    },
    {
      "type": "h2",
      "text": "Why it is measured in bits"
    },
    {
      "type": "p",
      "text": "You will sometimes see surprise measured in bits, and the unit is more intuitive than it looks. One bit is the surprise of one fair yes-or-no answer, a single coin flip. Two bits covers four equally likely options, three bits covers eight, and so on."
    },
    {
      "type": "p",
      "text": "So when entropy is two bits, the situation is about as uncertain as choosing among four equal possibilities. This is also why low-entropy text compresses well: if the next character is highly predictable, you barely need any information to record it, which is the same fact a compression program exploits. Predictability, surprise, information, and file size are all the same idea wearing different clothes, and entropy is the common thread."
    },
    {
      "type": "h2",
      "text": "Where you actually meet these numbers"
    },
    {
      "type": "p",
      "text": "In practice these show up in a few concrete places. When you watch a model train, the loss curve sliding downward is cross-entropy falling, the model getting steadily less surprised by its training text. When researchers compare two language models on the same text, perplexity is a common scoreboard, and a lower number means the model predicts real language more confidently."
    },
    {
      "type": "p",
      "text": "And when someone says a model is \"undertrained,\" part of what they mean is that its perplexity is still higher than it should be, the model is more surprised by ordinary text than a better-trained version would be. None of this requires you to compute anything by hand. It just lets you read the charts and claims without them feeling like a foreign language."
    },
    {
      "type": "h2",
      "text": "The limit worth remembering"
    },
    {
      "type": "p",
      "text": "There is an important catch, and it connects back to the evaluation post. Perplexity measures how well a model predicts text, not how helpful or correct it is as an assistant. A model can have excellent perplexity and still be a poor assistant, because predicting the next word well is not the same as following your instructions, telling the truth, or formatting an answer the way you need. So perplexity is a useful, cheap signal about a model's raw grasp of language, and it is not a substitute for evaluating the model on your actual task. Treat a low perplexity as encouraging, never as the final word, for the same reason a leaderboard score is a starting filter rather than a verdict."
    },
    {
      "type": "h2",
      "text": "What the loss is really measuring"
    },
    {
      "type": "p",
      "text": "Read entropy and cross-entropy as measures of surprise, the same surprise you felt guessing \"coffee\" easily and the random number not at all. Lower cross-entropy means the model saw the answer coming, training is the act of lowering it, and perplexity is just a more readable version of the same idea, with a tidy reading in bits and a real limit: it scores prediction, not helpfulness. That single framing, it is all about surprise, demystifies a surprising amount of training and evaluation talk that otherwise sounds like math for its own sake."
    }
  ]
};

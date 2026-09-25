// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "ai-eng-vs-ml-eng",
  "title": "AI engineering vs traditional ML engineering",
  "excerpt": "They share a name and almost nothing else day to day. Where the work overlaps, and where it splits.",
  "category": "AI",
  "chapter": "Chapter 1",
  "tags": [
    "AI Engineering",
    "ML"
  ],
  "seriesNum": 17,
  "publishAt": "2026-03-25T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Picture a machine learning engineer with ten years of experience taking a job building AI features on top of foundation models, and within a week feels strangely off balance. The instincts that made her great, careful data work, training discipline, distrust of her own results, are still useful."
    },
    {
      "type": "p",
      "text": "But day to day she is barely doing any of the things she used to do. She has not trained a model, tuned a learning rate, or fought overfitting once. Instead she is writing prompts, wiring up retrieval, and arguing about evaluation. AI engineering and traditional ML engineering share a name and a mindset, and almost nothing about the daily work. Knowing where they split saves a lot of that disorientation."
    },
    {
      "type": "h2",
      "text": "The intuition: who makes the model"
    },
    {
      "type": "p",
      "text": "The cleanest way to tell them apart is to ask who builds the model. In traditional ML, you do. You start with data, engineer features, train a model, and fight to make it generalize, and the model is the artifact you produce and own end to end."
    },
    {
      "type": "p",
      "text": "In AI engineering, someone else already built the model, a large lab trained a foundation model at a scale you never could, and you start from there. Your job begins where theirs ended: take that capable, general model and turn it into a reliable product. The center of gravity moves from making a model to adapting one."
    },
    {
      "type": "h2",
      "text": "Walk the contrast"
    },
    {
      "type": "p",
      "text": "Picture the same task, say classifying support tickets, done both ways. The traditional ML path: collect thousands of labeled tickets, train a classifier, evaluate it, retrain when it drifts, and own the whole pipeline including the model weights. The AI engineering path: write a prompt that asks a foundation model to classify the ticket, maybe show it a few examples, evaluate the outputs, and ship, with no training run anywhere."
    },
    {
      "type": "p",
      "text": "The first spends weeks getting a model to exist. The second has a working version in an afternoon and spends its effort instead on whether the outputs are actually good, how fast and cheap they are, and how the system behaves when the model is wrong. Same goal, completely different work, because one builds the engine and the other drives it."
    },
    {
      "type": "h2",
      "text": "Vocabulary from both worlds"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Model development",
          "def": "building and training a model from data, the center of traditional ML engineering."
        },
        {
          "term": "Model adaptation",
          "def": "shaping an existing model with prompting, retrieval, or light finetuning, the center of AI engineering."
        },
        {
          "term": "Evaluation",
          "def": "measuring whether outputs are actually good, which both fields care about but AI engineering lives on."
        }
      ]
    },
    {
      "type": "h2",
      "text": "What actually changes day to day"
    },
    {
      "type": "ul",
      "items": [
        "You spend far less time training and far more time **evaluating**, because the hard part is judging quality, not producing an answer.",
        "**Latency and cost** become product features you design around, not afterthoughts handled at the end.",
        "Your dataset is often for **evaluation**, not training, a small honest test set rather than a giant labeled corpus.",
        "The model is a **dependency you manage**, like a database you did not write, not an artifact you own and version."
      ]
    },
    {
      "type": "h2",
      "text": "What carries over, and what to drop"
    },
    {
      "type": "p",
      "text": "The disorientation is real but the transition is friendly, because the most valuable thing an ML background gives you transfers directly: the discipline of measuring everything and distrusting a demo. That instinct is, if anything, more important here, since you no longer control the model and have to verify its behavior rather than assume it. What you drop is the assumption that being serious means training your own model. For most products it does not, and reaching for a training run first is usually the slow, expensive path to a worse version of what adaptation would have given you faster."
    },
    {
      "type": "h2",
      "text": "A day in each role"
    },
    {
      "type": "p",
      "text": "The split is easiest to feel as a typical day. In traditional ML, you open a notebook and look at distributions, engineer a feature you think will help, kick off a training run that takes hours, come back to evaluate it, adjust a learning rate, and run it again. Most of the day is spent coaxing a model into existing and behaving, and the artifact you are proud of at the end is the trained model itself."
    },
    {
      "type": "p",
      "text": "In AI engineering, you open the prompt instead of a notebook. You run it against a set of real inputs, notice it mangles one awkward case, reword an instruction or add an example, and check whether your evaluation set improved or got worse. You glance at a latency and cost dashboard, decide the model is a touch too slow, and try a smaller one. Maybe you wire in retrieval so it stops guessing at facts."
    },
    {
      "type": "p",
      "text": "The model never changes all day, because it is a given, like the database. The thing you are shipping is the system around it, and the thing you are proud of is a product that behaves."
    },
    {
      "type": "h2",
      "text": "Coming from software, not ML"
    },
    {
      "type": "p",
      "text": "Plenty of people arrive at AI engineering from ordinary software development rather than machine learning, and for them the adjustment is different but just as real. The new muscle is not training, which they were never going to do anyway. It is treating the model as a component that is sometimes wrong."
    },
    {
      "type": "p",
      "text": "A normal function returns the same answer every time, and you can unit-test it to near certainty. A model returns a plausible answer that varies from run to run and can be confidently incorrect, so you cannot assume its behavior, you have to measure it. That is exactly why evaluation, not coding, becomes the center of the work. If you came from software, the habit to build is the one ML people already carry: distrust the output until a test you wrote says it is good, because here the component itself does not promise to be right."
    },
    {
      "type": "h2",
      "text": "Which engineer the problem needs"
    },
    {
      "type": "p",
      "text": "Bring the rigor of ML and drop the reflex to train. The leverage in AI engineering is in choosing the right model, adapting it well with prompting and retrieval, and evaluating it honestly, not in building a model from scratch. If you came from ML, you already have the most important muscle. You just point it at a different part of the problem."
    }
  ]
};

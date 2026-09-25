// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "test-time-compute",
  "title": "Test-time compute: letting a model think longer",
  "excerpt": "Sometimes the win is not a bigger model but giving the same model more room to work at the moment it answers.",
  "category": "AI",
  "chapter": "Chapter 2",
  "tags": [
    "Reasoning",
    "Inference"
  ],
  "seriesNum": 22,
  "publishAt": "2026-04-29T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In late 2024, a new kind of model showed up that did something unusual: when you asked it a hard problem, it visibly paused and \"thought,\" spending seconds or longer working before it replied. On tough math, coding, and science questions, this class of reasoning models jumped well past the standard models that answered instantly. The surprise was where the gain came from. It was not mainly a bigger brain. It was the same kind of model given permission to spend more effort at the moment it answers."
    },
    {
      "type": "p",
      "text": "That is the idea behind test-time compute, and it reframes a question engineers used to answer only one way. When a model is not good enough, you no longer have to reach for a bigger model. Sometimes you just let the model you have work longer."
    },
    {
      "type": "h2",
      "text": "Thinking longer instead of knowing more"
    },
    {
      "type": "p",
      "text": "There are two moments you can spend compute. One is training, which is expensive, slow, and done once by whoever built the model."
    },
    {
      "type": "p",
      "text": "The other is inference, the moment the model actually answers your question. Test-time compute is effort spent in that second moment. The difference is blurting versus working it out. Given a hard problem, a model that writes out reasoning, or quietly tries several approaches and keeps the best, beats the same model forced to commit to a first guess. You are buying quality with thinking time instead of with a new model."
    },
    {
      "type": "h2",
      "text": "The same question, ten tries"
    },
    {
      "type": "p",
      "text": "Hand a model a tricky multi-step math problem and demand an instant answer. It produces something fast and often subtly wrong, because it compressed a long calculation into one rushed shot. Now let it spend test-time compute: it works through the steps, checks its arithmetic, maybe tries a second route and compares."
    },
    {
      "type": "p",
      "text": "The answer takes ten seconds instead of one and is far more likely to be right. The 2024 reasoning models did exactly this, just with the thinking trained to happen more thoroughly and partly out of sight. Same task, more effort at answer time, better result."
    },
    {
      "type": "h2",
      "text": "Names for thinking longer"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Test-time compute",
          "def": "the effort a model spends while answering, as opposed to during training."
        },
        {
          "term": "Reasoning model",
          "def": "a model trained to do extended step-by-step work before giving its final answer."
        },
        {
          "term": "Sampling and selecting",
          "def": "generating several candidate answers and choosing the best one."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Two ways to spend the extra effort"
    },
    {
      "type": "p",
      "text": "The effort can be spent in a couple of shapes, and it is worth knowing both. The first is depth: the model writes out a longer chain of reasoning before committing, working the problem in steps the way the chain-of-thought idea describes. The second is breadth: the model produces several independent attempts at the answer and then picks the best one, or the one most of them agree on."
    },
    {
      "type": "p",
      "text": "Both trade compute for quality, and they can combine. The 2024 reasoning models lean heavily on the first, doing extended internal step-by-step work, sometimes a lot of it, before they answer. Either way the principle is the same: a single rushed guess is replaced by more work, and more work, on a genuinely hard problem, tends to find a better answer."
    },
    {
      "type": "h2",
      "text": "The trade"
    },
    {
      "type": "p",
      "text": "More test-time compute means better answers on hard problems at the cost of more latency and more tokens, which is real money. It is worth it when correctness matters more than speed, like a thorny analysis, and wasteful when the task is a simple lookup that does not need any thinking. Like everything in inference, it is a knob to turn deliberately, not a default to leave on."
    },
    {
      "type": "h2",
      "text": "Why this changed how progress works"
    },
    {
      "type": "p",
      "text": "For years, the recipe for a better model was almost entirely \"make a bigger one and train it on more data,\" which only a few labs could afford and everyone else simply waited for. Test-time compute opened a second axis. You can now get meaningfully better answers out of an existing model by letting it spend more effort at the moment it answers, and that effort is something an application developer controls, not just a frontier lab."
    },
    {
      "type": "p",
      "text": "That matters for how you plan. When your model is not quite good enough on a hard task, you have a cheaper experiment to run before committing to a larger, pricier model: give the current one more room to think and measure whether that alone closes the gap. Often it does, and you have saved both the cost and the latency of moving to a bigger model. The lever is in your hands at answer time, not locked inside someone else's training run."
    },
    {
      "type": "h2",
      "text": "A caution: more thinking is not always better"
    },
    {
      "type": "p",
      "text": "It is easy to assume that if a little extra thinking helps, a lot must help more, and that is not reliably true. On easy problems, forcing a model to deliberate at length wastes time and money for no gain, and can even talk it out of a correct first instinct. The benefit shows up specifically on hard, multi-step problems where there is real work to do, and it flattens out or reverses on simple ones."
    },
    {
      "type": "p",
      "text": "So test-time compute is not a quality dial you crank to the top and leave there. It is something you spend where the difficulty justifies it, which means matching the effort to the problem rather than paying for maximum deliberation on every request. In practice it behaves like the temperature and top-p knobs from earlier in this series: a setting you choose per task, turned up for the genuinely hard requests and left off for the routine ones, rather than a global default you flip on and forget."
    },
    {
      "type": "h2",
      "text": "Buying quality with seconds"
    },
    {
      "type": "p",
      "text": "When a model struggles, before paying for a bigger one, ask whether letting it think longer would close the gap. Often the same model, given room and time to work, gets there. Spend that effort where the problem is genuinely hard and skip it where the task is easy, because thinking time is real money and only pays off when there is real thinking to do. Spending compute at answer time is now a first-class lever, not an afterthought, and it is one of the few levers an application builder can pull without waiting for a new model to be trained."
    }
  ]
};

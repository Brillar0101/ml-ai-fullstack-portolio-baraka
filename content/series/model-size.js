// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "model-size",
  "title": "Model size: what bigger actually buys you",
  "excerpt": "Parameters, training tokens, and the real meaning of a \"7B\" or \"70B\" model, without the marketing.",
  "category": "AI",
  "chapter": "Chapter 2",
  "tags": [
    "Model Size",
    "Scaling"
  ],
  "seriesNum": 19,
  "publishAt": "2026-04-08T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Suppose a team needs to classify incoming emails into a handful of categories, and someone proposes using the largest, most famous model available, because surely the biggest model gives the best results. They wire it up, and it works, and the bill at the end of the month is brutal for what amounts to sorting email, while each classification takes long enough that the inbox feels laggy. Swap in a model a fraction of the size and, for a task this easy, the classifications can come back just as good, for far less money, fast enough that the lag disappears. The lesson is the one this post is about: a bigger model is not automatically a better choice. It is a different trade, and the size number tells you when that trade is worth making."
    },
    {
      "type": "h2",
      "text": "What the size number actually means"
    },
    {
      "type": "p",
      "text": "Two numbers really define a model. The first is how many parameters it has, the learned weights, which is roughly its capacity to store patterns."
    },
    {
      "type": "p",
      "text": "The second, talked about less but just as important, is how many tokens it was trained on, which is how much it got to learn from. People fixate on parameter count, the \"7B\" or \"70B\" in a model's name, as if it were a quality score. It is closer to an engine size. A bigger engine can do more, and it also burns more fuel, costs more, and is heavier to move. More parameters can mean more capability, but they always mean more memory, more cost, and more latency, every single time you run it."
    },
    {
      "type": "h2",
      "text": "Walk the trade"
    },
    {
      "type": "p",
      "text": "Go back to the email classifier. Sorting an email into one of five buckets is not a hard reasoning task, so the huge model's extra capacity sat almost entirely unused while you paid full price for it on every message. The small model had more than enough capacity for the job, so it matched the quality at a fraction of the cost and latency."
    },
    {
      "type": "p",
      "text": "Now imagine a genuinely hard task instead, like writing nuanced legal analysis. There the big model's extra capacity earns its keep, and the small one would visibly fall short. Same two models, opposite verdict, and the only thing that changed was how much capability the task actually demanded. That is the whole decision: not \"which model is best\" in the abstract, but \"what does this task need.\""
    },
    {
      "type": "h2",
      "text": "Size words that actually mean something"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Parameter",
          "def": "one of the model's learned weights. Parameter count is a rough measure of capacity, not a quality score."
        },
        {
          "term": "Training tokens",
          "def": "the total amount of text the model was trained on, which matters as much as parameter count."
        },
        {
          "term": "Scaling",
          "def": "how quality changes as you add parameters and training data together."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Choosing a size without guessing"
    },
    {
      "type": "p",
      "text": "The instinct to start with the biggest model is exactly backwards. Start with a small one, measure it on your actual task, and only move up if your evaluation says it falls short. A smaller model, especially when paired with retrieval for knowledge or a light finetune for behavior, clears the bar for a huge share of real tasks at a fraction of the cost and speed. Reaching for the largest model first is how teams end up paying premium prices to do simple work slowly. And remember the other number: past a point, a smaller model trained on more and better data beats simply making the model bigger, which is why newer small models routinely outperform older large ones."
    },
    {
      "type": "h2",
      "text": "Newer and smaller often beats older and bigger"
    },
    {
      "type": "p",
      "text": "The fixation on parameter count also hides a moving target. Because how a model is trained keeps improving, a well-trained small model released this year routinely matches or beats a much larger model from a year or two ago. The bigger old model has more raw capacity, but the smaller new one was trained on more and better data with better methods, and that closes the gap and then some. So comparing models by size alone is like comparing cars by engine displacement across decades: it ignores everything that got better in between. The practical consequence is that you should re-check your assumptions periodically, because the small model that was not good enough last year may be more than good enough now, at a fraction of the cost you are currently paying."
    },
    {
      "type": "h2",
      "text": "What the size number cannot tell you"
    },
    {
      "type": "p",
      "text": "Finally, the parameter count says nothing about the two things you actually care about: whether the model is good at your specific task, and what it costs you to run. A model can be enormous and mediocre at your task, or modest and excellent at it, because capability is uneven across different kinds of problems. The only way to know is the habit this whole series keeps returning to: try a candidate on your own evaluation set and look at the result, the cost, and the latency together. The number in the model's name is marketing-adjacent. Your evaluation is the truth."
    },
    {
      "type": "h2",
      "text": "A simple starting rule"
    },
    {
      "type": "p",
      "text": "If you want one rule to begin from, it is this: default to a small or mid-size model, and make the big one earn its place. Start with something cheap and fast, run it on your real task, and look at the result. If it clears your bar, you are done and you have saved a fortune."
    },
    {
      "type": "p",
      "text": "If it falls short, try a better prompt or retrieval before you reach for raw size, because those often close the gap for far less money. Only when a genuinely harder model is what your evaluation says you need do you move up, and even then you move up one step rather than straight to the largest option on the menu. Bigger is a lever you pull deliberately when the task demands it, not the place a sensible team starts."
    },
    {
      "type": "h2",
      "text": "Right-sizing the model"
    },
    {
      "type": "p",
      "text": "Size is a cost as much as a capability. Pick the smallest model that passes your evaluation, because everything downstream, cost, speed, and how many users you can serve per dollar, gets easier the smaller you go. The email team did not have a quality problem. They had a \"we assumed bigger was better\" problem, and the fix was to let the evaluation, not the model's name, make the call."
    }
  ]
};

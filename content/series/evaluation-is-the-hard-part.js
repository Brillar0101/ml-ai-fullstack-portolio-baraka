// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "evaluation-is-the-hard-part",
  "title": "Why evaluation is the hard part",
  "excerpt": "Getting a model to produce an answer is easy. Knowing whether the answer is good is the real engineering problem.",
  "category": "AI",
  "chapter": "Chapter 3",
  "tags": [
    "Evaluation",
    "Quality"
  ],
  "seriesNum": 7,
  "publishAt": "2026-01-14T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "When Google first showed off Bard in early 2023, the promo included a single answer where the model claimed a space telescope had taken the first-ever picture of a planet outside our solar system. That was wrong. The first such image came years earlier. The error was right there in the marketing, one sentence, and when people caught it the story became \"Google's AI got a fact wrong on launch day.\" Alphabet's stock dropped sharply, shedding a reported hundred billion dollars in market value. One unchecked sentence."
    },
    {
      "type": "p",
      "text": "That is the whole lesson of evaluation in a single embarrassing example. Producing an answer is easy. Knowing whether the answer is good, before the world sees it, is the hard part, and it is where most of the real engineering lives."
    },
    {
      "type": "h2",
      "text": "Why it is genuinely hard"
    },
    {
      "type": "p",
      "text": "A math test has an answer key. Most useful AI output does not. A summary can be good in a dozen ways and bad in a dozen others, and two perfectly fine summaries can share almost no words. So you cannot just check the model's output against one correct string. You need ways to measure quality that survive the fact that there are many acceptable answers and no single key to grade against."
    },
    {
      "type": "h2",
      "text": "The telescope, step by step"
    },
    {
      "type": "p",
      "text": "Imagine you are Google the week before that demo. How would you have caught the bad fact? Not by reading one output and nodding, which is what clearly happened. You would assemble a set of real questions, write down what a correct answer must and must not say, and check the model against that set every time anything changed."
    },
    {
      "type": "p",
      "text": "The space-telescope claim would have failed a simple \"is this factually supported\" check. The failure was not that the model hallucinated. Models do that. The failure was shipping without a process that would have caught it."
    },
    {
      "type": "h2",
      "text": "The language of measurement"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Evaluation set",
          "def": "a curated set of inputs with clear criteria for a good answer, run every time something changes."
        },
        {
          "term": "Reference-based metric",
          "def": "a score comparing output to a known good answer, useful when one exists, like code that must pass tests."
        },
        {
          "term": "AI as a judge",
          "def": "using a capable model to score another model's output against a rubric you write, for open-ended tasks."
        }
      ]
    },
    {
      "type": "h2",
      "text": "The quieter failure: evaluation by vibes"
    },
    {
      "type": "p",
      "text": "The telescope error is the loud version. The common version is quieter and happens on ordinary teams every week. Someone builds a feature, tries it on five or six examples they thought of, likes what they see, and ships."
    },
    {
      "type": "p",
      "text": "That is **evaluation by vibes**, and it fails for a simple reason: the examples you think of are the easy, obvious ones, and the ones that break in production are the cases you did not imagine. A support-ticket summarizer can look flawless on the three tidy tickets you tested and fall apart on the angry, rambling, half-typed ticket a real customer sends at midnight. A handful of happy-path checks is not evaluation. It is a demo wearing evaluation's clothes."
    },
    {
      "type": "h2",
      "text": "Using AI to grade AI"
    },
    {
      "type": "p",
      "text": "For open-ended output at any real volume, you cannot have a human read everything, so a common move is **AI as a judge**: you take a capable model, hand it the output and a written rubric, and ask it to score against that rubric. Done well, it scales human-like judgment across thousands of cases. Done carelessly, it has its own biases worth knowing."
    },
    {
      "type": "p",
      "text": "A judge model often prefers longer, more confident-sounding answers even when they are not better, and it can favor a style it recognizes. So you do not take the judge's word blindly. You spot-check its scores against human ratings on a sample, and you keep the rubric concrete, \"does the answer cite the source and avoid claims not in it,\" rather than vague, \"is the answer good.\" A calibrated judge is a force multiplier. An unchecked one is a confident rubber stamp."
    },
    {
      "type": "h2",
      "text": "Building an eval set worth trusting"
    },
    {
      "type": "p",
      "text": "The asset that separates teams who iterate with confidence from teams who guess is an honest evaluation set. It does not need to be huge. It needs to be representative, which means it deliberately includes the hard, weird, and adversarial cases, not just the clean ones. Pull real examples from actual usage where you can, write down for each what a good answer must contain and must avoid, and keep the set private so no model could have trained on it."
    },
    {
      "type": "p",
      "text": "Then run it every time you change a prompt, a model, or a retrieval step. The score does not have to be perfect. It has to move when quality moves, so that every change becomes a measurement instead of a hope."
    },
    {
      "type": "h2",
      "text": "How teams actually do it"
    },
    {
      "type": "p",
      "text": "For tasks with a checkable answer, use it: code runs the tests, math checks the result. For open-ended tasks, build a small but honest evaluation set, write a clear rubric, and score against it with a mix of human review and a model judge. The goal is not a perfect number. It is a number that moves when quality moves, so a change you make is a measurement, not a guess."
    },
    {
      "type": "h2",
      "text": "One last trap: chasing the number"
    },
    {
      "type": "p",
      "text": "There is a failure that only shows up once you have an evaluation, and it is sneaky. Once a score becomes the target, people start optimizing the score instead of the quality it was supposed to stand for. You tweak prompts until your eval set reads 95 percent, ship it, and real users are no happier, because you quietly overfit to your own test."
    },
    {
      "type": "p",
      "text": "The number went up and the product did not. The defenses are simple: keep some examples held back that you never tune against, refresh the eval set with new real cases over time, and remember that the score is a proxy for quality, not quality itself. A metric you are gaming has stopped measuring anything."
    },
    {
      "type": "h2",
      "text": "Measure before you ship"
    },
    {
      "type": "p",
      "text": "Decide how you will measure success before you tune a single prompt, and never let an answer reach the public that an evaluation has not seen the likes of. Build a representative private eval set, score it with humans and a calibrated judge, hold some cases back so you cannot overfit, and treat a few happy-path examples as a demo, not a measurement. A team that can measure quality iterates with confidence. A team that cannot is one slick demo away from putting its own version of the telescope mistake in front of the world."
    }
  ]
};

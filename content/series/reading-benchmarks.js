// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "reading-benchmarks",
  "title": "How to read a benchmark without fooling yourself",
  "excerpt": "Leaderboards are useful and easy to misread. What a benchmark score does and does not tell you.",
  "category": "AI",
  "chapter": "Chapter 4",
  "tags": [
    "Benchmarks",
    "Evaluation",
    "Model Selection"
  ],
  "seriesNum": 25,
  "publishAt": "2026-05-20T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Say a new model launches and posts a stunning score on a popular reasoning benchmark, near the top of the leaderboard, and you pick it for your product. On your actual task it is mediocre, no better than the cheaper model you almost chose. The benchmark did not lie to you. You read it as a promise it never made, and you may have been fooled by a problem that quietly haunts these scores: the test answers had leaked into the model's training data."
    },
    {
      "type": "p",
      "text": "That last part is called contamination, and it is one of three reasons a leaderboard is a starting filter, not a verdict. Understanding all three keeps you from picking a model on a number that means less than it looks."
    },
    {
      "type": "h2",
      "text": "An exam the students have seen"
    },
    {
      "type": "p",
      "text": "A benchmark measures one specific skill, on one kind of data, scored one way. A high score says the model is good at that, not that it is good at your problem."
    },
    {
      "type": "p",
      "text": "Then it gets shakier. Because these models train on enormous scrapes of the internet, the benchmark's questions and answers can end up in the training data, so the model scores high by having effectively seen the test, not by reasoning. And small gaps between models are often noise, not real differences. Three ways to be misled, stacked on top of each other."
    },
    {
      "type": "h2",
      "text": "Reading one score honestly"
    },
    {
      "type": "p",
      "text": "Picture two models. Model A scores 90 on a famous math benchmark, model B scores 86. You assume A is smarter and ship it."
    },
    {
      "type": "p",
      "text": "But A's training data happened to include that benchmark's problems, so it partly memorized them, while B saw the test for the first time at evaluation. On a fresh set of problems neither has seen, B might actually do better. The leaderboard rewarded exposure, not ability. The only way to know which model is better for you is to test both on your own examples, ones that could not have leaked because you wrote them."
    },
    {
      "type": "h2",
      "text": "Decoding the leaderboard labels"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Benchmark",
          "def": "a fixed test set and scoring method used to compare models on a specific skill."
        },
        {
          "term": "Contamination",
          "def": "when benchmark questions leak into training data, so a model scores high by memory rather than skill."
        },
        {
          "term": "Private evaluation",
          "def": "your own held-out test, written from your task, that no model could have trained on."
        }
      ]
    },
    {
      "type": "h2",
      "text": "How to use them well"
    },
    {
      "type": "ul",
      "items": [
        "Use benchmarks to shortlist a few candidates, never to make the final call.",
        "Match the benchmark to your task. A coding score tells you little about summarizing support tickets.",
        "Treat small gaps as ties, because they are usually noise.",
        "Decide on your own private evaluation set, built from examples no model could have memorized."
      ]
    },
    {
      "type": "h2",
      "text": "Why contamination is so easy to fall into"
    },
    {
      "type": "p",
      "text": "It is tempting to assume contamination is rare or sloppy, but it is almost the natural state of things. Foundation models train on enormous scrapes of the public internet, and popular benchmarks are public, discussed, and copied all over that same internet. So the test questions, and often their answers, end up somewhere in the training data without anyone intending it. The model then scores high partly by recall rather than skill, the way a student who happened to see the exam beforehand scores well without being better at the subject. This is not a fringe worry, it is a structural feature of training on the open web, which is exactly why a fresh, private test you wrote yourself is the only one you can fully trust."
    },
    {
      "type": "h2",
      "text": "Why small gaps are usually noise"
    },
    {
      "type": "p",
      "text": "The other trap is reading too much into tiny differences. A benchmark is a finite set of questions, so a score has wiggle in it, the same way a poll of a few hundred people has a margin of error. A model that scores 88 and one that scores 87 are, for all practical purposes, tied, and which one comes out ahead can flip with a slightly different test set or a small change in how the test is run. Treating a one-point lead as meaningful is how teams pick a model for a difference that would vanish on a re-run. Unless the gap is large and consistent across several relevant benchmarks, treat near-ties as ties and let other factors, cost, speed, and your own evaluation, break them."
    },
    {
      "type": "h2",
      "text": "What benchmarks are still good for"
    },
    {
      "type": "p",
      "text": "None of this means benchmarks are useless, and it is worth being fair to them. They are a genuinely useful first filter. When a brand-new model appears, benchmark scores give you a quick, rough sense of whether it is in the right league for your kind of task, which saves you from testing every model ever released."
    },
    {
      "type": "p",
      "text": "They are also useful for tracking broad progress over time across the field. The mistake is not using benchmarks, it is letting them make the final decision. Use them to go from \"every model\" to \"a few promising candidates,\" then switch to your own evaluation to choose among those few."
    },
    {
      "type": "h2",
      "text": "A red flag to watch for"
    },
    {
      "type": "p",
      "text": "One pattern should make you especially skeptical: a model that posts a spectacular score on a famous benchmark but feels mediocre the moment you actually use it. That gap between the headline number and your hands-on experience is often the fingerprint of a model that was, intentionally or not, tuned to do well on popular tests. The fix is the same one this whole post argues for, and it is cheap: keep a small set of your own real examples that no model could have seen, and run any impressive new model on them before you believe the hype. Your lived experience with a model on your own task is worth more than any leaderboard, precisely because it is the one result that cannot be gamed in advance."
    },
    {
      "type": "h2",
      "text": "Read scores with suspicion"
    },
    {
      "type": "p",
      "text": "Let benchmarks narrow the field, then trust your own evaluation to pick the winner. A leaderboard score can be inflated by contamination, mismatched to your task, or inside the margin of noise, so it is a shortlist tool, not a verdict. The only test that fully counts is the one built from your data, which is also the one no model could have studied for in advance. Shortlist with the public scores, decide with your private ones, and you get the benefit of benchmarks without being fooled by them."
    }
  ]
};

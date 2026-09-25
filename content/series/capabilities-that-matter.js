// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "capabilities-that-matter",
  "title": "The leaderboard is not your job: which capabilities to measure",
  "excerpt": "A team picked the top-ranked model and it flopped in production. The fix is to measure the handful of capabilities your specific task actually needs.",
  "category": "AI",
  "tags": [
    "Evaluation",
    "Model selection",
    "Strategy"
  ],
  "seriesNum": 39,
  "publishAt": "2026-07-04T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Picture a team choosing a model the obvious way: they look up a leaderboard, pick the model sitting at the top, and wire it in. It flops. The answers are slow, they ramble past the length their UI can show, and they ignore half the formatting instructions the team carefully wrote."
    },
    {
      "type": "p",
      "text": "The model that \"won\" lost at the only contest that mattered, which was their product. The mistake was treating a single overall ranking as if it measured fitness for their job. It did not. It measured a general average, and your job is never the general average."
    },
    {
      "type": "p",
      "text": "The better way to choose is to stop asking \"which model is best\" and start asking \"which capabilities does my task actually need, and how does each model do on those.\" A model is not good or bad as a single fact. It is a bundle of separate strengths, and a product only leans on a few of them. Once you name the few your task depends on, model selection turns from a popularity contest into a targeted measurement, and the leaderboard becomes one weak input rather than the verdict."
    },
    {
      "type": "h2",
      "text": "The capabilities most products actually lean on"
    },
    {
      "type": "p",
      "text": "A handful of capabilities cover most real needs, and they are worth separating because a model can be strong in one and weak in another. There is **domain knowledge**, how much the model knows about your particular subject. There is **generation quality**, whether what it writes is accurate, coherent, and useful."
    },
    {
      "type": "p",
      "text": "There is **instruction-following**, whether it actually does what you told it, including the boring constraints like length and format. And there is the practical bundle of **cost and latency**, how much each call costs and how long users wait. A leaderboard score smears all of these into one number, which is exactly why it could not warn the team that their winner was a slow rule-ignorer."
    },
    {
      "type": "p",
      "text": "This is not just an engineer's hunch; it is what large-scale measurement finds when someone bothers to measure more than one thing. The [HELM project](https://arxiv.org/abs/2211.09110) at Stanford evaluated dozens of models on seven dimensions at once, accuracy, calibration, robustness, fairness, bias, toxicity, and efficiency, and the dimensions refuse to move together. A model's accuracy and its calibration, how well its confidence matches how often it is right, can pull in opposite directions on the same task."
    },
    {
      "type": "p",
      "text": "They also found that before this standardization, prominent models had been compared on under a fifth of the same test scenarios, so even the \"overall\" rankings people quoted were built from tests that barely overlapped. A single capability score is not summarizing a coherent thing. It is averaging a committee that disagrees."
    },
    {
      "type": "h2",
      "text": "Walk the team's real requirements"
    },
    {
      "type": "p",
      "text": "Look at what their product needed and the right model almost picks itself. The feature shows short answers in a fixed box, so instruction-following on length and format is critical, and the top-ranked model was weak there. Users interact live, so latency matters more than a few points of some abstract quality score."
    },
    {
      "type": "p",
      "text": "The subject is ordinary, so deep domain knowledge is not the bottleneck. Written out like that, the team's priorities are nothing like the leaderboard's priorities, and a model that ranks lower overall but nails instructions and responds fast is plainly the better choice for them. The leaderboard was answering a question they never asked."
    },
    {
      "type": "diagram",
      "title": "Which capability gates your task?",
      "root": {
        "label": "Is a person waiting on the answer live?",
        "color": "purple",
        "children": [
          {
            "edge": "yes",
            "node": {
              "label": "Latency and cost lead",
              "color": "yellow"
            }
          },
          {
            "edge": "no",
            "node": {
              "label": "Does the output feed code or a fixed UI?",
              "color": "blue",
              "children": [
                {
                  "edge": "yes",
                  "node": {
                    "label": "Instruction-following leads",
                    "color": "yellow"
                  }
                },
                {
                  "edge": "no",
                  "node": {
                    "label": "Is the subject specialized?",
                    "color": "blue",
                    "children": [
                      {
                        "edge": "yes",
                        "node": {
                          "label": "Domain knowledge leads",
                          "color": "yellow"
                        }
                      },
                      {
                        "edge": "no",
                        "node": {
                          "label": "Generation quality leads",
                          "color": "yellow"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      },
      "caption": "A first-pass triage. Most products end up with two leading capabilities, and that pair is what you measure candidates on."
    },
    {
      "type": "h2",
      "text": "Naming what you are measuring"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Domain knowledge",
          "def": "how much the model knows about your specific subject area. Matters most for specialized fields."
        },
        {
          "term": "Generation quality",
          "def": "whether the output is accurate, coherent, and genuinely useful for the task."
        },
        {
          "term": "Instruction-following",
          "def": "whether the model obeys what you actually told it, including constraints like length, format, and tone."
        },
        {
          "term": "Cost and latency",
          "def": "the price per call and the time to respond. Often the deciding factor for live, high-volume features."
        },
        {
          "term": "Benchmark",
          "def": "a standardized test producing a score. Useful as a rough signal, dangerous as a final verdict for your specific job."
        },
        {
          "term": "Preference leaderboard",
          "def": "a ranking built from people voting between anonymous model answers. It measures average helpfulness for its voters, not fitness for your task."
        },
        {
          "term": "Verifiable constraint",
          "def": "an instruction whose compliance plain code can check, like a word limit or valid JSON. The cheapest honest way to measure instruction-following."
        }
      ]
    },
    {
      "type": "h2",
      "text": "What a rank actually is"
    },
    {
      "type": "p",
      "text": "It helps to open up the most-quoted leaderboard and look at the machinery. [Chatbot Arena](https://arxiv.org/abs/2403.04132), described in a 2024 paper from its builders, works like this: visitors type any prompt they like, two anonymous models both answer, the visitor votes for the better one, and hundreds of thousands of such votes are fed into a statistical model that turns win rates into a single rating per model. So a rank on that board means, precisely: the average preference of that site's visitors, on prompts those visitors happened to ask. The paper is admirably honest about the edges of that claim."
    },
    {
      "type": "p",
      "text": "The voters skew toward enthusiasts and researchers rather than everyday users, the prompt mix is whatever the crowd brings rather than anyone's production traffic, and the votes measure helpfulness, not safety or reliability. None of that is a scandal. It is a well-run answer to a question that is simply not \"which model should power your product.\""
    },
    {
      "type": "p",
      "text": "Economists got to the deeper problem years before the current model boom. A [2020 paper by Ethayarajh and Jurafsky](https://arxiv.org/abs/2009.13888) framed leaderboards in terms of utility, the benefit a consumer gets from a thing, and pointed out a structural mismatch. To a leaderboard, only rank matters: a jump from third to first is everything, and an improvement that does not change rank is worth nothing. To you, quality is smooth, every real improvement helps."
    },
    {
      "type": "p",
      "text": "Worse, a rank prices the costs of using a model at exactly zero: size, speed, and energy do not move it at all. Their sharpest example is a family of small models like DistilBERT, which kept about 97 percent of a much larger model's quality while being 40 percent smaller and 60 percent faster. On a pure-accuracy board that model is a loser. In a product, it is very often the winner. Their proposed fix, notably, was to let every user re-weight the leaderboard by their own priorities, which is this post's argument wearing formal clothes."
    },
    {
      "type": "p",
      "text": "The reason a single ranking misleads is that it has to pick a weighting of all these capabilities, and whatever weighting it picked is almost certainly not yours. A leaderboard might weigh hard reasoning heavily because that is impressive to measure, while your product would trade all of that reasoning for lower latency and tighter instruction-following. Neither weighting is wrong in the abstract. They are just answers to different questions. When you accept a general ranking as your answer, you are silently adopting a stranger's priorities for your product, and then acting surprised when the result does not fit your priorities."
    },
    {
      "type": "p",
      "text": "There is a second reason to be wary, and it is better documented than most people realize: benchmark data leaks into training data. Researchers who study this, notably a [2023 paper by Sainz and colleagues](https://arxiv.org/abs/2310.18018), catalogue real cases rather than hypotheticals. One widely used training corpus was found to contain the test sets of popular benchmarks. GPT-4's own technical report dropped a benchmark from its evaluation after discovering some of its data in the training mix."
    },
    {
      "type": "p",
      "text": "And popular chat models have been shown to regenerate well-known evaluation datasets nearly verbatim on request, which is hard to do without having trained on them. When a model has seen the test, its score reflects familiarity as much as ability, and since the biggest models keep their training data secret, you usually cannot check. Benchmarks remain a cheap first filter. They must never be the last word, because you cannot audit what they secretly rehearsed."
    },
    {
      "type": "callout",
      "title": "The one-line version",
      "text": "A leaderboard rank is a stranger's weighted average of capabilities you may not need, measured on questions you will never be asked."
    },
    {
      "type": "p",
      "text": "It helps to picture two models side by side. One is a brilliant generalist that reasons through hard problems but takes its time and occasionally treats your formatting rules as suggestions."
    },
    {
      "type": "p",
      "text": "The other is plainer, knows less trivia, but answers in a heartbeat and follows instructions to the letter. On a leaderboard the first model wins and the second is forgotten. In a live product with a tight layout and impatient users, the second model is the one that keeps customers, and the first is a liability dressed as a champion. Same two models, opposite verdicts, and the only thing that changed was whose needs were doing the judging."
    },
    {
      "type": "h2",
      "text": "How to choose for your task instead"
    },
    {
      "type": "p",
      "text": "The procedure is the one this series keeps returning to, because it keeps being right: build a small evaluation set from your own real tasks, decide which two or three capabilities your product actually depends on, and score the candidate models on those specifically. Measure instruction-following by checking whether outputs obey your real constraints. Measure latency and cost by simply timing and pricing real calls. Measure domain knowledge and generation quality with the checkable or judge-based scoring from the evaluation posts. Now you are comparing models on the axes your users will feel, and the comparison produces a winner that is actually the winner for you, not for a leaderboard maintainer with different goals."
    },
    {
      "type": "p",
      "text": "Two of the four capabilities need nothing more than plain code and a stopwatch. Here is a scorer for the team's actual constraints, short answers, valid structure, no chatty preamble, plus timing:"
    },
    {
      "type": "lab",
      "height": 460,
      "title": "capability_check.py, scoring two models on real constraints",
      "caption": "Instruction-following and latency need nothing but plain code and a stopwatch. The verbose model fails every constraint this product actually has.",
      "code": "import json, time\n\n# ---- Two stand-in models\n# --------------------------------------------------\n# Scripted, not real. Each is written to have the habit the\n# post describes: the \"leaderboard winner\" is capable but\n# verbose and chatty, and the plainer model is terse and\n# obeys the format it was given.\ndef leaderboard_winner(prompt):\n    time.sleep(0.03)                      # stands in for a slower, larger model\n    return ('Sure! Here is a thorough answer to your question. '\n            '{\"answer\": \"Your plan renews on the 1st of each month, and you can '\n            'cancel any time from the billing page, which you will find under '\n            'account settings in the left-hand navigation menu.\"}')\n\ndef plainer_model(prompt):\n    time.sleep(0.01)\n    return '{\"answer\": \"Your plan renews monthly. Cancel any time in Billing.\"}'\n\ndef is_valid_json(out):\n    try:\n        json.loads(out)\n        return True\n    except Exception:\n        return False\n\n# ---- Your real constraints, written as code\n# -------------------------------\nLIMIT_WORDS = 30\n\ndef check_output(out):\n    return {\n        \"fits_the_box\":     len(out.split()) <= LIMIT_WORDS,\n        \"is_valid_json\":    is_valid_json(out),\n        \"has_answer_field\": '\"answer\"' in out,\n        \"no_preamble\":      not out.lstrip().startswith((\"Sure\", \"Here\")),\n    }\n\ndef score_model(model, cases):\n    start = time.perf_counter()\n    outputs = [model(c[\"input\"]) for c in cases]\n    avg_latency = (time.perf_counter() - start) / len(cases)\n    passed = [all(check_output(o).values()) for o in outputs]\n    return {\n        \"instruction_following\": sum(passed) / len(passed),\n        \"avg_latency_s\": round(avg_latency, 3),\n    }\n\nCASES = [{\"input\": \"when does my plan renew?\"},\n         {\"input\": \"how do I cancel?\"},\n         {\"input\": \"what is my billing date?\"}]\n\nfor name, model in [(\"leaderboard winner\", leaderboard_winner),\n                    (\"plainer model\", plainer_model)]:\n    s = score_model(model, CASES)\n    print(\"%-20s instruction-following %.2f   avg latency %.3fs\"\n          % (name, s[\"instruction_following\"], s[\"avg_latency_s\"]))\n\nprint()\nprint(\"Where the leaderboard winner fell down, check by check:\")\nfor k, v in check_output(leaderboard_winner(\"x\")).items():\n    print(\"   %-18s %s\" % (k, v))\n\n# Try it: raise LIMIT_WORDS to 120 and run again. The\n# verbose model still fails on no_preamble, which is the\n# constraint a length limit never catches.\n"
    },
    {
      "type": "p",
      "text": "Checks this simple are not a toy version of the real thing; they are the real thing. Google's IFEval benchmark is built entirely from such **verifiable constraints**, twenty-five types of them, word limits, forbidden words, exact formats, across roughly five hundred prompts, precisely because code-checkable rules are objective, reproducible, and free. And its headline result backs the whole argument of this post: under strict scoring, even the strongest model of its day failed to follow all the instructions in about one prompt out of five. Instruction-following is not a solved capability you can assume. It is a spread between models that you have to measure, and a few dozen lines of Python will measure it."
    },
    {
      "type": "diagram",
      "nodes": [
        {
          "label": "Leaderboards",
          "detail": "cheap first filter"
        },
        {
          "label": "Shortlist",
          "detail": "two or three candidates"
        },
        {
          "label": "Your eval set",
          "detail": "scored on your two or three capabilities"
        },
        {
          "label": "Your winner",
          "detail": "often not the public number one"
        }
      ],
      "caption": "Where a leaderboard belongs in the decision: the start of the funnel, never the end."
    },
    {
      "type": "p",
      "text": "Redo the choice this way and you may well land several rungs down the public ranking, on a model that answers fast and respects your formatting rules. Nothing about the leaderboard was dishonest. It simply measured a generic blend of abilities, and the team had mistaken that blend for their own needs. The durable habit is to translate \"pick a model\" into \"pick the capabilities that matter for this job, then measure those.\" Do that and you stop chasing the top of a list that was never ranking the thing you sell."
    },
    {
      "type": "sources",
      "items": [
        {
          "title": "Ethayarajh & Jurafsky, \"Utility is in the Eye of the User: A Critique of NLP Leaderboards\" (EMNLP 2020)",
          "url": "https://arxiv.org/abs/2009.13888"
        },
        {
          "title": "Liang et al., \"Holistic Evaluation of Language Models\" (HELM, 2022)",
          "url": "https://arxiv.org/abs/2211.09110"
        },
        {
          "title": "Zhou et al., \"Instruction-Following Evaluation for Large Language Models\" (IFEval, 2023)",
          "url": "https://arxiv.org/abs/2311.07911"
        },
        {
          "title": "Chiang et al., \"Chatbot Arena: An Open Platform for Evaluating LLMs by Human Preference\" (2024)",
          "url": "https://arxiv.org/abs/2403.04132"
        },
        {
          "title": "Sainz et al., \"NLP Evaluation in Trouble: On the Need to Measure LLM Data Contamination\" (EMNLP 2023 Findings)",
          "url": "https://arxiv.org/abs/2310.18018"
        }
      ]
    }
  ]
};

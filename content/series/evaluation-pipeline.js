// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "evaluation-pipeline",
  "title": "Building the ruler before you start cutting: an eval pipeline",
  "excerpt": "A team kept shipping \"improvements\" that made things worse and had no way to tell. The fix is a repeatable evaluation pipeline, the CI of AI features.",
  "category": "AI",
  "tags": [
    "Evaluation",
    "Pipeline",
    "Reliability"
  ],
  "seriesNum": 38,
  "publishAt": "2026-07-03T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Picture a team that tweaks the prompt behind their AI feature, decides the new version reads better, and ships it. Two days later support tickets tick up, and someone realizes the new prompt quietly broke a whole category of answers that the old one handled fine. They roll back, but now they are scared to change anything, because every change is a coin flip they cannot see the result of until users get hurt."
    },
    {
      "type": "p",
      "text": "The problem is not the prompt. The problem is that they have no ruler. They are cutting without measuring, and the fix is to build the ruler first: an **evaluation pipeline**."
    },
    {
      "type": "p",
      "text": "The cleanest way to think about an evaluation pipeline is that it is continuous integration for an AI feature. In normal software, you do not ship a code change and wait for users to tell you it broke. You have a test suite that runs automatically and tells you in seconds. An evaluation pipeline is the same idea adapted to a model: a fixed set of representative inputs, an automatic way to score the outputs, and a single number you trust, run against every candidate change before it reaches anyone. Once it exists, changing the prompt stops being a coin flip and becomes a measurement."
    },
    {
      "type": "h2",
      "text": "The whole machine at a glance"
    },
    {
      "type": "p",
      "text": "Before naming the parts, look at the shape. Cases go in on the left, every one of them runs through your system, the outputs get scored, and the scores decide whether the change ships. One more arrow matters as much as the straight line: whatever breaks in production comes back around and joins the dataset, so the ruler gets more honest every time it misses something."
    },
    {
      "type": "diagram",
      "title": "The evaluation pipeline, end to end",
      "nodes": [
        {
          "id": "dataset",
          "label": "Eval dataset",
          "icon": "datastore",
          "at": [
            0,
            1
          ]
        },
        {
          "id": "runner",
          "label": "Runner",
          "icon": "service",
          "at": [
            1,
            1
          ]
        },
        {
          "id": "checks",
          "label": "Code checks",
          "icon": "service",
          "at": [
            2,
            0
          ]
        },
        {
          "id": "judge",
          "label": "LLM judge",
          "icon": "model",
          "at": [
            2,
            1
          ]
        },
        {
          "id": "human",
          "label": "Human review",
          "icon": "user",
          "at": [
            2,
            2
          ]
        },
        {
          "id": "report",
          "label": "Score report",
          "icon": "datastore",
          "at": [
            3,
            1
          ]
        },
        {
          "id": "gate",
          "label": "Ship gate",
          "icon": "service",
          "at": [
            4,
            1
          ]
        }
      ],
      "edges": [
        {
          "from": "dataset",
          "to": "runner",
          "label": "cases"
        },
        {
          "from": "runner",
          "to": "checks",
          "route": "vh"
        },
        {
          "from": "runner",
          "to": "judge",
          "label": "outputs"
        },
        {
          "from": "runner",
          "to": "human",
          "route": "vh"
        },
        {
          "from": "checks",
          "to": "report",
          "route": "hv"
        },
        {
          "from": "judge",
          "to": "report"
        },
        {
          "from": "human",
          "to": "report",
          "route": "hv"
        },
        {
          "from": "report",
          "to": "gate",
          "label": "scores"
        }
      ],
      "groups": [
        {
          "label": "Scorers",
          "from": [
            2,
            0
          ],
          "to": [
            2,
            2
          ]
        }
      ],
      "caption": "An evaluation pipeline end to end. Failures caught in production feed back into the dataset on the left, which is how the ruler improves over time."
    },
    {
      "type": "h2",
      "text": "The four pieces"
    },
    {
      "type": "p",
      "text": "A pipeline has four parts, and the magic is entirely in assembling them, not in any one being clever. First, a dataset of representative inputs, the questions and cases your feature actually meets in the wild. Second, for each input, some notion of what a good answer looks like, whether that is a known-correct output, a reference answer, or a rubric."
    },
    {
      "type": "p",
      "text": "Third, a runner that feeds every input through the current version of your system and collects the outputs. Fourth, a scorer that compares each output against the standard and produces a number. Run those four in order and you get a score for any version of your system, which is exactly the thing the team was missing."
    },
    {
      "type": "h2",
      "text": "The team builds their ruler"
    },
    {
      "type": "p",
      "text": "They start by pulling a couple hundred real requests from their logs, deliberately including the category that just broke, because the cases that hurt you are the ones the dataset most needs. For each one they agree on what a good answer contains. Then they pick a scorer that fits the task: where there is a checkable answer they run it and check, and where the answer is open-ended they use a model judge with a written rubric, the two methods covered earlier in this series. Now they can run the whole set through the old prompt and the new prompt and see, in one number each, that the \"better-reading\" new prompt actually scored lower. The thing they shipped on a hunch would have been caught in minutes."
    },
    {
      "type": "h2",
      "text": "The scorer ladder"
    },
    {
      "type": "p",
      "text": "Scoring is where most pipelines are won or lost, and the mistake is treating it as one decision. Mature teams stack three layers. The bottom layer is **code checks**: plain deterministic tests such as is the output valid JSON, does it stay under the length limit, does the generated code compile, does the answer contain the required disclaimer. They cost nothing, run instantly, never change their mind, and catch a surprising share of real failures, so they always run first."
    },
    {
      "type": "p",
      "text": "The middle layer is the **LLM judge**, a capable model grading each output against a written rubric, which an earlier post in this series covered in depth. The judge handles everything code cannot check: tone, helpfulness, whether the answer actually resolved the question. The top layer is people. Humans are too slow and expensive to grade everything, so their job is calibration: grade a small sample by hand, compare it against the judge, and fix the rubric wherever the two disagree. A judge nobody has checked against human judgment is not a measurement, it is a second opinion wearing a lab coat."
    },
    {
      "type": "diagram",
      "title": "Which scorer grades this case?",
      "root": {
        "label": "Can plain code verify the output?",
        "color": "purple",
        "children": [
          {
            "edge": "yes: schema, exact match, tests",
            "node": {
              "label": "Code check",
              "color": "green"
            }
          },
          {
            "edge": "no: quality is open-ended",
            "node": {
              "label": "Can a written rubric capture what good looks like?",
              "color": "blue",
              "children": [
                {
                  "edge": "yes",
                  "node": {
                    "label": "LLM judge scored against the rubric",
                    "color": "yellow"
                  }
                },
                {
                  "edge": "ambiguous or high-stakes",
                  "node": {
                    "label": "Human review on a sample",
                    "color": "yellow"
                  }
                }
              ]
            }
          }
        ]
      },
      "caption": "Pick the cheapest scorer that can actually see the failure, and only climb the ladder when it cannot."
    },
    {
      "type": "p",
      "text": "Here is the heart of a runner that uses the ladder, small enough to read in one sitting:"
    },
    {
      "type": "lab",
      "height": 460,
      "title": "eval_runner.py, with a flaky case and an outage in the set",
      "caption": "The flaky row is the one that matters. It passes some runs and fails others, so a pipeline running each case once reports a confident PASS or FAIL and never tells you it was a coin flip.",
      "code": "import json, random\n\n# ---- Stand-ins for the two things you would really call\n# ------------------- \"system\" is your AI feature. \"judge\"\n# is a model scoring against a rubric. Both are scripted\n# here, so this lab is deterministic and needs no API key.\nrandom.seed(7)\n\nREPLIES = {\n    \"refund-policy\": '{\"answer\": \"Refunds in 30 days. [doc:policy-1]\"}',\n    \"no-citation\":   '{\"answer\": \"Refunds within 30 days.\"}',\n    \"broken-json\":   'Sure! Here is the answer you asked for.',\n}\n\ndef system(case_input):\n    if case_input == \"flaky\":\n        # A genuinely unstable case: right about half the\n        # time.\n        return ('{\"answer\": \"Annual plans renew. [doc:billing-4]\"}'\n                if random.random() < 0.5\n                else '{\"answer\": \"I am not sure about annual plans.\"}')\n    if case_input == \"outage\":\n        raise ConnectionError(\"provider timed out\")\n    return REPLIES[case_input]\n\ndef judge(rubric, case_input, out):\n    # A real judge is a model reading a rubric. This one\n    # only checks whether the rubric's required phrase\n    # survived into the answer.\n    return 1.0 if rubric.lower() in out.lower() else 0.0\n\ndef is_valid_json(out):\n    try:\n        json.loads(out)\n        return True\n    except Exception:\n        return False\n\n# ---- The pipeline itself\n# ---------------------------------------------------\nCHECKS = [\n    (\"valid_json\",   lambda out: is_valid_json(out)),\n    (\"cites_source\", lambda out: \"[doc\" in out),\n]\n\ndef run_case(system, judge, case, runs=5):\n    labels = []\n    for _ in range(runs):\n        try:\n            out = system(case[\"input\"])\n        except Exception:\n            labels.append(\"ERROR\")   # infra failed, not the model\n            continue\n        if not all(check(out) for _, check in CHECKS):\n            labels.append(\"FAIL\")    # free checks catch it first\n            continue\n        verdict = judge(case[\"rubric\"], case[\"input\"], out)\n        labels.append(\"PASS\" if verdict >= 0.7 else \"FAIL\")\n    scored = [l for l in labels if l != \"ERROR\"]\n    return {\n        \"case\": case[\"id\"],\n        \"stability\": scored.count(\"PASS\") / max(len(scored), 1),\n        \"errors\": labels.count(\"ERROR\"),\n    }\n\nCASES = [\n    {\"id\": \"happy\",       \"input\": \"refund-policy\", \"rubric\": \"30 days\"},\n    {\"id\": \"no-citation\", \"input\": \"no-citation\",   \"rubric\": \"30 days\"},\n    {\"id\": \"flaky\",       \"input\": \"flaky\",         \"rubric\": \"renew\"},\n    {\"id\": \"bad-json\",    \"input\": \"broken-json\",   \"rubric\": \"30 days\"},\n    {\"id\": \"outage\",      \"input\": \"outage\",        \"rubric\": \"30 days\"},\n]\n\n# ---- Report\n# ----------------------------------------------------------------\n# Colour follows status meaning, not decoration: green\n# passes, gold needs a human, red blocks the ship, grey is\n# infrastructure rather than quality.\nE = chr(27)\nDIM, OFF = E + \"[2m\", E + \"[0m\"\nOK, WARN, BAD, INFO = E + \"[32m\", E + \"[33m\", E + \"[31m\", E + \"[90m\"\nBOLD = E + \"[1m\"\n\ndef bar(v, width=10):\n    filled = round(v * width)\n    return \"#\" * filled + \".\" * (width - filled)\n\ndef classify(r):\n    if r[\"errors\"]:\n        return INFO, \"INFRA\", \"not a quality signal\"\n    if r[\"stability\"] == 1.0:\n        return OK, \"PASS\", \"\"\n    if r[\"stability\"] == 0.0:\n        return BAD, \"FAIL\", \"every run\"\n    return WARN, \"FLAKY\", \"coin flip, unnoticed\"\n\nRUNS = 5\nprint(BOLD + \"EVAL RUN\" + OFF + \"  %d cases x %d runs\" % (len(CASES), RUNS))\nprint(DIM + \"-\" * 46 + OFF)\nprint(DIM + \"%-12s %-12s %5s  %s\" % (\"CASE\", \"STABILITY\", \"RATE\", \"VERDICT\") + OFF)\n\nresults = []\nfor case in CASES:\n    r = run_case(system, judge, case, runs=RUNS)\n    results.append(r)\n    colour, verdict, note = classify(r)\n    print(\"%-12s %s%-12s%s %4.0f%%  %s%s%s\"\n          % (r[\"case\"], colour, bar(r[\"stability\"]), OFF,\n             r[\"stability\"] * 100, colour, verdict, OFF))\n    if note:\n        print(DIM + \"%-12s %s\" % (\"\", note) + OFF)\n\nprint(DIM + \"-\" * 46 + OFF)\n\nblocked = [r for r in results if not r[\"errors\"] and r[\"stability\"] < 1.0]\ninfra = [r for r in results if r[\"errors\"]]\ngate = BAD + \"BLOCKED\" + OFF if blocked else OK + \"CLEAR\" + OFF\nplural = lambda n, word: \"%d %s%s\" % (n, word, \"\" if n == 1 else \"s\")\nprint(BOLD + \"SHIP GATE\" + OFF + \"  %s  %s, %s\"\n      % (gate, plural(len(blocked), \"failing case\"),\n         plural(len(infra), \"infra error\")))\n\nprint()\nprint(DIM + \"The flaky case is the one to look at. It passes some runs\" + OFF)\nprint(DIM + \"and fails others, so a pipeline running each case once\" + OFF)\nprint(DIM + \"reports a confident PASS or FAIL and tells you nothing.\" + OFF)\n\n# Try it: set RUNS = 1 and run again. The flaky row becomes\n# a clean verdict, and nothing on screen warns you it was a\n# coin flip.\n"
    },
    {
      "type": "p",
      "text": "Two details in that snippet do more work than their size suggests. Each case runs five times because a model is not deterministic: a case that passes three runs out of five is not passing, it is a coin flip you have not noticed yet, and the **stability rate** makes that visible. And an exception from the API records an ERROR, never a FAIL, because an infrastructure hiccup is not a quality regression. Letting timeouts bleed into your score is how a team spends a day debugging a prompt that was never the problem."
    },
    {
      "type": "h2",
      "text": "What actually goes in the dataset"
    },
    {
      "type": "p",
      "text": "The word \"representative\" hides a recipe, and the recipe has four ingredients. **Happy paths** are the ordinary requests that must never break, and they anchor the score. **Edge cases** are the ambiguous, half-typed, oddly shaped requests real users send at midnight. **Adversarial cases** are the ones designed to bend the system: prompt injections, requests that dance around a policy, inputs meant to leak what they should not. And **past failures** are the cases that already hurt you once. Every production incident earns its case a permanent seat, which is why a two-year-old pipeline is so much smarter than a two-week-old one. A couple hundred cases mixing all four will tell you more than ten thousand happy paths ever could."
    },
    {
      "type": "p",
      "text": "One more cut matters when your system has stages. A RAG feature, retrieval feeding generation, deserves a score for each stage as well as for the whole, because an end-to-end number can tell you something broke and still leave you guessing which half to fix. Score retrieval on whether the right passages came back, score generation on what the model did with them, and the end-to-end score stops being a mystery when it moves."
    },
    {
      "type": "h2",
      "text": "Naming the moving parts"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Evaluation dataset",
          "def": "the fixed set of inputs you score every version against. Its representativeness decides whether the score means anything."
        },
        {
          "term": "Golden set",
          "def": "inputs paired with known-good answers, the gold standard you grade against."
        },
        {
          "term": "Scorer",
          "def": "the method that turns an output into a number: running it, comparing to a reference, or a model judge."
        },
        {
          "term": "Code check",
          "def": "a deterministic test on an output, like schema validity or length. Free, instant, and always run first."
        },
        {
          "term": "Stability rate",
          "def": "the share of repeated runs of the same case that pass. It exposes coin-flip behavior a single run hides."
        },
        {
          "term": "Threshold",
          "def": "the score below which a change is blocked from shipping. Decided before you measure, not after."
        },
        {
          "term": "Regression",
          "def": "a change that makes a previously-good case worse. The main thing the pipeline exists to catch."
        },
        {
          "term": "Offline vs online evaluation",
          "def": "offline runs against your fixed dataset before shipping. Online measures real user outcomes after shipping. You need both."
        }
      ]
    },
    {
      "type": "h2",
      "text": "The traps that make a pipeline lie to you"
    },
    {
      "type": "p",
      "text": "A pipeline can give you a confident number that is wrong, and there are two classic ways. The first is an unrepresentative dataset. If your two hundred cases are all easy and tidy while real traffic is messy, a high score tells you nothing about real performance, and you will ship a model that aces the test and fails the users. The dataset has to mirror reality, edge cases and ugliness included, and it has to be refreshed as real traffic shifts, or it slowly drifts away from the thing it is supposed to measure. A stale evaluation set is worse than none, because it gives false confidence."
    },
    {
      "type": "p",
      "text": "The second trap is overfitting to your own test. If you keep tweaking the prompt until the score on your fixed dataset goes up, you eventually learn the quirks of that specific dataset rather than genuinely improving, the same way a student who memorizes last year's exam does not actually learn the subject. The defense is to keep some evaluation data held back and not look at it while you iterate, so it can give you an honest read at the end. The score is a proxy for real quality, and the moment you start optimizing the proxy for its own sake, it stops tracking the thing you care about."
    },
    {
      "type": "p",
      "text": "There is a third trap the first two overshadow: trusting a single run. Ask a model the same question twice and you can get two different answers, so a case that \"passed\" once may fail the next three tries. A pipeline that runs everything once is measuring noise and calling it signal. Run each case several times, score the stability, and keep infrastructure errors in their own column instead of counting them as failures, or a flaky Tuesday at your API provider will read as a quality regression in your prompt."
    },
    {
      "type": "h2",
      "text": "Gate it, then version everything"
    },
    {
      "type": "p",
      "text": "A pipeline that runs when somebody remembers is a dashboard, not a ruler. The step that changes behavior is wiring it into the same machinery that guards your code: every change to a prompt, a model choice, or a retrieval setting triggers the evaluation suite, the results land next to the change for review, and a score below the **threshold** blocks the ship, exactly the way a failing test blocks a merge. The threshold is agreed on before anyone measures, because a bar you set after seeing the score is not a bar, it is a rationalization."
    },
    {
      "type": "p",
      "text": "Gating only works if you can trust what a score refers to, and that is a versioning problem. A score is meaningless on its own. It describes a specific prompt, a specific model at a specific temperature, a specific dataset, and a specific judge reading a specific rubric. Change any of those silently and the numbers stop being comparable across time, which is how a team ends up arguing about whether quality \"really\" dropped."
    },
    {
      "type": "p",
      "text": "So version all of them together, record every one of them with every run, and store the results somewhere history survives. When the score moves, you want to spend your minutes fixing the cause, not reconstructing what changed."
    },
    {
      "type": "h2",
      "text": "Offline is not the whole story"
    },
    {
      "type": "p",
      "text": "Everything so far is **offline evaluation**: running against a fixed dataset in a lab before you ship. It is essential and it is not sufficient, because no fixed dataset perfectly predicts how real people will use the thing. That is why mature teams pair it with **online evaluation**: once a change is live, they watch real outcomes, like whether users accepted the answer, asked a follow-up out of frustration, or escalated to a human. Offline evaluation tells you a change is safe enough to try. Online evaluation tells you whether it actually helped the people you built it for, and the two together close the loop that a single number never could."
    },
    {
      "type": "callout",
      "title": "The loop that compounds",
      "text": "Every production failure becomes a permanent test case. File the incident, add the case to the dataset, and that exact mistake can never ship quietly again. A team that does this for a year owns an evaluation set no vendor could sell them."
    },
    {
      "type": "p",
      "text": "The team's fear of changing things went away once the ruler existed. Every prompt change now runs through the pipeline first, a regression shows up as a lower number instead of as a support ticket, and shipping became something they could do with their eyes open. That is the entire return on building the pipeline: not that your AI feature gets magically better, but that you can finally tell whether each change made it better or worse before your users find out for you. Build the ruler before you start cutting, and keep it honest, and the rest of the work gets a great deal calmer."
    },
    {
      "type": "sources",
      "items": [
        {
          "title": "Braintrust, \"The complete guide to LLM evaluation\"",
          "url": "https://www.braintrust.dev/articles/llm-evaluation-guide"
        },
        {
          "title": "Chrome for Developers, \"Build an evaluation pipeline\"",
          "url": "https://developer.chrome.com/docs/ai/evals/pipeline"
        },
        {
          "title": "Datadog, \"LLM evaluation frameworks\"",
          "url": "https://www.datadoghq.com/knowledge-center/llm-evaluation-frameworks/"
        },
        {
          "title": "AWS Machine Learning Blog, \"Build an automated generative AI evaluation pipeline with Amazon Nova\"",
          "url": "https://aws.amazon.com/blogs/machine-learning/build-an-automated-generative-ai-solution-evaluation-pipeline-with-amazon-nova/"
        },
        {
          "title": "NVIDIA Technical Blog, \"Mastering LLM techniques: evaluation\"",
          "url": "https://developer.nvidia.com/blog/mastering-llm-techniques-evaluation/"
        }
      ]
    }
  ]
};

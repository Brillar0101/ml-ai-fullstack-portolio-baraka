// AI Engineering series post, rewritten against research papers.
// Rendered by src/pages/blog/SeriesPost.jsx and scheduled in src/data/seriesPosts.js.
// Every factual claim is cited to the numbered sources at the end. HELM Figure 26
// is reproduced under CC BY 4.0 (arXiv 2211.09110); the bar chart is redrawn from
// Table 2 of Gema et al. (arXiv 2406.04127, CC BY 4.0).
export const POST = {
  "id": "capabilities-that-matter",
  "title": "Auditing a leaderboard number: what MMLU hides and what to measure instead",
  "excerpt": "An audit of MMLU found errors in 57% of sampled Virology questions and an estimated 6.49% error rate overall. Add HELM's other metrics and Chatbot Arena's preference votes, and a single leaderboard score says little about which model fits your application.",
  "category": "AI",
  "tags": [
    "Evaluation",
    "Model selection",
    "Benchmarks"
  ],
  "seriesNum": 39,
  "publishAt": "2026-07-04T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In 2024 a team at the University of Edinburgh and partner institutions sat down with 100 randomly chosen questions from the Virology section of MMLU, the widely used multiple-choice benchmark, and checked each one against its original source. They reported that 57% of those questions had some kind of error.[^1] One question asked for the best option for preventing future outbreaks of Ebola. The answer key picked sending American and European army teams into West Africa.[^1]"
    },
    {
      "type": "p",
      "text": "Across all 57 subjects, their re-annotated set of 5,700 questions, built by 14 human experts, led them to estimate that 6.49% of MMLU questions contain errors.[^1] In the subjects where errors cluster, that was enough to reorder the top models.[^1] So before trusting a leaderboard number to pick a model, it helps to audit what the number is made of. This post does that for MMLU, line by line, and then asks what a builder should measure instead."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Benchmark",
          "def": "A fixed set of test items with a scoring rule. MMLU is one: multiple-choice questions, scored by the fraction answered correctly."
        },
        {
          "term": "Ground truth",
          "def": "The answer the benchmark counts as correct. If the key is wrong, a model that answers correctly gets marked down."
        },
        {
          "term": "Calibration",
          "def": "Whether a model's stated confidence matches how often it is right. A calibrated model that says 80% is right about 80% of the time."
        },
        {
          "term": "Robustness",
          "def": "How much accuracy holds up when the input is perturbed in ways that should not change the answer, such as typos."
        },
        {
          "term": "Pairwise preference",
          "def": "A human sees two anonymous answers to the same prompt and picks the better one. Chatbot Arena ranks models from many such votes."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Line item one: the answer key is wrong more often than you would guess"
    },
    {
      "type": "p",
      "text": "The Edinburgh study, published as \"Are We Done with MMLU?\" by Gema and colleagues, sorted each bad question into a small tree of error types. A question can be unclear, for example by referring to \"question 21\" that the model never sees. Its options can be garbled, often from a parsing mistake that split one option into two. Or the key itself can fail: no option is correct, several are, or the marked answer is simply the wrong one.[^1]"
    },
    {
      "type": "p",
      "text": "The errors were not spread evenly. In Virology, the figure caption reports 33% of the sampled questions with a wrong ground truth, 14% with unclear questions, and 4% with more than one correct answer.[^1] More than 20% of sampled questions were wrong in Logical Fallacies and College Chemistry, and more than 10% in Professional Law, Business Ethics, Formal Logic, Human Aging, Global Facts, Machine Learning, Miscellaneous and Public Relations.[^1] The causes ranged from the plain to the strange. In College Chemistry, questions that spanned several lines in the source were parsed so that part of the question became option A and the real option D fell off.[^1] In Formal Logic, one question marks (F ∧ L) ∧ ¬C as correct and F ∧ L ∧ ¬C as incorrect, though the two formulas are equivalent.[^1]"
    },
    {
      "type": "p",
      "text": "Does this change which model looks best? The authors re-scored ten leading models on the five subjects with the most errors, once on all questions and once on only the questions their annotators judged correct. In Virology, Llama 3.1 Instruct Turbo (405B) ranked 16th on all questions and first on the clean ones.[^1] In Human Sexuality, Gemini 1.5 Pro (001) went from 0.37 exact match and 55th place to 0.94 and 6th.[^1] The ranks here are positions on the larger HELM MMLU leaderboard the authors compared against, so the ten models below are a slice of a longer list."
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "MMLU Virology, six models: all questions vs. only error-free questions",
      "yLabel": "Exact match",
      "series": [
        {
          "label": "All Virology questions",
          "key": "all",
          "baseline": true
        },
        {
          "label": "Only questions judged correct",
          "key": "clean"
        }
      ],
      "data": [
        {
          "label": "Sonnet 3.5",
          "values": {
            "all": 0.6,
            "clean": 0.91
          }
        },
        {
          "label": "GPT-4o",
          "values": {
            "all": 0.6,
            "clean": 0.91
          }
        },
        {
          "label": "GPT-4 0613",
          "values": {
            "all": 0.6,
            "clean": 0.86
          }
        },
        {
          "label": "Llama 405B",
          "values": {
            "all": 0.57,
            "clean": 0.93
          }
        },
        {
          "label": "Qwen2 72B",
          "values": {
            "all": 0.56,
            "clean": 0.88
          }
        },
        {
          "label": "Gemini 001",
          "values": {
            "all": 0.55,
            "clean": 0.91
          }
        }
      ],
      "caption": "On the full Virology set, where roughly a third of the sampled keys were wrong, these six models sit within five points of each other. On the cleaned questions the order changes: Llama 3.1 405B moves from fourth of these six to first, and GPT-4 (0613) from tied first to last. Redrawn from Table 2 of Gema et al., 2024.[^1]"
    },
    {
      "type": "p",
      "text": "There is a second, odder signal in the same data. Scored against the original key, models should do worse on the questions flagged as erroneous, and in most subjects they did. In Professional Law and Formal Logic they did about as well, or better.[^1] A model should not be able to agree with a broken key by reasoning. The authors read this as possible evidence that those questions were memorised during pretraining.[^1]"
    },
    {
      "type": "h2",
      "text": "Line item two: which capability a question actually tests"
    },
    {
      "type": "p",
      "text": "MMLU was built to measure breadth. Its original paper describes 57 tasks and 15,908 questions, collected by graduate and undergraduate students from freely available sources such as practice questions for the GRE and the US Medical Licensing Examination.[^2] The same paper found that models were \"lopsided\": strong in some subjects and near chance in others, including socially important ones such as morality and law.[^2] A single average hides that shape by design."
    },
    {
      "type": "p",
      "text": "Reading the questions closely shows a second problem, which is that a subject label does not tell you what a question asks for. Gema and colleagues note that Professional Law and Accounting assume US jurisdiction and practice without saying so.[^1] Almost every Global Facts question needed an outside source to check, often a specific report from ourworldindata.org, and for several questions the sources disagreed with each other.[^1] Some Machine Learning quiz questions rely on older knowledge that may no longer apply.[^1] A high score on the Professional Law subset is partly a score for knowing that the unstated context is American. A high Global Facts score partly measures whether a model absorbed particular statistics tables."
    },
    {
      "type": "p",
      "text": "If a question can be answered by recall of a leaked answer key, it tests memory. If it depends on unstated national context, it tests an assumption. Neither is the capability named on the subject label, and neither shows up in the leaderboard cell."
    },
    {
      "type": "h2",
      "text": "Line item three: the metrics that accuracy leaves out"
    },
    {
      "type": "p",
      "text": "Accuracy is only one column. The Holistic Evaluation of Language Models project (HELM), led by Liang and colleagues at Stanford, measured seven metrics for each of 16 core scenarios: accuracy, calibration, robustness, fairness, bias, toxicity and efficiency.[^3] Before HELM, the 30 models it studied had on average been evaluated on just 17.9% of its core scenarios, and some prominent models did not share a single scenario. HELM raised that to 96.0% under the same prompting conditions.[^3] Many of the comparisons people quoted before HELM were between scores on different tests."
    },
    {
      "type": "p",
      "text": "Once every model sat the same tests, the metrics did not move together. Calibration was the clearest case. On HellaSwag, higher accuracy went with worse calibration; on OpenBookQA, a similar commonsense question set, higher accuracy went with better calibration.[^3] The authors called the finding that more robust and fairer models can be less well calibrated \"counter-intuitive and surprising.\"[^3] The MMLU paper had already found GPT-3 poorly calibrated on its own test, with the gap between confidence and accuracy reaching 24% on some subjects.[^2]"
    },
    {
      "type": "p",
      "text": "Robustness mostly tracked accuracy, but not always. On NarrativeQA, TNLG v2 (530B), the third most accurate model there, dropped from 72.6% accuracy to 38.9% when HELM applied robustness perturbations such as typos.[^3] In the overall head-to-head comparisons, BLOOM (176B) did better on robustness and fairness than its accuracy suggested, and OPT (175B) and GLM (130B) roughly swapped places between the accuracy and robustness rankings.[^3] The harm metrics diverged further. T0++ (11B) was the most toxic model compared with all others but among the three least gender-biased; davinci (175B) was among the four most biased but one of the less toxic.[^3]"
    },
    {
      "type": "image",
      "src": "/blog-images/capabilities-that-matter/helm-win-rates.webp",
      "alt": "Six horizontal bar charts, one per metric: accuracy, calibration error, robustness, fairness, bias and toxicity. Each lists about 25 models ordered by head-to-head win rate. text-davinci-002 tops accuracy, robustness and fairness but sits ninth from the top of the calibration error panel, where the top is worst. The bias and toxicity orderings look very different from the accuracy ordering.",
      "width": 1960,
      "height": 1590,
      "caption": "Head-to-head win rate for each model on each metric, across HELM's core scenarios. For calibration error, bias and toxicity, the top of the list is worst. The order that tops accuracy does not carry over to the right-hand panels. Figure 26 from Liang et al., 2022,[^3] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)."
    },
    {
      "type": "p",
      "text": "The figure makes the point quickly. text-davinci-002 won more than 90% of its accuracy comparisons, the clearest leader in the study.[^3] In the calibration error panel, where a higher bar means the model more often had the larger error, it sits ninth from the worst end of 24 models.[^3] Efficiency behaved differently again. HELM saw only weak correlations between efficiency and the other metrics, no strong overall trade-off between accuracy and efficiency, and only a subset of models on the accuracy and efficiency frontier for any given scenario.[^3] The authors left efficiency out of the head-to-head rankings entirely, because they did not think it meant anything without accuracy beside it.[^3]"
    },
    {
      "type": "p",
      "text": "HELM's authors draw the consequence themselves. They write that they \"cannot simply rank models by accuracy to get a total order,\" and that they do not believe a universal aggregation exists that \"satisfies all preferences, reflects all values, or captures all circumstances appropriately.\"[^3] Their own example of a circumstance is an organization deploying on mobile, which should give the efficiency results more weight.[^3]"
    },
    {
      "type": "h2",
      "text": "Line item four: what people prefer is a different ranking"
    },
    {
      "type": "p",
      "text": "Chatbot Arena, described by Chiang and colleagues at Berkeley, ranks models a different way. A visitor types a prompt, two anonymous models answer, and the visitor votes for the better one; the names appear only after the vote. At the time of the paper it had collected over 240,000 votes from about 90,000 users.[^4] Because the prompts are open ended and fresh, there is no fixed answer key to go wrong or leak into training data.[^4] The authors checked vote quality by having graduate students label a sample blind, with fact-checking. Crowd votes agreed with those experts 72% to 83% of the time, and the two experts agreed with each other 79.4% and 89.8% of the time.[^4]"
    },
    {
      "type": "p",
      "text": "Two things in the Arena paper matter for model choice. First, strength depends on topic. The authors' topic clustering found 600 clusters, the largest covering only 1% of prompts.[^4] In one comparison on prompts sampled from several clusters, scored by a GPT-4 judge rather than by users, GPT-4 beat Llama-2-70b-chat in 96.7% of Python game programming prompts but only 53.3% of movie recommendation prompts.[^4] Second, the ranking has error bars. In the paper's ranking, gpt-4-0613 could sit anywhere from 3rd to 7th, and claude-2.1 from 6th to 18th.[^4] Much of a leaderboard's middle is a statistical tie."
    },
    {
      "type": "p",
      "text": "How far does a preference ranking differ from MMLU's ranking? A separate study, MixEval by Ni and colleagues, measured the Spearman rank correlation between many benchmarks and Arena Elo. MMLU came in at 0.83.[^5] That is well above chance, and still leaves room for models to trade places. The same study found that 10 of 13 general-domain benchmarks correlated above 0.5 with Arena, but only 1 of 8 domain-specific ones did.[^5] If your product lives in one domain, a general preference ranking and a domain test can point different ways."
    },
    {
      "type": "h2",
      "text": "Reading the audit for your own application (the author's reading)"
    },
    {
      "type": "p",
      "text": "What follows is my interpretation of these papers, not a finding in any of them. The audit shows that a leaderboard number bundles four things: the quality of the answer key, the capabilities the items happen to test, the single metric chosen, and the population of prompts or voters. When you pick a model, you get to choose all four for yourself, and you should."
    },
    {
      "type": "p",
      "text": "Start with the metric list, not the model list. HELM's seven metrics are a good menu. For a support bot that routes tickets, calibration may matter more than raw accuracy, since the system has to know when to hand off to a person. For something that reads messy user text, robustness to typos is the capability to test, and the NarrativeQA drop shows that accuracy on clean input can hide a large gap there.[^3] For a phone app or a high-volume pipeline, HELM's own advice is to weight efficiency.[^3]"
    },
    {
      "type": "p",
      "text": "Then write items that test the capability you named. The MMLU audit is a warning about what happens when you do not. If your legal assistant serves Kenya, a test that silently assumes US law measures the wrong thing.[^1] Keep the set small enough that someone can check every answer key by hand, because errors at MMLU's rate were enough to reorder close models in its worst subjects.[^1] Watch for items the models might have seen: questions lifted from public exams or documentation invite recall rather than reasoning.[^1]"
    },
    {
      "type": "p",
      "text": "Finally, treat public rankings as a filter, not a verdict. A model near the top of Arena or MMLU is a reasonable candidate. The difference between the third and seventh place models may not be real, and the topic breakdown suggests your task may sit in a cluster where the gap is narrow or reversed.[^4] A shortlist of three models run on a hundred of your own checked prompts, scored on the two or three metrics that fit the job, will usually tell you more than the leaderboard did."
    },
    {
      "type": "h2",
      "text": "What the Arena authors say their own ranking cannot see"
    },
    {
      "type": "p",
      "text": "The Chatbot Arena paper is candid about its reach. Its authors expect their users to be mostly LLM hobbyists and researchers keen to try the newest models, which may skew who is voting.[^4] The prompts come from their own chat interface, which, they write, \"might not accurately reflect the real-world usage of LLMs in production environments or specialized domains.\"[^4] And the study assesses helpfulness but overlooks safety, which they say calls for a parallel evaluation mechanism of its own.[^4]"
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        {
          "title": "Gema et al., \"Are We Done with MMLU?\" (2024; arXiv 2406.04127)",
          "url": "https://arxiv.org/abs/2406.04127"
        },
        {
          "title": "Hendrycks et al., \"Measuring Massive Multitask Language Understanding\" (ICLR 2021; arXiv 2009.03300)",
          "url": "https://arxiv.org/abs/2009.03300"
        },
        {
          "title": "Liang et al., \"Holistic Evaluation of Language Models\" (TMLR 2023; arXiv 2211.09110)",
          "url": "https://arxiv.org/abs/2211.09110"
        },
        {
          "title": "Chiang et al., \"Chatbot Arena: An Open Platform for Evaluating LLMs by Human Preference\" (2024; arXiv 2403.04132)",
          "url": "https://arxiv.org/abs/2403.04132"
        },
        {
          "title": "Ni et al., \"MixEval: Deriving Wisdom of the Crowd from LLM Benchmark Mixtures\" (NeurIPS 2024; arXiv 2406.06565)",
          "url": "https://arxiv.org/abs/2406.06565"
        }
      ]
    }
  ]
};

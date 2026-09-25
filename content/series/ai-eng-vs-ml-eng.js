// Every factual claim below is taken from the numbered sources at the end.
// The chart is redrawn from Table II of Amershi et al. 2019 (IEEE, not openly
// licensed); Parnin et al. (arXiv 2312.14231) is under arXiv's non-exclusive
// license, so its workflow figure is described in text, not reproduced.
export const POST = {
  "id": "ai-eng-vs-ml-eng",
  "title": "What changed when engineers stopped training the model",
  "excerpt": "A 2019 Microsoft study that surveyed 551 ML practitioners and a 2023 interview study of 26 engineers building LLM copilots, read side by side: where the data work went, why every test became flaky, and what \"the model\" means when you rent it.",
  "category": "AI",
  "chapter": "Chapter 1",
  "tags": [
    "AI Engineering",
    "ML",
    "Software Engineering"
  ],
  "seriesNum": 17,
  "publishAt": "2026-03-25T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "One engineer building an LLM feature told Microsoft researchers how their team decides whether a test passed: \"that's why we run each test 10 times,\" and a test counts as passing only if 7 of the 10 runs pass.[^1] The interview is part of a 2023 study by Chris Parnin and colleagues at Microsoft and GitHub, who talked to 26 professional software engineers building product copilots, meaning features that turn a user's request into a prompt for a large language model and turn the model's text back into something the product can use.[^1]"
    },
    {
      "type": "p",
      "text": "The paper files that quote under a heading that reads \"Every test is a flaky test.\" A flaky test is one that passes on some runs and fails on others with no change to the code. With a generative model, the authors write, each response might differ from the last, so writing an assertion (a line that checks the output equals what you expect) became hard.[^1] The study is qualitative and does not count how many of the 26 raised this theme. It names who did what: P1 ran tests ten times, P2 warned that a prompt working in one scenario is no guarantee for another, and P24 and P4 kept hand-curated spreadsheets with hundreds of input and output examples that had to be updated by hand whenever the prompt or model changed.[^1]"
    },
    {
      "type": "p",
      "text": "Four years earlier, a different Microsoft team had asked what makes machine learning engineering different from ordinary software engineering. Read side by side, the two studies show which parts of the older job moved, which parts shrank, and which parts came back in a new form. One detail matters for everything below. Parnin's team deliberately excluded engineers with extensive data science or machine learning backgrounds, because they wanted people representative of the general software engineering population.[^1] So the comparison is between a 2019 sample full of ML specialists and a 2023 sample screened to leave them out, and some of the gap is about the people, not only the technology."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Foundation model",
          "def": "A model trained on broad data, usually with self-supervision at scale, that can be adapted to many downstream tasks. GPT-3, BERT and CLIP are the examples in the report that coined the term.[^5]"
        },
        {
          "term": "Prompt",
          "def": "The text sent to a language model that starts its generation and defines the task.[^1]"
        },
        {
          "term": "Context",
          "def": "The part of a prompt that carries examples, documents to ground the answer, and the user's input, as distinct from the instructions.[^4]"
        },
        {
          "term": "Feature engineering",
          "def": "Extracting and selecting the informative inputs a trained model learns from.[^2]"
        },
        {
          "term": "Metamorphic testing",
          "def": "Checking properties of an output (its structure, whether it was truncated) rather than its exact contents.[^1]"
        }
      ]
    },
    {
      "type": "h2",
      "text": "Microsoft, 2019: nine stages and 551 survey answers"
    },
    {
      "type": "p",
      "text": "Saleema Amershi and eight colleagues interviewed 14 people, most of them in senior leadership roles, then sent a questionnaire to 4,195 members of internal AI and ML mailing lists. 551 responded, a 13.6% response rate. By role, 42% came from data and applied science, 32% from software engineering, 17% from program management and 7% from research.[^2] The paper appeared at ICSE's Software Engineering in Practice track in 2019.[^2]"
    },
    {
      "type": "p",
      "text": "The workflow they describe has nine stages: model requirements, data collection, data cleaning, data labeling, feature engineering, model training, model evaluation, model deployment and model monitoring.[^2] Labeling means assigning a ground truth answer to each record, done by engineers, domain experts or crowd workers. The figure is drawn as a line, but the authors stress that the real process loops: evaluation and monitoring can send a team back to any earlier stage, and daily work means frequent iteration over the model, its hyperparameters (settings chosen before training, such as learning rate) and the dataset.[^2]"
    },
    {
      "type": "p",
      "text": "The survey asked respondents to name their challenges, and the team sorted the answers into categories. Grouped by personal years of AI experience into low, medium and high thirds (308 people had usable experience data), one category ranked first in every group: data availability, collection, cleaning and management.[^2] Other categories moved with experience. Education and training ranked first for the least experienced and ninth for the most. Tools, scale, and model evolution, evaluation and deployment went the other way.[^2]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Challenges that grew with AI experience (Microsoft survey)",
      "yLabel": "Change vs low-experience group (%)",
      "series": [
        {
          "label": "Medium vs low",
          "key": "m"
        },
        {
          "label": "High vs low",
          "key": "h"
        }
      ],
      "data": [
        {
          "label": "Specification",
          "values": {
            "m": 2,
            "h": 50
          }
        },
        {
          "label": "Pipeline",
          "values": {
            "m": 65,
            "h": 41
          }
        },
        {
          "label": "AI tools",
          "values": {
            "m": 144,
            "h": 193
          }
        },
        {
          "label": "Scale",
          "values": {
            "m": 154,
            "h": 210
          }
        },
        {
          "label": "Model eval, deploy",
          "values": {
            "m": 137,
            "h": 276
          }
        }
      ],
      "caption": "Redrawn from Table II of Amershi et al., 2019.[^2] Each bar is how much more often a challenge was reported in that experience group than in the low-experience group (N=308). Categories that fell with experience, such as education and training (down 69% and 78%), are left out because the chart has no negative axis. \"Pipeline\" is end-to-end pipeline support; the last group is model evolution, evaluation and deployment."
    },
    {
      "type": "p",
      "text": "A logistic regression pointed the same way. Education and training as a challenge correlated negatively with personal AI experience (coefficient -0.18, p < 0.02), and tool issues correlated positively with team AI experience (0.13, p < 0.001).[^2] The authors read this as a split between transitory problems that fade as people learn and problems fundamental to the work that stay no matter how senior you get.[^2] Data, ranked first at every experience level, fits the second description."
    },
    {
      "type": "h2",
      "text": "Copilot builders in 2023: four stages and a playground"
    },
    {
      "type": "p",
      "text": "Parnin's group recruited 14 engineers at Microsoft working on publicly announced copilot products, then 12 more from other companies through a recruiting platform. Everyone spent at least 20 hours a week on AI features. Interviews ran about 45 minutes and ended with participants critiquing a draft workflow diagram, which the researchers revised after each session.[^1]"
    },
    {
      "type": "p",
      "text": "The final diagram has four boxes. Exploration covers business scenarios, company data, tooling and proofs of concept. Implementation covers prompt crafting, processing input and output, orchestration and embedding management. Evaluation lists model comparison, prompt testing, system testing, benchmarks, fine-tuning and training custom models. Productization holds guardrails, safety, privacy and compliance, user feedback, and deployment and monitoring.[^1] Fine-tuning and training custom models appear inside evaluation, one item among several, rather than as the center of the pipeline."
    },
    {
      "type": "p",
      "text": "Prompt engineering is the first theme in the findings. Most participants started writing prompts in ad hoc environments such as OpenAI's playground. \"It's more of an art than a science,\" said P4. P12 put it more bluntly: \"Early days, we just wrote a bunch of crap to see if it worked.\"[^1] Once a prompt produced something reasonable, the output still had to be machine readable. Asking for JSON that matched a schema sometimes worked, but P20 described the model inventing objects that did not conform and hallucinating stop tokens nobody had told it about. P20's team ended up shipping a parser for the ASCII file tree the model naturally produced, rather than forcing the array of objects they had wanted.[^1]"
    },
    {
      "type": "h2",
      "text": "The data work moves into the prompt"
    },
    {
      "type": "p",
      "text": "For Amershi's respondents, data meant training data. Teams tagged each model with the data and code versions it was trained on, and tagged each dataset with where it came from and which code extracted it.[^2] The authors point out that data schemas changed often, even many times a day, and that while code has mature version control, datasets rarely have explicit schemas or equivalent tools.[^2]"
    },
    {
      "type": "p",
      "text": "In the copilot interviews, nobody collects a training set, but the data problem does not disappear. It reappears as context. P3 described \"squishing more information about the data frame into a smaller string,\" and P20 had to decide what to \"selectively truncate because it won't all fit into the prompt,\" such as a conversation history that had grown too long.[^1] Prompts were split into a library of examples, rules and templates filled in at run time, which made it hard to inspect the final prompt the model actually saw. Participants kept these assets in version control, but had no system to validate and track their performance over time.[^1]"
    },
    {
      "type": "p",
      "text": "An IBM log study backs this up with counts. Michael Desmond and Michelle Brachman coded 1,523 prompt edits from 57 sessions on an internal prompting platform. Context was the component edited most often, ahead of task instructions and labels, 22% of edits changed several things before the prompt was rerun, and 68% of those multi-edits touched the context.[^4] Users often refined their instructions against one piece of context, then swapped other contexts in and out to see if the instructions held up.[^4] My reading: that swapping is what an ML engineer would call checking generalization on new data, done by hand, one prompt at a time."
    },
    {
      "type": "p",
      "text": "Labeling also survives. P10's team had people label about 10,000 responses and outsourced it because doing it internally would be \"mind numbingly boring and time-consuming,\" and then the question became whether there was budget.[^1] In Amershi's workflow, labels trained the model. Here they grade it."
    },
    {
      "type": "h2",
      "text": "Testing goes from a held-out set to a flaky suite"
    },
    {
      "type": "p",
      "text": "Amershi's teams evaluated models on held-out test sets using metrics chosen in advance, with extensive human review in critical domains.[^2] A number of teams used what they called combo-flighting, trying out a combination of changes and updates together, kept score cards with several metrics per flight, and still had a human look at errors to form hypotheses about what was going wrong.[^2]"
    },
    {
      "type": "p",
      "text": "Parnin's participants came from ordinary software practice and reached first for unit tests.[^1] The costs surprised them. P9 estimated each test at 1 to 2 cents, which adds up across a large suite. P4 tried to automate testing and was asked to stop because of the cost of running benchmarks, falling back to a small manual set after big changes. P2 had to suspend tests entirely because they slowed down production endpoints.[^1] There were no ready benchmarks, so everyone built their own, and no agreed measure of \"good enough.\"[^1] In the paper's discussion of tool needs, the authors report that when they asked participants about ML metrics such as BLEU or datasets such as HumanEval, a majority were expressly uninterested in using or learning them and wanted familiar software engineering and business metrics instead.[^1]"
    },
    {
      "type": "p",
      "text": "That last finding cuts against a common assumption that LLM engineers simply rediscover ML evaluation. A lab study of non-experts shows how far the default habits can drift. Zamfirescu-Pereira and colleagues watched 10 people with little prompt design experience improve a GPT-3 recipe chatbot with a tool that had a built-in systematic testing interface. None elicited more than one or two conversations before trying a fix, and zero participants used the testing interface.[^3] They tended to overgeneralize from a single success or failure, sometimes concluding the model could not do something after one ignored request.[^3] Those participants were not professional engineers, so this is the far end of the range. Parnin's professionals did write tests. What they reported missing was the budget to run them and a benchmark to run them against.[^1]"
    },
    {
      "type": "h2",
      "text": "What \"the model\" means when you do not train it"
    },
    {
      "type": "p",
      "text": "Amershi's paper names customization and reuse as one of three ways ML differs from other software. Code can be forked and edited with the same skills used to write it, but \"one cannot simply change the parameters with a text editor.\" Running a model on a new domain can mean retraining or replacing it, which needs ML skills and new data that may take as much work as the original.[^2] The third difference is entanglement: models in one system affect each other's training, so improving one part can lower overall quality, which the authors call non-monotonic error propagation.[^2]"
    },
    {
      "type": "p",
      "text": "In the copilot interviews, the model is something you call over the network, often run by someone else. The coupling shows up elsewhere. P20 had to handle behavioral differences among proxies and model hosts.[^1] One participant's company arranged for OpenAI to host an internal model because the standard policy allowed conversations to be used as training data, which was \"a huge compliance risk for us.\"[^1] P18 summed up what a single word can do: \"You might change a single word in a prompt, and the entire experience could be wrong.\"[^1] The foundation model report states the underlying risk at a larger scale: defects of the base model are inherited by every model adapted from it.[^5]"
    },
    {
      "type": "p",
      "text": "If you do not own the weights, the model becomes a choice you revisit. In Desmond and Brachman's logs, 93% of sessions included at least one change to inference parameters, the target model was the parameter changed most, and a session used 3.6 models on average.[^4] Parnin's discussion goes further and tells teams to be prepared for disposable applications, because as new models appear and fine-tuning gets cheaper, the ability to build long-lasting systems may be eclipsed by the speed of invention.[^1] My reading of the pair: in the 2019 study a model was an artifact a team produced and versioned, and by 2023 it had become closer to a dependency that might be swapped out next quarter."
    },
    {
      "type": "h2",
      "text": "What the two samples can and cannot tell you"
    },
    {
      "type": "p",
      "text": "Both papers rest on what practitioners said (interviews in both, plus a survey in Amershi's), not on measurements of engineering output. Amershi's team says so plainly: the data came from self-selected informants and self-reported answers, and their maturity measures were triangulated against other equally subjective measures with no objective baseline.[^2] Amershi's respondents all worked at Microsoft and so did 14 of Parnin's 26, and the 2023 sample was filtered to exclude ML specialists, so the contrast in testing habits partly reflects who was asked."
    },
    {
      "type": "p",
      "text": "Parnin's group adds a limit that ages the whole comparison. The pain points they found, they write, come mostly from the participants' roles and from the capabilities of the models those participants were integrating, and it is plausible that some will dissipate as models change while new ones surface.[^1]"
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        {
          "title": "Parnin, Soares, Pandita, Gulwani, Rich, Henley. Building Your Own Product Copilot: Challenges, Opportunities, and Needs. arXiv 2312.14231, 2023",
          "url": "https://arxiv.org/abs/2312.14231"
        },
        {
          "title": "Amershi, Begel, Bird, DeLine, Gall, Kamar, Nagappan, Nushi, Zimmermann. Software Engineering for Machine Learning: A Case Study. ICSE-SEIP 2019",
          "url": "https://www.microsoft.com/en-us/research/uploads/prod/2019/03/amershi-icse-2019_Software_Engineering_for_Machine_Learning.pdf"
        },
        {
          "title": "Zamfirescu-Pereira, Wong, Hartmann, Yang. Why Johnny Can't Prompt: How Non-AI Experts Try (and Fail) to Design LLM Prompts. CHI 2023",
          "url": "https://people.eecs.berkeley.edu/~bjoern/papers/zamfirescu-johnny-chi2023.pdf"
        },
        {
          "title": "Desmond, Brachman. Exploring Prompt Engineering Practices in the Enterprise. arXiv 2403.08950, 2024",
          "url": "https://arxiv.org/abs/2403.08950"
        },
        {
          "title": "Bommasani et al. On the Opportunities and Risks of Foundation Models. arXiv 2108.07258, 2021",
          "url": "https://arxiv.org/abs/2108.07258"
        }
      ]
    }
  ]
};

// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx.
// Every factual claim is taken from the numbered sources at the end. Figure 6 of
// Sharma et al. 2025 is reproduced under CC BY 4.0 (arXiv 2501.18837). The two
// charts are redrawn from reported numbers in Rebedea et al. 2023 (Appendix G.2.1)
// and Inan et al. 2023 (Table 5).
export const POST = {
  "id": "guardrails",
  "title": "The bill for a guardrail pipeline: what input, output and dialog checks catch and cost",
  "excerpt": "Anthropic's classifier guards survived an estimated 3,000+ hours of paid red teaming, but the first version refused about 44% of real traffic. Reading Constitutional Classifiers, Llama Guard and NeMo Guardrails as one pipeline, check by check, with the catch rate and the price each paper reports.",
  "category": "AI",
  "chapter": "Chapter 10",
  "tags": [
    "Guardrails",
    "Safety",
    "Production"
  ],
  "seriesNum": 16,
  "publishAt": "2026-03-18T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "For a paper published in January 2025, Anthropic ran a bug bounty through HackerOne against a Claude 3.5 Sonnet model wrapped in two classifiers, one reading the user's input and one reading the model's output. From 800 applications it invited 405 people, offered up to $15,000 per report, and asked them to get detailed answers to ten forbidden chemical, biological, radiological and nuclear questions. By the paper's estimate they spent over 3,000 hours on it (mean estimate 4,720), and Anthropic paid out $95,000 in total.[^1] None of the 113 jailbreak reports answered all ten questions with even half the detail of a helpful-only model, one trained for helpfulness with no harmlessness training. Under the stricter bar of matching that model's detail, the best red teamer, pooling every report they sent, got six of ten.[^1]"
    },
    {
      "type": "p",
      "text": "The same paper is just as plain about the price. That prototype was tuned for robustness and refused about 44% of Claude.ai traffic, which the authors call impractically high.[^1] A later version, with classifiers fine-tuned from the smaller Claude 3.5 Haiku, blocked over 95% of a held-out set of jailbreak attempts (the unguarded model blocked 14%). It raised the refusal rate on production traffic by 0.38 percentage points and added 23.7% to inference cost.[^1] Those three numbers, a catch rate, an over-refusal rate and a compute overhead, are the bill for any guardrail. This post goes through the checks one at a time and reads each paper's bill."
    },
    {
      "type": "h2",
      "text": "Where the checks sit"
    },
    {
      "type": "p",
      "text": "A **guardrail** here means code outside the model that inspects traffic and can block or rewrite it. NeMo Guardrails, NVIDIA's open-source toolkit, describes its runtime as a proxy between the user and the LLM.[^3] In its moderation pipeline a user message first passes an input rail, the model answers, the answer passes an output rail, and only a response that clears both reaches the user.[^3] The toolkit also has execution rails: custom Python actions, such as a call to the WolframAlpha API or a fact check against retrieved evidence, that the dialogue flow runs at chosen points.[^3] Anthropic's system uses the same two ends, with an output classifier that watches the reply as it streams.[^1]"
    },
    {
      "type": "diagram",
      "rows": [
        [{ "label": "User message" }],
        [
          { "label": "Input classifier", "detail": "Llama Guard prompt check, constitutional input classifier, NeMo jailbreak rail" },
          { "label": "Dialog rail", "detail": "map the message to a canonical form and follow a developer-written flow" }
        ],
        [{ "label": "LLM generates" }],
        [{ "label": "Around tools", "detail": "execution rails: custom actions, fact check of the answer against retrieved evidence" }],
        [
          { "label": "Output classifier", "detail": "Llama Guard response check, streaming constitutional classifier, NeMo output rail" },
          { "label": "Hallucination rail", "detail": "sample several answers and check that they agree" }
        ],
        [{ "label": "Reply shown, or blocked" }]
      ],
      "caption": "The checks this post covers, in the order a request meets them. Placement follows the architectures described in Rebedea et al.[^3] and Sharma et al.[^1]; Llama Guard is one model run with two different instructions at the input and output positions.[^2]"
    },
    {
      "type": "p",
      "text": "The three papers report quality in different units, so here are the terms, defined once."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        { "term": "Positive", "def": "an item the check should block, such as an unsafe prompt. A **false positive** is a harmless item it blocked anyway; a **false negative** is a harmful item it let through." },
        { "term": "Precision", "def": "of everything the check flagged, the share that really was harmful. Low precision means many false positives, which users feel as over-refusal." },
        { "term": "Recall", "def": "of everything harmful, the share the check flagged. This is the catch rate. Anthropic's paper calls it the true-positive rate." },
        { "term": "AUPRC", "def": "area under the precision-recall curve. A classifier that outputs a score can be cut at any threshold; each threshold gives one (recall, precision) point, and the area under the resulting curve summarizes all of them in one number, with 1.0 perfect." },
        { "term": "Attack success rate", "def": "the share of jailbreak attempts that got harmful content out of the whole guarded system. One minus this is the system's catch rate on attacks." }
      ]
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} \\text{precision} = \\frac{TP}{TP + FP} \\\\[6pt] \\text{recall} = \\frac{TP}{TP + FN} \\end{gathered}",
      "caption": "TP counts harmful items flagged, FP harmless items flagged, FN harmful items missed."
    },
    {
      "type": "h2",
      "text": "Check one: a 7B model reads the prompt"
    },
    {
      "type": "p",
      "text": "Meta's Llama Guard is Llama2-7b fine-tuned to act as a classifier. Its instructions contain a list of harm categories with plain-text descriptions, a flag saying whether to judge the user's prompt or the agent's response, the conversation, and an output format. The model answers \"safe\" or \"unsafe\" and, if unsafe, lists the violated categories. Because \"safe\" and \"unsafe\" are single tokens, the probability of that first token works as a score you can threshold.[^2] The training set was 13,997 prompts and responses, labeled by Meta's in-house red team against six categories, split 3:1 for training and evaluation.[^2]"
    },
    {
      "type": "p",
      "text": "Llama Guard reports AUPRC, following OpenAI's moderation work,[^2] and the choice fits the data. On ToxicChat, a benchmark of 10,166 real user queries from the Vicuna demo chatbot, only 7.10% of examples are toxic.[^4] When positives are that rare, a classifier that flags nothing is 93% accurate, so accuracy tells you little. Precision and recall on the unsafe class do not have that problem. On prompt classification, zero-shot, Llama Guard scored 0.945 on its own test set against 0.764 for the OpenAI Moderation API and 0.728 for Perspective API. On ToxicChat, which none of the models trained on, it scored 0.626 against 0.588 and 0.532.[^2] On OpenAI's own moderation set it scored 0.847 against the API's 0.856. Adding two to four examples per category to the prompt raised that to 0.872, ahead of the API, without any retraining.[^2]"
    },
    {
      "type": "p",
      "text": "The cost side is thin in this paper. The authors chose the smallest Llama 2 size because it is more user friendly and has lower inference and deployment costs, and training took 500 steps on one machine with eight A100 GPUs.[^2] They report no latency or per-request cost, so the real cost of running a 7B model on every message has to be measured on your own traffic."
    },
    {
      "type": "p",
      "text": "Anthropic's input classifier does a narrower job. It is also a fine-tuned LLM, framed as next-token prediction, and among other things it is trained to block inputs that try to set up coded communication, so that the output would be unreadable without seeing the input.[^1] The paper's framing is that the input classifier catches attempts to get around the output classifier.[^1] On a random sample of red-team prompts, a model with only harmlessness training let through about 14% of attacks; adding the input classifier cut that to 2%, and adding the output classifier as well cut it to 0.5%.[^1]"
    },
    {
      "type": "h2",
      "text": "Check two: judging a reply before it finishes"
    },
    {
      "type": "p",
      "text": "Llama Guard's response classification uses the same model with different wording in the instructions, and to its authors' knowledge it was the first work to split prompt and response moderation into two separate tasks.[^2] Its response AUPRC on its own test set was 0.953, against 0.769 for the OpenAI API and 0.699 for Perspective.[^2] That comparison favors Llama Guard, since the test set follows Llama Guard's own taxonomy, which the paper states openly and treats as the in-domain setting.[^2]"
    },
    {
      "type": "p",
      "text": "An output check that waits for the full reply adds that wait to every response. Anthropic's output classifier avoids this by scoring the reply token by token as it streams. It is a fine-tuned LLM with a linear value head, a small layer that turns the model's internal state at each position into one number: the predicted probability that the finished output will be harmful, given only the prefix so far. When the score passes a threshold, streaming stops.[^1] Because a stop cannot be undone, training gradually shifts from the score at each token to the running maximum of all scores so far, which matches how the classifier is used.[^1] In the paper's cost accounting, this design means the output classifier generates no output tokens at all; the input classifier generates one.[^1]"
    },
    {
      "type": "p",
      "text": "Streaming creates a question that whole-output tests hide: did the stop come in time? Anthropic truncated each blocked output at the token where the classifier first crossed its threshold and checked what a user would already have seen. Across 10,000 jailbreak outputs, the system blocked 96.70%. Only 117 of the truncated outputs, 1.17% of attempts, had already shown harmful content.[^1] The wiring matters as much as the model. One red-team report first looked like a universal jailbreak, and it turned out to be an implementation bug that let up to 128 tokens through after the output classifier had flagged them.[^1]"
    },
    {
      "type": "image",
      "src": "/blog-images/guardrails/constitutional-classifiers-bill.webp",
      "alt": "Three bar charts comparing no classifiers, three prompted Claude 3.5 Sonnet classifier setups, and Claude 3.5 Haiku constitutional classifiers. Attack success rate falls from about 86% with no classifiers to under 5% with constitutional classifiers. Refusal rate on Claude.ai traffic rises from about 1.1% to about 1.5%, less than the prompted setups. Inference cost is about 124% of the guarded model, against roughly 190 to 200% for the prompted setups.",
      "width": 1830,
      "height": 780,
      "caption": "Figure 6 from Sharma et al., 2025,[^1] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The whole bill in one image: (A) attack success on held-out jailbreaks, (B) refusals on a random sample of 5,000 Claude.ai conversations, (C) inference cost relative to the guarded Claude 3.5 Sonnet (New)."
    },
    {
      "type": "h2",
      "text": "Check three: dialog rails that call the LLM three times"
    },
    {
      "type": "p",
      "text": "NeMo Guardrails controls where a conversation can go, not only what text is allowed. Developers write rules in a modeling language called Colang: **canonical forms**, short natural-language labels for what a message means (\"ask about capabilities\"), and **flows**, the dialogue paths the bot must follow.[^3] For each user message the runtime makes three LLM calls in sequence. The first turns the message into a canonical form, using the nearest examples from a vector index as few-shot prompts. The second picks the next step, from a matching flow if there is one or by letting the LLM improvise. The third writes the bot's reply. If the next step for a political question is \"bot inform cannot answer,\" the bot declines.[^3]"
    },
    {
      "type": "p",
      "text": "The paper measured these topical rails on a banking intent dataset of 231 test samples over 77 intents. With text-davinci-003 and all examples indexed, the first step recovered the right user intent 77% of the time, or 82% when a similarity match replaced exact matching. falcon-7b-instruct reached 70% and 76%.[^3] With only one indexed example per intent, text-davinci-003 fell to 50%, which is why the authors recommend at least three.[^3]"
    },
    {
      "type": "p",
      "text": "The safety rails in NeMo are prompts to a strong LLM, not trained classifiers. The input rail asks whether an instruction would make a model break moderation policies; the output rail asks whether a reply is legal, ethical and not harmful.[^3] The authors built a set of 200 prompts, half taken from Anthropic's red-teaming data (the highest-rated harmful prompts) and half from its helpful data. With no rails, text-davinci-003 refused only 24% of the harmful prompts. The input rail alone raised that to 87% while blocking 3% of helpful prompts, and both rails together reached 97% at a cost of 5% of helpful prompts. gpt-3.5-turbo already refused 93% on its own; with both rails it blocked close to 99% of harmful prompts and 2% of helpful ones.[^3]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "NeMo moderation rails: harmful caught vs helpful blocked",
      "yLabel": "Share of prompts blocked (%)",
      "series": [
        { "label": "Harmful prompts blocked", "key": "harm" },
        { "label": "Helpful prompts blocked", "key": "help" }
      ],
      "data": [
        { "label": "davinci-003, no rails", "values": { "harm": 24, "help": 0 } },
        { "label": "davinci-003, input rail", "values": { "harm": 87, "help": 3 } },
        { "label": "davinci-003, both rails", "values": { "harm": 97, "help": 5 } },
        { "label": "gpt-3.5, no rails", "values": { "harm": 93, "help": 0 } },
        { "label": "gpt-3.5, both rails", "values": { "harm": 99, "help": 2 } }
      ],
      "caption": "Redrawn from Appendix G.2.1 of Rebedea et al., 2023,[^3] on 200 prompts split evenly between harmful and helpful. The paper gives the gpt-3.5-turbo two-rail result as \"close to 99%\"; the input-rail-only result for gpt-3.5-turbo is not reported."
    },
    {
      "type": "p",
      "text": "The execution rails around retrieval do similar work for facts. The fact-checking rail asks the LLM whether the answer is entailed by the evidence, and on MS MARCO pairs with rewritten hard negatives both text-davinci-003 and gpt-3.5-turbo scored about 80% accuracy.[^3] The hallucination rail borrows SelfCheckGPT's idea that sampled answers to a question the model really knows tend to agree, while made-up facts diverge across samples.[^6] On 20 questions with false premises, the rail caught 70% of the cases text-davinci-003 would otherwise have answered, and raised gpt-3.5-turbo's rate of deflecting or hedging from 65% to 95%, by the main text's figure.[^3] Twenty questions is a very small test, and it should be read that way."
    },
    {
      "type": "p",
      "text": "The bill for dialog rails is in the paper's limitations. The three calls are chained, each depending on the one before, so they cannot be batched, and latency and cost come to about three times a normal call.[^3] The moderation rails are separate LLM calls on top of that.[^3]"
    },
    {
      "type": "h2",
      "text": "Catch rate against false refusals"
    },
    {
      "type": "p",
      "text": "Every check above has a threshold, and moving it trades recall for precision. Llama Guard's appendix shows this with a fixed threshold of 0.5 on its own prompt test set. GPT-4, prompted zero-shot, had the highest recall at 0.947 but the lowest precision at 0.717: it caught almost everything and flagged many safe prompts along the way. The OpenAI Moderation API was the reverse, with precision 0.874 and recall 0.250. Llama Guard sat at 0.880 and 0.864.[^2] Part of the gap is taxonomy. The moderation API was built around its own taxonomy, with an active learning pipeline meant to capture rare events,[^5] and on Llama Guard's category of regulated or controlled substances it caught almost nothing (recall 0.008).[^2]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Prompt classification at threshold 0.5, Llama Guard test set",
      "yLabel": "Score (0 to 1)",
      "series": [
        { "label": "Precision", "key": "p" },
        { "label": "Recall", "key": "r" }
      ],
      "data": [
        { "label": "Llama Guard", "values": { "p": 0.88, "r": 0.864 } },
        { "label": "GPT-4 (zero-shot)", "values": { "p": 0.717, "r": 0.947 } },
        { "label": "Azure Content Safety", "values": { "p": 0.788, "r": 0.515 } },
        { "label": "Perspective API", "values": { "p": 0.817, "r": 0.219 } },
        { "label": "OpenAI Moderation", "values": { "p": 0.874, "r": 0.25 } }
      ],
      "caption": "Redrawn from Table 5 (overall row) of Inan et al., 2023.[^2] The test set follows Llama Guard's own six-category taxonomy, so the baselines are judged partly on categories they were never built for."
    },
    {
      "type": "p",
      "text": "Anthropic chose its thresholds by stating the refusal budget first. It swept combinations of input and output thresholds and kept the pair with the highest true-positive rate on its jailbreak set, subject to three limits on the whole system: at most 0.5 percentage points more false positives than the unguarded model on multi-turn WildChat conversations, at most 5% false positives on single-turn WildChat queries, and at most 5 points more on the OR-Bench over-refusal benchmark.[^1] Written this way, over-refusal is a constraint the design must meet, and robustness is what gets maximized inside it. The prototype, with no such budget, refused about 44% of traffic. A version built with the improved method and the prototype's constitution refused about 1.74% of production traffic, with lower attack success than the red-teamed system, though red teamers never targeted that version directly.[^1]"
    },
    {
      "type": "p",
      "text": "A low average can hide a high rate in one domain. The chemical-weapons classifiers had a false-positive rate of 1.50% on MMLU chemistry questions but 26.05% on the harder GPQA chemistry questions.[^1] On 1,000 chemistry-related WildChat queries, the model itself refused 3.6%, and the classifiers blocked a further 3.4% of queries the model had been willing to answer.[^1] The authors read the GPQA gap as a capability limit, since larger classifiers held at the same robustness had lower false-positive rates on those questions.[^1] The practical point: a refusal budget measured on general traffic says little about the users whose work sits next to the restricted topic."
    },
    {
      "type": "p",
      "text": "The classifier's own size and setup drive the compute line. In Figure 6, three prompted Claude 3.5 Sonnet classifiers (zero-shot, chain-of-thought and 32-shot) caught less, refused more and cost more than the fine-tuned Haiku classifiers; the constitutional classifiers had both the smallest refusal increase and the lowest overhead of all the setups tested.[^1] The overhead estimate assumes an efficient setup with prompt caching, and it scores whole outputs, not streams.[^1] NeMo's authors make the same argument from the other side: they expect smaller models to bring down the cost of their rails, and they note that falcon-7b-instruct already did well on topical rails.[^3]"
    },
    {
      "type": "h2",
      "text": "What the red team broke instead"
    },
    {
      "type": "p",
      "text": "The most revealing result in the Anthropic paper is where the attackers went. The highest-scoring reports mostly did not beat the classifiers. They beat the grading. One tactic, benign paraphrasing, reworded a harmful question into something that sounded innocent. The other, length exploitation, produced very long outputs that scored rubric points through volume. Established universal jailbreaks such as many-shot prompting were missing from the successful attacks. In the authors' words, \"attackers tend to target a system's weakest component,\" and here that was the evaluation protocol.[^1] The other flaw found was the 128-token streaming bug, which sat in the plumbing, not the model.[^1]"
    },
    {
      "type": "p",
      "text": "The authors do not claim the question is settled. Their limitations section says the red-teaming cohort is only a subset of possible adversaries, that bounties paid out at the half-detail mark so stronger attacks may have gone unfound, and that the test covered a chatbot with preset questions, leaving other deployment settings open.[^1] Their conclusion goes further: \"common wisdom suggests that system vulnerabilities will likely emerge with continued testing,\" and responsible deployment will need complementary defenses such as rapid patching of new jailbreaks and monitoring to detect them.[^1] NeMo's authors say the same about their own toolkit, that it should not be used as a stand-alone solution, especially for safety rails.[^3]"
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        { "title": "Sharma et al., Constitutional Classifiers: Defending against Universal Jailbreaks across Thousands of Hours of Red Teaming, 2025", "url": "https://arxiv.org/abs/2501.18837" },
        { "title": "Inan et al., Llama Guard: LLM-based Input-Output Safeguard for Human-AI Conversations, 2023", "url": "https://arxiv.org/abs/2312.06674" },
        { "title": "Rebedea, Dinu, Sreedhar, Parisien, and Cohen, NeMo Guardrails: A Toolkit for Controllable and Safe LLM Applications with Programmable Rails, 2023", "url": "https://arxiv.org/abs/2310.10501" },
        { "title": "Lin et al., ToxicChat: Unveiling Hidden Challenges of Toxicity Detection in Real-World User-AI Conversation, 2023", "url": "https://arxiv.org/abs/2310.17389" },
        { "title": "Markov et al., A Holistic Approach to Undesired Content Detection in the Real World, 2023", "url": "https://arxiv.org/abs/2208.03274" },
        { "title": "Manakul, Liusie, and Gales, SelfCheckGPT: Zero-Resource Black-Box Hallucination Detection for Generative Large Language Models, 2023", "url": "https://arxiv.org/abs/2303.08896" }
      ]
    }
  ]
};

// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx.
// Every factual claim is taken from the numbered sources at the end. The three
// charts are redrawn from table values in Wei et al. 2023, Zou et al. 2023 and
// Mazeika et al. 2024; no paper figure is reproduced. No working jailbreak
// prompt or adversarial suffix appears here: attacks are described at the level
// of abstraction the papers themselves publish.
export const POST = {
  "id": "jailbreaking",
  "title": "Jailbroken: the two ways safety training loses, and what defenses actually buy",
  "excerpt": "In 2023 Berkeley researchers found, for every one of 32 red-team prompts, an attack that got GPT-4 and Claude v1.3 to answer it. Their two failure modes still explain automated suffix attacks, many-shot prompts, and why every defense measured since moves the numbers without closing the gap.",
  "category": "AI",
  "tags": [
    "Safety",
    "Jailbreaking",
    "Security"
  ],
  "seriesNum": 36,
  "publishAt": "2026-07-01T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Alexander Wei, Nika Haghtalab and Jacob Steinhardt at UC Berkeley collected 32 harmful prompts from the red-teaming work of OpenAI and Anthropic, the same kind of examples those companies had used to shape their models' safety training. They then ran 30 jailbreak methods against GPT-4 and Claude v1.3.[^1] Both were hard targets: OpenAI had reported that GPT-4 answers requests for disallowed content 82% less often than GPT-3.5.[^1]"
    },
    {
      "type": "p",
      "text": "For every one of the 32 prompts, at least one method got an answer out of each model: 100% for GPT-4 and 100% for Claude v1.3.[^1] On 317 held-out harmful prompts that the authors did not see until data collection was over, the strongest combination attacks got GPT-4 to comply up to 93% of the time and Claude v1.3 up to 89%. Picking the best of the tested attacks per prompt reached 96% and 99%.[^1]"
    },
    {
      "type": "p",
      "text": "The explanation mattered more than the numbers. Wei and colleagues proposed two failure modes of safety training, and then tested the idea by using those failure modes as recipes for new attacks.[^1] Those two failure modes are the spine of this post. Like the paper, it describes how attacks are built without printing the strongest ones.[^1]"
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Restricted behavior",
          "def": "Something a safety-trained model has been trained to avoid, such as helping with crime or leaking personal data.[^1]"
        },
        {
          "term": "Jailbreak",
          "def": "Taking a prompt P that asks for restricted behavior and submitting a modified prompt P′ that gets an on-topic answer to P anyway. In Wei et al.'s threat model the attacker only has chat access and cannot edit the system prompt or the message history.[^1]"
        },
        {
          "term": "Attack success rate (ASR)",
          "def": "The share of harmful prompts for which an attack produces a response that complies instead of refusing. Wei et al. labeled each output by hand as BAD BOT (complied), GOOD BOT (refused) or UNCLEAR, and did not grade whether the harmful answer was accurate.[^1]"
        },
        {
          "term": "White-box and black-box",
          "def": "A white-box attacker can read the model's weights and gradients. A black-box attacker only sees its outputs.[^2,5]"
        }
      ]
    },
    {
      "type": "h2",
      "text": "Competing objectives: make refusal the expensive move"
    },
    {
      "type": "p",
      "text": "A chat model is trained toward more than one goal. It learns language modeling in pretraining, then instruction following, then safety. Wei et al.'s first failure mode is that these goals can be set against each other. An attacker writes a prompt where the only way to stay safe is a response that the pretraining and instruction-following objectives penalize heavily.[^1]"
    },
    {
      "type": "p",
      "text": "The cleanest example is **prefix injection**. The prompt asks the model to start its reply with a specific, harmless-looking opening line, chosen so that a refusal would be very unlikely to come after it in ordinary text. The instruction is harmless, and models are penalized in training for refusing harmless instructions, so the model complies. After that opening, the pretraining objective strongly favors continuing over reversing.[^1] The authors checked that the wording matters. With an eager, affirmative opening the attack worked on 22% of curated prompts against GPT-4. With a plain greeting as the opening it worked on 6%, about the same as asking with no attack at all (3%).[^1]"
    },
    {
      "type": "p",
      "text": "**Refusal suppression** does something similar through instructions. The model is told to answer under rules that forbid the usual pieces of a refusal, such as apologies, disclaimers, and the words refusals tend to start with. That succeeded on 25% of prompts against GPT-4 and 16% against Claude v1.3. The inverted version, which tells the model to consider apologizing, succeeded on none.[^1] Instruction tuning pushes down the tokens that begin refusals, and once an answer has begun, pretraining pushes the model to finish it.[^1] The paper reads the well-known \"DAN\" roleplay prompts the same way.[^1]"
    },
    {
      "type": "p",
      "text": "One result shows why patching individual attacks does not settle anything. There was evidence that Claude v1.3 had been trained to refuse harmful roleplay, and indeed every roleplay attack scored 0% on it, including AIM, a popular jailbreak-sharing-site prompt that succeeded 75% of the time on GPT-4. Claude v1.3 still fell to the adaptive attack on 100% of curated prompts. The authors' conclusion: \"targeted training is insufficient.\"[^1]"
    },
    {
      "type": "h2",
      "text": "Mismatched generalization: abilities the safety data never covered"
    },
    {
      "type": "p",
      "text": "The second failure mode comes from a difference in scale. Pretraining uses a far larger and more varied dataset than safety training, so the model can do many things that safety training never touched. An attacker looks for inputs where pretraining and instruction following generalize but safety does not. The model then answers, just without its safety behavior.[^1]"
    },
    {
      "type": "p",
      "text": "The sharpest case in the paper is Base64, an encoding that turns bytes into plain letters and digits. Large models pick up Base64 during pretraining and can follow instructions written in it. Safety training almost certainly contained nothing so unnatural, so the model was never taught to refuse it.[^1] With both the request and the requested answer encoded, the attack succeeded on 34% of curated prompts for GPT-4 and 38% for Claude v1.3. Encoding only the input gave 9% and 0%, and encoding only the output gave 6% and 3%.[^1] The same logic covers ciphers like ROT13 and leetspeak, splitting sensitive words into pieces, translation, and unusual output formats.[^1]"
    },
    {
      "type": "p",
      "text": "This failure mode depends on how capable the model is. GPT-3.5 Turbo could not read Base64: 91% of its responses to the Base64 attack were labeled UNCLEAR, and it told the user it did not understand the language. GPT-4 read the same prompt and answered it.[^1]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Jailbreak success on 32 curated red-team prompts",
      "yLabel": "BAD BOT rate (%)",
      "series": [
        { "label": "GPT-4", "key": "gpt4" },
        { "label": "Claude v1.3", "key": "claude" }
      ],
      "data": [
        { "label": "No attack", "values": { "gpt4": 3, "claude": 0 } },
        { "label": "Prefix injection", "values": { "gpt4": 22, "claude": 0 } },
        { "label": "Refusal suppression", "values": { "gpt4": 25, "claude": 16 } },
        { "label": "Base64", "values": { "gpt4": 34, "claude": 38 } },
        { "label": "AIM (roleplay)", "values": { "gpt4": 75, "claude": 0 } },
        { "label": "Combination 3", "values": { "gpt4": 94, "claude": 81 } }
      ],
      "caption": "Redrawn from Table 1 of Wei et al., 2023.[^1] Combination 3 stacks prefix injection, refusal suppression, Base64, style injection, website content and formatting constraints. Roleplay failed completely on Claude v1.3, but combinations of simple ideas from both failure modes did not."
    },
    {
      "type": "p",
      "text": "The top of the chart is the practical lesson. Each simple attack works on only a fraction of prompts. Combine them, prefix injection with refusal suppression with Base64 and more, and success reaches 94% on GPT-4 and 81% on Claude v1.3. The authors suggest such combinations may be the hardest to defend against.[^1]"
    },
    {
      "type": "diagram",
      "title": "Where a refusal can lose",
      "root": {
        "label": "Why did the refusal not happen?",
        "color": "purple",
        "children": [
          {
            "edge": "refusing clashed with another trained goal",
            "node": {
              "label": "Competing objectives",
              "color": "blue",
              "children": [
                { "edge": "attack families", "node": { "label": "Prefix injection, refusal suppression, style constraints, persona instructions", "color": "yellow" } }
              ]
            }
          },
          {
            "edge": "the input was outside the safety data",
            "node": {
              "label": "Mismatched generalization",
              "color": "green",
              "children": [
                { "edge": "attack families", "node": { "label": "Encodings, ciphers, split words, translation, unusual formats", "color": "yellow" } }
              ]
            }
          }
        ]
      },
      "caption": "The two failure modes proposed by Wei et al., with the attack families they built from each.[^1]"
    },
    {
      "type": "p",
      "text": "The paper's reasoning about defense follows from this. Competing objectives, they argue, will not go away with scale, because the cause is the training objective itself. The RLHF objective of InstructGPT, which GPT-4 builds on, includes terms that keep the model close to its pretrained behavior, so a trade-off between safety and pretraining is built into safety training.[^1] Mismatched generalization may get worse with scale, since every new capability is new ground that safety training has to cover. Hence their idea of **safety-capability parity**: a filter that cannot decode Base64 cannot flag a Base64 attack.[^1]"
    },
    {
      "type": "h2",
      "text": "Letting an optimizer write the affirmative opening"
    },
    {
      "type": "p",
      "text": "About three weeks after Wei et al. was posted, Andy Zou and colleagues at Carnegie Mellon, the Center for AI Safety and Google DeepMind automated the prefix idea.[^2] Instead of asking the model to start with an eager opening, they searched for a string of tokens, an **adversarial suffix**, which when appended to the harmful request makes the model most likely to begin its reply with \"Sure, here is\" followed by a restatement of the request.[^2] Writing \\(x_{1:n}\\) for the tokens of the prompt, the attack minimizes:"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} \\mathcal{L}(x_{1:n}) = -\\log p\\big(x^{\\star}_{n+1:n+H} \\mid x_{1:n}\\big) \\\\[4pt] \\min_{x_{\\mathcal{I}} \\in \\{1,\\dots,V\\}^{|\\mathcal{I}|}} \\mathcal{L}(x_{1:n}) \\end{gathered}",
      "caption": "The adversarial objective, equations 3 and 4 of Zou et al., 2023.[^2]"
    },
    {
      "type": "p",
      "text": "Here \\(x^{\\star}_{n+1:n+H}\\) is the \\(H\\)-token target reply, \\(p\\) is the probability the model assigns to producing it given the prompt, \\(V\\) is the vocabulary size, and \\(\\mathcal{I}\\) is the set of suffix positions the attacker may change. The user's actual request stays untouched.[^2] Tokens are discrete, so plain gradient descent does not apply. **Greedy Coordinate Gradient (GCG)** takes the gradient of the loss with respect to each suffix position's one-hot token vector and uses it to shortlist the top-\\(k\\) promising replacement tokens at every position. It then tries a random batch of single-token swaps from those shortlists, computes the true loss for each with a forward pass, and keeps the best one.[^2] The experiments used 20 suffix tokens, 500 steps, a shortlist of 256 and batches of 512.[^2]"
    },
    {
      "type": "p",
      "text": "To make one suffix work on many requests, GCG sums the losses over several harmful prompts, adding each new prompt only after the suffix already works on the earlier ones. Summing losses over several models makes it transfer.[^2] Optimized over 25 harmful behaviors, a single suffix worked on 98% of 100 held-out behaviors on Vicuna-7B and 84% on Llama-2-7B-Chat. The older AutoPrompt method managed 35% on the held-out Llama-2 behaviors.[^2]"
    },
    {
      "type": "p",
      "text": "The more worrying result was transfer. Suffixes optimized only on open models (two Vicuna sizes, plus two Guanaco models for one suffix) were appended to 388 harmful behaviors and sent to commercial models the attackers had no gradient access to.[^2]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "GCG suffixes transferred to black-box models",
      "yLabel": "Attack success rate (%)",
      "series": [
        { "label": "Harmful request only", "key": "base", "baseline": true },
        { "label": "Request + GCG ensemble", "key": "gcg" }
      ],
      "data": [
        { "label": "GPT-3.5", "values": { "base": 1.8, "gcg": 86.6 } },
        { "label": "GPT-4", "values": { "base": 8.0, "gcg": 46.9 } },
        { "label": "Claude 1", "values": { "base": 0.0, "gcg": 47.9 } },
        { "label": "Claude 2", "values": { "base": 0.0, "gcg": 2.1 } },
        { "label": "PaLM-2", "values": { "base": 0.0, "gcg": 66.0 } }
      ],
      "caption": "Redrawn from Table 2 of Zou et al., 2023.[^2] Averaged over 388 behaviors. \"Ensemble\" counts a behavior as broken if any of the GCG suffixes works on it. Suffixes were optimized on Vicuna and Guanaco models only."
    },
    {
      "type": "p",
      "text": "The authors suggest transfer to the GPT models may be high because Vicuna was itself trained on ChatGPT outputs.[^2] Claude 2 held up far better, though the paper notes that a conditioning step before the request could raise success on Claude models.[^2] Their broader worry comes from computer vision, where adversarial examples are still everywhere and the strongest defenses are rarely deployed.[^2]"
    },
    {
      "type": "h2",
      "text": "Many-shot: harm that grows on a power law"
    },
    {
      "type": "p",
      "text": "Longer context windows opened a different route. Cem Anil and colleagues, in a paper whose corresponding author is at Anthropic, filled the prompt with hundreds of fake dialogue turns in which an assistant happily answers harmful questions, then appended the real question. They called this **many-shot jailbreaking (MSJ)**. The fake answers were written by a \"helpful-only\" model, one tuned to follow instructions but never trained for harmlessness.[^3] On Claude 2.0 the attack did nothing with 5 shots and worked consistently with 256.[^3] On a dataset of misuse requests the authors scaled prompts to nearly 70,000 tokens and saw no plateau in the harmful response rate.[^3] Around 128 shots were enough for all five models they tested (Claude 2.0, GPT-3.5, GPT-4, Llama 2 70B and Mistral 7B) to adopt the harmful behavior on a set of malevolent-personality questions.[^3]"
    },
    {
      "type": "p",
      "text": "Sampling replies says little when success is rare, so the paper also tracks the likelihood of the harmful answer. It follows a simple law:[^3]"
    },
    {
      "type": "eq",
      "tex": "\\begin{aligned} &-\\mathbb{E}\\big[\\log P(\\text{harmful resp.} \\mid n\\text{-shot MSJ})\\big] \\\\ &\\quad = C\\,n^{-\\alpha} + K \\end{aligned}",
      "caption": "The many-shot power law, equation 1 of Anil et al., 2024.[^3]"
    },
    {
      "type": "p",
      "text": "The left side is the negative log-likelihood of the harmful response, averaged over target questions; lower means a stronger attack. \\(n\\) is the number of shots. \\(C\\) is the offset (the paper calls it the intercept), which sets how resistant the model is before any shots. \\(\\alpha\\) is the exponent (the slope on a log-log plot), which sets how quickly each extra shot erodes that resistance. \\(K\\) is a floor the curve approaches as \\(n\\) grows. With \\(K = 0\\) the relationship is a straight line on log-log axes.[^3]"
    },
    {
      "type": "p",
      "text": "The same power law showed up on in-context learning tasks unrelated to safety, such as TriviaQA and CommonsenseQA, which suggests MSJ is ordinary in-context learning pointed at harmful behavior.[^3] Within the Claude 2.0 family, larger models had larger exponents: they learned from the fake dialogue faster.[^3] Changing the dialogue format, for example swapping the user and assistant tags or translating them, shifted the intercept but barely changed the slope.[^3] Shots on a different topic from the target still worked if they were drawn from many categories, but not if they came from one narrow category.[^3] Combining MSJ with a competing-objectives attack from Wei et al. raised the chance of a harmful response at every context length.[^3] One limitation the authors state: chat products such as ChatGPT and Claude.ai do not let users insert fake dialogue history, so the plain attack needs API access.[^3]"
    },
    {
      "type": "h2",
      "text": "Defenses, measured, with their bills"
    },
    {
      "type": "p",
      "text": "The power law gives a precise way to judge a defense against MSJ: does it raise the intercept, or does it flatten the slope? Anil et al. tracked both through ordinary supervised fine-tuning (SL) and reinforcement learning (RL) toward helpful, harmless, honest behavior. Both mostly raised the intercept and left the exponent alone.[^3] Training on examples of MSJ attacks with benign responses, up to 10 shots long, did the same thing. The model became harder to break at zero shots, and every extra shot still increased the chance of harm at the same rate.[^3] A higher intercept means exponentially more shots are needed, which might suffice for a bounded context, but stacking MSJ with other jailbreaks lowers the intercept again.[^3]"
    },
    {
      "type": "p",
      "text": "Changing the prompt did better in one case. On the deception category with 205-shot attacks, prepending 20 examples of refusals (the In-Context Defense) cut attack success only from 61% to 54%. Wrapping the prompt in a warning at both ends, which they call the Cautionary Warning Defense, cut it to 2%.[^3] The authors did not measure what that warning costs on normal requests, and say that trade-off still needs to be evaluated.[^3]"
    },
    {
      "type": "p",
      "text": "GCG suffixes have a visible signature: they read as gibberish, so their **perplexity**, the model's average surprise at each token, is high. Neel Jain and colleagues at the University of Maryland and New York University tested a perplexity filter against the GCG attack. It let through at most 1% of the suffixed prompts on each of five small open models, while its threshold was set so that every plain harmful prompt in the benchmark passed.[^5] When the attacker added a term rewarding low perplexity to the GCG objective, success fell toward the no-attack level. At the largest weight before the attack stopped working, only 20% of attacks got past a filter that checks 10-token windows.[^5] The cost was on normal users. On benign AlpacaEval instructions the filters passed 93.7% and 91.1% on average, which the authors describe as dropping about one query in ten, \"untenable\" if flagged prompts are simply refused.[^5]"
    },
    {
      "type": "p",
      "text": "Paraphrasing each prompt with ChatGPT before the target model sees it cut successful attacks on Vicuna-7B from 74 to 5. It also reduced benign performance by about 10% for Vicuna and Alpaca and 15% for Guanaco.[^5] With white-box access to a LLaMA-2-7B-chat paraphraser, the authors used GCG to find an input that made the paraphraser output all 10 adversarial tokens unchanged.[^5]"
    },
    {
      "type": "p",
      "text": "Adversarial training puts the attacker inside the training loop. HarmBench, a standardized benchmark of 18 red-teaming methods against 33 models and defenses, came with a method called R2D2.[^4] It fine-tunes Mistral 7B against a pool of GCG test cases that keep being re-optimized against the current model. Reusing test cases avoids running GCG from scratch, which takes about 20 minutes per test case on an A100. Training took 16 hours on eight A100s.[^4] The natural comparison is Zephyr 7B, built from the same base model and codebase without R2D2.[^4]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Adversarial training against GCG: gains by attack family",
      "yLabel": "Attack success rate (%)",
      "series": [
        { "label": "Zephyr 7B", "key": "z", "baseline": true },
        { "label": "Zephyr 7B + R2D2", "key": "r" }
      ],
      "data": [
        { "label": "Direct request", "values": { "z": 65.8, "r": 14.2 } },
        { "label": "GCG", "values": { "z": 69.5, "r": 5.5 } },
        { "label": "GCG transfer", "values": { "z": 61.1, "r": 0.0 } },
        { "label": "Few-shot LLM", "values": { "z": 62.0, "r": 43.5 } },
        { "label": "PAIR", "values": { "z": 58.8, "r": 48.0 } },
        { "label": "TAP", "values": { "z": 66.5, "r": 60.8 } }
      ],
      "caption": "Redrawn from Table 6 of Mazeika et al., 2024 (all behaviors).[^4] \"Few-shot LLM\" is Stochastic Few-Shot, where an attacker model writes test cases. PAIR and TAP use an attacker model that refines its prompts over many rounds, in a chain and a tree respectively."
    },
    {
      "type": "p",
      "text": "Against the attack it trained on, R2D2 is dramatic: GCG success fell from 69.5% to 5.5%. Against attacks that work differently it barely helped. The authors say themselves that the gain is smallest for PAIR, TAP and Stochastic Few-Shot, which do not resemble the GCG adversary used in training, and that training against several different attacks may be needed.[^4] The capability cost was modest. R2D2 scored 6.0 on MT-Bench, a test of general conversational ability, against 6.5 for Mistral 7B Instruct v0.2.[^4] Across the whole benchmark, no attack or defense was effective everywhere. Within model families from 7 to 70 billion parameters robustness did not track size, which led the authors to conclude that training data and procedure matter far more than scale.[^4]"
    },
    {
      "type": "callout",
      "title": "What these success rates measure",
      "text": "Wei et al. scored whether a model gave an on-topic answer instead of refusing, not whether the answer was correct.[^1] Zou et al. counted a \"reasonable attempt\" at the behavior.[^2] HarmBench uses a fine-tuned Llama 2 13B classifier that agreed with human labels 93.2% of the time.[^4] Numbers from different papers are not directly comparable."
    },
    {
      "type": "h2",
      "text": "The exponent nobody has moved"
    },
    {
      "type": "p",
      "text": "My reading of the measured defenses is that they fit the picture Wei et al. drew. Filters and paraphrasers catch what they were built to spot, at a price; adversarial training closes the hole it trained on; safety fine-tuning moves the intercept.[^1,3,4,5] Anil et al. state the open problem plainly. None of the fine-tuning interventions they studied gave long-term relief from MSJ, and an effective fix would have to reduce the slope of the power law or raise its floor \\(K\\).[^3]"
    },
    {
      "type": "p",
      "text": "Their scaling results explain why that is hard. The power law behind many-shot jailbreaking also appears in in-context learning on harmless tasks, which is the ability that makes long context windows useful. If the same circuits drive both, the authors write, protecting against MSJ without weakening general in-context learning \"may prove challenging.\"[^3] Wei et al. add their own limit: because GPT-4 and Claude are proprietary, the failure modes could only be confirmed indirectly, and whether safety training can be interpreted mechanistically remains open.[^1]"
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        { "title": "Wei, Haghtalab, and Steinhardt, Jailbroken: How Does LLM Safety Training Fail?, 2023", "url": "https://arxiv.org/abs/2307.02483" },
        { "title": "Zou, Wang, Carlini, Nasr, Kolter, and Fredrikson, Universal and Transferable Adversarial Attacks on Aligned Language Models, 2023", "url": "https://arxiv.org/abs/2307.15043" },
        { "title": "Anil et al., Many-shot Jailbreaking, NeurIPS 2024", "url": "https://proceedings.neurips.cc/paper_files/paper/2024/hash/ea456e232efb72d261715e33ce25f208-Abstract-Conference.html" },
        { "title": "Mazeika et al., HarmBench: A Standardized Evaluation Framework for Automated Red Teaming and Robust Refusal, 2024", "url": "https://arxiv.org/abs/2402.04249" },
        { "title": "Jain et al., Baseline Defenses for Adversarial Attacks Against Aligned Language Models, 2023", "url": "https://arxiv.org/abs/2309.00614" }
      ]
    }
  ]
};

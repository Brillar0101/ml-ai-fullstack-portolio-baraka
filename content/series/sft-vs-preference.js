// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
// Every factual claim is taken from the numbered sources at the end. The top row of
// Figure 19 of Bai et al. is reproduced under CC BY 4.0 (arXiv 2204.05862); the charts
// are redrawn from Table 5 of Ivison et al. and Table 8 of Xu et al.
export const POST = {
  "id": "sft-vs-preference",
  "title": "SFT, DPO and PPO on the same model: what controlled comparisons found",
  "excerpt": "Tülu 2 13B averaged 56.8 after supervised fine-tuning, 61.0 after DPO and 62.2 after PPO, and PPO took 3 days where DPO took 9 hours. The objectives written out term by term, what mattered more than the algorithm, and Anthropic's measured tension between helpful and harmless.",
  "category": "AI",
  "chapter": "Chapter 2",
  "tags": [
    "Post-training",
    "RLHF",
    "DPO",
    "PPO"
  ],
  "seriesNum": 20,
  "publishAt": "2026-04-15T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In 2024 a team at the Allen Institute for AI and the University of Washington took one supervised model, Tülu 2 13B (a fine-tuned Llama 2), and trained it further with two preference methods under matched conditions. Same starting weights, same preference data, the same 11 benchmarks.[^1] The supervised starting point averaged 56.8 across their categories. Training it with Direct Preference Optimization (DPO) on the UltraFeedback dataset raised that to 61.0. Training it with Proximal Policy Optimization (PPO), using a 13B reward model built from the same UltraFeedback data, gave 62.2. Swapping in a 70B reward model gave 62.8.[^1]"
    },
    {
      "type": "p",
      "text": "The gains were uneven. Truthfulness jumped from 56.6 to 69.3 with DPO and 71.5 with PPO. Instruction following went from 44.2 to 52.8 and 54.4. Factuality, measured by MMLU, barely moved: 55.4, 55.3, 56.0.[^1] Across five datasets, PPO beat DPO every time, by 0.7 points on average, a gap the authors report as significant at p < 0.05.[^1] The cost difference was bigger than the score difference. PPO with a 13B policy and a 13B reward model took 3 days on a TPUv3 pod of size 256, plus roughly 10 hours to train the reward model. DPO on the same data took 9 hours.[^1]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Tülu 2 13B after SFT, DPO and PPO",
      "yLabel": "Score",
      "series": [
        {
          "label": "SFT",
          "key": "sft",
          "baseline": true
        },
        {
          "label": "+DPO",
          "key": "dpo"
        },
        {
          "label": "+PPO (13B RM)",
          "key": "ppo"
        }
      ],
      "data": [
        {
          "label": "Factuality",
          "values": {
            "sft": 55.4,
            "dpo": 55.3,
            "ppo": 56.0
          }
        },
        {
          "label": "Reasoning",
          "values": {
            "sft": 47.8,
            "dpo": 50.9,
            "ppo": 52.0
          }
        },
        {
          "label": "Coding",
          "values": {
            "sft": 45.1,
            "dpo": 45.9,
            "ppo": 47.7
          }
        },
        {
          "label": "Truthfulness",
          "values": {
            "sft": 56.6,
            "dpo": 69.3,
            "ppo": 71.5
          }
        },
        {
          "label": "Instr. following",
          "values": {
            "sft": 44.2,
            "dpo": 52.8,
            "ppo": 54.4
          }
        },
        {
          "label": "Average",
          "values": {
            "sft": 56.8,
            "dpo": 61.0,
            "ppo": 62.2
          }
        }
      ],
      "caption": "Redrawn from Table 5 of Ivison et al., 2024.[^1] Both preference runs use UltraFeedback with per-aspect ratings. Safety is left out because all three sit at 91.8 to 91.9."
    },
    {
      "type": "p",
      "text": "A second study, from Tsinghua University and collaborators, found a sharper split on competitive programming. On the CodeContests test set, Code Llama 34B after supervised fine-tuning solved 15.2% of problems under the 10@1k protocol (sample 1,000 programs, submit 10). DPO dropped it to 0.0%; the authors report the DPO model \\\"outputs many meaningless code snippets.\\\" PPO raised it to 22.4%, above the 16.4% of the 41B AlphaCode system.[^2]"
    },
    {
      "type": "p",
      "text": "So three training recipes, run on the same model, give different results, and the size of the differences depends on the task. To see why, it helps to write down exactly what each one is minimizing."
    },
    {
      "type": "h2",
      "text": "What supervised fine-tuning minimizes"
    },
    {
      "type": "p",
      "text": "A language model is a **policy** \\(\\pi_\\theta(y \\mid x)\\): a probability distribution over responses \\(y\\) given a prompt \\(x\\), with weights \\(\\theta\\). It produces the response one token at a time, so the probability of a whole response is the product of per-token probabilities, each conditioned on the prompt and on the tokens already written.[^2] **Supervised fine-tuning (SFT)** trains the pretrained model to imitate demonstrations: prompts paired with good responses, which in InstructGPT were written by human labelers.[^2,4]"
    },
    {
      "type": "eq",
      "tex": "\\begin{aligned} \\mathcal{L}_{\\text{SFT}}(\\theta) = -\\,\\mathbb{E}_{(x,y)\\sim D_{\\text{SFT}}} \\\\ \\sum_{t=1}^{|y|} \\log \\pi_\\theta(y_t \\mid x, y_{<t}) \\end{aligned}",
      "caption": "The usual maximum-likelihood form of SFT, built from the autoregressive factorization in Xu et al.[^2] The papers here describe SFT in words; this equation is the standard way to write it."
    },
    {
      "type": "p",
      "text": "Read it term by term. \\(D_{\\text{SFT}}\\) is the demonstration set. \\(y_t\\) is the \\(t\\)-th token of the demonstrated response, and \\(y_{<t}\\) is everything before it. \\(\\log \\pi_\\theta(y_t \\mid x, y_{<t})\\) is how much probability the model gives to the exact token the demonstrator wrote. The minus sign turns that into a loss, so training pushes probability onto the demonstrator's choices, token by token. Nothing in the loss says one response is better than another. It only says: be more like this one."
    },
    {
      "type": "p",
      "text": "That gap shows up in practice. In the InstructGPT work, OpenAI's SFT models started to overfit on validation loss after one epoch, yet training for 16 epochs still improved reward model scores and human preference ratings.[^4] Next-token loss on held-out demonstrations and \\\"people like the output\\\" are different targets."
    },
    {
      "type": "h2",
      "text": "The reward model is a pairwise classifier"
    },
    {
      "type": "p",
      "text": "Preference methods start from a different kind of data: a prompt \\(x\\), two responses, and a label saying which one the annotator preferred. Call the chosen response \\(y_c\\) and the rejected one \\(y_r\\). A **reward model** \\(R_\\psi(x, y)\\) is a transformer whose language-modeling head is replaced by a head that outputs one number per response.[^1] It is trained under the **Bradley-Terry** assumption, which says the probability that \\(y_c\\) beats \\(y_r\\) is the sigmoid of the difference of their scores.[^2]"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} P(y_c \\succ y_r \\mid x) = \\sigma\\big(R_\\psi(x,y_c) - R_\\psi(x,y_r)\\big) \\\\[4pt] \\mathcal{L}_R(\\psi) = -\\,\\mathbb{E}_{(x,y_c,y_r)\\sim D_R} \\\\ \\log \\sigma\\big(R_\\psi(x,y_c) - R_\\psi(x,y_r)\\big) \\end{gathered}",
      "caption": "The Bradley-Terry preference probability and the reward model loss, equation 3 and 4 of Xu et al.[^2] and equation 1 of Ivison et al.[^1]"
    },
    {
      "type": "p",
      "text": "\\(D_R\\) is the preference dataset. \\(\\sigma\\) is the logistic sigmoid, \\(\\sigma(z) = 1/(1+e^{-z})\\). The loss only ever sees the difference between the two scores, so adding a constant to every reward changes nothing; the scale is fixed only by the sigmoid. Minimizing it is binary cross-entropy: the model is a classifier for \\\"which of these two did the human pick,\\\" and the score it learns is whatever makes that classification work. Anthropic used the same relation to read their scores: a preference model score gap \\(\\Delta\\) predicts that the higher-scored response wins with probability \\(1/(1+e^{-\\Delta})\\).[^3]"
    },
    {
      "type": "h2",
      "text": "PPO maximizes reward minus a KL leash"
    },
    {
      "type": "p",
      "text": "Reinforcement learning from human feedback (RLHF) with PPO then trains the policy to produce responses the reward model scores highly, without drifting too far from where it started. The reference policy \\(\\pi_{\\text{ref}}\\) is usually the SFT model that training begins from.[^1]"
    },
    {
      "type": "eq",
      "tex": "\\begin{aligned} \\max_{\\pi_\\theta}\\; & \\mathbb{E}_{x\\sim D_\\pi,\\; y\\sim\\pi_\\theta(y\\mid x)} \\big[R_\\psi(x,y)\\big] \\\\ & -\\, \\beta\\, D_{\\mathrm{KL}}\\big(\\pi_\\theta \\,\\|\\, \\pi_{\\text{ref}}\\big) \\end{aligned}",
      "caption": "The KL-regularized objective, equation 2 of Ivison et al.[^1]"
    },
    {
      "type": "p",
      "text": "\\(D_\\pi\\) is a set of prompts with no responses attached. The responses \\(y\\) are sampled from the policy being trained, which is what **on-policy** or online means: the model is graded on its own current outputs, not on a fixed file. \\(R_\\psi(x,y)\\) is the reward model's score for that response. \\(D_{\\mathrm{KL}}(\\pi_\\theta \\| \\pi_{\\text{ref}})\\) is the Kullback-Leibler divergence, a measure of how far the new distribution has moved from the reference, and \\(\\beta\\) sets how hard that movement is penalized."
    },
    {
      "type": "p",
      "text": "In implementation the KL term is spread over tokens. Ivison et al. give every token a reward of \\(-\\beta\\) times the log ratio of the policy's and the reference's probability for that token, and add the reward model's score only at the last token.[^1] A separate **value model** estimates how much reward a half-written response will end up with, and the gap between what actually came back and that estimate is the **advantage** \\(A_t\\).[^1] PPO then updates the policy with a clipped objective:"
    },
    {
      "type": "eq",
      "tex": "\\begin{aligned} L^{\\text{CLIP}}(\\theta) = \\hat{\\mathbb{E}}_t\\Big[\\min\\big(& \\rho_t A_t,\\\\ &\\mathrm{clip}(\\rho_t, 1-\\epsilon, 1+\\epsilon)\\, A_t\\big)\\Big] \\end{aligned}",
      "caption": "Equation 7 of Schulman et al., 2017,[^6] with \\(\\rho_t\\) the ratio of the new to the old policy's probability of token \\(y_t\\)."
    },
    {
      "type": "p",
      "text": "\\(\\rho_t\\) is 1 when the policy has not changed. If an update would push \\(\\rho_t\\) outside \\([1-\\epsilon, 1+\\epsilon]\\) in the direction that improves the objective, clipping removes the incentive, so each step stays small.[^6] Ivison et al. used \\(\\epsilon = 0.2\\), \\(\\beta = 0.05\\) (0.0325 with the 70B reward model), sampling temperature 0.7, and one pass over the prompts; training beyond one epoch \\\"occasionally resulted in the training collapsing entirely.\\\"[^1] Generating the rollouts took more than 95% of PPO's training time.[^1] Anthropic wrote the same trade as a single reward, \\(r_{\\text{PM}} - \\lambda_{\\text{KL}} D_{\\mathrm{KL}}\\), with \\(\\lambda_{\\text{KL}} = 0.001\\), a value they say \\\"might actually be wholly unnecessary.\\\"[^3]"
    },
    {
      "type": "p",
      "text": "DPO skips both the reward model and the sampling. Rafailov et al. showed that the optimum of the KL-regularized objective implies a reward equal to \\(\\beta \\log\\) of the policy-to-reference probability ratio, plus a term that depends only on the prompt.[^5] Substitute that into the Bradley-Terry loss and the prompt term cancels, leaving a loss on the policy alone: \\(-\\log\\sigma\\) of \\(\\beta\\) times the chosen response's log ratio minus the rejected one's.[^1,2,5] It trains on a fixed file of pairs, which is what **offline** means here."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Reference policy",
          "def": "The frozen model the KL penalty measures distance from, usually the SFT checkpoint."
        },
        {
          "term": "On-policy (online)",
          "def": "Training data is generated by the current model during training, as in PPO."
        },
        {
          "term": "Offline",
          "def": "Training uses a fixed, pre-collected set of responses, as in standard DPO."
        },
        {
          "term": "Distribution shift",
          "def": "The responses in the preference data look unlike what the model itself would write."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Data moved the scores more than the algorithm did"
    },
    {
      "type": "p",
      "text": "Before comparing algorithms, Ivison et al. ran DPO on 14 preference datasets. The overall average ranged from 51.5 (Chatbot Arena 2024) to 61.0 (UltraFeedback with per-aspect ratings).[^1] That spread is about 9.5 points; the average PPO-over-DPO gap on matched data was 0.7. Their conclusion ranks the factors in that order: preference data quality first, then algorithm, then reward model, then the choice of training prompts.[^1]"
    },
    {
      "type": "p",
      "text": "Some details inside that table are worth knowing. Datasets built from per-aspect scores (a rater scores helpfulness, harmlessness and so on separately, and the scores are averaged) did best. HelpSteer, with 9,270 pairs, scored 58.0; HH-RLHF, with 158,530, scored 58.1.[^1] The choice of which response counts as chosen mattered more than how good the responses themselves were.[^1] And DPO on Chatbot Arena votes cut the safety score from 91.8 to 67.3 (2023 data) and 58.1 (2024 data), which the authors read as volunteers there tending to prefer more toxic completions.[^1] Preference training learns whatever the labels reward, including things nobody meant to ask for."
    },
    {
      "type": "p",
      "text": "Xu et al. found DPO especially sensitive to where its data came from. On the SafeRLHF dataset, a Llama 2 7B model fine-tuned on Alpaca and then trained with DPO reached a 55.4% safety rate. First fine-tuning the same model on SafeRLHF's own safe responses, so the preference data looked more like its outputs, raised DPO to 71.8% and its helpfulness score from -4.19 to -1.62. PPO reached 99.5% with a helpfulness of +1.69.[^2] Their theory result explains the mechanism: every policy PPO can reach also minimizes the DPO loss, but not the reverse. In a three-response toy case where the data compares only the first two, DPO can put 90% of its probability on the third response, which appears nowhere in the data. The KL term rules that out for PPO because the reference gives it zero probability.[^2]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Code Llama 34B on CodeContests (test set, 10@1k)",
      "yLabel": "Problems solved (%)",
      "series": [
        {
          "label": "Solved",
          "key": "s"
        }
      ],
      "data": [
        {
          "label": "SFT",
          "values": {
            "s": 15.2
          }
        },
        {
          "label": "DPO",
          "values": {
            "s": 0.0
          }
        },
        {
          "label": "DPO-Iter",
          "values": {
            "s": 3.2
          }
        },
        {
          "label": "PPO",
          "values": {
            "s": 22.4
          }
        },
        {
          "label": "AlphaCode 41B",
          "values": {
            "s": 16.4
          }
        }
      ],
      "caption": "Redrawn from Table 8 of Xu et al., 2024.[^2] DPO-Iter regenerates responses from the current model and labels them with the test cases each round. AlphaCode's figure includes its clustering step and used both Python and C++; the Code Llama runs used Python only."
    },
    {
      "type": "p",
      "text": "PPO also needed tuning to win. On APPS introductory problems, a baseline PPO run with batch size 64 dropped Code Llama 34B from 38.6% to 18.0% pass@5. Adding advantage normalization brought it to 38.1%, large batches to 42.3%, and slowly updating the reference model with an exponential moving average to 44.4%.[^2] A comparison of \\\"DPO versus PPO\\\" is also a comparison of how carefully each was configured."
    },
    {
      "type": "h2",
      "text": "A bigger reward model mostly helped math"
    },
    {
      "type": "p",
      "text": "If the reward model is PPO's teacher, a better teacher should help. Ivison et al. tested this with reward models at 13B and 70B, trained on UltraFeedback alone or on a larger mix of six datasets. On RewardBench, a direct test of whether a reward model picks the human-chosen response, the 13B mixture model scored 79.8 against 61.0 for the 13B UltraFeedback model. Used inside PPO, it produced a slightly worse policy: 61.6 average against 62.2.[^1] Only the 70B UltraFeedback reward model improved the overall average, to 62.8, and most of that came from GSM8K math, 53.0 to 58.0.[^1] With prompts drawn from the GSM8K training set and a 70B reward model, GSM8K accuracy rose from the SFT model's 46% to 62%.[^1] Better reward-model benchmark scores did not reliably turn into a better policy, a result the authors describe as surprising."
    },
    {
      "type": "h2",
      "text": "Anthropic's two datasets pulled in opposite directions"
    },
    {
      "type": "p",
      "text": "Bai et al. at Anthropic, in 2022, collected two separate kinds of human comparisons, mostly on 52B models. In the helpfulness task, crowdworkers asked for help and picked the more helpful and honest of two replies. In the red-teaming task, they tried to provoke harmful output and picked the more harmful reply.[^3] The base set held 44k helpfulness and 42k red-team comparisons.[^3] They trained preference models at seven sizes from 13M to 52B parameters and found accuracy rising roughly log-linearly with both model size and data size.[^3]"
    },
    {
      "type": "p",
      "text": "Then they mixed the two datasets in 10% steps from all-helpful to all-harmless, holding the total at 42k comparisons. A preference model trained only on one kind of data scored well below chance on the other.[^3]"
    },
    {
      "type": "image",
      "src": "/blog-images/sft-vs-preference/bai-help-harm-mixture.webp",
      "alt": "Two line charts. Left: helpfulness test accuracy falls from about 0.66 to 0.72 at 0% harmlessness data to about 0.36 to 0.38 at 100%. Right: harmlessness test accuracy rises from about 0.33 to 0.35 at 0% to about 0.68 to 0.75 at 100%. Each line is a model size from 13M to 52B; larger models stay flatter across the middle.",
      "width": 1860,
      "height": 590,
      "caption": "Top row of Figure 19 from Bai et al., 2022,[^3] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Each line is a preference model size; color runs from 13M (purple) to 52B (yellow). At either extreme, accuracy on the other test set falls to roughly 0.33 to 0.38 (my reading of the plot), below the 0.5 of guessing."
    },
    {
      "type": "p",
      "text": "The paper also reports that larger preference models are less sensitive to the exact mixture, possibly because they are better at telling reasonable requests from harmful ones.[^3] The tension reached the policies too. Early in the project, many RLHF policies gave the same exaggerated answer to anything remotely sensitive, such as recommending therapy whenever a user expressed any displeasure. The authors attribute it to over-optimizing harmlessness and under-optimizing helpfulness: to score well on red-team prompts, a reply like \\\"I can't answer that\\\" is probably enough, and that is easier to learn than being helpful.[^3]"
    },
    {
      "type": "p",
      "text": "They trace part of the cause to their own labels. Because red-teamers picked the worse reply, the harmlessness data only told the model what not to do, and never showed what a good answer to a harmful request looks like beyond the first turn.[^3] They partly fixed the problem by giving RLHF a larger share of helpfulness prompts, and proposed collecting data where workers pick the best response instead.[^3] On capability, they report a split by size: small models paid an \\\"alignment tax\\\" on NLP evaluations after RLHF, while their 13B and 52B models did better zero-shot and the same few-shot.[^3]"
    },
    {
      "type": "h2",
      "text": "What the Tülu study did not measure"
    },
    {
      "type": "p",
      "text": "Ivison et al. list their own limits. The results come from one model suite, Tülu 2, on two base models, Llama 2 and Llama 3, and do not cover multilingual use. They also note that while PPO does well, it costs much more compute than DPO, and that they \\\"don't explicitly measure the relative computational cost\\\" of the methods, for example in FLOPs.[^1] The 0.7-point average win for PPO on their benchmarks therefore has no cost column beside it, apart from the wall-clock figures in their appendix: 3 days of PPO on a size-256 TPUv3 pod against 9 hours of DPO for the same 13B model.[^1]"
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        {
          "title": "Ivison et al., Unpacking DPO and PPO: Disentangling Best Practices for Learning from Preference Feedback, NeurIPS 2024",
          "url": "https://arxiv.org/abs/2406.09279"
        },
        {
          "title": "Xu et al., Is DPO Superior to PPO for LLM Alignment? A Comprehensive Study, ICML 2024",
          "url": "https://arxiv.org/abs/2404.10719"
        },
        {
          "title": "Bai et al., Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback, 2022",
          "url": "https://arxiv.org/abs/2204.05862"
        },
        {
          "title": "Ouyang et al., Training Language Models to Follow Instructions with Human Feedback, 2022",
          "url": "https://arxiv.org/abs/2203.02155"
        },
        {
          "title": "Rafailov et al., Direct Preference Optimization: Your Language Model is Secretly a Reward Model, 2023",
          "url": "https://arxiv.org/abs/2305.18290"
        },
        {
          "title": "Schulman et al., Proximal Policy Optimization Algorithms, 2017",
          "url": "https://arxiv.org/abs/1707.06347"
        }
      ]
    }
  ]
};

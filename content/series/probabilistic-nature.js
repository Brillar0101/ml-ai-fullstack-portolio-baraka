// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
// Every factual claim below is taken from the numbered sources at the end.
// All three charts are redrawn from table values: Ouyang et al. (Table 5),
// Holtzman et al. (Table 1) and Atil et al. (Table 2). No paper figure is copied.
export const POST = {
  "id": "probabilistic-nature",
  "title": "One distribution, three dials, and a temperature zero that still wobbles",
  "excerpt": "Researchers sent ChatGPT the same coding prompt five times and, on 75.76% of CodeContests problems, got five programs with no test output in common. Where that variation comes from: temperature, top-k, nucleus sampling, and the batching arithmetic that keeps temperature 0 from being deterministic.",
  "category": "AI",
  "tags": [
    "Sampling",
    "Determinism",
    "Reliability"
  ],
  "seriesNum": 31,
  "publishAt": "2026-06-26T12:00:00Z",
  "body": [
    {
      "type": "h2",
      "text": "Five requests, five different programs"
    },
    {
      "type": "p",
      "text": "Shuyin Ouyang and colleagues at King's College London, UCL and Bristol took 829 programming problems from three benchmarks and sent each one to ChatGPT through the API five times, with the identical prompt every time.[^1] Then they ran the five programs they got back against the benchmark tests and compared the outputs. On CodeContests, a set of 165 competitive programming problems, 75.76% of the problems had an **output equivalence rate** of zero: across the five programs, not a single test produced the same output twice.[^1] On APPS the figure was 51.00%, and on HumanEval, 47.56%.[^1]"
    },
    {
      "type": "p",
      "text": "Correctness moved too. On 39.63% of HumanEval problems, one of the five programs passed every test and another passed none, the largest swing the metric allows.[^1] These runs used GPT-3.5 at the API's default temperature of 1, with everything else left at its default except the model name and the prompt.[^1] The authors also counted how often papers account for this. Out of 76 recent papers on LLM code generation, 21.1% considered non-determinism in their experiments.[^1]"
    },
    {
      "type": "p",
      "text": "None of this is a malfunction. A language model does not produce an answer. It produces a probability for every possible next token, and a separate piece of code, the **sampler**, picks one. The authors put it plainly: the randomness usually comes from the sampling method, so identical prompts \"can yield completely different responses.\"[^1] Three settings control that pick, and they all act on the same distribution. What follows explains each one using the paper that measured it, then covers the part that surprises people: setting the temperature to 0 does not make the output repeatable either.[^1,5,6]"
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Token",
          "def": "a word or piece of a word. The model generates text one token at a time."
        },
        {
          "term": "Logit",
          "def": "the raw score the model gives each token in its vocabulary before the scores are turned into probabilities."
        },
        {
          "term": "Decoding",
          "def": "the rule that turns the model's probabilities into an actual next token, step after step."
        },
        {
          "term": "Greedy decoding",
          "def": "always taking the single most probable token. This is what temperature 0 is meant to do."
        },
        {
          "term": "Beam search",
          "def": "keeping the b most probable partial sequences at each step and returning the most probable complete one."
        }
      ]
    },
    {
      "type": "h2",
      "text": "The distribution, and the first dial"
    },
    {
      "type": "p",
      "text": "At each step the model outputs one logit per vocabulary entry. The softmax turns those logits into probabilities, and temperature is a single number that divides every logit before the softmax runs. Holtzman et al. write it this way:[^2]"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} p(x = V_l \\mid x_{1:i-1}) \\\\[4pt] = \\frac{\\exp(u_l / t)}{\\sum_{l'} \\exp(u_{l'} / t)} \\end{gathered}",
      "caption": "Softmax with temperature, equation 4 of Holtzman et al., 2020.[^2] Atil et al. use the same form.[^5]"
    },
    {
      "type": "p",
      "text": "Read it term by term. \\(x_{1:i-1}\\) is everything generated so far, prompt included. \\(V_l\\) is the \\(l\\)-th token in the vocabulary, and \\(u_l\\) is its logit. \\(t\\) is the temperature. The top of the fraction scores one token and the bottom adds up the scores of every token, so the results are positive and sum to 1. That is a probability distribution, and the sampler draws the next token from it.[^2]"
    },
    {
      "type": "p",
      "text": "Dividing by \\(t\\) is what makes it a dial. At \\(t = 1\\) the model's own probabilities come through unchanged. A \\(t\\) between 0 and 1 stretches the gaps between logits, which, in the paper's words, \"skews the distribution towards high probability events\" and lowers the mass in the tail.[^2] A \\(t\\) above 1 flattens the distribution.[^5] As \\(t\\) shrinks toward 0, nearly all the probability piles onto the top token. The formula itself cannot be evaluated at exactly 0, since that would divide by zero, so APIs treat temperature 0 as a rule: always take the highest-probability token, which is greedy decoding.[^1,6]"
    },
    {
      "type": "p",
      "text": "Ouyang et al. reran their CodeContests experiment at three temperatures. Lower temperature did make the five programs agree more often, but it never got close to full agreement.[^1]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "CodeContests problems where five identical requests shared no test output",
      "yLabel": "% of problems",
      "series": [
        {
          "label": "OER = 0",
          "key": "w"
        }
      ],
      "data": [
        {
          "label": "t = 0",
          "values": {
            "w": 43.64
          }
        },
        {
          "label": "t = 0.5",
          "values": {
            "w": 62.42
          }
        },
        {
          "label": "t = 1 (default)",
          "values": {
            "w": 75.76
          }
        }
      ],
      "caption": "Redrawn from Table 5 of Ouyang et al.[^1] 165 problems, five separate API requests each, with GPT-3.5. OER is the share of test outputs that are identical across the five programs. The mean test pass rate stayed almost flat, between 0.15 and 0.16, at all three temperatures."
    },
    {
      "type": "p",
      "text": "That flat pass rate led the authors to suggest low temperature for code, since it gave comparable correctness with less variation.[^1] Temperature has a cost in open-ended writing, though, and that cost is where the other two dials come from."
    },
    {
      "type": "h2",
      "text": "Why the most likely text is bad text"
    },
    {
      "type": "p",
      "text": "Ari Holtzman, Jan Buys, Li Du, Maxwell Forbes and Yejin Choi studied decoding for open-ended generation, meaning tasks like continuing a story where many continuations are acceptable.[^2] They used GPT-2 Large and generated 5,000 passages of up to 200 tokens, each continuing the opening of a held-out WebText document.[^2] The obvious approach is to ask for the most probable text, through greedy decoding or beam search. The paper shows that this approach degenerates: the output is \"bland, incoherent, or gets stuck in repetitive loops.\"[^2]"
    },
    {
      "type": "p",
      "text": "The numbers are stark. The authors counted a generation as stuck when a phrase of at least two tokens repeated at least three times at its end. Human text did this 0.28% of the time. Greedy decoding did it 73.66% of the time, and beam search with a beam of 16 did it 28.94% of the time.[^2] Perplexity tells the same story. Perplexity measures how surprised the model is by a text, with lower meaning more predictable. The model scored human continuations at 12.38 and its own greedy output at 1.50.[^2] So the greedy text was far more predictable to the model than anything a person actually writes. In the paper's first example, a beam of 32 repeats a university's name over and over, and the caption notes that at beam widths of 64 or more GPT-2 Large and XL prefer to stop generating right after the prompt.[^2]"
    },
    {
      "type": "p",
      "text": "The paper gives two reasons. First, repetition feeds itself: each time a phrase repeats, the model assigns it a higher probability of repeating again, a positive feedback loop the authors found for the vast majority of phrases they tested.[^2] Second, people do not write the most probable next word. Natural text rarely stays in a high-probability zone for several tokens in a row and keeps veering into less likely, more informative words. The authors conjecture this is a property of human language and link it to Grice's maxims, since people avoid stating the obvious.[^2] Fan et al. had seen the same thing in story generation two years earlier: beam search stories \"tend to be short and generic.\"[^3]"
    },
    {
      "type": "p",
      "text": "Sampling from the full distribution, which the paper calls pure sampling, fails the other way. Its perplexity was 22.73, worse than human text, and its output wanders off topic. In one sample it made up a word, \"umidauda,\" apparently a bird species.[^2] The authors blame the **unreliable tail**: tens of thousands of low-probability tokens that each have a tiny chance, but together are sampled far too often.[^2] Lowering the temperature shrinks the tail, but it also brings back repetition. The paper reports that temperatures below 0.9 \"severely increase repetition.\"[^2]"
    },
    {
      "type": "h2",
      "text": "Second dial: keep the top k"
    },
    {
      "type": "p",
      "text": "The blunt fix is to remove the tail. **Top-k sampling** keeps the \\(k\\) most probable tokens, sets every other probability to zero, rescales the survivors so they sum to 1, and samples from that. Fan et al. used it with \\(k = 10\\), noting that completely random sampling \"can introduce very unlikely words\" and that restricting to the top 10 reduces that risk.[^3] Holtzman et al. note that the best-known GPT-2 samples, such as OpenAI's unicorn article, were also produced with top-k sampling.[^2]"
    },
    {
      "type": "p",
      "text": "Holtzman et al. argue that no single \\(k\\) is right, because the shape of the distribution changes from one step to the next. Sometimes the head is flat, with tens or hundreds of reasonable tokens, as with nouns or verbs in a generic context. Sometimes one token holds almost all the mass. A small \\(k\\) makes flat steps bland, and a large \\(k\\) lets bad candidates into peaked steps, where rescaling actually increases their chance of being picked.[^2]"
    },
    {
      "type": "h2",
      "text": "Third dial: keep the top p of the probability"
    },
    {
      "type": "p",
      "text": "**Nucleus sampling**, the paper's proposal, cuts by probability mass instead of by count. At each step it takes the smallest set of tokens whose probabilities add up to at least \\(p\\), then rescales and samples within that set.[^2]"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} V^{(p)} = \\text{smallest set with} \\\\ \\sum_{x \\in V^{(p)}} P(x \\mid x_{1:i-1}) \\ge p \\\\[6pt] P'(x \\mid x_{1:i-1}) = \\frac{P(x \\mid x_{1:i-1})}{p'} \\;\\text{ if } x \\in V^{(p)}, \\text{ else } 0 \\end{gathered}",
      "caption": "Nucleus (top-p) sampling, equations 2 and 3 of Holtzman et al.[^2] \\(p'\\) is the total probability of the tokens that were kept."
    },
    {
      "type": "p",
      "text": "\\(V^{(p)}\\) is the nucleus. When the model is confident, the nucleus might be one token. When it is unsure, the nucleus grows. The authors report it usually holds between one and a thousand candidates.[^2] Top-k uses the same rescaling step. The only difference is where the cut falls.[^2] One setting, like \\(p = 0.95\\), adapts to both flat and peaked steps, which a fixed \\(k\\) cannot do."
    },
    {
      "type": "p",
      "text": "To judge quality and diversity together, the paper used HUSE, a measure from Hashimoto, Zhang and Liang. It is twice the error rate of a classifier that tries to tell human text from model text using two signals: the model's probability for the text and human ratings of how typical it reads.[^4] If the classifier cannot tell them apart, HUSE approaches 1. Holtzman et al. collected 20 human ratings for each of 200 generations per method, 4,000 ratings per method.[^2]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "HUSE by decoding method, GPT-2 Large",
      "yLabel": "HUSE (higher is better)",
      "series": [
        {
          "label": "HUSE",
          "key": "h"
        }
      ],
      "data": [
        {
          "label": "Top-k 40, t=0.7",
          "values": {
            "h": 0.08
          }
        },
        {
          "label": "Top-k 40",
          "values": {
            "h": 0.19
          }
        },
        {
          "label": "Pure sampling",
          "values": {
            "h": 0.67
          }
        },
        {
          "label": "Sampling, t=0.9",
          "values": {
            "h": 0.79
          }
        },
        {
          "label": "Top-k 640",
          "values": {
            "h": 0.94
          }
        },
        {
          "label": "Nucleus p=0.95",
          "values": {
            "h": 0.97
          }
        }
      ],
      "caption": "Redrawn from Table 1 of Holtzman et al., 2020.[^2] Greedy and beam search have no HUSE score in the table. For top-k and nucleus the authors computed HUSE on a distribution mixed with 0.1 of the original, because the truncated versions scored near 0 despite humans favoring them."
    },
    {
      "type": "p",
      "text": "Nucleus sampling scored highest and top-k came second.[^2] Its perplexity was 13.13, against 12.38 for human text, and its repetition rate was 0.36%.[^2] The pairing common at the time, top-k 40 with temperature 0.7, did worst. It scored 0.08, and its repetition rate was 8.86%.[^2] The caveat in the caption matters: the truncated methods had to be scored on a smoothed version of themselves, so the HUSE comparison is not perfectly like for like.[^2]"
    },
    {
      "type": "p",
      "text": "This is why hosted APIs expose temperature and top_p as separate settings. Ouyang et al. kept top_p at its default of 1, which switches nucleus truncation off, and changed only the temperature.[^1]"
    },
    {
      "type": "h2",
      "text": "Temperature 0, and the answers still change"
    },
    {
      "type": "p",
      "text": "Greedy decoding has no randomness in it. Given the same logits, it picks the same token every time. Ouyang et al. point out that the logits should be \"a pure function of the input sequence and the model weights.\"[^1] Yet at temperature 0, 43.64% of their CodeContests problems still had five programs with no shared test output. The figures were 27.40% on APPS and 18.29% on HumanEval.[^1] The authors call this \"contrary to many people's belief.\"[^1]"
    },
    {
      "type": "p",
      "text": "Berk Atil and colleagues from Penn State and Comcast went further. They tested five models, GPT-3.5 Turbo, GPT-4o, Llama-3-70B-Instruct, Llama-3-8B-Instruct and Mixtral-8x7B-Instruct, on eight multiple-choice tasks from BBH and MMLU. Each ran ten times with temperature 0, top-p 1 and a fixed seed.[^5] Accuracy varied by up to 15% between runs, and the gap between best possible and worst possible accuracy reached 70%.[^5] Best possible accuracy counts a question as right if any run got it right. Worst possible counts it wrong if any run got it wrong.[^5]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "MMLU college math, 10 runs at temperature 0 (few-shot)",
      "yLabel": "Accuracy (%)",
      "series": [
        {
          "label": "Worst possible",
          "key": "w",
          "baseline": true
        },
        {
          "label": "Median",
          "key": "m"
        },
        {
          "label": "Best possible",
          "key": "b"
        }
      ],
      "data": [
        {
          "label": "GPT-3.5 Turbo",
          "values": {
            "w": 34,
            "m": 38,
            "b": 39
          }
        },
        {
          "label": "GPT-4o",
          "values": {
            "w": 44,
            "m": 69,
            "b": 88
          }
        },
        {
          "label": "Llama-3-8B",
          "values": {
            "w": 4,
            "m": 22.5,
            "b": 50
          }
        },
        {
          "label": "Llama-3-70B",
          "values": {
            "w": 22,
            "m": 54.5,
            "b": 85
          }
        },
        {
          "label": "Mixtral-8x7B",
          "values": {
            "w": 3,
            "m": 31.5,
            "b": 75
          }
        }
      ],
      "caption": "Redrawn from Table 2 of Atil et al.[^5] 100 questions, 5-shot prompts, ten runs per model with identical inputs and settings. With deterministic decoding all three bars would be the same height."
    },
    {
      "type": "p",
      "text": "Raw strings were less stable than answers. Atil et al. define TARr@10 as the share of questions where all ten raw responses match character for character, and TARa@10 as the share where the parsed answer matches.[^5] For GPT-4o on college math, TARa@10 was 50.0% and TARr@10 was 0.0%. For none of the 100 questions did it write the same response ten times.[^5] Longer outputs were less stable, and the authors suggest capping maximum output length for that reason.[^5] Their engineering note is simple arithmetic: a dialog system built from four classifiers that are each 95% stable is \\(0.95^4 \\approx 0.814\\) stable overall, before accuracy on new inputs is even counted.[^5]"
    },
    {
      "type": "h2",
      "text": "Floating point, and the batch you share"
    },
    {
      "type": "p",
      "text": "Ouyang et al. describe the cause as \"still controversial.\" The hypotheses they list are floating point, unreliable GPU calculations, and a sparse mixture-of-experts architecture that fails to enforce per-sequence determinism.[^1] The basic fact behind the first one is that floating point addition is not associative. \\((a + b) + c\\) can differ from \\(a + (b + c)\\), because every addition rounds to a fixed number of significant digits. The Thinking Machines report by Horace He gives the example that \\((0.1 + 10^{20}) - 10^{20}\\) comes out as 0 while \\(0.1 + (10^{20} - 10^{20})\\) comes out as 0.1.[^6] If a sum is computed in a different order, the result can change in the last bits. At temperature 0, a change that small is enough to flip which of two nearly tied tokens ranks first, and after that the whole continuation differs. (That last step is my reading of how the pieces connect. The report shows the divergence without stating it this way.)"
    },
    {
      "type": "p",
      "text": "The common explanation is that parallel GPU threads finish in random order. The report argues that this is not the main culprit for inference. It says a typical LLM forward pass contains no atomic adds, the operations whose order depends on which core finishes first, so the forward pass is run-to-run deterministic: the same batch in gives bitwise the same result out.[^6] The problem is that the kernels are not **batch invariant**. To keep the GPU busy, a kernel picks its strategy by batch size: with a small batch it may split each sum across cores (a split-K matmul) or use different tensor-core instructions, and either choice changes the order in which a row's numbers are added.[^6] The report demonstrates this in PyTorch: multiplying one row alone and multiplying it as part of a 2,048-row batch gives results for that row that differ by up to 1669.25.[^6] On a shared server, the batch size depends on how many other users' requests are in flight. For any single user, that is outside their control.[^6]"
    },
    {
      "type": "p",
      "text": "The report measured it. It sampled 1,000 completions of \"Tell me about Richard Feynman\" from Qwen3-235B-A22B-Instruct-2507 at temperature 0, 1,000 tokens each. There were 80 unique completions, and the most common appeared 78 times.[^6] All 1,000 matched for the first 102 tokens. At token 103, after \"Feynman was born on May 11, 1918, in,\" 992 continued with \"Queens, New York\" and 8 with \"New York City.\"[^6] With batch-invariant kernels enabled, all 1,000 were identical. That determinism had a cost: on Qwen-3-8B, 1,000 requests took 26 seconds with default vLLM, 55 seconds with the unoptimized deterministic version, and 42 seconds with an improved attention kernel.[^6] The report is a technical blog post from a company, not a peer-reviewed paper, and should be read that way."
    },
    {
      "type": "p",
      "text": "Atil et al. arrived at the same suspect from the other side. They ran Llama-3-8B on their own GPUs without serving optimizations and got deterministic results. They name continuous batching, chunked prefill and prefix caching as optimizations that might introduce non-determinism.[^5] Continuous batching is exactly the practice of mixing different users' requests into one batch."
    },
    {
      "type": "callout",
      "title": "What each dial controls",
      "text": "Temperature reshapes the whole distribution. Top-k and top-p cut off its tail before sampling.[^2] None of the three touches the arithmetic that produces the logits, so none of them can make a shared, batched server repeat itself exactly.[^5,6] Ouyang et al. advise developers that even temperature 0 \"could not guarantee the determinism,\" and advise researchers to report averages, variance, or distributions over multiple requests.[^1]"
    },
    {
      "type": "p",
      "text": "The hosted-model half of this story is the least certain part, and the paper says so. Atil et al. write that because GPT-3.5 and GPT-4o are closed source, and all five models were \"hosted behind APIs we don't control, we can only speculate about the reason for this behavior.\"[^5] The batching explanation is tested on open engines and local GPUs. For the hosted APIs where the variation was measured, it is still an inference."
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        {
          "title": "Ouyang, Zhang, Harman, and Wang, An Empirical Study of the Non-determinism of ChatGPT in Code Generation, 2023 (v2 2024)",
          "url": "https://arxiv.org/abs/2308.02828"
        },
        {
          "title": "Holtzman, Buys, Du, Forbes, and Choi, The Curious Case of Neural Text Degeneration, ICLR 2020",
          "url": "https://arxiv.org/abs/1904.09751"
        },
        {
          "title": "Fan, Lewis, and Dauphin, Hierarchical Neural Story Generation, ACL 2018",
          "url": "https://arxiv.org/abs/1805.04833"
        },
        {
          "title": "Hashimoto, Zhang, and Liang, Unifying Human and Statistical Evaluation for Natural Language Generation, NAACL 2019",
          "url": "https://arxiv.org/abs/1904.02792"
        },
        {
          "title": "Atil et al., Non-Determinism of \"Deterministic\" LLM Settings, 2024 (v5 2025)",
          "url": "https://arxiv.org/abs/2408.04667"
        },
        {
          "title": "He and Thinking Machines Lab, Defeating Nondeterminism in LLM Inference, technical report (blog), September 2025",
          "url": "https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/"
        }
      ]
    }
  ]
};

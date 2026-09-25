// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx.
// Every factual claim below is taken from the numbered sources at the end.
// All three charts are redrawn from table values: Meister et al. 2020 (Table 1),
// Su et al. 2022 (Table 1) and Nguyen et al. 2025 (Table 3a). No paper figure is copied.
export const POST = {
  "id": "next-word-sampling",
  "title": "The most probable sentence is often empty: decoding after beam search",
  "excerpt": "Widening the beam dropped a translation model's BLEU from 36.42 to 14.66, and exact search picked the empty string for most sentences. Why the most probable output is not the best one, and how locally typical sampling, contrastive search and min-p each answer that, with their measured results and the dispute over min-p.",
  "category": "AI",
  "tags": [
    "Decoding",
    "Beam Search",
    "Sampling"
  ],
  "seriesNum": 3,
  "publishAt": "2026-06-25T12:00:00Z",
  "body": [
    {
      "type": "h2",
      "text": "A better search, a worse translation"
    },
    {
      "type": "p",
      "text": "In 2020 Clara Meister, Tim Vieira and Ryan Cotterell ran a Transformer translation model, trained on the WMT'14 English to French data, over the first 1,000 sentences of the Newstest2014 test set.[^1] They decoded with beam search and changed only one setting, the beam size. At a beam of 5 the BLEU score was 36.42. At 10 it was 36.30, at 100 it fell to 32.83, and at 500 it collapsed to 14.66.[^1] BLEU measures overlap with a human reference translation."
    },
    {
      "type": "p",
      "text": "That is backwards. A wider beam is a better search. It keeps more candidate sentences alive at each step, so it is more likely to find the sentence the model itself scores highest. The authors note it is widely known that beams wider than 5 can hurt downstream metrics, which earlier papers called the beam search curse.[^1]"
    },
    {
      "type": "p",
      "text": "Felix Stahlberg and Bill Byrne had pushed the same experiment to its end a year earlier. They built an exact search that is guaranteed to find the single highest-scoring translation, and ran it with a Transformer base model on the whole WMT15 English to German test set.[^2] Beam search with a beam of 10 scored 30.3 BLEU. Exact search scored 2.1. For 51.8% of the sentences, the translation the model rated most probable was the empty string: no words, just the end-of-sentence token.[^2] A larger, heavily tuned Transformer Big model still preferred the empty translation for 25.8% of sentences.[^2]"
    },
    {
      "type": "p",
      "text": "So the most probable output is often bad, and sometimes it is nothing at all. Every decoding method in this post is a different answer to the question that follows: if the model's favourite sequence is not what we want, what should the decoder look for instead? Temperature, top-k and nucleus sampling, covered in an earlier post, are one family of answers. Holtzman et al. documented the matching failure in open-ended writing, where maximizing probability produces repetitive loops.[^7]"
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Decoding",
          "def": "the procedure that turns a model's next-token probabilities into an actual output sequence."
        },
        {
          "term": "MAP decoding",
          "def": "searching for the one sequence with the highest total probability under the model. MAP stands for maximum a posteriori."
        },
        {
          "term": "Beam search",
          "def": "a pruned search that keeps only the k highest-scoring partial sequences at each step. k is the beam size; k = 1 is greedy decoding."
        },
        {
          "term": "Surprisal",
          "def": "the negative log-probability of a token given what came before it. A likely token has low surprisal, an unexpected one has high surprisal. It is the token's information content."
        },
        {
          "term": "Conditional entropy",
          "def": "the average surprisal the model expects at a given step, taken over its whole next-token distribution. High when many tokens are plausible, low when one token dominates."
        },
        {
          "term": "Truncation sampling",
          "def": "sampling from a reduced set of candidate tokens, with their probabilities rescaled to add up to 1. Top-k, nucleus, typical and min-p sampling differ only in how they choose the set."
        }
      ]
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "BLEU as the beam widens, WMT'14 English to French",
      "yLabel": "BLEU (higher is better)",
      "series": [
        {
          "label": "Plain beam search",
          "key": "none",
          "baseline": true
        },
        {
          "label": "Length normalization",
          "key": "len"
        },
        {
          "label": "Squared UID regularizer",
          "key": "sq"
        }
      ],
      "data": [
        {
          "label": "k = 5",
          "values": {
            "none": 36.42,
            "len": 36.02,
            "sq": 36.92
          }
        },
        {
          "label": "k = 10",
          "values": {
            "none": 36.3,
            "len": 35.94,
            "sq": 36.42
          }
        },
        {
          "label": "k = 100",
          "values": {
            "none": 32.83,
            "len": 35.8,
            "sq": 36.13
          }
        },
        {
          "label": "k = 500",
          "values": {
            "none": 14.66,
            "len": 35.11,
            "sq": 35.96
          }
        }
      ],
      "caption": "Redrawn from Table 1 of Meister, Vieira and Cotterell, 2020.[^1] First 1,000 sentences of Newstest2014, fairseq Transformer model. Length normalization divides the log-probability by sentence length. The squared regularizer is explained in the next section."
    },
    {
      "type": "h2",
      "text": "What beam search was secretly optimizing"
    },
    {
      "type": "p",
      "text": "Meister and colleagues did not ask why exact search fails. They asked the reverse: what objective would beam search be the exact answer to?[^1] Their framework adds a penalty to the usual MAP objective and searches for the sequence that maximizes the total:"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} y^{\\star} = \\operatorname*{argmax}_{y \\in \\mathcal{Y}} \\; \\log p_\\theta(y \\mid x) \\; - \\; \\lambda \\cdot R(y) \\end{gathered}",
      "caption": "The regularized decoding objective, equation 9 of Meister et al., 2020.[^1]"
    },
    {
      "type": "p",
      "text": "Read it left to right. \\(x\\) is the input, here the source sentence. \\(y\\) is one candidate output, and \\(\\mathcal{Y}\\) is the set of every complete output the model could produce. \\(\\log p_\\theta(y \\mid x)\\) is the model's log-probability for the whole output, the sum over its tokens. \\(R(y)\\) is a regularizer, a penalty computed from the output. \\(\\lambda\\) is a number that sets how much the penalty counts. With \\(\\lambda = 0\\) this is plain MAP decoding, and the authors report that exact MAP decoding in their example returns the empty string.[^1]"
    },
    {
      "type": "p",
      "text": "The penalty that recovers greedy decoding is built from surprisals. Write \\(u_t(y_t) = -\\log p_\\theta(y_t \\mid x, y_{<t})\\) for the surprisal of the token chosen at step \\(t\\).[^1] Then:"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} R_{\\text{greedy}}(y) = \\sum_{t=1}^{|y|} \\Big( u_t(y_t) - \\min_{y' \\in \\mathcal{V}} u_t(y') \\Big)^{2} \\end{gathered}",
      "caption": "The greedy regularizer, equation 11 of Meister et al., 2020.[^1] A set version of the same penalty recovers beam search with beam size k."
    },
    {
      "type": "p",
      "text": "Term by term: \\(|y|\\) is the output length, so the sum runs over every step. \\(u_t(y_t)\\) is how surprising the chosen token was. \\(\\min_{y'} u_t(y')\\) is the surprisal of the best token available at that step, taken over the vocabulary \\(\\mathcal{V}\\). Their difference is how far the choice strayed from the locally best one, and squaring it punishes large strays hardest. The paper proves that as \\(\\lambda\\) grows without limit, the exact solution of the objective is the greedy output, and the set version gives the output of beam search.[^1] So beam search acts like exact search that strongly dislikes any step far more surprising than it had to be."
    },
    {
      "type": "p",
      "text": "The authors connect that dislike to the **uniform information density** hypothesis from psycholinguistics: where grammar allows a choice, speakers prefer the phrasing that spreads information evenly across the sentence and avoids sudden peaks of surprisal.[^1] Their example is the optional \\\"that\\\" in \\\"How big is the family (that) you cook for?\\\" Keeping it spreads the start of the relative clause over two words instead of loading it onto one.[^1] Exact MAP search has no such preference. It will accept one very surprising step, such as ending the sentence at the first token, if that raises the total score.[^1]"
    },
    {
      "type": "p",
      "text": "If this reading is right, a regularizer that asks for even surprisal directly should fix large beams. The paper tests several. The simplest to state is the squared regularizer, \\(R_{\\text{square}}(y) = \\sum_t u_t(y_t)^2\\), which pushes every surprisal toward zero and punishes the high ones hardest.[^1] It is the third bar in the chart above. With it, BLEU at a beam of 500 was 35.96 instead of 14.66, and a combination of regularizers reached 36.35.[^1] Under exact search, BLEU also fell as the per-sentence spread of surprisals rose.[^1] One detail cuts against the simple story. Variance and local-consistency penalties, which the authors call the purest encodings of the idea, performed worst of the regularizers. The authors suggest it is because they do not also penalize high surprisal.[^1]"
    },
    {
      "type": "h2",
      "text": "Sampling what is typical instead of what is probable"
    },
    {
      "type": "p",
      "text": "Two years later Meister, joined by Tiago Pimentel, Gian Wiher and Cotterell, took the information idea to open-ended generation with a sampler.[^3] Their intuition starts with a coin. If a coin lands heads 60% of the time, the single most likely sequence of 100 flips is 100 heads, yet nobody would call that a typical outcome. A typical run has about 60 heads and 40 tails.[^3] The most probable sequence and the typical sequences are different things, and the paper argues text works the same way: high-probability text carries little information, which likely makes it read as boring.[^3]"
    },
    {
      "type": "p",
      "text": "They measured this on human text. For each token in human-written references, they took its surprisal under a trained model and subtracted the model's conditional entropy at that step. Across three tasks the differences clustered tightly around zero.[^3] People, by this measure, tend to pick words whose information content is close to what the context leads a listener to expect. The paper defines a **locally typical set**: sequences in which every token satisfies"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} \\Big|\\, \\log p(y_t \\mid y_{<t}) + H(Y_t \\mid Y_{<t} = y_{<t}) \\,\\Big| < \\varepsilon \\\\[6pt] H(Y_t \\mid y_{<t}) = -\\sum_{y \\in \\mathcal{V}} p(y \\mid y_{<t}) \\log p(y \\mid y_{<t}) \\end{gathered}",
      "caption": "The local typicality condition, equation 7 of Meister, Pimentel, Wiher and Cotterell, with the entropy written out.[^3]"
    },
    {
      "type": "p",
      "text": "\\(\\log p(y_t \\mid y_{<t})\\) is the log-probability of the token at step \\(t\\), so its negative is the surprisal. \\(H\\) is the conditional entropy, the surprisal the model expects on average at that step. Adding them gives expected surprisal minus actual surprisal. \\(\\varepsilon\\) is how far apart they may be. A token passes if it is about as surprising as the model expects, neither far more nor far less.[^3]"
    },
    {
      "type": "p",
      "text": "The sampler turns that condition into a truncation rule. At each step it computes the entropy, sorts tokens by how far their surprisal is from it, and adds tokens from the closest outward until their total probability reaches a threshold \\(\\tau\\). It then samples from that set.[^3] The cost is a sort over the vocabulary, the same as nucleus sampling.[^3] The rule does not ban the most likely token. When entropy is low, only high-probability tokens have surprisal near it, so typical sampling and nucleus sampling pick the same set.[^3] When entropy is high, the top token can be too predictable to qualify."
    },
    {
      "type": "p",
      "text": "The measured gains are modest, and the paper says so. On story generation with GPT-2 large fine-tuned on WritingPrompts, typical sampling at \\(\\tau = 0.2\\) had a mean human rating of 4.15, against 4.13 for nucleus sampling at 0.95 and 4.12 for the human reference, with standard errors of about 0.02.[^3] Its repetition score (REP) was 0.30, equal to nucleus at 0.95; human text scored 0.28.[^3] Its MAUVE score, an automatic measure of distance from human text, was 0.78, the lowest of any sampler in that table.[^3] On news summarization with BART, beam search with a beam of 5 still beat typical sampling on human ratings, 4.35 to 4.32, which the authors describe as a small margin.[^3] The result they stress most is robustness: in story generation, most values of \\(\\tau\\) gave repetition on par with human text, while many values of \\(k\\) and of the nucleus threshold did not.[^3]"
    },
    {
      "type": "p",
      "text": "The current arXiv version also carries an erratum. The optimization problem as the paper first wrote it allows solutions that leave out the tokens whose surprisal is closest to the entropy, which is not what the greedy algorithm does. The authors say they are working on a new formulation.[^3]"
    },
    {
      "type": "h2",
      "text": "Contrastive search: penalize the echo"
    },
    {
      "type": "p",
      "text": "Yixuan Su and colleagues at Cambridge, Tencent AI Lab, DeepMind and the University of Hong Kong looked for the cause of repetition inside the model instead of in the objective.[^4] They measured the cosine similarity between the output-layer representations of tokens in a sentence produced by GPT-2 and found values above 0.95.[^4] Cosine similarity measures whether two vectors point the same way, with 1 meaning identical direction. When every token looks almost the same to the model, the authors argue, it can easily generate the same tokens again. They call this an anisotropic representation space.[^4] Their decoding rule makes that similarity an explicit cost:"
    },
    {
      "type": "eq",
      "tex": "\\begin{aligned} x_t = \\operatorname*{argmax}_{v \\in V^{(k)}} \\Big\\{ &(1-\\alpha)\\, p_\\theta(v \\mid x_{<t}) \\\\ &- \\alpha \\max_{1 \\le j \\le t-1} s(h_v, h_{x_j}) \\Big\\} \\end{aligned}",
      "caption": "Contrastive search, equation 5 of Su et al., 2022.[^4] The first term is what the paper calls model confidence and the second the degeneration penalty."
    },
    {
      "type": "p",
      "text": "Term by term. \\(V^{(k)}\\) is the set of the model's top-\\(k\\) candidates at step \\(t\\), with \\(k\\) typically between 3 and 10.[^4] \\(p_\\theta(v \\mid x_{<t})\\) is the model's probability for candidate \\(v\\), the confidence. \\(h_v\\) is the representation of \\(v\\), computed by running the model on the context with \\(v\\) appended, and \\(h_{x_j}\\) is the representation of an earlier token \\(x_j\\).[^4] \\(s\\) is cosine similarity, and taking the maximum over \\(j\\) finds the earlier token that \\(v\\) most resembles. \\(\\alpha\\), between 0 and 1, trades the two terms off. At \\(\\alpha = 0\\) the rule is greedy decoding.[^4] There is no random draw. Contrastive search is deterministic: it picks a likely token that does not look like anything already said."
    },
    {
      "type": "p",
      "text": "The condition is that the representations must be spread out enough for the penalty to tell candidates apart. The authors pair the decoder with SimCTG, a contrastive training loss that pushes representations of distinct tokens apart, and test on Wikitext-103 with the 117M-parameter GPT-2, a 32-token prefix and a 128-token continuation, using \\(k = 8\\) and \\(\\alpha = 0.6\\).[^4] With a model fine-tuned the ordinary way, contrastive search did badly. With SimCTG it scored best."
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "MAUVE on Wikitext-103 by training objective and decoder",
      "yLabel": "MAUVE (higher is closer to human text)",
      "series": [
        {
          "label": "Standard fine-tuning (MLE)",
          "key": "mle",
          "baseline": true
        },
        {
          "label": "SimCTG fine-tuning",
          "key": "sim"
        }
      ],
      "data": [
        {
          "label": "Greedy",
          "values": {
            "mle": 0.03,
            "sim": 0.05
          }
        },
        {
          "label": "Beam (10)",
          "values": {
            "mle": 0.03,
            "sim": 0.06
          }
        },
        {
          "label": "Nucleus (0.95)",
          "values": {
            "mle": 0.9,
            "sim": 0.92
          }
        },
        {
          "label": "Contrastive",
          "values": {
            "mle": 0.18,
            "sim": 0.94
          }
        }
      ],
      "caption": "Redrawn from Table 1 of Su et al., 2022.[^4] GPT-2 base (117M parameters). Human text scores 1.00 by construction."
    },
    {
      "type": "p",
      "text": "SimCTG with contrastive search had a diversity of 0.95, equal to human text, and a coherence of 0.610, the only score above 0.6. Coherence here is the similarity between sentence embeddings of the prefix and the continuation, and human text scored 0.644.[^4] The ordinary model with contrastive search had a diversity of 0.24.[^4] The authors' explanation is that without contrastive training the penalty values of different candidates are too similar, so the choice falls back to model confidence.[^4] In a human evaluation, a GPT-2 large version with SimCTG and contrastive search scored 3.66 for fluency against 3.71 for human text, a difference the sign test did not find significant.[^4] Being deterministic is also a limitation the authors state themselves. They suggest mixing in randomness, for example by sampling the first few tokens with nucleus sampling and then switching to contrastive search.[^4] They report latency close to beam search at small \\(k\\).[^4]"
    },
    {
      "type": "h2",
      "text": "Min-p: scale the cutoff to the top token"
    },
    {
      "type": "p",
      "text": "The newest of the three rules was published at ICLR 2025. Nguyen Nhat Minh, Andrew Baker, Clement Neo and colleagues start from one problem: raising the temperature adds variety, but at high temperatures nucleus sampling lets in low-probability tokens and the text falls apart.[^5] Their fix makes the truncation threshold relative to the model's confidence:"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} p_{\\max} = \\max_{v \\in V} P(v \\mid x_{1:t-1}) \\\\[4pt] p_{\\text{scaled}} = p_{\\text{base}} \\times p_{\\max} \\\\[4pt] V_{\\min} = \\{\\, v \\in V : P(v \\mid x_{1:t-1}) \\ge p_{\\text{scaled}} \\,\\} \\end{gathered}",
      "caption": "Min-p sampling, equations 1 and 2 of Nguyen et al., 2025.[^5] The next token is sampled from \\(V_{\\min}\\) after its probabilities are rescaled to sum to 1 (equation 3)."
    },
    {
      "type": "p",
      "text": "\\(P(v \\mid x_{1:t-1})\\) is the probability of token \\(v\\) given the text so far. \\(p_{\\max}\\) is the probability of the single most likely token, which the paper treats as the model's confidence. \\(p_{\\text{base}}\\), between 0 and 1, is the one setting a user chooses, and the paper recommends 0.05 to 0.1.[^5] \\(p_{\\text{scaled}}\\) is the actual cutoff for this step. A token stays in the pool \\(V_{\\min}\\) if its probability is at least that fraction of the top token's. In the Transformers and vLLM implementations the threshold is computed after temperature scaling.[^5] With \\(p_{\\text{base}} = 0.1\\), a top token at 0.9 sets the cutoff at 0.09, while a top token at 0.1 sets it at 0.01 and lets many tokens through."
    },
    {
      "type": "p",
      "text": "The paper's illustration uses the prompt \\\"A rainbow is an optically brilliant meteorological event resulting from refraction, reflection, and dispersion of,\\\" where \\\"light\\\" has probability 98.3% at temperature 1. At temperature 3, \\\"light\\\" drops to 34.4% and the tail swells. In the paper's table, top-p keeps at least six candidates, while min-p keeps only \\\"light\\\" and \\\"sunlight\\\" and rescales them to 80.9% and 19.1%.[^5]"
    },
    {
      "type": "p",
      "text": "The benchmark results depend strongly on temperature. On GPQA Main, a set of graduate-level science questions, with Mistral 7B and 5-shot prompts, min-p and top-p at 0.9 were close at temperature 0.7 (29.18% and 29.02%). At temperature 3, top-p fell to 0.46% and min-p held 24.55%.[^5] On GSM8K math with chain of thought, top-p scored higher at temperature 0.7 (36.09% against 35.18%), and at temperature 3 temperature-only, top-k, top-p and min-p all scored 0.00%.[^5] The paper states that from temperature 0 to 0.5 the two perform comparably, with differences inside error margins.[^5] The largest gap came from the 123B Mistral Large model:"
    },
    {
      "type": "chart",
      "kind": "line",
      "title": "GPQA Main accuracy vs temperature, Mistral Large (123B)",
      "xLabel": "Temperature →",
      "yLabel": "Accuracy (%)",
      "series": [
        {
          "label": "Temperature only",
          "key": "t",
          "dashed": true
        },
        {
          "label": "Top-p 0.90",
          "key": "p"
        },
        {
          "label": "Min-p",
          "key": "m"
        }
      ],
      "data": [
        {
          "x": 0.5,
          "values": {
            "t": 37.72,
            "p": 40.18,
            "m": 38.17
          }
        },
        {
          "x": 1.0,
          "values": {
            "t": 31.25,
            "p": 34.38,
            "m": 34.6
          }
        },
        {
          "x": 1.5,
          "values": {
            "t": 29.02,
            "p": 29.69,
            "m": 31.03
          }
        },
        {
          "x": 2.0,
          "values": {
            "t": 20.09,
            "p": 21.21,
            "m": 27.46
          }
        },
        {
          "x": 3.0,
          "values": {
            "t": 2.9,
            "p": 2.01,
            "m": 22.77
          }
        },
        {
          "x": 4.0,
          "values": {
            "t": 0.89,
            "p": 0.89,
            "m": 13.84
          }
        }
      ],
      "caption": "Redrawn from Table 3a of Nguyen et al., 2025.[^5] The table reports min-p at a base threshold of 0.05 or 0.1. Top-p 0.95 is omitted; it tracked top-p 0.90 closely. Every method is best at the lowest temperature tested, where top-p leads."
    },
    {
      "type": "p",
      "text": "Min-p's advantage is largest exactly where every method is worse than it was at low temperature. On AlpacaEval Creative Writing, judged by GPT-4 Turbo, min-p had a 52.01% win rate at temperature 1 against 50.43% for top-p, and 56.54% at temperature 1.5.[^5] A human study in the paper reported that participants preferred min-p for quality and diversity.[^5]"
    },
    {
      "type": "h2",
      "text": "The dispute over the min-p evidence"
    },
    {
      "type": "p",
      "text": "Rylan Schaeffer, Joshua Kazdan and Yegor Denisov-Blanch at Stanford re-examined each line of that evidence and reached the opposite conclusion.[^6] In the human study, they report, scores for a second baseline, plain temperature sampling, made up a third of the collected data and were left out of the original analysis. The significance test pooled all conditions into one comparison.[^6] When they ran 12 separate one-sided tests on the published data, min-p beat a baseline in 5 at the 0.05 level before correction and in 1 after a Bonferroni correction for multiple comparisons.[^6]"
    },
    {
      "type": "p",
      "text": "Their benchmark test was a sweep of about 6,000 A100 GPU hours on GSM8K: nine models in base and instruction-tuned versions, four samplers, 31 temperatures from 0 to 3, six settings per sampler and three random seeds.[^6] Once hyperparameter budgets were equal, min-p was largely indistinguishable from the other samplers. A rerun with the standard prompt format gave nearly identical results, with min-p ahead for two models.[^6] They also say the LLM-judge results appear inconsistently reported, with the higher of two scores given for min-p and the lower of two for top-p. And they say the earlier adoption statistics were unsubstantiated and were removed from the camera-ready version.[^6] The min-p paper's current version does say its earlier GitHub counts came from searches with many false positives, and it adds a second human evaluation to address limits of the first.[^5]"
    },
    {
      "type": "p",
      "text": "That second study did not settle the question for the critics. It changed the rubric, the hyperparameters and the implementation, which now applied temperature before truncation instead of after.[^6] Schaeffer and colleagues read its data as showing min-p ahead only in conditions, such as temperature 2 in the high-diversity setting, where all samplers scored lower on both quality and diversity than they did at temperature 1. Their conclusion: for anyone seeking higher quality or diversity, min-p \\\"offers no apparent advantage over basic or top-p sampling.\\\"[^6] My reading is that the argument is no longer about the paradox the beam search papers found. None of the papers here defends the most probable sequence as the target. The fight is about measurement: at which temperatures a sampler should be compared, and how many settings it may be tuned across before its win stops counting."
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        {
          "title": "Meister, Vieira, and Cotterell, If Beam Search Is the Answer, What Was the Question?, EMNLP 2020",
          "url": "https://arxiv.org/abs/2010.02650"
        },
        {
          "title": "Stahlberg and Byrne, On NMT Search Errors and Model Errors: Cat Got Your Tongue?, EMNLP 2019",
          "url": "https://arxiv.org/abs/1908.10090"
        },
        {
          "title": "Meister, Pimentel, Wiher, and Cotterell, Locally Typical Sampling, Transactions of the ACL (arXiv v6, 2025, with erratum)",
          "url": "https://arxiv.org/abs/2202.00666"
        },
        {
          "title": "Su, Lan, Wang, Yogatama, Kong, and Collier, A Contrastive Framework for Neural Text Generation, NeurIPS 2022",
          "url": "https://arxiv.org/abs/2202.06417"
        },
        {
          "title": "Nguyen, Baker, Neo, Roush, Kirsch, and Shwartz-Ziv, Turning Up the Heat: Min-p Sampling for Creative and Coherent LLM Outputs, ICLR 2025 (arXiv v8)",
          "url": "https://arxiv.org/abs/2407.01082"
        },
        {
          "title": "Schaeffer, Kazdan, and Denisov-Blanch, Min-p, Max Exaggeration: A Critical Analysis of Min-p Sampling in Language Models, 2025",
          "url": "https://arxiv.org/abs/2506.13681"
        },
        {
          "title": "Holtzman, Buys, Du, Forbes, and Choi, The Curious Case of Neural Text Degeneration, ICLR 2020",
          "url": "https://arxiv.org/abs/1904.09751"
        }
      ]
    }
  ]
};

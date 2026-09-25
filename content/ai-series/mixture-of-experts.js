// Every factual claim below is taken from the numbered sources at the end.
// The Mixtral routing figure is reproduced under CC BY 4.0 (arXiv 2401.04088).
// The two charts are redrawn from table values in Jacobs et al. 1991 and
// Shazeer et al. 2017, whose arXiv/journal licenses do not allow reuse.
export const POST = {
  id: 'mixture-of-experts',
  title: 'What Mixture of Experts Had to Fix Before Mixtral Worked',
  excerpt: 'In 2020 Google trained a 600 billion parameter MoE model in four days, then left its trillion parameter sibling out of the paper because it kept hitting numerical trouble. Read in order, the MoE papers are a chain of problems and fixes, ending with a finding about what experts actually learn.',
  category: 'AI',
  tags: ['LLMs', 'Mixture of Experts', 'Architecture'],
  body: [
    {
      type: 'p',
      text: "In June 2020 a Google team reported training a 600 billion parameter translation model in four days on 2,048 TPU v3 cores. It translated 100 languages into English with far better quality than the prior art, according to the paper.[^1] The model used Mixture of Experts (MoE) layers, and the paper also mentions a bigger attempt: a 60-layer version with 1 trillion weights and activations in the lower-precision bfloat16 format. It was \"trainable by careful and manual diagnostics,\" they wrote, but it ran into several numerical stability problems, so they left its results out of the paper for the sake of reproducibility.[^1]",
    },
    {
      type: 'p',
      text: "That paragraph sums up the technique. MoE makes huge parameter counts cheap to reach, and each generation of the design hit a different wall on the way. Read in order, the papers form a chain: each names what broke in the previous design, and its fix tends to expose the next thing to break.",
    },
    {
      type: 'h2',
      text: '1991: one network kept getting in its own way',
    },
    {
      type: 'p',
      text: "Robert Jacobs, Michael Jordan, Steven Nowlan and Geoffrey Hinton started from a problem with backpropagation: when one network learns different subtasks on different occasions, each subtask disturbs the weights the others rely on, which slows learning and hurts generalization.[^2] Their answer was a system of several **expert** networks plus a **gating network**. An expert is just an ordinary small network. The gating network sees the same input and outputs a set of proportions that sum to one, saying how much each expert should be trusted on this particular case.[^2]",
    },
    {
      type: 'p',
      text: "The trick was in the error function. Earlier systems scored a blend of the experts' outputs, so each expert learned to patch whatever error the others left, and every case ended up spread across many experts. Jacobs and colleagues instead asked each expert to produce the whole answer alone, weighting its error by the gate. An expert that beat the weighted average on a case got more responsibility for it; one that did worse got less.[^2]",
    },
    {
      type: 'p',
      text: "They tested it on vowels: the first two formant frequencies of four vowel sounds from 75 men, women and children, training on 50 speakers and testing on 25. Mixtures of 4 or 8 very simple experts were compared with backpropagation networks of about the same parameter count. All reached 88% training and 90% test accuracy, but the mixtures hit the error target in about half as many passes over the data.[^2]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Epochs to reach the error target, vowel task',
      yLabel: 'Average epochs',
      series: [{ label: 'Epochs', key: 'e' }],
      data: [
        { label: '4 experts', values: { e: 1124 } },
        { label: '8 experts', values: { e: 1083 } },
        { label: 'Backprop, 6 hidden', values: { e: 2209 } },
        { label: 'Backprop, 12 hidden', values: { e: 2435 } },
      ],
      caption: 'Redrawn from Table 1 of Jacobs et al., 1991.[^2] Averages over 25 simulations per model. Accuracy was identical across all four, so speed is the only difference.',
    },
    {
      type: 'p',
      text: "One detail predicts the next thirty years. The mixture in the paper's Figure 2 had four experts, but one contributed nothing: its mixing proportion was effectively zero on every case, and the caption notes the system \"tends to use as few experts as it can.\"[^2] At scale, that tendency became the first big problem.",
    },
    {
      type: 'h2',
      text: '2017: the gate kept choosing the same few experts',
    },
    {
      type: 'p',
      text: "In Jacobs' design the mixture was the whole model. Noam Shazeer and colleagues at Google Brain turned it into a layer. Their Sparsely-Gated Mixture-of-Experts layer sits between two LSTM layers and runs once at every position in the text, so each word can go to a different set of experts.[^3] The aim was what the field called conditional computation: switching on only part of the network for each example, so that capacity can grow without compute growing in step.[^3] For a token vector \\(x\\) and \\(n\\) experts, the layer computes:",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} y = \\sum_{i=1}^{n} G(x)_i \\, E_i(x) \\\\[4pt] G(x) = \\mathrm{Softmax}\\big(\\mathrm{KeepTopK}(H(x), k)\\big) \\\\[4pt] H(x)_i = (x W_g)_i + \\epsilon_i \\cdot \\mathrm{Softplus}\\big((x W_{\\text{noise}})_i\\big) \\end{gathered}',
      caption: 'The noisy top-k gated MoE layer, equations 1, 3 and 4 of Shazeer et al., 2017.[^3] Each \\(\\epsilon_i\\) is a fresh sample from a standard normal distribution.',
    },
    {
      type: 'p',
      text: "\\(E_i(x)\\) is the output of expert \\(i\\), a small feed-forward network. The gating network, which later papers call the **router**, is little more than the weight matrix \\(W_g\\): it gives every expert a score. KeepTopK keeps the \\(k\\) highest scores and sets the rest to minus infinity, so after the softmax those experts get a weight of exactly zero. That is **top-k routing**. An expert with zero weight never has to be run, which is where the savings come from. The noise term, with its own trainable matrix, is there to help spread the load.[^3]",
    },
    {
      type: 'p',
      text: "This splits a model's size into two numbers. **Total parameters** are every weight stored across all experts. **Active parameters** are the ones a single token passes through, and they grow with \\(k\\), not with the number of experts.[^6] Shazeer's team pushed that gap hard. On a 100 billion word news corpus, at a fixed compute of about 8 million operations per timestep, test perplexity kept improving up to 65,536 experts (68 billion parameters), where it was 39% lower than a compute-matched baseline. It got worse at 131,072 experts, possibly from too much sparsity.[^3]",
    },
    {
      type: 'p',
      text: "Getting there meant fixing a failure the paper states plainly. The gating network \"tends to converge to a state where it always produces large weights for the same few experts,\" and the imbalance feeds itself, because the favored experts train faster and so get picked even more.[^3] It is the 1991 idle expert again, this time with thousands of experts.",
    },
    {
      type: 'p',
      text: "Their fix was extra loss terms. An expert's importance is the sum of its gate values over a batch, and the first loss penalizes the squared coefficient of variation of those importances, which is zero only when all experts carry equal weight. Equal weight does not guarantee equal numbers of examples, so a second loss targets load directly.[^3] That is what **load balancing** means here: spreading tokens evenly enough that no expert, or the device holding it, is swamped while others sit idle. With neither loss, the busiest expert got 17.8 times the average load and test perplexity was 39.8. With either loss on, the ratio fell to between 1.07 and 1.47 and perplexity to 35.6 or 35.7.[^3]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Busiest expert\'s load, as a multiple of the average',
      yLabel: 'Max load / mean load',
      series: [{ label: 'Max / mean load', key: 'r' }],
      data: [
        { label: 'No balancing loss', values: { r: 17.8 } },
        { label: 'Importance loss only', values: { r: 1.47 } },
        { label: 'Load loss only', values: { r: 1.15 } },
        { label: 'Both, weight 0.1', values: { r: 1.14 } },
        { label: 'Both, weight 0.01', values: { r: 1.37 } },
        { label: 'Both, weight 1.0', values: { r: 1.07 } },
      ],
      caption: 'Redrawn from Table 6 of Shazeer et al., 2017,[^3] for their 256-expert language model. Importance-only and load-only runs used a weight of 0.2. A value of 1.0 would be perfect balance.',
    },
    {
      type: 'p',
      text: "The experts did specialize, \"by syntax and/or semantics\" in the paper's words. In the translation model, one expert handled \"a\" when it introduced the object of a verb phrase about importance or leadership: \"plays a core,\" \"plays a critical,\" \"assume a leadership.\"[^3] That is a phrase pattern, not a subject area.",
    },
    {
      type: 'h2',
      text: '2020: too many tokens arrived at the same expert',
    },
    {
      type: 'p',
      text: "GShard, the paper from the opening, moved MoE into the Transformer, replacing every other feed-forward layer with an MoE layer and sending each token to at most two experts.[^1] At that scale an unbalanced gate leaves a few busy experts with very large input buffers while others go undertrained.[^1] So GShard introduced **expert capacity**: a cap on how many tokens one expert may process per batch, set to roughly the number of tokens divided by the number of experts. A token whose chosen experts are both full becomes an overflowed token. It skips the layer, and its vector is handed to the next layer unchanged through the residual connection.[^1]",
    },
    {
      type: 'p',
      text: "GShard kept a Shazeer-style balancing loss and added one more trick: the second-choice expert was used only with probability proportional to its gate weight, since a small second weight barely changes the output but still uses up capacity.[^1]",
    },
    {
      type: 'p',
      text: "It paid off. The 600 billion parameter model cost about 22 TPU v3 core-years to train. The team's best dense model, with 2.3 billion parameters, took 235.5 core-years over six weeks on the same 2,048 cores and scored lower.[^1] What it left unsolved was the opening's problem: the reported models used float32 weights and activations \"in order to ensure training stability,\" and the trillion-weight run with bfloat16 activations went unreported.[^1]",
    },
    {
      type: 'h2',
      text: '2021: one expert per token, and runs that diverged',
    },
    {
      type: 'p',
      text: "The Switch Transformer paper, by William Fedus, Barret Zoph and Noam Shazeer, overturned a 2017 assumption. Shazeer's group had conjectured that a token needed at least two experts for the router to get a useful gradient. Switch sent each token to exactly one expert and found that this kept model quality while cutting router computation and communication.[^4] It also wrote the capacity limit as a formula:",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\text{expert capacity} = \\frac{\\text{tokens per batch}}{\\text{number of experts}} \\\\[2pt] \\times\\ \\text{capacity factor} \\end{gathered}',
      caption: 'Equation 3 of Fedus et al.[^4]',
    },
    {
      type: 'p',
      text: "A **capacity factor** of 1.0 leaves room for a perfectly even split and nothing more. Values above 1.0 add a buffer for uneven routing, paid for in wasted compute and memory on empty slots. Tokens beyond capacity are dropped from that layer and carried forward by the residual connection. The authors report drop rates typically under 1%, and their Switch models did best at the low factors of 1.0 and 1.25.[^4] Shazeer's two balancing losses became one:",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\text{loss} = \\alpha \\cdot N \\cdot \\sum_{i=1}^{N} f_i \\cdot P_i \\\\[4pt] f_i = \\frac{1}{T} \\sum_{x \\in \\mathcal{B}} \\mathbb{1}\\{\\arg\\max p(x) = i\\} \\\\[4pt] P_i = \\frac{1}{T} \\sum_{x \\in \\mathcal{B}} p_i(x) \\end{gathered}',
      caption: 'The Switch load-balancing loss, equations 4 to 6 of Fedus et al.[^4]',
    },
    {
      type: 'p',
      text: "For a batch \\(\\mathcal{B}\\) of \\(T\\) tokens and \\(N\\) experts, \\(f_i\\) is the fraction of tokens actually sent to expert \\(i\\), and \\(P_i\\) is the average router probability given to expert \\(i\\). Only \\(P_i\\) has a gradient, which is enough to steer the router. The sum is smallest when both are uniform at \\(1/N\\). The authors swept \\(\\alpha\\) from \\(10^{-1}\\) to \\(10^{-5}\\) and settled on \\(10^{-2}\\), which balanced load quickly without disturbing the main training loss.[^4]",
    },
    {
      type: 'p',
      text: "The other half of the paper is about instability. Hard routing decisions can destabilize training, the authors write, and bfloat16 can make problems in the router's softmax worse.[^4] A 32-expert Switch-Base trained in bfloat16 diverged, ending at a quality score of -3.780 where float32 reached -1.718 (negative log perplexity, so closer to zero is better). Computing only the router in float32 and casting its outputs back to bfloat16 gave -1.716 at the full bfloat16 speed of 1,390 examples per second.[^4] They called this **selective precision**, and they also shrank the default weight initialization by a factor of 10 to steady early training.[^4]",
    },
    {
      type: 'p',
      text: "With those fixes they trained Switch-C, with 1.6 trillion parameters and 2,048 experts, and saw no training instability at all. Switch-XXL, with 395 billion parameters but nearly 10 times the FLOPs per sequence, was \"sometimes unstable,\" so they did not pre-train it for the full million steps.[^4] The model with the most parameters trained cleanly. The one doing the most computation per token did not.",
    },
    {
      type: 'h2',
      text: '2022: router scores grew until rounding broke them',
    },
    {
      type: 'p',
      text: "ST-MoE, from Zoph, Fedus and colleagues, found selective precision was not enough at their largest scales.[^5] They explain the router's fragility with an example. Take ten router logits of 128 and one of 128.5. The top expert should get about 0.142 of the probability. bfloat16 can round 128.5 down to 128, which makes all eleven logits equal and drops that probability to about 0.091, a 36% change.[^5] Bigger numbers suffer bigger rounding errors, so the fix is to keep the logits small:",
    },
    {
      type: 'eq',
      tex: 'L_z(x) = \\frac{1}{B} \\sum_{i=1}^{B} \\Big( \\log \\sum_{j=1}^{N} e^{x_j^{(i)}} \\Big)^{2}',
      caption: 'The router z-loss, equation 5 of Zoph et al., 2022.[^5]',
    },
    {
      type: 'p',
      text: "\\(B\\) is the number of tokens, \\(N\\) the number of experts, and \\(x\\) the router logits. The squared quantity is the log of the softmax's denominator, so the penalty grows as logits grow. This **router z-loss** is added to training with a weight of 0.001, next to the balancing loss.[^5] A baseline trained stably in 4 of 6 runs. Tighter update clipping stabilized 3 of 3 but wrecked quality (-4.206 against -1.755). The z-loss stabilized 3 of 3 and scored slightly better than baseline, at -1.741.[^5] It let them train ST-MoE-32B: 269 billion parameters at a compute cost comparable to a 32 billion parameter dense model.[^5]",
    },
    {
      type: 'p',
      text: "They also traced where tokens went. Some encoder experts specialized in the sentinel tokens that mark blanks to fill in, others in punctuation, verbs, proper names or numbers. Decoder experts showed no meaningful specialization. In a multilingual model the experts still specialized, but not by language; one expert took both the English \"for\" and the French \"pour.\"[^5]",
    },
    {
      type: 'h2',
      text: "January 2024: Mixtral's experts did not sort by topic",
    },
    {
      type: 'p',
      text: "Mixtral 8x7B comes from Mistral AI. Each of its 32 layers holds 8 experts, each a SwiGLU feed-forward block, and a router picks 2 of them per token:[^6]",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} y = \\sum_{i=0}^{n-1} g_i(x) \\cdot \\mathrm{SwiGLU}_i(x) \\\\[4pt] g(x) = \\mathrm{Softmax}\\big(\\mathrm{Top2}(x \\cdot W_g)\\big) \\end{gathered}',
      caption: 'The Mixtral MoE layer, from section 2.1 of Jiang et al., 2024,[^6] with the gate written on its own line as \\(g(x)\\). It is Shazeer\'s 2017 gate without the noise term.',
    },
    {
      type: 'p',
      text: "The authors describe it as close to GShard, except that every feed-forward block is an MoE layer instead of every other one, and the second expert comes from plain top-2 instead of GShard's more elaborate rule.[^6] Each token can reach 47 billion parameters but uses 13 billion active ones. The abstract says Mixtral outperforms or matches Llama 2 70B across all evaluated benchmarks, with 70.6% on MMLU against 69.9%, though Llama 2 70B stays ahead on a few, such as HellaSwag (85.4% against 84.4%).[^6]",
    },
    {
      type: 'p',
      text: "Then they checked whether the experts had become domain experts, recording which experts the router chose on parts of The Pile (arXiv papers, GitHub code, PubMed abstracts, philosophy papers and more) at the first, middle and last layers.[^6]",
    },
    {
      type: 'image',
      src: '/blog-images/mixture-of-experts/mixtral-expert-selection-by-domain.webp',
      alt: 'Three grouped bar charts, one each for layers 0, 15 and 31 of Mixtral. For each of 8 experts, eight colored bars show the share of tokens from eight Pile domains routed to that expert. Most bars sit near the dashed 1/8 line and look alike across domains; DM Mathematics bars stand out most at layers 0 and 31.',
      width: 1640,
      height: 1140,
      caption: 'Share of tokens sent to each of Mixtral\'s 8 experts, by data domain, at layers 0, 15 and 31. The dashed line is 1/8, what uniform routing would give. Figure 7 from Jiang et al., 2024,[^6] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: "The authors' own word for the result is \"surprisingly\": they found no obvious pattern of expert assignment by topic. At all layers the distribution looked very similar for arXiv papers written in LaTeX, biology abstracts from PubMed, and philosophy papers. The one exception was DM Mathematics, a synthetic dataset, which drew a slightly different mix of experts, mostly at the first and last layers.[^6]",
    },
    {
      type: 'p',
      text: "What the router did track was syntax. \"self\" in Python and \"Question\" in English often went to the same expert, indentation in code always did, and consecutive tokens often shared an expert. At layer 15, a token and the next one had the same first-choice expert 23.6% to 28.4% of the time depending on the dataset, against 12.5% for random routing.[^6] That fits Shazeer's \"plays a\" expert and ST-MoE's punctuation experts: in all three papers, the specialization the authors could point to was tied to token type, grammar or phrasing rather than subject area. It also brings back the oldest problem, since the authors note this locality can overload particular experts when they are spread across GPUs.[^6]",
    },
    {
      type: 'h2',
      text: 'Three days later: DeepSeek said the experts were too coarse',
    },
    {
      type: 'p',
      text: "DeepSeekMoE was posted to arXiv three days after Mixtral and argues that experts in designs like GShard do not specialize well for two reasons. With only 8 or 16 experts, each one receives tokens needing very different knowledge, which the authors call knowledge hybridity. And experts that receive different tokens may each end up learning the same common knowledge, which they call knowledge redundancy.[^7]",
    },
    {
      type: 'p',
      text: "The first fix is fine-grained expert segmentation: split each expert into smaller ones and activate proportionally more, so compute stays flat while the number of possible expert combinations explodes. Top-2 of 16 experts gives 120 combinations; 8 of 64 quarter-size experts gives 4,426,165,368.[^7] The second fix is shared experts, which every token always passes through, meant to hold common knowledge so routed experts need not each learn it.[^7]",
    },
    {
      type: 'p',
      text: "DeepSeekMoE 16B uses 2 shared experts plus 6 of 64 routed experts per MoE layer, each a quarter the size of a standard feed-forward block: about 16.4 billion total and 2.8 billion active parameters. It performed comparably to DeepSeek 7B, a dense model trained on the same 2 trillion tokens, with about 40% of the computation.[^7] In their 2 billion parameter model, switching off the shared expert and activating one extra routed expert instead, at equal compute, raised the loss on The Pile from 1.808 to 2.414.[^7]",
    },
    {
      type: 'h2',
      text: 'The cost none of these papers removed',
    },
    {
      type: 'p',
      text: "Jacobs' idle expert became Shazeer's runaway gate, then GShard's overflowing buffers. Switch simplified routing and got bfloat16 working with selective precision, ST-MoE traced the remaining instability to large router logits, and Mixtral and DeepSeek turned to what experts actually learn. Every fix dealt with routing, balance or numerical stability. None changed what the model has to keep in memory. Mixtral computes like a 13 billion parameter model and is stored like a 47 billion one, and its authors note that routing overhead makes MoE a better fit for batched workloads.[^6]",
    },
    {
      type: 'callout',
      title: 'Reading an MoE model card',
      text: "Look for four numbers: total parameters (your memory bill), active parameters (your compute per token), experts per layer and \\(k\\), and whether any experts are shared. Then look for how the model keeps load balanced. Every paper here from 2017 on runs into it; DeepSeekMoE uses two balance losses, one across experts and one across devices.[^3,4,7]",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Lepikhin et al., GShard: Scaling Giant Models with Conditional Computation and Automatic Sharding, 2020', url: 'https://arxiv.org/abs/2006.16668' },
        { title: 'Jacobs, Jordan, Nowlan, and Hinton, Adaptive Mixtures of Local Experts, Neural Computation, 1991', url: 'https://www.cs.toronto.edu/~hinton/absps/jjnh91.pdf' },
        { title: 'Shazeer et al., Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer, 2017', url: 'https://arxiv.org/abs/1701.06538' },
        { title: 'Fedus, Zoph, and Shazeer, Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity, 2021', url: 'https://arxiv.org/abs/2101.03961' },
        { title: 'Zoph et al., ST-MoE: Designing Stable and Transferable Sparse Expert Models, 2022', url: 'https://arxiv.org/abs/2202.08906' },
        { title: 'Jiang et al., Mixtral of Experts, 2024', url: 'https://arxiv.org/abs/2401.04088' },
        { title: 'Dai et al., DeepSeekMoE: Towards Ultimate Expert Specialization in Mixture-of-Experts Language Models, 2024', url: 'https://arxiv.org/abs/2401.06066' },
      ],
    },
  ],
};

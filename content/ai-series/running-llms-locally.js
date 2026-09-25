// Every factual claim below is taken from the numbered sources at the end.
// Figures reproduced from LLM.int8() and SmoothQuant are CC BY 4.0. The memory
// chart is plain arithmetic; the accuracy chart is computed from AWQ Table 4
// (AWQ is under the arXiv non-exclusive license, so no AWQ figure is reproduced).
export const POST = {
  id: 'running-llms-locally',
  title: 'Running an LLM Locally Is a Memory Problem: The Arithmetic of 4-Bit Quantization',
  excerpt: 'A 7B model needs 14 GB at 16 bits and 3.5 GB at 4 bits. The hard part is a handful of huge activation values that LLM.int8() found appearing around 6.7B parameters. Here is the byte math, and how five papers got around the outliers.',
  category: 'AI',
  tags: ['LLMs', 'Local', 'Quantization'],
  body: [
    {
      type: 'p',
      text: 'In 2022 Tim Dettmers and colleagues tried to store large language models in 8 bits instead of 16, and found that it stopped working at a specific size. Up to about 2.7 billion parameters, a careful 8-bit scheme kept the model\'s accuracy. Once models reached about 6.7 billion parameters, standard 8-bit methods failed.[^1] The cause was a small set of unusually large numbers inside the model. At the 6.7B scale they counted about 150,000 of these outliers in a single 2,048-token sequence, and yet they sat in only 6 of the model\'s feature dimensions.[^1] When the authors set those few dimensions to zero, validation perplexity got 600 to 1000% worse. Zeroing the same number of random dimensions made it about 0.1% worse.[^1]',
    },
    {
      type: 'image',
      src: '/blog-images/running-llms-locally/llm-int8-outlier-emergence.webp',
      alt: 'Two scatter plots with fitted curves. Left: percentage of layers and tokens affected by outlier features against parameters in billions, jumping sharply near 6.7B to 100% of layers and about 75% of tokens. Right: the same percentages against C4 perplexity, rising smoothly as perplexity falls.',
      width: 1000,
      height: 500,
      caption: 'Measured by size (a), the outliers look like a sudden jump near 6.7B parameters. Measured by perplexity (b), they grow smoothly as the model gets better. Figure 3 from Dettmers et al., 2022,[^1] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: 'That finding matters to anyone who wants to run a model on their own machine, because on a laptop the limiting resource is memory, and quantization is how a model is made to fit. This post starts from the byte count, shows why the obvious way of shrinking it breaks, and then walks through how five papers each got around the problem in a different way.',
    },
    {
      type: 'h2',
      text: 'Fourteen gigabytes before the first token',
    },
    {
      type: 'p',
      text: 'A model is mostly a large collection of learned numbers called **weights** (or parameters). A "7B" model has about 7 billion of them. Each weight is stored with some number of bits, called its **bit width**. The standard format for inference is 16-bit floating point, which takes 2 bytes per weight. So the memory for the weights alone is just the parameter count times the bytes per weight:',
    },
    {
      type: 'eq',
      tex: '\\text{memory} = N \\times \\frac{b}{8}\\ \\text{bytes}',
      caption: '\\(N\\) is the number of parameters and \\(b\\) is the bit width. Dividing by 8 converts bits to bytes.',
    },
    {
      type: 'p',
      text: 'Plug in a round 7 billion parameters and three common bit widths:',
    },
    {
      type: 'eq',
      tex: '\\begin{aligned} b=16:\\;\\; & 7{\\times}10^9 \\times 2 = 14\\ \\text{GB} \\\\ b=8:\\;\\; & 7{\\times}10^9 \\times 1 = 7\\ \\text{GB} \\\\ b=4:\\;\\; & 7{\\times}10^9 \\times 0.5 = 3.5\\ \\text{GB} \\end{aligned}',
      caption: 'Weight memory for a 7B model at 16, 8, and 4 bits (1 GB = 10\u2079 bytes).',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Weight memory for a 7B model by bit width',
      yLabel: 'Gigabytes',
      series: [{ label: 'GB', key: 'gb' }],
      data: [
        { label: '16-bit', values: { gb: 14 } },
        { label: '8-bit', values: { gb: 7 } },
        { label: '4-bit', values: { gb: 3.5 } },
        { label: '3-bit', values: { gb: 2.63 } },
      ],
      caption: 'Arithmetic, not measured data: 7 \u00d7 10\u2079 parameters times bits per weight, divided by 8. Real files are a little larger because of scaling constants, covered below.',
    },
    {
      type: 'p',
      text: 'The papers make the same point at their own scales. GPT-3\'s 175 billion parameters take 326 GB in 16-bit format (counting a GB as 1024\u00b3 bytes), which is more than any single GPU holds.[^3] The AWQ authors ran a 13B model on a laptop GPU with 8 GB of memory at 33 tokens per second after 4-bit quantization, and note that the 16-bit version could not even fit a 7B model on that card.[^4] The 14 GB line in the chart explains why.',
    },
    {
      type: 'p',
      text: 'Weights are not the whole bill. While a model generates text it also keeps a cache of past keys and values. For the 175B OPT model, the GPTQ authors estimate that cache at about 9 GB for 2,048 tokens, on top of about 63 GB for the 3-bit weights.[^3] Still, weights are the largest single item, and they are the part quantization shrinks.',
    },
    {
      type: 'h2',
      text: 'Rounding to 256 levels, and the value that ruins it',
    },
    {
      type: 'p',
      text: '**Quantization** means storing each number on a coarse grid of allowed values instead of as a full-precision float. An 8-bit integer has 256 possible values, and a 4-bit integer has only 16. The simplest scheme, which LLM.int8() calls absmax quantization, finds the largest absolute value in a tensor, scales everything so that value lands on 127, and rounds to the nearest integer:[^1]',
    },
    {
      type: 'eq',
      tex: 'X_{\\text{int8}} = \\operatorname{round}\\!\\left( \\frac{127}{\\max_{ij} |X_{ij}|} \\cdot X \\right)',
      caption: 'Absmax quantization to 8 bits, as defined in Dettmers et al., 2022, Section 2.1.[^1]',
    },
    {
      type: 'p',
      text: 'The weakness is that one number, the maximum, sets the step size for everyone. Here is a made-up row to show it. Take the values 0.1, \u22120.2, 0.15, and 60. The scale is 127 / 60, about 2.1, so 0.1 becomes 0.21, which rounds to 0. So do the other two small values. Only the 60 survives. Remove the 60 and the scale becomes 127 / 0.2 = 635, and all three small values keep distinct integers. LLM.int8() describes exactly this failure in real models: once the outliers appear, "most quantization bins are empty and small quantization values are quantized to zero, essentially extinguishing information."[^1]',
    },
    {
      type: 'p',
      text: 'Two kinds of numbers flow through a model, and they behave differently. **Weights** are fixed after training, so you can study them ahead of time. **Activations** are the intermediate values computed from your input as it passes through each layer, so they change with every prompt. The outliers Dettmers found are in the activations: particular hidden dimensions that carry magnitudes up to 20 times larger than the rest.[^1] The SmoothQuant paper, from MIT and NVIDIA, puts it directly: weights are "quite uniform and flat," while activation outliers are about 100 times larger than most activation values, which, with one scale for the whole tensor, leaves ordinary channels with only 2 or 3 effective quantization levels.[^2] It also found the outliers stay in the same channels from token to token.[^2]',
    },
    {
      type: 'p',
      text: 'The usual way to measure the damage is **perplexity**. The model reads held-out text, you take the log probability it gave to each correct next token, average them, and exponentiate.[^3] Lower is better. A perplexity of 10 roughly means the model was as unsure as if it were choosing among 10 equally likely tokens. The LLM.int8() paper shows how fast naive rounding degrades it. On C4 text, a 13B model scores 12.45 in 32-bit floats and 19.08 with plain 8-bit absmax. That is worse than the 8-bit 6.7B model at 14.59.[^1]',
    },
    {
      type: 'p',
      text: 'Every method below has to deal with that one problem. Where they differ is in what they choose to protect and when they do the work.',
    },
    {
      type: 'h2',
      text: 'LLM.int8(): give the outlier columns their own lane',
    },
    {
      type: 'p',
      text: 'The first fix is the bluntest. LLM.int8() splits each matrix multiplication in two. Any hidden dimension containing a value with magnitude of at least 6.0 is pulled out and multiplied in 16-bit. Everything else, more than 99.9% of the values, is multiplied in 8-bit.[^1] It also gives each row of the input and each column of the weights its own scaling constant, instead of one per tensor.[^1] That alone is not enough, because an outlier dimension shows up in almost every row, which is why the 16-bit split is needed.[^1]',
    },
    {
      type: 'p',
      text: 'This works because the outliers are so concentrated. For models up to 13B parameters the paper found at most 7 outlier dimensions, so keeping them in 16-bit costs only about 0.1% extra memory.[^1] With this split, perplexity for the 13B model returns to 12.45, the same as full precision, and a 175B model runs without measured degradation.[^1] The cost is that it stays at 8 bits. It saves about half the memory, a 1.96\u00d7 reduction for BLOOM-176B, which by the arithmetic above puts a 7B model at roughly 7 GB.[^1]',
    },
    {
      type: 'h2',
      text: 'SmoothQuant: hand the outliers to the weights',
    },
    {
      type: 'p',
      text: 'SmoothQuant wanted both weights and activations in 8-bit integers (called W8A8), so that the hardware\'s fast integer matrix units could do all of the work. Its trick depends on one piece of algebra. You can divide an activation channel by some factor and multiply the matching row of weights by the same factor, and the layer\'s output does not change:[^2]',
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} Y = \\big(X \\operatorname{diag}(s)^{-1}\\big)\\big(\\operatorname{diag}(s)\\,W\\big) \\\\[4pt] s_j = \\frac{\\max |X_j|^{\\alpha}}{\\max |W_j|^{1-\\alpha}} \\end{gathered}',
      caption: 'The smoothing transform and the per-channel factor \\(s_j\\) (Xiao et al., equations 3 and 4).[^2]',
    },
    {
      type: 'p',
      text: 'Each \\(s_j\\) is computed once from a small calibration sample, and the division can usually be folded into the previous layer\'s parameters offline, so it adds no extra kernel call.[^2] The exponent \\(\\alpha\\) controls how much of the difficulty moves over. For OPT and BLOOM models, the authors found \\(\\alpha = 0.5\\), an even split, worked well.[^2] The weights become a bit spikier. The activations become far flatter.',
    },
    {
      type: 'image',
      src: '/blog-images/running-llms-locally/smoothquant-activation-weight.webp',
      alt: 'Four 3D surface plots from one OPT-13B layer. Original activations have tall red walls in a few channels above 70. After smoothing, activations are flat below about 2. Original weights are flat; smoothed weights show small spikes but stay low.',
      width: 1200,
      height: 390,
      caption: 'One linear layer of OPT-13B before and after smoothing. The tall walls in the original activations are the outlier channels. Figure 4 from Xiao et al., 2023,[^2] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: 'The paper reports up to 1.56\u00d7 speedup and 2\u00d7 memory reduction with negligible accuracy loss.[^2] SmoothQuant still stores weights in 8 bits, which for a 7B model means about 7 GB. Getting under that requires pushing the weights themselves below 8 bits, and the next three papers all target that.',
    },
    {
      type: 'h2',
      text: 'GPTQ: round one column, repair the rest',
    },
    {
      type: 'p',
      text: 'Going to 4 bits leaves only 16 grid points, so each rounding error is bigger. GPTQ, from IST Austria and ETH Zurich, stops treating each weight\'s rounding as an independent decision. It quantizes a layer column by column. After each column is rounded, it adjusts the weights that have not been quantized yet to cancel out the error, using second-order information computed from sample inputs.[^3] The goal for each layer is to keep the layer\'s output close to the original:',
    },
    {
      type: 'eq',
      tex: '\\hat{W}^{*} = \\arg\\min_{\\hat{W}} \\big\\lVert W X - \\hat{W} X \\big\\rVert_2^2',
      caption: 'The layer-wise objective GPTQ solves (Frantar et al., equation 1).[^3] \\(W\\) is the original weight matrix, \\(\\hat{W}\\) the quantized one, and \\(X\\) the layer inputs from calibration text.',
    },
    {
      type: 'p',
      text: 'Notice that \\(X\\), the activations, appears in the objective. GPTQ only quantizes weights, but it judges each weight by how much error it causes on real inputs. Its calibration set is small: 128 random 2,048-token segments of web text.[^3] It quantized the 175B models in about four GPU hours.[^3]',
    },
    {
      type: 'p',
      text: 'The difference from plain rounding (which the paper calls round-to-nearest, or RTN) is large. On OPT-175B at 4 bits, GPTQ lost 0.03 perplexity. RTN lost 2.2, enough to score worse than the full-precision 13B model, which is about ten times smaller.[^3] At 3 bits, RTN collapsed completely while GPTQ still held up.[^3] For the 6.7B OPT model on WikiText2, full precision scores 10.86, 4-bit RTN 12.10, and 4-bit GPTQ 11.39.[^3]',
    },
    {
      type: 'h2',
      text: 'AWQ: find the 1% that matter by watching activations',
    },
    {
      type: 'p',
      text: 'The AWQ team at MIT, several of whom also wrote SmoothQuant, started from an experiment. They quantized OPT-6.7B to 3 bits, in groups of 128 weights, but kept a small slice of weight channels in 16-bit, and compared three ways of choosing that slice. Keeping 1% of channels chosen by large weight magnitude barely helped: perplexity went from 23.54 to 22.37. Keeping 1% chosen at random did nothing useful. Keeping 1% chosen by large **activation** magnitude brought perplexity down to 11.39, close to the full-precision 10.86.[^4] The weights that matter are the ones that get multiplied by the big activations.',
    },
    {
      type: 'p',
      text: 'Mixed precision is awkward for hardware, so AWQ protects those channels by scaling instead. Quantization rounds \\(w / \\Delta\\), where the step size \\(\\Delta\\) is set by the group\'s largest weight. If you multiply one salient weight by \\(s > 1\\) and divide its input by \\(s\\), the rounding error stays about the same size in absolute terms. Relative to that weight, though, it shrinks by roughly a factor of \\(s\\), because scaling a single weight usually does not change the group\'s maximum.[^4]',
    },
    {
      type: 'eq',
      tex: '\\frac{\\text{new error}}{\\text{old error}} = \\frac{\\Delta\'}{\\Delta} \\cdot \\frac{1}{s}, \\qquad \\Delta\' \\approx \\Delta',
      caption: 'Why scaling up a salient weight reduces its error (Lin et al., Section 3.2).[^4]',
    },
    {
      type: 'p',
      text: 'Scaling too far backfires, because \\(\\Delta\\) grows and the other weights in the group lose precision. On OPT-6.7B the best single value was \\(s = 2\\), and AWQ searches for the best scale per channel automatically.[^4] It needs no backpropagation and no reconstruction. The authors argue this makes it less likely than GPTQ to overfit the calibration set.[^4] The paper also lists llama.cpp among the systems that already used group-wise 4-bit quantization, where a small group of weights shares one scale.[^4]',
    },
    {
      type: 'h2',
      text: 'NF4: a 4-bit grid shaped like the weights',
    },
    {
      type: 'p',
      text: 'All the methods above use evenly spaced grid points. The QLoRA paper asked whether the 16 points of a 4-bit format could be placed better. Trained weights are usually shaped like a zero-centered normal distribution, so most values sit near zero and few sit far out.[^5] NormalFloat4 (NF4) places its 16 values at quantiles of a normal distribution, so each grid point receives about the same number of weights. The authors describe it as information-theoretically optimal for normally distributed data.[^5] Averaged over OPT, BLOOM, LLaMA, and Pythia models from 125M to 13B, NF4 with double quantization gave a perplexity of 27.41, against 34.34 for plain 4-bit integers and 31.07 and 29.48 for two 4-bit float layouts.[^5]',
    },
    {
      type: 'p',
      text: 'QLoRA also accounts for a cost the headline "4-bit" number hides. Every block of weights needs its own scaling constant. With a 32-bit constant for every 64 weights, that adds half a bit per parameter. Double quantization stores those constants in 8 bits, in blocks of 256, and brings the overhead down:[^5]',
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\tfrac{32}{64} = 0.5 \\ \\text{bits} \\;\\longrightarrow\\; \\tfrac{8}{64} + \\tfrac{32}{64 \\cdot 256} \\approx 0.127 \\ \\text{bits} \\\\[4pt] 7{\\times}10^9 \\times \\tfrac{4.5}{8} \\approx 3.94\\ \\text{GB} \\\\ 7{\\times}10^9 \\times \\tfrac{4.127}{8} \\approx 3.61\\ \\text{GB} \\end{gathered}',
      caption: 'The constant overhead from Dettmers et al., 2023,[^5] applied to our 7B example (the last two lines are arithmetic).',
    },
    {
      type: 'p',
      text: 'GPTQ reports a similar overhead for its grouped variants, about 0.15 extra bits for groups of 128 weights.[^3] So a realistic 4-bit 7B model is closer to 3.6 to 3.9 GB than to 3.5 GB. QLoRA\'s main result is about fine-tuning. Training small adapter weights on top of a frozen NF4 model matched 16-bit fine-tuning on the paper\'s benchmarks, which let the authors fine-tune a 65B model on one 48 GB GPU.[^5]',
    },
    {
      type: 'h2',
      text: 'What the papers measured at 4 bits',
    },
    {
      type: 'p',
      text: 'The cleanest comparison for a 7B model is in the AWQ paper, which ran plain rounding, GPTQ, GPTQ with a reordering trick, and AWQ on Llama-2-7B under the same settings: groups of 128 weights, measured by WikiText-2 perplexity. Full precision scores 5.47.[^4] The chart shows how much each method adds.',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Perplexity added by quantizing Llama-2-7B (lower is better)',
      yLabel: 'Perplexity increase over FP16',
      series: [
        { label: '4-bit', key: 'int4' },
        { label: '3-bit', key: 'int3' },
      ],
      data: [
        { label: 'Round-to-nearest', values: { int4: 0.26, int3: 1.19 } },
        { label: 'GPTQ', values: { int4: 0.22, int3: 0.96 } },
        { label: 'GPTQ-R', values: { int4: 0.16, int3: 0.95 } },
        { label: 'AWQ', values: { int4: 0.13, int3: 0.77 } },
      ],
      caption: 'Computed from Table 4 of Lin et al.[^4] (FP16 baseline 5.47; group size 128; WikiText-2). Each bar is the quantized perplexity minus 5.47.',
    },
    {
      type: 'p',
      text: 'Two things stand out. At 4 bits with small groups, even plain rounding costs only 0.26 perplexity on this model. The AWQ authors note that round-to-nearest "is actually quite strong" when the group size is as small as 128.[^4] Part of the reason is that these are weight-only methods: activations stay in 16-bit (the W4A16 setting), so the activation outliers that broke 8-bit rounding are never rounded at all.[^4] The second point is that the gap between methods widens at 3 bits. There, AWQ adds 0.77 and plain rounding adds 1.19.[^4] Clever methods matter most when you push past the point where simple rounding still works.',
    },
    {
      type: 'p',
      text: 'The scale trend runs in the model\'s favor. GPTQ found that larger models generally seemed easier to quantize, OPT-66B being an exception.[^3] LLM.int8() showed that perplexity, more than parameter count, tracks when outliers appear.[^1] One caveat applies to all of these numbers. They are mostly perplexity on held-out text plus a set of zero-shot benchmarks. They show the model predicts text almost as well as before. They do not tell you how a quantized model will do on your particular task.',
    },
    {
      type: 'callout',
      title: 'Where this shows up on your disk',
      text: 'Local runners such as llama.cpp load models from GGUF files. The format is designed as a single file that holds the tensors and all the metadata needed to load them, and it can be memory-mapped for fast loading.[^6] The naming convention puts the weight encoding scheme in the filename, as in the spec\'s example "Grok-100B-v1.0-Q4_0-00003-of-00009.gguf", where Q4_0 is the encoding.[^6]',
    },
    {
      type: 'p',
      text: 'So the path from 14 GB to under 4 GB for a 7B model rests on three findings. The dangerous values are a few activation channels, not the weights in general.[^1,2] Weights should be judged by the activations they multiply.[^3,4] The rounding grid and its scaling constants can be shaped to fit the weights\' real distribution.[^5] At 4 bits, with those ideas combined, the measured cost on a 7B model is a perplexity increase of roughly a tenth to a quarter of a point.[^4]',
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Dettmers, Lewis, Belkada, and Zettlemoyer, LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale, 2022', url: 'https://arxiv.org/abs/2208.07339' },
        { title: 'Xiao, Lin, Seznec, Wu, Demouth, and Han, SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models, 2023', url: 'https://arxiv.org/abs/2211.10438' },
        { title: 'Frantar, Ashkboos, Hoefler, and Alistarh, GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers, 2023', url: 'https://arxiv.org/abs/2210.17323' },
        { title: 'Lin et al., AWQ: Activation-aware Weight Quantization for On-Device LLM Compression and Acceleration, 2024', url: 'https://arxiv.org/abs/2306.00978' },
        { title: 'Dettmers, Pagnoni, Holtzman, and Zettlemoyer, QLoRA: Efficient Finetuning of Quantized LLMs, 2023', url: 'https://arxiv.org/abs/2305.14314' },
        { title: 'ggml project, GGUF file format specification', url: 'https://github.com/ggml-org/ggml/blob/master/docs/gguf.md' },
      ],
    },
  ],
};

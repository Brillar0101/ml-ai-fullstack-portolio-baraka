// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled in src/data/seriesPosts.js. Every factual claim is taken from the
// numbered sources at the end. The OPT scaling figure is reproduced from
// arXiv 2212.09720 under CC BY 4.0. The BitNet charts are redrawn from table
// values in arXiv 2402.17764, whose arXiv license does not allow reuse.
export const POST = {
  id: 'quantization-plain-terms',
  title: 'How few bits can a language model survive?',
  excerpt: 'Quantization stores a model\'s numbers with fewer bits. A 35,000-experiment study found 4 bits was the best trade almost everywhere, and a model trained from scratch with weights of only -1, 0 and +1 pushed below that. Here is the mapping, the arithmetic, and the conditions attached to each result.',
  category: 'ML',
  chapter: 'Chapter 7',
  tags: ['Quantization', 'Inference', 'Memory'],
  seriesNum: 13,
  publishAt: '2026-02-25T12:00:00Z',
  body: [
    {
      type: 'p',
      text: "In December 2022 Tim Dettmers and Luke Zettlemoyer posted the results of more than 35,000 experiments built around one question. If you have a fixed memory budget, should you spend it on a bigger model stored coarsely or a smaller model stored finely? Their example: a 60 billion parameter model at 4 bits per number and a 30 billion parameter model at 8 bits take up exactly the same number of bits, so which one answers better?[^1] They tested models from 19 million to 176 billion parameters across the OPT, BLOOM, BLOOMZ, Pythia/NeoX and GPT-2 families, at precisions from 3 to 16 bits.[^1]",
    },
    {
      type: 'p',
      text: "Their answer was that \"4-bit parameters yield optimal performance for a fixed number of model bits across all model scales and model families tested.\"[^1] Going from 16 bits down to 4 bits steadily improved zero-shot accuracy for a fixed total number of bits. At 3 bits the trend reversed. The one exception they found was BLOOM-176B, where 3 bits came out slightly but not significantly better.[^1] Their practical advice follows from that: default to 4 bits, and if you need a smaller or better model, change the number of parameters and leave the precision alone.[^1]",
    },
    {
      type: 'p',
      text: "The scope matters. They studied **zero-shot quantization**, meaning methods that round a trained model's weights without looking at any data to tune the rounding. Only the weights were quantized, and the inputs stayed in 16 bits. Accuracy was the mean over four zero-shot tasks: LAMBADA, Winogrande, HellaSwag and PiQA.[^1] Before we look at the curves, it helps to know exactly what \"storing a number in 4 bits\" means.",
    },
    {
      type: 'h2',
      text: 'Turning a real number into a small integer',
    },
    {
      type: 'p',
      text: "A model's weights are usually stored as floating point numbers, often 16 bits each. **Quantization** means storing each one instead as a small integer, one of only a few allowed levels, plus a little shared information that says how to turn the integer back into a real value. The version most people meet first comes from a 2017 Google paper by Benoit Jacob and colleagues, whose scheme was adopted in TensorFlow Lite.[^2] They required it to be an affine mapping between integers and real numbers:",
    },
    {
      type: 'eq',
      tex: 'r = S\\,(q - Z)',
      caption: 'Equation 1 of Jacob et al., 2017.[^2] The real value \\(r\\) is recovered from the stored integer \\(q\\) using a scale \\(S\\) and a zero-point \\(Z\\).',
    },
    {
      type: 'p',
      text: "Term by term: \\(r\\) is the real number the model actually means, such as a weight of 0.7341. \\(q\\) is the integer that gets stored. In their 8-bit case it is an unsigned integer from 0 to 255.[^2] \\(S\\), the **scale**, is a positive real number giving the size of one integer step in real units. \\(Z\\), the **zero-point**, is itself an integer of the same type as \\(q\\), and it is the integer that stands for real zero.[^2] One pair of \\(S\\) and \\(Z\\) is shared by every value in a whole weight array or activation array, and different arrays get their own pair.[^2]",
    },
    {
      type: 'p',
      text: "Why insist that zero be exact? The paper's reason is practical: neural network code often pads arrays with zeros around their edges, so real zero has to map onto a stored integer with no rounding error at all.[^2] During training, their method picks a range \\([a, b]\\) for each array (for weights, simply the minimum and maximum), nudges it so that 0.0 lands exactly on an integer, and sets the step size to \\((b - a)/(n - 1)\\), where \\(n\\) is the number of levels, 256 for 8 bits.[^2]",
    },
    {
      type: 'callout',
      title: 'A worked example (illustrative numbers, not from any paper)',
      text: "Say a weight array ranges from \\(a = -0.5\\) to \\(b = 1.0\\). At 8 bits, \\(S = 1.5/255 \\approx 0.00588\\), and real zero sits \\(0.5/S = 85\\) steps above the bottom, so \\(Z = 85\\). To store \\(r = 0.7341\\), divide by \\(S\\) to get 124.8, round to 125, and add \\(Z\\): \\(q = 210\\). Reading it back gives \\(S(210 - 85) \\approx 0.7353\\), off by about 0.001. Now try 4 bits, which allows only 16 levels. \\(S = 1.5/15 = 0.1\\) and \\(Z = 5\\). The same weight becomes 7.341 steps, rounds to 7, is stored as \\(q = 12\\), and comes back as 0.7, off by about 0.034. That is roughly 30 times the error of the 8-bit version. Real zero comes back exactly in both cases, which is the point of \\(Z\\).",
    },
    {
      type: 'p',
      text: "The same paper shows how to multiply matrices in this form without floating point. When you substitute the mapping into a matrix product, every non-integer piece collapses into one constant, \\(M = S_1 S_2 / S_3\\), which can be computed ahead of time. The authors found it always lies between 0 and 1, so they store it as a fixed-point integer multiplier and a bit shift.[^2] The heavy work becomes 8-bit integer multiplies summed into a 32-bit integer accumulator. Bias vectors are kept as 32-bit integers, because any error in a bias gets added to many outputs and acts as a systematic offset.[^2]",
    },
    {
      type: 'h2',
      text: 'Fewer bits, less memory, less waiting',
    },
    {
      type: 'p',
      text: "The memory saving is plain multiplication. Dettmers and Zettlemoyer note that 175 billion parameter models can need up to 352 GB of GPU memory.[^1] My arithmetic, weights only: 175 billion numbers at 16 bits, which is 2 bytes each, come to 350 GB. At 4 bits, half a byte each, the same weights come to about 88 GB. Their opening example also checks out: 60 billion times 4 bits and 30 billion times 8 bits are both 240 billion bits, or 30 GB.",
    },
    {
      type: 'p',
      text: "Why it also saves time is less obvious. The paper splits the time of a computation into loading numbers from main memory and doing arithmetic on them. On GPUs, loading a number usually takes more than 100 times longer than doing an operation with it.[^1] Caching helps only when data gets reused. For small inference batches, below roughly 60 on an RTX 3090 or 200 on an RTX 4090 by their figures, there is no reuse to exploit, and latency is set by how many bytes of the weight matrix have to be loaded.[^1] Shrink the weights and you shrink the wait. They cite one measurement: custom kernels with 3-bit weights ran OPT-175B up to 4.46 times faster than 16 bits, close to the 5.33 times reduction in bits.[^1,3]",
    },
    {
      type: 'p',
      text: "Jacob and colleagues measured the speed side on phones. With 8-bit integer MobileNets on the power-efficient LITTLE cores of a Snapdragon 835, the quantized models were about 10% more accurate on ImageNet than floating point models with the same latency, at the 33 ms per image needed for 30 frames per second.[^2] On COCO object detection, quantized training and inference cut running time by up to 50% for a relative accuracy loss of 1.8%.[^2] They also warn that the gain depends on how fast the chip runs integer math compared with floating point. On the Snapdragon 821, whose floating point was better optimized, the latency drop was smaller.[^2]",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Precision (bit width)', def: 'How many bits store each number. k bits allow 2 to the power k distinct levels: 256 at 8 bits, 16 at 4 bits, 8 at 3 bits.' },
        { term: 'Total model bits', def: 'Parameter count times bits per parameter. Dettmers and Zettlemoyer use it as the x axis, so a big coarse model and a small fine one can be compared at equal memory cost.' },
        { term: 'Post-training quantization', def: 'Training a model in full precision and rounding its weights afterward. Zero-shot methods are the simplest version of this.' },
        { term: 'Quantization-aware training', def: 'Simulating the rounding during training, so the model learns weights that survive it. Jacob et al. insert "fake quantization" steps into the training graph for this.' },
        { term: 'Block', def: 'A run of consecutive weights, such as 64, quantized with its own scale so that one large value only degrades its own block.' },
      ],
    },
    {
      type: 'h2',
      text: 'The 4-bit result, curve by curve',
    },
    {
      type: 'p',
      text: "With that in place the main figure reads simply. The x axis is total model bits on a log scale. Each line is one precision, and each point along a line is a larger OPT model. A line sitting higher means more accuracy for the same memory.",
    },
    {
      type: 'image',
      src: '/blog-images/quantization-plain-terms/opt-bit-scaling.webp',
      alt: 'Line chart of mean zero-shot accuracy, from 0.35 to 0.75, against total model bits on a log scale from about 10 to the 9 to 10 to the 12, for OPT models at 3, 4, 8 and 16 bits. The 4-bit line is highest almost everywhere, then 8-bit, then 16-bit. The 3-bit line tracks the others for small models, then collapses to about 0.37 near 2 times 10 to the 11 bits before partly recovering.',
      width: 1030,
      height: 755,
      caption: 'Mean zero-shot accuracy for OPT models from 125M to 176B parameters at four precisions. Figure 1 from Dettmers and Zettlemoyer, 2023,[^1] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The paper reports these results as curves, not tables, so the figure is reproduced rather than redrawn.',
    },
    {
      type: 'p',
      text: "The 4-bit line sits above the 8-bit line, which sits above 16-bit. Halving the bits per number and spending the savings on more parameters wins, all the way down to 4. The 3-bit line is the break. For the largest OPT and Pythia models, 3-bit inference was unstable and scored close to random, which on these four tasks the paper puts at 35%.[^1] GPT-2 and BLOOM stayed stable at 3 bits, but the paper's figure caption notes that the gains from fewer bits stop for every model family at 3 bits.[^1] The authors also note that the lines for different precisions are nearly parallel, so the trade depends little on model size. 3 bits is the exception to that too.[^1]",
    },
    {
      type: 'p',
      text: "They then tried to push the curves up. For 6 to 8 bits, nothing they tried helped: not centering, not other data types, not blocking. Their explanation is that 6 to 8 bits are already precise enough that there is nothing left to fix.[^1] At 3 to 5 bits two things did help. The first was small blocks. Each block of 64 weights carries its own 16-bit scale, which costs \\(16/64 = 0.25\\) extra bits per parameter.[^1] For 4-bit Pythia, going from blocks of 1,024 to blocks of 64 added 0.24 bits per parameter and improved zero-shot accuracy almost as much as going from 4 to 5 bits.[^1] The second was the choice of data type. Quantile quantization, which places the levels so each one holds an equal share of the weights, and small floating point formats both scaled better than evenly spaced integers.[^1]",
    },
    {
      type: 'p',
      text: "My reading is that evenly spaced integer levels, the family the affine scheme above belongs to, are not the best 4-bit format by this measure, because they spend some of their 16 slots on ranges where few weights fall. The paper's own framing of why that matters: a 4-bit type whose values use only 8 of its 16 levels on average is effectively a 3-bit type.[^1] Even with all of these tricks, 3 bits never caught up with 4. Keeping the 2% most outlier-prone dimensions in 16 bits stabilized 3-bit OPT and Pythia, yet 4-bit still scaled better.[^1]",
    },
    {
      type: 'h2',
      text: 'Below four bits: weights of -1, 0 and +1',
    },
    {
      type: 'p',
      text: "Dettmers and Zettlemoyer studied rounding a model after training, and they said so. Their limitations section lists methods that tune the quantization using extra input data as outside their study, and they point to such methods as a possible route below 4 bits.[^1] A Microsoft Research team took a different route: do not round a finished model at all. Train it from the start with the low-precision weights built in.",
    },
    {
      type: 'p',
      text: "Their first BitNet, in 2023, replaced the standard linear layers of a Transformer with a layer called BitLinear whose weights are binarized to +1 or -1.[^4,5] The model keeps a full-precision copy of each weight during training to collect the small gradient updates. That copy is rounded on the fly in the forward pass and is never used at inference.[^5] The sign and clipping functions are not differentiable, so gradients skip past them in the backward pass, a trick called the straight-through estimator.[^5] In February 2024, BitNet b1.58 added a third value, 0, so every weight is **ternary**: -1, 0 or +1.[^4] Three values need \\(\\log_2 3 \\approx 1.58\\) bits of information each, which is where the name comes from.",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\widetilde{W} = \\mathrm{RoundClip}\\!\\left(\\frac{W}{\\gamma + \\epsilon},\\,-1,\\,1\\right) \\\\[4pt] \\gamma = \\frac{1}{nm}\\sum_{ij} |W_{ij}| \\end{gathered}',
      caption: 'The absmean weight quantizer, equations 1 to 3 of Ma et al., 2024.[^4] RoundClip rounds to the nearest integer and clips the result to the range from -1 to 1.',
    },
    {
      type: 'p',
      text: "Read it as a close cousin of the affine mapping. \\(\\gamma\\) is the average absolute value of the \\(n \\times m\\) weight matrix, and it plays the part of the scale \\(S\\). Dividing by it puts a typical weight near 1. Rounding then leaves only three possible integers. \\(\\epsilon\\) is a tiny constant that prevents division by zero. The three weight levels sit symmetrically around zero, so no zero-point is needed there, and the paper drops the zero-point for the 8-bit activations too, scaling them per token into a range symmetric around zero.[^4] The authors credit the 0 with making the model stronger, since it lets the model explicitly filter out features. A matrix multiply with such weights needs almost no multiplication, because multiplying by -1, 0 or +1 is a subtraction, a skip, or an addition.[^4]",
    },
    {
      type: 'p',
      text: "The comparison was built to be fair. The team trained their own FP16 LLaMA-style baselines and BitNet b1.58 models at matching sizes, all on the same 100 billion tokens of the RedPajama dataset.[^4] At 700M and 1.3B parameters, BitNet had slightly higher perplexity (worse), 12.87 against 12.33 and 11.29 against 11.25. At 3B it was ahead, 9.91 against 10.04.[^4] Measured with FasterTransformer and a 2-bit kernel, the 3B model used 3.55 times less GPU memory and was 2.71 times faster per output token.[^4]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'GPU memory at inference, FP16 LLaMA vs BitNet b1.58',
      yLabel: 'Memory (GB)',
      series: [
        { label: 'LLaMA LLM (FP16)', key: 'fp16', baseline: true },
        { label: 'BitNet b1.58', key: 'bitnet' },
      ],
      data: [
        { label: '700M', values: { fp16: 2.08, bitnet: 0.8 } },
        { label: '1.3B', values: { fp16: 3.34, bitnet: 1.14 } },
        { label: '3B', values: { fp16: 7.89, bitnet: 2.22 } },
      ],
      caption: 'Redrawn from Table 1 of Ma et al., 2024.[^4] Both model types were trained by the authors on the same 100B RedPajama tokens. Perplexity at the same sizes was 12.33 vs 12.87, 11.25 vs 11.29, and 10.04 vs 9.91 (FP16 first).',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Average zero-shot accuracy on seven tasks',
      yLabel: 'Average accuracy (%)',
      series: [
        { label: 'LLaMA LLM (FP16)', key: 'fp16', baseline: true },
        { label: 'BitNet b1.58', key: 'bitnet' },
      ],
      data: [
        { label: '700M', values: { fp16: 45.5, bitnet: 44.3 } },
        { label: '1.3B', values: { fp16: 46.2, bitnet: 45.4 } },
        { label: '3B', values: { fp16: 49.7, bitnet: 50.2 } },
      ],
      caption: 'Redrawn from Table 2 of Ma et al., 2024.[^4] The average covers ARC-Easy, ARC-Challenge, HellaSwag, BoolQ, OpenbookQA, PIQA and Winogrande. The gap closes as size grows and reverses at 3B.',
    },
    {
      type: 'p',
      text: "The authors say BitNet b1.58 matches full precision \"starting from a 3B size.\"[^4] Past that, they report cost only. At 70B the ternary model was 4.1 times faster than the FP16 baseline in their latency tests.[^4] On two 80 GB A100s it fit 11 times the batch size and delivered 8.9 times the throughput, 2,977 tokens per second against 333.[^4] They estimate 71.4 times less arithmetic energy for matrix multiplication on 7 nm chips. That number comes from an energy model, not a power meter.[^4] A follow-up, BitNet b1.58 2B4T, trained a 2 billion parameter model from scratch on 4 trillion tokens and compared it with open full-precision models of similar size. It needed 0.4 GB of non-embedding memory against 1.4 to 4.8 GB for the others.[^6]",
    },
    {
      type: 'p',
      text: "Keep the conditions attached to all of this. None of these numbers show that you can take an existing 16-bit model and round it to ternary. BitNet b1.58 is \"trained from scratch, with 1.58-bit weights and 8-bit activations.\"[^4] The 2B4T report sorts earlier 1-bit efforts into two groups: post-training quantization of full-precision models, which it says can lead to significant performance degradation, and native 1-bit models trained only at smaller scales.[^6] The cheap inference is paid for with a full pretraining run. The accuracy comparisons in the first paper stop at 3.9B parameters, and the 70B model appears only in the cost measurements.[^4] Read against the 4-bit study, my interpretation is that the two results do not conflict. Dettmers and Zettlemoyer measured how far you can round a finished model. BitNet asks how coarse the weights can be when the model learns with that coarseness from the first step.",
    },
    {
      type: 'h2',
      text: 'What the hardware does not do yet',
    },
    {
      type: 'p',
      text: "The ternary format has a practical problem its authors state directly. Current GPUs and their libraries are built around FP16, BF16, INT8 and INT4, and fast native support for multiplying 1.58-bit weights by 8-bit activations \"is generally unavailable.\" In the 2B4T report's words, this \"can hinder the realization of the theoretical efficiency gains.\"[^6] To run the model at all on GPUs, the team packs four ternary values into each 8-bit integer in memory and unpacks them in on-chip memory right before the multiply. For CPUs they wrote a separate library, bitnet.cpp.[^6] Even so, they write that \"current commodity GPU architectures are not optimally designed for the 1-bit models,\" and that dedicated low-bit hardware will be needed to reach the full speed and energy savings.[^6] The first b1.58 paper's own memory and latency figures were measured with a 2-bit kernel, which its authors say leaves room for further optimization.[^4] Whether performance parity with full precision holds at 7B, 13B and beyond is listed in the 2B4T report as future work, not as a result.[^6]",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Dettmers and Zettlemoyer, The case for 4-bit precision: k-bit Inference Scaling Laws, 2022/2023', url: 'https://arxiv.org/abs/2212.09720' },
        { title: 'Jacob et al., Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference, 2017', url: 'https://arxiv.org/abs/1712.05877' },
        { title: 'Frantar et al., GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers, 2022', url: 'https://arxiv.org/abs/2210.17323' },
        { title: 'Ma et al., The Era of 1-bit LLMs: All Large Language Models are in 1.58 Bits, 2024', url: 'https://arxiv.org/abs/2402.17764' },
        { title: 'Wang et al., BitNet: Scaling 1-bit Transformers for Large Language Models, 2023', url: 'https://arxiv.org/abs/2310.11453' },
        { title: 'Ma et al., BitNet b1.58 2B4T Technical Report, 2025', url: 'https://arxiv.org/abs/2504.12285' },
      ],
    },
  ],
};

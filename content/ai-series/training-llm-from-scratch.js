// Every factual claim below is taken from the numbered sources at the end.
// Figures reproduced from the OPT and FineWeb papers are CC BY 4.0; the two
// charts are redrawn from table values in the Chinchilla and Llama 3 papers.
export const POST = {
  id: 'training-llm-from-scratch',
  title: 'How an LLM Is Trained From Scratch, According to the Teams Who Wrote It Down',
  excerpt: 'Meta published a logbook of every crash while training OPT-175B. Read next to the Chinchilla, FineWeb, and Llama 3 papers, it gives a rare, honest map of what building a foundation model takes.',
  category: 'AI',
  tags: ['LLMs', 'Pretraining', 'Scaling Laws'],
  body: [
    {
      type: 'p',
      text: 'In 2022 Meta trained OPT-175B, a 175 billion parameter language model, on 992 NVIDIA A100 GPUs over about two months. Most labs publish only the finished model. This team also published its [logbook](https://github.com/facebookresearch/metaseq/blob/main/projects/OPT/chronicles/OPT175B_Logbook.pdf), and the paper summarizes what it records: hardware failures caused at least 35 manual restarts, more than 100 machines had to be swapped out, and the team estimates another 70 or more restarts happened automatically.[^1,2] Several times the training loss suddenly shot upward. Each time, the fix was to roll back to an earlier checkpoint, lower the learning rate, and try again.[^1]',
    },
    {
      type: 'image',
      src: '/blog-images/training-llm-from-scratch/opt-lr-schedule.webp',
      alt: 'Line chart of OPT-175B learning rate over 140,000 iterations. It rises to 1.2e-4, decays smoothly, then drops in several abrupt manual steps between 37k and 92k iterations.',
      width: 910,
      height: 640,
      caption: 'OPT-175B\'s learning rate as it was actually run. A textbook schedule is one smooth curve. Every sudden step here is a person intervening after training became unstable. Figure 1 from Zhang et al., 2022,[^1] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: 'That jagged line is a more honest picture of pretraining than any clean pipeline diagram. This post uses it, along with papers from DeepMind, Hugging Face, and Meta\'s Llama 3 team, to walk through what "training from scratch" means: what goes in, which equation is being minimized, how big the model should be, and what turns a text predictor into an assistant.',
    },
    {
      type: 'h2',
      text: 'Five words you need first',
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Token', def: 'A chunk of text the model reads as one unit, often a word or part of a word. Models count everything in tokens, not words or pages.' },
        { term: 'Parameter', def: 'One adjustable number inside the network. "175B parameters" means 175 billion of them. Training is the process of choosing their values.' },
        { term: 'Loss', def: 'A single number that measures how wrong the model\'s predictions are. Training lowers it a little at every step.' },
        { term: 'Learning rate', def: 'How big a step the optimizer takes each time it updates the parameters. Too big and training blows up; too small and it crawls.' },
        { term: 'Checkpoint', def: 'A saved copy of every parameter at one moment in training, so a crashed or diverging run can restart from there instead of from zero.' },
      ],
    },
    {
      type: 'h2',
      text: 'The data: most of the work is deciding what to delete',
    },
    {
      type: 'p',
      text: 'Pretraining data mostly comes from Common Crawl, a public archive of web pages captured in periodic "snapshots." Raw crawl text is full of navigation menus, cookie banners, spam, and the same page copied thousands of times. The job of a data pipeline is to throw most of it away without throwing away the good parts, and that turns out to be harder than it sounds.',
    },
    {
      type: 'p',
      text: 'Duplication is the clearest example. Lee and colleagues found a single 61-word English sentence repeated more than 60,000 times in C4, a popular training set. Models trained on such data copied over 1% of their unprompted output word for word from the training set. After deduplication, models emitted memorized text ten times less often and needed fewer training steps to reach the same accuracy.[^5]',
    },
    {
      type: 'p',
      text: 'The usual tool for finding near-duplicates is **MinHash**. Instead of comparing every pair of documents, which is impossible at web scale, each document is reduced to a short set of hash values computed from its overlapping word sequences. Documents that share enough hashes are treated as copies, and only one is kept. FineWeb, a 15 trillion token dataset built by Hugging Face from 96 Common Crawl snapshots, used 5-word sequences and 112 hash functions, tuned to catch documents that are at least 75% similar.[^4]',
    },
    {
      type: 'p',
      text: 'Then FineWeb\'s authors found something that contradicts the obvious strategy. Their first attempt deduplicated all 96 snapshots against each other. For the oldest snapshots, this removed as much as 90% of the data, and a model trained on what remained barely beat a model trained on data that was never deduplicated at all.[^4] So they ran a direct test on one old crawl from 2013: train one model on the 10% that survived, and another on the 90% that had been thrown out.',
    },
    {
      type: 'image',
      src: '/blog-images/training-llm-from-scratch/fineweb-kept-vs-removed.webp',
      alt: 'Line chart of aggregate benchmark accuracy against training tokens up to 30 billion. The model trained on originally removed data (orange) ends near 43%, above the model trained on originally kept data (blue), which ends near 40.5%.',
      width: 850,
      height: 595,
      caption: 'The data that global deduplication kept (blue) trained a worse model than the data it deleted (orange). Figure 4 from Penedo et al., 2024,[^4] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: 'The deleted data won. When the authors read samples, the surviving 10% had more ads, keyword lists, and badly formatted text.[^4] The authors\' hypothesis is that the benefit of deduplication comes from removing huge clusters of copies, some with hundreds of thousands of documents, while also removing small clusters (fewer than about 100 copies) can hurt. FineWeb instead deduplicated each snapshot on its own, which kept 20 trillion tokens and matched RefinedWeb, the strong baseline they had been failing to reach.[^4]',
    },
    {
      type: 'p',
      text: 'Llama 3\'s pipeline gives a sense of how many layers this takes in production. It deduplicates by URL, then by document with MinHash, then by individual line, removing any line that appears more than 6 times in a bucket of 30 million documents. The team notes that the line filter also deletes some good, frequently repeated text, and kept it anyway because evaluations improved.[^3] The final mix was roughly 50% general knowledge, 25% math and reasoning, 17% code, and 8% multilingual text.[^3]',
    },
    {
      type: 'p',
      text: 'The last step is **tokenization**. Most models use a variant of byte pair encoding (BPE), which Sennrich and colleagues adapted from a 1994 compression method: start with individual characters, find the most frequent adjacent pair, merge it into a new symbol, and repeat until the vocabulary reaches a target size.[^6] Frequent words end up as a single token, and rare words get split into pieces, so the model never meets a word it has no way to spell.',
    },
    {
      type: 'h2',
      text: 'The objective: one equation, trillions of times',
    },
    {
      type: 'p',
      text: 'Pretraining has exactly one goal: predict the next token. Given a sequence of tokens \\(x_1, \\dots, x_T\\), the model assigns a probability to each possible next token, and the loss is the average negative log probability it gave to the tokens that actually came next:',
    },
    {
      type: 'eq',
      tex: '\\mathcal{L}(\\theta) = -\\frac{1}{T} \\sum_{t=1}^{T} \\log p_\\theta\\left(x_t \\mid x_{<t}\\right)',
      caption: 'Cross-entropy loss for next-token prediction. Kaplan et al. report their losses in exactly this form, in nats.[^7]',
    },
    {
      type: 'p',
      text: 'Read it piece by piece. \\(\\theta\\) is every parameter in the model. \\(p_\\theta(x_t \\mid x_{<t})\\) is the probability the model gave the real token \\(x_t\\) after seeing everything before it. If the model was confident and right, that probability is close to 1 and its log is close to 0, so the loss contribution is tiny. If the model gave the real token a probability of 0.001, the log is about \\(-6.9\\) and the loss jumps. Training computes this over a batch, works out how each parameter should change to lower it (backpropagation), and takes a step whose size is set by the learning rate.',
    },
    {
      type: 'p',
      text: 'The scale is hard to picture. Llama 3\'s flagship model has 405 billion parameters and was trained on 15.6 trillion tokens, using \\(3.8 \\times 10^{25}\\) floating point operations on up to 16,000 H100 GPUs.[^3] The recipe is also more careful than "run it." Llama 3 started with small batches of 4 million tokens for stability, doubled the batch size twice as training went on, and waited until the end to train on long documents, growing the context window from 8K to 128K tokens in six stages. It only did this late because attention cost grows with the square of sequence length.[^3]',
    },
    {
      type: 'p',
      text: 'The very end of the run is called **annealing**. Over the final 40 million tokens, the learning rate is lowered to zero while the data mix shifts toward the highest-quality sources. The Llama 3 team found that annealing on small amounts of high-quality code and math data boosted benchmark performance, and they also used short annealing runs as a cheap test of whether a new dataset was worth including.[^3]',
    },
    {
      type: 'h2',
      text: 'Choosing the size: the Chinchilla correction',
    },
    {
      type: 'p',
      text: 'Before any of this starts, a team has a fixed compute budget and has to split it between a bigger model and more data. In 2020 Kaplan and colleagues at OpenAI measured that loss falls as a smooth power law in both model size and data, and concluded that large models are so sample efficient that most extra compute should go into parameters: their optimal model size grows roughly as compute to the power 0.73.[^7] GPT-3, Jurassic, and Gopher, at 175, 178, and 280 billion parameters, were all trained on about 300 billion tokens.[^8]',
    },
    {
      type: 'p',
      text: 'In 2022 Hoffmann and colleagues at DeepMind trained over 400 models, from 70 million to more than 16 billion parameters, and fit the loss directly as a function of both parameter count \\(N\\) and training tokens \\(D\\):[^8]',
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} L(N, D) = E + \\frac{A}{N^{\\alpha}} + \\frac{B}{D^{\\beta}} \\\\[4pt] E = 1.69,\\quad A = 406.4,\\quad B = 410.7 \\\\ \\alpha = 0.34,\\quad \\beta = 0.28 \\end{gathered}',
      caption: 'The fitted Chinchilla loss (Hoffmann et al., 2022, equation 10).[^8]',
    },
    {
      type: 'p',
      text: 'Each term has a plain meaning. \\(E\\) is the loss no model can beat, the natural unpredictability of text. The second term is the penalty for having too few parameters, and it shrinks as \\(N\\) grows. The third is the penalty for having seen too little data, and it shrinks as \\(D\\) grows. Because the two exponents are close, the cheapest way to lower the total is to grow both together. The paper\'s headline result: for every doubling of model size, the number of training tokens should also double.[^8]',
    },
    {
      type: 'p',
      text: 'They tested it by training Chinchilla, a 70 billion parameter model given the same compute budget as their 280 billion parameter Gopher, but on 1.4 trillion tokens instead of 300 billion. Chinchilla beat Gopher, GPT-3, and the 530 billion parameter Megatron-Turing NLG across a wide range of tasks, reaching 67.5% on the MMLU benchmark, an improvement of more than 7% over Gopher.[^8] With a quarter of Gopher\'s parameters, it also needs much less compute to fine-tune and to serve.[^8]',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Training tokens per parameter',
      yLabel: 'Tokens per parameter',
      series: [{ label: 'Tokens per parameter', key: 'r' }],
      data: [
        { label: 'MT-NLG 530B', values: { r: 0.51 } },
        { label: 'Gopher 280B', values: { r: 1.07 } },
        { label: 'GPT-3 175B', values: { r: 1.71 } },
        { label: 'Chinchilla 70B', values: { r: 20 } },
        { label: 'Llama 3 405B', values: { r: 38.5 } },
      ],
      caption: 'Computed from the parameter and token counts in Table 1 of Hoffmann et al.[^8] and, for Llama 3, from Grattafiori et al.[^3] Before Chinchilla, big models saw one or two tokens per parameter.',
    },
    {
      type: 'p',
      text: 'Llama 3 sits well past the Chinchilla ratio, and on purpose. The team ran its own version of this experiment, fit a scaling law on its own data, and got a compute-optimal answer of 402 billion parameters on 16.55 trillion tokens for its budget.[^3] It also noticed that the loss curve is very flat near the optimum at large budgets, so being a little off in either direction costs almost nothing.[^3] In other words, Chinchilla\'s specific ratio is less important than the method it introduced: measure small runs, fit the curve, then commit the big budget.',
    },
    {
      type: 'h2',
      text: 'What actually goes wrong',
    },
    {
      type: 'p',
      text: 'OPT\'s two problems, broken hardware and unstable loss, are still the two problems. They are handled very differently now.',
    },
    {
      type: 'p',
      text: 'Hardware first. During one 54-day stretch of Llama 3 pretraining, the job was interrupted 466 times. Only 47 of those were planned. Of the 419 unexpected ones, about 78% were confirmed or suspected hardware problems.[^3] Pretraining is synchronous: every GPU must finish its part of a step before any GPU can take the next one, so a single GPU failure can force a restart of the entire job. Even so, the team kept useful training time above 90%, and people had to step in manually only three times. Automation handled the rest.[^3]',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Top causes of unexpected interruptions, Llama 3 405B, 54 days',
      yLabel: 'Interruptions',
      series: [{ label: 'Count', key: 'n' }],
      data: [
        { label: 'Faulty GPU', values: { n: 148 } },
        { label: 'GPU HBM3 memory', values: { n: 72 } },
        { label: 'Software bug', values: { n: 54 } },
        { label: 'Network switch/cable', values: { n: 35 } },
        { label: 'Host maintenance', values: { n: 32 } },
        { label: 'GPU SRAM', values: { n: 19 } },
      ],
      caption: 'Redrawn from Table 5 of Grattafiori et al.[^3] Six of the categories that account for most of the 419 unexpected interruptions.',
    },
    {
      type: 'p',
      text: 'Instability is the quieter problem. A **loss divergence** is when the loss, instead of creeping down, suddenly spikes and does not recover. OPT\'s team noticed that divergences lined up with two warning signs: the dynamic loss scaler (which protects 16-bit arithmetic from rounding tiny numbers to zero) collapsing to zero, and the size of the final layer\'s activations growing without bound. They learned to pick restart checkpoints taken before those signals appeared. Cutting gradient clipping from 1.0 to 0.3 early in training also helped.[^1] Llama 3 reports the opposite experience: with a conservative recipe, it "observed few loss spikes and did not require interventions."[^3]',
    },
    {
      type: 'callout',
      title: 'Why the logbook matters',
      text: 'OPT\'s authors point out that published cost estimates usually assume no failures and no restarts. Counting ablations, baselines, and downtime, they estimate their real cost was about twice what the final run alone suggests.[^1]',
    },
    {
      type: 'h2',
      text: 'From text predictor to assistant',
    },
    {
      type: 'p',
      text: 'The model that comes out of pretraining is a **base model**. It is very good at continuing text and has no idea it is meant to help anyone. Ask it a question and it may answer with three more questions, because that is a plausible continuation of a list of questions. Two more stages fix this.',
    },
    {
      type: 'p',
      text: 'The first is **supervised fine-tuning** (SFT): keep training with the same next-token loss, but on examples of instructions paired with good responses. OpenAI\'s InstructGPT paper describes the standard version. Its SFT set had about 13,000 prompts, with demonstration answers written by a team of about 40 contractors.[^9]',
    },
    {
      type: 'p',
      text: 'The second is **preference alignment**. People are shown two responses to the same prompt and pick the better one. InstructGPT used about 33,000 such comparisons to train a separate reward model, then used reinforcement learning (PPO) to push the language model toward higher reward.[^9] The result is one of the most quoted findings in the field: people preferred answers from the 1.3 billion parameter InstructGPT over the 175 billion parameter GPT-3, despite it having more than 100 times fewer parameters.[^9] Alignment did not add knowledge. It made the existing knowledge usable.',
    },
    {
      type: 'p',
      text: 'Reinforcement learning with a separate reward model is expensive and fiddly, because the model has to generate new samples during training. In 2023 Rafailov and colleagues showed the same objective can be optimized directly on the preference pairs with an ordinary classification-style loss, which they called Direct Preference Optimization (DPO):[^10]',
    },
    {
      type: 'eq',
      tex: '\\begin{aligned} \\mathcal{L}_{\\text{DPO}} = -\\,\\mathbb{E}_{(x, y_w, y_l)} \\Big[ \\log \\sigma \\Big( & \\beta \\log \\frac{\\pi_\\theta(y_w \\mid x)}{\\pi_{\\text{ref}}(y_w \\mid x)} \\\\ & - \\beta \\log \\frac{\\pi_\\theta(y_l \\mid x)}{\\pi_{\\text{ref}}(y_l \\mid x)} \\Big) \\Big] \\end{aligned}',
      caption: 'The DPO loss (Rafailov et al., 2023, equation 7).[^10]',
    },
    {
      type: 'p',
      text: 'Here \\(x\\) is a prompt, \\(y_w\\) is the response people preferred, and \\(y_l\\) is the one they rejected. \\(\\pi_\\theta\\) is the model being trained, and \\(\\pi_{\\text{ref}}\\) is a frozen copy of where it started (usually the SFT model). The loss rewards the model for raising the probability of the preferred answer, relative to the reference, more than it raises the rejected one. \\(\\beta\\) controls how far the model may drift from the reference, and \\(\\sigma\\) is the sigmoid function. The paper\'s gradient analysis shows each example is weighted by how wrong the model currently is about it, and removing that weighting made models degenerate.[^10] Llama 3\'s team tried PPO as well and chose DPO for its post-training because it needed less compute at their scale.[^3]',
    },
    {
      type: 'h2',
      text: 'The pipeline, in one paragraph',
    },
    {
      type: 'p',
      text: 'Collect web text and delete most of it, carefully, since FineWeb shows that deleting the wrong things makes the model worse. Tokenize what is left. Use small runs to fit a scaling law and pick a model size and token count for your budget. Minimize next-token cross-entropy for weeks on thousands of GPUs, with automation that expects hundreds of failures. Anneal on your best data. Then fine-tune on demonstrations and align with preference pairs. Each of these steps now has a paper you can read. The most useful one to start with may still be OPT\'s logbook, because it shows what the clean diagrams leave out.',
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Zhang et al., OPT: Open Pre-trained Transformer Language Models, 2022', url: 'https://arxiv.org/abs/2205.01068' },
        { title: 'Meta AI, OPT-175B training logbook (chronicles)', url: 'https://github.com/facebookresearch/metaseq/blob/main/projects/OPT/chronicles/OPT175B_Logbook.pdf' },
        { title: 'Grattafiori et al., The Llama 3 Herd of Models, 2024', url: 'https://arxiv.org/abs/2407.21783' },
        { title: 'Penedo et al., The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale, 2024', url: 'https://arxiv.org/abs/2406.17557' },
        { title: 'Lee et al., Deduplicating Training Data Makes Language Models Better, 2022', url: 'https://arxiv.org/abs/2107.06499' },
        { title: 'Sennrich, Haddow, and Birch, Neural Machine Translation of Rare Words with Subword Units, 2016', url: 'https://arxiv.org/abs/1508.07909' },
        { title: 'Kaplan et al., Scaling Laws for Neural Language Models, 2020', url: 'https://arxiv.org/abs/2001.08361' },
        { title: 'Hoffmann et al., Training Compute-Optimal Large Language Models, 2022', url: 'https://arxiv.org/abs/2203.15556' },
        { title: 'Ouyang et al., Training Language Models to Follow Instructions with Human Feedback, 2022', url: 'https://arxiv.org/abs/2203.02155' },
        { title: 'Rafailov et al., Direct Preference Optimization: Your Language Model Is Secretly a Reward Model, 2023', url: 'https://arxiv.org/abs/2305.18290' },
      ],
    },
  ],
};

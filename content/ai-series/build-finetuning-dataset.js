// Every factual claim below is taken from the numbered sources at the end.
// The LIMA figure is reproduced under CC BY 4.0; the AlpaGasus histogram is
// redrawn from Figure 4 of that paper (arXiv non-exclusive license).
export const POST = {
  id: 'build-finetuning-dataset',
  title: 'Four Fine-Tuning Datasets, Opened Up: What Was Kept, What Was Cut',
  excerpt: 'LIMA beat a model trained on 52 times more data. AlpaGasus threw away 82% of Alpaca and got better. Read side by side with Self-Instruct and phi-1, these papers show exactly which filters did the work, and what their scores cannot measure.',
  category: 'AI',
  tags: ['Fine-tuning', 'Data', 'Instruction Tuning'],
  body: [
    {
      type: 'p',
      text: 'In May 2023 a team from Meta AI and several universities fine-tuned LLaMa 65B, a 65 billion parameter model, on exactly 1,000 prompt and response pairs. They called the result LIMA. As a baseline they fine-tuned the same base model on the 52,000 examples of the Alpaca dataset. Crowd workers then compared answers from the two models on 300 test prompts. LIMA\'s answer won 53% of the time, tied 21%, and lost 26%.[^1] In the authors\' words, "despite training on 52 times more data, Alpaca 65B tends to produce less preferable outputs than LIMA."[^1]',
    },
    {
      type: 'p',
      text: 'Two months later a group from the University of Maryland and Samsung Research America came at the same Alpaca data from the other direction. Instead of writing a small set by hand, they asked ChatGPT to grade all 52,002 Alpaca examples on a 0 to 5 scale and kept only the ones scoring 4.5 or higher. That left 9,229. A model trained on them, which they named AlpaGasus, beat the original Alpaca on all four of their test sets, and training the 7B version took 14 minutes instead of 80.[^4]',
    },
    {
      type: 'p',
      text: 'Both say a smaller, cleaner set can win, by different routes. This post opens four dataset-building efforts side by side (LIMA, Self-Instruct, AlpaGasus, and Microsoft\'s phi-1), then pulls out the filters they share, with the thresholds each paper actually used.',
    },
    {
      type: 'p',
      text: '**Instruction tuning**, or supervised fine-tuning, means continuing to train a pretrained **base model** on pairs of an instruction and a good response, so that it answers requests instead of just continuing text. Everything below is about building those pairs.',
    },
    {
      type: 'h2',
      text: 'LIMA: 750 forum answers and 250 examples prepared by hand',
    },
    {
      type: 'p',
      text: 'LIMA\'s 1,000 training examples came from six piles: 200 from Stack Exchange\'s STEM communities, 200 from its other communities, 200 wikiHow articles, 150 stories from Reddit\'s r/WritingPrompts, 50 tasks from Super-Natural Instructions, and 200 examples the authors wrote themselves. The whole set is roughly 750,000 tokens.[^1]',
    },
    {
      type: 'p',
      text: 'Most of the filtering was plain rules. For Stack Exchange, the team sampled across communities with a temperature of \\(\\tau = 3\\), which flattens the distribution so that one huge community such as programming does not crowd out the rest. Inside each community they took the highest-scoring questions whose title stood on its own, kept the top answer only if it had a score of at least 10, and then dropped answers shorter than 1,200 characters or longer than 4,096, answers written in the first person, and answers that referred to other answers ("as mentioned", "stack exchange"). Links and images were stripped.[^1] Reddit needed a human. Highly upvoted Reddit answers "tend to be humorous or trolling," so the authors picked those examples by hand.[^1]',
    },
    {
      type: 'p',
      text: 'The 200 hand-written answers follow one deliberate style: acknowledge the question, then answer it. The authors report that in preliminary experiments this consistent format generally improved the model.[^1] They also included 13 prompts with "some degree of toxicity or malevolence," answered with a partial or full refusal and an explanation.[^1]',
    },
    {
      type: 'p',
      text: 'The reason they expected 1,000 examples to be enough is what they call the **Superficial Alignment Hypothesis**: a model\'s knowledge and abilities are learned almost entirely during pretraining, and fine-tuning mostly teaches it which format to use when it talks to users.[^1] If that is true, you need outputs that share one style and inputs that cover a wide range. Against stronger systems LIMA was less impressive. Its answers were rated equal to or better than GPT-4\'s in 43% of comparisons, Claude\'s in 46%, and Bard\'s in 58%.[^1]',
    },
    {
      type: 'h2',
      text: 'Self-Instruct: GPT-3 writes its own examples, and about half pass an audit',
    },
    {
      type: 'p',
      text: 'Self-Instruct, from the University of Washington and collaborators, asked whether a model could produce its own instruction data. The pipeline starts from 175 seed tasks written by the authors and their labmates. At each step it samples 8 instructions from a growing pool, 6 human-written and 2 generated earlier, shows them to GPT-3 as examples, and asks for a new instruction. It then asks GPT-3 for inputs and outputs for that instruction.[^2]',
    },
    {
      type: 'p',
      text: 'A new instruction joins the pool only if its ROUGE-L similarity to every instruction already there is below 0.7.[^2] **ROUGE-L** is a score from 0 to 1 based on the longest run of words two texts share in the same order, so 0.7 means heavily overlapping wording. The pipeline also drops instructions that mention things a text model cannot handle, such as images or graphs, removes instances that are exact copies or that share an input but disagree on the output, and uses heuristics to catch instructions that are too long or too short and outputs that just repeat the input.[^2] What survived was 52,445 instructions and 82,439 instances.[^2]',
    },
    {
      type: 'p',
      text: 'Then the authors audited their own data. An expert (one of the authors) labeled 200 random instructions, one instance each. 92% of the instructions described a valid task, 79% of the inputs were appropriate, 58% of the outputs were correct and acceptable, and only 54% had every field valid.[^2] Even with that noise, fine-tuning GPT-3 on the data gave a 33% absolute improvement on the Super-NaturalInstructions benchmark, close to InstructGPT-001.[^2] When they regenerated the outputs with a stronger model, InstructGPT-003, the resulting model beat the one trained on the original outputs by 10% in their human evaluation.[^2]',
    },
    {
      type: 'p',
      text: 'Stanford\'s Alpaca reused this recipe: the same 175 seed tasks, with text-davinci-003 as the generator. It produced 52K instructions and outputs for less than $500 in API costs.[^3] That is the dataset LIMA compared against and AlpaGasus filtered.',
    },
    {
      type: 'h2',
      text: 'AlpaGasus: ChatGPT grades Alpaca, and 82% of it goes',
    },
    {
      type: 'p',
      text: 'The AlpaGasus authors started from an observation: Alpaca\'s 52k examples "contain many low-quality instances with incorrect or irrelevant responses."[^4] One example from their paper asks the model to classify a banana as animal or vegetable, and the training response reads "Animal: No, it\'s a vegetable."[^4]',
    },
    {
      type: 'p',
      text: 'Their fix is an **LLM judge**: a strong model prompted to rate other data. For every example they gave ChatGPT the instruction, the input, and the response, and asked it to rate the response\'s accuracy from 0 to 5, then explain the score. An example is kept if its score clears a threshold:[^4]',
    },
    {
      type: 'eq',
      tex: 'S = \\{\\, x \\in V : G(x, p_G) \\geq \\tau \\,\\}',
      caption: 'The AlpaGasus selection rule (Chen et al., 2024, equation 1).[^4]',
    },
    {
      type: 'p',
      text: '\\(V\\) is the original dataset, \\(x\\) is one (instruction, input, response) triple, \\(G\\) is the grading model, \\(p_G\\) is the rating prompt, and \\(\\tau\\) is the cutoff. The authors chose \\(\\tau = 4.5\\) by looking at the histogram of scores.[^4]',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'ChatGPT accuracy scores for the 52,002 Alpaca examples',
      yLabel: 'Examples',
      series: [{ label: 'Examples', key: 'n' }],
      data: [
        { label: 'Below 3', values: { n: 172 } },
        { label: '3.0', values: { n: 1550 } },
        { label: '3.5', values: { n: 10811 } },
        { label: '4.0', values: { n: 30240 } },
        { label: '4.5', values: { n: 9218 } },
        { label: '5.0', values: { n: 11 } },
      ],
      caption: 'Only the last two bars (9,218 + 11 = 9,229 examples) were kept. Redrawn from Figure 4 of Chen et al., 2024.[^4]',
    },
    {
      type: 'p',
      text: 'The results were judged by GPT-4, which saw both models\' answers and scored each one. LLM judges tend to prefer answers in certain positions, so the authors ran every comparison in both orders.[^4] AlpaGasus beat Alpaca-52k on all four test sets at both 7B and 13B. It also beat a model trained on 9k examples picked at random from Alpaca, which shows the gain came from which examples were chosen and not just from having fewer of them.[^4] In a smaller human study of 160 prompts, the 13B AlpaGasus won 63, tied 64, and lost 33 against Alpaca-13B.[^4] Training cost for the 7B model fell from $27.31 to $4.78.[^4]',
    },
    {
      type: 'h2',
      text: 'phi-1: GPT-4 labels 100,000 files, a cheap classifier does the rest',
    },
    {
      type: 'p',
      text: 'Microsoft Research\'s phi-1 is a code model whose data work covers pretraining as well as fine-tuning. It belongs here because it shows how to run an LLM judge over more data than you could afford to send to the judge.',
    },
    {
      type: 'p',
      text: 'The starting pool was the Python part of the deduplicated Stack dataset plus StackOverflow: over 35 million files and over 35B tokens. GPT-4 labeled about 100k of them, prompted to "determine its educational value for a student whose goal is to learn basic coding concepts." Those labels trained a random forest classifier that uses embeddings from a pretrained code model as its input, and the classifier scored the rest.[^5] About 6B tokens survived. The team added under 1B tokens of textbooks written by GPT-3.5 and then fine-tuned on about 180M tokens of GPT-3.5 exercises, a set they call CodeExercises.[^5]',
    },
    {
      type: 'p',
      text: 'The 1.3B parameter result scored 50.6% pass@1 on HumanEval, meaning its first attempt passed the unit tests for about half the problems.[^5] The filter alone made a large difference. A 350M model trained on the unfiltered data stalled at 12.19% on HumanEval even after 96k steps, while the same size trained on the filtered subset reached 17.68% after 36k steps.[^5]',
    },
    {
      type: 'h2',
      text: 'The four files next to each other',
    },
    {
      type: 'ul',
      items: [
        'LIMA kept 1,000 examples (about 750,000 tokens), mined from forums with rule-based filters and topped up with 200 answers the authors wrote. It was judged by crowd workers and GPT-4 against five other models.[^1]',
        'Self-Instruct generated 52,445 instructions from 175 seeds, filtered by ROUGE-L below 0.7 plus heuristics. In the authors\' own audit, 54% of sampled examples were fully valid.[^2]',
        'AlpaGasus kept 9,229 of Alpaca\'s 52,002 examples, those ChatGPT scored at least 4.5 for accuracy. It was judged by GPT-4 on four test sets, a 160-prompt human study, and benchmarks.[^4]',
        'phi-1 filtered about 35B tokens of code down to about 6B with a classifier trained on GPT-4 labels, then fine-tuned on about 180M synthetic tokens. It was measured by HumanEval and MBPP pass rates.[^5]',
      ],
    },
    {
      type: 'p',
      text: 'These outcomes do not share a scale, so I have not charted them together. LIMA reports human preference rates, AlpaGasus reports GPT-4 win and loss counts, Self-Instruct reports benchmark overlap scores and human ratings, and phi-1 reports code pass rates. The methods, though, compare directly.',
    },
    {
      type: 'h2',
      text: 'Near-duplicates: everyone removes them, with different thresholds',
    },
    {
      type: 'p',
      text: 'The clearest study of duplicates comes from Google\'s Lee and colleagues, who worked on pretraining corpora, but the tools carry over unchanged. They found a single 61-word English sentence repeated more than 60,000 times in C4, a popular training set. Models trained on that data copied over 1% of their unprompted output word for word from the training set, and deduplication cut that rate by a factor of 10.[^6]',
    },
    {
      type: 'p',
      text: 'They used two tools. The first removes exact repeats: any span of 50 or more tokens that appears more than once, found efficiently with a suffix array. The second, which they call NearDup, catches documents that are almost the same, such as one news story posted on several sites with different headers. It uses **MinHash**, which cuts each document into overlapping 5-word chunks and estimates how much two documents\' chunk sets overlap without comparing every pair directly. The overlap is the Jaccard index:[^6]',
    },
    {
      type: 'eq',
      tex: 'J(d_i, d_j) = \\frac{|d_i \\cap d_j|}{|d_i \\cup d_j|}',
      caption: 'Jaccard index between the n-gram sets of two documents (Lee et al., 2022).[^6]',
    },
    {
      type: 'p',
      text: 'Pairs that MinHash flagged with an estimated Jaccard index above 0.8 were then checked with a slower edit-similarity measure and marked as duplicates if that was also above 0.8.[^6]',
    },
    {
      type: 'p',
      text: 'For a fine-tuning set the bigger risk is leakage into the test set. Lee and colleagues found that 4.6% of C4\'s validation examples and 14.4% of RealNews\' validation examples had a near-duplicate in the training data.[^6] If your evaluation prompts overlap your training pairs, your score partly measures memory. The phi-1 team treated this seriously. A 13-gram overlap check found 4 HumanEval problems that matched something in CodeExercises, all false positives. Because matching words misses code that does the same thing under different names, they also compared embeddings and syntax trees, and removed between 42.5K and 354K of the 879.5K exercises depending on the threshold.[^5] At the strictest setting the retrained model dropped from 50.6% to 45.1%, still above the 41.5% of the 15.5B parameter StarCoder-Prompted.[^5]',
    },
    {
      type: 'h2',
      text: 'LLM judges: where the cut line goes',
    },
    {
      type: 'p',
      text: 'AlpaGasus tested its threshold. Lowering it to \\(\\tau = 4.0\\) kept 39k examples. That model beat Alpaca-52k on two test sets (Koala and WizardLM), showed no advantage on the other two, and did worse than AlpaGasus with its 9k.[^4] The authors read this as the cost of letting low-quality data back in.',
    },
    {
      type: 'p',
      text: 'Going smaller did not keep improving things either. Random 3k and 6k slices of the 9k high-scoring set both did worse than the full 9k on all four test sets, though about 6k was already enough to match the original Alpaca.[^4] So there are two findings here. Low-scoring examples hurt. Among high-scoring examples, more still helped.',
    },
    {
      type: 'p',
      text: 'The same judge also works on data people wrote. Applied to Databricks\' Dolly, 15,000 human-written pairs, the 4.5 threshold kept 2,996.[^4] The paper also points out why human rating is hard here: strong generators produce "eloquent but incorrect responses that are more subtle to detect by humans."[^4] phi-1\'s version is the budget option. Pay for the expensive judge on 100k samples, then let a small classifier copy its judgment over tens of billions of tokens.[^5]',
    },
    {
      type: 'h2',
      text: 'Diversity is what a quality score quietly destroys',
    },
    {
      type: 'p',
      text: 'AlpaGasus has a warning buried in its skill-by-skill breakdown. On the WizardLM test set the 7B model was as good as or better than Alpaca on 22 of 29 skills, but had no advantage on the other 7, coding among them. The authors traced this to the filter. Of 718 coding examples, only 85 survived, a removal rate of 88.16% against 82.25% for the dataset as a whole.[^4] The selection rule said nothing about categories, so nothing stopped coding\'s share from shrinking. The paper\'s conclusion is that training data should be kept "diverse and balanced across different categories."[^4]',
    },
    {
      type: 'p',
      text: 'LIMA separated diversity, quality, and quantity in a set of ablations. The team trained 7B models on 2,000 examples from each source and had ChatGPT grade answers from 1 to 6. Filtered Stack Exchange, with varied questions and good answers, scored 3.83. wikiHow, with equally good answers but only "how to" questions, scored 3.49. Unfiltered Stack Exchange, varied but unfiltered, scored 3.33.[^1] The authors note that comparing two different sites may mix in other differences.[^1] Growing the filtered Stack Exchange set from 2K to 32K examples, a 16-fold increase, did not improve the score.[^1]',
    },
    {
      type: 'image',
      src: '/blog-images/build-finetuning-dataset/lima-diversity-quality-quantity.webp',
      alt: 'Two charts. Left: bar chart of generation quality for 7B models trained on 2,000 examples: wikiHow 3.49, unfiltered Stack Exchange 3.33, filtered Stack Exchange 3.83. Right: line chart of generation quality versus training examples from 2K to 32K, flat at about 3.8 throughout.',
      width: 1680,
      height: 525,
      caption: 'Left: same size, different sources. Right: the same filtered source at 2K to 32K examples, with no gain. Figures 5 and 6 from Zhou et al., 2023,[^1] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: 'Self-Instruct saw a similar curve. Human-rated quality rose with more generated data but almost plateaued after 16K instructions.[^2] The phi-1 authors say why generated data tends to lack variety: simply prompting a model for textbooks or exercises "will likely result in a very homogeneous and redundant dataset." Their fix was to put randomness in the prompts, varying the topic and target audience for textbooks and constraining the function names for exercises.[^5]',
    },
    {
      type: 'p',
      text: 'Filling a gap can be cheap. LIMA\'s original 1,000 examples had no multi-turn dialogue, and adding just 30 dialogue chains raised the share of excellent responses in live conversations from 45.2% to 76.1%.[^1]',
    },
    {
      type: 'h2',
      text: 'What the preference scores cannot see',
    },
    {
      type: 'p',
      text: 'A Berkeley group tested the shortcut behind Alpaca and Self-Instruct: fine-tune an open model on outputs from a stronger one. They trained models from 1.5B to 13B parameters on 0.3M to 150M tokens of ChatGPT outputs. Crowd workers rated about 70% of the imitation models\' outputs as equal to or better than ChatGPT\'s.[^7] Targeted benchmarks told a different story. On tasks that the imitation data did not cover heavily, the models closed "little to none" of the gap to ChatGPT, and training on 100k broad ChatGPT outputs gave no gain on Natural Questions, a factual question-answering benchmark. The authors\' explanation is that imitation models are good at copying ChatGPT\'s "style but not its factuality."[^7]',
    },
    {
      type: 'p',
      text: 'This matters for the case files above, because the headline numbers for LIMA and AlpaGasus are preference judgments by people or by GPT-4. AlpaGasus\'s own benchmark table contains a small counterpoint. On MMLU, a knowledge test, the 7B model trained on all 52k scored 40.86 against 38.78 for the filtered 9k, and at 13B it was 47.89 against 46.12.[^4] My reading, not the paper\'s: filtering bought answers that graders prefer, but it did not add knowledge, which is what LIMA\'s hypothesis would predict.',
    },
    {
      type: 'p',
      text: 'The authors of these papers name their own limits. LIMA\'s team says the effort of writing such examples "is significant and difficult to scale up," and that LIMA is less robust than product-grade models.[^1] The phi-1 team names a problem that sits under every filter in this post. Even after building a dataset, "we lack a good methodology to measure and evaluate the amount of diversity and redundancy in the data."[^5] Deduplication thresholds, judge scores, and ROUGE-L cutoffs can each be checked against a number. By the authors\' own account, the question of whether the surviving set is varied enough cannot yet.',
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Zhou et al., LIMA: Less Is More for Alignment, 2023', url: 'https://arxiv.org/abs/2305.11206' },
        { title: 'Wang et al., Self-Instruct: Aligning Language Models with Self-Generated Instructions, 2023', url: 'https://arxiv.org/abs/2212.10560' },
        { title: 'Taori et al., Alpaca: A Strong, Replicable Instruction-Following Model (Stanford CRFM), 2023', url: 'https://crfm.stanford.edu/2023/03/13/alpaca.html' },
        { title: 'Chen et al., AlpaGasus: Training a Better Alpaca with Fewer Data, ICLR 2024', url: 'https://arxiv.org/abs/2307.08701' },
        { title: 'Gunasekar et al., Textbooks Are All You Need, 2023', url: 'https://arxiv.org/abs/2306.11644' },
        { title: 'Lee et al., Deduplicating Training Data Makes Language Models Better, 2022', url: 'https://arxiv.org/abs/2107.06499' },
        { title: 'Gudibande et al., The False Promise of Imitating Proprietary LLMs, 2023', url: 'https://arxiv.org/abs/2305.15717' },
      ],
    },
  ],
};

// Every factual claim below is taken from the numbered sources at the end.
// The case study figure is reproduced under CC BY 4.0 (arXiv 2406.06608).
// Both charts are redrawn from numbers reported in Sclar et al. (arXiv 2310.11324).
export const POST = {
  id: 'context-vs-prompt-engineering',
  title: 'Prompt Wording vs Window Contents: Where the Accuracy Moves',
  excerpt: 'Changing only the separators and spacing of a prompt swung LLaMA-2-7B from 3.6% to 80.4% accuracy on one task. Wording clearly matters. The evidence on what it can and cannot fix, set against what changing the information in the window does, points to where the effort belongs.',
  category: 'AI',
  tags: ['Context Engineering', 'Prompting', 'In-Context Learning'],
  body: [
    {
      type: 'p',
      text: "In 2023 Melanie Sclar and colleagues gave LLaMA-2-7B a classification task from the Super-NaturalInstructions collection. The model read a short passage and had to say which of four kinds of stereotype or anti-stereotype it expressed: gender, profession, race or religion. It saw one worked example first. The researchers then rewrote the template in ways that change nothing a person would notice. They swapped \"Passage: <text>\" for \"PASSAGE: <text>\", took out a colon, and moved a space. Across these equivalent formats, accuracy ran from 0.036 to 0.804.[^1] That is a 77-point swing from punctuation and capital letters.",
    },
    {
      type: 'p',
      text: "Results like this are why prompt engineering exists as a skill. They are also a trap, because they make wording look like the main lever. This post argues in two halves. The first covers what careful wording can and cannot do. The second covers what happens when you change the information the model reads instead. The papers put the two levers in different places.",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Prompt engineering', def: 'Choosing the words, format and technique of the instruction: phrasing, separators, whether to ask for step-by-step reasoning, how examples are laid out. The Prompt Report catalogs 58 text-based prompting techniques.[^2]' },
        { term: 'Context engineering', def: 'Deciding what information fills the context window: instructions, retrieved knowledge, tool definitions, memory, state and the user query, assembled for each request.[^4]' },
        { term: 'Few-shot prompt', def: 'A prompt that includes a handful of solved examples (also called demonstrations or exemplars) before the real input.[^2]' },
        { term: 'Spread', def: "Sclar et al.'s measure: the best accuracy minus the worst accuracy across a set of formats that mean the same thing.[^1]" },
      ],
    },
    {
      type: 'h2',
      text: 'First half: what wording can move',
    },
    {
      type: 'p',
      text: "The opening result is not a one-off. Sclar et al. built a grammar of plausible formats. It varies separators, spacing, casing and the style of list markers, and it only produces formats a human would read the same way. They tested 53 tasks on LLaMA-2 at 7B, 13B and 70B parameters, Falcon-7B, Falcon-7B-Instruct and GPT-3.5.[^1] With just 10 sampled formats per task, the median spread was 7.5 accuracy points. For 20% of tasks it stayed at 15 points or more in every LLaMA-2 setting, and several tasks passed 70 points. The abstract's headline is a difference of up to 76 points for LLaMA-2-13B.[^1] Because only 10 formats were sampled, the authors call these numbers a lower bound.[^1]",
    },
    {
      type: 'p',
      text: "Single edits were enough. In one table, removing the colons from \"passage:{}\\n answer:{}\" moved accuracy on the stereotype task from 0.043 to 0.826. Adding spaces after \"Passage::\" on another task moved it from 0.076 to 0.638.[^1]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Accuracy before and after one formatting change',
      yLabel: 'Accuracy (%)',
      series: [
        { label: 'Format 1', key: 'a', baseline: true },
        { label: 'Format 2 (one change)', key: 'b' },
      ],
      data: [
        { label: 'task280', values: { a: 4.3, b: 82.6 } },
        { label: 'task317', values: { a: 7.6, b: 63.8 } },
        { label: 'task190', values: { a: 36.0, b: 61.4 } },
        { label: 'task904', values: { a: 41.8, b: 61.6 } },
        { label: 'task320', values: { a: 36.1, b: 47.6 } },
        { label: 'task322', values: { a: 61.4, b: 71.4 } },
        { label: 'task279', values: { a: 37.2, b: 44.1 } },
      ],
      caption: 'Redrawn from Table 2 of Sclar et al., 2023.[^1] Each pair differs by one atomic change, such as a separator, a space, casing or item numbering. Accuracy uses probability ranking. task280 is the stereotype task from the opening.',
    },
    {
      type: 'p',
      text: "More scale and more examples did not remove the effect. Spread stayed large when the model grew, when instruction tuning was added, and when examples went from one to five.[^1] With a budget of 40,000 evaluations over 320 formats, 1-shot LLaMA-2-70B had a median spread of 17.1 points across the 53 tasks and a maximum of 87.6. GPT-3.5, scored by exact prefix match because full probabilities were not available, had a median of 6.4 and a maximum of 56.2.[^1]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Spread across 320 formats, 53 tasks',
      yLabel: 'Spread (accuracy points)',
      series: [
        { label: 'LLaMA-2-70B, 1-shot', key: 'l' },
        { label: 'GPT-3.5', key: 'g' },
      ],
      data: [
        { label: 'Median task', values: { l: 17.1, g: 6.4 } },
        { label: 'Top-quartile cutoff', values: { l: 29.2, g: 14.8 } },
        { label: 'Worst task', values: { l: 87.6, g: 56.2 } },
      ],
      caption: 'Redrawn from the values reported in Section 4.5 of Sclar et al., 2023.[^1] LLaMA-2-70B ran in 4-bit and was scored by probability ranking. GPT-3.5 was scored by exact prefix matching, so the two bars are not a strict head-to-head.',
    },
    {
      type: 'p',
      text: "Here is what that means for a person tuning a prompt. First, the format space is not smooth. Sclar et al. built chains of three formats, each one atomic edit from the last, and found accuracy rose or fell steadily along the chain only 32.4% and 33.6% of the time. Random shuffling would give 33.3%.[^1] Hill climbing by small edits is close to a coin toss. Second, a good format is not good in general. Format performance only weakly correlates between models, and for LLaMA-2-13B against 70B, a ranking of at least 2 points flipped with probability 0.141 just by changing the format.[^1] A template tuned by hand on one model is partly tuned to that model's quirks.",
    },
    {
      type: 'p',
      text: "Technique choice is also wording, and it helps less than people expect. The Prompt Report ran six prompting setups on 2,800 MMLU questions with gpt-3.5-turbo. Plain zero-shot scored 0.627. Adding a \"think step by step\" style instruction dropped it to 0.547. Few-shot chain-of-thought did best at 0.692.[^2] The authors say performance generally rose with complexity, but also that some drops were unexplained and that choosing a technique is \"akin to hyperparameter search.\"[^2] The best setup in that table was the one that added worked examples, which is new information in the window rather than a better sentence.",
    },
    {
      type: 'p',
      text: "Some of the instability is not a wording problem at all. Tony Zhao and colleagues showed that GPT-3's few-shot accuracy depends on the format, which examples are chosen and the order they appear in. For a 4-shot SST-2 sentiment prompt on GPT-3 2.7B, changing only the order of the examples moved accuracy from 54.3% to 93.4%.[^3] They traced this to biases in what the model predicts. **Majority label bias** favors the label that appears most in the examples. **Recency bias** favors the labels near the end. A balanced prompt ordered Positive, Positive, Positive, Negative led to nearly 90% Negative predictions.[^3] Their fix, contextual calibration, rewords nothing. It asks the model for its prediction on a content-free input such as \"N/A\", then rescales the output so that input scores evenly across labels. That improved GPT-3 and GPT-2 average accuracy by up to 30.0 points absolute and reduced variance across prompts, which the authors say reduces the need for prompt engineering.[^3]",
    },
    {
      type: 'p',
      text: "So wording can move accuracy a lot, but mostly in ways you cannot predict, that do not transfer across models, and that a calibration step or a wider test can partly cancel. It finds the best format for this model on this task. It does not add anything the model did not already have.",
    },
    {
      type: 'h2',
      text: 'Second half: what changing the information does',
    },
    {
      type: 'p',
      text: "Lingrui Mei and colleagues' survey of more than 1,400 papers gives the second lever a formal shape. In the prompt engineering view, they write, the context was a single static string. Context engineering treats it as separate components gathered and formatted by functions, then combined by an assembly function:[^4]",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} C = \\mathcal{A}(c_{\\text{instr}}, c_{\\text{know}}, c_{\\text{tools}}, \\\\ c_{\\text{mem}}, c_{\\text{state}}, c_{\\text{query}}) \\\\[4pt] |C| \\le L_{\\max} \\end{gathered}',
      caption: 'Equation 2 of Mei et al., 2025,[^4] with the six component types from Section 3.1 written in, and the context length limit from Equation 3.',
    },
    {
      type: 'p',
      text: "The components are system instructions, external knowledge, tool definitions, memory from earlier interactions, the state of the user or world, and the query. In the survey's comparison table, prompt engineering keeps the information content fixed inside the prompt. Context engineering tries to maximize task-relevant information under the length limit.[^4] Only the first component is instruction wording. The other five are about which facts are present.",
    },
    {
      type: 'p',
      text: "The clearest controlled test of that idea keeps the template fixed and changes only which examples go in. Jiachang Liu and colleagues gave GPT-3 Natural Questions with 10 examples per question. Using the 10 training questions closest to the test question in embedding space gave an exact match score of 46.0 on a 100-question sample. Using the 10 farthest gave 31.0.[^5] Their method, KATE, retrieves nearest neighbors as the examples. On the full NQ test set with 64 examples it scored 41.6, against 28.6 for randomly chosen examples.[^5] No word of the instruction changed.",
    },
    {
      type: 'p',
      text: "The Prompt Report's case study shows the same thing in a messier, real setting. Sander Schulhoff, the paper's lead author, spent about 20 hours over 47 recorded steps trying to get an LLM to label Reddit posts for entrapment, a warning sign of suicidal crisis. He worked from 121 labeled development posts and held out 100 for testing.[^2] The first context decision came before any wording. He asked the model what entrapment meant, found its answer did not match the description the coders used, and put that description into every later prompt.[^2]",
    },
    {
      type: 'image',
      src: '/blog-images/context-vs-prompt-engineering/prompt-report-case-study-f1.webp',
      alt: 'Bar chart of F1 scores on the development set for 18 prompts in the order they were tried. Most sit between 0.36 and 0.49. The best, 10-Shot AutoDiCoT, reaches 0.53. Two bars drop far lower: 1-Shot AutoDiCoT with no email at about 0.18 and a 10-shot plus 1-shot variant at about 0.15.',
      width: 1880,
      height: 1700,
      caption: 'F1 for each prompt in the entrapment case study, in the order tried. Teal bars beat the best score so far; red bars did not. Figure 6.6 from Schulhoff et al., 2024,[^2] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: "The largest swings in that figure came from content. At one point the prompt included an email the prompt engineer had received that explained the goals of the project. Removing it dropped F1 from 0.45 to 0.18, and the authors attribute this to the email's richer background on what the labels were for.[^2] Later, taking the email out of the best 10-example prompt dropped F1 from 0.53 to 0.39.[^2] The wording edits were small by comparison. Spelling out Question, Reasoning and Answer instead of Q, R and A cost 0.05.[^2]",
    },
    {
      type: 'p',
      text: "Information changes are not tidy either. The email had been pasted in twice by accident, and removing the duplicate cut F1 by 0.07. Three copies of the full context did not help. Swapping the names in the email for random names cost 0.08.[^2] The authors call prompting \"a difficult to explain black art\" on the strength of the duplication result.[^2] One instruction line, added to stop the model over-labeling posts, told it to count entrapment only when stated explicitly. It stayed in the best prompt, yet the authors later judged it the wrong move, since clinical experts said entrapment is often implicit.[^2] The last run used DSPy, a framework that optimizes prompts automatically. It picked 15 examples and one generated reasoning demonstration, left out both the email and the explicitness instruction, and reached 0.548 F1 on the test set, beating the hand-built prompts.[^2]",
    },
    {
      type: 'p',
      text: "Which part of the added information does the work? Sewon Min and colleagues tested this for examples. Replacing the correct labels in the examples with random ones cost only 0 to 5 points absolute for nearly all of the 12 models they tested, GPT-3 included.[^6] What mattered was that the examples showed the label space, the kind of input text to expect and the overall format. For one family of models, swapping the labels for random English words cost 5 to 16 points compared with random labels drawn from the real label set.[^6] The model uses examples more as a picture of the task than as an answer key.",
    },
    {
      type: 'callout',
      title: "The author's reading: where to spend the effort",
      text: "This is my interpretation of the papers above, not a finding any of them states. Spend effort first on what goes into the window: the definition the model lacks, the background document, examples chosen to resemble the input. Those changes moved results by large amounts in both papers that tested them.[^2,5] Treat formatting as noise to measure, not a dial to turn by hand. Try several equivalent formats and look at the range, as Sclar et al. recommend for evaluations.[^1] Fixed biases can be handled by calibration instead of rewording.[^3] Then test every content change too, because the case study shows content effects can be as unexplainable as formatting ones.[^2]",
    },
    {
      type: 'h2',
      text: 'The limit on the wording evidence',
    },
    {
      type: 'p',
      text: "The strongest evidence for wording sensitivity comes from short prompts. Sclar et al. say in their limitations appendix that they focused on tasks with reasonably short instructions and input fields, and that future work may study how input length affects performance.[^1] Production context windows hold retrieved documents, tool output and conversation history. Nobody in these papers measured whether a 77-point formatting swing survives in a prompt that is mostly content, or shrinks to nothing.",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: "Sclar, Choi, Tsvetkov, and Suhr, Quantifying Language Models' Sensitivity to Spurious Features in Prompt Design, ICLR 2024", url: 'https://arxiv.org/abs/2310.11324' },
        { title: 'Schulhoff et al., The Prompt Report: A Systematic Survey of Prompt Engineering Techniques, 2024', url: 'https://arxiv.org/abs/2406.06608' },
        { title: 'Zhao, Wallace, Feng, Klein, and Singh, Calibrate Before Use: Improving Few-Shot Performance of Language Models, ICML 2021', url: 'https://arxiv.org/abs/2102.09690' },
        { title: 'Mei et al., A Survey of Context Engineering for Large Language Models, 2025', url: 'https://arxiv.org/abs/2507.13334' },
        { title: 'Liu et al., What Makes Good In-Context Examples for GPT-3?, 2021', url: 'https://arxiv.org/abs/2101.06804' },
        { title: 'Min et al., Rethinking the Role of Demonstrations: What Makes In-Context Learning Work?, EMNLP 2022', url: 'https://arxiv.org/abs/2202.12837' },
      ],
    },
  ],
};

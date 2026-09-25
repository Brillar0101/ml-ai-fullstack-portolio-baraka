// Every factual claim below is taken from the numbered sources at the end.
// All three charts are redrawn from table values. Lost in the Middle (arXiv
// 2307.03172) carries the arXiv non-exclusive license and NoLiMa (2502.05167)
// is CC BY-NC-SA, so neither figure is reproduced; RULER's chart is redrawn
// from its Table 3 for consistency.
export const POST = {
  id: 'context-rot',
  title: 'Context Rot: Three Ways a Longer Prompt Loses the Answer',
  excerpt: 'With 20 documents in its prompt, GPT-3.5-Turbo answered 75.8% of questions when the right one came first and 53.8% when it came tenth, below its score with no documents at all. Four papers explain why more context can make answers worse: position, sheer length, and questions that share no words with their answers.',
  category: 'AI',
  tags: ['Context Engineering', 'Long Context', 'Evaluation'],
  body: [
    {
      type: 'p',
      text: "In 2023 a team led by Nelson Liu at Stanford gave gpt-3.5-turbo-0613 a question and 20 Wikipedia passages, about 4,000 tokens in all. Exactly one passage held the answer. When that passage came first, the model answered 75.8% of questions correctly. When it came tenth, accuracy fell to 53.8%. When it came last, accuracy recovered to 63.2%.[^1] The same model with no passages at all, answering from memory, scored 56.1%.[^1] So with the answer sitting in the middle of its prompt, the model did worse than it did with no prompt documents whatsoever.",
    },
    {
      type: 'chart',
      kind: 'line',
      title: 'GPT-3.5-Turbo accuracy vs. where the answer sits among 20 documents',
      xLabel: 'Position of the document with the answer',
      yLabel: 'Accuracy (%)',
      yMax: 80,
      series: [
        { label: 'gpt-3.5-turbo-0613, 20 documents', key: 'a' },
        { label: 'Same model, no documents (closed-book)', key: 'c', dashed: true },
      ],
      data: [
        { x: 1, values: { a: 75.8, c: 56.1 } },
        { x: 5, values: { a: 57.2, c: 56.1 } },
        { x: 10, values: { a: 53.8, c: 56.1 } },
        { x: 15, values: { a: 55.4, c: 56.1 } },
        { x: 20, values: { a: 63.2, c: 56.1 } },
      ],
      caption: 'Redrawn from Table 6 and Table 1 of Liu et al., 2023.[^1] The paper reports five positions (1st, 5th, 10th, 15th, 20th); the lines between them are straight segments, not measurements.',
    },
    {
      type: 'p',
      text: "The authors called this shape a U-shaped performance curve. Models were best with relevant information at the very start of the input, which they call **primacy bias**, or at the very end, **recency bias**, and worst in between.[^1] The paper is titled \"Lost in the Middle,\" and the name stuck.",
    },
    {
      type: 'p',
      text: "Position is one of three separate ways a longer prompt can lose an answer that is plainly inside it. The second is length itself: accuracy falls as the input grows, even when the relevant text is easy to find and the filler is blank space. The third is semantic distance: when the question and the passage that answers it share no words, the drop comes much sooner. Each has its own paper and its own measurements. \"Context rot\" is a popular name for the overall effect rather than a term from these papers; I use it here as shorthand for all three.",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Context window', def: 'The largest number of tokens a model accepts in one request: instructions, pasted documents, conversation history and the question together.' },
        { term: 'Needle in a haystack (NIAH)', def: 'A test that hides one fact (the needle) inside long irrelevant text (the haystack) and asks the model to find it.' },
        { term: 'Distractor', def: 'Text in the prompt that looks related to the question but does not contain the answer.' },
        { term: 'Closed-book', def: 'Asking the model with no documents, so it can only answer from what it learned in training.' },
        { term: 'Literal match', def: 'The question and the passage holding the answer share the same words, so the model can find the passage by matching text.' },
      ],
    },
    {
      type: 'h2',
      text: 'Position: the tenth of twenty documents',
    },
    {
      type: 'p',
      text: "The Lost in the Middle setup is close to how retrieval-augmented generation works in practice. Questions come from NaturalQuestions-Open, real Google searches with answers marked in Wikipedia; the team used 2,655 of them. Each prompt holds the one paragraph containing the answer plus \\(k-1\\) distractor passages of at most 100 tokens, chosen by a retriever (Contriever) as the most relevant passages that do not contain the answer.[^1] Moving the answer passage around changes where the information sits but not what the correct output is. Adding distractors changes the length but not the answer.[^1]",
    },
    {
      type: 'p',
      text: "The U showed up in every model they tested, open and closed: MPT-30B-Instruct, LongChat-13B (16K), GPT-3.5-Turbo and Claude-1.3.[^1] It also got wider with more documents. With 30 documents, GPT-3.5-Turbo (16K) went from 73.4% at position 1 to 50.5% at position 10.[^1] The paper states it directly: in the 20- and 30-document settings, the worst case was below closed-book performance.[^1]",
    },
    {
      type: 'p',
      text: "Bigger windows did not help. GPT-3.5-Turbo has a 4K window and GPT-3.5-Turbo (16K) a 16K one; when the prompt fit in both, their curves were \"nearly superimposed.\" Claude-1.3 and Claude-1.3 (100K) matched the same way.[^1] A bigger window lets a model accept more text. It says nothing about how well the model reads it.",
    },
    {
      type: 'p',
      text: "To rule out reading comprehension as the cause, the authors built a stripped-down test: a JSON object of 75, 140 or 300 key-value pairs, every key and value a random 128-bit UUID, and a request for the value of one key. The task only needs an exact string match. Claude-1.3 did it almost perfectly at every length. GPT-3.5-Turbo, GPT-3.5-Turbo (16K) and MPT-30B-Instruct did worst when the key sat in the middle.[^1]",
    },
    {
      type: 'p',
      text: "Where the bias comes from is less settled. Encoder-decoder models (Flan-T5-XXL, Flan-UL2), whose encoder reads the whole input in both directions, were fairly flat across positions as long as the input stayed within their training length. Flan-UL2 varied by only 1.9 points between best and worst case. Past that length, the U came back.[^1] Instruction tuning was not the cause: base MPT-30B, before any instruction tuning, showed the U too.[^1] In Llama-2, the 7B models were only recency-biased, while the 13B and 70B models showed the full U.[^1] The authors point out that humans do something similar when recalling a list, called the serial-position effect, and that it is surprising in a Transformer, since self-attention can in principle retrieve any token equally well.[^1]",
    },
    {
      type: 'h2',
      text: 'Length: the drop that happens even with nothing in the way',
    },
    {
      type: 'p',
      text: "By 2024, long-context models were routinely scoring almost perfectly on the standard needle-in-a-haystack test. An NVIDIA team led by Cheng-Ping Hsieh argued that this only checks a shallow form of understanding, and built RULER: 13 synthetic tasks at lengths from 4K to 128K tokens, including needles of different types, several needles at once, tracking a variable through a chain of assignments, counting word frequencies, and question answering with distractor paragraphs.[^2] They tested 17 models that all claimed windows of 32K tokens or more.[^2]",
    },
    {
      type: 'p',
      text: "That test gave the field a precise term. RULER defines **effective context length** as the longest tested input at which a model's average score across all 13 tasks still beats a fixed threshold: 85.6%, the score of Llama2-7B at 4K tokens. The **claimed length** is whatever the model's makers advertise.[^2] Measured this way, only half of the models held up at 32K tokens, and almost all fell below the threshold before reaching their claimed length.[^2]",
    },
    {
      type: 'chart',
      kind: 'line',
      title: 'RULER average score (13 tasks) vs. input length',
      xLabel: 'Input length, thousand tokens',
      yLabel: 'Average score (%)',
      yMax: 100,
      series: [
        { label: 'Gemini-1.5-Pro (claims 1M)', key: 'gem' },
        { label: 'GPT-4 (claims 128K)', key: 'gpt4' },
        { label: 'Llama3.1 70B (claims 128K)', key: 'l70' },
        { label: 'Qwen2 72B (claims 128K)', key: 'qw' },
        { label: 'Threshold: Llama2-7B at 4K', key: 't', dashed: true, color: '#888888' },
      ],
      data: [
        { x: 4, values: { gem: 96.7, gpt4: 96.6, l70: 96.5, qw: 96.9, t: 85.6 } },
        { x: 8, values: { gem: 95.8, gpt4: 96.3, l70: 95.8, qw: 96.1, t: 85.6 } },
        { x: 16, values: { gem: 96.0, gpt4: 95.2, l70: 95.4, qw: 94.9, t: 85.6 } },
        { x: 32, values: { gem: 95.9, gpt4: 93.2, l70: 94.8, qw: 94.1, t: 85.6 } },
        { x: 64, values: { gem: 95.9, gpt4: 87.0, l70: 88.4, qw: 79.8, t: 85.6 } },
        { x: 128, values: { gem: 94.4, gpt4: 81.2, l70: 66.6, qw: 53.7, t: 85.6 } },
      ],
      caption: 'Redrawn from Table 3 of Hsieh et al., 2024.[^2] Effective lengths: Gemini-1.5-Pro above 128K, GPT-4 and Llama3.1 70B 64K, Qwen2 72B 32K. The paper evaluates only these six lengths.',
    },
    {
      type: 'p',
      text: "Some drops were steep. DBRX claims 32K and scored 95.1 at 4K but 63.1 at 32K. Mistral-v0.2 7B, also claiming 32K, went from 93.6 to 75.4 at 32K.[^2] Gemini-1.5-Pro was the one model whose effective length exceeded 128K, the longest length they tested.[^2] A closer look at Yi-34B, which claims 200K, found concrete failure modes as inputs grew. Filling the haystack with lookalike needles cut its score by about 40 points at 256K, and it often returned a value from near the target instead of the target itself. On question answering, its accuracy sank toward what it scored with no context at all.[^2] Training on longer sequences did not reliably fix this: a model from the same family trained to 1M tokens was worse at 256K than one trained to 512K.[^2]",
    },
    {
      type: 'p',
      text: "RULER's haystacks are still made of text, though, so any drop could be blamed on noise. A 2025 paper by Yufeng Du and colleagues removed that excuse. They split GSM8K math problems, MMLU questions, HumanEval coding tasks and a simple variable-sum task into evidence and question, and padded the gap between them to a set length. First they checked retrieval as strictly as possible: the model had to recite the evidence word for word. Llama-3.1-8B-Instruct recited it exactly for 970 of 1,000 MMLU problems padded to 30K tokens, as often as it did on the short versions, yet its accuracy dropped by 24.2%.[^3]",
    },
    {
      type: 'p',
      text: "Then they swapped the essay padding for whitespace, which carries almost no information. Performance still fell, by at least 7% for both Llama and Mistral on every task at 30K space tokens, by 48% for Llama on the variable sum, and by 30% for Mistral on GSM8K.[^3] Moving the evidence to sit right before the question, so the distance never changed, still produced drops of up to 20% for Llama and 17% for Mistral.[^3] Finally they masked the padding so the model's attention could not see it at all. Llama-3's variable-sum accuracy still went from 97.0 to 47.0, and its HumanEval score from 57.3 to 7.3, at 30K masked tokens.[^3] The authors' conclusion is that the sheer length of the input alone can hurt performance, independent of retrieval quality and without any distraction.[^3] The closed models they tried (GPT-4o, Gemini-2.0, a Claude model) lost less, and GPT-4o and Gemini-2.0 held a perfect score on the variable sum throughout.[^3]",
    },
    {
      type: 'h2',
      text: 'Semantic distance: when the question shares no words with the answer',
    },
    {
      type: 'p',
      text: "Ali Modarressi and colleagues at LMU Munich and Adobe Research noticed something about the tests above. In almost all of them, the question repeats words from the passage that answers it. They measured this with ROUGE-1 precision, the share of the question's words that also appear in the relevant text: 0.905 for the vanilla NIAH test and 0.571 for RULER's single-needle task.[^4] If the answer can be found by matching text, the benchmark mostly tests matching.",
    },
    {
      type: 'p',
      text: "Their benchmark, NoLiMa (short for No Literal Matching), got that overlap down to 0.069.[^4] A needle reads \"Actually, Yuki lives next to the Semper Opera House.\" The question is \"Which character has been to Dresden?\" To answer, the model has to know that the Semper Opera is in Dresden; no word links the two. Two-hop versions ask about the state of Saxony instead.[^4] The haystacks are snippets of books, filtered to remove words similar to the question and any passage that could be read as a wrong answer.[^4] Each model's **base score** comes from its best results at the shortest lengths (250, 500 and 1K tokens), and NoLiMa counts a length as effective while the score stays above 85% of that base.[^4]",
    },
    {
      type: 'chart',
      kind: 'line',
      title: 'NoLiMa accuracy vs. input length',
      xLabel: 'Input length, thousand tokens',
      yLabel: 'Accuracy (%)',
      yMax: 100,
      series: [
        { label: 'GPT-4o (base 99.3)', key: 'g4o' },
        { label: 'Llama 3.3 70B (base 97.3)', key: 'l33' },
        { label: 'Claude 3.5 Sonnet (base 87.5)', key: 'cs' },
        { label: 'GPT-4o mini (base 84.8)', key: 'mini' },
      ],
      data: [
        { x: 1, values: { g4o: 98.1, l33: 94.2, cs: 85.4, mini: 67.7 } },
        { x: 2, values: { g4o: 98.0, l33: 87.4, cs: 84.0, mini: 58.2 } },
        { x: 4, values: { g4o: 95.7, l33: 81.5, cs: 77.6, mini: 44.2 } },
        { x: 8, values: { g4o: 89.2, l33: 72.1, cs: 61.7, mini: 32.6 } },
        { x: 16, values: { g4o: 81.6, l33: 59.5, cs: 45.7, mini: 20.6 } },
        { x: 32, values: { g4o: 69.7, l33: 42.7, cs: 29.8, mini: 13.7 } },
      ],
      caption: 'Redrawn from Table 3 of Modarressi et al., 2025.[^4] All four models claim at least 128K tokens. Effective lengths under NoLiMa\'s rule: GPT-4o 8K, Claude 3.5 Sonnet 4K, Llama 3.3 70B 2K, GPT-4o mini under 1K.',
    },
    {
      type: 'p',
      text: "All 13 models tested claim at least 128K tokens. At 32K, 11 of them scored half or less of their base score.[^4] GPT-4o went from 99.3 to 69.7.[^4] Llama 3.1 70B, with an effective length of 64K in RULER's table,[^2] has an effective length of only 2K on NoLiMa, where it scored 42.7% at 32K.[^4] The two benchmarks set their thresholds differently, but most of the gap comes from one change: the question no longer gives away where to look.",
    },
    {
      type: 'p',
      text: "The authors checked the literal-match explanation directly with Llama 3.3 70B. When the question named the needle's own keyword, accuracy at 32K was 98.5%. The one-hop version scored 56.2%. Keeping the one-hop question but offering four names to choose from, one of them correct, raised it to 93.1%.[^4] They also looked at position. For one-hop questions they saw a lost-in-the-middle dip at 32K. For two-hop questions, longer inputs pulled the whole curve down toward zero, including at the start and end of the context.[^4] So as questions get harder, length matters more than position.",
    },
    {
      type: 'p',
      text: "Overlap can also point the wrong way. NoLiMa inserted a sentence that contained the question's keyword but had nothing to do with the answer; GPT-4o's effective length fell to 1K.[^4] Freda Shi and colleagues found the same thing at a much smaller scale in 2023. Adding one irrelevant sentence to grade-school math problems dropped code-davinci-002 with chain-of-thought from 95.0% on the clean problems to 72.4%, and only 6.0% of base problems were solved under every distractor variant.[^5] The hardest distractors were on-topic and reused a character's name from the problem.[^5] That is what a retriever tends to return: passages that look like the question.",
    },
    {
      type: 'h2',
      text: 'What the papers found helps',
    },
    {
      type: 'p',
      text: "Shorter prompts. Du et al. had the model first recite the evidence it needed, then answer from a fresh prompt containing only that evidence and the question. On GSM8K padded with essays to 26,250 tokens, Mistral-7B went from 35.5% to 66.7%. On RULER's second QA task, GPT-4o gained up to 4 points, from 68.4 to 72.4 at 32K.[^3] Liu et al. saw the retrieval side of the same point: going from 20 to 50 retrieved documents raised accuracy by only about 1.5 points for GPT-3.5-Turbo and 1 point for Claude-1.3, while making the input much longer.[^1] They suggest reranking, so relevant passages move toward the start, and ranked list truncation, meaning retrieving fewer documents when that is enough. They propose both as promising directions rather than testing them.[^1]",
    },
    {
      type: 'p',
      text: "Telling the model about distractors. In Shi et al., adding \"Feel free to ignore irrelevant information given in the questions\" raised chain-of-thought accuracy from 72.4% to 77.8%. Using worked examples that themselves contained irrelevant sentences raised it to 76.8%, without hurting accuracy on the original clean problems.[^5] Sampling 20 answers and taking the majority vote (self-consistency) raised it to 88.1%.[^5]",
    },
    {
      type: 'p',
      text: "Placing the question before and after the data. For the UUID key-value task this fixed nearly everything: GPT-3.5-Turbo (16K) went to perfect accuracy on 300 pairs, where its worst case had been 45.6%.[^1] RULER found that larger models degraded less. Yi-34B beat Yi-6B at the same 200K training length, both at 4K and in how much it lost as length grew.[^2]",
    },
    {
      type: 'h2',
      text: 'What the papers found does not help, or not enough',
    },
    {
      type: 'p',
      text: "Placing the question on both sides barely changed the multi-document QA curve, raising the first position slightly and lowering the others.[^1] Extended-context versions of the same model read no better.[^1] A longer training context did not reliably help on RULER.[^2] Chain-of-thought helped on NoLiMa but did not close the gap: two-hop accuracy for Llama 3.3 70B at 32K went from 25.9% to 34.3%.[^4] On the ten hardest NoLiMa pairs, reasoning models such as GPT-o1 scored near 100 at short lengths and fell below half of that at 32K; GPT-o1 went from 99.9 to 31.1.[^4] Even the best combination in Shi et al., least-to-most prompting with self-consistency, consistently solved only 45% of base problems across all distractor variants.[^5] And the recite-then-answer trick has a condition its authors spell out: it requires near-perfect retrieval, which is already hard in many real tasks.[^3]",
    },
    {
      type: 'callout',
      title: 'Testing your own pipeline',
      text: "These papers suggest a test for your own pipeline. Put the answer at the first, middle and last position of your real prompt.[^1] Try questions phrased without the document's own words.[^4] Try distractor passages that share the question's words.[^4,5] Report how accuracy changes with length, not one score at one length.[^2]",
    },
    {
      type: 'h2',
      text: 'The number RULER leaves out',
    },
    {
      type: 'p',
      text: "RULER's effective context length is now the usual way to say how much of a window a model can use. Its authors list what it does not measure. RULER reports one number per input length with no breakdown by depth, so it cannot show the lost-in-the-middle effect, and the paper says they plan to add control over where the relevant information goes.[^2] Its tasks were chosen because most models do well on them at 4K, which the authors warn should not be read as proof that models are fine at 4K; other work has found drops at inputs of just a few thousand tokens.[^2] And they did not verify that their synthetic tasks track realistic long-context work, so they recommend treating RULER as a convenient behavioral check, not as a replacement for more realistic evaluations.[^2]",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Liu et al., Lost in the Middle: How Language Models Use Long Contexts, TACL 2024 (arXiv 2023)', url: 'https://arxiv.org/abs/2307.03172' },
        { title: 'Hsieh et al., RULER: What\'s the Real Context Size of Your Long-Context Language Models?, COLM 2024', url: 'https://arxiv.org/abs/2404.06654' },
        { title: 'Du et al., Context Length Alone Hurts LLM Performance Despite Perfect Retrieval, 2025', url: 'https://arxiv.org/abs/2510.05381' },
        { title: 'Modarressi et al., NoLiMa: Long-Context Evaluation Beyond Literal Matching, ICML 2025', url: 'https://arxiv.org/abs/2502.05167' },
        { title: 'Shi et al., Large Language Models Can Be Easily Distracted by Irrelevant Context, ICML 2023', url: 'https://arxiv.org/abs/2302.00093' },
      ],
    },
  ],
};

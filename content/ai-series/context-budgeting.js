// Every factual claim below is taken from the numbered sources at the end.
// The RECOMP pipeline figure is reproduced under CC BY 4.0 (arXiv 2310.04408).
// The two charts are redrawn from Table 2 of LLMLingua (arXiv 2310.05736) and
// Table 1 of Selective Context (arXiv 2310.06201), whose arXiv licenses do not
// allow reuse of the original figures. The 32,000-token worksheet is illustrative.
export const POST = {
  id: 'context-budgeting',
  title: 'Context Budgeting: A Worksheet for What to Keep, Drop, or Compress',
  excerpt: 'LLMLingua cut a 2,366-token math prompt to 117 tokens and GPT-3.5-Turbo lost 1.5 points of accuracy. Here is a token budget worksheet, and what three papers measured for each way of making things fit: dropping, summarizing, and deleting tokens.',
  category: 'AI',
  tags: ['Context Engineering', 'Prompt Compression', 'Tokens'],
  body: [
    {
      type: 'p',
      text: 'In late 2023 a Microsoft team took a chain-of-thought prompt for GSM8K, a benchmark of grade school math word problems,[^5] and squeezed it from 2,366 tokens to 117. The target model was GPT-3.5-Turbo-0301. With the full prompt it answered 78.85% of the test problems exactly right. With the prompt compressed 20 times, it answered 77.33% exactly right.[^1] The paper calls the method LLMLingua, and its conclusion sums the result up as "up to 20x compression with only a 1.5 point performance drop."[^1]',
    },
    {
      type: 'p',
      text: 'The compressed prompt is barely readable. Fragments like "Sam bought a dozen boxes each 30 highl pens inside" survive, and the grammar in between is gone.[^1] The target model still solved the problems. That raises the practical question this post is about. When the window, or the bill, is too small for everything you want to send, what do you cut first, and what does each kind of cut cost you in accuracy?',
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Token', def: 'The unit a model reads and writes, usually a word or a piece of one. Windows, prices, and latency are all counted in tokens.' },
        { term: 'Context window', def: 'The maximum number of tokens a model can take in one call. Everything shares it: instructions, history, documents, tool output, and the reply the model is about to write.' },
        { term: 'Token budget', def: 'The number of tokens you choose to spend per call. It can be smaller than the window because every input token costs money and time.' },
        { term: 'Compression ratio', def: 'Original length divided by compressed length. LLMLingua writes it as \\(1/\\tau\\), where \\(\\tau\\) is the fraction of tokens kept, so keeping 5% of tokens is a 20x ratio.' },
        { term: 'Exact match (EM)', def: 'The share of answers that match the reference answer exactly. It is the accuracy score for GSM8K and the question answering sets below.' },
      ],
    },
    {
      type: 'p',
      text: 'One warning before the numbers: the three main papers here each describe compression differently. LLMLingua reports a ratio such as 20x.[^1] RECOMP reports a compression rate, meaning the percentage of tokens kept, such as 6%.[^3] Selective Context reports a ratio meaning the fraction of content removed, so its "0.5" means half the context is gone.[^2] I convert everything to "share of tokens kept" where it helps the comparison.',
    },
    {
      type: 'h2',
      text: 'The worksheet: one 32,000-token window, five claimants',
    },
    {
      type: 'p',
      text: 'The numbers in this section are mine and purely illustrative. They are not from any paper or product. Say you run a support agent on a model with a 32,000-token window, and you plan every call like a household budget:',
    },
    {
      type: 'ul',
      items: [
        'System instructions: 2,000 tokens. Role, policies, output format. Fixed.',
        'Output reserve: 4,000 tokens. Room for the reply. Fixed, because if the input eats it, the answer gets cut off.',
        'Conversation history: 8,000 tokens. Grows by a few hundred tokens every turn.',
        'Retrieved documents: 12,000 tokens. Varies with the query.',
        'Tool results: 6,000 tokens. Varies wildly; one database dump can blow the whole line.',
      ],
    },
    {
      type: 'p',
      text: 'That adds up to exactly 32,000 tokens with nothing to spare, which is already a mistake, and the papers explain why. LLMLingua\'s authors point out that the small model used for compression and the target model may use slightly different tokenizers, which "may result in an underestimation of the prompt\'s token length."[^1] Your count and the model\'s count can disagree. So the first real line in any budget is slack. Take a few hundred tokens out of retrieval and leave them empty.',
    },
    {
      type: 'p',
      text: 'The more useful idea is that the lines should not be compressed evenly. LLMLingua builds this into its design as a **budget controller**. It treats a prompt as three parts, the instruction, the demonstrations (worked examples), and the question, and gives each its own compression rate. The instruction and the question "have a direct influence on the generated results," so they are compressed lightly, while several demonstrations are likely to repeat each other and absorb most of the cut.[^1] Given an overall target rate \\(\\tau\\), the demonstrations get whatever is left:',
    },
    {
      type: 'eq',
      tex: '\\tau_{\\text{dems}} = \\frac{\\tau L - (\\tau_{\\text{ins}} L_{\\text{ins}} + \\tau_{\\text{que}} L_{\\text{que}})}{L_{\\text{dems}}}',
      caption: 'Equation 2 of Jiang et al., 2023.[^1] Each \\(L\\) is a token count and each \\(\\tau\\) is the fraction of those tokens to keep.',
    },
    {
      type: 'p',
      text: '\\(L\\) is the total prompt length and \\(\\tau L\\) is the whole budget. \\(L_{\\text{ins}}\\), \\(L_{\\text{dems}}\\) and \\(L_{\\text{que}}\\) are the lengths of the instruction, the demonstrations, and the question. In the experiments the instruction kept 85% of its tokens (\\(\\tau_{\\text{ins}} = 0.85\\)) and the question 90% (\\(\\tau_{\\text{que}} = 0.9\\)).[^1] The formula subtracts those protected lines first, then divides what remains among the demonstrations. The ablation shows why this matters. At 5x on GSM8K, the full method scored 79.08. Without the budget controller it scored 73.62, and with the same compression rate for every part it scored 77.26.[^1]',
    },
    {
      type: 'p',
      text: 'On my worksheet, the system instructions and the user\'s current message play the part of LLMLingua\'s instruction and question: protect them. History, retrieved documents, and tool results play the demonstrations. They are long and repetitive, so the cutting happens there, with one of three levers.',
    },
    {
      type: 'h2',
      text: 'Lever 1: drop whole passages the question does not need',
    },
    {
      type: 'p',
      text: 'The bluntest lever is deleting whole passages or sentences that do not help with this particular query. RECOMP, from Fangyuan Xu, Weijia Shi and Eunsol Choi, tests it on retrieval-augmented generation, where documents fetched by a search step are pasted in front of the question. They list three problems with pasting in everything: more tokens to encode, models that "struggle to use all information in the context," and irrelevant documents that confuse the model and lower its scores.[^3] The second is the lost-in-the-middle effect.[^6]',
    },
    {
      type: 'p',
      text: 'Their **extractive compressor** is a 110 million parameter dual encoder, started from the Contriever retrieval model. It embeds the question and each sentence from the retrieved documents separately, then scores each sentence by the inner product of the two embeddings.[^3] The training signal comes from the target model itself: for each training question, the positive sentence is the one that makes the model most likely to produce the right answer when prepended.[^3] So "relevant" here means "helps this model answer," not "looks similar to the question."',
    },
    {
      type: 'p',
      text: 'On open-domain question answering with Flan-UL2 (20 billion parameters) as the reader, pasting in the top 5 documents cost about 660 to 684 tokens per question.[^3] On HotpotQA, where answers need facts from more than one document, the extractive compressor kept two sentences, 75 tokens, and scored 30.40 exact match against 32.80 for the full five documents. That is 11% of the tokens for a 2.4 point loss.[^3] On Natural Questions it kept one sentence, 37 tokens, and scored 36.57 against 39.39.[^3]',
    },
    {
      type: 'p',
      text: 'The headroom is what surprised me. An oracle that picks the single best sentence for each question, which you cannot build in practice, scored 60.22 on Natural Questions with 34 tokens, far above the 39.39 from all five documents.[^3] The paper reads this as evidence that "removing irrelevant information benefit[s] the model."[^3] In a language modeling test with GPT-2, one retrieved document (141 tokens) gave lower perplexity than five (512 tokens), 32.90 against 35.53. "More tokens are not always better," the authors write.[^3]',
    },
    {
      type: 'p',
      text: 'The extreme form of dropping is dropping everything. RECOMP calls it **selective augmentation**: when the retrieved documents are irrelevant or add nothing, the compressor returns an empty string.[^3] Between 4% and 24% of the training examples for the abstractive compressor had an empty target summary, and in the language modeling test the compressor prepended a summary to only 33% of examples.[^3] For a budget, that is the cheapest line item there is. Zero tokens.',
    },
    {
      type: 'p',
      text: 'The conditions matter. Each compressor was trained for one dataset and one reader model. When the question answering compressors were moved to LLaMA-13B, results got worse and sometimes failed to beat simple baselines, though on Natural Questions and TriviaQA they still kept 5% of tokens for less than a 5 point drop.[^3] The extractive version also always kept a fixed number of sentences (one or two). The authors did not try letting it choose how many.[^3]',
    },
    {
      type: 'h2',
      text: 'Lever 2: summarize into fewer, denser tokens',
    },
    {
      type: 'p',
      text: 'Summarizing replaces text with new, shorter text. RECOMP\'s **abstractive compressor** is a 775 million parameter T5-large model trained to write query-focused summaries of the top 5 documents. Its training data came from gpt-3.5-turbo: the larger model wrote candidate summaries, and a summary was kept only if prepending it improved the reader model\'s score. In the language modeling setup, a summary that made the score worse was replaced by the empty string.[^3] This is distillation, a small model trained to copy a large model\'s outputs.',
    },
    {
      type: 'image',
      src: '/blog-images/context-budgeting/recomp-pipeline.webp',
      alt: 'Diagram of RECOMP at inference. The query "when did they stop making the nissan xterra?" goes three ways into a black-box language model: with no retrieval (0 tokens) it answers 2010, marked wrong; with the full retrieved documents (749 tokens) it answers 2015, marked right; and through a compressor that writes a short summary (58 tokens) it also answers 2015, marked right.',
      width: 1650,
      height: 370,
      caption: 'One question, three token budgets: no evidence, 749 tokens of raw documents, or a 58-token summary. Figure 1 from Xu et al., 2023,[^3] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: 'On Natural Questions the abstractive compressor used 36 tokens, about 5% of the full documents, and scored 37.04 exact match against 39.39. On TriviaQA it used 32 tokens and lost 3.7 points (58.68 against 62.37).[^3] On HotpotQA it did worse than the extractive compressor: 64 tokens, 28.20 exact match. The authors say learning an abstractive compressor for tasks like this "demands further study."[^3]',
    },
    {
      type: 'p',
      text: 'Summaries carry a risk that extracted sentences mostly avoid: the summarizer can write something the documents never said. The authors checked 30 summaries per dataset by hand. On Natural Questions, 80% of their compressor\'s summaries were fully faithful to the documents, against 90% for gpt-3.5-turbo. On HotpotQA the figures fell to 67% and 74%.[^3] In one way, though, their summaries helped. When the gold answer was not in the evidence, the reader model still copied an answer span from the evidence 81% of the time with the top 5 documents and 85% of the time with gpt-3.5-turbo summaries. With RECOMP\'s own summaries that fell to 39%.[^3]',
    },
    {
      type: 'p',
      text: 'LLMLingua tested the other obvious approach: ask a strong model to shorten the prompt. With GPT-4 told to compress the GSM8K prompt (the best of ten instruction sets), exact match fell to 56.33 at 20x, against 77.33 for LLMLingua at the same ratio.[^1] The authors suspect GPT-4\'s rewrites left out details of the original, especially reasoning steps, and note that generated text has no controlled length, so hitting a budget can take several tries.[^1] For the worksheet, summarization fits conversation history and long documents, where the gist is what matters. It is a poor fit where the exact steps or exact wording are the point.',
    },
    {
      type: 'h2',
      text: 'Lever 3: delete the tokens a small model could have guessed',
    },
    {
      type: 'p',
      text: 'The third lever works inside sentences. Yucheng Li and colleagues start from the observation that language is redundant, and that some input repeats what the model already learned in pre-training.[^2] Their method, **Selective Context**, runs a small causal language model over the context and scores every token by its self-information, also called surprisal: how unexpected the token was given everything before it. Tokens the small model predicted easily carry little information and are candidates for deletion.[^2]',
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} I(x_i) = -\\log_2 P(x_i \\mid x_0, x_1, \\ldots, x_{i-1}) \\\\[4pt] I(u) = \\sum_{i=t}^{t+\\alpha} I(x_i) \\\\[4pt] C\' = \\{\\, U_i \\mid I(U_i) \\ge I_p \\,\\} \\end{gathered}',
      caption: 'Self-information per token, summed per lexical unit, then filtered at a percentile. Equations 5, 6 and 8 of Li et al., 2023,[^2] with the sum\'s upper limit written as \\(t+\\alpha\\) to match the unit\'s token span.',
    },
    {
      type: 'p',
      text: '\\(x_i\\) is the token at position \\(i\\). \\(P(x_i \\mid x_0, \\ldots, x_{i-1})\\) is the probability the small model gave that token after reading the tokens before it. The negative base-2 logarithm turns that probability into bits: a token predicted with probability 0.5 is worth 1 bit, and one predicted with probability 1/1024 is worth 10 bits. Because information adds up, the score of a **lexical unit** \\(u\\), a phrase or sentence covering tokens \\(x_t\\) to \\(x_{t+\\alpha}\\), is the sum of its token scores.[^2] \\(I_p\\) is the \\(p\\)-th percentile of all unit scores in this context, and the filtered context \\(C\'\\) keeps each unit \\(U_i\\) whose score reaches it. A percentile rather than a fixed threshold lets the cut adapt to each context.[^2]',
    },
    {
      type: 'p',
      text: 'Scoring works best on noun phrases (merged with spaCy), better than on single tokens or whole sentences, and sentence-level filtering was "rather unstable."[^2] And they compute scores one sentence at a time, because they saw the model give later units lower self-information when it read the whole context at once.[^2]',
    },
    {
      type: 'p',
      text: 'They tested it on arXiv papers, BBC News articles, and ShareGPT conversations, all created after March 2023 to keep them out of the models\' training data, with inputs capped at 2,048 tokens.[^2] The conversation task is the closest match to the history line in my worksheet: the model answers the user\'s last message with Selective Context applied to the earlier turns.[^2] Scoring was against the answers each model gave with the full context, so these numbers measure how close the compressed run comes to the uncompressed run, not correctness.[^2]',
    },
    {
      type: 'chart',
      kind: 'line',
      title: 'Selective Context: similarity to full-context answers as more is removed',
      xLabel: 'Share of context removed (%) →',
      yLabel: 'Score (higher is closer)',
      yMax: 1,
      series: [
        { label: 'BERTScore F1', key: 'bs' },
        { label: 'ROUGE-1', key: 'r1' },
        { label: 'BLEU', key: 'bleu', dashed: true },
      ],
      data: [
        { x: 0, values: { bs: 0.909, r1: 0.571, bleu: 0.347 } },
        { x: 20, values: { bs: 0.902, r1: 0.540, bleu: 0.295 } },
        { x: 35, values: { bs: 0.897, r1: 0.504, bleu: 0.243 } },
        { x: 50, values: { bs: 0.887, r1: 0.449, bleu: 0.179 } },
        { x: 65, values: { bs: 0.877, r1: 0.391, bleu: 0.127 } },
        { x: 80, values: { bs: 0.863, r1: 0.311, bleu: 0.070 } },
      ],
      caption: 'Redrawn from Table 1 of Li et al., 2023.[^2] Phrase-level filtering, sampling temperature 0.7, averaged across all tested models. As I read the setup, the 0% point scores new full-context runs against the full-context reference answers, so it marks the ceiling that sampling randomness allows.',
    },
    {
      type: 'p',
      text: 'At half the context removed, BERTScore F1 fell by 0.023 and the paper reports 36% less inference memory and 32% less inference time.[^2] In one case study with Vicuna-13B, memory went from 77,695 MB to 61,885 MB and generation from 110.8 to 76.3 milliseconds per token, while building the compressed context took 46.1 ms.[^2] The softer signs of damage show up in behavior. In a manual check on gpt-3.5-turbo, the model answered "Sorry" to 19 of 200 questions when 65% of the context was removed, and its answers got shorter. Unfaithful statements rose only a little, from 3.8% at a 50% cut to 5.1% at 65%.[^2] The authors judge cuts of 65% and 80% "less valuable."[^2]',
    },
    {
      type: 'p',
      text: 'LLMLingua is the same idea with fixes, and its comparison shows where the plain version breaks. It first drops whole demonstrations using the budget controller, then deletes tokens segment by segment, recomputing each segment\'s probabilities given the already compressed text before it. Selective Context scores each unit as if nothing else had been removed.[^1] On GSM8K, where the prompt is a chain of arithmetic steps, that difference was large.',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'GSM8K exact match under three prompt budgets',
      yLabel: 'Exact match (%)',
      series: [
        { label: 'LLMLingua', key: 'll' },
        { label: 'GPT-4 rewrite', key: 'g4' },
        { label: 'Selective Context', key: 'sc' },
      ],
      data: [
        { label: '1-shot budget', values: { ll: 79.08, g4: 71.87, sc: 53.98 } },
        { label: 'Half-shot budget', values: { ll: 77.41, g4: 68.61, sc: 52.99 } },
        { label: 'Quarter-shot budget', values: { ll: 77.33, g4: 56.33, sc: 44.2 } },
      ],
      caption: 'Redrawn from Table 2 of Jiang et al., 2023.[^1] Target model GPT-3.5-Turbo-0301; LLMLingua and Selective Context both used Alpaca-7B as the small model. Achieved ratios: LLMLingua 5x, 14x, 20x; GPT-4 5x, 11x, 20x; Selective Context 5x, 11x, 15x. The uncompressed 2,366-token prompt scored 78.85.',
    },
    {
      type: 'p',
      text: 'Selective Context scored 44.20 at 15x, 33 points under LLMLingua at 20x. The LLMLingua authors guess that phrase-level scoring "is prone to lose critical reasoning information during the chain-of-thought process."[^1] Their own ablation agrees: without the step-by-step recomputation, LLMLingua fell from 79.08 to 72.93 at 5x.[^1] Simply removing stop words with NLTK got only 1.3x compression.[^1] Latency fell too. On one V100 GPU, the end-to-end time for a GSM8K prompt went from 8.6 seconds uncompressed to 2.3 seconds at 5x, with compression itself taking 0.3 seconds of that.[^1]',
    },
    {
      type: 'p',
      text: 'Token deletion is the lever for the lines my worksheet cannot protect and cannot drop outright: long documents and tool output that you need most of. That last mapping is my reading. None of these papers tested tool results, and JSON or log output may not behave like prose when you delete its low-surprisal tokens.',
    },
    {
      type: 'callout',
      title: 'Reading a compression result before you trust it',
      text: 'Check three things. Which way the ratio is written (kept, removed, or original over compressed). What the score is compared against: task accuracy, as in LLMLingua and RECOMP, or similarity to the uncompressed answer, as in Selective Context. And which model was the target, since RECOMP\'s compressors lost ground when moved to a different reader.[^1,2,3]',
    },
    {
      type: 'h2',
      text: 'Where the papers say the levers stop working',
    },
    {
      type: 'p',
      text: 'Every one of these methods has a cliff. LLMLingua\'s limitations section reports that on GSM8K all methods, its own included, show "a substantial performance drop" at ratios around 25x to 30x, and that the safe upper limit depends on prompt length, task type, and the number of sentences.[^1] Selective Context\'s authors say the best percentile "varies based on specific tasks and context," and that a tool to find it is still missing.[^2] Neither paper gives you a setting you can reuse without testing on your own prompts.',
    },
    {
      type: 'p',
      text: 'The follow-up paper, LongLLMLingua, makes compression depend on the question. On Natural Questions it reports up to 21.4% better performance with about 4x fewer tokens on GPT-3.5-Turbo.[^4] Its limitations section names the cost. Because it is question-aware, "it requires re-compression for different questions, even with the same context, preventing caching of the context," and it roughly doubles LLMLingua\'s compression compute.[^4] That is a real conflict for a budget, because a long document set that stays fixed across calls is exactly what you would want to cache once and reuse. The authors propose moving to task-aware compression to get caching back. As published, though, each new question over the same documents means compressing them again, at twice LLMLingua\'s compute, with nothing carried over from the last call.[^4]',
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Jiang, Wu, Lin, Yang, and Qiu, LLMLingua: Compressing Prompts for Accelerated Inference of Large Language Models, 2023', url: 'https://arxiv.org/abs/2310.05736' },
        { title: 'Li, Dong, Lin, and Guerin, Compressing Context to Enhance Inference Efficiency of Large Language Models (Selective Context), 2023', url: 'https://arxiv.org/abs/2310.06201' },
        { title: 'Xu, Shi, and Choi, RECOMP: Improving Retrieval-Augmented LMs with Compression and Selective Augmentation, 2023', url: 'https://arxiv.org/abs/2310.04408' },
        { title: 'Jiang et al., LongLLMLingua: Accelerating and Enhancing LLMs in Long Context Scenarios via Prompt Compression, 2023', url: 'https://arxiv.org/abs/2310.06839' },
        { title: 'Cobbe et al., Training Verifiers to Solve Math Word Problems (GSM8K), 2021', url: 'https://arxiv.org/abs/2110.14168' },
        { title: 'Liu et al., Lost in the Middle: How Language Models Use Long Contexts, 2023', url: 'https://arxiv.org/abs/2307.03172' },
      ],
    },
  ],
};

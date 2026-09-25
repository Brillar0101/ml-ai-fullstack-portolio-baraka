// Every factual claim below is taken from the numbered sources at the end.
// Both Self-RAG figures are reproduced under CC BY 4.0 (arXiv 2310.11511).
// The FLARE chart is redrawn from Table 1 of arXiv 2305.06983, whose arXiv
// license does not allow reuse. The IRCoT chart is redrawn from Table 4 of
// arXiv 2212.10509.
export const POST = {
  id: 'agentic-rag',
  title: 'Who Decides When to Retrieve? Four Retrieval Policies, From Fixed to Learned',
  excerpt: 'Handed the top retrieved passages, ChatGPT got worse on a health fact-checking benchmark, falling from 70.1% to 54.7%. The fix the research tried was to let something other than the pipeline decide when to search. Here are four answers to that question, each with its trigger rule, its results, and what it costs in retrieval calls.',
  category: 'AI',
  tags: ['RAG', 'Agents', 'Retrieval'],
  body: [
    {
      type: 'p',
      text: "In October 2023 researchers from the University of Washington, the Allen Institute for AI and IBM published a results table with an awkward row in it. ChatGPT, asked to verify public health claims from the PubHealth dataset, scored 70.1% accuracy with no retrieval. Given the same questions with the top retrieved passages placed in front of them, it scored 54.7%.[^1] On TriviaQA the same change took it from 74.3% to 65.7%.[^1] On PopQA's long tail, a set of 1,399 questions about entities whose Wikipedia pages get fewer than 100 views a month, retrieval did the opposite and lifted it from 29.3% to 50.8%.[^1]",
    },
    {
      type: 'p',
      text: "So retrieval is not good or bad in general. It helps when the model lacks the fact and hurts when the passages drag it away from something it already knew. The paper that reported those numbers, Self-RAG, blamed the pipeline shape: standard RAG retrieves a fixed number of passages \"regardless of whether retrieval is necessary, or passages are relevant.\"[^1] Change that and you get what people now call agentic RAG. The system decides for itself when to search and what to search for, instead of searching exactly once, up front, every time.",
    },
    {
      type: 'p',
      text: "\"The system decides\" covers a lot of different designs. They are easier to compare once you ask one narrow question of each: **who decides when to retrieve?** The answers form a spectrum, from a rule fixed before generation starts to a decision the model has been trained to make as it writes.",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Retrieval policy', def: 'The rule that says when the system calls the retriever and what query it sends. Everything in this post is a different policy wrapped around an ordinary retriever and language model.' },
        { term: 'Retrieval call', def: 'One query sent to the search index, returning a handful of passages. Each call also forces the language model to reread its context with the new passages in it, so calls are the main cost to count.' },
        { term: 'Token probability', def: 'The probability the model assigned to the token it actually produced. A low value means the model was unsure at that spot.' },
        { term: 'Multi-hop question', def: 'A question whose answer needs two or more facts, where the second fact can only be looked up once the first is known.' },
      ],
    },
    {
      type: 'diagram',
      essential: true,
      nodes: [
        { label: 'Once, before writing', detail: 'RAG. One call, query = the user input' },
        { label: 'On a fixed clock', detail: 'In-Context RALM every s tokens, IRCoT every reasoning sentence' },
        { label: 'When confidence drops', detail: 'FLARE. Retrieve if any token in the draft sentence has p < θ' },
        { label: 'When the model says so', detail: 'Self-RAG. A trained Retrieve token, fired when p(Yes) > δ' },
      ],
      caption: 'The spectrum this post walks through, left to right. Moving right, the decision moves from the pipeline designer to the model, and the number of retrieval calls stops being fixed in advance.',
    },
    {
      type: 'h2',
      text: 'Always once: the question is the only query',
    },
    {
      type: 'p',
      text: "The original RAG model from Lewis and colleagues is the left end. For an input \\(x\\), a dense retriever finds the top \\(K\\) passages from a 21 million passage index of Wikipedia, and the generator conditions on those passages to write the whole output.[^4] The trigger rule is trivial. Retrieve, once, before the first token, using the input as the query. Cost is one retrieval call per request, which is why it is still the default.",
    },
    {
      type: 'p',
      text: "Its weakness shows up on multi-hop questions. Trivedi and colleagues give the example \"In what country was Lost Gravity manufactured?\" Searching with the question finds the page for the Lost Gravity roller coaster, which does not say where it was made. You first need to learn that Mack Rides built it, and only then can you search for Mack Rides and find Germany.[^3] The second query cannot be written until the first answer exists. No amount of tuning \\(K\\) fixes that.",
    },
    {
      type: 'p',
      text: "FLARE's authors measured the single-shot baseline with GPT-3.5 (text-davinci-003) and BM25 over Wikipedia. On 2WikiMultihopQA it raised exact match from 28.2 with no retrieval to 39.4.[^2] On StrategyQA, a set of yes-or-no questions needing commonsense knowledge, it lowered exact match from 72.9 to 68.6.[^2] That is the same pattern as the ChatGPT row above, found by a different team on a different benchmark.",
    },
    {
      type: 'h2',
      text: 'On a clock: every s tokens, or every sentence',
    },
    {
      type: 'p',
      text: "The next step right keeps the pipeline in charge but has it retrieve repeatedly. In-Context RALM, from AI21 Labs, retrieves once every \\(s\\) generated tokens, a number they call the **retrieval stride**, and uses the last \\(\\ell\\) tokens of the text so far as the query.[^5] For an output of \\(n\\) tokens that is \\(n/s\\) retrieval calls, and the paper states the cost of each: running the retriever, then recomputing the model's representation of the prefix with the new document in it.[^5] Smaller strides gave lower perplexity, so they settled on \\(s = 4\\) as a balance between quality and runtime. RETRO, by comparison, retrieved every 64 tokens, which they found degrades perplexity a lot.[^5]",
    },
    {
      type: 'p',
      text: "A clock based on tokens ignores meaning. It fires in the middle of a phrase whether or not anything new is needed. IRCoT (Interleaving Retrieval with Chain-of-Thought) keeps a fixed schedule but ties it to reasoning steps. It first retrieves \\(K\\) paragraphs using the question. Then it alternates two moves: generate the next sentence of the chain of thought, then use that sentence as the query for \\(K\\) more paragraphs, added to the pile.[^3] It stops when the generated sentence contains \"answer is:\" or after 8 steps, and caps the pile at 15 paragraphs.[^3] A separate reader prompt then answers from everything collected.[^3]",
    },
    {
      type: 'p',
      text: "The trigger is the sentence boundary, and the query is the sentence the model just wrote. In the Lost Gravity example, the first reasoning sentence names Mack Rides, and that sentence retrieves the page that says Germany.[^3] With GPT3 (code-davinci-002) as the reasoner, IRCoT raised recall of the gold paragraphs over one-step retrieval by 11.3, 22.6, 12.5 and 21.2 points on HotpotQA, 2WikiMultihopQA, MuSiQue and IIRC.[^3] In a manual check of 40 questions per dataset, it cut reasoning chains with factual errors by 50% on HotpotQA and 40% on 2WikiMultihopQA compared with one-step retrieval.[^3]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'IRCoT answer F1 with GPT3, by retrieval policy',
      yLabel: 'Answer F1',
      series: [
        { label: 'No retrieval', key: 'nor', baseline: true },
        { label: 'Retrieve once', key: 'oner' },
        { label: 'IRCoT, every sentence', key: 'ircot' },
      ],
      data: [
        { label: 'HotpotQA', values: { nor: 47.5, oner: 53.6, ircot: 60.7 } },
        { label: '2WikiMQA', values: { nor: 41.2, oner: 54.8, ircot: 68.0 } },
        { label: 'MuSiQue', values: { nor: 25.2, oner: 29.4, ircot: 36.5 } },
        { label: 'IIRC', values: { nor: 52.1, oner: 49.8, ircot: 49.9 } },
      ],
      caption: 'Redrawn from Table 4 of Trivedi et al., 2023,[^3] GPT3 rows with the chain-of-thought reader, means over three demonstration sets. On IIRC retrieval did not beat no retrieval; the authors suggest GPT3 may already hold the relevant knowledge.',
    },
    {
      type: 'p',
      text: "The cost is in the schedule. By my count, a question that runs to the 8-step limit costs one retrieval from the question, about one more per reasoning step, and 8 language model calls before the reader runs. The authors say so plainly: IRCoT \"makes a separate call to an (L)LM for each sentence of CoT.\"[^3] It also needs a model that can write chains of thought from a few examples, and a context window long enough to hold all the collected paragraphs plus demonstrations.[^3]",
    },
    {
      type: 'h2',
      text: 'When confidence drops: FLARE\'s probability threshold',
    },
    {
      type: 'p',
      text: "Jiang and colleagues at Carnegie Mellon questioned both halves of the clock design. Retrieving at fixed intervals \"might occur at inappropriate points,\" and a query built from text already written \"might not reflect what LMs intend to generate in the future.\"[^2] Their method, FLARE (Forward-Looking Active REtrieval), looks ahead instead. At each step \\(t\\) it drafts the next sentence without new retrieval, checks how sure the model was about every token in that draft, and retrieves only if some token falls below a threshold.[^2]",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\hat{s}_t = \\mathrm{LM}([x, y_{<t}]) \\\\[6pt] y_t = \\begin{cases} \\hat{s}_t & \\text{if } \\min_{w \\in \\hat{s}_t} p(w) \\ge \\theta \\\\ \\mathrm{LM}([D_{q_t}, x, y_{<t}]) & \\text{otherwise} \\end{cases} \\end{gathered}',
      caption: 'FLARE\'s trigger rule, from Section 3.2.1 of Jiang et al., 2023.[^2]',
    },
    {
      type: 'p',
      text: "Term by term: \\(x\\) is the user input and \\(y_{<t}\\) is everything the system has written so far. \\(\\hat{s}_t\\) is the draft of the next sentence. \\(w\\) ranges over the tokens in that draft, and \\(p(w)\\) is the probability the model gave each one. \\(\\theta\\) is a threshold between 0 and 1. If every token clears it, the draft is kept as the real output \\(y_t\\) and no retrieval happens. If any token falls short, the system builds a query \\(q_t\\) from the draft, retrieves documents \\(D_{q_t}\\), and regenerates the sentence with those documents in front.[^2] Setting \\(\\theta = 0\\) means never retrieving; \\(\\theta = 1\\) means retrieving for every sentence.[^2] The reason to trust token probability at all, in the authors' words, is that large models \"tend to be well-calibrated\" so low confidence \"often indicates a lack of knowledge.\"[^2]",
    },
    {
      type: 'p',
      text: "The query needs care, because the draft may be wrong. If it says Joe Biden attended the University of Pennsylvania, searching with that sentence can pull up misleading pages.[^2] So FLARE either masks out tokens whose probability is below a second threshold \\(\\beta\\), or asks gpt-3.5-turbo to write a question whose answer is the uncertain span, such as \"What university did Joe Biden attend?\"[^2] On 2WikiMultihopQA, querying with the whole draft (\\(\\beta = 0\\)) gave 48.8 exact match and masking at \\(\\beta = 0.4\\) gave 51.0.[^2]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: '2WikiMultihopQA exact match, same model, different retrieval policy',
      yLabel: 'Exact match',
      series: [{ label: 'EM', key: 'em' }],
      data: [
        { label: 'No retrieval', values: { em: 28.2 } },
        { label: 'Once', values: { em: 39.4 } },
        { label: 'Every 16 tokens', values: { em: 43.2 } },
        { label: 'Every sentence', values: { em: 39.0 } },
        { label: 'Sub-questions', values: { em: 47.8 } },
        { label: 'FLARE', values: { em: 51.0 } },
      ],
      caption: 'Redrawn from Table 1 of Jiang et al., 2023.[^2] All rows use text-davinci-003 and BM25; the authors reimplemented each baseline under the same settings, changing only when and what to retrieve. "Every sentence" queries with the previous sentence, in the style of IRCoT. "Sub-questions" uses hand-annotated decomposition examples. FLARE here is the direct variant.',
    },
    {
      type: 'p',
      text: "FLARE beat every baseline on all four of its tasks, with the largest gain on multi-hop QA.[^2] StrategyQA shows the other side of the threshold. There FLARE reached 77.3 exact match against 72.9 with no retrieval, and when the authors swept \\(\\theta\\), performance dropped once more than half the sentences triggered retrieval, which they read as unnecessary retrieval adding noise.[^2] On 2WikiMultihopQA performance plateaued once retrieval passed 60% of sentences. Their overall finding was that retrieving for 40% to 80% of sentences usually worked well, and the thresholds they chose were 0.8 for most datasets and 0.4 for StrategyQA.[^2]",
    },
    {
      type: 'p',
      text: "Cost in calls: the paper reports retrieval firing for 30% to 60% of sentences on average, against every token for kNN-LM, every 4 to 32 tokens for RETRO and In-Context RALM, and every sentence for IRCoT.[^2] That is fewer retrievals than a clock. It is not fewer model calls. Every step drafts a sentence (FLARE generates 64 tokens and keeps the first sentence), and every triggered step generates that sentence a second time.[^2] With explicit queries, each uncertain span also costs a call to gpt-3.5-turbo.[^2] My own note: because the trigger reads token probabilities, FLARE needs a model or API that returns them.",
    },
    {
      type: 'h2',
      text: 'When the model says so: Self-RAG\'s reflection tokens',
    },
    {
      type: 'p',
      text: "FLARE reads a signal the model was never trained to send. Self-RAG, from Asai and colleagues, trains the model to send one. They add special **reflection tokens** to the vocabulary of Llama 2 (7B and 13B) and fine-tune it to write those tokens as part of its normal output, so that deciding to search is just another next-token prediction.[^1] There are four types.",
    },
    {
      type: 'ul',
      items: [
        '**Retrieve**, with values yes, no, or continue. Emitted given the input, or the input plus what has been written so far. It decides whether to call the retriever before the next segment. "Continue" means keep using the passage already retrieved.[^1]',
        '**IsRel**, relevant or irrelevant. Judges whether a retrieved passage gives useful information for the input.[^1]',
        '**IsSup**, fully supported, partially supported, or no support. Judges whether every statement in the output that needs checking is supported by the passage.[^1]',
        '**IsUse**, a score from 5 down to 1. Judges whether the output is a useful response, independent of the passages.[^1]',
      ],
    },
    {
      type: 'image',
      src: '/blog-images/agentic-rag/selfrag-overview.webp',
      alt: 'Two-panel diagram. Left, standard RAG retrieves three documents for "How did US states get their names?" and writes one answer with a contradiction and an unsupported claim. Right, Self-RAG emits a Retrieve token, generates a segment for each passage in parallel, labels each Relevant or Irrelevant and Supported or Partially, and keeps the best. A bottom row shows Self-RAG choosing No Retrieval for a personal essay prompt.',
      width: 1690,
      height: 905,
      caption: 'Standard RAG (left) against Self-RAG (right). The bottom row is the policy difference: for "Write an essay of your best summer vacation," Self-RAG emits No Retrieval and writes directly. Figure 1 from Asai et al., 2023,[^1] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: "Only the Retrieve token decides when to search. The other three decide which output to keep. To make the Retrieve decision tunable, the paper normalizes the token's probability and compares it to a threshold \\(\\delta\\):[^1]",
    },
    {
      type: 'eq',
      tex: '\\frac{p(\\text{Retrieve} = \\text{Yes})}{p(\\text{Retrieve} = \\text{Yes}) + p(\\text{Retrieve} = \\text{No})} > \\delta',
      caption: 'Self-RAG\'s adaptive retrieval rule, Appendix A.3 of Asai et al., 2023.[^1] A larger \\(\\delta\\) means less retrieval.',
    },
    {
      type: 'p',
      text: "When the rule fires, the retriever returns \\(K\\) passages and the model writes one candidate segment per passage, in parallel. Each candidate is scored by its own probability plus a weighted sum of the critique scores, where each score is the normalized probability of the most desirable value (for example, IsRel = relevant).[^1] The defaults were weights of 1.0, 1.0 and 0.5 for IsRel, IsSup and IsUse, a threshold of 0.2 for most tasks, a segment-level beam width of 2, and the top five passages.[^1] The weights can be changed at inference without retraining: raising the IsSup weight improved citation precision on ASQA and lowered fluency as measured by MAUVE.[^1]",
    },
    {
      type: 'p',
      text: "The trigger is learned, so it needs labels. Asai's team prompted GPT-4 to produce reflection tokens for 4,000 to 20,000 examples per type, trained a Llama 2 7B critic on them, and reported over 90% agreement with GPT-4 on most categories.[^1] The critic then inserted reflection tokens into 150,000 instruction-output pairs offline, and the generator was trained on that corpus with the ordinary next-token objective, so no critic runs at inference.[^1]",
    },
    {
      type: 'p',
      text: "Results, from the same Table 2 the opening came from: Self-RAG 13B scored 74.5% on PubHealth, where retrieval-augmented ChatGPT scored 54.7%, and 55.8% on PopQA against 50.8%.[^1] The ablations separate the policy from the training. With the model held fixed, always retrieving and using only the top passage, as standard RAG does, dropped PopQA accuracy from 45.5 to 41.8 for a 7B model trained on 50,000 examples; turning retrieval off dropped it to 24.7.[^1] In a check of correct answers on the open-domain QA sets, only 2% of Self-RAG 7B's answers were missing from the passages it was given, against 15% to 20% for the instruction-tuned baselines.[^1]",
    },
    {
      type: 'image',
      src: '/blog-images/agentic-rag/selfrag-retrieval-threshold.webp',
      alt: 'Two small dual-axis line plots against retrieval threshold from 0 to 0.7. PubHealth: normalized accuracy stays between 0.98 and 1.0 while retrieval frequency falls from 1.0 to 0. PopQA: normalized accuracy and retrieval frequency fall together, frequency ending near 0.2.',
      width: 565,
      height: 615,
      caption: 'Raising \\(\\delta\\) cuts retrieval calls (red) on both datasets, but PopQA pays far more for it in accuracy (blue, normalized). Figure 3c from Asai et al., 2023,[^1] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: "Cost in calls is the part you set. With \\(\\delta\\) near zero the model retrieves for almost every segment; raise it and retrieval frequency falls sharply on both PubHealth and PopQA. The accuracy lost by retrieving less was small on PubHealth and large on PopQA.[^1] That fits the opening numbers, where PopQA was the dataset retrieval helped most. Each call is also more expensive than in the other designs, because one retrieval turns into \\(K\\) parallel generations plus their critique tokens before a segment is chosen.[^1]",
    },
    {
      type: 'callout',
      title: 'Counting calls across the spectrum',
      text: "Retrieve once: 1 retrieval per request.[^4] Fixed stride: \\(n/s\\) retrievals for \\(n\\) output tokens.[^5] IRCoT: one retrieval from the question plus roughly one per reasoning sentence, capped at 8 steps and 15 paragraphs.[^3] FLARE: retrieval on 30% to 60% of sentences, plus a draft for every sentence and a regeneration for every triggered one.[^2] Self-RAG: whatever \\(\\delta\\) makes it, with \\(K\\) candidate generations per retrieval.[^1] Only the first two are known before the request arrives.",
    },
    {
      type: 'h2',
      text: 'What the authors say is still unsolved',
    },
    {
      type: 'p',
      text: "The papers are candid about limits. FLARE gave no significant gains on Wizard of Wikipedia, where outputs average about 20 tokens, or on ELI5, where neither it nor single retrieval beat no retrieval.[^2] Its authors add that a naive implementation, with no caching, has to recompute the model's earlier activations after every retrieval.[^2] IRCoT's authors name the per-sentence model call as their cost and suggest, as future work, \"dynamically deciding when to retrieve more information\", which, in my reading, is what the two designs further right on the spectrum attempt.[^3]",
    },
    {
      type: 'p',
      text: "Self-RAG, the furthest right, gives the model the most say. The model's verdict on its own grounding is also a prediction, though. In the authors' human evaluation of 50 sampled outputs each from PopQA and biography generation, annotators agreed with the model's IsSup labels 90% and 85% of the time.[^1] The paper's closing statement on risk makes the same point without numbers: while the method improves factuality and citation accuracy, \"it can still generate outputs that are not fully supported by the citations.\"[^1]",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Asai, Wu, Wang, Sil, and Hajishirzi, Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection, 2023', url: 'https://arxiv.org/abs/2310.11511' },
        { title: 'Jiang et al., Active Retrieval Augmented Generation (FLARE), EMNLP 2023', url: 'https://arxiv.org/abs/2305.06983' },
        { title: 'Trivedi, Balasubramanian, Khot, and Sabharwal, Interleaving Retrieval with Chain-of-Thought Reasoning for Knowledge-Intensive Multi-Step Questions, ACL 2023', url: 'https://arxiv.org/abs/2212.10509' },
        { title: 'Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, NeurIPS 2020', url: 'https://arxiv.org/abs/2005.11401' },
        { title: 'Ram et al., In-Context Retrieval-Augmented Language Models, TACL 2023', url: 'https://arxiv.org/abs/2302.00083' },
      ],
    },
  ],
};

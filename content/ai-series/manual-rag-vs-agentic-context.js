// Every factual claim below is taken from the numbered sources at the end.
// The Enhanced vs Agentic RAG diagram is reproduced under CC BY 4.0 (arXiv 2601.07711).
// The two charts are redrawn from table values in Jin et al. 2025 (Search-R1)
// and Ferrazzi et al. 2026, since the Search-R1 arXiv license does not allow reuse.
export const POST = {
  id: 'manual-rag-vs-agentic-context',
  title: 'Same Retriever, Different Driver: Fixed RAG Pipelines vs Models That Search',
  excerpt: 'Search-R1 kept the retriever, the corpus and the three passages per call fixed, and changed only who writes the queries. Exact match on seven QA sets went from 0.304 to 0.431. The papers that measured the bill, and the cases where the fixed pipeline still won, tell the rest.',
  category: 'AI',
  tags: ['Context Engineering', 'RAG', 'Agents'],
  body: [
    {
      type: 'p',
      text: "In March 2025 a team from the University of Illinois, UMass Amherst and Google Cloud AI Research ran a comparison where almost everything was held still. Both systems used Qwen2.5-7B. Both searched the same 2018 Wikipedia dump with the same retriever, E5, and both got exactly 3 passages back per retrieval.[^1] E5 is a text embedding model: it turns a query and each passage into a single vector, so the nearest vectors can be looked up as the most relevant passages.[^2] The baseline was plain retrieval-augmented generation (RAG). It took the question, retrieved once, pasted the passages in front of the question, and let the model answer. The other system, Search-R1, let the model write its own search queries in the middle of its reasoning, as many as its budget allowed, after training it with reinforcement learning to do so.[^1]",
    },
    {
      type: 'p',
      text: "Averaged over seven question answering datasets, the RAG baseline scored 0.304 exact match. Search-R1 trained from the base 7B model scored 0.431.[^1] Exact match (EM) is the share of answers that equal the gold answer string, so this is 30.4% of questions right against 43.1%. By my arithmetic that is a 42% relative gain over RAG. The abstract reports 24%, which matches the gap to the paper's strongest baseline, a rejection sampling method at 0.348, rather than to RAG.[^1] The number worth keeping is the raw pair. Same retriever, same corpus, same passage count. The one thing that changed was who decided what went into the context window.",
    },
    {
      type: 'h2',
      text: 'What exactly differs between the two designs',
    },
    {
      type: 'p',
      text: "The phrase \"agentic RAG\" gets used loosely, so it helps to pin both designs down by three questions: what goes in, who writes the query, and how many retrieval calls happen.",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Fixed pipeline (naive RAG)', def: 'The engineer decides everything ahead of time. The user question is the query, one retrieval runs, a fixed number of passages is added to the prompt, and the model generates once. Lewis et al. introduced RAG as a model that pairs a pretrained generator with a dense vector index of Wikipedia reached through a neural retriever.[^3]' },
        { term: 'Enhanced RAG', def: 'Still a fixed sequence, but with extra modules bolted on: a router that decides whether to retrieve at all, a rewriter that reformulates the query, and a reranker that re-sorts retrieved chunks before generation.[^5]' },
        { term: 'Agentic search', def: 'The model decides, token by token, whether to search, what to search for, and when to stop. Retrieval results are appended to its running text and it keeps reasoning over them.[^1,4]' },
        { term: 'Reinforcement learning (RL) here', def: 'Training where the model tries whole question-to-answer episodes, including its searches, and is updated toward the episodes that earned a higher reward. In Search-R1 the reward is only whether the final answer matches the gold answer.[^1]' },
      ],
    },
    {
      type: 'p',
      text: "In Search-R1, the RAG baseline's input is the question plus the top 3 passages for that question: one call, with the query written by nobody but the user. Search-R1's input starts as a short template telling the model it can wrap a query in <search> and </search> tags. When the system sees a closing search tag it pauses generation, runs the query, and inserts the top 3 results between <information> tags. The loop ends when the model writes an <answer>, or when it hits the maximum action budget, which the authors set to 4.[^1] So the agent makes somewhere between zero and four calls, and it writes every query itself.",
    },
    {
      type: 'p',
      text: "There is a second difference that is easy to miss. The RAG baseline ran on the instruction-tuned model with no task training, while Search-R1 was trained with PPO on the merged NQ and HotpotQA training sets.[^1] PPO (proximal policy optimization) is a standard RL algorithm; the paper also tried GRPO. The authors did train other baselines on the same data, including supervised fine-tuning and rejection sampling, to separate the effect of training from the effect of search.[^1] My reading is that the fair comparison to RAG is really \"trained agent\" against \"untrained pipeline\", and the fair test of agency alone is the untrained agents, which come up below.",
    },
    {
      type: 'p',
      text: "Search-o1, from Renmin University of China, is the untrained version of the idea. It gives a reasoning model, QwQ-32B-Preview, instructions to emit a query between special search tokens when it is unsure, retrieves the top 10 results from the Bing Web Search API, and runs a separate pass the authors call Reason-in-Documents that condenses the retrieved pages before they go back into the main reasoning chain.[^4] Its fixed baseline retrieves the top 10 documents for the original question once and puts them next to the question.[^4]",
    },
    {
      type: 'p',
      text: "The third paper frames the question for production systems. Pietro Ferrazzi and colleagues compared an Enhanced RAG pipeline against a single-tool agent built on the PocketFlow framework, where the agent's only choices are to call the RAG tool or to answer. They limited the agent to one tool on purpose, so it would have no abilities the pipeline lacked.[^5] Both used the same embedder, OpenAI's text-embedding-3-small with cosine similarity, and the same pgvector database, so retrieval time and cost were identical in both settings.[^5]",
    },
    {
      type: 'image',
      src: '/blog-images/manual-rag-vs-agentic-context/enhanced-vs-agentic-rag.webp',
      alt: 'Two-panel diagram. Left, Enhanced RAG: a user question passes through a router, a rewriter, a retriever returning three ranked documents, a reranker that reorders them, and a generator, with a dotted path from the router straight to the generator for out-of-scope questions. Right, Agentic RAG: an agent box that at each of n steps chooses between calling a RAG node and going to an answer node, with a loop arrow back to the RAG node labeled n times.',
      width: 1960,
      height: 820,
      caption: 'The two designs Ferrazzi et al. compared. In the pipeline the engineer fixed the order of the modules; in the agent the model chooses each step. Figure 1 from Ferrazzi et al., 2026,[^5] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'h2',
      text: 'Where search paid and where it did not',
    },
    {
      type: 'p',
      text: "Search-R1 reports per-dataset scores. Three of the seven datasets (NQ, TriviaQA, PopQA) are general questions that usually need one fact. The other four (HotpotQA, 2WikiMultiHopQA, Musique, Bamboogle) are multi-hop, meaning the answer needs two or more facts found in sequence. NQ and HotpotQA were the training sets; the other five are out of domain.[^1]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Qwen2.5-7B, exact match by dataset (E5 retriever, 3 passages per call)',
      yLabel: 'Exact match (%)',
      valueLabels: false,
      series: [
        { label: 'RAG (one retrieval)', key: 'rag', baseline: true },
        { label: 'Search-R1, base model', key: 'base' },
        { label: 'Search-R1, instruct model', key: 'inst' },
      ],
      data: [
        { label: 'NQ', values: { rag: 34.9, base: 48.0, inst: 39.3 } },
        { label: 'TriviaQA', values: { rag: 58.5, base: 63.8, inst: 61.0 } },
        { label: 'PopQA', values: { rag: 39.2, base: 45.7, inst: 39.7 } },
        { label: 'HotpotQA', values: { rag: 29.9, base: 43.3, inst: 37.0 } },
        { label: '2Wiki', values: { rag: 23.5, base: 38.2, inst: 41.4 } },
        { label: 'Musique', values: { rag: 5.8, base: 19.6, inst: 14.6 } },
        { label: 'Bamboogle', values: { rag: 20.8, base: 43.2, inst: 36.8 } },
      ],
      caption: 'Redrawn from Table 2 of Jin et al., 2025,[^1] with EM scores multiplied by 100. Both Search-R1 models were trained with PPO; the RAG baseline used the instruct model without task training.',
    },
    {
      type: 'p',
      text: "The gaps are largest on the multi-hop sets. On Musique, RAG got 5.8% and the base Search-R1 model 19.6%; on Bamboogle, 20.8% against 43.2%. On TriviaQA the gap is about five points, and the instruct model barely beat RAG on PopQA (39.7% against 39.2%).[^1] The paper's own case study shows why multiple calls help. Asked which city and state the singer behind the fragrance Curious was born in, the model first searched for the fragrance, learned it was Britney Spears's, then searched for her birthplace and answered McComb, Mississippi. A version trained without search guessed Beyoncé and answered Houston.[^1] A single retrieval on the original question cannot issue that second query, because the name it needs is not in the question.",
    },
    {
      type: 'p',
      text: "Search-o1 reached the same split without any training. With QwQ-32B, its agentic retrieval baseline (the model issues its own queries, no Reason-in-Documents) beat single-shot RAG by 23.2% in average EM on the four multi-hop sets. On the two single-hop sets there was no significant change: 47.8 against 47.6 average EM. The authors' explanation is that those questions need one piece of knowledge and no second retrieval.[^4] The full Search-o1 system beat single-shot RAG with QwQ-32B by 29.6% on multi-hop average EM.[^4]",
    },
    {
      type: 'p',
      text: "Ferrazzi et al. looked at the retrieval steps one at a time. For query rewriting, the agent, which rewrote queries when it chose to, averaged 55.6 NDCG@10 across four datasets against 52.8 for the pipeline that always applied HyDE rewriting.[^5] NDCG@10 scores how well the ten retrieved documents are ranked against the labeled relevant ones, from 0 to 100 here. For picking the final documents, the result flipped. The pipeline with a reranker reached 49.5 NDCG@10 averaged over FiQA and CQADupStack-English, and the agent reached 43.9, below the naive pipeline's 45.5.[^5] The agent chose to retrieve a second time in only 10% of cases, and when it did, 53% of the documents it got back were the same as the first time. The authors conclude that once the model has made a decision it is not likely to reconsider it.[^5]",
    },
    {
      type: 'h2',
      text: 'The bill: calls, tokens, latency and training',
    },
    {
      type: 'p',
      text: "A fixed pipeline makes one retrieval call per question, by design. The agent makes more. SearchAgent-X, an inference system paper that served Search-R1 models, reports an average of 2.717 retrieval calls per question across six datasets, ranging from 2.288 on NQ to 3.247 on Musique.[^6] Search-R1's own training curves show the count of valid searches rising as training goes on; the model learns to call search more.[^1]",
    },
    {
      type: 'p',
      text: "Those extra calls cost more than their retrieval time. In a fixed pipeline all retrieval happens before generation, and retrieval takes milliseconds against seconds for the whole request, so the SearchAgent-X authors found naive RAG insensitive to retrieval latency.[^6] In an agent, retrieval interrupts generation. The paused request can lose its cached attention state (its KV cache) to other requests and must then recompute its whole prefix. When average retrieval time rose from 0.6 to 4.4 seconds, the agents' prefix cache hit rate fell from over 30% to under 21%, while RAG's end-to-end latency stayed largely stable. Under a standard first-come-first-served scheduler, 55.9% of tokens in affected requests were recomputed without need, more than doubling computation time per request.[^6]",
    },
    {
      type: 'p',
      text: "Ferrazzi et al. measured the bill directly, with the retrieval side identical. Averaged over their datasets, the agent used 3.3 times the input tokens, 1.9 times the output tokens and 1.5 times the end-to-end time of the Enhanced pipeline, and up to 3.6 times the input tokens on CQADupStack-English.[^5] The latency gap depended heavily on the model:",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'End-to-end time per FiQA query, same retriever',
      yLabel: 'Seconds',
      series: [
        { label: 'Enhanced RAG', key: 'en', baseline: true },
        { label: 'Agentic RAG', key: 'ag' },
      ],
      data: [
        { label: 'GPT-4.1-nano', values: { en: 9.0, ag: 10.2 } },
        { label: 'Qwen3-0.6B', values: { en: 8.1, ag: 22.1 } },
        { label: 'Qwen3-4B', values: { en: 35.5, ag: 38.6 } },
        { label: 'Qwen3-8B', values: { en: 58.5, ag: 69.9 } },
        { label: 'Qwen3-32B', values: { en: 62.6, ag: 93.8 } },
      ],
      caption: 'Redrawn from Table 9 of Ferrazzi et al., 2026.[^5] Qwen3-0.6B ran without thinking mode. The agent was capped at 3 turns. For the Enhanced pipeline the authors found about 45 to 50% of the time went to generating the answer and a similar share to query rewriting, with 0 to 5% on retrieval.',
    },
    {
      type: 'p',
      text: "Training is a separate bill that only the RL approach pays. Search-R1's PPO runs took 500 steps on a single node of 8 H100 GPUs with a batch size of 512, and every rollout during training calls the search engine live.[^1] The method also needed a fix that plain fine-tuning does not: the retrieved passages sit inside the model's own output sequence, so the authors masked them out of the loss. Without that mask the 7B base model averaged 0.343 EM instead of 0.431.[^1] GRPO, the other RL algorithm they tried, converged faster but showed reward collapse after many steps. When training diverged, they evaluated the most recent stable checkpoint instead of the final one.[^1]",
    },
    {
      type: 'h2',
      text: 'When the fixed pipeline still wins',
    },
    {
      type: 'p',
      text: "The papers report several conditions where the engineer's pipeline did as well or better. I list only what they measured.",
    },
    {
      type: 'p',
      text: "The clearest case is single-fact questions. Search-o1 found no significant gain from agentic retrieval on single-hop QA, and with QwQ-32B the fixed RAG setup scored higher on TriviaQA (65.6 EM against 62.0).[^4] In Search-R1 with Qwen2.5-3B, RAG beat the trained instruct model on NQ (0.348 against 0.341) and PopQA (0.387 against 0.378).[^1]",
    },
    {
      type: 'p',
      text: "Model size matters too. Search-R1's 7B model opened a much wider gap over RAG than its 3B model did, which the authors read as larger models being better at learning to search.[^1] On Bamboogle and Musique, the 3B base model's gains over RAG were under one point (0.088 against 0.080, and 0.049 against 0.047).[^1] Search-o1 found that a model not trained for long reasoning, Qwen2.5-32B-Instruct, did about as well with agentic retrieval as with standard RAG on the GPQA science questions, and worse on math and code. The authors conclude that ordinary LLMs cannot effectively use search as a tool for complex reasoning tasks.[^4]",
    },
    {
      type: 'p',
      text: "Deciding whether to retrieve at all went to the pipeline when the domain was broad. Ferrazzi et al. tested whether each system could tell in-scope questions from out-of-scope ones. On the finance and grammar-forum datasets the agent was slightly better. On FEVER, a fact-checking set with no clear domain boundary, the pipeline's semantic router scored 87.9 F1 and the agent 64.6, because the agent often retrieved when it should not have.[^5]",
    },
    {
      type: 'p',
      text: "For choosing the final documents, as noted above, a dedicated reranker in the pipeline beat the agent's own retrieval choices, 49.5 against 43.9 NDCG@10.[^5]",
    },
    {
      type: 'p',
      text: "Then there is the budget. Every measurement above puts the agent at more tokens and more time for the same retriever.[^5,6] Ferrazzi et al. write that a well-optimized Enhanced RAG can match or exceed Agentic performance while remaining more efficient, and they suggest adding an explicit reranking step to agentic pipelines.[^5]",
    },
    {
      type: 'callout',
      title: 'My reading, not a finding from the papers',
      text: "Across these results, the gain from letting the model search tracks one property of the question: whether the second query depends on what the first one returned. Multi-hop questions have that property and single-fact lookups do not. If most of your traffic is single-fact lookups against a well-scoped corpus, the data here favors a tuned pipeline with a reranker. If questions chain facts, the Search-R1 and Search-o1 multi-hop numbers are the strongest evidence for handing the model the query.",
    },
    {
      type: 'h2',
      text: 'What the comparisons did not measure',
    },
    {
      type: 'p',
      text: "Search-R1's appendix includes a failure it labels as such. Asked for the title of Weezer's debut album, the model sometimes failed to break the question into parts and was misled by irrelevant retrieved passages.[^1] Ferrazzi et al. state the limit of their own cost numbers in a table note: their agent always performed a maximum of 3 turns, and in scenarios requiring more turns, the tokens it consumed would increase. They also note that giving the agent a single tool restricts what their study can say about agents that do more than retrieval.[^5]",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Jin et al., Search-R1: Training LLMs to Reason and Leverage Search Engines with Reinforcement Learning, COLM 2025', url: 'https://arxiv.org/abs/2503.09516' },
        { title: 'Wang et al., Text Embeddings by Weakly-Supervised Contrastive Pre-training (E5), 2022', url: 'https://arxiv.org/abs/2212.03533' },
        { title: 'Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, NeurIPS 2020', url: 'https://arxiv.org/abs/2005.11401' },
        { title: 'Li et al., Search-o1: Agentic Search-Enhanced Large Reasoning Models, 2025', url: 'https://arxiv.org/abs/2501.05366' },
        { title: 'Ferrazzi, Cvjeticanin, Piraccini, and Giannuzzi, Is Agentic RAG worth it? An experimental comparison of RAG approaches, LREC 2026 Industry Day', url: 'https://arxiv.org/abs/2601.07711' },
        { title: 'Yang et al., Demystifying and Enhancing the Efficiency of Large Language Model Based Search Agents (SearchAgent-X), 2025', url: 'https://arxiv.org/abs/2505.12065' },
      ],
    },
  ],
};

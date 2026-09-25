// Every factual claim below is taken from the numbered sources at the end.
// HyDE (arXiv 2212.10496) carries the arXiv non-exclusive license, so its
// tables are redrawn as charts, not reproduced. The Query2doc chart is also
// redrawn from its table values.
export const POST = {
  id: 'hyde',
  title: 'HyDE: Searching With an Answer That Might Be Wrong',
  excerpt: 'In December 2022 a CMU and Waterloo team trained nothing and still nearly matched a retriever fine-tuned on MS MARCO. Their trick was to embed a made-up answer instead of the question. Here is one query followed through every step, then the results, the Query2doc variant, and where the papers say it breaks.',
  category: 'AI',
  tags: ['RAG', 'Retrieval', 'Embeddings'],
  body: [
    {
      type: 'p',
      text: "In December 2022, Luyu Gao, Xueguang Ma, Jimmy Lin and Jamie Callan posted a retrieval paper with an unusual footnote: no models were trained or fine-tuned in making it.[^1] They took two models off the shelf. One was InstructGPT (the text-davinci-003 model), a GPT-3 model tuned to follow instructions.[^1,4] The other was Contriever, a text encoder trained without any relevance labels.[^1,2] On the TREC Deep Learning 2019 web search queries, Contriever alone scored 44.5 nDCG@10. With their method, HyDE, the same Contriever scored 61.3. A Contriever fine-tuned on the MS MARCO training data, which is richly labeled for exactly this kind of search, scored 62.1.[^1]",
    },
    {
      type: 'p',
      text: "The setting matters for reading that number. It is **zero-shot**: HyDE never saw a labeled query-document pair from any test set, and the authors counted the instruction tuning inside InstructGPT as the only supervision anywhere in the system.[^1] They tested on 11 query sets: TREC DL19 and DL20 for web search, six low-resource sets from the BEIR benchmark, and Swahili, Korean, Japanese and Bengali from Mr. TyDi.[^1,7,6] The trick is one sentence long. Ask a language model to write a passage that answers the question, then search with the embedding of that passage instead of the question.",
    },
    {
      type: 'p',
      text: "This post follows one query through that pipeline, using the example the HyDE paper itself prints in its Figure 1.",
    },
    {
      type: 'h2',
      text: 'Why the query needed a stand-in',
    },
    {
      type: 'p',
      text: "**Dense retrieval** turns a query and every document into vectors and ranks documents by the inner product between them. Written out, the score is \\(\\mathrm{sim}(q, d) = \\langle \\mathrm{enc}_q(q), \\mathrm{enc}_d(d) \\rangle\\), where the two encoders map text to vectors of the same size.[^1] The hard part, the HyDE authors argue, sits inside that equation. Both encoders have to land in one space where inner product means relevance, and without relevance judgments to fit, they call learning that space intractable.[^1] A **relevance label** is a human mark saying this document answers this query. MS MARCO's passage task has 503 thousand training queries,[^5] but MS MARCO restricts commercial use, and many real search setups have nothing like it.[^1]",
    },
    {
      type: 'p',
      text: "Contriever came from the other direction. Gautier Izacard and colleagues at Meta AI trained a BERT-base encoder with contrastive learning on documents alone, drawn half from Wikipedia and half from CCNet web text.[^2] To make a training pair, they cut two random spans out of the same document, deleted 10% of the tokens in each, and taught the model to put those two spans close together and spans from other documents far apart.[^2] They call this independent cropping, and they point out that it is symmetric: both sides of a pair come from the same distribution of text.[^2] One encoder embeds queries and documents alike, and a text's vector is the average of the last layer's hidden states.[^2]",
    },
    {
      type: 'p',
      text: "So Contriever learned what makes two pieces of text similar as passages, without ever being taught what makes a passage answer a question. On BEIR it beat BM25 on 11 of 15 datasets by Recall@100, but still trailed BM25 on nDCG@10.[^2] **BM25** is the classic keyword-weighting method that scores documents by shared terms. HyDE's move is to stop asking Contriever to compare a question with a passage at all. It turns the question into a passage first, so the search becomes document against document, the one comparison Contriever was trained for.[^1]",
    },
    {
      type: 'h2',
      text: "Step one: the query and the instruction",
    },
    {
      type: 'p',
      text: "The query in the paper's figure is a real web-search-style question, typed the way people type: **how long does it take to remove wisdom tooth**.[^1] No capital letter, no question mark, missing an article. Before it reaches any index, HyDE wraps it in an instruction. For the web search sets the appendix gives the exact prompt:[^1]",
    },
    {
      type: 'callout',
      title: 'HyDE web search instruction (Appendix A.1.1)',
      text: '"Please write a passage to answer the question. Question: [QUESTION] Passage:" The model continues the text after "Passage:". (Line breaks in the original are shown here as spaces.)',
    },
    {
      type: 'p',
      text: "Each dataset got its own version with a different quantifier. SciFact asks for \"a scientific paper passage to support/refute the claim,\" FiQA for \"a financial article passage,\" TREC-NEWS for \"a news passage about the topic,\" and Mr. TyDi for a passage in Swahili, Korean, Japanese or Bengali \"to answer the question in detail.\"[^1] The instruction is the only place a task description enters the system. The encoder is the same for every dataset.[^1]",
    },
    {
      type: 'h2',
      text: 'Step two: a passage that nobody checked',
    },
    {
      type: 'p',
      text: "InstructGPT then writes the passage, sampled at temperature 0.7, the OpenAI playground default.[^1] For the wisdom tooth query, the snippet the paper shows reads: \"It usually takes between 30 minutes and two hours to remove a wisdom tooth...\"[^1] That is the **hypothetical document**. The authors are blunt about what it is: not real, able to contain factual errors, and likely to be ungrounded.[^1] They only need it to look like a relevant document. In their framing, the language model captures relevance by producing an example of it, which moves relevance modeling out of the encoder and into a generator that follows instructions.[^1]",
    },
    {
      type: 'p',
      text: "This changes what the encoder sees. The raw query is nine words of search shorthand. The draft is fluent prose with a duration, a procedure name and the vocabulary a dental page would use. Whether its two-hour figure is right does not matter yet.",
    },
    {
      type: 'h2',
      text: 'Step three: averaging drafts into one query vector',
    },
    {
      type: 'p',
      text: "A generator samples, so it could write a different passage each time. HyDE treats the query vector as an expected value over those samples. It writes \\(g(q, \\mathrm{INST})\\) for the instruction model's output, calls the Contriever encoder \\(f\\), and estimates the vector by drawing \\(N\\) documents and averaging their embeddings.[^1] The query itself can go into the average as one more hypothesis:[^1]",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\hat{d}_k \\sim g(q, \\mathrm{INST}), \\quad k = 1, \\dots, N \\\\[4pt] \\hat{v}_q = \\frac{1}{N+1} \\Big[ \\sum_{k=1}^{N} f(\\hat{d}_k) + f(q) \\Big] \\end{gathered}',
      caption: 'The HyDE query vector, equation 8 of Gao et al., 2022.[^1] Without the \\(f(q)\\) term and with \\(1/N\\) in front, it becomes equation 7.',
    },
    {
      type: 'p',
      text: "Term by term: \\(q\\) is the query text and \\(\\mathrm{INST}\\) the dataset's instruction. \\(\\hat{d}_k\\) is the \\(k\\)-th generated document, and the hat marks it as generated, not taken from the corpus. \\(N\\) is how many are sampled. \\(f\\) is the unchanged Contriever encoder, the same function that embedded every real document ahead of time. \\(f(q)\\) is the query's own embedding, added so the average has \\(N+1\\) members, which is why the fraction is \\(1/(N+1)\\). The result \\(\\hat{v}_q\\) is a single vector of the same size as every document vector.[^1]",
    },
    {
      type: 'p',
      text: "Averaging comes with an assumption that the paper states outright. Taking a plain expectation assumes the distribution of query vectors is uni-modal, which the authors gloss as \"the query is not ambiguous.\"[^1] The arXiv version does not say in its text what value of \\(N\\) the experiments used.",
    },
    {
      type: 'h2',
      text: 'Step four: the nearest real passage',
    },
    {
      type: 'p',
      text: "HyDE takes the inner product between \\(\\hat{v}_q\\) and every document vector in the corpus and returns the closest ones.[^1] The experiments ran this through the Pyserini toolkit with a standard maximum inner product search index, no special index, no training.[^1] For the wisdom tooth query, the figure's retrieved real document reads: \"How wisdom teeth are removed... Some ... a few minutes, whereas others can take 20 minutes or longer....\"[^1]",
    },
    {
      type: 'p',
      text: "Put the two snippets side by side. The draft says 30 minutes to two hours. The real passage says a few minutes to 20 minutes or longer. My reading is that the draft got the specific numbers wrong and still landed on the right document, which is the behavior the authors designed for. They describe the encoder's dense bottleneck as a lossy compressor: squeezing a passage into one vector filters out the extra, hallucinated details, and the nearest-neighbor search grounds what is left in real documents.[^1] The figure shows the same pattern in Korean. The generated passage dates human use of fire to about 8 million years ago; the retrieved passage says 1.42 million years, in the time of Homo erectus.[^1]",
    },
    {
      type: 'p',
      text: "Note what never got computed. At no point did the system score the query against a document. The authors point this out themselves: with HyDE's factorization, query-document similarity is no longer modeled or computed, and retrieval is split into a generation task and a document-document similarity task.[^1]",
    },
    {
      type: 'h2',
      text: 'What happened across the 11 query sets',
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'nDCG@10', def: 'A score for the top 10 results that rewards putting the most relevant documents highest. Contriever\'s authors describe it as suited to rankings shown to people.[^2]' },
        { term: 'Recall@k', def: 'The share of all relevant documents that appear anywhere in the top k results. Contriever\'s authors use it for retrievers that feed systems like question answering models, which read hundreds of documents and ignore their order.[^2]' },
        { term: 'MRR@100', def: 'The average over queries of 1 divided by the rank of the first relevant result, counting only the top 100. Mr. TyDi\'s baselines are tuned for it, and HyDE reports it for Mr. TyDi.[^6,1]' },
      ],
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Web search, nDCG@10',
      yLabel: 'nDCG@10',
      series: [
        { label: 'TREC DL19', key: 'dl19' },
        { label: 'TREC DL20', key: 'dl20' },
      ],
      data: [
        { label: 'Contriever', values: { dl19: 44.5, dl20: 42.1 } },
        { label: 'BM25', values: { dl19: 50.6, dl20: 48.0 } },
        { label: 'HyDE', values: { dl19: 61.3, dl20: 57.9 } },
        { label: 'Contriever, fine-tuned', values: { dl19: 62.1, dl20: 63.2 } },
      ],
      caption: 'Redrawn from Table 1 of Gao et al., 2022.[^1] The first three use no relevance labels. The last is fine-tuned on MS MARCO, the collection DL19 and DL20 are built on.',
    },
    {
      type: 'p',
      text: "The 2019 track judged 43 test queries over a corpus of 8.8 million passages.[^5] On DL19 HyDE matched the fine-tuned Contriever on precision and beat it on recall@1k, 88.0 against 83.6. On DL20 it fell about 10% short on nDCG@10 and map, with similar recall.[^1] Without HyDE, plain Contriever lost to BM25 on both years. With it, HyDE beat BM25 by about 10 points of nDCG@10 each year.[^1]",
    },
    {
      type: 'p',
      text: "The low-resource BEIR sets told the same story, with one case worth dwelling on. On TREC-COVID, Contriever scored 27.3 nDCG@10 and BM25 59.5. HyDE brought Contriever to 59.3, so BM25 stayed ahead there, but only by 0.2.[^1] The Contriever paper had already given a likely reason for the weak baseline: its training data was collected before the COVID outbreak.[^2] The encoder did not change, so the gain came from a generator that could write COVID-shaped text for it to embed.",
    },
    {
      type: 'p',
      text: "The generator's size mattered. The authors swapped InstructGPT for smaller instruction models, keeping Contriever fixed.[^1]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'HyDE with different generators, nDCG@10',
      yLabel: 'nDCG@10',
      series: [
        { label: 'TREC DL19', key: 'dl19' },
        { label: 'TREC DL20', key: 'dl20' },
      ],
      data: [
        { label: 'No generator', values: { dl19: 44.5, dl20: 42.1 } },
        { label: 'Flan-T5, 11B', values: { dl19: 48.9, dl20: 52.9 } },
        { label: 'Cohere, 52B', values: { dl19: 53.8, dl20: 53.8 } },
        { label: 'InstructGPT, 175B', values: { dl19: 61.3, dl20: 57.9 } },
      ],
      caption: 'Redrawn from Table 4 of Gao et al., 2022,[^1] all using the unsupervised Contriever encoder. Model sizes are the ones the paper reports.',
    },
    {
      type: 'p',
      text: "Every generator helped, and larger ones helped more. The authors add a caution that the Cohere model was experimental and undocumented at the time, so training techniques may explain part of the gap, not size alone.[^1]",
    },
    {
      type: 'h2',
      text: 'Query2doc puts the question back in',
    },
    {
      type: 'p',
      text: "Three months later Liang Wang, Nan Yang and Furu Wei at Microsoft Research published Query2doc, which uses the same kind of generated passage in a different way.[^3] Instead of a zero-shot instruction, they few-shot prompt text-davinci-003: the instruction \"Write a passage that answers the given query:\" followed by 4 labeled query-passage pairs sampled from MS MARCO training data, sampled at temperature 1 with at most 128 tokens.[^3] Their Figure 1 shows the output for \"when was pokemon green released\": a passage saying it came out in Japan on February 27th, 1996.[^3]",
    },
    {
      type: 'p',
      text: "Then they keep the query. For BM25, the new query is the original repeated 5 times and concatenated with the pseudo-document, because the passage is much longer than the query and would otherwise swamp its terms. For dense retrievers, it is the query, a [SEP] token and the passage.[^3] Unlike HyDE, the dense retrievers in Query2doc were trained with the expanded queries, so this is not zero-shot on that side.[^3]",
    },
    {
      type: 'p',
      text: "With no fine-tuning, BM25 plus Query2doc rose from 51.2 to 66.2 nDCG@10 on DL19 and from 47.7 to 62.9 on DL20.[^3] The ablation shows why they kept the query:",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'BM25 query variants in Query2doc, nDCG@10',
      yLabel: 'nDCG@10',
      series: [
        { label: 'TREC DL19', key: 'dl19' },
        { label: 'TREC DL20', key: 'dl20' },
      ],
      data: [
        { label: 'Pseudo-doc only', values: { dl19: 48.7, dl20: 44.5 } },
        { label: 'Query only', values: { dl19: 51.2, dl20: 47.7 } },
        { label: 'Query + pseudo-doc', values: { dl19: 66.2, dl20: 62.9 } },
      ],
      caption: 'Redrawn from Table 4 of Wang et al., 2023.[^3] All three runs use BM25, a keyword retriever, so this does not measure HyDE\'s dense setup directly.',
    },
    {
      type: 'p',
      text: "Alone, the generated passage did worse than the bare query under BM25; together they did far better. The authors read this as the two being complementary.[^3] In the same paper's main table, HyDE appears at the 61.3 and 57.9 it reported for DL19 and DL20, below BM25 plus Query2doc.[^3] Keep the caveat in mind: that comparison mixes a zero-shot dense method with a keyword method whose prompt contains labeled examples. For trained dense retrievers the gains were smaller. DPR went from 33.7 to 35.1 MRR@10 on the MS MARCO dev set, while SimLM and E5, which already distill from a cross-encoder reranker, gained 0.4 and 0.8.[^3]",
    },
    {
      type: 'p',
      text: "Query2doc also states a criticism of HyDE directly: HyDE implicitly assumes the ground-truth document and the pseudo-document express the same meaning in different words, which may not hold for some queries.[^3]",
    },
    {
      type: 'h2',
      text: 'Where the drafts go wrong',
    },
    {
      type: 'p',
      text: "**Hallucinated specifics that do not wash out.** The wisdom tooth example shows the encoder ignoring a wrong number. Query2doc shows the other side. For \"who sings monk theme song,\" the generated passage correctly named Randy Newman and \"It's a Jungle Out There,\" but said the song had been the theme since the 2002 premiere. It was used from season two, in 2003.[^3] The authors call such errors subtle and hard to verify, and a serious obstacle to building trustworthy systems on LLM output.[^3] Retrieval can still work with that passage. A system that shows the passage to a user, or lets it stand in for retrieval, would pass the error along.",
    },
    {
      type: 'p',
      text: "**Languages the models know less well.** The HyDE authors expected trouble here. A small contrastive encoder gets saturated as the number of languages grows, and a large generator can be under-trained on languages with less data than English or French.[^1] On Mr. TyDi, HyDE improved mContriever in all four languages, but in Bengali it scored 41.3 MRR@100 against BM25's 41.8. In Swahili it reached 41.7 while the fine-tuned mContriever reached 51.2.[^1] Their hypothesis is that these languages are under-trained in both pre-training and instruction tuning.[^1]",
    },
    {
      type: 'p',
      text: "**Weak generators and vague instructions.** Query2doc found that texts from smaller models \"tend to be shorter and contain more factual errors.\" The 1.3B babbage model moved BM25 on DL19 only from 51.2 to 52.0.[^3] HyDE trailed the fine-tuned Contriever most clearly on FiQA and DBPedia, financial posts and entities, and its authors blame under-specified instructions.[^1] Query2doc's out-of-domain results were mixed too: with SimLM and E5, SciFact nDCG@10 fell by 2.9 points.[^3]",
    },
    {
      type: 'p',
      text: "**Cost at query time.** Query2doc measured it. Retrieving the top 100 BM25 results took 16 ms of index search. With Query2doc, the LLM call alone took more than 2,000 ms, and the index search rose to 177 ms because the expanded query has many more terms.[^3] HyDE's own conclusion suggests a way to live with this. Use HyDE when a search system is new and has no logs, then roll out a supervised retriever as logs accumulate, sending only rare and emerging queries to the HyDE backend.[^1]",
    },
    {
      type: 'h2',
      text: 'The assumption the paper left open',
    },
    {
      type: 'p',
      text: "Go back to step three. The average in equation 8 makes sense when every sampled draft is a variation on one meaning. If a query could mean two things, the drafts would split between two neighborhoods of the embedding space, and their mean could fall between them, near neither kind of relevant document. That picture is my reading of the equation; the paper does not test it. What the authors do say is that they simply take the expectation, assuming the distribution is uni-modal and the query is not ambiguous, and that \"the study of ambiguous queries and diversity is left to future work.\"[^1]",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Gao, Ma, Lin, and Callan, Precise Zero-Shot Dense Retrieval without Relevance Labels, 2022', url: 'https://arxiv.org/abs/2212.10496' },
        { title: 'Izacard et al., Unsupervised Dense Information Retrieval with Contrastive Learning (Contriever), TMLR 2022', url: 'https://arxiv.org/abs/2112.09118' },
        { title: 'Wang, Yang, and Wei, Query2doc: Query Expansion with Large Language Models, 2023', url: 'https://arxiv.org/abs/2303.07678' },
        { title: 'Ouyang et al., Training Language Models to Follow Instructions with Human Feedback, 2022', url: 'https://arxiv.org/abs/2203.02155' },
        { title: 'Craswell et al., Overview of the TREC 2019 Deep Learning Track, 2020', url: 'https://arxiv.org/abs/2003.07820' },
        { title: 'Zhang, Ma, Shi, and Lin, Mr. TyDi: A Multi-lingual Benchmark for Dense Retrieval, 2021', url: 'https://arxiv.org/abs/2108.08787' },
        { title: 'Thakur et al., BEIR: A Heterogeneous Benchmark for Zero-shot Evaluation of Information Retrieval Models, 2021', url: 'https://arxiv.org/abs/2104.08663' },
      ],
    },
  ],
};

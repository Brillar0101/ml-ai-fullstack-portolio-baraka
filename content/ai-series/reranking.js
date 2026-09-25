// Every factual claim below is taken from the numbered sources at the end.
// None of the anchor papers is under a CC license on arXiv, so both charts are
// redrawn from reported table values instead of reproducing figures.
export const POST = {
  id: 'reranking',
  title: 'Reranking, Read Off the MS MARCO Leaderboard',
  excerpt: 'In January 2019 a BERT reranker took the top of the MS MARCO passage leaderboard with a 27% relative jump in MRR@10, and, as a later paper timed it, about 33 seconds of GPU time per query. The reranking papers that followed are a fight over that bill.',
  category: 'AI',
  tags: ['RAG', 'Reranking', 'Retrieval'],
  body: [
    {
      type: 'p',
      text: "On 13 January 2019 Rodrigo Nogueira and Kyunghyun Cho posted a five-page paper to arXiv describing what they called a simple re-implementation of BERT for passage re-ranking.[^1] The paper reports that it was the top entry on the MS MARCO passage retrieval leaderboard. On the hidden evaluation set it scored an MRR@10 of 35.8. The previous best, an unpublished system called IRNet, had 28.1, and plain BM25 had 16.5. The abstract rounds that gap to a 27% relative improvement.[^1]",
    },
    {
      type: 'p',
      text: "Two details in the paper make the jump stranger. The model saw 12.8 million query and passage pairs during fine-tuning, less than 2% of the training set, in about 30 hours on a TPU v3-8. Training three more days did not move the development score. And a BERT-large trained on only 100,000 pairs, under 0.3% of the data, already beat IRNet by 1.4 points.[^1] My reading is that pretraining had done most of the work before the reranker saw much MS MARCO data at all.",
    },
    {
      type: 'p',
      text: "Every later paper in this post argues, one way or another, with the cost of what Nogueira and Cho built.",
    },
    {
      type: 'h2',
      text: 'What the leaderboard was counting',
    },
    {
      type: 'p',
      text: "MRR@10 is the official MS MARCO metric.[^3] It descends from mean reciprocal rank, which Ellen Voorhees used to score the TREC-8 question answering track in 1999. There, each question got the reciprocal of the rank of the first correct answer among five, or 0 if none of the five was right, and a run's score was the mean over all questions.[^2] MS MARCO keeps the idea and looks at the top ten:",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\mathrm{MRR@10} = \\frac{1}{|Q|} \\sum_{q \\in Q} \\mathrm{RR}_q \\\\[6pt] \\mathrm{RR}_q = \\begin{cases} 1 / r_q & \\text{if } r_q \\le 10 \\\\ 0 & \\text{otherwise} \\end{cases} \\end{gathered}',
      caption: 'Mean reciprocal rank cut off at 10, following the definition in the TREC-8 QA report[^2] with the cutoff MS MARCO uses.[^3]',
    },
    {
      type: 'p',
      text: "\\(Q\\) is the set of test queries and \\(|Q|\\) is how many there are. For one query \\(q\\), \\(r_q\\) is the position of the first relevant passage in the system's ranked list. \\(\\mathrm{RR}_q\\) is its reciprocal rank: 1 if that passage is first, 0.5 if second, 0.1 if tenth, and 0 if it is not in the top ten at all. The papers report it as a percentage, so 35.8 means the average reciprocal rank was 0.358. Voorhees noted that the measure is bounded between 0 and 1 and averages well.[^2]",
    },
    {
      type: 'p',
      text: "The metric only cares about the first hit, and that suits MS MARCO's labels. On average each development query has one passage marked relevant, and some have none, because the corpus was built by annotating the top ten Bing results and BM25 does not always retrieve them.[^1] ColBERT's authors describe the judgments as sparse: one or very few passages marked relevant and none explicitly marked irrelevant.[^3] So an MRR@10 of 35.8 is closer to saying \"the labeled answer usually sits around rank 3\" than to any claim about the whole list. That reading is mine, not the paper's, and it is rough, because a mean of reciprocals hides a lot of spread.",
    },
    {
      type: 'h2',
      text: 'The two stages BERT slotted into',
    },
    {
      type: 'p',
      text: "Nogueira and Cho describe the pipeline in three stages. A standard method such as BM25 fetches a large set of possibly relevant documents, a thousand for example. A more expensive model scores and reorders those. The top ten or fifty then go to whatever produces the answer.[^1] Their paper is only about the middle stage.",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'First-stage retriever', def: 'The cheap model that searches the whole collection and returns a candidate list. Here that is BM25, a scoring function over the words a query and a passage share, served from an inverted index.' },
        { term: 'Reranker', def: 'A second model that scores only the candidates and sorts them again. It never sees the rest of the collection.' },
        { term: 'Cross-encoder', def: 'A reranker that reads the query and one passage together as a single input, so every token of each can attend to every token of the other. It outputs one relevance score per pair.' },
        { term: 'Bi-encoder', def: 'A model that turns the query and each passage into separate vectors and scores them by a similarity such as a dot product. Passage vectors can be computed before any query arrives.' },
      ],
    },
    {
      type: 'p',
      text: "Their reranker is a cross-encoder. The query goes in as BERT's sentence A, truncated to 64 tokens, and the passage as sentence B, truncated so the whole input fits in 512 tokens. The output vector at the [CLS] position feeds a single-layer network that gives the probability that the passage is relevant. Each of the 1,000 passages is scored on its own, and the list is sorted by that probability.[^1] Training used cross-entropy over relevant and non-relevant passages taken from the BM25 top 1,000.[^1]",
    },
    {
      type: 'p',
      text: "The first stage does not have to be word matching. A year later, Karpukhin and colleagues showed that a bi-encoder, the Dense Passage Retriever, beat a strong Lucene BM25 by 9 to 19 points absolute in top-20 retrieval accuracy on open-domain QA sets. On Natural Questions, 78.4% of questions had an answer-bearing passage in DPR's top 20, against 59.1% for BM25, and a FAISS index let it process 995 questions per second.[^4] The same paper states why the cross-encoder stays in the second slot: cross-attention is not feasible for retrieving from a large corpus because it is not decomposable, though it has more capacity than the dual encoder and works well for choosing among a few retrieved candidates.[^4]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'MS MARCO passage re-ranking, MRR@10 on the dev set',
      yLabel: 'MRR@10 (x100)',
      series: [{ label: 'MRR@10 (Dev)', key: 'm' }],
      data: [
        { label: 'BM25', values: { m: 16.7 } },
        { label: 'KNRM', values: { m: 19.8 } },
        { label: 'Duet', values: { m: 24.3 } },
        { label: 'fastText+ ConvKNRM', values: { m: 29.0 } },
        { label: 'BERT-base', values: { m: 34.7 } },
        { label: 'BERT-large', values: { m: 36.5 } },
        { label: 'ColBERT', values: { m: 34.9 } },
      ],
      caption: "Redrawn from Table 1 of Khattab and Zaharia, 2020.[^3] Every neural model re-ranks the same official BM25 top 1,000 per query. The two BERT rows are Nogueira and Cho's models.[^1] Sources do not always agree: Nogueira and Cho list KNRM at 21.8 dev, and ColBERT's table lists BERT-large at 35.9 on eval where the original paper reports 35.8.",
    },
    {
      type: 'h2',
      text: 'The bill: a thousand BERT passes per query',
    },
    {
      type: 'p',
      text: "A cross-encoder cannot reuse anything between candidates. To rank \\(k\\) passages it feeds BERT \\(k\\) separate inputs, each as long as the query plus a passage, and attention cost grows with the square of sequence length.[^3] The work grows linearly with the number of candidates, and each unit of work is a full forward pass.",
    },
    {
      type: 'p',
      text: "Khattab and Zaharia timed it. Re-ranking the BM25 top 1,000 on one Tesla V100 took 10,700 milliseconds per query for BERT-base and 32,900 for BERT-large, at an estimated 97 and 340 trillion FLOPs per query. KNRM, an older neural ranker, took 3 milliseconds.[^3] Their baseline timings count only the scoring on the GPU, not text preprocessing.[^3] They also cite prior work finding that adding as little as 100 milliseconds to response time hurts user experience and can measurably reduce revenue.[^3] Against that margin, a 33 second rerank was far outside what an interactive search system could absorb.",
    },
    {
      type: 'h2',
      text: '2020: ColBERT delays the interaction',
    },
    {
      type: 'p',
      text: "ColBERT, from Omar Khattab and Matei Zaharia at Stanford, keeps BERT but separates the two sides. The query and the document are encoded independently into bags of contextual embeddings, one vector per token. Relevance then comes from a cheap step they call **late interaction**: each query vector finds its most similar document vector, and those maxima are summed.[^3]",
    },
    {
      type: 'eq',
      tex: 'S_{q,d} = \\sum_{i=1}^{|E_q|} \\; \\max_{j=1}^{|E_d|} \\; E_{q_i} \\cdot E_{d_j}^{\\top}',
      caption: 'The late interaction score, equation 3 of Khattab and Zaharia, 2020,[^3] with index ranges written out.',
    },
    {
      type: 'p',
      text: "\\(E_q\\) is the bag of query embeddings and \\(E_d\\) the bag of document embeddings. The query is padded with BERT's [mask] tokens to a fixed \\(N_q = 32\\) vectors, and a linear layer shrinks each vector to \\(m = 128\\) dimensions. Vectors are normalized, so the dot product equals cosine similarity. The inner max is the **MaxSim** operator; it has no trainable parameters.[^3] Because \\(E_d\\) depends only on the document, the whole collection can be encoded offline. The authors indexed MS MARCO's 9 million passages in about three hours on one server with four GPUs.[^3] At query time BERT runs once, on the query alone.",
    },
    {
      type: 'p',
      text: "Re-ranking the same BM25 top 1,000, ColBERT scored 34.9 MRR@10 on both dev and eval in 61 milliseconds, at about 7 billion FLOPs. That is more than 170 times faster than BERT-base and 13,900 times fewer FLOPs, with quality level with Nogueira and Cho's BERT-base and slightly below BERT-large.[^3] Most of the 61 milliseconds is not model work. Query encoding and interaction took 13 milliseconds; the rest went to gathering the stored document embeddings and moving them to the GPU.[^3]",
    },
    {
      type: 'p',
      text: "The gap widens with depth. At \\(k = 10\\) candidates BERT needs nearly 180 times ColBERT's FLOPs; at \\(k = 1{,}000\\), 13,900 times; at \\(k = 2{,}000\\), 23,000 times.[^3] ColBERT's cost grows much more slowly with \\(k\\), in part because it processes the query once no matter how many documents it scores.[^3] Since MaxSim also works with a vector index, ColBERT can do the first stage itself. Retrieving straight from the 8.8 million passages with FAISS gave 36.0 dev MRR@10 in 458 milliseconds, and its recall in the top 50 (82.9%) beat the official BM25's recall in the top 1,000 (81.4%).[^3]",
    },
    {
      type: 'p',
      text: "The price moved to storage. At 128 dimensions and 4 bytes each, the MS MARCO index took 286 GiB. Cutting to 24 dimensions at 2 bytes brought it to 27 GiB, for 33.9 MRR@10 instead of 34.9.[^3]",
    },
    {
      type: 'h2',
      text: '2023: RankGPT hands the whole list to a chat model',
    },
    {
      type: 'p',
      text: "Weiwei Sun and colleagues, at Shandong University, Baidu and Leiden, asked whether ChatGPT and GPT-4 could rerank with no relevance training at all.[^5] Earlier LLM reranking methods either had the model generate the query from each passage or asked it for a relevance judgment per passage. The authors say these had limited performance and relied on access to the log-probabilities of the model's output, which rules out models like GPT-4.[^5] Their alternative is **permutation generation**. The prompt holds a group of passages tagged [1], [2] and so on, and the model writes the order it prefers, such as [2] > [3] > [1]. No score is produced.[^5]",
    },
    {
      type: 'p',
      text: "A prompt can only hold so many passages, so they rerank with a **sliding window** that moves from the back of the list to the front. Given \\(M\\) candidates, window size \\(w\\) and step \\(s\\), the model first orders passages \\(M - w\\) through \\(M\\), then the window shifts up by \\(s\\), and so on until the top is done.[^5] The windows overlap, so the best passages from one window are carried into the next. My reading of the mechanism is that a strong passage found deep in the list can climb all the way to the top in a single pass, because it keeps winning its way into the next window.",
    },
    {
      type: 'diagram',
      nodes: [
        { label: 'Window 1', detail: 'rank passages 5 to 8' },
        { label: 'Window 2', detail: 'passages 3 to 6, including the top 2 from window 1' },
        { label: 'Window 3', detail: 'passages 1 to 4, including the top 2 from window 2' },
      ],
      caption: 'The toy example from Figure 3 of Sun et al.:[^5] 8 passages, window size 4, step size 2, processed back to front. Their benchmark runs used 100 BM25 passages with a window of 20 and a step of 10.',
    },
    {
      type: 'p',
      text: "RankGPT reports nDCG@10, a different top-ten metric that credits every relevant passage in the list rather than only the first, on different test sets, so its numbers are not on the MS MARCO scale above.[^5] On the TREC Deep Learning 2019 and 2020 test sets, which have 43 and 54 queries, the systems below all reranked the same BM25 top 100.[^5] GPT-4 reached 75.59 and 70.56. monoT5 with 3 billion parameters, the strongest supervised baseline, had 71.83 and 68.89, and the original monoBERT had 70.50 and 67.28. gpt-3.5-turbo, at 65.80 and 62.91, fell below both supervised models on TREC.[^5] Averaged over eight BEIR datasets, GPT-4 scored 53.68 against monoT5's 51.36, but to save money there it only reordered the top 30 passages that gpt-3.5-turbo had already reranked.[^5]",
    },
    {
      type: 'p',
      text: "The cost section of the appendix is where the leaderboard history loops back. Reranking 100 passages takes 10 API calls per query. At average call latencies of about 1.1 seconds for gpt-3.5-turbo and 3.2 seconds for GPT-4, that is 11 and 32 seconds per query. GPT-4 cost $0.596 per query, or $0.098 when used only on the top 30.[^5] The authors write that ChatGPT and GPT-4 are too expensive to deploy in commercial search systems, and that reranking with GPT-4 would greatly increase latency.[^5]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Reported reranking time per query',
      yLabel: 'Seconds per query',
      series: [{ label: 'Seconds', key: 's' }],
      data: [
        { label: 'BERT-base (1,000 cand.)', values: { s: 10.7 } },
        { label: 'BERT-large (1,000 cand.)', values: { s: 32.9 } },
        { label: 'ColBERT (1,000 cand.)', values: { s: 0.061 } },
        { label: 'gpt-3.5-turbo (100 cand.)', values: { s: 11 } },
        { label: 'GPT-4 (100 cand.)', values: { s: 32 } },
      ],
      caption: "Redrawn from Table 1 of Khattab and Zaharia, 2020,[^3] and Appendix H of Sun et al., 2023.[^5] The setups are not directly comparable. The first three rows re-rank 1,000 MS MARCO candidates on one V100 GPU and exclude first-stage time. The LLM rows re-rank 100 TREC candidates through the OpenAI API, so they include network and service latency, which the authors note varies with API version and network conditions.",
    },
    {
      type: 'p',
      text: "Their answer to the cost was to go back to a cross-encoder. They had ChatGPT order 20 BM25 candidates for each of 10,000 MS MARCO training queries and trained a 435 million parameter DeBERTa-large cross-encoder to match those orderings with a pairwise RankNet loss.[^5] It averaged 53.03 nDCG@10 on BEIR, above monoT5 3B's 51.36 and above its teacher ChatGPT's 49.37. The same model trained on MS MARCO's own labels averaged 42.64.[^5] The authors suggest ChatGPT's judgments may be more comprehensive than MS MARCO's labels, and that the student beats its teacher because it ranks more stably. ChatGPT, they found, is very unstable at generating permutations.[^5]",
    },
    {
      type: 'h2',
      text: 'The ceiling a reranker cannot raise',
    },
    {
      type: 'p',
      text: "One ablation in RankGPT points at what all three systems share. With the BM25 order as input, gpt-3.5-turbo reached 65.80 nDCG@10 on TREC-DL19. Shuffle the same 100 candidates randomly and it fell to 25.17; reverse the BM25 order and it scored 32.77.[^5] The authors' explanation is that BM25 gives a fairly good starting order, which lets a single pass of the sliding window produce good results.[^5]",
    },
    {
      type: 'p',
      text: "Their limitations section states it outright. Because the study only examines reranking, the upper bound of the ranking effect depends on the recall of the initial retrieval, and the LLM's reranking is highly sensitive to the initial order of passages, which usually comes from a first-stage retriever such as BM25.[^5] Nogueira and Cho ran into the recall half of this in 2019: some MS MARCO queries have relevant passages that BM25 never retrieved, and no reranker in their setup could have put those in the top ten.[^1]",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Nogueira and Cho, Passage Re-ranking with BERT, 2019', url: 'https://arxiv.org/abs/1901.04085' },
        { title: 'Voorhees, The TREC-8 Question Answering Track Report, 1999', url: 'https://trec.nist.gov/pubs/trec8/papers/qa_report.pdf' },
        { title: 'Khattab and Zaharia, ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT, SIGIR 2020', url: 'https://arxiv.org/abs/2004.12832' },
        { title: 'Karpukhin et al., Dense Passage Retrieval for Open-Domain Question Answering, 2020', url: 'https://arxiv.org/abs/2004.04906' },
        { title: 'Sun et al., Is ChatGPT Good at Search? Investigating Large Language Models as Re-Ranking Agents, 2023', url: 'https://arxiv.org/abs/2304.09542' },
      ],
    },
  ],
};

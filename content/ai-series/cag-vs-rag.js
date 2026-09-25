// Every factual claim below is taken from the numbered sources at the end.
// All three charts are redrawn from table values in Chan et al. 2024 and
// Li et al. 2024. The response-time totals are the author's sums of the
// retrieval and generation columns in Chan et al. Table 3.
export const POST = {
  id: 'cag-vs-rag',
  title: 'CAG vs RAG, Read Off the Tables of Three Papers',
  excerpt: 'Preloading 85k tokens of HotPotQA into a precomputed KV cache cut answer time from 92 seconds to 2.3 on Llama 3.1 8B. On that same test set, plain BM25 retrieval scored higher. A head-to-head readout of what three papers measured, and where each approach won.',
  category: 'AI',
  tags: ['RAG', 'CAG', 'KV Cache', 'Long Context'],
  body: [
    {
      type: 'p',
      text: "In a December 2024 paper titled \"Don't Do RAG,\" Brian Chan and colleagues loaded 64 HotPotQA documents, about 85,000 tokens, into Llama 3.1 8B running on eight 32 GB Tesla V100 GPUs, and asked it 1,344 questions about them.[^1] When the model had to read all 85,000 tokens fresh with each question, generation took 92.08 seconds per question. When the same text had been run through the model once in advance and its key-value cache saved, generation took 2.26 seconds.[^1] That forty-fold drop is the case for **cache-augmented generation**, or CAG.",
    },
    {
      type: 'p',
      text: "The same paper has a second number the title does not advertise. On that 64-document set, the answers from the preloaded model scored a BERTScore of 0.7407. A simple BM25 keyword retriever feeding the model its top 5 passages scored 0.7535. At top-3 it scored 0.7463 and answered in 0.67 seconds.[^1] At the largest size they tested, the plain retrieval baseline was both better and faster. This post reads the tables of three papers side by side to see which conditions produced which result.",
    },
    {
      type: 'h2',
      text: 'Setup: what each paper actually put against what',
    },
    {
      type: 'p',
      text: "The three papers do not run the same contest, so it helps to pin down the words first.",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'RAG (retrieval-augmented generation)', def: 'A retriever searches a document store for each query and passes only the top few matching passages to the language model. In the original 2020 formulation, the store was a dense vector index over 21 million 100-word chunks of Wikipedia.[^5]' },
        { term: 'Long context (LC)', def: 'Give the model the whole document or collection in the prompt and let its attention find what matters. No retriever.' },
        { term: 'KV cache', def: 'The key and value vectors a transformer computes for every token it has read, kept so later tokens can attend to them without recomputing them.' },
        { term: 'CAG (cache-augmented generation)', def: 'Long context with the KV cache for the documents computed once, saved, and reused for every query, so only the query and answer tokens are processed at question time.[^1]' },
        { term: 'Top-k', def: 'How many retrieved passages RAG hands the model. Every paper here varies it.' },
      ],
    },
    {
      type: 'p',
      text: "**Chan et al. (2024)** is the only paper of the three that tests CAG as defined above. They write it as \\(C_{KV} = \\text{KV-Encode}(D)\\): the collection \\(D\\) is encoded once, and each answer is generated as \\(M(q \\mid C_{KV})\\). After a query, the cache is reset by truncating the query tokens that were appended to it.[^1] The model was Llama 3.1 8B for every system. The baselines were built in LlamaIndex: sparse RAG with BM25 and dense RAG with OpenAI embedding indexes, each at top-1, 3, 5 and 10. They sampled SQuAD 1.0 and HotPotQA into three sizes. HotPotQA ran 16, 32 and 64 documents (21k, 43k and 85k tokens). SQuAD ran 3, 4 and 7 documents (21k, 32k and 50k tokens) with 500 questions each. Answers were scored with BERTScore, which measures how similar the generated answer is to the reference answer, not whether it is exactly right.[^1]",
    },
    {
      type: 'p',
      text: "**Xu et al. (2023)**, from NVIDIA, asked an older version of the question: retrieval with a short window, or a longer window without retrieval? They used a proprietary 43B GPT and Llama2-70B, both pretrained with a 4K window, and stretched the windows with positional interpolation followed by fine-tuning: GPT-43B to 16K, Llama2-70B to 16K and 32K.[^2] They chunked each document into 300-word pieces and retrieved with Dragon, Contriever or OpenAI embeddings. The top 5 chunks averaged about 2,000 to 2,500 tokens, while average document length ran from 4,912 tokens (Qasper) to 84,770 (NarrativeQA). There were seven zero-shot tasks: query-based summarization, single-document QA and multi-hop QA.[^2] The no-retrieval baselines had documents truncated to fit the window. No KV cache was precomputed.[^2]",
    },
    {
      type: 'p',
      text: "**Li et al. (2024)**, from Google DeepMind and the University of Michigan, repeated the comparison with stronger models: Gemini-1.5-Pro (up to 1 million tokens), GPT-4O (128k) and GPT-3.5-Turbo (16k). They copied Xu's retrieval setup, with 300-word chunks and top-5 by default from Contriever or Dragon.[^3] The tasks were seven LongBench datasets averaging 3,599 to 18,395 words of context, plus two ∞Bench sets, En.QA and En.MC, averaging over 140,000 words. They also proposed **Self-Route**. The model first sees only the retrieved chunks and is told to answer or write \"unanswerable.\" Only the queries it declines go on to the full context.[^3]",
    },
    {
      type: 'h2',
      text: 'Results, with the numbers on the chart',
    },
    {
      type: 'p',
      text: "On HotPotQA, Chan's preloaded model beat the best retrieval setting at the small and medium sizes, and fell just below both baselines at the large size.",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'HotPotQA BERTScore: CAG vs the best top-k of each RAG baseline',
      yLabel: 'BERTScore',
      series: [
        { label: 'Sparse RAG (BM25, best k)', key: 's', baseline: true },
        { label: 'Dense RAG (best k)', key: 'd' },
        { label: 'CAG', key: 'c' },
      ],
      data: [
        { label: 'Small, 21k tokens', values: { s: 0.7676, d: 0.7582, c: 0.7951 } },
        { label: 'Medium, 43k tokens', values: { s: 0.7633, d: 0.7432, c: 0.7821 } },
        { label: 'Large, 85k tokens', values: { s: 0.7535, d: 0.7409, c: 0.7407 } },
      ],
      caption: 'Redrawn from Table 2 of Chan et al., 2024.[^1] For each RAG baseline the best of top-1, 3, 5 and 10 is shown: top-5 for sparse, top-3 for dense, at every size. All systems used Llama 3.1 8B. The whole spread sits between 0.74 and 0.80.',
    },
    {
      type: 'p',
      text: "The gap shrinks as the collection grows. It goes from +0.028 over sparse RAG at 21k tokens, to +0.019 at 43k, to −0.013 at 85k (the subtraction is mine). The authors link the narrowing to earlier findings that long-context models degrade on very long inputs.[^1] Their own introduction gives a figure that fits: it puts the effective context length of Llama 3.1 8B at 32K tokens, even though the model was trained at 128K.[^1] Two of the three HotPotQA sizes sit above that figure. SQuAD behaved better for CAG: 0.7695, 0.7383 and 0.7734 against best-RAG scores of 0.7616, 0.7310 and 0.7658.[^1] Chan and colleagues also flag a warning about their own benchmark. Sparse retrieval beating dense retrieval, they write, suggests the datasets may not be hard enough to need deeper semantic search.[^1]",
    },
    {
      type: 'p',
      text: "Xu et al. found something that sounds opposite at first. Retrieval with a 4K window nearly matched a 16K window without retrieval: 29.32 against 29.45 average for GPT-43B, and 36.02 against 36.78 for Llama2-70B.[^2] Retrieval on top of the longest window did best of all. Llama2-70B at 32K with retrieval averaged 39.60, against 37.36 without, and the paper reports it can be 4 times faster at generation on NarrativeQA than the non-retrieval 32K model.[^2]",
    },
    {
      type: 'p',
      text: "Li et al., a year later with frontier API models, reversed Xu's headline. Long context beat RAG on average for every model. They put the difference down to stronger models and longer contexts.[^3]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Average score over nine datasets: full context vs top-5 RAG vs Self-Route',
      yLabel: 'Average score',
      series: [
        { label: 'RAG (top-5)', key: 'r', baseline: true },
        { label: 'Long context', key: 'l' },
        { label: 'Self-Route', key: 's' },
      ],
      data: [
        { label: 'Gemini-1.5-Pro', values: { r: 37.33, l: 49.70, s: 46.41 } },
        { label: 'GPT-4O', values: { r: 32.60, l: 48.67, s: 48.89 } },
        { label: 'GPT-3.5-Turbo', values: { r: 30.33, l: 32.07, s: 35.32 } },
      ],
      caption: 'Redrawn from Table 1 of Li et al., 2024,[^3] Contriever retriever. Scores are F1 for open QA, accuracy for multiple choice and ROUGE for summarization, averaged over seven LongBench and two ∞Bench datasets.',
    },
    {
      type: 'p',
      text: "The more useful finding in Li is how often the two methods agreed. For 63% of queries, the RAG and long-context predictions were exactly the same, and they matched on wrong answers as well as right ones.[^3] That agreement is what makes Self-Route work. Gemini-1.5-Pro judged 76.78% of queries answerable from the chunks alone, and GPT-4O judged 57.36%.[^3]",
    },
    {
      type: 'h2',
      text: 'Where each approach won, condition by condition',
    },
    {
      type: 'p',
      text: "Everything in this section is a condition one of the papers actually tested. None of it is extrapolated.",
    },
    {
      type: 'ul',
      items: [
        "**Preloading won when the collection was well inside the model's effective window.** CAG led at 21k and 43k tokens on HotPotQA and at all three SQuAD sizes, up to 50k tokens, with Llama 3.1 8B.[^1]",
        "**Retrieval won when the collection was far bigger than the window.** GPT-3.5-Turbo has a 16k window. On En.QA (15.39 vs 14.73) and En.MC (43.67 vs 34.50), whose contexts average 147k words, RAG beat long context. The authors call this the specific use case for RAG.[^3]",
        "**Retrieval won at 85k tokens with an 8B model.** On Chan's large HotPotQA set, BM25 top-3 (0.7463) and top-5 (0.7535) both scored above CAG (0.7407).[^1]",
        "**Retrieval helped big models even when the window was long enough.** Llama2-70B-32K gained 2.24 average points from retrieval, but Llama2-7B-32K lost points with it (28.20 without, 27.63 with). The authors attribute this to the smaller model's weaker zero-shot ability to use retrieved chunks.[^2]",
        "**Full context won on multi-hop and implicit questions.** Li classified RAG's failures into four types. On HotpotQA, 2WikiMQA and MuSiQue, the typical failure was the multi-step question, where the answer to the first hop decides what to retrieve next. On NarrativeQA, most failures were implicit questions that need the whole story.[^3] Xu saw the same pattern from the other side. HotpotQA rose from 34.64 to 43.97 for Llama2-70B when the window went from 4K to 16K, because every intermediate hop has to be present.[^2]",
        "**Full context won on multiple-choice reading.** On QuALITY, Llama2-70B-16K scored 76.10 without retrieval and 70.90 with it.[^2]",
        "**More chunks did not keep helping.** In Xu, the best Llama2-70B averages came at top-5 or top-10, and top-20 sometimes hurt even when it fit in the window.[^2]",
      ],
    },
    {
      type: 'p',
      text: "One result in Li argues against trusting any single synthetic test. On ∞Bench's PassKey task, where a sentence like \"the passkey is 123456\" is hidden in filler, RAG scored 80.34% and long context 65.25% with Gemini-1.5-Pro. When the question was reworded to ask for \"the special token hidden inside the texts,\" RAG fell to 4.58% while long context held at 69.32%.[^3] My reading: the retriever leans on the wording of the question. Change the wording and it can miss a fact it found a moment earlier.",
    },
    {
      type: 'h2',
      text: 'What a query costs in tokens, seconds and memory',
    },
    {
      type: 'p',
      text: "Tokens per query set the bill for any metered API, and Li et al. note that LLM API pricing is typically per input token.[^3] A top-5 RAG prompt in Xu's setup is roughly 2,000 to 2,500 tokens whether the document is 5k or 85k tokens long.[^2] Plain long context pays for the whole document every time. Li measured how that trade moves with k, on an averaged benchmark where full context scored 45.53 (the ablation table does not name the model). Top-1 RAG used 5.26% of long context's tokens and scored 20.24. Top-5 used 17.02% and scored 37.92. Top-50 used 95.29% and scored 44.06, against 45.53 for full context. Self-Route cost least at top-5, 38.63% of the tokens, for a score of 43.33.[^3] Its cost was not monotonic in k, because a larger k let more queries be settled in the cheap RAG step.[^3]",
    },
    {
      type: 'p',
      text: "CAG changes a different number. It does not shrink the context. It avoids re-encoding the context on every query. Chan's timing table shows both sides of that.",
    },
    {
      type: 'chart',
      kind: 'line',
      title: 'Seconds per HotPotQA question (retrieval + generation) as the collection grows',
      xLabel: 'Collection size, thousand tokens',
      yLabel: 'Seconds per question',
      series: [
        { label: 'CAG', key: 'c' },
        { label: 'Sparse RAG, top-3', key: 's3', dashed: true },
        { label: 'Dense RAG, top-3', key: 'd3' },
        { label: 'Dense RAG, top-10', key: 'd10', dashed: true },
      ],
      data: [
        { x: 21, values: { c: 0.85, s3: 0.74, d3: 1.49, d10: 3.04 } },
        { x: 43, values: { c: 1.41, s3: 0.72, d3: 1.37, d10: 3.05 } },
        { x: 85, values: { c: 2.26, s3: 0.67, d3: 1.35, d10: 3.05 } },
      ],
      caption: 'Redrawn from Table 3 of Chan et al., 2024.[^1] Totals are the author\'s sums of the paper\'s retrieval and generation columns. Not plotted: in-context learning without a saved cache, at 9.32, 26.37 and 92.08 seconds.',
    },
    {
      type: 'p',
      text: "Against re-reading the documents each time, the saved cache is a large win: 9.32 to 0.85 seconds at 21k tokens, and 92.08 to 2.26 at 85k.[^1] Against retrieval, the picture is mixed. The paper says CAG stays more efficient than dense RAG.[^1] By my reading of the same table, that holds against dense top-10 at every size and against dense top-3 only at the smallest. BM25 top-3 was faster than CAG at all three sizes, and its lead widened as the collection grew. The authors note that generation time grows with knowledge size for every method, CAG included.[^1] My reading of why: each new token still attends over the whole cached prefix, so a saved cache removes the re-encoding but not the reading.",
    },
    {
      type: 'p',
      text: "The cache also takes memory, and none of the three papers reports how much. The standard size estimate for one cached sequence is:",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} M_{KV} = 2 \\cdot L \\cdot H_{kv} \\cdot d_{h} \\cdot T \\cdot b \\end{gathered}',
      caption: 'The factor 2 counts one key and one value vector. \\(L\\) is the number of layers, \\(H_{kv}\\) the number of key-value heads, \\(d_h\\) the dimension of each head, \\(T\\) the number of cached tokens and \\(b\\) the bytes per number (2 for 16-bit).',
    },
    {
      type: 'p',
      text: "The Llama 3 paper lists the 8B model with 32 layers, a model dimension of 4,096, 32 attention heads and 8 key-value heads. It uses grouped query attention, which the authors say is there to speed up inference and reduce the size of the key-value cache.[^4] That gives \\(d_h = 4096/32 = 128\\). The arithmetic from here on is mine. One token costs \\(2 \\cdot 32 \\cdot 8 \\cdot 128 \\cdot 2\\) = 131,072 bytes, or 128 KiB. Chan's 85k-token HotPotQA set comes to about 11.1 GB of cache in 16-bit, on top of roughly 16 GB of weights. A 2,500-token top-5 RAG prompt comes to about 0.33 GB. Chan's pipeline stores the cache on disk or in memory and loads it at inference.[^1] That is fine for one collection. It stops being cheap when a service keeps many collections, or many users' private collections, resident at the same time.",
    },
    {
      type: 'h2',
      text: 'Where these conclusions stop holding',
    },
    {
      type: 'p',
      text: "**Collection size relative to the working window.** Chan's authors limit CAG to knowledge sources of manageable size and call it impractical for significantly larger datasets.[^1] Their own crossover came between 43k and 85k tokens for an 8B model. Li's clearest RAG wins came where the input far exceeded the window.[^3] The threshold moves with the model, so it has to be measured, not assumed.",
    },
    {
      type: 'p',
      text: "**Model generation and size.** Xu (2023) found retrieval helped long-context models. Li (2024) found long context beat RAG, and explained the disagreement by stronger LLMs and longer contexts.[^3] Xu in turn disagreed with LongBench's authors and blamed their 6B and 7B models.[^2] Chan tested one 8B model. Each verdict is tied to the models it was measured on.",
    },
    {
      type: 'p',
      text: "**How hard and how clean the benchmark is.** Chan's authors suspect their datasets were too easy.[^1] Li warns that Wikipedia-based sets may have leaked into pretraining, and saw models reproduce exact reference wording that was not in the context.[^3] HotPotQA is built from Wikipedia.[^2]",
    },
    {
      type: 'p',
      text: "**How often the knowledge changes.** Chan's cost argument depends on the KV-Encode step running once, \"regardless of the number of subsequent queries.\"[^1] That holds only while \\(D\\) stays fixed. The original RAG paper showed the other side: with the index swapped between 2016 and 2018 Wikipedia dumps and no retraining, RAG answered 70% of questions about 2016 world leaders correctly from the 2016 index and 68% about 2018 leaders from the 2018 index, and only 4% to 12% with mismatched indexes.[^5] By my reading, any edit to a preloaded collection means re-encoding at least the tokens after the edit, since each cached token depends on everything before it. No paper here measured that cost. It is the first number to get before moving a collection that changes daily into a cache.",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: "Chan, Chen, Cheng, and Huang, Don't Do RAG: When Cache-Augmented Generation is All You Need for Knowledge Tasks, WWW Companion 2025 (arXiv 2024)", url: 'https://arxiv.org/abs/2412.15605' },
        { title: 'Xu et al., Retrieval meets Long Context Large Language Models, ICLR 2024', url: 'https://arxiv.org/abs/2310.03025' },
        { title: 'Li, Li, Zhang, Mei, and Bendersky, Retrieval Augmented Generation or Long-Context LLMs? A Comprehensive Study and Hybrid Approach, EMNLP Industry 2024', url: 'https://arxiv.org/abs/2407.16833' },
        { title: 'Llama Team, AI @ Meta, The Llama 3 Herd of Models, 2024', url: 'https://arxiv.org/abs/2407.21783' },
        { title: 'Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, NeurIPS 2020', url: 'https://arxiv.org/abs/2005.11401' },
      ],
    },
  ],
};

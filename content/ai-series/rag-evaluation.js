// Every factual claim below is taken from the numbered sources at the end.
// The pipeline figure is Figure 1 of Barnett et al. 2024 (arXiv 2401.05856),
// reproduced under CC BY 4.0. The three charts are redrawn from table values
// in RAGAS (CC BY 4.0), ARES (CC BY 4.0) and BEIR (CC BY-SA 4.0).
export const POST = {
  id: 'rag-evaluation',
  title: 'Tracing a Wrong RAG Answer to the Stage That Broke',
  excerpt: 'A Deakin University team built three RAG systems and catalogued seven ways they failed. Those failures sort into four branches, from "never retrieved" to "used but misstated", and each branch has its own metric and its own record of agreeing, or not, with human judges.',
  category: 'AI',
  tags: ['RAG', 'Evaluation', 'Metrics'],
  body: [
    {
      type: 'p',
      text: "In a paper posted in January 2024, a team at Deakin University's Applied Artificial Intelligence Institute wrote up what went wrong while they built three retrieval augmented generation (RAG) systems.[^1] One, Cognitive Reviewer, helps PhD students rank and question the papers they upload for a literature review. Another, AI Tutor, answers students' questions from a unit's lecture videos, web pages and PDFs, and went into a pilot with 200 students on 30 October 2023. The third was a test rig built on BioASQ, a set of biomedical questions written by experts: 4,017 open access documents and 1,000 questions, answered by GPT-4 and then graded with OpenAI's evals tool.[^1]",
    },
    {
      type: 'p',
      text: "The grading itself went wrong in an instructive way. The authors checked by hand every answer the automated evaluator flagged as inaccurate, plus a sample of others, and found the evaluator \"more pessimistic than a human rater for this domain.\" They then added a caveat against themselves: the human reviewers were not biomedical experts, so the language model may simply have known more than they did.[^1] So even the judge of a RAG system needs judging. The paper's first stated takeaway is that validating a RAG system \"is only feasible during operation.\"[^1]",
    },
    {
      type: 'p',
      text: "This post builds on the paper's main contribution, a list of seven failure points, and turns it into a diagnostic tree. When an answer is wrong, you walk down the tree to find which stage failed, then use the metric built to detect that failure. For each metric, the question worth asking is how often it agrees with a person.",
    },
    {
      type: 'h2',
      text: 'Seven failure points from three working systems',
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Chunk', def: 'A piece of a source document, cut small enough to embed and fit in a prompt. The index stores chunks, not whole documents.' },
        { term: 'Retriever', def: 'The component that turns the question into an embedding (a vector of numbers) and returns the top k most similar chunks from the index.' },
        { term: 'Reranker and consolidator', def: 'Optional stages after retrieval. The reranker reorders chunks so the one holding the answer sits near the top; the consolidator trims or merges them to fit the model\'s token limit.' },
        { term: 'Reader', def: 'The language model that reads the question plus the surviving chunks and writes the answer.' },
      ],
    },
    {
      type: 'image',
      src: '/blog-images/rag-evaluation/barnett-failure-points.webp',
      alt: 'RAG pipeline diagram. The index process runs documents through a chunker into a database. The query process runs a query through a rewriter, retriever, reranker, consolidator and reader to a response. Red boxes mark failure points: Missing Content at the database, Missed Top Ranked at the retriever, Not in Context at the consolidator, Not Extracted, Wrong Format and Incomplete at the reader, and Incorrect Specificity at the response.',
      width: 2130,
      height: 800,
      caption: 'Figure 1 from Barnett et al., 2024,[^1] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Red boxes are the failure points the authors observed; each sits next to the stage where it happens.',
    },
    {
      type: 'p',
      text: "The seven points, in the paper's words where it helps. **FP1, missing content:** the question cannot be answered from the documents, and instead of saying so, the system can be \"fooled into giving a response.\" **FP2, missed the top ranked documents:** the answer is in a document that did not rank inside the top K, where K was picked for performance. **FP3, not in context:** the document was retrieved but got dropped when many results were consolidated into one prompt. **FP4, not extracted:** the answer was in the context and the model still failed to pull it out, typically because of \"too much noise or contradicting information.\"[^1]",
    },
    {
      type: 'p',
      text: "The last three are about the shape of the answer. **FP5, wrong format:** the user asked for a table or list and the model ignored it. **FP6, incorrect specificity:** the answer is too general or too specific for what the user needed. **FP7, incomplete:** the answer leaves out information that was sitting in the context, as with one question asking for the main points of documents A, B and C at once. The authors suggest asking about each document separately.[^1]",
    },
    {
      type: 'p',
      text: "Read the list in pipeline order and a pattern shows. Failures near the start mean the right text never reached the model. Failures near the end mean the right text reached the model and something happened to it there. The tree below is my grouping of the seven points into four branches; the paper lists them flat.",
    },
    {
      type: 'diagram',
      essential: true,
      title: 'Where did the wrong answer come from?',
      root: {
        label: 'The answer is wrong',
        color: 'purple',
        children: [
          {
            edge: 'answer chunk not in top k',
            node: {
              label: 'Not retrieved (FP1, FP2)',
              color: 'blue',
              children: [{ node: { label: 'Recall@k, hit rate', color: 'green' } }],
            },
          },
          {
            edge: 'in top k, but low',
            node: {
              label: 'Ranked low (FP2, FP3)',
              color: 'blue',
              children: [{ node: { label: 'MRR, nDCG@10', color: 'green' } }],
            },
          },
          {
            edge: 'in the prompt, not in the answer',
            node: {
              label: 'Retrieved but not used (FP4, FP7)',
              color: 'yellow',
              children: [{ node: { label: 'Context relevance, answer relevance', color: 'green' } }],
            },
          },
          {
            edge: 'answer contradicts context',
            node: {
              label: 'Used but misstated',
              color: 'yellow',
              children: [{ node: { label: 'Faithfulness', color: 'green' } }],
            },
          },
        ],
      },
      caption: 'The author\'s grouping of the failure points in Barnett et al.[^1] Blue branches are retrieval failures, scored against labelled relevant chunks. Yellow branches are generation failures, scored by a judge model. FP5 and FP6 (format and specificity) fall outside all four branches, since the answer can be correct and still fail them.',
    },
    {
      type: 'h2',
      text: 'Branch one: the answer chunk never came back',
    },
    {
      type: 'p',
      text: "The first test is whether any chunk holding the answer appeared in the top k at all. This needs labels: for each test question, a list of which chunks are relevant. With labels, **recall at k** says what share of the relevant chunks the retriever returned.",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\mathrm{Recall@}k(q) = \\frac{|\\,\\mathrm{Rel}(q) \\cap \\mathrm{Top}_k(q)\\,|}{|\\,\\mathrm{Rel}(q)\\,|} \\end{gathered}',
      caption: 'The usual definition of recall at a cutoff k for one question q, averaged over all test questions. BEIR reports it at k = 100 alongside its main metric.[^4]',
    },
    {
      type: 'p',
      text: "Term by term: \\(q\\) is one test question. \\(\\mathrm{Rel}(q)\\) is the set of chunks a person marked as relevant to it. \\(\\mathrm{Top}_k(q)\\) is the set of k chunks the retriever returned. The bars mean \"number of items in\", so the fraction is relevant chunks found divided by relevant chunks that exist. A score of 1 means nothing relevant was missed. Recall ignores order, so a relevant chunk at position 1 and one at position k count the same.",
    },
    {
      type: 'p',
      text: "A looser version is common in question answering. The Dense Passage Retrieval paper scores a retriever by **top-k retrieval accuracy**: \"the fraction of questions for which\" the k returned passages contain a span that answers the question.[^6] Engineers often call this hit rate. It asks only whether at least one good chunk arrived, which is the right question when one chunk is enough to answer. Recall is stricter and suits FP7-style questions that need several chunks.",
    },
    {
      type: 'p',
      text: "Both metrics are blind to FP1. If the documents do not contain the answer, \\(\\mathrm{Rel}(q)\\) is empty and there is nothing to recall. The TREC-8 question answering track, which scored systems by mean reciprocal rank, ran into the same wall: because every question required at least one response, \"a system could receive no credit for realizing it did not know the answer.\"[^5] Missing content has to be tested with questions you know are unanswerable, where the correct behavior is a refusal.",
    },
    {
      type: 'p',
      text: "There is a second catch: recall is only as good as the labels. BEIR, a benchmark of 18 retrieval datasets, checked this on TREC-COVID. Its judgments were built by pooling results from the systems in the original challenge, so a new retriever can return chunks nobody ever judged. BEIR called these **holes**: 30.6% of DPR's top 10 results were unjudged, against 6.4% for the keyword method BM25. After the authors annotated the holes by hand, DPR's score rose from 0.332 to 0.445.[^4]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'TREC-COVID nDCG@10 before and after filling annotation holes',
      yLabel: 'nDCG@10',
      series: [
        { label: 'Original labels (with holes)', key: 'orig' },
        { label: 'Holes annotated', key: 'fixed' },
      ],
      data: [
        { label: 'BM25 (6.4% holes)', values: { orig: 0.656, fixed: 0.668 } },
        { label: 'ColBERT (12.4%)', values: { orig: 0.677, fixed: 0.735 } },
        { label: 'ANCE (14.4%)', values: { orig: 0.654, fixed: 0.735 } },
        { label: 'DPR (30.6%)', values: { orig: 0.332, fixed: 0.445 } },
        { label: 'TAS-B (31.8%)', values: { orig: 0.481, fixed: 0.555 } },
      ],
      caption: 'Redrawn from Table 4 of Thakur et al., 2021.[^4] The percentage is Hole@10: the share of each system\'s top 10 hits that no annotator had seen. BM25, whose results helped build the original label pool, barely moves.',
    },
    {
      type: 'p',
      text: "BEIR puts this down to lexical bias: the labels came mostly from keyword systems, so a relevant hit with no word overlap was counted as irrelevant.[^4] If your own test labels come from the retriever you are replacing, a new embedding model will look worse than it is.",
    },
    {
      type: 'h2',
      text: 'Branch two: it came back, but too far down',
    },
    {
      type: 'p',
      text: "FP2 and FP3 are about position. A chunk at rank 40 counts for recall@100 but may never reach the prompt if only the top 5 are kept, or if the consolidator trims the list. A rank-aware metric catches this. A long-standing one in question answering is **mean reciprocal rank** (MRR), as used in the TREC-8 track in 1999. Each question scored \"the reciprocal of the rank at which the first correct response was returned, or 0 if none of the five responses contained a correct answer,\" and a run's score was the mean over questions.[^5]",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\mathrm{MRR} = \\frac{1}{|Q|} \\sum_{q \\in Q} \\frac{1}{\\mathrm{rank}_q} \\\\[4pt] \\tfrac{1}{\\mathrm{rank}_q} = 0 \\text{ if nothing correct in the top } k \\end{gathered}',
      caption: 'Mean reciprocal rank as used in the TREC-8 question answering track, where k was 5.[^5]',
    },
    {
      type: 'p',
      text: "\\(Q\\) is the set of test questions and \\(|Q|\\) is how many there are. \\(\\mathrm{rank}_q\\) is the position of the first correct result for question q, counting from 1. A hit at rank 1 scores 1, at rank 2 scores 0.5, at rank 5 scores 0.2. The steep drop is the point: moving an answer from rank 2 to rank 1 is worth as much as moving it from nowhere to rank 2.",
    },
    {
      type: 'p',
      text: "Voorhees listed the metric's weak spots in the same report. With five responses, a question can score only six values (0, .2, .25, .33, .5, 1), and a system gets \"no credit for retrieving multiple (different) correct answers.\"[^5] For a RAG question that needs three chunks, MRR sees only the first. BEIR passed over MRR for a related reason, that binary rank-aware metrics like it \"fail to evaluate tasks with graded relevance judgements,\" and chose nDCG@10 as its single metric.[^4] (nDCG adds up every relevant hit in the top k, discounted by position, so a second and third good chunk still count.)",
    },
    {
      type: 'p',
      text: "One of Barnett et al.'s lessons belongs on this branch. In AI Tutor, adding the file name and chunk number to the retrieved context \"helped the reader extract the required information,\" which they tag against FP2 and FP4.[^1] Their table gives no numbers for it.",
    },
    {
      type: 'h2',
      text: 'Branch three: in the prompt, missing from the answer',
    },
    {
      type: 'p',
      text: "Past this point, labelled chunks stop helping. The right text reached the model, so the retrieval metrics can look perfect while the answer is still wrong. FP4 and FP7 live here. Barnett et al. tie FP4 to noise in the context, and they report that in AI Tutor a larger context (8K versus 4K) \"enabled more accurate responses.\"[^1] Measuring noise and use needs something that reads text, which in practice means a language model acting as judge.",
    },
    {
      type: 'p',
      text: "RAGAS, from Es and colleagues, defines two scores for this branch without any reference answers.[^2] **Context relevance** asks the model to copy out the sentences of the retrieved context that are needed to answer the question, then divides by the total number of sentences. **Answer relevance** works backwards: the judge writes n questions that the generated answer would answer, and each is compared with the real question by cosine similarity of their embeddings.",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\mathrm{CR} = \\frac{|S_{\\mathrm{ext}}|}{|\\,\\text{sentences in } c(q)\\,|} \\\\[6pt] \\mathrm{AR} = \\frac{1}{n} \\sum_{i=1}^{n} \\mathrm{sim}(q, q_i) \\end{gathered}',
      caption: 'Context relevance and answer relevance, equations 2 and 1 of Es et al.[^2]',
    },
    {
      type: 'p',
      text: "Here \\(c(q)\\) is the context retrieved for question q, and \\(S_{\\mathrm{ext}}\\) is the set of sentences the judge extracted from it. A CR near 1 means almost every sentence mattered; a low CR means the answer was buried in filler. In AR, \\(q_i\\) is the i-th question the judge generated from the answer and \\(\\mathrm{sim}\\) is cosine similarity. The paper says AR ignores factual accuracy but penalises answers that are incomplete or padded,[^2] which is the FP7 symptom.",
    },
    {
      type: 'p',
      text: "To test agreement with people, the authors built WikiEval: 50 Wikipedia pages about events since the start of 2022, one question per page, and pairs of answers or contexts where one was deliberately worse. Two annotators picked the better one in each pair. They agreed with each other in about 95% of cases for faithfulness and context relevance and about 90% for answer relevance.[^2] RAGAS then scored the same pairs, and a hit meant it preferred the same side as the humans.",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Agreement with human annotators on WikiEval pairs',
      yLabel: 'Accuracy',
      series: [
        { label: 'RAGAS', key: 'ragas' },
        { label: 'GPT Score (0 to 10)', key: 'score' },
        { label: 'GPT Ranking', key: 'rank' },
      ],
      data: [
        { label: 'Faithfulness', values: { ragas: 0.95, score: 0.72, rank: 0.54 } },
        { label: 'Answer relevance', values: { ragas: 0.78, score: 0.52, rank: 0.40 } },
        { label: 'Context relevance', values: { ragas: 0.70, score: 0.63, rank: 0.52 } },
      ],
      caption: 'Redrawn from Table 1 of Es et al.[^2] The two baselines ask ChatGPT directly for a score or a preference. All judging used gpt-3.5-turbo-16k.',
    },
    {
      type: 'p',
      text: "Context relevance was the weakest: the paper calls it \"the hardest quality dimension to evaluate\" and says ChatGPT struggled to pick out the needed sentences, \"especially for longer contexts.\"[^2] That is the regime where FP4 happens, so on this evidence the metric is least reliable where you need it most.",
    },
    {
      type: 'p',
      text: "ARES, from Saad-Falcon and colleagues at Stanford, tackles the same scores differently. It generates synthetic questions and answers from your own corpus, including deliberately wrong ones, and fine-tunes a small DeBERTa-v3-Large classifier for each score.[^3] On mock RAG systems built from six KILT and SuperGLUE datasets, it classified context relevance far more accurately than RAGAS version 0.0.18.[^3]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Context relevance: judge accuracy on labelled triples',
      yLabel: 'Accuracy (%)',
      series: [
        { label: 'RAGAS 0.0.18', key: 'ragas' },
        { label: 'ARES', key: 'ares' },
      ],
      data: [
        { label: 'NQ', values: { ragas: 31.4, ares: 79.3 } },
        { label: 'HotpotQA', values: { ragas: 17.2, ares: 92.3 } },
        { label: 'WoW', values: { ragas: 36.4, ares: 85.7 } },
        { label: 'FEVER', values: { ragas: 23.7, ares: 88.4 } },
        { label: 'MultiRC', values: { ragas: 16.1, ares: 85.8 } },
        { label: 'ReCoRD', values: { ragas: 15.0, ares: 67.8 } },
      ],
      caption: 'Redrawn from Table 1 of Saad-Falcon et al.[^3] Accuracy of each judge at labelling a retrieved passage as relevant or not to its query, on the mock systems.',
    },
    {
      type: 'p',
      text: "The accuracy gap is much wider than the ranking gap. When the task was to order nine mock systems, spaced 2.5 points apart, RAGAS still reached a Kendall's tau of 0.89 on NQ context relevance against ARES's 0.94.[^3] Kendall's tau counts pairs of systems put in the right order minus pairs put in the wrong order, divided by all pairs, so 1.0 is a perfect ranking. My reading: a judge that is often wrong about single chunks can still rank whole systems well, as long as its mistakes fall evenly across them.",
    },
    {
      type: 'h2',
      text: 'Branch four: used, but misstated',
    },
    {
      type: 'p',
      text: "The last branch is the one people usually mean by hallucination in RAG: the model had the right text and said something it does not support. **Faithfulness** in RAGAS splits the answer into short statements, asks the judge whether each can be inferred from the context, and reports the supported fraction.[^2]",
    },
    {
      type: 'eq',
      tex: 'F = \\frac{|V|}{|S|}',
      caption: 'Faithfulness in Es et al.[^2] \\(S\\) is the set of statements extracted from the answer; \\(V\\) is the subset the judge found supported by the context.',
    },
    {
      type: 'p',
      text: "Faithfulness is measured against the retrieved context, not the world. An answer that repeats a wrong chunk accurately is faithful, and the error belongs to branch one or two. That is the reason to score the branches separately: faithfulness alone would call that answer a success.",
    },
    {
      type: 'p',
      text: "Faithfulness had the best agreement in the RAGAS study, 0.95.[^2] The test pairs were built in a way that may flatter it, though. The unfaithful answer in each pair was ChatGPT answering with no context at all,[^2] and on events after its training cutoff. My reading is that this contrast is probably easier to spot than a single wrong number slipped into an otherwise grounded answer.",
    },
    {
      type: 'p',
      text: "ARES tested faithfulness on real attribution data from the AIS benchmark, where each answer is labelled faithful or not by people. The estimated share of faithful answers was 0.478 against a true 0.458 on Wizard of Wikipedia, and 0.835 against 0.859 on CNN/DailyMail, using 200 human labels each.[^3] Those system-level estimates were close even though the judge's accuracy on single answers was only 62.5% on Wizard of Wikipedia.[^3]",
    },
    {
      type: 'p',
      text: "The mechanism behind that is **prediction-powered inference** (PPI). ARES runs the judge on a large unlabelled sample, uses a small set of human labels to measure how the judge errs, corrects the estimate, and reports a 95% confidence interval.[^3] On real RAG systems built from three retrievers and three generators, plus the original RAG model of Lewis et al., those intervals averaged 7.4 points wide for context relevance and 6.1 for answer relevance, and contained the true value more than 95% of the time. The authors found 150 human labels to be the minimum that worked.[^3]",
    },
    {
      type: 'callout',
      title: 'Two ways to read an agreement number',
      text: "RAGAS reports how often the metric picks the same answer as a person in a pair.[^2] ARES reports whether it ranks whole systems in the right order and how close its system average is to the truth.[^3] A judge can be mediocre on the first and good on the second. For a dashboard that compares this week's pipeline to last week's, the second is what matters; for flagging which single answer to show a reviewer, the first does.",
    },
    {
      type: 'h2',
      text: 'Where the judges stop agreeing with people',
    },
    {
      type: 'p',
      text: "The ARES judges held up when the query type or document type shifted between KILT and SuperGLUE datasets. They broke under larger moves. A judge trained on NQ and applied to other languages (XGLUE) reached a Kendall's tau of 0.33; applied to code search (CodeSearchNet), 0.28; applied to entity extraction (T-REx), 0.38.[^3] The paper counts a tau above 0.9 as success, so these are far short. The authors say each such shift needs new in-domain passages and example queries to rebuild the judges.[^3]",
    },
    {
      type: 'p',
      text: "The human side has the same problem, and it brings the story back to where it began. Barnett et al. could not tell whether their automated grader was too harsh or their non-expert reviewers too lenient on BioASQ.[^1] The ARES authors state the matching limitation plainly: the human preference labels that PPI depends on \"often require an annotator familiar with the RAG system's domain application,\" and specialised domains \"such as law, medicine, and finance, may require annotators with specialized expertise.\"[^3]",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Barnett et al., Seven Failure Points When Engineering a Retrieval Augmented Generation System (CAIN 2024)', url: 'https://arxiv.org/abs/2401.05856' },
        { title: 'Es et al., RAGAS: Automated Evaluation of Retrieval Augmented Generation (2023)', url: 'https://arxiv.org/abs/2309.15217' },
        { title: 'Saad-Falcon et al., ARES: An Automated Evaluation Framework for Retrieval-Augmented Generation Systems', url: 'https://arxiv.org/abs/2311.09476' },
        { title: 'Thakur et al., BEIR: A Heterogeneous Benchmark for Zero-shot Evaluation of Information Retrieval Models (NeurIPS 2021)', url: 'https://arxiv.org/abs/2104.08663' },
        { title: 'Voorhees, The TREC-8 Question Answering Track Report (1999)', url: 'https://trec.nist.gov/pubs/trec8/papers/qa_report.pdf' },
        { title: 'Karpukhin et al., Dense Passage Retrieval for Open-Domain Question Answering (EMNLP 2020)', url: 'https://arxiv.org/abs/2004.04906' },
      ],
    },
  ],
};

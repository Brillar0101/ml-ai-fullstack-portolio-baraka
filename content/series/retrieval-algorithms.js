// AI Engineering series post. Every factual claim is taken from the numbered sources at the end.
// The BEIR bar chart is redrawn from Table 2 of Thakur et al. 2021 (arXiv 2104.08663). The BM25
// saturation curve is computed from Equations 3.12 and 3.15 of Robertson and Zaragoza 2009.
export const POST = {
  "id": "retrieval-algorithms",
  "title": "BM25 and dense retrieval, two scoring functions side by side",
  "excerpt": "Dense Passage Retrieval beat BM25 by 19 points of top-20 accuracy on Natural Questions. On BEIR's 18 unseen datasets, the same model averaged 47.7% worse. What each formula actually computes, term by term, why each wins where it does, and what the papers report when you fuse them.",
  "category": "AI",
  "chapter": "Chapter 6",
  "tags": [
    "Retrieval",
    "Search",
    "RAG"
  ],
  "seriesNum": 29,
  "publishAt": "2026-06-17T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In April 2020, Vladimir Karpukhin and colleagues, mostly at Facebook AI, reported that a pair of fine-tuned BERT encoders could find answer passages in Wikipedia far better than BM25, the keyword ranking function the paper calls the de facto method for this job.[^2] On the Natural Questions test set, which uses real Google search queries, their Dense Passage Retriever (DPR) put a passage containing the answer in its top 20 results for 78.4% of questions. BM25 managed 59.1%. At top 100 the gap was 85.4% against 73.7%, and at top 5 it was 65.2% against 42.9%.[^2] The index held 21,015,324 passages of 100 words each, and the only training signal was pairs of questions and passages. The paper's Figure 1 shows DPR trained on just 1,000 examples already beating BM25 on the Natural Questions development set.[^2]"
    },
    {
      "type": "p",
      "text": "A year later, Nandan Thakur and colleagues at TU Darmstadt ran the public multi-dataset DPR checkpoint, trained on four question answering sets, across the 18 datasets of their BEIR benchmark without any further training.[^3] Averaged against BM25, DPR came out 47.7% worse, the worst generalization of the ten systems they tested.[^3] On Natural Questions, which it had been trained on, DPR still won, 0.474 nDCG@10 against 0.329. On BioASQ, a biomedical collection, it scored 0.127 while BM25 scored 0.465.[^3] The BEIR authors summed it up this way: BM25 trails neural models by 7 to 18 points on in-domain MS MARCO, yet it is a strong baseline for generalization and generally beats many more complex approaches.[^3]"
    },
    {
      "type": "p",
      "text": "Both results are true at once, and the reason sits in the two scoring functions. One counts words with a formula whose every term has a probabilistic story. The other learns a vector space from examples, and it is only as good as the match between those examples and your data. The rest of this post takes each formula apart, then looks at what happens when you combine them."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Sparse retrieval",
          "def": "Scoring documents by the query words they contain. A document is a vector with one slot per vocabulary word, almost all zeros, and an inverted index maps each word to the documents that hold it. BM25 is the standard example.[^1,2]"
        },
        {
          "term": "Dense retrieval",
          "def": "Scoring documents by the similarity of learned vectors, typically a few hundred numbers, all non-zero. DPR uses 768 dimensions.[^2]"
        },
        {
          "term": "Top-k retrieval accuracy",
          "def": "The share of questions for which at least one of the top k passages contains the answer span. DPR reports it for k = 20 and 100.[^2]"
        },
        {
          "term": "nDCG@10",
          "def": "A rank-aware score for the top 10 results that handles graded relevance and rewards putting relevant documents first. BEIR uses it for every dataset.[^3]"
        },
        {
          "term": "Zero-shot",
          "def": "Running a trained retriever on a dataset it has never seen, with no training data from that dataset. BEIR tests every model this way except on its own training set.[^3]"
        }
      ]
    },
    {
      "type": "h2",
      "text": "BM25, one factor at a time"
    },
    {
      "type": "p",
      "text": "Robertson and Zaragoza's 2009 monograph derives BM25 from the probabilistic relevance framework, the idea that documents should be ranked by their estimated probability of being relevant to the query.[^1] A document's score is a sum over the query terms, and each term's weight is a product of two parts: how rare the term is, and how much weight its count in this document should carry.[^1] Written out with the usual notation:"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered}\\text{score}(q,d)=\\sum_{i\\in q} \\frac{tf_i}{k_1 B + tf_i}\\, w_i^{IDF}\\\\[4pt] B=(1-b)+b\\,\\frac{dl}{avdl}\\end{gathered}",
      "caption": "Equations 3.12 and 3.15 of Robertson and Zaragoza, 2009,[^1] with the RSJ weight replaced by its no-relevance-information form, the IDF of Equation 3.3."
    },
    {
      "type": "p",
      "text": "**The rarity factor.** With no relevance judgements available, the Robertson/Sparck Jones weight reduces to a close approximation of classical inverse document frequency (IDF):[^1]"
    },
    {
      "type": "eq",
      "tex": "w_i^{IDF}=\\log\\frac{N-n_i+0.5}{n_i+0.5}",
      "caption": "Equation 3.3 of Robertson and Zaragoza, 2009.[^1]"
    },
    {
      "type": "p",
      "text": "\\(N\\) is the number of documents in the collection and \\(n_i\\) is how many contain term \\(i\\). A word found in almost every document gets a weight near zero or below it, and a word found in a handful gets a large one. The 0.5 terms are pseudo-counts. The authors add them because a plain ratio of counts inside a log can produce positive or negative infinities, and they cite theoretical reasons for the smoothing too.[^1] This is the factor that lets a rare name or product code dominate a BM25 score."
    },
    {
      "type": "p",
      "text": "**The saturation factor.** The monograph models each term as having a hidden binary property it calls eliteness, roughly whether the document is about the concept the term names. Term counts are assumed to follow one Poisson distribution in elite documents and another in the rest, the 2-Poisson model.[^1] The weight that falls out of this model rises with the count \\(tf\\) but levels off toward a ceiling, which the authors call saturation: no matter how often a term repeats, its contribution cannot pass that ceiling.[^1] The exact 2-Poisson formula needs parameters nobody can easily estimate, so BM25's authors fitted a simple curve with the same shape, \\(tf/(k+tf)\\).[^1] A small \\(k_1\\) makes the curve flatten after one or two occurrences. A large \\(k_1\\) lets each extra occurrence keep adding score. The monograph notes that traditional tf*idf, which is linear in \\(tf\\), fits a special case of the model with no saturation limit, and that the saturating function has frequently been shown to work better.[^1]"
    },
    {
      "type": "p",
      "text": "**The length factor.** Longer documents contain more of every word. The monograph gives two reasons a document might be long: verbosity, where the author uses more words for the same content, and scope, where the author covers more ground. Verbosity argues for dividing counts by length and scope argues against it, so BM25 uses a soft mix.[^1] \\(dl\\) is the document's length, \\(avdl\\) the average over the collection, and \\(b\\) between 0 and 1 sets how much to normalize: \\(b = 1\\) is full normalization and \\(b = 0\\) turns it off.[^1] Because \\(B\\) multiplies \\(k_1\\), a long document saturates more slowly and each occurrence in it counts for less."
    },
    {
      "type": "chart",
      "kind": "line",
      "title": "BM25 term-frequency factor, k1 = 0.9 and b = 0.4",
      "xLabel": "Occurrences of the term in the document (tf)",
      "yLabel": "tf / (k1·B + tf)",
      "yMax": 1,
      "series": [
        {
          "label": "Half-average length",
          "key": "short"
        },
        {
          "label": "Average length",
          "key": "avg"
        },
        {
          "label": "Three times average length",
          "key": "long",
          "dashed": true
        }
      ],
      "data": [
        {
          "x": 0,
          "values": {
            "short": 0.0,
            "avg": 0.0,
            "long": 0.0
          }
        },
        {
          "x": 1,
          "values": {
            "short": 0.581,
            "avg": 0.526,
            "long": 0.382
          }
        },
        {
          "x": 2,
          "values": {
            "short": 0.735,
            "avg": 0.69,
            "long": 0.552
          }
        },
        {
          "x": 3,
          "values": {
            "short": 0.806,
            "avg": 0.769,
            "long": 0.649
          }
        },
        {
          "x": 4,
          "values": {
            "short": 0.847,
            "avg": 0.816,
            "long": 0.712
          }
        },
        {
          "x": 5,
          "values": {
            "short": 0.874,
            "avg": 0.847,
            "long": 0.755
          }
        },
        {
          "x": 6,
          "values": {
            "short": 0.893,
            "avg": 0.87,
            "long": 0.787
          }
        },
        {
          "x": 7,
          "values": {
            "short": 0.907,
            "avg": 0.886,
            "long": 0.812
          }
        },
        {
          "x": 8,
          "values": {
            "short": 0.917,
            "avg": 0.899,
            "long": 0.832
          }
        },
        {
          "x": 9,
          "values": {
            "short": 0.926,
            "avg": 0.909,
            "long": 0.847
          }
        },
        {
          "x": 10,
          "values": {
            "short": 0.933,
            "avg": 0.917,
            "long": 0.861
          }
        }
      ],
      "caption": "Computed by the author from Equations 3.12 and 3.15 of Robertson and Zaragoza, 2009,[^1] using k1 = 0.9 and b = 0.4, the values DPR tuned on development data and BEIR ran as Lucene defaults.[^2,3] The first occurrence of a term earns more than half the ceiling in an average-length document; the tenth adds almost nothing."
    },
    {
      "type": "p",
      "text": "The model itself says nothing about how to set \\(k_1\\) and \\(b\\), which the authors call a limitation. From experiments, they report that values in the ranges 0.5 < b < 0.8 and 1.2 < k1 < 2 are reasonably good in many circumstances, with evidence that the best values depend on the type of documents and queries.[^1] DPR tuned its BM25 on development sets and landed on b = 0.4 and k1 = 0.9. BEIR used the same values as untuned Lucene defaults.[^2,3]"
    },
    {
      "type": "h2",
      "text": "DPR: a dot product between two BERTs"
    },
    {
      "type": "p",
      "text": "DPR's scoring function is one line. A question encoder \\(E_Q\\) and a passage encoder \\(E_P\\), two independent BERT-base networks, each map text to the 768-dimensional vector at the [CLS] token, and similarity is the dot product:[^2]"
    },
    {
      "type": "eq",
      "tex": "\\text{sim}(q,p)=E_Q(q)^{\\top}E_P(p)",
      "caption": "Equation 1 of Karpukhin et al., 2020.[^2]"
    },
    {
      "type": "p",
      "text": "The authors note that a model with cross-attention between question and passage would be more expressive, but the similarity has to be decomposable so that every passage vector can be computed ahead of time.[^2] That constraint shapes everything. The 21 million passage vectors are encoded once, indexed with FAISS, and at query time only the question passes through a network. The authors also tried L2 distance and found it comparable to the dot product, with both better than cosine.[^2]"
    },
    {
      "type": "p",
      "text": "Where BM25's weights come from a probability model, DPR's come from training. Each training example is a question \\(q_i\\), one relevant passage \\(p_i^+\\), and \\(n\\) irrelevant passages \\(p_{i,j}^-\\). The loss is the negative log likelihood of the positive passage:[^2]"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered}L=-\\log\\frac{e^{s_i^+}}{e^{s_i^+}+\\sum_{j=1}^{n}e^{s_{i,j}^-}}\\\\[4pt] s_i^+=\\text{sim}(q_i,p_i^+),\\;\\; s_{i,j}^-=\\text{sim}(q_i,p_{i,j}^-)\\end{gathered}",
      "caption": "Equation 2 of Karpukhin et al., 2020,[^2] with the similarities abbreviated as \\(s\\) to fit the line."
    },
    {
      "type": "p",
      "text": "Read as a softmax, the fraction is the probability the model assigns to the right passage among \\(n+1\\) candidates. Training pushes \\(\\text{sim}(q_i,p_i^+)\\) up and each negative's similarity down. Which passages fill the negative slots turned out to matter a lot. With **in-batch negatives**, a batch of \\(B\\) questions and their \\(B\\) positive passages gives a \\(B \\times B\\) score matrix \\(S = QP^\\top\\), and each question's positive doubles as a negative for the other \\(B-1\\) questions, so the model trains on \\(B^2\\) pairs for the cost of \\(B\\).[^2]"
    },
    {
      "type": "p",
      "text": "Table 3 of the paper measures the effect on the Natural Questions development set. Seven gold negatives drawn from the whole training set gave 63.1% top-20 accuracy. Seven drawn from the same batch gave 69.1%, and a batch of 128 raised it to 73.0%. Adding one **hard negative** per question, a passage that BM25 ranks highly but that does not contain the answer, lifted it to 78.0%. A second BM25 negative did not help further.[^2] The final model used batches of 128 with one BM25 negative each.[^2] My reading of that table: the dense retriever learned its sharpest distinctions from BM25's mistakes."
    },
    {
      "type": "p",
      "text": "The costs land in different places. On one server, DPR with an in-memory FAISS index answered 995.0 questions per second, returning 100 passages each, against 23.7 per second per CPU thread for BM25 in Lucene. Building the dense index was the expensive part: about 8.8 hours on 8 GPUs to encode the passages, then 8.5 hours to build the FAISS index, against roughly 30 minutes for Lucene's inverted index.[^2]"
    },
    {
      "type": "h2",
      "text": "Where each function wins"
    },
    {
      "type": "p",
      "text": "DPR's appendix gives one example in each direction. For \"What is the body of water between England and Ireland?\", BM25's top passage was about British Cycling, full of the words England and Ireland. DPR returned the Irish Sea article, which the authors suggest it matched through semantic neighbours such as sea and channel, with no word overlap.[^2] For \"Who plays Thoros of Myr in Game of Thrones?\", BM25 found a passage naming the actor, and DPR returned a Norwegian actor who played Thor Heyerdahl. The authors' reading is that DPR may lack the capacity to represent salient phrases that appear rarely.[^2] I read this as the IDF factor at work: a rare phrase gets a huge BM25 weight, while a dense encoder has to fit it into the same 768 numbers as everything else."
    },
    {
      "type": "p",
      "text": "SQuAD was the one dataset in the DPR paper where BM25 won, 68.8% top-20 against 63.2%. The authors offer two conjectures. Annotators wrote questions after reading the passage, which gives high word overlap, and the data comes from only 500 or so Wikipedia articles.[^2]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Zero-shot nDCG@10 on BEIR, BM25 against two dense retrievers",
      "yLabel": "nDCG@10 × 100",
      "valueLabels": false,
      "series": [
        {
          "label": "BM25",
          "key": "bm25",
          "baseline": true
        },
        {
          "label": "DPR (multi)",
          "key": "dpr"
        },
        {
          "label": "TAS-B",
          "key": "tasb"
        }
      ],
      "data": [
        {
          "label": "MS MARCO",
          "values": {
            "bm25": 22.8,
            "dpr": 17.7,
            "tasb": 40.8
          }
        },
        {
          "label": "NQ",
          "values": {
            "bm25": 32.9,
            "dpr": 47.4,
            "tasb": 46.3
          }
        },
        {
          "label": "HotpotQA",
          "values": {
            "bm25": 60.3,
            "dpr": 39.1,
            "tasb": 58.4
          }
        },
        {
          "label": "FEVER",
          "values": {
            "bm25": 75.3,
            "dpr": 56.2,
            "tasb": 70.0
          }
        },
        {
          "label": "Quora",
          "values": {
            "bm25": 78.9,
            "dpr": 24.8,
            "tasb": 83.5
          }
        },
        {
          "label": "SciFact",
          "values": {
            "bm25": 66.5,
            "dpr": 31.8,
            "tasb": 64.3
          }
        },
        {
          "label": "TREC-COVID",
          "values": {
            "bm25": 65.6,
            "dpr": 33.2,
            "tasb": 48.1
          }
        },
        {
          "label": "BioASQ",
          "values": {
            "bm25": 46.5,
            "dpr": 12.7,
            "tasb": 38.3
          }
        },
        {
          "label": "FiQA-2018",
          "values": {
            "bm25": 23.6,
            "dpr": 11.2,
            "tasb": 30.0
          }
        },
        {
          "label": "Touché-2020",
          "values": {
            "bm25": 36.7,
            "dpr": 13.1,
            "tasb": 16.2
          }
        }
      ],
      "caption": "Redrawn from Table 2 of Thakur et al., 2021,[^3] ten of the 18 datasets, scores multiplied by 100. MS MARCO is in-domain for TAS-B and Natural Questions is in-domain for DPR; every other bar is zero-shot. Averaged over all datasets, DPR is 47.7% below BM25 and TAS-B is 2.8% below."
    },
    {
      "type": "p",
      "text": "Not all dense retrievers generalize as badly as DPR. TAS-B, trained on MS MARCO with in-batch negatives and a Margin-MSE loss distilled from stronger teacher models, was the best dense model in BEIR. It beat DPR on 17 of 18 datasets and finished 2.8% below BM25 on average.[^3] Even so, the authors found dense models underperforming on datasets with a large domain shift from their training data, such as BioASQ, and on task shifts such as Touché-2020, an argument retrieval set where TAS-B scored 0.162 against BM25's 0.367.[^3] They also found TAS-B favouring short documents. It trailed ANCE, another dense model, by 7.8 points on Touché-2020, where the median top-10 document it retrieved was 14 words long against 89 for ANCE, and the authors attribute the preference to its loss function.[^3] The one family that beat BM25 on 16 of 18 datasets was not a first-stage retriever at all, but a cross-encoder reranking BM25's top 100, at about 450 ms per query on a GPU.[^3]"
    },
    {
      "type": "h2",
      "text": "Adding the scores, or adding the ranks"
    },
    {
      "type": "p",
      "text": "DPR's own hybrid took the top 2,000 passages from each retriever and reranked their union by a weighted sum of the two scores, \\(\\text{BM25}(q,p) + \\lambda \\cdot \\text{sim}(q,p)\\), with \\(\\lambda = 1.1\\) chosen on the development set.[^2] The results were mixed. On CuratedTREC the single-dataset hybrid rose from 79.8% to 85.2% top-20, but on Natural Questions it fell from 78.4% to 76.6%.[^2]"
    },
    {
      "type": "p",
      "text": "A 2021 replication by Xueguang Ma and colleagues at the University of Waterloo changed that picture. Their BM25, built on Anserini, scored 62.9% top-20 on Natural Questions where the original paper reported 59.1%, and averaged nearly seven points higher at top 20 across the five datasets.[^4] With the stronger baseline, a tuned hybrid reached 82.6% on Natural Questions against 79.5% for dense retrieval alone, a statistically significant gain, and the authors report an average improvement of about three points in top-20 accuracy over the best DPR results.[^4] They also point out a practical problem with adding raw scores: DPR's dot products and BM25's sums live on very different ranges, so the weight has to be tuned per dataset. They tuned the weight separately for each dataset by grid search, and also tried a normalization that fills in a missing score with the lowest score the other retriever returned.[^4]"
    },
    {
      "type": "p",
      "text": "Reciprocal rank fusion (RRF), from Cormack, Clarke and Büttcher at SIGIR 2009, sidesteps score ranges by ignoring scores entirely.[^5] Given a set of rankings \\(R\\), each document gets:"
    },
    {
      "type": "eq",
      "tex": "\\text{RRF}(d)=\\sum_{r\\in R}\\frac{1}{k+r(d)}",
      "caption": "From Cormack, Clarke and Büttcher, 2009.[^5]"
    },
    {
      "type": "p",
      "text": "\\(r(d)\\) is the document's rank in one input list, starting at 1, and the sum runs over every list. \\(k\\) is a constant the authors fixed at 60 in a pilot study and never changed. They wrote that highly ranked documents should count more, but that lower-ranked ones should not vanish the way they would under an exponential weighting, and that \\(k\\) reduces the pull of an outlier system that ranks something first.[^5] With \\(k = 60\\), rank 1 contributes 1/61 and rank 10 contributes 1/70, so a document ranked fifth in both lists (2/65) beats one ranked first in one list and missing from the other (1/61). In their pilot, varying \\(k\\) from 10 to 100 changed MAP only between 0.2123 and 0.2147, so the choice was not critical.[^5]"
    },
    {
      "type": "p",
      "text": "Across their pilot and TREC experiments, RRF beat Condorcet fusion, CombMNZ, and the best single system by 4% to 5% on average. On the LETOR 3 learning-to-rank data it beat every individual ranker, the best by 0.02 MAP.[^5] The authors conjecture that RRF harnesses diversity within the rankings better: \"One or two systems that rank a document highly can substantially improve its rank relative to the more popular documents.\"[^5] One caveat: those experiments fused TREC runs and learning-to-rank models, not BM25 and a dense retriever. The DPR hybrids above were weighted score sums. None of the five papers here tests RRF on a BM25 list and a dense list, so the 4% to 5% is a result for fusion in general, not for this pairing."
    },
    {
      "type": "h2",
      "text": "The judgements were built with keyword search"
    },
    {
      "type": "p",
      "text": "BEIR's authors state a limitation that cuts against their own headline. To label a retrieval dataset, annotators judge a pool of candidates that existing systems retrieved, and anything outside the pool counts as irrelevant. Many BEIR datasets built that pool with lexical systems like BM25.[^3] A dense retriever that finds a relevant document with no shared words gets no credit for it."
    },
    {
      "type": "p",
      "text": "They measured the size of the effect on TREC-COVID by counting holes, top-10 results that no annotator had ever judged. BM25 had 6.4%. DPR had 30.6% and TAS-B 31.8%.[^3] The authors then judged 980 missing query-document pairs themselves, without knowing which system had retrieved each one. BM25 moved from 0.656 to 0.668 nDCG@10. DPR moved from 0.332 to 0.445, and ANCE from 0.654, just below BM25, to 0.735.[^3] My reading is that some unknown share of BM25's lead in the chart above, on the datasets pooled lexically, is BM25 being graded by a test it helped write. The authors put it more carefully. TREC-COVID pooled results from many teams' systems, and they still found its pool biased toward lexical approaches, with holes that negatively affect non-lexical ones. Better datasets that use diverse pooling strategies, they write, are needed for a fair evaluation of retrieval approaches.[^3]"
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        {
          "title": "Robertson and Zaragoza, The Probabilistic Relevance Framework: BM25 and Beyond, Foundations and Trends in Information Retrieval 3(4), 2009",
          "url": "https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf"
        },
        {
          "title": "Karpukhin et al., Dense Passage Retrieval for Open-Domain Question Answering, EMNLP 2020",
          "url": "https://arxiv.org/abs/2004.04906"
        },
        {
          "title": "Thakur et al., BEIR: A Heterogeneous Benchmark for Zero-shot Evaluation of Information Retrieval Models, NeurIPS Datasets and Benchmarks 2021",
          "url": "https://arxiv.org/abs/2104.08663"
        },
        {
          "title": "Ma, Sun, Pradeep, and Lin, A Replication Study of Dense Passage Retriever, 2021",
          "url": "https://arxiv.org/abs/2104.05740"
        },
        {
          "title": "Cormack, Clarke, and Büttcher, Reciprocal Rank Fusion outperforms Condorcet and individual Rank Learning Methods, SIGIR 2009",
          "url": "https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf"
        }
      ]
    }
  ]
};

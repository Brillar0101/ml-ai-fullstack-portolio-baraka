// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
// Every factual claim is taken from the numbered sources at the end. The SBERT
// architecture figure is reproduced under CC BY-SA 4.0 (arXiv 1908.10084); the
// MTEB chart is redrawn from Table 1 of arXiv 2210.07316, whose license does not
// allow reuse.
export const POST = {
  "id": "embeddings-meaning-vectors",
  "title": "Three generations of embeddings, and what each one measured",
  "excerpt": "Pairwise BERT needed about 65 hours to find the closest pair among 10,000 sentences; SBERT embeddings did it in about 5 seconds. How word2vec, Sentence-BERT and MTEB changed what a good text vector means, what the geometry also encodes, and how the scores are measured.",
  "category": "ML",
  "chapter": "Chapter 3",
  "tags": [
    "Embeddings",
    "Similarity",
    "Evaluation"
  ],
  "seriesNum": 24,
  "publishAt": "2026-05-13T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In August 2019 Nils Reimers and Iryna Gurevych put a price on a question every search system asks: which two sentences in this pile mean the same thing? With BERT, the strongest sentence-pair model of the time, both sentences go into the network together and it predicts a score. For a collection of 10,000 sentences that means n(n−1)/2 = 49,995,000 passes through the network, which they measured at about 65 hours on a V100 GPU.[^1] Their modified network, Sentence-BERT (SBERT), ran each sentence through once to get a vector. Computing all 10,000 vectors took about 5 seconds and comparing them with cosine similarity took about 0.01 seconds.[^1] The same paper notes that matching one new question against Quora's more than 40 million existing ones would need over 50 hours per query with pairwise BERT.[^1]"
    },
    {
      "type": "p",
      "text": "That gap is the whole commercial case for embeddings. Comparing two lists of numbers is cheap, and running a large network on every pair is not. The catch is that the cheap comparison is only worth anything if the geometry of the vectors actually tracks meaning, and what counted as \"tracks meaning\" changed a lot between 2013 and 2022. Three papers mark the generations: word2vec made word vectors cheap to train, SBERT made sentence vectors from a pretrained transformer usable, and MTEB showed that no single embedder was best at everything."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Embedding",
          "def": "A fixed-length list of numbers (a vector) that a model assigns to a word, sentence, or passage. Texts with similar meaning are supposed to get vectors that point in similar directions."
        },
        {
          "term": "Cosine similarity",
          "def": "The cosine of the angle between two vectors. It is 1 when they point the same way, 0 when they are at right angles, and ignores their lengths."
        },
        {
          "term": "Cross-encoder",
          "def": "A model that reads two texts together and outputs one score for the pair. Accurate, but it produces no reusable vector, so every new pair costs a full forward pass."
        },
        {
          "term": "Bi-encoder",
          "def": "A model that encodes each text on its own into a vector. Vectors are computed once and compared with a cheap similarity function. SBERT is one."
        },
        {
          "term": "Spearman correlation",
          "def": "A score from −1 to 1 for how well two rankings agree. Embedding papers use it to compare the ranking of pairs by cosine similarity against the ranking by human similarity labels."
        }
      ]
    },
    {
      "type": "h2",
      "text": "2013: word vectors trained by predicting neighbors"
    },
    {
      "type": "p",
      "text": "Before word2vec, many NLP systems treated words as atomic units: indices into a vocabulary, with no notion that one word is similar to another.[^2] Neural language models already learned word vectors, but most of their compute went into a dense nonlinear hidden layer. Tomas Mikolov and colleagues at Google removed that layer and proposed two log-linear models. CBOW predicts a word from its surrounding words. Skip-gram does the reverse: it uses the current word to predict words within a window before and after it.[^2] A follow-up paper wrote the skip-gram training goal down explicitly:[^3]"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} \\frac{1}{T}\\sum_{t=1}^{T}\\;\\sum_{-c\\le j\\le c,\\;j\\ne 0} \\log p(w_{t+j}\\mid w_t) \\\\[6pt] p(w_O\\mid w_I)=\\frac{\\exp\\!\\big({v'_{w_O}}^{\\top} v_{w_I}\\big)}{\\sum_{w=1}^{W}\\exp\\!\\big({v'_{w}}^{\\top} v_{w_I}\\big)} \\end{gathered}",
      "caption": "The skip-gram objective and its basic softmax, equations 1 and 2 of Mikolov et al., 2013b.[^3] Training maximizes the first line."
    },
    {
      "type": "p",
      "text": "Read it term by term. The training text is a sequence of \\(T\\) words \\(w_1, \\dots, w_T\\). For each position \\(t\\), the inner sum runs over neighbors up to \\(c\\) words away, where \\(c\\) is the size of the training context. \\(p(w_{t+j}\\mid w_t)\\) is the probability the model gives to seeing that neighbor, given the center word. Each word has two vectors: an input vector \\(v_w\\), used when the word is the center, and an output vector \\(v'_w\\), used when it is the thing being predicted. The dot product \\({v'_{w_O}}^{\\top} v_{w_I}\\) is large when the two vectors point the same way, and the softmax turns those dot products into probabilities over the vocabulary of \\(W\\) words.[^3] So a word's vector is pushed toward the output vectors of the words it tends to appear near, and words that share neighbors end up pointing in similar directions."
    },
    {
      "type": "p",
      "text": "The denominator is the problem. It sums over the whole vocabulary, which the authors put at \\(10^5\\) to \\(10^7\\) terms, for every single training example.[^3] Their fix, **negative sampling**, replaces each \\(\\log p(w_O\\mid w_I)\\) with a small logistic-regression task: raise \\(\\log\\sigma({v'_{w_O}}^{\\top} v_{w_I})\\) for the real neighbor and lower the score of \\(k\\) random noise words drawn from the unigram distribution raised to the 3/4 power. Here \\(\\sigma\\) is the sigmoid function. They found \\(k\\) of 5 to 20 useful for small datasets and 2 to 5 enough for large ones.[^3]"
    },
    {
      "type": "p",
      "text": "The measurement they built for this was the analogy test. To answer \"what is to small as biggest is to big,\" compute vector(biggest) − vector(big) + vector(small), then return the word whose vector is closest by cosine distance, excluding the three question words.[^2] Their test set had 8,869 semantic questions (such as capital cities and currencies) and 10,675 syntactic ones (such as plurals and past tenses). Only an exact match counted, so a synonym scored as a miss, and the authors said 100% was likely impossible.[^2]"
    },
    {
      "type": "p",
      "text": "On the same 320 million words of training data with 640-dimensional vectors, vectors from a recurrent language model got 9% of the semantic questions right; skip-gram got 55%.[^2] Scaled up to Google News (about 6 billion tokens) with 1,000 dimensions, skip-gram reached 66.1% semantic, 65.1% syntactic and 65.6% overall, trained in 2.5 days on about 125 CPU cores. A feedforward neural language model with 100-dimensional vectors reached 50.8% and took 14 days on about 180 cores.[^2] In the follow-up, negative sampling with 15 noise words scored 61% overall against 47% for a Huffman-tree hierarchical softmax, and discarding frequent words (subsampling) cut its training time from 97 to 36 minutes with the same total accuracy.[^3]"
    },
    {
      "type": "p",
      "text": "The same paper also names what this generation cannot do. It calls this an inherent limitation of word representations: \"their indifference to word order and their inability to represent idiomatic phrases.\" The meanings of \"Canada\" and \"Air\" do not combine into \"Air Canada.\"[^3] Their workaround was to detect frequent phrases and give each its own token.[^3] Each word or phrase still got exactly one vector, whatever sentence it appeared in."
    },
    {
      "type": "h2",
      "text": "2019: BERT could compare sentences but not embed them"
    },
    {
      "type": "p",
      "text": "Transformers such as BERT use self-attention to make each word's representation depend on its context, which word vectors like GloVe lack.[^4] That addresses the one-vector-per-word problem, but BERT was built as a cross-encoder: it gives one score per pair and no standalone sentence vector.[^1] People worked around this by feeding in a single sentence and either averaging the output layer or taking the output of the special [CLS] token. Reimers and Gurevych measured both. Across seven semantic textual similarity (STS) tasks, averaged BERT outputs scored 54.81 and the [CLS] vector 29.19 (Spearman correlation × 100). Plain averaged GloVe word vectors, a word-vector method from 2014, scored 61.32.[^1] Out of the box, BERT's vector space was worse for cosine similarity than static word vectors."
    },
    {
      "type": "p",
      "text": "SBERT keeps BERT and changes the training. A pooling step (by default, the mean of all output vectors) turns BERT's per-token outputs into one fixed-size vector. Two copies of the network with shared weights, a siamese network, encode sentence A and sentence B separately into vectors \\(u\\) and \\(v\\). When training on labeled sentence pairs, the two vectors feed a small classifier:[^1]"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} o=\\mathrm{softmax}\\big(W_t\\,(u,\\;v,\\;|u-v|)\\big) \\\\[4pt] W_t\\in\\mathbb{R}^{3n\\times k} \\end{gathered}",
      "caption": "SBERT's classification objective, section 3 of Reimers and Gurevych, 2019.[^1] Training minimizes cross-entropy on \\(o\\)."
    },
    {
      "type": "p",
      "text": "Here \\(u\\) and \\(v\\) are the two sentence embeddings, each with \\(n\\) numbers. \\(|u-v|\\) is their element-wise absolute difference. The three are concatenated into one vector of length \\(3n\\), which a trainable weight matrix \\(W_t\\) maps to \\(k\\) scores, one per label, and the softmax turns those into probabilities \\(o\\).[^1] For training data they used 570,000 SNLI and 430,000 MultiNLI sentence pairs labeled contradiction, entailment or neutral, trained for one epoch.[^1] In the ablation, the difference term \\(|u-v|\\) was the most important component, and adding the element-wise product \\(u * v\\) made results worse.[^1] The classifier is thrown away after training. At inference only \\(u\\), \\(v\\) and cosine similarity are used, so the loss teaches the encoder to put sentences with the same meaning close together and sentences with different meaning further apart.[^1] A second, regression objective trains on the cosine similarity of \\(u\\) and \\(v\\) directly, with mean squared error against a gold score.[^1]"
    },
    {
      "type": "image",
      "src": "/blog-images/embeddings-meaning-vectors/sbert-siamese-architecture.webp",
      "alt": "Two block diagrams side by side. Left: Sentence A and Sentence B each pass through BERT and a pooling layer to give vectors u and v, which are combined as (u, v, |u-v|) and fed to a softmax classifier. Right: the same two towers produce u and v, which go into cosine-sim(u, v) with an output range of -1 to 1.",
      "width": 1660,
      "height": 740,
      "caption": "Left, SBERT during training with the classification objective. Right, SBERT at inference, where only cosine similarity is computed. The two BERT towers share weights. Figures 1 and 2 from Reimers and Gurevych, 2019,[^1] reproduced under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)."
    },
    {
      "type": "p",
      "text": "Trained only on NLI data, SBERT-NLI-large averaged 76.55 on the seven STS tasks. The paper reports that as 11.7 points above InferSent and 5.5 points above Universal Sentence Encoder, two earlier sentence embedders it names as state of the art.[^1] Averaged BERT outputs had managed 54.81, so the same underlying network gained more than 20 points from a change of objective alone."
    },
    {
      "type": "p",
      "text": "The paper is also clear about what the speedup costs. When both kinds of model were trained on NLI and then on the STS benchmark, the BERT-large cross-encoder scored 88.77 on the benchmark's test set and SBERT-large scored 86.10.[^1] On argument pairs from an unseen debate topic, the gap was about 7 points of Spearman correlation: 60.34 for the BERT-large cross-encoder against 53.10 for SBERT-large.[^1] Their explanation is that BERT can use attention to compare the two sentences word by word, while SBERT has to place each sentence in the vector space alone, without seeing the other one.[^1] A bi-encoder buys its speed by committing to a vector before it knows what it will be compared with."
    },
    {
      "type": "h2",
      "text": "2022: 58 datasets and no model on top of all of them"
    },
    {
      "type": "p",
      "text": "By 2022 there were dozens of sentence embedders, and most were judged on a narrow slice of tasks. The MTEB authors point out that SBERT itself was evaluated only on STS and classification, and that STS is known to correlate poorly with other real-world uses.[^4] The Massive Text Embedding Benchmark (MTEB) spans 8 task types, 58 datasets and 112 languages, and the paper benchmarked 33 models on it.[^4] Almost every task reduces to one operation between two vectors:"
    },
    {
      "type": "eq",
      "tex": "\\cos(u, v)=\\frac{u\\cdot v}{\\lVert u\\rVert\\,\\lVert v\\rVert}=\\frac{\\sum_{i=1}^{n} u_i v_i}{\\sqrt{\\sum_{i} u_i^2}\\,\\sqrt{\\sum_{i} v_i^2}}",
      "caption": "Cosine similarity between two embeddings. MTEB uses it to rank documents in retrieval and reranking, to find translation pairs in bitext mining, and as the basis of the main STS and summarization metrics.[^4]"
    },
    {
      "type": "p",
      "text": "\\(u\\) and \\(v\\) are two embeddings with \\(n\\) components each, and \\(u_i\\) is the \\(i\\)-th number in \\(u\\). The top, \\(u\\cdot v\\), is the dot product: multiply matching components and add them up. The bottom divides by the two lengths \\(\\lVert u\\rVert\\) and \\(\\lVert v\\rVert\\), so only direction matters. In retrieval, each query and each document is embedded, documents are ranked by cosine similarity to the query, and nDCG@10, a score for how well the top ten results are ordered, is the main metric. In STS, the main metric is the Spearman correlation between cosine similarities and human labels. Classification is the exception: a logistic-regression classifier is trained on the embeddings and scored on accuracy.[^4]"
    },
    {
      "type": "p",
      "text": "The headline finding is in the paper's abstract: no particular text embedding method dominates across all tasks.[^4] ST5-XXL, built on the encoder of T5 and fine-tuned on NLI, had the best overall average at 59.51 and the best classification and STS scores. It lost retrieval to SGPT-5.8B-msmarco, a GPT-style decoder fine-tuned for retrieval on MS MARCO, by 42.24 to 50.25.[^4] Models tuned for STS did badly at retrieval, and retrieval models did badly at STS. The authors connect this to asymmetry: retrieval compares two different kinds of text, short queries and longer documents, while STS compares two texts of the same kind.[^4] MPNet, almost 50 times smaller than ST5-XXL, matched it on clustering (43.69 against 43.71) and led reranking at 59.36.[^4]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "MTEB English averages by task type, four models",
      "yLabel": "Average of main metric",
      "series": [
        {
          "label": "GloVe",
          "key": "glove",
          "baseline": true
        },
        {
          "label": "MPNet",
          "key": "mpnet"
        },
        {
          "label": "SGPT-5.8B-msmarco",
          "key": "sgpt"
        },
        {
          "label": "ST5-XXL",
          "key": "st5"
        }
      ],
      "data": [
        {
          "label": "Classification",
          "values": {
            "glove": 57.29,
            "mpnet": 65.07,
            "sgpt": 68.13,
            "st5": 73.42
          }
        },
        {
          "label": "Clustering",
          "values": {
            "glove": 27.73,
            "mpnet": 43.69,
            "sgpt": 40.35,
            "st5": 43.71
          }
        },
        {
          "label": "Reranking",
          "values": {
            "glove": 43.29,
            "mpnet": 59.36,
            "sgpt": 56.56,
            "st5": 56.43
          }
        },
        {
          "label": "Retrieval",
          "values": {
            "glove": 21.62,
            "mpnet": 43.81,
            "sgpt": 50.25,
            "st5": 42.24
          }
        },
        {
          "label": "STS",
          "values": {
            "glove": 61.85,
            "mpnet": 80.28,
            "sgpt": 78.1,
            "st5": 82.63
          }
        }
      ],
      "caption": "Redrawn from Table 1 of Muennighoff et al., 2023.[^4] Five of the seven English task types shown. ST5-XXL leads three of these five by a small or large margin, SGPT-5.8B-msmarco leads retrieval, and MPNet leads reranking. Each score is the task's main metric averaged over its datasets."
    },
    {
      "type": "p",
      "text": "Two other patterns in that table cut against intuition. First, the gap between self-supervised and supervised models was still large. Plain BERT scored 10.59 on retrieval, lower than GloVe's 21.62.[^4] The authors conclude that language models still seemed to need supervised fine-tuning to produce competitive embeddings.[^4] Second, scores rose strongly with model size, but the largest models were also the slowest, and SGPT-5.8B's high-dimensional vectors need more storage.[^4] Their efficiency analysis sorts models into three groups: word-embedding models like GloVe for maximum speed, the fine-tuned MPNet and MiniLM models for a balance of speed and quality, and GTR-XXL, ST5-XXL or SGPT-5.8B when quality matters more than latency.[^4]"
    },
    {
      "type": "h2",
      "text": "What the Google News vectors also learned"
    },
    {
      "type": "p",
      "text": "Geometry that picks up \"Paris is to France as Rome is to Italy\" from co-occurrence will pick up whatever else co-occurs. In 2016 Tolga Bolukbasi and colleagues studied the publicly released word2vec vectors trained on Google News: 3 million English words and terms in 300 dimensions.[^5] The same analogy arithmetic that answers man:king :: woman:x with queen also returns man:computer programmer :: woman:homemaker, and says a father is to a doctor as a mother is to a nurse.[^5] One might have hoped for little gender bias, the authors write, since many of the articles' authors are professional journalists.[^5]"
    },
    {
      "type": "p",
      "text": "They made the bias measurable. First they took the difference vectors of ten gender pairs such as she and he, and found that one principal component explained most of their variance. They called that unit vector the gender direction \\(g\\).[^5] Occupation words projected onto the she−he axis correlated with crowd workers' stereotype ratings at Spearman ρ = 0.51. The projections were also highly consistent between the word2vec vectors and GloVe vectors trained on a web crawl (ρ = 0.81), which suggests the bias was not an artifact of one corpus or one algorithm.[^5] For a set \\(N\\) of words that ought to be gender neutral, they defined direct bias as the average alignment with that direction:"
    },
    {
      "type": "eq",
      "tex": "\\mathrm{DirectBias}_c=\\frac{1}{|N|}\\sum_{w\\in N}\\big|\\cos(\\vec{w},\\,g)\\big|^{c}",
      "caption": "Direct bias, section 5.2 of Bolukbasi et al., 2016.[^5] The exponent \\(c\\) sets how strict the measure is."
    },
    {
      "type": "p",
      "text": "\\(\\vec{w}\\) is a word's vector, \\(|N|\\) is the number of neutral words, and \\(|\\cos(\\vec{w}, g)|\\) is how strongly that word leans toward either end of the gender direction. With \\(c = 1\\) the measure is a plain average. Over 327 occupation words, the Google News vectors scored 0.08, which the authors read as many occupations carrying a substantial gender component.[^5] In a crowd study, workers judged 19% of the top 150 generated she-he analogies to be stereotypes. After the authors' hard-debiasing step, which removes the gender component from words that should be neutral, the figure fell to 6%.[^5] The puzzle he:doctor :: she:x went from nurse to physician.[^5] Scores on two word-similarity benchmarks and an analogy benchmark barely moved: 62.3 to 62.4, 54.5 to 54.1, and 57.0 to 57.0.[^5]"
    },
    {
      "type": "p",
      "text": "My reading, not a claim from any of these papers: there is no separate channel for bias. The offset arithmetic that earned skip-gram its 65.6% is the same operation that produced homemaker. The bias measurements above are for static word vectors; none of the five papers cited here measures gender bias in SBERT-style sentence encoders or in the MTEB models, so it is unknown from these sources how much of it survives into them."
    },
    {
      "type": "h2",
      "text": "The average score leans toward the big task types"
    },
    {
      "type": "p",
      "text": "The MTEB appendix lists the benchmark's own limitations, and one of them bears directly on how people use it. Task types have different numbers of datasets: summarization has one, pair classification three, retrieval fifteen, classification twelve and clustering eleven.[^4] The overall MTEB score averages over datasets, so, in the authors' words, it is biased toward the task types with many datasets, notably retrieval, classification and clustering.[^4] The same appendix notes that the longest texts in MTEB are a few hundred words, that retrieval and clustering are English-only, and that there are no code datasets.[^4] A model that sits at the top of the average may therefore be the best retrieval and classification model on short English text, and nothing more is guaranteed by that one number."
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        {
          "title": "Reimers and Gurevych, Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks, EMNLP 2019",
          "url": "https://arxiv.org/abs/1908.10084"
        },
        {
          "title": "Mikolov, Chen, Corrado, and Dean, Efficient Estimation of Word Representations in Vector Space, 2013",
          "url": "https://arxiv.org/abs/1301.3781"
        },
        {
          "title": "Mikolov, Sutskever, Chen, Corrado, and Dean, Distributed Representations of Words and Phrases and their Compositionality, NeurIPS 2013",
          "url": "https://arxiv.org/abs/1310.4546"
        },
        {
          "title": "Muennighoff, Tazi, Magne, and Reimers, MTEB: Massive Text Embedding Benchmark, EACL 2023",
          "url": "https://arxiv.org/abs/2210.07316"
        },
        {
          "title": "Bolukbasi, Chang, Zou, Saligrama, and Kalai, Man is to Computer Programmer as Woman is to Homemaker? Debiasing Word Embeddings, NeurIPS 2016",
          "url": "https://arxiv.org/abs/1607.06520"
        }
      ]
    }
  ]
};

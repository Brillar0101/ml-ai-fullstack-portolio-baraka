// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
// Every factual claim is taken from the numbered sources at the end. The
// popularity chart is redrawn from the bars of Figure 1 in arXiv 2212.10511
// (CC BY 4.0); its values were measured from the figure's vector geometry,
// since the paper does not print them. The human evaluation chart is redrawn
// from Table 4 of arXiv 2005.11401, whose arXiv license does not allow reuse.
export const POST = {
  "id": "what-rag-is",
  "title": "What RAG is, and why it helps with obscure facts more than famous ones",
  "excerpt": "On 4,000 long-tail questions GPT-3 davinci-003 was right 19% of the time, and a 2.7B model with one retrieved paragraph beat it. On famous subjects the same retrieval made answers worse. Where retrieval-augmented generation came from (REALM and RAG), what its equation says, and when to skip the search.",
  "category": "AI",
  "chapter": "Chapter 6",
  "tags": [
    "RAG",
    "Retrieval",
    "Research"
  ],
  "seriesNum": 10,
  "publishAt": "2026-02-04T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In December 2022 a team from the University of Washington, Johns Hopkins and the Allen Institute for AI released a question set designed to find where language models stop knowing things.[^1] PopQA has about 14,000 questions. Each one comes from a (subject, relation, object) fact sampled from Wikidata across 16 relation types, turned into a question by a hand-written template: \"What is the capital of Louisiana?\" or \"What is Kathy Saltzman's occupation?\" Every question also carries a popularity score, the monthly Wikipedia page views of its subject.[^1] Louisiana gets a lot of views. Kathy Saltzman, a politician, gets few."
    },
    {
      "type": "p",
      "text": "The models did badly on the obscure end, and size barely helped there. On the 4,000 least popular questions, GPT-NeoX 20B answered 16% correctly and GPT-3 davinci-003 answered 19%.[^1] Most of the gain from scaling came from questions whose subject had more than about 10,000 monthly views; below that, accuracy stayed roughly flat as models grew.[^1] Then the authors pasted one retrieved Wikipedia paragraph in front of each question. With that single paragraph, a 2.7 billion parameter GPT-Neo beat unassisted davinci-003 on those same 4,000 long-tail questions.[^1]"
    },
    {
      "type": "p",
      "text": "The surprise was at the other end. For popular subjects, retrieval \"doesn't help much or even hurts the performance,\" the paper reports, because the model already knew the answer and the retrieved text could mislead it.[^1] So the authors built a rule that retrieves only for questions below a popularity threshold. With davinci-003 it reached 46.5% accuracy on PopQA, which they report as 5.3% higher than any non-adaptive method, and it cut GPT-3 API costs by about half.[^1]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "GPT-3 accuracy on PopQA by subject popularity",
      "yLabel": "Accuracy (%)",
      "series": [
        {
          "label": "Model alone",
          "key": "lm",
          "baseline": true
        },
        {
          "label": "With a retrieved passage",
          "key": "rag"
        }
      ],
      "data": [
        { "label": "~20", "values": { "lm": 28, "rag": 38 } },
        { "label": "~100", "values": { "lm": 18, "rag": 37 } },
        { "label": "~500", "values": { "lm": 22, "rag": 36 } },
        { "label": "~2.5k", "values": { "lm": 34, "rag": 38 } },
        { "label": "~12k", "values": { "lm": 52, "rag": 43 } },
        { "label": "~60k", "values": { "lm": 70, "rag": 60 } },
        { "label": "~290k", "values": { "lm": 84, "rag": 77 } }
      ],
      "caption": "Redrawn from Figure 1 of Mallen et al., 2023,[^1] whose paper is licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The paper does not print these values; they were measured from the figure's bar heights and rounded, so treat them as approximate. Bucket labels are the approximate monthly page views at each bucket's center, read off the figure's log axis. The paper's retrieval threshold falls between the fourth and fifth buckets."
    },
    {
      "type": "p",
      "text": "That chart is the condition this post is about. Retrieval is a patch for what a model never memorized, and for what it did memorize the patch can do harm. To see why both halves follow from how the method works, it helps to go back to the two 2020 papers that defined it."
    },
    {
      "type": "h2",
      "text": "Two places a model can keep a fact"
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Parametric memory",
          "def": "knowledge stored in the model's weights during training. You cannot read it directly or edit one fact at a time."
        },
        {
          "term": "Non-parametric memory",
          "def": "knowledge stored outside the model as text, usually an index of passages, that the model reads at answer time. You can inspect it and swap it out."
        },
        {
          "term": "Retriever",
          "def": "the component that scores passages against the input and returns the best few. A dense retriever compares embedding vectors; BM25 counts overlapping words."
        },
        {
          "term": "Marginalize",
          "def": "sum a probability over every value of a hidden choice, weighted by how likely each choice is. In RAG the hidden choice is which passage to read."
        },
        {
          "term": "Long tail",
          "def": "the many facts that each appear rarely, such as details about entities few people look up."
        }
      ]
    },
    {
      "type": "p",
      "text": "Both founding papers start from the same complaint. Pre-trained models store a surprising amount of world knowledge, but it sits implicitly in their parameters, so it is hard to tell what the network knows or where, and covering more facts means training ever larger networks.[^2] The RAG paper adds that such models cannot easily revise their memory, cannot show where an answer came from, and may hallucinate.[^3]"
    },
    {
      "type": "h2",
      "text": "REALM put a retriever inside pre-training"
    },
    {
      "type": "p",
      "text": "REALM, from Google Research in February 2020, attached a learned retriever to a BERT-style masked language model.[^2] Before predicting a masked word, the model retrieves documents from a corpus such as Wikipedia and reads them alongside the input. The paper writes the whole thing as a two-step generative process, retrieve then predict, and treats the retrieved document \\(z\\) as a hidden variable to sum out:[^2]"
    },
    {
      "type": "eq",
      "tex": "p(y \\mid x) = \\sum_{z \\in \\mathcal{Z}} p(y \\mid z, x)\\, p(z \\mid x)",
      "caption": "Equation 1 of Guu et al., 2020.[^2] \\(\\mathcal{Z}\\) is the whole knowledge corpus; in practice the sum runs over the top \\(k\\) documents."
    },
    {
      "type": "p",
      "text": "The retriever scores a document by the inner product of two BERT embeddings, one for the input and one for the document, and turns the scores into probabilities with a softmax.[^2] The part I find most useful is the paper's gradient analysis. For each document, training nudges the retriever's score up if the document makes the correct answer more likely than the average document does, and down if it makes it less likely. In the paper's words, a document \"receives a positive update whenever it performs better than expected.\"[^2] Nobody labels which document is relevant. The prediction loss decides."
    },
    {
      "type": "p",
      "text": "That cost engineering. The document embeddings go stale every time the retriever's weights change, so REALM re-embedded and re-indexed its roughly 13 million Wikipedia chunks asynchronously every few hundred training steps.[^2] It also added a null document to the retrieved set so that masked words needing no world knowledge had somewhere to put their credit.[^2] Fine-tuned for open-domain question answering, REALM scored 40.4 exact match on Natural Questions, above the 34.5 of T5 with 11 billion parameters, while being about 30 times smaller.[^2] But REALM extracts its answers as spans copied from a retrieved document. It cannot write new text."
    },
    {
      "type": "h2",
      "text": "RAG made the passage a hidden variable for a text generator"
    },
    {
      "type": "p",
      "text": "Three months later Patrick Lewis and colleagues at Facebook AI Research, UCL and NYU named the idea retrieval-augmented generation and applied it to sequence-to-sequence models, which generate free text.[^3] Their parametric memory is BART-large, a 400 million parameter pre-trained encoder-decoder.[^3,6] Their non-parametric memory is the December 2018 Wikipedia split into 100-word chunks, 21 million passages in all, embedded by the dense passage retriever DPR and searched with a FAISS index.[^3,4] The retrieved passage is simply concatenated to the input before BART reads it.[^3]"
    },
    {
      "type": "p",
      "text": "The paper gives two ways to sum out the passage. The first, RAG-Sequence, assumes one passage is responsible for the whole answer:[^3]"
    },
    {
      "type": "eq",
      "tex": "\\begin{aligned} p_{\\text{RAG-Seq}}(y \\mid x) &\\approx \\sum_{z \\in \\text{top-}k} p_\\eta(z \\mid x)\\, p_\\theta(y \\mid x, z) \\\\ &= \\sum_{z \\in \\text{top-}k} p_\\eta(z \\mid x) \\\\ &\\qquad \\times \\prod_{i=1}^{N} p_\\theta(y_i \\mid x, z, y_{1:i-1}) \\end{aligned}",
      "caption": "The RAG-Sequence model, Section 2.1 of Lewis et al., 2020.[^3]"
    },
    {
      "type": "p",
      "text": "Read it term by term. \\(x\\) is the input, a question for example, and \\(y\\) is the output of \\(N\\) tokens. \\(p_\\eta(z \\mid x)\\) is the retriever's probability for passage \\(z\\), with \\(\\eta\\) its weights. It is proportional to \\(\\exp(d(z)^\\top q(x))\\), where \\(d(z)\\) is a BERT embedding of the passage and \\(q(x)\\) a BERT embedding of the query.[^3] \"top-\\(k\\)\" means the sum only visits the \\(k\\) highest scoring passages, found by maximum inner product search, instead of all 21 million; the paper used 5 or 10 during training.[^3] \\(p_\\theta(y \\mid x, z)\\) is the generator's probability of the whole output when it reads \\(x\\) with passage \\(z\\) attached, and the product on the second line spells it out as one token at a time, each conditioned on the tokens before it.[^3]"
    },
    {
      "type": "p",
      "text": "Put together, each retrieved passage produces its own complete answer, and the final probability is a weighted vote across passages, weighted by how much the retriever trusts each one. Training minimizes the negative log of this summed probability, with no signal about which passage was right.[^3] Unlike REALM, RAG keeps the document encoder and index frozen and fine-tunes only the query encoder and BART; the authors found index refreshing unnecessary for strong results.[^3] The second variant, RAG-Token, moves the sum inside the product so that each generated token can lean on a different passage:[^3]"
    },
    {
      "type": "eq",
      "tex": "\\begin{aligned} p_{\\text{RAG-Tok}}(y \\mid x) &\\approx \\prod_{i=1}^{N} \\Big( \\sum_{z \\in \\text{top-}k} p_\\eta(z \\mid x) \\\\ &\\qquad \\times p_\\theta(y_i \\mid x, z, y_{1:i-1}) \\Big) \\end{aligned}",
      "caption": "The RAG-Token model, Section 2.1 of Lewis et al., 2020.[^3]"
    },
    {
      "type": "p",
      "text": "The difference shows up at decoding time. RAG-Token behaves like an ordinary generator and works with a standard beam search. RAG-Sequence does not break into per-token probabilities, so it runs a beam search per passage and then needs extra forward passes to score candidates that appeared in some beams but not others; the paper offers a cheaper approximation that skips those passes.[^3]"
    },
    {
      "type": "h2",
      "text": "What RAG measured, including the human raters"
    },
    {
      "type": "p",
      "text": "On open-domain question answering RAG-Sequence reached 44.5 exact match on Natural Questions, against 41.5 for the DPR pipeline, 40.4 for REALM and 34.5 for closed-book T5-11B.[^3] Generating answers instead of extracting them had a measurable side effect: on Natural Questions, RAG answered 11.8% of questions correctly even when the answer appeared in none of the retrieved passages, where an extractive model scores zero.[^3]"
    },
    {
      "type": "p",
      "text": "The generation results carry more weight for this post. The authors asked RAG and a plain BART model to write Jeopardy clues for a given answer, then showed human raters 452 pairs of generations from BART and RAG-Token.[^3] Factuality meant the statement could be backed by trusted external sources; specificity meant the output depended closely on the input.[^3]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Human pairwise judgments, Jeopardy clue generation",
      "yLabel": "Share of 452 pairs (%)",
      "series": [
        {
          "label": "Factuality",
          "key": "fact"
        },
        {
          "label": "Specificity",
          "key": "spec"
        }
      ],
      "data": [
        { "label": "BART better", "values": { "fact": 7.1, "spec": 16.8 } },
        { "label": "RAG better", "values": { "fact": 42.7, "spec": 37.4 } },
        { "label": "Both good", "values": { "fact": 11.7, "spec": 11.8 } },
        { "label": "Both poor", "values": { "fact": 17.7, "spec": 6.9 } },
        { "label": "No majority", "values": { "fact": 20.8, "spec": 20.1 } }
      ],
      "caption": "Redrawn from Table 4 of Lewis et al., 2020.[^3] The comparison is RAG-Token against BART-large; raters chose between the two generations for the same answer."
    },
    {
      "type": "p",
      "text": "Raters picked RAG as more factual in 42.7% of pairs and BART in 7.1%.[^3] RAG also wrote more varied text without any decoding tricks for diversity: the share of distinct trigrams in Jeopardy generations was 53.8% for RAG-Sequence against 32.4% for BART.[^3]"
    },
    {
      "type": "p",
      "text": "The cleanest demonstration of non-parametric memory was an index swap. The authors built a second index from a December 2016 Wikipedia dump and asked the model \"Who is {position}?\" for 82 world leaders who had changed between 2016 and 2018. With the index matched to the year, RAG answered 70% (2016) and 68% (2018) correctly. With the mismatched index it fell to 12% and 4%.[^3] The model's weights never changed. Only the text it read did."
    },
    {
      "type": "p",
      "text": "The paper also caught parametric and non-parametric memory working together. Asked to write a Jeopardy clue for \"Hemingway,\" RAG-Token leaned on one retrieved passage while writing \"The Sun Also Rises\" and on another for \"A Farewell to Arms,\" and the reliance on any passage flattened after the first word of each title.[^3] The authors checked: plain BART, given the partial text, completes the titles on its own. Retrieval steered the generation, and the model's weights supplied the rest.[^3]"
    },
    {
      "type": "h2",
      "text": "Why the famous facts did not need the search"
    },
    {
      "type": "p",
      "text": "Back to Mallen and colleagues. Their retrieval setup was deliberately simple: an off-the-shelf retriever pulls the single top paragraph from the December 2018 Wikipedia, and it is concatenated with the question, no training involved.[^1] They tried BM25, a term-matching retriever with no training, and Contriever, a dense retriever pre-trained with contrastive learning on unlabeled text and then fine-tuned on MS MARCO.[^1,5] They ran it across ten models from 1.3 billion parameters up to GPT-3.[^1]"
    },
    {
      "type": "p",
      "text": "Popularity predicted what the models had memorized. For almost every relation type, accuracy rose with the subject's page views, and the correlation was strongest for the largest model, roughly 0.4 for davinci-003 against about 0.1 for GPT-Neo 1.3B.[^1] This agrees with a concurrent study that tied a model's accuracy on a factual question to how many pre-training documents contain the entities of the question and its answer.[^1,7] The authors conclude that scaling lowers the popularity a fact needs before a model reliably memorizes it, but is not projected to push that line far into the long tail at practical model sizes.[^1]"
    },
    {
      "type": "p",
      "text": "To see why retrieval hurt on popular questions, they sorted every PopQA question by two outcomes for davinci-003: right or wrong without retrieval, and right or wrong with Contriever. Then they measured recall@1, whether the single retrieved paragraph contained a gold answer.[^1]"
    },
    {
      "type": "ul",
      "items": [
        "Right alone, wrong with retrieval: 10% of questions, recall@1 of 0.14. The passage usually did not contain the answer, and the model followed it anyway.[^1]",
        "Wrong alone, right with retrieval: 17% of questions, recall@1 of 0.88.[^1]",
        "Right both ways: 24%, recall@1 of 0.83. Wrong both ways: 49%, recall@1 of 0.11.[^1]"
      ]
    },
    {
      "type": "p",
      "text": "Overall recall@1 was 0.42.[^1] So the harm has a concrete mechanism. When retrieval misses, a model that knew the answer can be talked out of it by a passage that is about the wrong thing. RAG's human raters saw retrieval improve factuality on average; Mallen's table shows the same move costing answers on the questions where the model had them already."
    },
    {
      "type": "h2",
      "text": "Adaptive retrieval: when to skip it"
    },
    {
      "type": "p",
      "text": "The rule the authors propose uses only information in the question. Retrieve when the subject's popularity is below a threshold, and answer from the model's own memory otherwise. They pick a separate threshold for each relation type on a development set, choosing whatever maximizes accuracy.[^1]"
    },
    {
      "type": "p",
      "text": "The threshold moves with model size. Small models ended up retrieving for almost every question, because there were few questions where their own memory beat a retrieved paragraph, and the gain from the adaptive rule was much smaller below 10 billion parameters.[^1] Larger models retrieved far less: davinci-003 paired with BM25 retrieved for only 40% of questions, and GPT-NeoX 20B skipped retrieval on more than 20%.[^1] Skipping also saves time. Attaching the retrieved passage almost doubled GPT-J 6B's inference latency, and the adaptive rule cut inference time by up to 9% compared with always retrieving.[^1] On EntityQuestions, where most subjects are obscure and the models retrieve much more, it still cut GPT-3 API costs by 15% with the same accuracy as always retrieving.[^1]"
    },
    {
      "type": "callout",
      "title": "What the rule assumes",
      "text": "Adaptive retrieval needs a popularity signal for the thing being asked about. PopQA gives it for free through Wikidata links and page views.[^1] The authors say plainly that both of their datasets are synthetic, that it is not established how far the results carry to naturally occurring questions, and that their popularity measure is time dependent and may not reflect how often an entity is discussed on the web.[^1] My reading is that the finding (retrieve for rare facts, trust the model for common ones) is on firmer ground than the specific page-view heuristic."
    },
    {
      "type": "h2",
      "text": "When the retriever learns to return the same page"
    },
    {
      "type": "p",
      "text": "Both founding papers ran into the same trap from the other side. REALM describes it at initialization: if the retriever starts with poor embeddings, the documents it returns are unrelated to the input, the encoder learns to ignore them, and the retriever then receives no meaningful gradient and cannot improve, a vicious cycle REALM avoided by warm-starting both embedding models.[^2] The RAG paper records a version of it in its appendix. In preliminary experiments on tasks such as story generation, the retriever \"collapsed\": it learned to return the same documents no matter the input.[^3] Once that happened the generator learned to ignore the documents, and the RAG model performed the same as plain BART.[^3] The authors suggest the collapse could come from a less explicit need for factual knowledge in those tasks, or from longer target sequences giving the retriever less informative gradients.[^3]"
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        {
          "title": "Mallen, Asai, Zhong, Das, Khashabi, Hajishirzi. When Not to Trust Language Models: Investigating Effectiveness of Parametric and Non-Parametric Memories. ACL 2023 (arXiv 2212.10511)",
          "url": "https://arxiv.org/abs/2212.10511"
        },
        {
          "title": "Guu, Lee, Tung, Pasupat, Chang. REALM: Retrieval-Augmented Language Model Pre-Training. 2020 (arXiv 2002.08909)",
          "url": "https://arxiv.org/abs/2002.08909"
        },
        {
          "title": "Lewis et al. Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. NeurIPS 2020 (arXiv 2005.11401)",
          "url": "https://arxiv.org/abs/2005.11401"
        },
        {
          "title": "Karpukhin et al. Dense Passage Retrieval for Open-Domain Question Answering. EMNLP 2020 (arXiv 2004.04906)",
          "url": "https://arxiv.org/abs/2004.04906"
        },
        {
          "title": "Izacard et al. Unsupervised Dense Information Retrieval with Contrastive Learning. TMLR 2022 (arXiv 2112.09118)",
          "url": "https://arxiv.org/abs/2112.09118"
        },
        {
          "title": "Lewis et al. BART: Denoising Sequence-to-Sequence Pre-training for Natural Language Generation, Translation, and Comprehension. 2019 (arXiv 1910.13461)",
          "url": "https://arxiv.org/abs/1910.13461"
        },
        {
          "title": "Kandpal, Deng, Roberts, Wallace, Raffel. Large Language Models Struggle to Learn Long-Tail Knowledge. ICML 2023 (arXiv 2211.08411)",
          "url": "https://arxiv.org/abs/2211.08411"
        }
      ]
    }
  ]
};

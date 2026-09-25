// AI Engineering series post. Every factual claim is taken from the numbered sources at the end.
// The popularity figure is reproduced under CC BY 4.0 (Soudani et al., arXiv 2403.01432).
// The two bar charts are redrawn from Table 2 of Ovadia et al. (arXiv 2312.05934) and
// Table 2 of Gekhman et al. (arXiv 2405.05904).
export const POST = {
  "id": "finetuning-or-rag",
  "title": "Fine-tuning or retrieval for new knowledge: what controlled tests found",
  "excerpt": "In 2023 a Microsoft team fine-tuned three 7B models on news the models had never seen, and retrieval beat fine-tuning on every one; for Llama 2, fine-tuning made the score worse. Three controlled studies on putting new facts into a model, what each measured, and why training on unknown facts raises hallucination.",
  "category": "AI",
  "chapter": "Chapter 7",
  "tags": [
    "Finetuning",
    "RAG",
    "Knowledge injection"
  ],
  "seriesNum": 12,
  "publishAt": "2026-02-18T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In a paper first posted in December 2023, Oded Ovadia and three colleagues at Microsoft in Israel tested 910 multiple-choice questions about events in the United States from August to November 2023, built from Wikipedia's pages on that year's events.[^1] The dates were chosen so the events fell after the training cutoff of the models they tested: Llama2-7B, Mistral-7B and Orca2-7B. Each question had four options, so guessing gives 25%. Base Mistral-7B scored 48.1%. With retrieval, where the relevant Wikipedia text was pasted into the prompt, it scored 87.5%. After fine-tuning on that same text, it scored 50.4%. Llama2-7B did worse after fine-tuning: it fell from 35.3% to 21.9%, below chance.[^1]"
    },
    {
      "type": "p",
      "text": "That study is a direct head-to-head on one question: which method gets new facts into a model. Two later papers explain why it came out that way and where the result changes. Gekhman and colleagues at Google Research and the Technion measured what happens inside fine-tuning when a training example states a fact the model does not know.[^2] Soudani, Kanoulas and Hasibi, at Radboud University and the University of Amsterdam, repeated the comparison on twelve models and split the results by how famous the fact is.[^3] This post takes them in that order."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Knowledge injection",
          "def": "Giving a pre-trained model facts it did not have, or had only weakly, so it can answer questions about them. Ovadia et al. frame it as finding a change to the model that raises its accuracy on a set of factual questions.[^1]"
        },
        {
          "term": "Fine-tuning",
          "def": "Continuing to train the model's weights on new data. In Ovadia et al. this was unsupervised: plain next-token prediction on raw text, also called continued pre-training. In the other two papers it was supervised, on question and answer pairs.[^1,2,3]"
        },
        {
          "term": "Retrieval-augmented generation (RAG)",
          "def": "Searching a document store for passages related to the question and adding them to the prompt. Lewis et al. describe this as pairing the model's parametric memory, its weights, with a non-parametric memory, a searchable index of text.[^5]"
        },
        {
          "term": "Hallucination",
          "def": "A confident answer that is factually wrong. In Gekhman et al. it is measured as lost accuracy on held-out questions the model has to answer from what it already knows.[^2]"
        }
      ]
    },
    {
      "type": "h2",
      "text": "The Microsoft comparison, number by number"
    },
    {
      "type": "p",
      "text": "Ovadia's team ran two kinds of test. The first used five subjects from the MMLU benchmark: anatomy, astronomy, college biology, college chemistry and prehistory. They picked subjects where the questions are short and lean on facts more than reasoning. For each subject they scraped the relevant Wikipedia articles, cleaned them into chunks, and used that text both as the fine-tuning corpus and as the retrieval store.[^1] The second was the current events set from the opening, which the models could not have seen during pre-training.[^1]"
    },
    {
      "type": "p",
      "text": "Retrieval used bge-large-en embeddings in a FAISS index, and they tried adding from zero to five chunks to the prompt. Fine-tuning ran on 256-token chunks for up to five epochs on four A100 GPUs, with learning rates between 1e-6 and 5e-5 found by search. Scoring did not depend on generated text. The model read each question with each answer option attached, and whichever option got the highest log probability counted as its choice.[^1]"
    },
    {
      "type": "p",
      "text": "On MMLU, the paper reports that RAG beat the base model in every case, and that RAG on the base model was always better than fine-tuning alone.[^1] The gaps were moderate; the paper notes that for these subjects the models had already seen related material in pre-training. Mistral-7B on zero-shot anatomy is typical: 55.6% base, 57.0% fine-tuned, 68.1% with retrieval. Fine-tuning plus retrieval sometimes helped a little more and sometimes did not, which the authors take as a sign that fine-tuning is unstable.[^1]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Accuracy on 910 current-events questions (Aug to Nov 2023)",
      "yLabel": "Accuracy (%)",
      "series": [
        { "label": "Base model", "key": "base", "baseline": true },
        { "label": "Base + RAG", "key": "rag" },
        { "label": "Fine-tuned", "key": "ftreg" },
        { "label": "Fine-tuned, paraphrased data", "key": "ftpar" },
        { "label": "Paraphrased FT + RAG", "key": "ftparrag" }
      ],
      "data": [
        { "label": "Mistral 7B", "values": { "base": 48.1, "rag": 87.5, "ftreg": 50.4, "ftpar": 58.8, "ftparrag": 83.0 } },
        { "label": "Llama2 7B", "values": { "base": 35.3, "rag": 58.5, "ftreg": 21.9, "ftpar": 39.2, "ftparrag": 52.0 } },
        { "label": "Orca2 7B", "values": { "base": 45.6, "rag": 87.6, "ftreg": 51.1, "ftpar": 56.6, "ftparrag": 82.6 } }
      ],
      "caption": "Redrawn from Table 2 of Ovadia et al., 2024,[^1] with accuracies converted from fractions to percentages. Random guessing scores 25%. The paper also reports plain fine-tuning plus RAG, left out here: 81.0%, 32.6% and 82.0%."
    },
    {
      "type": "p",
      "text": "The current events results are much starker. Retrieval nearly doubled Mistral and Orca2. Fine-tuning on the raw articles moved them by a few points and pushed Llama2 below chance. Retrieval also got an advantage from how the test was built: every question came from a specific chunk of the corpus, so the matching chunk was always there to be found.[^1] And combining fine-tuning with retrieval did worse than retrieval alone for all three models.[^1]"
    },
    {
      "type": "p",
      "text": "One change did help fine-tuning. The team had GPT-4 write ten paraphrases of each chunk and trained on those too. Mistral's fine-tuned score rose from 50.4% to 58.8% and Llama2's from 21.9% to 39.2%. Across all three models, accuracy rose steadily as they added more paraphrases.[^1] From this they propose that a model has to see a fact stated in many different ways to learn it through fine-tuning, which is already known to hold for pre-training. Even so, paraphrased fine-tuning stayed about 30 points behind retrieval on Mistral and Orca2.[^1] As for why retrieval won, the authors offer possible reasons rather than tested ones: retrieval gives the model text that matches the exact question, and fine-tuning may erase some of what the model already knew, which is called catastrophic forgetting.[^1]"
    },
    {
      "type": "h2",
      "text": "What an unknown fact does to the model during fine-tuning"
    },
    {
      "type": "p",
      "text": "Zorik Gekhman and colleagues tested a common conjecture: fine-tuning a model on facts it does not know teaches it to state things it has no grounds for.[^2] To test it, they needed to know, for every training example, whether the model already knew the answer. They built a method called SliCK for this. For each question, they prompted PaLM 2-S with ten different sets of four examples, and for each prompt took one greedy answer plus 16 answers sampled at temperature 0.5. How often the model got the answer right sorted each fact into one of four categories.[^2]"
    },
    {
      "type": "ul",
      "items": [
        "HighlyKnown: greedy decoding always gives the right answer.",
        "MaybeKnown: greedy decoding sometimes gives it.",
        "WeaklyKnown: greedy decoding never gives it, but sampling sometimes does.",
        "Unknown: the model never produces the right answer, greedy or sampled."
      ]
    },
    {
      "type": "p",
      "text": "The data came from EntityQuestions, which turns Wikidata facts into questions such as \"Where is Benedict located?\" They used 12 relations for training and testing and held back 7 more as an out-of-distribution test.[^2] Of the questions, 24% came out HighlyKnown, 23% MaybeKnown, 17% WeaklyKnown and 36% Unknown. To sort the whole dataset they ran 170 inference steps per example, more than 15 million in total.[^2] Then they kept the fine-tuning set at a fixed size and varied only the share of Unknown examples. Test questions were disjoint from training questions, so the model had to answer them from knowledge it already had. A drop in test accuracy therefore means the model got worse at using facts it knew, which is how the paper measures hallucination.[^2]"
    },
    {
      "type": "p",
      "text": "The first finding is about speed. Unknown examples were fitted much more slowly than Known ones. At the point where development accuracy peaked, the model had fitted most of the Known examples and only a small fraction of the Unknown ones. The paper reads this as a sign that fine-tuning mostly teaches a model to use what it learned in pre-training, and adds little that is new.[^2] That point came after 5 to 10 epochs. The authors also trained each run to 50 epochs, by which time the model fitted 100% of its training set.[^2]"
    },
    {
      "type": "p",
      "text": "The second finding is about harm, and it appears late in training. With early stopping, removing the Unknown examples from the training set barely changed the results, so at that point they were neutral. Trained to convergence, they did real damage, and the damage grew with the share of Unknown examples.[^2] The authors fitted a linear model of test accuracy against how many examples of each kind the model had fitted by that point:"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} \\text{Acc} = 36.9 + 7.3\\,\\frac{N_{kn}}{|D|} - 8.3\\,\\frac{N_{unk}}{|D|} \\\\[4pt] R^2 = 0.86 \\end{gathered}",
      "caption": "Equation 1 and Table 1 of Gekhman et al., 2024.[^2] N_kn and N_unk count the Known and Unknown training examples the model has fitted; |D| is the size of the fine-tuning set."
    },
    {
      "type": "p",
      "text": "Each Unknown example the model learned cost about as much accuracy as each Known example gained. On the held-out relations the coefficients were smaller, +3.2 and -3.0, but the fit was tighter, with an R squared of 0.95.[^2] In the paper's words, training on questions like \"Where is [E1] located?\" can encourage hallucinations on seemingly unrelated questions such as \"Who founded [E2]?\". The authors take this as evidence that the model is learning a behavior, giving answers not grounded in what it knows, rather than just picking up bad facts.[^2]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Fine-tuned only on Unknown facts: test accuracy by category",
      "yLabel": "Exact match (%)",
      "series": [
        { "label": "Early stopping", "key": "early" },
        { "label": "50 epochs (convergence)", "key": "conv" }
      ],
      "data": [
        { "label": "All test questions", "values": { "early": 37.5, "conv": 25.8 } },
        { "label": "HighlyKnown", "values": { "early": 95.6, "conv": 55.8 } },
        { "label": "MaybeKnown", "values": { "early": 52.9, "conv": 36.6 } },
        { "label": "WeaklyKnown", "values": { "early": 6.5, "conv": 12.2 } },
        { "label": "Unknown", "values": { "early": 0.6, "conv": 3.2 } }
      ],
      "caption": "Redrawn from the D_Unknown row of Table 2 in Gekhman et al., 2024.[^2] PaLM 2-S was fine-tuned only on Unknown examples, then tested on held-out questions grouped by SliCK category. Longer training gained a few points on facts the model did not know and lost 40 points on facts it knew well."
    },
    {
      "type": "p",
      "text": "The per-category results in the paper's Table 2 show where the damage lands. A model fine-tuned only on Unknown examples and trained to convergence fell from 95.6% to 55.8% on HighlyKnown test questions, facts it had answered reliably before.[^2] The obvious training set was not the best one. With early stopping, training only on HighlyKnown examples reached 40.5% overall, while training only on MaybeKnown examples reached 43.6%, because the model then handled its partly known facts better.[^2] The paper tested two fixes. Early stopping avoided most of the harm. So did replacing the answers on Unknown training examples with \"I don't know\": on a set that was half Unknown, accuracy on the questions the model chose to answer stayed at 61.8% from early stopping to convergence, while it answered fewer of them (58.7% down to 55.6%). The unmodified set dropped from 43.0% to 38.8%.[^2]"
    },
    {
      "type": "h2",
      "text": "How popular the fact is changes the gap"
    },
    {
      "type": "p",
      "text": "Soudani's team asked the question a company would ask: what if the facts are about obscure things, such as internal products or niche entities with little written about them?[^3] Their tests used three question sets about long-tail entities, PopQA and WiTQA with about 14,000 questions each and EntityQuestions with 17,300, and measured how popular each entity was by its Wikipedia page views, split into five buckets.[^3] They tested twelve models from 80 million to 11.3 billion parameters. Fine-tuning data was question and answer pairs generated from the entities' Wikipedia summary sections. Retrieval had to find those same summaries, and the \"ideal\" retriever was one that always returned the right summary first.[^3]"
    },
    {
      "type": "p",
      "text": "This setup builds on Mallen et al., the paper that introduced PopQA. They found that models struggle with less popular facts and that making models bigger mostly helps with popular ones. On the 4,000 least popular questions, GPT-neo 2.7B with a dense retriever beat GPT-3 davinci-003 without one. For popular entities, retrieval sometimes hurt large models, because the retrieved text could mislead them.[^4]"
    },
    {
      "type": "image",
      "src": "/blog-images/finetuning-or-rag/soudani-stablelm2-by-popularity.webp",
      "alt": "Line chart of StableLM2 accuracy against entity popularity in five Wikipedia page-view buckets from 10^2 to more than 10^5. Two lines without retrieval sit near 0.1 to 0.3 for the three least popular buckets and rise to about 0.65 and 0.75 in the most popular bucket. Five retrieval lines sit between about 0.4 and 0.8, dip in the middle buckets, and converge near 0.7 in the most popular bucket. Example questions are marked at each end: 'Who was the director of The Island of Desire?' for the least popular and 'What color is Manchester United F.C.?' for the most popular.",
      "width": 1060,
      "height": 630,
      "caption": "StableLM2 accuracy by entity popularity, with and without fine-tuning (FT) and retrieval (BM25 or DPR; SRAG is the authors' own method). Figure 1 from Soudani et al., 2024,[^3] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)."
    },
    {
      "type": "p",
      "text": "The paper does not print bucket-level numbers, so the ones here are read off the figure. Without retrieval, StableLM2 got about 23% right in the least popular bucket and about 10% in the next one up, rising to about 65% for the most popular entities. Fine-tuning moved those to roughly 30%, 14% and 75%. With DPR retrieval, the base model was near 67% in the least popular bucket. The authors themselves report that retrieval raised accuracy most for the least popular entities, and that fine-tuning helped at every popularity level, most in the least popular buckets for Mistral and Llama3.[^3]"
    },
    {
      "type": "p",
      "text": "The most popular bucket behaves differently. Retrievers found the right document more often for obscure entities than for famous ones, probably because fewer distracting documents mention an obscure entity. On PopQA, accuracy with retrieval fell from the least popular bucket to the fourth, then rose again in the top one. The authors explain the rise by the model ignoring noisy context and relying on what it already knows about famous entities.[^3] In my reading of Figure 1, fine-tuning without retrieval sits at or slightly above the retrieval lines in that top bucket, the only place in the figure where that happens."
    },
    {
      "type": "p",
      "text": "Overall scores, with the ideal retriever, show how model size matters. On PopQA, StableLM2 (1.6B) went from 17.01% to 21.75% with fine-tuning, 76.14% with retrieval, and 82.09% with both. Mistral 7B went from 21.47% to 30.70% with fine-tuning and 80.25% with retrieval, but fell to 78.44% with both. Llama3-chat 8B barely moved with fine-tuning (32.52% to 32.75%), and adding it to retrieval changed little (81.29% to 81.54%).[^3] The paper concludes that combining the two gave the best results for models up to 3B parameters but hurt models from 7B to 11.3B, and that fine-tuning seems to weaken the larger models' ability to reason over retrieved text.[^3]"
    },
    {
      "type": "p",
      "text": "The way you fine-tune also matters, not just whether you do. QLoRA, which trains a small set of added weights, gained less than full fine-tuning when the model answered without retrieval, but it kept the model able to use retrieved text.[^3] Full fine-tuning of StableLM2 on the question pairs from a fine-tuned T5-large generator dropped its PopQA score with retrieval to 5.87%, against 76.14% for the untouched model with retrieval. That generator produced over twelve times as many pairs as prompting Zephyr did, yet the Zephyr pairs trained better models.[^3] The authors also built Stimulus RAG, which puts the most relevant retrieved sentence at the top of the prompt. With no fine-tuning, it beat every fine-tuned model that used the same top three documents.[^3]"
    },
    {
      "type": "h2",
      "text": "My reading of when each one won"
    },
    {
      "type": "p",
      "text": "What follows is my interpretation, limited to conditions these papers actually tested: multiple-choice or short-answer factual questions, mostly from Wikipedia, on models from 80 million to about 11 billion parameters."
    },
    {
      "type": "ul",
      "items": [
        "**Facts from after the training cutoff:** retrieval beat fine-tuning by about 37 points on Mistral and Orca2. Fine-tuning on raw text gave a few points at best and made Llama2 worse; paraphrasing narrowed the gap but did not close it.[^1]",
        "**Obscure facts the model has barely seen:** this is where retrieval helped most. Fine-tuning helped too, and for models of 3B parameters or fewer, QLoRA fine-tuning on top of retrieval scored higher than retrieval alone.[^3]",
        "**Facts the model half knows:** this is where fine-tuning did its job. Training on MaybeKnown examples gave the best test accuracy, by getting the model to use what it already had.[^2]",
        "**Training sets full of facts the model does not know:** fitting them raised hallucination on facts it did know, including on unrelated relations. Early stopping or relabeling them as \"I don't know\" contained most of the damage in that setup.[^2]",
        "**Very famous facts:** in the most popular bucket, StableLM2 answering from its fine-tuned weights did about as well as with retrieval, and Mallen et al. found retrieval could mislead large models on popular entities. Separately, adding fine-tuning to ideal retrieval did not help the 7B to 11.3B models.[^3,4]"
      ]
    },
    {
      "type": "p",
      "text": "None of these papers tested tone, output format or long-form writing, so they say nothing about fine-tuning for behavior. Their conclusions apply to facts only."
    },
    {
      "type": "h2",
      "text": "Where the evidence stops"
    },
    {
      "type": "p",
      "text": "Gekhman et al. ran every experiment on one model, PaLM 2-S, and say it is unclear whether the results hold for others. Their fixes, such as filtering out Unknown examples, have not been checked on long-form generation.[^2] Soudani et al. assumed each answer sits in the Wikipedia summary paragraph, and say that assumption is not entirely accurate.[^3] All three drew their facts from Wikipedia or Wikidata, so in my reading the limit Ovadia et al. state about their own study applies to the whole set: \"all of our sources came from Wikipedia. Other datasets may yield different results, and must be evaluated carefully.\"[^1]"
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        { "title": "Ovadia, Brief, Mishaeli, and Elisha, Fine-Tuning or Retrieval? Comparing Knowledge Injection in LLMs, 2024", "url": "https://arxiv.org/abs/2312.05934" },
        { "title": "Gekhman, Yona, Aharoni, Eyal, Feder, Reichart, and Herzig, Does Fine-Tuning LLMs on New Knowledge Encourage Hallucinations?, EMNLP 2024", "url": "https://arxiv.org/abs/2405.05904" },
        { "title": "Soudani, Kanoulas, and Hasibi, Fine Tuning vs. Retrieval Augmented Generation for Less Popular Knowledge, SIGIR-AP 2024", "url": "https://arxiv.org/abs/2403.01432" },
        { "title": "Mallen, Asai, Zhong, Das, Khashabi, and Hajishirzi, When Not to Trust Language Models: Investigating Effectiveness of Parametric and Non-Parametric Memories, ACL 2023", "url": "https://arxiv.org/abs/2212.10511" },
        { "title": "Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, NeurIPS 2020", "url": "https://arxiv.org/abs/2005.11401" }
      ]
    }
  ]
};

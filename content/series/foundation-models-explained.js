// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled in src/data/seriesPosts.js.
// Every factual claim is taken from the numbered sources at the end. Both charts
// are redrawn from table values (BERT Table 1, GPT-1 Table 5); neither paper's
// license allows reuse of its figures.
export const POST = {
  "id": "foundation-models-explained",
  "title": "How one pretrained model replaced a model per task",
  "excerpt": "In 2018 BERT set new results on eleven language tasks by adding one output layer to a single pretrained model. Read with GPT-1 before it and GPT-2 after, it shows how the foundation model idea formed: pretrain once on raw text, then adapt, with fine-tuning or with none.",
  "category": "AI",
  "chapter": "Chapter 2",
  "tags": [
    "Foundation Models",
    "Pretraining",
    "Fine-tuning",
    "Transfer learning"
  ],
  "seriesNum": 5,
  "publishAt": "2025-12-31T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In October 2018 a Google team posted a paper describing a model called BERT. The abstract made an unusual claim for its time: the pretrained model \\\"can be fine-tuned with just one additional output layer to create state-of-the-art models for a wide range of tasks,\\\" with no substantial task-specific changes to the architecture.[^1] It reported new state-of-the-art results on eleven language tasks. On the GLUE benchmark it pushed the score to 80.5, a 7.7 point absolute improvement. MultiNLI accuracy went to 86.7% (up 4.6 points) and SQuAD v1.1 question answering reached a test F1 of 93.2 (up 1.5).[^1]"
    },
    {
      "type": "p",
      "text": "Before this, the usual way to get a strong result on a language task was to design a model for that task. BERT's authors say as much: one of their stated contributions is showing that pretrained representations \\\"reduce the need for many heavily-engineered task-specific architectures.\\\"[^1] That sentence is the idea later named a **foundation model**, stated about a year before anyone used the phrase. It also had a history. Read in order, three papers from 2018 and 2019 show the idea taking shape, and each one made a larger claim about how far a single pretrained model could stretch."
    },
    {
      "type": "h2",
      "text": "One output layer, eleven tasks"
    },
    {
      "type": "p",
      "text": "BERT is a Transformer encoder, a stack of self-attention layers that turns a sequence of tokens (word pieces) into one vector per token. The paper reports two sizes: BERT-Base with 110 million parameters, chosen to match OpenAI's GPT for comparison, and BERT-Large with 340 million.[^1] It was **pretrained** on BooksCorpus (800 million words) and English Wikipedia (2,500 million words). Pretraining means training on plain text with no human labels, using a task where the text supplies its own answers.[^1]"
    },
    {
      "type": "p",
      "text": "BERT's main pretraining task was a **masked language model**. The authors pick 15% of the token positions in each sequence at random, hide or corrupt them, and train the model to predict the original tokens from the words on both sides.[^1] A second task asked whether sentence B really followed sentence A in the source text or was a random sentence from elsewhere.[^1]"
    },
    {
      "type": "p",
      "text": "**Fine-tuning** is the second step: start from the pretrained weights, add a small layer for the task, and keep training all the weights on that task's labeled examples. For the GLUE classification tasks, the only new parameters were one matrix \\(W \\in \\mathbb{R}^{K \\times H}\\), where \\(K\\) is the number of labels and \\(H\\) is the hidden size. The model's summary vector \\(C\\) for the input goes through \\(\\mathrm{softmax}(CW^{T})\\), and training minimizes the usual classification loss.[^1] For SQuAD the new parameters were just two vectors, one scoring where the answer span starts and one where it ends.[^1] The authors write that every result in the paper can be reproduced \\\"in at most 1 hour on a single Cloud TPU, or a few hours on a GPU, starting from the exact same pre-trained model.\\\"[^1]"
    },
    {
      "type": "p",
      "text": "GLUE, the benchmark in the headline, was built by Wang and colleagues as a set of nine sentence and sentence-pair tasks, such as entailment, paraphrase, sentiment and grammatical acceptability. Some have plenty of training data and some have little, and the leaderboard ranks systems by a macro-average across the tasks.[^5] Its authors designed it to favor models that share general linguistic knowledge across tasks.[^5] The chart shows BERT's test scores task by task, next to the best earlier results BERT's paper lists."
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "GLUE test scores by task",
      "yLabel": "Score",
      "series": [
        {
          "label": "Best before OpenAI GPT",
          "key": "prior",
          "baseline": true
        },
        {
          "label": "OpenAI GPT",
          "key": "gpt"
        },
        {
          "label": "BERT-Large",
          "key": "bert"
        }
      ],
      "data": [
        {
          "label": "MNLI-m",
          "values": {
            "prior": 80.6,
            "gpt": 82.1,
            "bert": 86.7
          }
        },
        {
          "label": "QQP",
          "values": {
            "prior": 66.1,
            "gpt": 70.3,
            "bert": 72.1
          }
        },
        {
          "label": "QNLI",
          "values": {
            "prior": 82.3,
            "gpt": 87.4,
            "bert": 92.7
          }
        },
        {
          "label": "SST-2",
          "values": {
            "prior": 93.2,
            "gpt": 91.3,
            "bert": 94.9
          }
        },
        {
          "label": "CoLA",
          "values": {
            "prior": 35.0,
            "gpt": 45.4,
            "bert": 60.5
          }
        },
        {
          "label": "STS-B",
          "values": {
            "prior": 81.0,
            "gpt": 80.0,
            "bert": 86.5
          }
        },
        {
          "label": "MRPC",
          "values": {
            "prior": 86.0,
            "gpt": 82.3,
            "bert": 89.3
          }
        },
        {
          "label": "RTE",
          "values": {
            "prior": 61.7,
            "gpt": 56.0,
            "bert": 70.1
          }
        }
      ],
      "caption": "Redrawn from Table 1 of Devlin et al., 2018.[^1] QQP and MRPC are F1, STS-B is Spearman correlation, CoLA is Matthews correlation, the rest are accuracy. The gray bars are the best result for each task from before OpenAI GPT, as the BERT paper lists them. BERT and GPT are single models, each fine-tuned separately per task."
    },
    {
      "type": "p",
      "text": "Two things stand out in that table. BERT-Large beat every earlier system on every GLUE task, and the gain was largest on CoLA, the grammatical acceptability task with only 8,500 training examples: 60.5 against 45.4 for GPT and 35.0 before that.[^1] The authors also note that BERT-Large beat BERT-Base on every task, most clearly on the ones with little training data.[^1] The second thing is the middle bar. OpenAI's GPT beat the older task-specific systems on four of these tasks, and on the other four (SST-2, STS-B, MRPC and RTE) the gray bar is higher. BERT's paper describes BERT-Base and GPT as nearly identical in architecture apart from the attention masking. BERT also trained on more text, but its authors name GPT's one-directional pretraining as the main limit it removed.[^1] To see what GPT did, go back a few months."
    },
    {
      "type": "h2",
      "text": "Earlier in 2018: pretrain, then fine-tune"
    },
    {
      "type": "p",
      "text": "OpenAI's paper, by Alec Radford, Karthik Narasimhan, Tim Salimans and Ilya Sutskever, starts from a shortage. Unlabeled text is abundant, they write, but labeled data for specific tasks is scarce, which makes it hard for models trained only on labeled examples to do well.[^2] Their answer was **generative pretraining** of a language model on a large unlabeled corpus, followed by **discriminative fine-tuning** on each task. Generative means the model learns to produce text by predicting the next token. Discriminative means it is then trained to pick the right label for an input.[^2]"
    },
    {
      "type": "p",
      "text": "The pretraining corpus was BooksCorpus, over 7,000 unpublished books. The authors picked it because it has long stretches of continuous text, unlike a benchmark that is shuffled sentence by sentence.[^2] The model was a 12-layer Transformer decoder, meaning each token can only attend to the tokens before it, with 768-dimensional states and 12 attention heads.[^2] For fine-tuning, the only extra parameters were one output matrix and embeddings for a few delimiter tokens. Instead of building a new architecture for each task, they turned structured inputs into one token sequence. An entailment example became premise, delimiter, hypothesis. A multiple-choice question became one sequence per candidate answer, scored separately.[^2]"
    },
    {
      "type": "p",
      "text": "The result: one task-agnostic model beat task-specific architectures and set new state-of-the-art results on 9 of the 12 datasets studied. The abstract lists absolute gains of 8.9% on the Story Cloze commonsense test, 5.7% on the RACE reading comprehension exams and 1.5% on MultiNLI entailment.[^2] On GLUE the overall score was 72.8, against a previous best of 68.9.[^2] It did not win everywhere. On RTE, a small entailment set with 2,490 examples, it scored 56% against 61.7% for a multi-task model, and the authors guessed it would benefit from multi-task training too.[^2]"
    },
    {
      "type": "p",
      "text": "The ablation in the paper is the clearest evidence for the recipe. The same Transformer trained directly on each task, with no pretraining, averaged 59.9 across the GLUE-style tasks. The full model averaged 74.7. The paper calls this a 14.8% decrease, and pretraining helped on every task they measured.[^2]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "The same Transformer with and without pretraining",
      "yLabel": "Score",
      "series": [
        {
          "label": "No pretraining",
          "key": "no",
          "baseline": true
        },
        {
          "label": "Pretrained, then fine-tuned",
          "key": "yes"
        }
      ],
      "data": [
        {
          "label": "CoLA",
          "values": {
            "no": 18.9,
            "yes": 45.4
          }
        },
        {
          "label": "SST-2",
          "values": {
            "no": 84.0,
            "yes": 91.3
          }
        },
        {
          "label": "MRPC",
          "values": {
            "no": 79.4,
            "yes": 82.3
          }
        },
        {
          "label": "STS-B",
          "values": {
            "no": 30.9,
            "yes": 82.0
          }
        },
        {
          "label": "QQP",
          "values": {
            "no": 65.5,
            "yes": 70.3
          }
        },
        {
          "label": "MNLI",
          "values": {
            "no": 75.7,
            "yes": 81.8
          }
        },
        {
          "label": "QNLI",
          "values": {
            "no": 71.2,
            "yes": 88.1
          }
        },
        {
          "label": "RTE",
          "values": {
            "no": 53.8,
            "yes": 56.0
          }
        }
      ],
      "caption": "Redrawn from Table 5 of Radford et al., 2018.[^2] \\\"Pretrained, then fine-tuned\\\" is the full model with the auxiliary language modeling loss. Metrics follow the paper: Matthews correlation for CoLA, F1 for MRPC and QQP, Pearson correlation for STS-B, accuracy elsewhere."
    },
    {
      "type": "p",
      "text": "The paper also has a small experiment that points toward GPT-2. The authors wanted to know why pretraining helps, and their hypothesis was that the generative model learns to do many of the tasks in order to predict text better.[^2] So they tried solving tasks with the pretrained model and no fine-tuning. For sentiment, they appended the word \\\"very\\\" to a review and checked whether the model gave more probability to \\\"positive\\\" or \\\"negative\\\" as the next word. Performance on these heuristics rose steadily over pretraining.[^2]"
    },
    {
      "type": "p",
      "text": "This is also where BERT came in. BERT's authors argued that GPT's left-to-right design was the main limit, since every token could only see the tokens before it.[^1] Their ablation supports the point. With the same data and fine-tuning, swapping the masked objective for a left-to-right one dropped MRPC from 86.5 to 77.5 and SQuAD F1 from 87.9 to 77.8.[^1]"
    },
    {
      "type": "h2",
      "text": "2019: GPT-2 skips the fine-tuning"
    },
    {
      "type": "p",
      "text": "GPT-2, from Radford, Jeffrey Wu and colleagues, took the zero-shot experiment and made it the whole paper. **Zero-shot** here means using a model on a task with no training on that task's examples and no change to its parameters or architecture.[^3] The authors frame the goal this way. A system built for one task learns \\(p(\\text{output} \\mid \\text{input})\\). A general system should learn \\(p(\\text{output} \\mid \\text{input}, \\text{task})\\), and since language can describe the task, a training sequence can carry all three parts, as in \\\"(translate to french, english text, french text).\\\"[^3] Their bet was that a language model with enough capacity would learn to infer and perform tasks shown in ordinary text, simply in order to predict that text better.[^3]"
    },
    {
      "type": "p",
      "text": "They built a new dataset for this, WebText: the text of pages linked from Reddit posts with at least 3 karma, which after cleaning came to slightly over 8 million documents and 40 GB of text. Wikipedia was removed on purpose, because many test sets are built from it.[^3] They trained four models from 117 million to 1.5 billion parameters. The smallest matches the original GPT and the second matches BERT-Large in size. The largest is GPT-2.[^3]"
    },
    {
      "type": "p",
      "text": "On language modeling itself, GPT-2 set new state-of-the-art results on 7 of 8 datasets with no fine-tuning.[^3] On LAMBADA, which asks for the last word of passages that need long context, it cut perplexity from 99.8 to 8.6 and raised accuracy from 19% to 52.66%, or 63.24% with a stop-word filter.[^3] **Perplexity** measures how surprised a model is by the text, and lower is better. On CoQA reading comprehension, given a document, the conversation so far and a final \\\"A:\\\" token, it reached 55 F1. That matched or beat 3 of 4 baseline systems without using any of their 127,000+ training examples.[^3]"
    },
    {
      "type": "p",
      "text": "The paper is candid about the rest. For summaries the authors appended \\\"TL;DR:\\\" to news articles. The output scored 21.40 on their averaged ROUGE metric, just above the 20.98 of picking three random sentences from the article.[^3] English to French translation reached 5 BLEU, slightly worse than word-by-word substitution with a bilingual dictionary. French to English reached 11.5 BLEU, far behind the 33.5 of the best unsupervised system.[^3] On Natural Questions GPT-2 answered 4.1% correctly. Both tasks gave the model a few example pairs in its context to show the format, so they are not purely zero-shot.[^3] The authors also checked for training data leaking into the tests. They found a small but consistent benefit from overlap, and one Children's Book Test book, The Jungle Book, sitting in WebText.[^3]"
    },
    {
      "type": "p",
      "text": "Their own summary: on reading comprehension GPT-2 was competitive with supervised baselines, but \\\"in terms of practical applications, the zero-shot performance of GPT-2 is still far from use-able,\\\" and there were \\\"undoubtedly many practical tasks\\\" where it was \\\"still no better than random.\\\"[^3] What they reported was a trend. The abstract says performance improved \\\"in a log-linear fashion\\\" with model capacity, and that even the largest model still underfit WebText.[^3]"
    },
    {
      "type": "h2",
      "text": "2021: a name, and two stages"
    },
    {
      "type": "p",
      "text": "The term arrived in August 2021, in a report from Stanford's Center for Research on Foundation Models, with Rishi Bommasani as first author. It defines foundation models as models \\\"trained on broad data (generally using self-supervision at scale) that can be adapted to a wide range of downstream tasks,\\\" and lists BERT among its examples.[^4] The authors say they chose the word to stress the models' \\\"critically central yet incomplete character\\\": central because much is built on them, incomplete because each one still needs adapting.[^4] They also place the start of this era in NLP at the end of 2018, the months around the BERT paper.[^4] Stripped down, the definition has two stages, and the three papers above supply the math for both."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Self-supervision",
          "def": "training on a task whose labels come from the data itself, such as the next word or a hidden word, so no human labeling is needed."
        },
        {
          "term": "Pretraining",
          "def": "the first, expensive stage: one model trained with a self-supervised objective on a broad corpus."
        },
        {
          "term": "Adaptation",
          "def": "the second stage: turning that one model into something useful for a specific task, by fine-tuning or by describing the task in the input."
        },
        {
          "term": "Downstream task",
          "def": "any task the pretrained model is applied to after pretraining, such as entailment or question answering."
        }
      ]
    },
    {
      "type": "p",
      "text": "The pretraining objective in the GPT papers is the standard language modeling likelihood. Given a corpus of tokens \\(\\mathcal{U} = \\{u_1, \\ldots, u_n\\}\\), GPT-1 maximizes:[^2]"
    },
    {
      "type": "eq",
      "tex": "L_1(\\mathcal{U}) = \\sum_{i} \\log P\\big(u_i \\mid u_{i-k}, \\ldots, u_{i-1}; \\Theta\\big)",
      "caption": "The unsupervised pretraining objective, equation 1 of Radford et al., 2018.[^2]"
    },
    {
      "type": "p",
      "text": "Read it term by term. \\(u_i\\) is the token at position \\(i\\), and \\(u_{i-k}, \\ldots, u_{i-1}\\) are the \\(k\\) tokens before it, where \\(k\\) is the context window. \\(\\Theta\\) is every weight in the network. \\(P(u_i \\mid \\ldots; \\Theta)\\) is the probability the network gives the true next token, read off a softmax over the whole vocabulary. Taking the log and summing over every position gives one number for the whole corpus, and training nudges \\(\\Theta\\) by stochastic gradient descent to make it larger.[^2] Nothing in the formula names a task. GPT-2 writes the same idea as a factorization, \\(p(x) = \\prod_i p(s_i \\mid s_1, \\ldots, s_{i-1})\\), the probability of a whole text as a product of next-token probabilities.[^3] BERT keeps the log-probability idea but predicts only the masked positions, using context from both sides.[^1]"
    },
    {
      "type": "p",
      "text": "Adaptation, in GPT-1's version, adds one matrix \\(W_y\\) on top of the final layer's activation \\(h_l^m\\) for the last input token, and trains on labeled pairs \\((x, y)\\):[^2]"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} P(y \\mid x_1, \\ldots, x_m) = \\mathrm{softmax}\\big(h_l^{m} W_y\\big) \\\\[4pt] L_3(\\mathcal{C}) = L_2(\\mathcal{C}) + \\lambda \\cdot L_1(\\mathcal{C}) \\end{gathered}",
      "caption": "The fine-tuning head and combined objective, equations 3 and 5 of Radford et al., 2018.[^2]"
    },
    {
      "type": "p",
      "text": "\\(L_2\\) is the sum of \\(\\log P(y \\mid x_1, \\ldots, x_m)\\) over the labeled dataset \\(\\mathcal{C}\\). GPT-1 also kept the language modeling loss running on the task data with weight \\(\\lambda = 0.5\\), which the authors found improved generalization and sped up convergence.[^2] BERT's head, \\(\\mathrm{softmax}(CW^{T})\\), is the same shape.[^1] GPT-2's adaptation involves no training at all. The task goes into the input as text, and the pretrained weights stay as they are.[^3] Those are the two ends of adaptation that these papers show: update every weight on the task's labeled examples, or update none and phrase the task as text."
    },
    {
      "type": "h2",
      "text": "What every fine-tuned copy still carries"
    },
    {
      "type": "p",
      "text": "The two-stage pattern moves most of the cost and most of the knowledge into one model, and that has a price the BERT paper already states. During pretraining BERT sees a special [MASK] symbol that never appears in fine-tuning inputs. The authors call this a mismatch between pretraining and fine-tuning, and they softened it with a workaround: a chosen position gets [MASK] 80% of the time, a random token 10% of the time, and is left unchanged 10% of the time.[^1] Each downstream task also ends up with its own separately fine-tuned copy of the model, even though all of them start from the same pretrained weights.[^1]"
    },
    {
      "type": "p",
      "text": "And fine-tuning did not always work. For BERT-Large, the authors wrote that fine-tuning \\\"was sometimes unstable on small datasets,\\\" so they ran several random restarts, each from the same pretrained checkpoint with different data shuffling and classifier initialization, and kept whichever did best on the development set.[^1] The paper does not say which GLUE tasks needed restarts or how far the discarded runs fell short.[^1] My reading, not the authors': the chart's biggest jumps, on CoLA and RTE, come from exactly the small datasets where a single pretrained model had to be fine-tuned more than once to get the reported number."
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        {
          "title": "Devlin, Chang, Lee, and Toutanova, BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding, 2018",
          "url": "https://arxiv.org/abs/1810.04805"
        },
        {
          "title": "Radford, Narasimhan, Salimans, and Sutskever, Improving Language Understanding by Generative Pre-Training, OpenAI, 2018",
          "url": "https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf"
        },
        {
          "title": "Radford, Wu, Child, Luan, Amodei, and Sutskever, Language Models are Unsupervised Multitask Learners, OpenAI, 2019",
          "url": "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf"
        },
        {
          "title": "Bommasani et al., On the Opportunities and Risks of Foundation Models, 2021",
          "url": "https://arxiv.org/abs/2108.07258"
        },
        {
          "title": "Wang et al., GLUE: A Multi-Task Benchmark and Analysis Platform for Natural Language Understanding, 2018",
          "url": "https://arxiv.org/abs/1804.07461"
        }
      ]
    }
  ]
};

// AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
// Every factual claim is taken from the numbered sources at the end. The chart
// is redrawn from table values in Li et al. 2023 and Chen et al. 2022; none of
// the anchor papers carries a license that allows reproducing figures.
export const POST = {
  "id": "build-vs-buy-model",
  "title": "BloombergGPT's ledger: what training your own model cost, and what adapting one scored",
  "excerpt": "Bloomberg spent a 1.3 million GPU hour budget training a 50 billion parameter finance model. Months later, GPT-4, prompted and never retrained, beat it on four of the five public benchmarks it had reported. A line by line ledger of what each path costs a team, from the papers' own figures.",
  "category": "AI",
  "tags": [
    "Strategy",
    "Cost",
    "Finetuning"
  ],
  "seriesNum": 37,
  "publishAt": "2026-07-02T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In March 2023 Bloomberg published both the recipe and the bill for a language model it trained itself. BloombergGPT has 50 billion parameters. The team started from a compute budget of 1.3 million GPU hours on 40GB A100 GPUs, trained on 64 AWS p4d.24xlarge instances holding 512 GPUs in total, and ran for 139,200 steps, about 53 days.[^1] The run processed 569 billion tokens, about \\(2.36 \\times 10^{23}\\) floating point operations, and ended at roughly 80% of one pass through the 709 billion tokens available, because loss on held-out data had stopped improving.[^1]"
    },
    {
      "type": "p",
      "text": "Half of what it read was Bloomberg's own. FinPile, a 363 billion token collection of filings, news, press releases, financial web pages and other documents that Bloomberg analysts had curated over forty years, made up 51.27% of training. Public datasets supplied the other 345 billion tokens.[^1] On five public financial benchmarks the model beat three open models of similar or larger size (GPT-NeoX, OPT-66B and BLOOM-176B) on four and came second on the fifth. Its average was 62.51; theirs ranged from 51.90 to 54.35.[^1] On Bloomberg's internal sentiment tasks the gap was wider: 62.47 against 29.23 to 35.76.[^1]"
    },
    {
      "type": "p",
      "text": "That is one side of the question this post is about. Should a team train its own model, or take an existing one and adapt it? The Bloomberg paper helps answer it because it wrote down the costs, not only the scores. The other side came from a group at Queen's University and J.P. Morgan AI Research, who ran general-purpose models from OpenAI on the same financial benchmarks and set the results next to BloombergGPT's reported numbers.[^2] Read together, the two papers work as a case study with a ledger attached."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        { "term": "Pretraining", "def": "Training a model from random weights on a very large pile of text so it learns to predict the next token. BloombergGPT is a pretrained model built from scratch." },
        { "term": "Fine-tuning", "def": "Continuing to train an existing model on labeled examples of one task, so some or all of its weights change." },
        { "term": "Zero-shot and few-shot prompting", "def": "Asking a model to do a task with no worked examples in the prompt (zero-shot) or with a handful of them (few-shot, e.g. 5-shot). No weights change." },
        { "term": "Chain-of-thought (CoT)", "def": "A prompt that asks the model to write out its reasoning steps before the final answer." },
        { "term": "F1 score", "def": "A score that balances precision (how many predicted labels are right) and recall (how many true labels were found). Weighted F1 averages the per-class scores by how many test examples each class has." },
        { "term": "GPU hour", "def": "One GPU busy for one hour. It is the usual unit for a training budget, because cloud providers bill by it." }
      ]
    },
    {
      "type": "h2",
      "text": "What 53 days of training bought"
    },
    {
      "type": "p",
      "text": "The authors sized the model with the Chinchilla scaling equations, which for their budget pointed to about 50 billion parameters and more than a trillion training tokens. Their roughly 700 billion tokens were too few for that. They could have added more public text, but they did not want FinPile to fall below half of training, so they chose the largest model that could see all their tokens while keeping about 30% of the compute budget in reserve for failures, retries and restarts.[^1] That reserve is worth pausing on. A team that builds plans for its own run to go wrong."
    },
    {
      "type": "p",
      "text": "And it did go wrong. The appendix the authors call Training Chronicles records a first run in which the weights of one LayerNorm layer changed trend for no reason the team could explain. After four failed attempts to fix it, they started over with more conservative settings, among them a lower peak learning rate (6e-5 instead of 1e-4) and tighter gradient clipping (0.3 instead of 1.0).[^1] The second run went smoothly for about 42 days, needing only a restart after 28 days because the platform had a hard limit on job length. Around day 48 the validation loss stopped improving for a week. Several interventions did not fix that, and with 77% of the training data used and the training budget nearly spent, they stopped.[^1] (The main text says about 80%; the chronicle says 77%.)"
    },
    {
      "type": "p",
      "text": "The payoff was real against models of its own class. On ConvFinQA, a test of multi-turn numerical questions over earnings reports, BloombergGPT scored 43.41 against 30.06, 27.88 and 36.31 for the three open models, and the authors call that gap especially large.[^1] They credit the results, in decreasing order of impact, to the curated internal dataset, their own tokenizer, and an up-to-date architecture.[^1] One detail sets up everything that follows: every model in those financial tables was run by the Bloomberg team with the same plain few-shot prompts, with no chain-of-thought, and all of them were open models.[^1] The strongest commercial models of the day were not in the comparison."
    },
    {
      "type": "h2",
      "text": "The same benchmarks, run on GPT-4"
    },
    {
      "type": "p",
      "text": "Li and colleagues tested gpt-3.5-turbo (the ChatGPT model) and GPT-4, in versions current as of July 7, 2023, on eight datasets covering five kinds of task: sentiment analysis, headline classification, named entity recognition (NER), relation extraction and question answering.[^2] They did not fine-tune ChatGPT or GPT-4. They used zero-shot, few-shot and chain-of-thought prompts only, took BloombergGPT's scores from its paper, and matched its setups where they could, including the number of examples in each prompt.[^2]"
    },
    {
      "type": "p",
      "text": "GPT-4 came out ahead on four of the five tasks that both papers report. On FiQA, an aspect-level sentiment task on financial news and microblog posts, BloombergGPT's 5-shot weighted F1 was 75.07; ChatGPT with no examples scored 75.90, and GPT-4 with five scored 88.11.[^2] On gold-price news headlines, GPT-4 5-shot reached 86.00 against BloombergGPT's 82.20, while ChatGPT 5-shot trailed at 74.84.[^2] On ConvFinQA the gap was large: 59.86 for ChatGPT and 76.48 for GPT-4, both zero-shot, against 43.41.[^2] NER was the exception. There BloombergGPT's 20-shot entity F1 of 60.82 beat GPT-4's 56.71 at the same shot count.[^2]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Financial benchmark scores: trained from scratch vs prompted vs fine-tuned",
      "yLabel": "Score (F1 or accuracy, 0 to 100)",
      "series": [
        { "label": "BloombergGPT (reported)", "key": "b", "baseline": true },
        { "label": "ChatGPT", "key": "c" },
        { "label": "GPT-4", "key": "g" },
        { "label": "Fine-tuned task model", "key": "f" }
      ],
      "data": [
        { "label": "FPB", "values": { "b": 51, "c": 79, "g": 86, "f": 84 } },
        { "label": "FiQA SA", "values": { "b": 75.07, "c": 78.33, "g": 88.11, "f": 87.09 } },
        { "label": "Headline", "values": { "b": 82.2, "c": 74.84, "g": 86.0, "f": 95.36 } },
        { "label": "NER", "values": { "b": 60.82, "c": 51.52, "g": 56.71, "f": 82.7 } },
        { "label": "ConvFinQA", "values": { "b": 43.41, "c": 59.86, "g": 76.48, "f": 68.9 } }
      ],
      "caption": "Redrawn from Tables 2, 3, 5, 6 and 8 of Li et al., 2023.[^2] ChatGPT and GPT-4 use the same shot count as BloombergGPT (5 for FPB, FiQA and Headline, 20 for NER, zero for ConvFinQA). FPB is weighted F1 on the 50% agreement set, scaled to 100. Fine-tuned models: FinBert, RoBERTa-large, BERT, a CRF trained on FIN5, and FinQANet. The FinQANet bar uses 68.90 from Table 3 of Chen et al., 2022,[^6] not the 61.24 in Li et al.'s table (see the last section)."
    },
    {
      "type": "p",
      "text": "The authors found it notable that both OpenAI models beat a model trained specifically on financial text, and offered a hedged explanation: \"This might be due to the larger model size of the two models.\"[^2] They also observed that GPT-4 was significantly better than ChatGPT on nearly all the financial benchmarks, and concluded that advances in general models carry over into finance.[^2]"
    },
    {
      "type": "p",
      "text": "The fourth bar in each group is the one a build-or-adapt decision should stare at. It is a much smaller model fine-tuned on one task's labeled data, and it wins two of the five. A fine-tuned BERT scored 95.36 on headlines, 9 points above GPT-4.[^2] On NER, a conditional random field (CRF, a classic sequence-labeling model) trained on FIN5, financial agreements similar to the test set, scored 82.70, higher than every language model. The same CRF trained on general CoNLL news data scored 17.20.[^2] On REFinD relation extraction, which BloombergGPT did not report, a fine-tuned Luke-base reached 56.30 macro F1 against GPT-4's 46.87 with ten examples.[^2] Li et al.'s own advice follows from this: use the general models for relatively simple financial tasks, and treat pretraining plus fine-tuning as the leading option for structured prediction such as NER and relation extraction.[^2]"
    },
    {
      "type": "p",
      "text": "Question answering pointed the other way. On FinQA, where the model must compute an answer from a table and text in an earnings report, GPT-4 with chain-of-thought reached 78.03, above the fine-tuned FinQANet.[^2] The FinQA paper puts expert humans at 91.16 and non-expert crowd workers at 50.68 on the same test.[^5] Li et al. also logged a ChatGPT error of the kind that matters in finance: every intermediate result correct, then $753 million + $785 million + $1,134 million summed to $3,672 million instead of $2,672 million.[^2]"
    },
    {
      "type": "h2",
      "text": "The ledger"
    },
    {
      "type": "p",
      "text": "Each path puts different lines on a team's books. Where a paper reports a figure, the line below gives it with a citation. Where no paper does, the line is my reading and says so."
    },
    {
      "type": "p",
      "text": "**Compute.** Building meant 1.3 million GPU hours of budget, 512 GPUs for 53 days, and 30% of it held back for things going wrong.[^1] Bloomberg gives no dollar figure. The FinGPT authors priced those GPU hours at an AWS rate of $2.3 per hour and estimated around $3 million per training run; that is their estimate, not Bloomberg's.[^3] For adapting an open model with lightweight fine-tuning, the same authors estimate around $300 per run.[^3] LoRA (low-rank adaptation) shows where such savings come from. It freezes the pretrained weights and trains small added matrices instead. On GPT-3 175B it cut training memory from 1.2TB to 350GB, shrank the saved checkpoint from 350GB to 35MB, and trained 25% faster than full fine-tuning.[^4] Prompting spends no training compute at all. In Li et al.'s runs, chain-of-thought moved FinQA accuracy from 48.56 to 63.87 for ChatGPT and from 68.79 to 78.03 for GPT-4.[^2]"
    },
    {
      "type": "p",
      "text": "**Data.** A builder needs a corpus. Some FinPile documents, such as filings, are public but were nontrivial to collect and preprocess for training; some Bloomberg news had to be purchased; the rest is private. All of it was stripped of markup and templates, and each dataset was deduplicated.[^1] An adapter needs labeled examples instead. FinQA's 8,281 question and answer pairs were written by eleven finance professionals hired for the job.[^5] ConvFinQA added 3,892 conversations with 14,115 questions.[^6] My reading: adapting does not remove the data cost. It changes its shape, from hundreds of billions of tokens to thousands of expert labels."
    },
    {
      "type": "p",
      "text": "**Evaluation.** This line appears on both sides. Bloomberg found no standard benchmark for financial language tasks; the public FLUE suite had limited coverage, no suggested few-shot method, and some low-quality annotations, so the team built internal benchmarks as well.[^1] Each internal sentiment dataset was labeled by two annotators with a third breaking ties, drawn from a dedicated team of financial experts, consultants, or both.[^1] My reading: a team that adapts rather than builds still needs this test set, because it is the only way to see which bar in the chart above belongs to its own task."
    },
    {
      "type": "p",
      "text": "**Refresh.** FinPile documents run from March 2007 to July 2022.[^1] Anything later is outside the model's weights unless someone trains again. The FinGPT authors argue that financial data is time-sensitive and that retraining large models often is expensive and impractical, which is why they favor lightweight adaptation.[^3] LoRA makes a shared base model cheap to specialize many times: storing 100 adapted GPT-3 models takes about 354GB instead of about 35TB.[^4] It has a cost it states plainly: the full 350GB base model is still needed at deployment.[^4] My reading of Li et al.'s ChatGPT to GPT-4 gap: a team that adapts collects a better base model by switching and rerunning its test set, while a team that built pays for another run."
    },
    {
      "type": "p",
      "text": "**Control.** Bloomberg did not release the model's weights. Its reason was that text can be extracted from model weights, so giving out the weights could amount to giving out FinPile.[^1] My reading: this line favors building when the training data is the business, and it is the one line a price estimate does not capture."
    },
    {
      "type": "h2",
      "text": "Where the comparison stops holding"
    },
    {
      "type": "p",
      "text": "Every BloombergGPT number in the chart crosses from one paper into another. Li et al. did not run BloombergGPT; their tables say its results come from the original paper.[^2] Their appendix lists the ways the two setups differ. The headline dataset they could obtain had six tags, while Bloomberg's test used a version with nine categories; the dataset's authors told them additional filtering produced the six-label version.[^2] For FPB and FiQA, Bloomberg created its own train and test splits.[^1] Li et al. held out 20% of the data for testing and describe their FiQA test split as their own.[^2] On ConvFinQA, Bloomberg fed each model the gold conversation, while Li et al. appended the model's own earlier answers before each new question.[^1,2]"
    },
    {
      "type": "p",
      "text": "Checking the source papers, I found one more. Li et al.'s Table 8 lists FinQANet at 68.90 on FinQA and 61.24 on ConvFinQA. The FinQA paper's own Table 2 reports 61.24 on FinQA,[^5] and the ConvFinQA paper's Table 3 reports 68.90 on ConvFinQA.[^6] The two values appear to have swapped places. It does not change which model wins on ConvFinQA, but it is a reminder that a borrowed number should be traced back to where it was measured. The same table also disagrees with the paper's own prose: the text says chain-of-thought added about 10 points for ChatGPT and 15 for GPT-4, while the table shows gains of about 15 and 9.[^2]"
    },
    {
      "type": "p",
      "text": "The Bloomberg authors drew the boundary themselves. Results from custom, non-LLM models on these public tasks existed, and they left them out: \"we omit reporting them here due to differences in the evaluation setup. As a result, our claims are restricted to comparisons of LLMs.\"[^1] They also note that unlabeled versions of their internal test data probably appear in FinPile, and that because some of FinPile is on the public web, the models they compared against may have seen it too.[^1] The comparison that matters most to a team deciding between building and adapting, a fresh model against a fine-tuned small one on the same split and prompt, is exactly the comparison the paper says it did not make."
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        { "title": "Wu et al., BloombergGPT: A Large Language Model for Finance, 2023", "url": "https://arxiv.org/abs/2303.17564" },
        { "title": "Li et al., Are ChatGPT and GPT-4 General-Purpose Solvers for Financial Text Analytics? A Study on Several Typical Tasks, 2023", "url": "https://arxiv.org/abs/2305.05862" },
        { "title": "Yang, Liu, and Wang, FinGPT: Open-Source Financial Large Language Models, 2023", "url": "https://arxiv.org/abs/2306.06031" },
        { "title": "Hu et al., LoRA: Low-Rank Adaptation of Large Language Models, 2021", "url": "https://arxiv.org/abs/2106.09685" },
        { "title": "Chen et al., FinQA: A Dataset of Numerical Reasoning over Financial Data, 2021", "url": "https://arxiv.org/abs/2109.00122" },
        { "title": "Chen et al., ConvFinQA: Exploring the Chain of Numerical Reasoning in Conversational Finance Question Answering, 2022", "url": "https://arxiv.org/abs/2210.03849" }
      ]
    }
  ]
};

// AI Engineering series post. Every factual claim is taken from the numbered sources at the end.
// The self-preference figure is reproduced under CC BY 4.0 (arXiv 2404.13076).
// The bar chart is redrawn from Table 4 of Wang et al. 2023 (arXiv 2305.17926), whose
// arXiv license does not permit figure reuse.
export const POST = {
  "id": "ai-as-a-judge",
  "title": "The measured biases of LLM judges, one at a time",
  "excerpt": "In 2023, GPT-4 judged the same 80 pairs of answers twice with only their order swapped and contradicted itself on 37 of them. A catalog of the biases papers have actually measured in LLM judges, how big each one was, which fixes were tested, and when the grades came close to human ones.",
  "category": "AI",
  "tags": [
    "Evaluation",
    "LLM as judge",
    "Bias"
  ],
  "seriesNum": 35,
  "publishAt": "2026-06-30T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In May 2023, Peiyi Wang and colleagues at Peking University, the University of Hong Kong and Tencent took the grading prompt that the Vicuna team used to rank chatbots and ran it twice on the same 80 questions.[^1] Each prompt showed GPT-4 two answers, one from Vicuna-13B and one from ChatGPT, and asked for a score from 1 to 10 for each. The prompt even told GPT-4 to make sure \"the order in which the responses were presented does not affect your judgment.\" The only change between the two runs was which answer came first. With Vicuna-13B in the first slot, GPT-4 said it won 51.3% of the time. In the second slot, it won 23.8% of the time. On 37 of the 80 questions, 46.3%, GPT-4 reversed its own verdict.[^1]"
    },
    {
      "type": "p",
      "text": "ChatGPT as the judge was worse and leaned the other way. It gave Vicuna-13B a 2.5% win rate in the first slot and 82.5% in the second, and contradicted itself on 66 of 80 questions.[^1] So by choosing the order, you could make Vicuna-13B beat ChatGPT on 66 of 80 questions with ChatGPT as the referee. That is the paper's headline, and it is where this catalog starts."
    },
    {
      "type": "p",
      "text": "An **LLM judge** is a language model prompted to grade the output of another model, or of itself. It replaces a human reader when there is no exact answer to check, such as a summary or a chat reply. The papers below each measured one way these grades go wrong, put a number on it, and in most cases tested a fix. Some biases have no tested fix yet, and I say so where that is the case."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Pairwise comparison",
          "def": "The judge sees two answers to the same question and says which is better, or scores both side by side. Wang et al. and the MT-Bench paper use this format.[^1,5]"
        },
        {
          "term": "Single-answer scoring",
          "def": "The judge sees one answer and gives it a score on a fixed scale, such as 1 to 5 for coherence. G-Eval works this way.[^3]"
        },
        {
          "term": "Conflict rate",
          "def": "The share of questions on which a judge gives different verdicts when the only change is the order of the two answers. Wang et al. define it and use it to size position bias.[^1]"
        },
        {
          "term": "Cohen's kappa and Scott's pi",
          "def": "Agreement scores that correct for the agreement two raters would reach by chance. A value of 1 is perfect agreement and 0 is chance level. Wang et al. report kappa; Thakur et al. argue that Scott's pi separates judges better than raw percent agreement does.[^1,4]"
        },
        {
          "term": "Spearman correlation",
          "def": "How well two lists of scores agree on ranking the same items, from -1 to 1. G-Eval reports it between judge scores and human ratings.[^3]"
        }
      ]
    },
    {
      "type": "h2",
      "text": "Position bias: the slot counts more than the answer"
    },
    {
      "type": "p",
      "text": "Wang et al. write the conflict rate as a count over \\(N\\) questions. For question \\(i\\), \\(ER_i^{r12}\\) is the verdict with response 1 shown first and \\(ER_i^{r21}\\) is the verdict with the order swapped:[^1]"
    },
    {
      "type": "eq",
      "tex": "\\text{Conflict Rate} = \\frac{1}{N} \\sum_{i=1}^{N} \\mathbb{I}\\big(ER_i^{r12} \\neq ER_i^{r21}\\big)",
      "caption": "Equation 1 of Wang et al., 2023.[^1] \\(\\mathbb{I}\\) is 1 when the two verdicts differ and 0 when they match."
    },
    {
      "type": "p",
      "text": "The size of the bias depended on how close the two answers were. When GPT-4 compared Vicuna-13B with the weaker Alpaca-13B, its conflict rate fell to 5.0%. Grouping questions by the gap between the two scores, the authors found GPT-4's verdicts were strongly affected by position when the gap was 1 point or less, and fairly stable when it was 3 or more.[^1] Position bias, in other words, decides the close calls. Close calls are exactly the comparisons you run when checking whether a new prompt beat the old one. That last point is my reading, not the paper's."
    },
    {
      "type": "p",
      "text": "The bias shows up outside chat benchmarks too. On news summaries, Panickssery, Bowman and Feng found that GPT-4, GPT-3.5 and Llama 2 reversed their pairwise preference when the options were swapped 25%, 58% and 89% of the time respectively.[^2] The MT-Bench authors, testing pairs of similar answers that GPT-3.5 generated for the same question, found that only GPT-4 gave consistent results in more than 60% of cases.[^5]"
    },
    {
      "type": "p",
      "text": "Wang et al. tested three fixes. **Evidence calibration** (EC) flips the prompt so the judge writes its explanation first and the scores last; their reasoning is that in a left-to-right model, a score written first cannot be supported by an explanation that comes after it. **Multiple evidence calibration** (MEC) samples \\(k\\) such evaluations at temperature 1 and averages them. **Balanced position calibration** (BPC) runs every comparison in both orders and averages all the scores:[^1]"
    },
    {
      "type": "eq",
      "tex": "CS_R = \\sum_{i=1}^{k} \\frac{S_R^{i} + S_R'^{\\,i}}{2k}, \\quad R \\in \\{r_1, r_2\\}",
      "caption": "Equation 2 of Wang et al., 2023,[^1] the calibrated score for each response."
    },
    {
      "type": "p",
      "text": "\\(S_R^i\\) is the score response \\(R\\) got in the \\(i\\)-th sample when shown first, \\(S_R'^{\\,i}\\) the score when shown second, and \\(k\\) the number of samples per order. The response with the higher \\(CS_R\\) wins. The third fix, **human-in-the-loop calibration** (HITLC), measures how much the \\(2k\\) verdicts disagree with each other using an entropy score, and sends the most uncertain questions to a person.[^1]"
    },
    {
      "type": "p",
      "text": "To score the fixes, three of the authors labeled all 80 Vicuna-13B vs ChatGPT pairs as win, tie or lose, and the majority vote became the reference. Each human annotator agreed with that majority 71.7% of the time on average, with a kappa of 0.54.[^1] GPT-4 with the original prompt reached 52.7% accuracy and a kappa of 0.24. Explanation first raised it to 56.5%, three samples to 58.7%, and three samples in each order to 62.5% with a kappa of 0.37. Sending the 20% most uncertain questions to humans took it to 73.8% and 0.56, above the average single annotator.[^1]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Judge accuracy against the human majority vote, 80 Vicuna questions",
      "yLabel": "Accuracy (%)",
      "series": [
        { "label": "GPT-4 judge", "key": "g4" },
        { "label": "ChatGPT judge", "key": "cg" }
      ],
      "data": [
        { "label": "Original prompt", "values": { "g4": 52.7, "cg": 44.4 } },
        { "label": "EC, k=1", "values": { "g4": 56.5, "cg": 52.6 } },
        { "label": "MEC, k=3", "values": { "g4": 58.7, "cg": 53.2 } },
        { "label": "MEC, k=6", "values": { "g4": 60.9, "cg": 55.6 } },
        { "label": "MEC k=3 + BPC", "values": { "g4": 62.5, "cg": 58.7 } },
        { "label": "+ HITLC, 20%", "values": { "g4": 73.8, "cg": 71.3 } }
      ],
      "caption": "Redrawn from Table 4 of Wang et al., 2023.[^1] The average human annotator scored 71.7%. MEC with k=6 and MEC k=3 plus BPC make the same number of API calls and cost the same ($6.38 for GPT-4), so the gap between them is the value of swapping the order."
    },
    {
      "type": "p",
      "text": "The comparison inside the chart is the useful one. Six samples in one order and three samples in each of two orders cost the same, and the swapped version won for both judges.[^1] The human step is not free: the authors price the full human labeling at $30, and GPT-4 with 20% human help at $23.10. For ChatGPT as the judge, the same setup reached 71.3% at $18.30, which they describe as a 39% saving over all-human labeling at roughly human-level accuracy.[^1] Sampling several explanations first (MEC) also cut ChatGPT's conflict rate on the scoring prompt from 82.5% to 35.0%.[^1]"
    },
    {
      "type": "h2",
      "text": "Self-preference: judges pick the text that reads like their own"
    },
    {
      "type": "p",
      "text": "Panickssery et al. studied **self-preference**, where a judge rates its own output above others' while human raters see them as equally good.[^2] They sampled 1,000 news articles each from the XSUM and CNN/DailyMail datasets and had Llama-2-7b-chat, GPT-3.5 and GPT-4 each write summaries, alongside the human-written ones. In the pairwise test the judge sees its own summary and one other, without being told who wrote either, and picks the better one. The score is the judge's probability on its own summary, averaged over both orders to cancel position bias, so 0.5 means no preference.[^2]"
    },
    {
      "type": "image",
      "src": "/blog-images/ai-as-a-judge/self-preference-before-finetuning.webp",
      "alt": "Two panels of grouped bar charts. Left, pairwise self-preference: Llama-2 sits near 0.5 against the other models and 0.6 against humans; GPT-3.5 is about 0.56 against Llama-2, 0.46 against GPT-4 and 0.81 against humans; GPT-4 is about 0.85 against Llama-2, 0.95 against GPT-3.5 and 0.99 against humans. Right, individual scoring: all bars sit between 0.5 and 0.6.",
      "width": 2140,
      "height": 725,
      "caption": "Figure 4 from Panickssery et al., 2024,[^2] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Each panel is one judge; each bar is the alternative source its own summary was compared against. Scores are aggregated over both datasets."
    },
    {
      "type": "p",
      "text": "GPT-4 showed the strongest bias. Averaged over all alternatives, its pairwise self-preference score was 0.705 on XSUM and 0.912 on CNN/DailyMail. GPT-3.5 scored 0.582 and 0.431, and Llama 2 sat at 0.511 and 0.505, close to indifferent.[^2] A high score alone could just mean GPT-4 writes better summaries. The authors point to a different signal: when two models judge each other, their self-preference scores add up to more than 1, so for part of the data both prefer themselves, and they cannot both be right.[^2] All three judges showed their strongest self-preference against the human-written summaries.[^2]"
    },
    {
      "type": "p",
      "text": "The paper's main claim is about why. Out of the box, GPT-4 picked out its own summary with 73.5% accuracy against two other LLMs and humans.[^2] When the authors fine-tuned GPT-3.5 on 500 examples to recognize its own writing, its self-preference on XSUM rose from 0.582 to 0.898. Across fine-tuned models, including control runs trained on unrelated tasks like counting vowels, self-recognition and self-preference fell on a straight line.[^2] Then they labeled each summary with its supposed author. With true labels, GPT-4 on XSUM scored 0.73; with the labels swapped, 0.32, meaning it now preferred the summary it was told was its own. On CNN/DailyMail, and for Llama 2, swapping labels made little difference.[^2]"
    },
    {
      "type": "p",
      "text": "The fix the authors propose is **authorship obfuscation**: hide or disguise who wrote each text before a model judges it. They did not test it. They suggest paraphrasing text to block self-recognition as a future experiment.[^2] So for this bias the measured result is the size, not the cure. G-Eval's authors saw the same pattern from another angle: their GPT-4 judge gave GPT-3.5 summaries higher scores than human-written ones even in the subset where human judges preferred the human summaries.[^3]"
    },
    {
      "type": "h2",
      "text": "Verbosity: measured by MT-Bench, not by these four papers"
    },
    {
      "type": "p",
      "text": "**Verbosity bias** is a preference for longer answers even when they add nothing. None of the four papers this post is built on measures it; Thakur et al. list it as known and cite other work.[^4] The MT-Bench paper has a direct test. The authors took 23 answers containing numbered lists, had GPT-4 rephrase each list, and put the rephrased copy in front of the original, so a 5-item list became 10 items with no new information. A judge failed if it preferred the padded version. Claude-v1 and GPT-3.5 failed 91.3% of the time, GPT-4 8.7%.[^5] That paper does not report a fix tested against this attack."
    },
    {
      "type": "h2",
      "text": "Score compression: when every answer gets a 3"
    },
    {
      "type": "p",
      "text": "Single-answer scoring has its own failure. Liu et al., building the **G-Eval** judge at Microsoft, noticed two problems when asking an LLM for a 1 to 5 score. On some tasks one digit, such as 3, dominates the scores, which leaves little variance and a low correlation with human ratings. And LLMs usually give whole numbers even when the prompt asks for decimals, so many outputs tie.[^3] G-Eval's fix reads the model's probabilities for every allowed score instead of taking the one it prints:"
    },
    {
      "type": "eq",
      "tex": "\\text{score} = \\sum_{i=1}^{n} p(s_i) \\times s_i",
      "caption": "Equation 1 of Liu et al., 2023,[^3] the probability-weighted score."
    },
    {
      "type": "p",
      "text": "\\(S = \\{s_1, s_2, \\dots, s_n\\}\\) is the set of scores the prompt allows, 1 through 5 in their experiments, so \\(n = 5\\). \\(p(s_i)\\) is the probability the LLM assigns to answering with score \\(s_i\\). The result is an expected score, a real number: if the model puts most of its weight on 3 but some on 2, the final grade lands between them, and two answers that would both print \"3\" can now be ranked. Their Figure 1 example produces 2.59.[^3] GPT-4's API did not return token probabilities at the time, so the authors sampled 20 answers at temperature 1 and used the frequencies as estimates.[^3]"
    },
    {
      "type": "p",
      "text": "G-Eval also has the model write its own evaluation steps from the task description and criteria, a form of chain of thought, before filling in a form with the score.[^3] On the SummEval summarization benchmark, the full GPT-4 version reached an average Spearman correlation of 0.514 with human ratings. Dropping the probability weighting gave 0.502, and dropping the generated steps gave 0.500. For the GPT-3.5 version the weighting mattered more, 0.401 against 0.346.[^3] The earlier metrics were far behind: ROUGE-L at 0.165, BERTScore at 0.225, and the best trained evaluator, UniEval, at 0.474.[^3]"
    },
    {
      "type": "p",
      "text": "One number goes the other way, and the paper explains it. Kendall's tau, a rank agreement score that counts agreeing and disagreeing pairs, was higher without weighting (0.446 against 0.418). Tau does not count tied pairs at all, so a judge that ties often can look better on it than it is.[^3] If you compare judges by rank correlation, check how many ties each one produces."
    },
    {
      "type": "h2",
      "text": "Leniency: when unsure, judges say correct"
    },
    {
      "type": "p",
      "text": "Thakur et al. picked the easiest setting they could find, to separate judge errors from honest disagreement. Eleven LLM judges, plus two string-matching baselines, graded short answers from nine models on 400 TriviaQA questions as \"correct\" or \"incorrect\" against reference answers. Human raters agreed with their majority vote at a Scott's pi of 96.2 (scaled to 100) and 98.52% raw agreement.[^4]"
    },
    {
      "type": "p",
      "text": "To measure **leniency bias**, they model a judge as giving the right verdict with probability \\(P_c\\), and otherwise calling the answer correct with probability \\(P_+\\). A \\(P_+\\) above 0.5 means that when the judge's criteria drift from the instructions, it drifts toward passing the answer. Most judges were well above 0.5: Llama-2 70B at 0.99, Llama-3 70B at 0.90, GPT-4 Turbo at 0.69. JudgeLM-7B, a model trained to judge, was the exception at 0.19.[^4] Some judges also marked the dummy answers \"Yes\" and \"Sure\" as correct, and even a verbatim copy of the reference answer was not always marked correct.[^4]"
    },
    {
      "type": "p",
      "text": "They tested no fix aimed at leniency. The closest experiment varied the grading prompt from 45 tokens with no guidance to 301 tokens with guidelines and examples. The three strongest judges barely moved and improved slightly with more detail; weaker judges lost agreement with humans as the instructions got longer.[^4]"
    },
    {
      "type": "h2",
      "text": "When the papers say the grades hold up"
    },
    {
      "type": "p",
      "text": "On the trivia task, only GPT-4 Turbo, Llama-3 70B and Llama-3.1 70B reached Scott's pi values in the high 80s, still 8 or more points below the humans. Even these judges' scores for a given model differed from the human score by up to 5 points. Judges with over 90% raw agreement could differ by more than 10 points, which is why the authors recommend reporting Scott's pi alongside percent agreement, plus a qualitative look at errors.[^4]"
    },
    {
      "type": "p",
      "text": "Ranking is easier than scoring. Measured by Spearman correlation with the human ranking of the nine exam-takers, the plain substring check scored 0.99 and Mistral 7B scored 0.98, about as well as GPT-4 Turbo, even though their scores were far off.[^4] If the question is only which model is better, a cheap judge with a consistent bias can answer it. If you need the actual pass rate, it cannot."
    },
    {
      "type": "p",
      "text": "The other papers set their own bars. Wang et al. get GPT-4 to human-level agreement only after swapping the order, sampling several explanations, and handing the most uncertain 20% of questions to people.[^1] G-Eval reaches 0.514 Spearman on summaries, a clear gain over earlier metrics, while noting that people themselves barely agree when judging high-quality summaries: the source study it draws on reports a Krippendorff's alpha of 0.07 between annotators comparing human and GPT-3.5 summaries.[^3] And Wang's own data says position bias mostly matters when the two answers are close in quality.[^1]"
    },
    {
      "type": "p",
      "text": "Thakur et al. state the limit of their evidence directly. They chose a simple task on purpose, while judges are usually deployed to rank pairs of answers or grade complex ones, where human agreement is often low and the judges are hard to check. Their argument is that a judge failing the simple case deserves caution on the hard one, but they write that more studies are needed to understand how their results generalize to other scenarios.[^4]"
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        {
          "title": "Wang et al., Large Language Models are not Fair Evaluators, 2023",
          "url": "https://arxiv.org/abs/2305.17926"
        },
        {
          "title": "Panickssery, Bowman, and Feng, LLM Evaluators Recognize and Favor Their Own Generations, 2024",
          "url": "https://arxiv.org/abs/2404.13076"
        },
        {
          "title": "Liu et al., G-Eval: NLG Evaluation using GPT-4 with Better Human Alignment, EMNLP 2023",
          "url": "https://arxiv.org/abs/2303.16634"
        },
        {
          "title": "Thakur et al., Judging the Judges: Evaluating Alignment and Vulnerabilities in LLMs-as-Judges, GEM 2025",
          "url": "https://arxiv.org/abs/2406.12624"
        },
        {
          "title": "Zheng et al., Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena, NeurIPS 2023",
          "url": "https://arxiv.org/abs/2306.05685"
        }
      ]
    }
  ]
};

// AI Engineering series post, rewritten against research papers.
// Rendered by src/pages/blog/SeriesPost.jsx and scheduled in src/data/seriesPosts.js.
// Every factual claim is cited to the numbered sources at the end. The bar chart
// is redrawn from numbers reported in Section 4.2 and Table 9 of Singh et al.
// (arXiv 2504.20879); no figures are reproduced.
export const POST = {
  "id": "reading-benchmarks",
  "title": "Six questions to ask a leaderboard, learned from the Chatbot Arena dispute",
  "excerpt": "In early 2025 researchers counted 27 private Meta variants on Chatbot Arena in the run-up to Llama 4, and showed that picking the best of several tries lifts a score. The maintainers pushed back. The argument is a good checklist for reading any benchmark claim.",
  "category": "AI",
  "chapter": "Chapter 4",
  "tags": [
    "Benchmarks",
    "Evaluation",
    "Model Selection"
  ],
  "seriesNum": 25,
  "publishAt": "2026-05-20T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Between January and March 2025, a team led by researchers at Cohere Labs crawled Chatbot Arena, the public leaderboard where people vote between two anonymous chatbot answers, and asked each anonymous model who made it. They counted 27 private Meta models on the main leaderboard in the run-up to the Llama 4 release, plus 16 more on the vision leaderboard, for 43 in total. Google had 10. They found no private models from academic labs in that window.[^1] Then they tested what private testing buys you. They submitted two identical copies of their own Aya-Vision-8B model without telling the organizers the copies were the same. One copy finished at 1052 and the other at 1069, with four other models ranked between them.[^1]"
    },
    {
      "type": "p",
      "text": "The paper is called \"The Leaderboard Illusion,\" and its argument is simple. If a provider can test many versions in private and publish only the best score, the public number is biased upward, even when the versions are exactly the same model.[^1] The leaderboard's maintainers published a response disputing several of the claims, which this post covers below.[^2] Both documents are worth reading. Together they give you a set of questions to put to any benchmark claim, and the rest of this post works through them one at a time."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Arena score",
          "def": "Chatbot Arena's rating. It fits a Bradley-Terry model, which turns pairwise win and loss votes into one skill number per model, then rescales it so 400 points on the scale match a factor of 10 in the odds of winning.[^1]"
        },
        {
          "term": "Private variant",
          "def": "A model tested on the Arena under an anonymous code name before release. Voters see its answers, but its score is not published unless the provider releases it.[^1]"
        },
        {
          "term": "Selective disclosure",
          "def": "Publishing only some of the results you measured, usually the best ones. The paper also calls it retraction, meaning a provider drops a score it does not want to show.[^1]"
        },
        {
          "term": "Construct validity",
          "def": "How well a benchmark's data and metric actually represent the ability it is said to measure.[^4]"
        }
      ]
    },
    {
      "type": "h2",
      "text": "Who could test privately before submitting?"
    },
    {
      "type": "p",
      "text": "Start with the math, because it holds whatever you think about the politics. Every Arena score is an estimate from a finite number of votes, so it carries noise. Suppose a provider tests \\(N\\) variants and keeps the one with the highest observed score. The expected value of that maximum is strictly higher than the expected score of any single variant, whenever \\(N\\) is at least 2 and the estimates vary at all.[^1] The published number is no longer an unbiased estimate of one model's skill. It is the top of several draws."
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} \\mathbb{E}\\big[\\hat{\\beta}_{\\text{best}}\\big] > \\mathbb{E}\\big[\\hat{\\beta}_k\\big] \\\\[4pt] \\mathbb{E}\\big[\\hat{E}_{\\max}\\big] - \\mu \\approx \\sigma_{\\text{noise}} \\sqrt{2 \\ln N} \\end{gathered}",
      "caption": "Top: the best of N estimated skills beats any single one on average (Equation 1 of Singh et al., 2025). Bottom: the expected lift when all N copies are identical and only vote noise differs (Equation 6, Appendix I).[^1]"
    },
    {
      "type": "p",
      "text": "How big is the lift? That depends on how different the variants really are, and here the paper gives two cases. If every copy is identical, only the vote noise matters. With 3,000 votes the paper puts that noise at about 6.34 Arena points, so picking the best of 50 identical copies adds about 17.7 points, and the bias shrinks as votes grow.[^1] If the variants genuinely differ, as checkpoints from different seeds or data mixes do, the spread of true skill adds to the noise. Their simulation of that case shows about 50 points of lift from testing 20 variants.[^1] The paper's own summary box states a larger figure, about 100 points from 10 variants, which does not match the 50-point number in the body text and appendix. A careful reader should notice that inconsistency."
    },
    {
      "type": "p",
      "text": "The real-world test backs up the direction. Beyond the identical Aya-Vision-8B pair, the authors submitted two different Aya-Vision-32B checkpoints that their internal metrics had rated as similar finalists. These scored 1097 and 1059, with nine models between them on the leaderboard.[^1] A provider that got to see both numbers and publish one would have picked the 1097."
    },
    {
      "type": "p",
      "text": "So the first thing to ask about any leaderboard is who got more than one try, and whether the failed tries were published. The authors' first recommendation to the Arena was to ban score retraction outright and publish every result, private variants included. Their second was a public cap on how many variants one provider can test at once, with three as their example.[^1]"
    },
    {
      "type": "h2",
      "text": "Has the leaderboard's own team disputed the claim?"
    },
    {
      "type": "p",
      "text": "The Arena team published a response on 9 May 2025. It said its policy on testing unreleased models had been public since 1 March 2024, and that any model provider can submit as many public and private variants as it wants. It also said the team had helped Cohere evaluate 9 pre-release models since January 2025.[^2] On the size of the effect, the response called the paper's lift plot a simulation using Gaussians with a mean of 1200 and an arbitrarily chosen variance. It put the real boost from pre-release testing at around +11 points after 50 tests and 3,000 votes.[^2] It argued that the identical-checkpoint scores had overlapping confidence intervals, so the gap was the normal variation you should expect. It also disputed the paper's share of data going to open models, saying the paper's count left out open-weight models such as Llama and Gemma and that official statistics showed open models at 40.9%.[^2] The response also announced a change: when a provider tests 10 or more models at once, their scores will be marked as provisional until more votes arrive after release.[^2]"
    },
    {
      "type": "p",
      "text": "Read the two documents side by side and part of the dispute shrinks. For identical copies, the paper's own appendix gives about 17.7 points for 50 tests at 3,000 votes, and the response gives about 11. Both say the effect is small.[^1,2] My reading is that the real disagreement is about how far apart real candidate checkpoints sit in true skill. That spread drives the 50-point simulation, and neither side can measure it for other providers' private models. The Aya-Vision-32B pair, 38 points apart, is one data point on that question, not a settled answer.[^1] The overlapping-intervals argument also cuts both ways. If the gap between two identical copies is within the noise, then so are many gaps between different models on the public ranking."
    },
    {
      "type": "h2",
      "text": "Who has seen the most of the test distribution?"
    },
    {
      "type": "p",
      "text": "The second question is about data, not tries. Arena prompts come from real users, and each battle sends a prompt to two models, so both providers can see it. The paper estimates that Google and OpenAI each received about a fifth of all Arena data (19.2% and 20.4%), while 83 open-weight models together received about 29.7%.[^1] It also found a maximum daily sampling rate of up to 34% for OpenAI and Google models, and that 205 of 243 public models had been silently deprecated, far more than the 47 officially listed.[^1]"
    },
    {
      "type": "p",
      "text": "To test whether that data matters, the authors fine-tuned the same 7B base model three times, changing only the share of Arena data in the training mix: 0%, 30% or 70%. They scored each against Llama-3.1-8B-Instruct on ArenaHard, a set of 500 hard prompts drawn from the Arena, with GPT-4o as the judge. The win rate rose from 23.5% to 42.7% to 49.9%, a relative gain of 112% at the top. On MMLU, a general knowledge test, the same models went from 66.5% to 64.4% to 65.9%.[^1]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "More Arena data in fine-tuning: in-distribution gain, no general gain",
      "yLabel": "Score (%)",
      "series": [
        { "label": "ArenaHard win rate vs Llama-3.1-8B", "key": "ah" },
        { "label": "MMLU accuracy", "key": "mmlu", "baseline": true }
      ],
      "data": [
        { "label": "0% Arena data", "values": { "ah": 23.5, "mmlu": 66.5 } },
        { "label": "30% Arena data", "values": { "ah": 42.7, "mmlu": 64.4 } },
        { "label": "70% Arena data", "values": { "ah": 49.9, "mmlu": 65.9 } }
      ],
      "caption": "Redrawn from the results reported in Section 4.2 and Table 9 of Singh et al., 2025.[^1] One 7B base model, fine-tuned for 1.3K steps with each data mix, judged by gpt-4o-2024-11-20. The Arena team notes that ArenaHard is a static 500-prompt set, not the live Arena.[^2]"
    },
    {
      "type": "p",
      "text": "The pattern is the one to look for in any benchmark claim: a large gain on the test's own distribution with nothing to show on a different test. The paper reads it as overfitting to the Arena rather than general progress.[^1] The response objects that ArenaHard, a fixed set of 500 prompts, is not representative of the live Arena.[^2] That objection is fair as far as it goes, but it is not reassuring. The paper describes ArenaHard as widely used to predict Arena performance, with a reported 98.6% correlation to the Arena's human rankings.[^1]"
    },
    {
      "type": "h2",
      "text": "Would a different benchmark suite change the ranking?"
    },
    {
      "type": "p",
      "text": "Leave the Arena for a moment. Even with no private testing and no data advantage, the choice of which tasks go into a benchmark can decide the winner. Dehghani and colleagues at Google called this the benchmark lottery. Their claim is that a method has to be well aligned with whichever tasks the community treats as standard before it can be seen as better.[^3]"
    },
    {
      "type": "p",
      "text": "Their clearest test used SuperGLUE, an eight-task language benchmark. They took the per-task scores of more than 55 models and averaged them over every possible subset of tasks. There are 70 ways to choose 4 of the 8 tasks, and those 70 subsets produced 6 different top models. For the top 3 or top 5 positions, almost 60 of the 70 rankings disagreed with each other.[^3] On VTAB, a vision benchmark of 19 tasks tested on 32 models, they measured agreement with Kendall rank correlation. This compares two orderings and gives 1 when they match exactly and negative values when they tend to reverse. The \"structured\" group of tasks correlated only about 0.7 with the full score. Single tasks averaged about 0.60, and some were negatively correlated.[^3] On the Long Range Arena, the identity of the top three models changed frequently as the subset of its six tasks changed.[^3]"
    },
    {
      "type": "p",
      "text": "How you combine the numbers matters as much as which tasks you include. On the Atari games in RL Unplugged, ranking by mean and ranking by median human-normalized score did not agree. The mean can be dominated by a few games where agents score orders of magnitude above humans.[^3] In recommender systems, which have no standard split or metric, the authors point to a case where the same methods reverse their order when the metric changes from hit ratio and NDCG to Recall@K.[^3] For a reader, the check is concrete. When a model tops an aggregate score, look at the per-task table and ask whether the lead survives if you drop the task you care least about."
    },
    {
      "type": "h2",
      "text": "How many times has this test set been looked at?"
    },
    {
      "type": "p",
      "text": "Dehghani's group also argues that benchmarks are stateful. Every new submission is built with knowledge of earlier results on the same test set, through copied hyperparameters, shared code and reused checkpoints. They cite results from adaptive data analysis showing that once a test set has been queried enough times relative to its size, its score stops being evidence of model quality. They also note that empirical studies on popular datasets found less overfitting from reuse than that theory predicts.[^3] They put it in lottery terms: being able to query the test set more than others is like buying more lottery tickets.[^3] That is the Arena's private-testing problem in general form. Each private variant is one more ticket."
    },
    {
      "type": "p",
      "text": "Benchmarks also wear out. The Dynabench paper, written to argue for test sets that humans keep rewriting against current models, notes that models now pass estimated human performance on new benchmarks within a few years, yet still fail on simple challenge examples.[^5] A score on a test that has been public and heavily used for years tells you less than the same score on a fresh one."
    },
    {
      "type": "h2",
      "text": "What does the benchmark claim to measure versus what it can measure?"
    },
    {
      "type": "p",
      "text": "The last question is the hardest to answer from a leaderboard alone. Raji, Bender, Paullada, Denton and Hanna compare benchmarks sold as tests of general ability to a Sesame Street story. In it, Grover visits a museum that claims to hold everything in the whole wide world. It turns out to be an arbitrary set of rooms, and the last door marked \"Everything Else\" opens onto the street.[^4] Their point is about construct validity. A benchmark that claims to measure \"language understanding\" or \"visual understanding\" cannot deliver that, because any dataset is specific, finite and shaped by the context it came from.[^4]"
    },
    {
      "type": "p",
      "text": "Their evidence is mostly about how the famous benchmarks were built. GLUE's tasks were chosen from 30 proposals gathered through an informal survey of colleagues, filtered on practical grounds like licensing and headroom. The final set is two single-sentence tasks, two similarity and paraphrase tasks, and four inference tasks.[^4] Dehghani's group adds that seven of GLUE's eight tasks require modeling the relationship between two or more sequences. That format favors models with cross-attention built into the encoder, and the authors say it is unclear how much it has to do with language understanding.[^3] In an analysis of ImageNet's 2011 version, 45% of images came from the US, and only 1% and 1.2% came from China and India, the two most populous countries.[^4] The paper also points to marketing. In January 2021, Microsoft described DeBERTa beating human performance on SuperGLUE as a milestone toward general AI.[^4]"
    },
    {
      "type": "p",
      "text": "Chatbot Arena is not a static dataset, but the same question applies to it. The Leaderboard Illusion notes that Arena prompts are capped at 12,000 characters and that its users lean toward developers, which can over-weight puzzles and math problems. In one released set of 33,000 Arena prompts, dozens asked about Star Trek and none mentioned Chaucer.[^1] A top Arena score says a model wins pairwise votes from that population on those prompts. Whether that predicts performance on your customers' questions is a separate claim, and the leaderboard cannot make it for you."
    },
    {
      "type": "p",
      "text": "Raji and colleagues do not suggest adding more rooms to the museum. They suggest scoping benchmarks to concrete, well-defined tasks and pairing them with other methods: purpose-built test suites and audits, error analysis, results broken down by subgroup, and ablations.[^4] Applied to model selection, that means treating a public ranking as a shortlist and doing the deciding on examples drawn from your own task."
    },
    {
      "type": "h2",
      "text": "The question with no instrument yet"
    },
    {
      "type": "p",
      "text": "Most of these questions can at least be investigated with enough access: count the private tries, estimate the data shares, recompute the ranking on other task subsets, count test-set reuse. The Leaderboard Illusion's authors say plainly where even they ran out of access. They could not see the Arena's raw data, so they did not study adversarial voting, meaning users who vote to manipulate rankings. They identified private models by asking the models who made them, which they call inherently approximate. Their crawl covered only three months, and they say it may undercount providers with fewer launches in that window.[^1] The construct validity question is worse off. Raji and colleagues quote Bowman and Dahl: the criterion \"is difficult to fully formalize, and we know of no simple test that would allow one to determine if a benchmark presents a valid measure of model ability.\"[^4] The question a leaderboard reader most needs answered, whether this number measures the thing being claimed, is the one the field has no standard way to check."
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        { "title": "Singh, Nan, Wang, et al. (2025). The Leaderboard Illusion. arXiv:2504.20879", "url": "https://arxiv.org/abs/2504.20879" },
        { "title": "LMArena team (2025). Our Response to 'The Leaderboard Illusion' Writeup", "url": "https://arena.ai/blog/our-response/" },
        { "title": "Dehghani, Tay, Gritsenko, et al. (2021). The Benchmark Lottery. arXiv:2107.07002", "url": "https://arxiv.org/abs/2107.07002" },
        { "title": "Raji, Bender, Paullada, Denton, Hanna (2021). AI and the Everything in the Whole Wide World Benchmark. NeurIPS Datasets and Benchmarks. arXiv:2111.15366", "url": "https://arxiv.org/abs/2111.15366" },
        { "title": "Kiela, Bartolo, Nie, et al. (2021). Dynabench: Rethinking Benchmarking in NLP. arXiv:2104.14337", "url": "https://arxiv.org/abs/2104.14337" }
      ]
    }
  ]
};

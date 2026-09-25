// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
// Every factual claim is taken from the numbered sources at the end.
// The emergence figure is reproduced from Wei et al. 2022 (arXiv 2206.07682, CC BY 4.0).
// The bar chart is redrawn from the Figure 4 table of Eldan and Li 2023, whose
// arXiv license does not allow reuse of the figure itself.
export const POST = {
  "id": "model-size",
  "title": "Emergent abilities: what a bigger model buys, and what the metric invents",
  "excerpt": "In 2022, GPT-3 looked useless at arithmetic until 13 billion parameters, then suddenly wasn't. A year later a Stanford team argued the jump came from the scoring rule, and a Microsoft team got a 28M model to write coherent stories. Read together, the three papers give a sharper answer to what size buys.",
  "category": "AI",
  "chapter": "Chapter 2",
  "tags": [
    "Model Size",
    "Scaling",
    "Emergent Abilities",
    "Evaluation"
  ],
  "seriesNum": 19,
  "publishAt": "2026-04-08T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Panel A of Figure 2 in Wei et al.'s 2022 paper on emergent abilities shows a flat line with a cliff at the end. The task is modified arithmetic from the BIG-Bench suite, which the authors describe as testing 3-digit addition and subtraction plus 2-digit multiplication, given to each model with two worked examples in the prompt. The y-axis is accuracy. GPT-3 and LaMDA models sit at close to zero \"for several orders of magnitude of training compute,\" and then performance jumps sharply above random at about 2 × 10²² training FLOPs for GPT-3, which is the 13 billion parameter model, and at 10²³ FLOPs, or 68 billion parameters, for LaMDA.[^1]"
    },
    {
      "type": "image",
      "src": "/blog-images/model-size/wei-fig2-emergence.webp",
      "alt": "Four small line plots of task score against training FLOPs on a log axis from 10^18 to 10^24. In modified arithmetic, IPA transliteration and word unscramble, GPT-3 and LaMDA points lie on the zero line for most of the range, then rise steeply at the right edge, GPT-3 reaching above 30 percent accuracy on arithmetic. In Persian QA, all points hover around the 25 percent random line until the two largest PaLM models climb to about 45 percent.",
      "width": 1920,
      "height": 690,
      "caption": "Four of the eight tasks in Wei et al.'s Figure 2. The x-axis is training compute in FLOPs; each point is a separate model; the dashed line is random performance. Top row of Figure 2 from Wei et al., 2022,[^1] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)."
    },
    {
      "type": "p",
      "text": "The GPT-3 paper had already seen the same wall from the other side. There, the 175 billion parameter model got 100% on 2-digit addition and 80.2% on 3-digit addition with a few examples in the prompt, while the 13 billion parameter model could do 2-digit addition and subtraction \"only half the time, and all other operations less than 10% of the time.\"[^3] If you care about what extra parameters buy, a curve like this is the strongest possible answer: nothing, nothing, nothing, then a skill. The rest of this post is about whether that reading holds up."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Parameter",
          "def": "One learned number inside the network. \"13B\" means 13 billion of them. The papers here use parameter count, or training compute, as the measure of scale."
        },
        {
          "term": "Training FLOPs",
          "def": "The total count of arithmetic operations spent training a model. Within one model family it grows roughly in step with parameter count, so both give curves of similar shape.[^1]"
        },
        {
          "term": "Token",
          "def": "The unit of text a model reads and writes, often a word piece or a single digit. An answer like \"4821\" can be several tokens."
        },
        {
          "term": "Per-token cross-entropy",
          "def": "The training loss: minus the log of the probability the model gave to the correct next token. Lower is better, and it is the quantity scaling curves usually track."
        },
        {
          "term": "Metric",
          "def": "The rule that turns a model's output into a score. The whole debate below is about how much the choice of rule shapes the curve you see."
        }
      ]
    },
    {
      "type": "h2",
      "text": "The case that size unlocks new skills"
    },
    {
      "type": "p",
      "text": "Wei and colleagues define the term narrowly: \"An ability is emergent if it is not present in smaller models but is present in larger models.\"[^1] On a scaling curve that looks like the arithmetic plot, near random up to some critical scale and well above random after it. They borrow the physics name for it, a phase transition, and they draw the practical consequence: an emergent ability cannot be predicted by extrapolating from smaller models.[^1]"
    },
    {
      "type": "p",
      "text": "The paper's Table 1 is a catalogue. Few-shot 3-digit addition and subtraction emerges at 2.3 × 10²² FLOPs (GPT-3 13B). The 57-subject MMLU exam average emerges at 3.1 × 10²³ FLOPs (GPT-3 175B). The Word in Context benchmark, a test of whether a word means the same thing in two sentences, emerges only with PaLM at 540B.[^1] Word in Context is the example the authors lean on most. The GPT-3 paper had blamed its failure there on architecture or training objective and suggested a different design. PaLM, a decoder-only model like GPT-3, crossed the line when scaled from 62B to 540B, without those architectural changes.[^1]"
    },
    {
      "type": "p",
      "text": "BIG-Bench's own authors saw the same pattern across their 200-plus tasks and gave it a different name, \"breakthrough\" behavior. The tasks with the sharpest breakthroughs tended to be composite, needing several distinct skills or steps; modified arithmetic was their clearest example. The tasks that improved most steadily with scale were knowledge-based, like trivia questions.[^2]"
    },
    {
      "type": "p",
      "text": "Wei et al. were not naive about measurement. Their discussion section says outright that exact string match on long answers \"may disguise compounding incremental improvements as emergence.\" They also ran the check: on six emergent BIG-Bench tasks, cross-entropy loss kept improving even at small scales where the task metric sat flat at random.[^1] Their defense was twofold. That analysis does not tell you when the jump in the task score will come. And emergence still shows up on classification tasks such as Persian QA, TruthfulQA and Word in Context, where there is no long answer to get partly right.[^1]"
    },
    {
      "type": "h2",
      "text": "The case that the ruler made the cliff"
    },
    {
      "type": "p",
      "text": "In 2023, Rylan Schaeffer, Brando Miranda and Sanmi Koyejo at Stanford took the metric point from footnote to thesis. Their claim is that for a fixed task and model family, emergent abilities \"appear due the researcher's choice of metric rather than due to fundamental changes in model behavior with scale.\"[^4] Nonlinear or discontinuous metrics produce jumps; linear or continuous ones, applied to the very same model outputs, produce smooth curves.[^4]"
    },
    {
      "type": "p",
      "text": "Two metrics matter most. **Exact string match** scores an answer 1 if the output string matches the target exactly and 0 otherwise. **Multiple choice grade** scores 1 if the model puts the most probability on the correct option and 0 otherwise.[^4] Schaeffer's team counted BIG-Bench's hand-annotated emergent abilities and found that more than 92% of them appear under one of these two. Of the 39 metrics BIG-Bench prefers, at most 5 show any sign of emergence at all.[^4]"
    },
    {
      "type": "p",
      "text": "The alternative they test is **token edit distance**: the number of token substitutions, additions and deletions needed to turn the model's output into the target. It is the familiar Levenshtein string distance, counted in tokens instead of characters.[^4] Exact match asks \"is every token right?\" Edit distance asks \"how many tokens are wrong?\" A model that gets four of five digits right scores 0 on the first and has an edit distance of 1 on the second."
    },
    {
      "type": "h2",
      "text": "How a smooth loss turns into a jump, one term at a time"
    },
    {
      "type": "p",
      "text": "Schaeffer et al. build a small mathematical model. They say they do not need this exact form to hold; it is there for illustration.[^4] Start with the assumption, common in scaling-law work, that per-token cross-entropy falls as a power law in the number of parameters \\(N\\):"
    },
    {
      "type": "eq",
      "tex": "\\mathcal{L}_{CE}(N) = \\left(\\frac{N}{c}\\right)^{\\alpha}, \\qquad c > 0,\\; \\alpha < 0",
      "caption": "Per-token loss as a power law in parameter count, from Section 2 of Schaeffer et al., 2023.[^4]"
    },
    {
      "type": "p",
      "text": "Here \\(c\\) is a positive constant that sets the scale, and \\(\\alpha\\) is a negative exponent, so as \\(N\\) grows, \\((N/c)^{\\alpha}\\) shrinks and the loss falls smoothly. Because this cross-entropy is minus the log probability of the correct token, undoing the log gives the chance that the model picks the correct token at one position:[^4]"
    },
    {
      "type": "eq",
      "tex": "p_N = \\exp\\!\\big(-\\mathcal{L}_{CE}(N)\\big) = \\exp\\!\\Big(-\\big(N/c\\big)^{\\alpha}\\Big)",
      "caption": "Per-token probability of a correct token, Schaeffer et al., 2023.[^4] As the loss goes to zero, \\(p_N\\) rises smoothly toward 1."
    },
    {
      "type": "p",
      "text": "Now score an answer that is \\(L\\) tokens long, such as an \\(L\\)-digit sum. Under exact match, the answer counts only if all \\(L\\) tokens are right. Assuming each token is right independently, the probabilities multiply. Under edit distance, you instead count the expected number of wrong tokens, which is \\(L\\) times the per-token error rate:[^4]"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} \\text{Accuracy}(N) \\approx p_N^{\\,L} = \\exp\\!\\Big(-\\big(N/c\\big)^{\\alpha}\\Big)^{L} \\\\[6pt] \\text{TokenEditDistance}(N) \\approx L\\,\\big(1 - p_N\\big) \\end{gathered}",
      "caption": "The same per-token probability scored two ways, Schaeffer et al., 2023.[^4] Accuracy raises it to the power \\(L\\); edit distance scales the error by \\(L\\)."
    },
    {
      "type": "p",
      "text": "The exponent \\(L\\) is the whole trick. A worked example makes it concrete; these are my numbers, not the paper's. Take a 5-token answer. If per-token accuracy climbs from 0.5 to 0.9 to 0.99 as models grow, exact-match accuracy goes from 0.5⁵ ≈ 3.1% to 0.9⁵ ≈ 59% to 0.99⁵ ≈ 95%. The expected edit distance goes from 2.5 wrong tokens to 0.5 to 0.05. The first series sits near the floor and then shoots up; the second shrinks steadily. On a plot with a log scale for model size, the first one looks like Wei's cliff. The paper states it more carefully: under accuracy the per-token error rate compounds geometrically with target length, under edit distance only quasi-linearly.[^4]"
    },
    {
      "type": "p",
      "text": "They then checked it on real outputs. They queried the InstructGPT/GPT-3 models then available through the OpenAI API (350M, 1.3B, 6.7B and 175B parameters) on 2-shot multiplication of two 2-digit numbers and 2-shot addition of two 4-digit numbers.[^4] Scored by accuracy, the family showed emergence when the target had 4 or 5 digits. Scored by token edit distance, with the model outputs held fixed, performance improved \"smoothly, continuously and predictably.\"[^4] A second test attacked resolution. With a small test set, a model that is right, say, 0.1% of the time will often score zero; the paper sets resolution at one over the test set size. After they generated more test problems, every model in the family scored above chance on accuracy too.[^4]"
    },
    {
      "type": "p",
      "text": "For the classification tasks that Wei et al. held up as the harder cases, they used a different continuous metric. On BIG-Bench tasks where the LaMDA family looked emergent under multiple choice grade, switching to the Brier score, which for a yes/no outcome is the mean squared error between the outcome and the probability the model assigned, made the emergence disappear.[^4] And they point at a statistics problem: BIG-Bench has at least 220 tasks, about 40 metrics per task and about 10 model families, around a million combinations, so some curves will look like jumps by chance.[^4]"
    },
    {
      "type": "p",
      "text": "The BIG-Bench paper itself had made a milder version of this point a year earlier. It calls exact_str_match's all-or-nothing scoring a source of apparent sudden breakthroughs, and notes that the underlying change \"is generally more smooth\" once you use smoother metrics or break a task into subtasks.[^2]"
    },
    {
      "type": "callout",
      "title": "What the mirage paper does not claim",
      "text": "Schaeffer et al. write that \"nothing in this paper should be interpreted as claiming that large language models cannot display emergent abilities.\" Their claim is narrower: the previously published examples might be a mirage created by how researchers scored them.[^4] Their own math also leans on an assumption they flag in a footnote: tokens being right independently of each other is not true, though the approximation qualitatively matches the emergence claims.[^4]"
    },
    {
      "type": "h2",
      "text": "The other direction: how small can a model be?"
    },
    {
      "type": "p",
      "text": "Both of those papers ask what happens as models get bigger on a fixed benchmark. Ronen Eldan and Yuanzhi Li at Microsoft Research asked the reverse question: hold the ability fixed and see how small the model can get. The ability they picked was writing coherent English. Their starting point was that models of about 125M parameters, such as GPT-Neo small and GPT-2 small, \"can rarely generate coherent and consistent English text beyond a few words\" even after long training.[^5]"
    },
    {
      "type": "p",
      "text": "Their suspicion was that the web is the problem, not English. A model trained on Wikipedia has to learn the language and also store a huge spread of facts. So they built TinyStories: short stories generated by GPT-3.5 and GPT-4 using only words a typical 3 to 4 year old would understand. To keep the stories varied, each prompt required one random verb, noun and adjective from a list of about 1,500 basic words, plus a random mix of story features like dialogue or a bad ending.[^5]"
    },
    {
      "type": "p",
      "text": "Models trained on it are tiny by LLM standards: below 10 million parameters, or with just one transformer block, and still producing stories of several paragraphs with almost perfect grammar.[^5] Models between roughly 1M and 35M parameters each trained on a single V100 GPU in at most 30 hours.[^5] The paper's first figure gives the same story prompt to a 28M TinyStories model and to GPT-2 XL at 1.5B parameters, trained with essentially the same architecture and scheme. The small model finishes the scene about bitter soup sensibly; GPT-2 XL drifts off topic.[^5] On a reasoning prompt (Lily asked for a dog, her mom said no, \"so instead she asked\"), a 2.5M model repeats the request for a dog, while a 33M model answers \"her dad for a cat.\"[^5]"
    },
    {
      "type": "p",
      "text": "To score the stories they did not use exact match. GPT-4 graded each completion like a teacher, from 1 to 10, on grammar, creativity and consistency with the story's opening. Each model wrote 10 completions at temperature 1 for each of about 50 hand-written prompts, and the grades were averaged.[^5]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "GPT-4 grades on story completion (out of 10)",
      "yLabel": "Average GPT-4 score",
      "valueLabels": false,
      "series": [
        { "label": "Grammar", "key": "g" },
        { "label": "Consistency", "key": "c" },
        { "label": "Creativity", "key": "k" }
      ],
      "data": [
        { "label": "TS width 64", "values": { "g": 6.14, "c": 4.45, "k": 4.68 } },
        { "label": "TS width 128", "values": { "g": 7.23, "c": 7.10, "k": 5.97 } },
        { "label": "TS width 768", "values": { "g": 8.62, "c": 9.34, "k": 7.02 } },
        { "label": "GPT-2 125M", "values": { "g": 5.40, "c": 4.32, "k": 3.70 } },
        { "label": "GPT-2 774M", "values": { "g": 6.43, "c": 6.04, "k": 4.30 } },
        { "label": "GPT-4", "values": { "g": 8.75, "c": 9.93, "k": 8.21 } }
      ],
      "caption": "Redrawn from the table in Figure 4 of Eldan and Li, 2023.[^5] \"TS\" rows are 8-layer models trained on TinyStories with the given hidden size (the paper reports width and depth, not parameter counts, in this table). GPT-2 small and GPT-2 large were trained on general web text; the paper truncated their outputs at the first repeated 4-gram."
    },
    {
      "type": "p",
      "text": "Two things in that table bear on the debate. First, the same paper reports its own emergence: consistency with the story's beginning \"emerges when the hidden size of the model increases from 64 to 128,\" and grammar is mastered by small models while consistency and creativity come later.[^5] Second, where that jump happens depends on the data. At 8 layers, going from hidden size 64 to 128 lifts consistency from 4.45 to 7.10, a level GPT-2 large at 774M parameters does not reach on these prompts (6.04).[^5] The largest TinyStories model, about 80M parameters, scores almost perfectly on grammar and consistency but still falls well short of GPT-4 on creativity, which the authors read as creativity continuing to improve with model and dataset size.[^5]"
    },
    {
      "type": "p",
      "text": "Wei et al. had anticipated part of this. They wrote that the scale at which an ability first appears \"is not an immutable property of the ability,\" and that it may come with less compute for models trained on higher-quality data.[^1] They also cite 14 BIG-Bench tasks on which PaLM 62B scored above random while LaMDA 137B and GPT-3 175B stayed near random.[^1]"
    },
    {
      "type": "h2",
      "text": "My reading of what size buys"
    },
    {
      "type": "p",
      "text": "This section is my interpretation, not a result from any of the papers."
    },
    {
      "type": "p",
      "text": "Size buys coverage. On a narrow distribution, like stories built from 1,500 words, a model with tens of millions of parameters has enough room to learn the grammar, the facts and a bit of reasoning, and the TinyStories table shows it beating web-trained models ten times its size on that one job. On a broad distribution the same capacity is spread across everything the web contains, and the skill you want gets a thin slice of it. BIG-Bench's observation that knowledge-heavy tasks improve most steadily with scale fits this picture.[^2]"
    },
    {
      "type": "p",
      "text": "On the cliff, I think Schaeffer et al. are right about the science and Wei et al. are right about the experience. The per-token gains underneath are smooth, and if you measure them, you can see the next model coming. But if your product needs every token of a 5-digit number, a JSON field or a function signature to be right, your users are scoring with exact match whether you like it or not. For them 0.9⁵ versus 0.99⁵ is the difference between a broken tool and a working one. The jump is real at the level of the product even if it is not a phase transition inside the model."
    },
    {
      "type": "p",
      "text": "The practical habit that follows is to report both kinds of score when you compare model sizes on your own task: the all-or-nothing number that matches how the output gets used, and a graded one such as edit distance or the probability of the correct answer. The graded score tells you whether a smaller model is close; the strict one tells you whether it is good enough yet."
    },
    {
      "type": "h2",
      "text": "What TinyStories could not rule out"
    },
    {
      "type": "p",
      "text": "The small-model result has a gap the authors name themselves. They show that their models' stories rarely repeat 4- or 5-word sequences from the training set and that completions usually differ from the original stories. But they write that they \"are not able to completely rule out the possibility that the models perform complex template matching, as it is hard to define and measure what constitutes a novel plot or a novel story,\" and they call this \"a limitation of our evaluation.\"[^5] Their conclusion adds that it \"remains a challenge\" to tell how far the models understand the stories rather than template-match their way to a plausible continuation.[^5] So a 28M model can sound like it understands a story about bitter soup, and nobody yet has a metric that says how much of that is understanding. The same question about metrics sits under the arithmetic cliff."
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        { "title": "Wei et al., Emergent Abilities of Large Language Models, TMLR 2022", "url": "https://arxiv.org/abs/2206.07682" },
        { "title": "Srivastava et al. (BIG-bench), Beyond the Imitation Game: Quantifying and Extrapolating the Capabilities of Language Models, 2022", "url": "https://arxiv.org/abs/2206.04615" },
        { "title": "Brown et al., Language Models are Few-Shot Learners, 2020", "url": "https://arxiv.org/abs/2005.14165" },
        { "title": "Schaeffer, Miranda, and Koyejo, Are Emergent Abilities of Large Language Models a Mirage?, 2023", "url": "https://arxiv.org/abs/2304.15004" },
        { "title": "Eldan and Li, TinyStories: How Small Can Language Models Be and Still Speak Coherent English?, 2023", "url": "https://arxiv.org/abs/2305.07759" }
      ]
    }
  ]
};

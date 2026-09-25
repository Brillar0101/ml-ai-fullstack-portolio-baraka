// Every factual claim below is taken from the numbered sources at the end.
// Both charts are redrawn from reported numbers: Chen et al. 2023 and
// Rabanser et al. 2019 are arXiv non-exclusive licenses, so no figures are
// reproduced. Where the text reads a finding onto LLM features, it says so.
export const POST = {
  id: 'what-to-log-and-alert',
  title: 'Postmortem of a Silent Regression: What to Log and Alert On for an LLM Feature',
  excerpt: 'Between March and June 2023, GPT-4 went from 84% to 51% on a prime number task and from 52% to 10% on code that runs as written, while every request still came back as normal text. Read as an incident report, the drift studies and ML monitoring papers say which signals would have caught it.',
  category: 'AI',
  tags: ['Observability', 'Monitoring', 'Production'],
  body: [
    {
      type: 'h2',
      text: 'The incident: same model name, different behavior',
    },
    {
      type: 'p',
      text: "In 2023 Lingjiao Chen, Matei Zaharia and James Zou ran the same prompts against two versions of GPT-4 and GPT-3.5 that OpenAI's API offered at the time, one snapshotted in March 2023 and one in June.[^1] They kept the default system prompt and set temperature to 0.1, a low setting that makes the output close to repeatable, so differences would come from the model and not from sampling luck.[^1]",
    },
    {
      type: 'p',
      text: "On 1,000 questions of the form \"Is 17077 a prime number? Think step by step\", GPT-4's accuracy fell from 84.0% in March to 51.1% in June. Its average answer shrank from 638.3 characters to 3.9: the June model skipped the step-by-step reasoning it had been asked for and just wrote its answer.[^1] It also came to label almost every number as composite, 99.7% of the time.[^1] GPT-3.5 moved the other way on the same task, from 49.6% to 76.2%.[^1]",
    },
    {
      type: 'p',
      text: "Code broke too, and not because the logic got worse. The authors gave both models 50 recent easy LeetCode problems with the instruction \"Generate the code only without any other text\" and sent each answer straight to LeetCode's online judge. GPT-4 answers that ran and passed went from 52.0% to 10.0%; GPT-3.5 went from 22.0% to 2.0%.[^1] The June versions wrapped their code in Markdown fences (```python at the top, ``` at the bottom), which is not valid Python. With that extra text stripped, June GPT-4 passed 70.0%, more than March.[^1] The authors warn that this kind of formatting shift \"can be particularly challenging to detect\" when the code feeds a larger software pipeline.[^1]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'GPT-4, March 2023 vs June 2023',
      yLabel: 'Percent of prompts',
      series: [
        { label: 'March 2023', key: 'mar', baseline: true },
        { label: 'June 2023', key: 'jun' },
      ],
      data: [
        { label: 'Prime task correct', values: { mar: 84.0, jun: 51.1 } },
        { label: 'Code runs as-is', values: { mar: 52.0, jun: 10.0 } },
        { label: 'Sensitive Q answered', values: { mar: 21.0, jun: 5.0 } },
        { label: 'Answer-format rule followed', values: { mar: 99.5, jun: 0.5 } },
      ],
      caption: 'Redrawn from Figures 3, 7, 9 and 13 and Tables 1, 3 and 4 of Chen, Zaharia and Zou, 2023.[^1] Sample sizes: 1,000 prime questions, 50 LeetCode problems, 100 sensitive questions, 200 arXiv abstracts for the answer-format instruction.',
    },
    {
      type: 'p',
      text: "Other behaviors shifted as well. On 100 questions that a model is not supposed to answer directly, GPT-4 answered 21.0% in March and 5.0% in June, and its replies shrank from over 600 characters to about 140, partly because it stopped explaining its refusals and just said it could not help.[^1] On a test of pure instruction following, GPT-4 honored \"answer yes or no within squared brackets\" 99.5% of the time in March and 0.5% in June. In June it still used the brackets but capitalized the answer, so a string match on \"[yes]\" would miss.[^1] The paper's summary: behavior of the \"same\" LLM service \"can change substantially in a relatively short amount of time.\"[^1]",
    },
    {
      type: 'p',
      text: "The rest of this post treats that study as an incident report on a feature you might own. The paper measured model behavior, not anyone's production system, so the incident framing is mine. The monitoring advice comes from papers written about exactly this class of failure.",
    },
    {
      type: 'h2',
      text: 'Timeline: why uptime and latency charts stay flat',
    },
    {
      type: 'ul',
      items: [
        "**March 2023.** GPT-4 follows \"generate the code only\". Half its LeetCode answers run as written.[^1]",
        "**March to June.** The model is updated. The authors note that when and how GPT-3.5 and GPT-4 are updated is opaque.[^1]",
        "**June 2023.** The same prompt at the same temperature returns code inside Markdown fences. Only 10% of answers now run and pass as written.[^1]",
        "**What the service metrics show.** A request went out and text came back. The paper does not report API errors or latency, and I am reading the absence here: the regression lives inside a normal-looking reply, where a status code or a response-time histogram cannot see it.",
      ],
    },
    {
      type: 'p',
      text: "The ML reliability literature named this pattern years before LLM APIs. Rabanser, Günnemann and Lipton open their shift-detection paper by contrasting ordinary software, which throws warnings on bad input, with ML systems, which \"tend to fail silently.\"[^2] Google's ML Test Score rubric says changes in an upstream source can \"radically change\" what a feature means \"without necessarily producing values that are strange enough to trigger other monitoring.\"[^4] Sculley and colleagues call this an **unstable data dependency**: an input produced by another system that changes behavior over time, sometimes because it is itself a model being updated. Even an \"improvement\" to such an input can hurt the system that consumes it.[^3] A hosted LLM behind your feature is that kind of dependency.",
    },
    {
      type: 'p',
      text: "The rubric's authors also describe teams that assumed they needed no monitoring of their own, because their predictions were served inside a larger system whose reliability engineers would notice problems. The smaller system's errors, they reply, may be \"masked in the noise of the larger system.\"[^4] Watching whether the service is up answers a different question from whether it is right. What follows is one section per signal that would answer the second question.",
    },
    {
      type: 'h2',
      text: 'Signal 1: the model version that actually answered',
    },
    {
      type: 'p',
      text: "Log which model version served every request, in a field of its own. The ML Test Score's first monitoring test is \"dependency changes result in notification\": subscribe to the announcement lists of every system you consume, and make sure its owners know you depend on it.[^4] Sculley's suggested fix for unstable inputs is a versioned copy, a frozen version you keep using until the new one has been vetted, at the price of possible staleness and of maintaining several versions.[^3] For an LLM API, my reading is that this means pinning a dated snapshot where the provider offers one, like the March and June versions Chen's team compared.[^1] With the version in every log line, any other signal in this post can be split by version, and a step change lines up with the day the version changed.",
    },
    {
      type: 'h2',
      text: 'Signal 2: format validity rate',
    },
    {
      type: 'p',
      text: "If your code parses the model's output (JSON, a bracketed label, a code block), count how often that parse succeeds and alert on the rate. This is the cheapest signal to compute and the one that would have caught both of Chen's formatting failures: the Markdown fences around code and the capitalized \"[Yes]\".[^1] It also tells you what kind of failure you have. Once the fences were stripped, June GPT-4's code passed more tests than March's.[^1] A parse-rate drop with steady answer quality points to post-processing you can fix the same day, not to a model you have to replace.",
    },
    {
      type: 'p',
      text: "The ML Test Score calls this checking **data invariants**: define a schema for the data a system expects, measure whether live data matches it, and alert when they diverge significantly.[^4] The rubric attaches a warning that applies to every alert in this post: thresholds need careful tuning to balance false positives against false negatives, or the alerts stop being useful.[^4]",
    },
    {
      type: 'h2',
      text: 'Signal 3: answer length and refusal rate',
    },
    {
      type: 'p',
      text: "Beyond each task's own score, Chen's team tracked two metrics for every task. **Verbosity** is the length of the reply in characters. **Mismatch** is how often the two versions give different extracted answers to the same prompt.[^1] Neither needs a correct answer to compute, and both moved sharply: GPT-4's prime-task replies went from 638.3 characters to 3.9, and its refusal replies from over 600 to about 140.[^1] Response rate, the share of prompts the model answers directly instead of declining, fell on opinion survey questions from 97.6% to about 22% for GPT-4 (the text says 22.1%, a figure 23.4%).[^1]",
    },
    {
      type: 'p',
      text: "Mismatch needs a noise floor, because models vary between runs even at low temperature. GPT-3.5 changed 27% of its opinion survey answers between March and June. Running the March model twice gave 2.8% disagreement, and running the June model twice gave 7.0%.[^1] That gap is what makes 27% a real shift and not noise. Before alerting on a change in answers, measure how much your setup disagrees with itself.",
    },
    {
      type: 'p',
      text: "Sculley's paper suggests a similar check for classifiers, called **prediction bias**: the distribution of predicted labels should usually match the distribution of observed labels. They admit a model that always predicts the average passes it, but call it \"a surprisingly useful diagnostic,\" and suggest slicing it by different dimensions to find problems fast and to drive automated alerts.[^3] The LLM analogue I would log is the mix of outcome types (answered, refused, fell back to a default) sliced by feature and by model version. That analogue is my reading of the paper, not something the paper tests.",
    },
    {
      type: 'h2',
      text: 'Signal 4: whether the inputs have shifted',
    },
    {
      type: 'p',
      text: "The first three signals watch the model. This one watches the users. **Dataset shift** means the data the system sees in production (the target distribution) differs from the data it was built and tested on (the source distribution). Rabanser, Günnemann and Lipton frame detecting it as a **two-sample test**: take a sample from each distribution and test the null hypothesis that both came from the same one.[^2] Standard tests lose power on high-dimensional data like raw images, so they first shrink each input to a short vector, then test that.[^2]",
    },
    {
      type: 'p',
      text: "They compared several ways to shrink the data. **BBSDs** (black box shift detection with soft predictions) uses the softmax output of a classifier already trained on the source data, meaning its list of class probabilities, as the representation.[^2] A **domain classifier** is instead trained to tell source samples from target samples, and if it beats a coin flip by more than chance allows (checked with a binomial test), the two sets differ.[^2] For the tests themselves, they ran either one multivariate test over all dimensions (the kernel test MMD) or one **Kolmogorov-Smirnov (KS) test** per dimension. The KS test compares two empirical cumulative distributions and uses their largest gap as the statistic.[^2] Running \\(K\\) tests at once inflates the chance that one fires by luck, so they applied a **Bonferroni correction**: flag a shift only when the smallest p-value falls below \\(\\alpha / K\\).[^2]",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} Z = \\sup_{z} \\, \\lvert F_p(z) - F_q(z) \\rvert \\\\[4pt] \\text{shift if } \\min_{k} \\, p_k < \\alpha / K \\end{gathered}',
      caption: 'The KS statistic on one dimension, where \\(F_p\\) and \\(F_q\\) are the empirical CDFs of source and target samples, and the Bonferroni rule across \\(K\\) dimensions. Equation 4 and Section 3.2 of Rabanser et al., 2019.[^2]',
    },
    {
      type: 'p',
      text: "Across their simulated shifts on MNIST and CIFAR-10 images, BBSDs with per-dimension KS tests was the best method overall. Univariate tests with the Bonferroni correction worked about as well as the multivariate test, which surprised the authors given how conservative the correction is.[^2] The domain classifier did badly with 100 target samples or fewer and caught up as samples grew. The multivariate test run on raw, unreduced inputs, a widely used baseline, performed poorly.[^2]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Share of simulated shifts detected, by target sample size',
      yLabel: 'Detection accuracy',
      series: [
        { label: 'Raw inputs, KS', key: 'nored', baseline: true },
        { label: 'Domain classifier', key: 'classif' },
        { label: 'BBSDs, KS', key: 'bbsds' },
      ],
      data: [
        { label: '10 samples', values: { nored: 0.03, classif: 0.01, bbsds: 0.19 } },
        { label: '50', values: { nored: 0.26, classif: 0.11, bbsds: 0.47 } },
        { label: '100', values: { nored: 0.36, classif: 0.21, bbsds: 0.47 } },
        { label: '1,000', values: { nored: 0.54, classif: 0.51, bbsds: 0.70 } },
        { label: '10,000', values: { nored: 0.72, classif: 0.67, bbsds: 0.79 } },
      ],
      caption: 'Redrawn from Table 1a of Rabanser, Günnemann and Lipton, 2019,[^2] univariate rows plus the domain classifier. Averaged over all simulated shifts on MNIST and CIFAR-10 at significance level 0.05.',
    },
    {
      type: 'p',
      text: "Two more results matter for sizing an alert. Large shifts could be detected better than chance with only 20 samples using BBSDs, while small and medium shifts needed orders of magnitude more.[^2] And a shift that touched only 10% of the samples was hard to detect at all; the authors suggest such cases may suit outlier detection better.[^2] Not every detected shift is harmful, either. On the COIL-100 dataset they detected a real shift between object photos at different angles that left the classifier's accuracy intact.[^2]",
    },
    {
      type: 'p',
      text: "The authors see BBSDs winning as good news for practitioners, because any classifier you already run can double as a shift detector.[^2] Carrying this over to an LLM feature is my extrapolation, not their result: a small classifier you already run on incoming prompts (a topic or intent router, say) gives exactly the kind of soft output they tested, and a weekly KS test of this week's scores against a reference week is cheap. Their experiments were on images, and they list language data as untested.[^2]",
    },
    {
      type: 'h2',
      text: 'Signal 5: quality scored on a sample',
    },
    {
      type: 'p',
      text: "Format, length, refusals and input shift are all proxies. At some point someone has to judge whether answers are good. The ML Test Score's last monitoring test is that prediction quality on served data has not regressed. It admits the correct labels are often unknown even well after serving time, and it offers options, one of which is to have human raters label a sample of logged serving inputs.[^4] Its authors want thresholds set from quality bounds at launch, a responder notified right away when quality leaves them, and watch kept for both sudden drops and slow leaks.[^4]",
    },
    {
      type: 'p',
      text: "Labels are slow in practice. In an interview study of 18 ML engineers, Shankar and colleagues found feedback delay to be the most often reported data problem; one engineer said feedback on live predictions was \"always delayed by at least 2 weeks.\"[^5] Rabanser's paper offers a way to spend labels well. Label only the inputs the domain classifier rates as most typical of the new data, and check the model's accuracy on those. In their experiments, two to three orders of magnitude fewer labels than the full sample gave a good estimate of accuracy on the shifted data.[^2]",
    },
    {
      type: 'p',
      text: "Many teams now use another LLM as the grader. Zheng and colleagues found GPT-4 as a judge agreed with human experts 85% of the time on non-tied votes, higher than the 81% agreement between humans.[^6] They also measured its biases. With the order of two answers swapped, GPT-4 gave the same verdict only 65% of the time.[^6] When 23 answers were padded with a reworded copy of their own lists, Claude-v1 and GPT-3.5 preferred the padded version 91.3% of the time and GPT-4 8.7% of the time.[^6] Chen's study showed that verbosity itself drifts between versions,[^1] so a judge that favors long answers can give a better score to an update that only made replies longer. Swapping answer order and logging the judge's own model version are the least a sampled evaluator needs.",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Source and target distribution', def: 'The data a system was built and tested on (source) versus the data it meets in production (target). Shift detection asks whether they differ.' },
        { term: 'p-value', def: 'The probability of seeing a difference at least this large if the two samples really came from the same distribution. Small means the difference is unlikely to be luck.' },
        { term: 'Slow leak', def: "The ML Test Score's term for a regression that builds up gradually instead of arriving as a step, The rubric suggests catching sudden drops by comparing against prior versions, and slow leaks with a preset threshold.[^4]" },
      ],
    },
    {
      type: 'h2',
      text: 'Signal 6: how often each alert is ignored',
    },
    {
      type: 'p',
      text: "Every signal above can page someone, which is its own failure mode. False-positive alerts, meaning alerts that fire while the model is performing fine, were the pain point Shankar's interviewees raised most often.[^5] Many engineers alerted on every input column and every output column, and the authors point out that with enough tracked metrics, even over a handful of columns, the odds that at least one violates its bounds are high.[^5] That is the multiple-testing problem the Bonferroni correction exists for.[^2]",
    },
    {
      type: 'p',
      text: "The result was fatigue and alerts being silenced, which can hide real performance drops.[^5] One engineer said \"90% of them aren't immediate.\" Another described an internal tool that tracks which alerts on-call engineers actually acted on, and reports things like an alert that fired 1,000 times and was ignored 45% of the time.[^5] That ignore rate is a signal worth logging for your own alerts. An alert that is almost always dismissed should be retuned or deleted. Sculley's **action limits** set the bar from the other direction: limits \"broad enough not to trigger spuriously,\" which, when hit, should trigger manual investigation.[^3]",
    },
    {
      type: 'callout',
      title: 'One log record per request, from this postmortem',
      text: "Model version string.[^4] Whether the output parsed.[^1] Reply length and outcome type: answered, refused or fallback.[^1,3] The scores of any classifier already run on the input, for later KS tests.[^2] Request ID so late feedback, human labels or judge scores can join back.[^4,5] Keeping these in one record is my suggestion; each field traces to the cited paper.",
    },
    {
      type: 'h2',
      text: 'Still open: shift detection on a live stream of text',
    },
    {
      type: 'p',
      text: "The detection method that did best in Failing Loudly was tested on batches of images, compared at fixed sample sizes. Its authors list two open questions. One is detection on online data, which would have to account for the strong correlation between neighboring time steps. The other is whether the framework carries over to other domains, and they name natural language processing.[^2] A production LLM feature sits squarely inside both. Its inputs arrive as a correlated stream, one user's session after another, and they are text. On the label side, one of Shankar's interviewees put it bluntly: \"nobody is solving the label lag problem.\"[^5]",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Chen, Zaharia, and Zou, How Is ChatGPT\'s Behavior Changing over Time?, 2023', url: 'https://arxiv.org/abs/2307.09009' },
        { title: 'Rabanser, Günnemann, and Lipton, Failing Loudly: An Empirical Study of Methods for Detecting Dataset Shift, NeurIPS 2019', url: 'https://arxiv.org/abs/1810.11953' },
        { title: 'Sculley et al., Hidden Technical Debt in Machine Learning Systems, NeurIPS 2015', url: 'https://papers.nips.cc/paper_files/paper/2015/file/86df7dcfd896fcaf2674f757a2463eba-Paper.pdf' },
        { title: 'Breck, Cai, Nielsen, Salib, and Sculley, The ML Test Score: A Rubric for ML Production Readiness and Technical Debt Reduction, IEEE Big Data 2017', url: 'https://research.google.com/pubs/archive/46555.pdf' },
        { title: 'Shankar, Garcia, Hellerstein, and Parameswaran, Operationalizing Machine Learning: An Interview Study, 2022', url: 'https://arxiv.org/abs/2209.09125' },
        { title: 'Zheng et al., Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena, NeurIPS 2023', url: 'https://arxiv.org/abs/2306.05685' },
      ],
    },
  ],
};

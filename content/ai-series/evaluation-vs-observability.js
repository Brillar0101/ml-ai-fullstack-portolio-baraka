// Every factual claim below is taken from the numbered sources at the end.
// Both charts are redrawn from table values: Zheng et al. 2023 (Table 5) and
// Zhou et al. 2023 (Tables 1 and 3). Neither paper's arXiv license allows
// figure reuse, so no figure is reproduced.
export const POST = {
  id: 'evaluation-vs-observability',
  title: 'Why a Passing Eval Suite Still Needs Production Logs',
  excerpt: 'In a 2024 Berkeley study, developers kept rewriting their own grading rules as they read more model outputs. That finding, plus research on LLM judges, benchmark leakage, and real user traffic, makes a case that offline evaluation can only be a draft of what production observability later corrects.',
  category: 'AI',
  tags: ['Observability', 'Evaluation', 'Production'],
  body: [
    {
      type: 'p',
      text: "In 2024 a group at UC Berkeley asked nine industry practitioners to build automated checks for a language model pipeline. The pipeline pulled up to three well-known entities out of tweets. Two of the participants started with a rule that every extracted entity had to be a proper noun. As they graded more outputs, both decided the rule should say most entities, not all.[^1] Another participant noticed that some outputs kept hashtags like #justdoit while others turned #Nike into plain \"Nike,\" and had to rethink what the hashtag rule even meant. \"I think it's hard to know until you see it,\" that participant said.[^1]",
    },
    {
      type: 'p',
      text: "The authors named this **criteria drift**: people need criteria to grade outputs, but grading outputs is how they find out what their criteria are. Their conclusion is blunt. It is \"impossible to completely determine evaluation criteria prior to human judging of LLM outputs.\"[^1]",
    },
    {
      type: 'p',
      text: "That result is a problem for anyone who treats a pre-launch test run as the final word. **Offline evaluation** means scoring a candidate version on a fixed set of inputs before real users see it, against reference answers, code checks, or a grading model. **Observability** means recording what the live system actually receives and returns (inputs, outputs, intermediate steps, scores, user reactions) so you can ask questions about it after the fact. The argument below is that the first cannot stand in for the second, and it is made one claim at a time, each with the paper evidence behind it and the limits of that evidence.",
    },
    {
      type: 'h2',
      text: 'Your test set stops describing your users',
    },
    {
      type: 'p',
      text: "A test set is a guess about what users will send. The WildChat project shows how wide the real distribution gets. Its authors offered free ChatGPT access in exchange for consent to log transcripts and collected about one million conversations from 204,736 unique IP addresses.[^6] They counted 68 languages that appeared in more than 100 prompts each; English was 53% of turns, Chinese 13%, Russian 12%.[^6] In a sample of English first turns, 61.9% were creative writing or assistance requests and only 6.7% were coding.[^6] By either of two toxicity classifiers, 10.46% of user turns were flagged as toxic.[^6] Users also pasted in jailbreak prompts copied from social media. One of them, called \"JailMommy,\" appeared 274 times from 45 users and got a flagged response 71.16% of the time.[^6]",
    },
    {
      type: 'p',
      text: "A team writing test cases at a whiteboard would be unlikely to write most of that. The interview study of machine learning engineers by Shankar and colleagues describes how production teams respond. Ten of the 18 engineers they interviewed described analyzing live failures and adding them to their validation sets so the same failure would not recur.[^2] One engineer contrasted this with academic practice, where researchers evaluate \"against fixed data sets,\" while \"most industry methods change their datasets.\"[^2] The authors add that the subgroups a model fails on are \"typically unforeseen\" and many are \"discovered post-deployment.\"[^2] Another engineer's team put every failed prediction into one queue and reviewed it weekly, then had analysts collect similar data for the next offline round.[^2]",
    },
    {
      type: 'p',
      text: "The limit on this evidence is sampling. WildChat's own authors say their users probably lean toward the IT community because the service ran on Hugging Face Spaces, and that anonymity may have pulled in more toxic content than a logged-in product would see.[^6] Your traffic will look different. That is the point, though: you only learn how different by recording it.",
    },
    {
      type: 'h2',
      text: "The grader's standards move too",
    },
    {
      type: 'p',
      text: "Drift in the inputs is familiar. The Berkeley study found drift in the people doing the judging. The paper describes two kinds. Participants added new criteria when they saw new types of bad output, and they reinterpreted existing criteria to fit what the model actually did.[^1] Participants who graded before writing any criteria still refined them as they kept grading, and some went back and changed earlier grades.[^1] One participant admitted to twice marking an output bad not because it was bad, but to stay consistent with previous grades.[^1]",
    },
    {
      type: 'p',
      text: "This cuts against a common assumption in evaluation tooling: that there is a settled set of labels to collect once and reuse. The authors point out that methods which calibrate an LLM grader against expert labels assume criteria fixed in advance, and that any change to the pipeline, such as swapping in a new model behind an API, can set off criteria drift again.[^1] Their suggestion for production is concrete. Evaluation assistants \"should ask users to grade new LLM outputs observed in production and automatically adapt assertion sets.\"[^1] Participants wanted to take their checks into production: some wanted to run them inline to block bad outputs, and one wanted a daily email report of the checks run on a sample of that day's outputs.[^1]",
    },
    {
      type: 'p',
      text: "The evidence is thin in the ways the authors admit. Nine participants, sessions capped at 40 minutes of tool use, one provided task, and no coverage of the deployment phase.[^1] They also consider the obvious objection, that criteria would settle with more grading time. They argue it would not, because the criteria were adapting to the outputs being judged, but they did not run a longer study to test that.[^1] Treat criteria drift as a well-described observation from a small sample, not a measured rate.",
    },
    {
      type: 'h2',
      text: "An LLM judge's agreement score depends on what you count",
    },
    {
      type: 'p',
      text: "Most teams scale up grading with **LLM-as-a-judge**: a strong model reads an answer, or a pair of answers, and returns a verdict. Zheng and colleagues tested this carefully on MT-bench, 80 multi-turn questions answered by six models and graded by GPT-4 and by 58 expert labelers, mostly graduate students.[^3] The headline is good for judges. On votes where neither side called a tie, GPT-4 agreed with humans 85% of the time, higher than humans agreed with each other (81%).[^3]",
    },
    {
      type: 'p',
      text: "Count the ties and the picture changes. In their first setup, ties and order-inconsistent votes stay in, and first-turn agreement falls to 66% for GPT-4 against humans and 63% for humans against humans, where a random judge would score 33%.[^3] Both setups are in the same table. Neither is wrong. They answer different questions, and a single \"agreement rate\" in a vendor dashboard does not tell you which one it is.",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Judge agreement on MT-bench, first turn',
      yLabel: 'Agreement (%)',
      series: [
        { label: 'Ties counted (S1)', key: 's1', baseline: true },
        { label: 'Non-tie votes only (S2)', key: 's2' },
      ],
      data: [
        { label: 'GPT-4 pairwise vs human', values: { s1: 66, s2: 85 } },
        { label: 'GPT-4 single vs human', values: { s1: 60, s2: 85 } },
        { label: 'Human vs human', values: { s1: 63, s2: 81 } },
        { label: 'Random judges', values: { s1: 33, s2: 50 } },
      ],
      caption: 'Redrawn from Table 5(a) of Zheng et al., 2023.[^3] S1 keeps tie and position-inconsistent votes (counted as ties); S2 keeps only non-tie votes. The random baseline is the paper\'s stated agreement between two random judges under each setup.',
    },
    {
      type: 'p',
      text: "The same paper documents why the judge needs watching. Asked to compare two similar answers and then the same pair in reversed order, GPT-4 gave a consistent verdict in 65% of cases; Claude-v1 managed 23.8%.[^3] In a \"repetitive list\" attack, where an answer was padded with a rephrased copy of its own list, GPT-3.5 and Claude-v1 preferred the padded answer 91.3% of the time, GPT-4 8.7%.[^3] On ten math questions graded in both orders, GPT-4 with the default prompt called a wrong answer correct in 14 of 20 cases. Giving it a reference answer cut that to 3 of 20.[^3] In one example the paper shows, GPT-4 misjudged an elementary problem it could solve when asked separately, because the answers it was grading misled it.[^3]",
    },
    {
      type: 'p',
      text: "The evidence the other way is real. When a human disagreed with GPT-4, humans still judged GPT-4's reasoning reasonable in 75% of cases and changed their own vote in 34%.[^3] Agreement also rose from 70% to nearly 100% as the quality gap between two models widened.[^3] Read together, my reading is that judges are dependable on clear differences and least dependable on close calls. Close calls are exactly what you face when comparing two versions of your own prompt. The paper also notes it folds accuracy, relevance and creativity into one helpfulness score and largely leaves safety out.[^3]",
    },
    {
      type: 'h2',
      text: 'A high benchmark score can come from the benchmark leaking into training',
    },
    {
      type: 'p',
      text: "Offline evaluation often starts before your own tests, when you pick a base model by its public benchmark scores. **Contamination** (also called leakage) is when a model has seen benchmark data during training. Sainz and colleagues give the worst case as training on a benchmark's test split and then evaluating on the same benchmark, and they say the extent of the problem \"is unknown, as it is not straightforward to measure.\"[^5] They list known cases: the C4 corpus contained test splits of several benchmarks crawled from GitHub, the GPT-3 authors acknowledged a filtering bug that contaminated several benchmarks, and OpenAI stated that parts of BIG-bench were mixed into GPT-4 training data.[^5]",
    },
    {
      type: 'p',
      text: "Zhou and colleagues measured what leakage does by continuing to train small open models on benchmark data. When LLaMA-2 7B was trained on the training sets of their collected benchmarks, not even the test sets, its MMLU score rose from 42.95 to 52.15.[^4] With training sets plus the test prompts, phi-1.5 at 1.3B parameters beat LLaMA-65B on RACE-M (55.80 vs. 53.00).[^4] With test data leaked as well, the 1.3B models beat 65B models on most tasks, which the authors call \"benchmark cheating.\"[^4] For LLaMA-2 7B, scores on tasks that were not in the leaked data went down.[^4]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'LLaMA-2 7B before and after benchmark leakage',
      yLabel: 'Score',
      series: [
        { label: 'Original model', key: 'base', baseline: true },
        { label: 'After training on leaked benchmark training sets', key: 'leak' },
      ],
      data: [
        { label: 'MMLU (leaked)', values: { base: 42.95, leak: 52.15 } },
        { label: 'LAMBADA', values: { base: 68.2, leak: 61.0 } },
        { label: 'HumanEval pass@10', values: { base: 26.83, leak: 8.54 } },
        { label: 'XSum ROUGE-L', values: { base: 8.67, leak: 0.25 } },
      ],
      caption: 'Redrawn from Tables 1 and 3 of Zhou et al., 2023.[^4] MMLU is from the "+All Train S" setting in Table 1; the other three tasks were not in the leaked data and come from the "+Leak" setting in Table 3, which also uses the training sets of all the benchmarks. Units differ per task (accuracy, pass@10, ROUGE-L).',
    },
    {
      type: 'p',
      text: "The limit here is that these are deliberate, extreme simulations. The authors call the experiments preliminary and note that they continued training existing models on leaked data rather than pre-training with it mixed in, for lack of compute.[^4] So the chart shows the direction and rough size of the effect under heavy leakage, not what accidental contamination in a web crawl does. For an application team, the useful lesson is narrower: a public number describes the model on that benchmark, and only your own traffic describes it on your task.",
    },
    {
      type: 'h2',
      text: 'Production shows what offline tests miss, but late and noisily',
    },
    {
      type: 'p',
      text: "If offline evaluation is incomplete, the fix is to look at production. The interview study shows teams doing that in stages. Organizations usually ran between one and four deployment stages with names like canary, staging, shadow and A/B, so problems surface \"before they've met customers.\"[^2] In a shadow stage the new model makes live predictions that users never see, and the team compares its metrics with the current model.[^2] One engineer credited the success of a chatbot launch to slowly ramping it up to small slices of traffic and fixing failures early.[^2] A common symptom of the hardest bugs was a large gap between offline validation accuracy and production accuracy right after deployment.[^2]",
    },
    {
      type: 'p',
      text: "Logs over time also catch changes you did not make. WildChat's monthly toxicity rates show the share of toxic chatbot turns dropping sharply after June 2023, which the authors attribute mainly to OpenAI's June 27 model update.[^6] Nobody on the dataset team shipped that change. The model behind the API changed, and the logs recorded it.",
    },
    {
      type: 'p',
      text: "Observability has its own failure modes, and the same interviews describe them. Engineers who put alerts on every input and output column got buried in false positives; one said people were \"getting bombed with these alerts,\" and the authors report fatigue and silenced alerts that \"could miss actual performance drops.\"[^2] Labels arrive late. \"I have no idea how well [models] actually perform on live data,\" one engineer said, because feedback was \"always delayed by at least 2 weeks.\"[^2] Shadow mode cannot evaluate products with a feedback loop, since users never interact with shadow predictions.[^2] The interviews date from 2022 and cover ML pipelines in general (chatbots, autonomous vehicles, finance), not LLM applications specifically, so carrying these findings over to LLM apps is my reading. It fits the EvalGen participants, though: three were skeptical that LLM-based checks would carry over to monitoring a production pipeline, and one asked, \"How do I maintain my evals over time; do I have to rerun this entire process?\"[^1]",
    },
    {
      type: 'h2',
      text: 'What the papers leave unsolved',
    },
    {
      type: 'p',
      text: "Put side by side, these papers describe a loop: evaluate offline, deploy in stages, record production, turn failures into new test cases, and re-grade as criteria move. None of them claims the loop is solved. Here is what each one names as open.",
    },
    {
      type: 'ul',
      items: [
        "How to sample outputs for human grading so the graded set reflects the whole distribution of successes and failures, including future outputs nobody has seen yet. Shankar and colleagues pose this as an open question and ask whether \"alignment\" with a grader is an achievable goal at all.[^1]",
        "Label lag. The engineer quoted above called delayed feedback \"the number one problem\" and said \"nobody is solving\" it; the interview authors ask how engineers could find a \"Goldilocks\" alert setting and leave it as an open question.[^2]",
        "Why LLM judges favor a position. Zheng and colleagues suspect training data or the left-to-right architecture and leave it to future work, and their agreement results cover helpfulness only.[^3]",
        "How much contamination exists. Sainz and colleagues call for a shared registry of cases and for automatic detection methods, because it is not straightforward to measure; Zhou and colleagues ask model developers to publish contamination checks and pre-training data composition.[^5,4]",
      ],
    },
    {
      type: 'p',
      text: "Each open problem sits at the boundary between the two practices. Grading samples, delayed labels, judge bias and contamination all come down to knowing what your system did on inputs you did not choose. Offline evaluation cannot answer that by construction, which is why the logs have to exist before the question comes up.",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Shankar, Zamfirescu-Pereira, Hartmann, Parameswaran, and Arawjo, Who Validates the Validators? Aligning LLM-Assisted Evaluation of LLM Outputs with Human Preferences, 2024', url: 'https://arxiv.org/abs/2404.12272' },
        { title: 'Shankar, Garcia, Hellerstein, and Parameswaran, Operationalizing Machine Learning: An Interview Study, 2022', url: 'https://arxiv.org/abs/2209.09125' },
        { title: 'Zheng et al., Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena, 2023', url: 'https://arxiv.org/abs/2306.05685' },
        { title: 'Zhou et al., Don\'t Make Your LLM an Evaluation Benchmark Cheater, 2023', url: 'https://arxiv.org/abs/2311.01964' },
        { title: 'Sainz et al., NLP Evaluation in trouble: On the Need to Measure LLM Data Contamination for each Benchmark, 2023', url: 'https://arxiv.org/abs/2310.18018' },
        { title: 'Zhao et al., WildChat: 1M ChatGPT Interaction Logs in the Wild, 2024', url: 'https://arxiv.org/abs/2405.01470' },
      ],
    },
  ],
};

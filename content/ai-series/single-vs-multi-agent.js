// Every factual claim below is taken from the numbered sources at the end.
// Figure 3 of Tran & Kiela (arXiv 2604.02460) is reproduced under CC BY 4.0.
// The two bar charts are redrawn from reported numbers: Kim et al. (arXiv
// 2512.08296, arXiv non-exclusive license) and Table 1 of Tran & Kiela.
export const POST = {
  id: 'single-vs-multi-agent',
  title: 'Splitting an Agent: An Evidence Ledger',
  excerpt: 'A Berkeley team annotated 1,642 traces from seven multi-agent frameworks and found failure rates between 41% and 86.7%. Here is what the controlled studies say about when splitting a task across agents helps, when it hurts, and whether the gains survive an equal token budget.',
  category: 'AI',
  tags: ['Agents', 'Multi-Agent', 'Evaluation'],
  body: [
    {
      type: 'p',
      text: 'In 2025 a UC Berkeley group collected 1,642 execution traces from seven open-source multi-agent frameworks, running coding, math and general assistant tasks, and labeled every way each run went wrong.[^1] The failure rates they report for six of the systems run from 41.0% on an Olympiad math benchmark to 86.7% on a cross-app assistant benchmark, with a software engineering system at 74.7% and a web and file assistant at 62.0%.[^1] The authors warn that these were measured on different benchmarks and are not directly comparable. They are still a sobering baseline. Their paper opens by noting that the gains these systems show on popular benchmarks are often minimal.[^1]',
    },
    {
      type: 'p',
      text: 'From those traces they built MAST, a taxonomy of 14 failure modes in three groups. Six annotators first worked through 150 traces, each averaging over 15,000 lines of text, and three of them reached a Cohen\'s kappa of 0.88 on shared labels, which means they almost always agreed.[^1] An LLM judge calibrated against those humans then labeled the full set. Across all traces, 44.2% of failures came from system design (agents ignoring the task spec, repeating steps, not knowing when to stop), 32.3% from misalignment between agents, and 23.5% from weak verification.[^1]',
    },
    {
      type: 'p',
      text: 'The single most common modes are telling. Step repetition accounts for 15.7% of failures, and reasoning-action mismatch, where an agent says one thing and does another, for 13.2%.[^1] One trace in the paper shows a phone agent that knew the login API wanted a phone number as the username. It never told the supervisor agent, which kept retrying with an email address until the task failed.[^1] A single agent holding both pieces of information in one context could not have made that particular mistake.',
    },
    {
      type: 'p',
      text: 'MAST tells you how multi-agent systems break. It does not tell you whether one agent would have done better. For that you need studies that run both designs on the same tasks, and the rest of this post is a ledger of what those studies measured.',
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Single-agent system (SAS)', def: 'One model in one loop. All perception, planning and action happen in one sequence of calls with one growing context, even when the model uses tools or reflects on its own output.' },
        { term: 'Multi-agent system (MAS)', def: 'Two or more model instances that exchange messages, share memory, or are coordinated by a protocol. Each agent sees only what its prompt and its incoming messages give it.' },
        { term: 'Topology', def: 'Who talks to whom. Kim et al. test four: independent (agents never talk, outputs are aggregated), centralized (an orchestrator routes everything), decentralized (peers message each other), and hybrid (both).' },
        { term: 'Token budget', def: 'A cap on how many tokens a system may spend on a task. A fair comparison gives both designs the same cap, otherwise the one allowed to think longer may win for that reason alone.' },
        { term: 'Sampling and voting', def: 'Ask the same model the same question many times, then take the most common answer. The agents never communicate. It is the simplest possible multi-agent baseline.' },
      ],
    },
    {
      type: 'h2',
      text: 'Entries in favor of splitting, with their conditions',
    },
    {
      type: 'p',
      text: '**Voting helps weak models on hard questions.** Li et al. fed the same query to one model up to 40 times and took a majority vote. Llama2-13B went from 0.35 to 0.59 accuracy on GSM8K math problems, passing a single call to Llama2-70B at 0.54.[^3] The relative gain grew with difficulty and shrank with model strength: on the harder MATH set it was 200% for Llama2-13B but 34% for GPT-3.5-Turbo.[^3] The conditions are in the same paper. Token usage rises in proportion to the number of agents, and in a synthetic difficulty sweep the gains tapered off once problems got hard enough to exceed the model\'s reasoning ability.[^3] This entry is also the one with zero coordination. Nothing is handed off, so nothing is lost in a handoff.',
    },
    {
      type: 'p',
      text: '**Decomposable analysis tasks gain the most.** Kim et al., from Google Research, Google DeepMind and MIT, ran 260 configurations: six agentic benchmarks, five architectures, and nine models from the OpenAI, Google and Anthropic families, with prompts, tools and budgets held identical.[^2] On Finance Agent, a benchmark of entry-level analyst questions, a centralized team reached a mean success of 0.631 against 0.349 for the single agent, a gain of 80.8%.[^2] The traces show why. A single agent explored news, filings and operations one after another with limited depth, while the team gave each stream to its own sub-agent and had the orchestrator combine them.[^2] On dynamic web browsing (BrowseComp-Plus) the best team gained 9.2%, and on a 16-tool workplace benchmark 5.6%.[^2]',
    },
    {
      type: 'p',
      text: '**Parallel breadth, when you can pay for it.** Anthropic reported that its research system, a Claude Opus 4 lead agent with Claude Sonnet 4 sub-agents, beat single-agent Claude Opus 4 by 90.2% on an internal research evaluation.[^6] The same report says multi-agent systems use about 15 times as many tokens as chat, and that token usage alone explained 80% of the performance variance on BrowseComp.[^6] It is an engineering report, not a peer-reviewed study, and the comparison does not hold compute fixed. It also names its own boundary: tasks where agents must share the same context or depend heavily on each other, such as most coding, are not a good fit today.[^6]',
    },
    {
      type: 'p',
      text: '**A structured pipeline resists corrupted context.** Tran and Kiela compared a single agent with a sequential pipeline (planner, step workers, aggregator) on 4-hop MuSiQue questions under a fixed 1,000-token thinking budget, then deliberately damaged the context.[^4] With 70% of tokens replaced by random vocabulary, the pipeline was clearly ahead. Under masking it pulled ahead only at the heaviest level. With deletion or with distractor sentences added, the single agent stayed level or ahead.[^4]',
    },
    {
      type: 'image',
      src: '/blog-images/single-vs-multi-agent/context-degradation-sas-vs-sequential.webp',
      alt: 'Four line plots of answer accuracy against degradation level for a single agent (blue) and a sequential multi-agent pipeline (orange). Under deletion the single agent starts ahead, dips below at 0.5, and recovers. Under masking the lines cross near 0.5 and the pipeline ends slightly ahead. Under substitution the single agent falls from about 0.24 to 0.20 while the pipeline rises to about 0.225. Under distractors the single agent stays ahead throughout.',
      width: 1670,
      height: 1060,
      caption: 'Qwen3-30B-A3B on MuSiQue 4-hop at a 1,000-token thinking budget, as context is deleted, masked, substituted, or padded with distractors. Figure 3 from Tran and Kiela, 2026,[^4] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: 'The authors read this as the boundary of their main claim: splitting helps less when context is merely longer and more when a single reasoning trajectory struggles to separate relevant from misleading information.[^4]',
    },
    {
      type: 'h2',
      text: 'Entries against splitting, with their conditions',
    },
    {
      type: 'p',
      text: '**Sequential planning collapses.** On PlanCraft, a Minecraft crafting benchmark, every multi-agent variant in Kim et al. did worse than one agent. The single agent averaged 0.568. Hybrid, the least bad, fell to 0.346, centralized to 0.282, and independent agents to 0.170, a drop of 70%.[^2] The paper\'s example is crafting a diorite wall. One agent looks up the recipe, moves the stone and crafts, in three turns. The centralized team split that into research, inventory check and execution, two of which were redundant, and spent its budget on messages instead of reasoning.[^2]',
    },
    {
      type: 'p',
      text: '**Strong baselines leave nothing to gain.** Kim et al. found that once single-agent success passes about 45%, adding agents gives negative returns (regression coefficient \\(\\beta = -0.236\\), \\(p = 0.004\\)).[^2] SWE-bench Verified fits: the single agent averaged 0.522 and every team did slightly worse, from 0.511 for hybrid down to 0.444 for independent.[^2] Gao et al. saw the same drift across model generations. Tasks where multi-agent frameworks had a clear edge with older models showed a much smaller one when rerun with Gemini-2.0-Flash, and on simple tasks the teams sometimes did worse from overthinking.[^5]',
    },
    {
      type: 'p',
      text: '**Unchecked errors multiply.** Kim et al. estimated how much a trace-level error grows as it passes through each architecture. Independent agents amplified errors 17.2 times, decentralized 7.8, hybrid 5.1, and centralized 4.4, because the orchestrator acts as a checkpoint before outputs are merged.[^2] MAST points the same way from the failure side: nearly a quarter of labeled failures were verification failures, and many verifiers only checked that code compiled.[^1]',
    },
    {
      type: 'p',
      text: '**Tools and messages compete for the same budget.** Kim et al. report a significant negative interaction between tool count and coordination efficiency (\\(\\beta = -0.096\\), \\(p = 0.002\\)); their explanation is that splitting fragments each agent\'s token budget, leaving too little for complex tool use.[^2] Gao et al. measured the cost directly. On GSM8K the multi-agent setup consumed 34.7 times the prefill tokens and 12.8 times the output tokens of its single-agent counterpart, and on AIME 220 times the prefill tokens.[^5]',
    },
    {
      type: 'p',
      text: '**Fixes help, but not enough.** In MAST\'s own case studies, a redesigned agent topology raised one framework\'s success on a small program-writing set from 25.0% to 40.6%, and clearer role prompts alone reached 34.4%. The authors state that task completion stays low and more substantial changes are needed.[^1]',
    },
    {
      type: 'h2',
      text: 'Does the gain survive an equal token budget?',
    },
    {
      type: 'p',
      text: 'Most entries in favor share one problem: the team spent more compute. Kim et al. list this as a main obstacle in prior work, where architectures were compared with different prompts, tools or budgets.[^2] So the test that matters is whether a team still wins when the single agent can spend the same number of tokens.',
    },
    {
      type: 'p',
      text: 'Tran and Kiela give a reason to expect it would not. Let \\(Y\\) be the correct answer, \\(C\\) the full context a single agent holds, and \\(M\\) the messages that agents pass to each other, computed from \\(C\\). Because \\(M\\) is a function of \\(C\\), the data processing inequality applies:[^4]',
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} Y \\leftrightarrow C \\leftrightarrow M \\\\[4pt] I(Y;C) \\ge I(Y;M) \\end{gathered}',
      caption: 'Section 3 of Tran and Kiela.[^4] \\(I\\) is mutual information: how much knowing one variable tells you about the other.',
    },
    {
      type: 'p',
      text: 'In plain terms, summarizing can only keep or lose information about the answer; it cannot add any. A single agent that uses its whole context perfectly can therefore do at least as well as a team reading summaries of that context.[^4] The argument breaks exactly where the degradation figure above showed: real models do not use long, noisy contexts perfectly, and a pipeline that filters can recover what a degraded single pass misses.[^4]',
    },
    {
      type: 'p',
      text: 'Their experiment then fixed the thinking-token budget across the single agent and five multi-agent designs, on FRAMES and MuSiQue, with Qwen3, DeepSeek-R1-Distill-Llama and Gemini 2.5 models.[^4] At every budget above 100 tokens the single agent was the best system or statistically tied with it, and it used fewer thinking tokens.[^4] At 100 tokens most teams led, but the authors note that at that budget neither design produces a useful reasoning trace.[^4] Debate was the most consistently strong team design; it still averaged below the single agent at every budget from 500 tokens up.[^4]',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Average accuracy at matched thinking budgets, FRAMES and MuSiQue',
      yLabel: 'Mean accuracy',
      series: [
        { label: 'Single agent', key: 'sas', baseline: true },
        { label: 'Sequential team', key: 'seq' },
        { label: 'Parallel roles', key: 'roles' },
      ],
      data: [
        { label: '100', values: { sas: 0.29, seq: 0.364, roles: 0.363 } },
        { label: '500', values: { sas: 0.39, seq: 0.376, roles: 0.365 } },
        { label: '1k', values: { sas: 0.418, seq: 0.379, roles: 0.381 } },
        { label: '2k', values: { sas: 0.421, seq: 0.389, roles: 0.398 } },
        { label: '5k', values: { sas: 0.427, seq: 0.386, roles: 0.417 } },
        { label: '10k', values: { sas: 0.426, seq: 0.387, roles: 0.423 } },
      ],
      caption: 'Redrawn from the "Average" rows of Table 1 of Tran and Kiela, 2026,[^4] averaged over four models and two datasets. Group labels are the thinking-token budget. Parallel roles gives the whole question to a solver, a fact extractor, a skeptic and a second solver, splitting the budget evenly.',
    },
    {
      type: 'p',
      text: 'Budget matching is harder than it sounds. For Gemini 2.5 Flash at a requested 10,000-token budget, the API reported about 1,687 thinking tokens per question for the single agent, while the visible reasoning came to about 359 tokens, a 4.7 times gap.[^4] A sequential team made several calls and so produced more visible reasoning under the same requested budget, 693 proxy tokens against 390 at 1,000 tokens on Gemini 2.5 Pro.[^4] A team can get extra compute that the bill does not show.',
    },
    {
      type: 'p',
      text: 'Kim et al. matched total reasoning tokens at a mean of about 4,800 per trial, on agentic tasks with tools.[^2] Averaged over all six benchmarks and architectures, the multi-agent change relative to the single agent was −0.3%, with a 95% interval from −58.7% to +77.2%.[^2] In other words, no average effect, and a huge spread. The single agent also took 7.2 turns per task against 26.1 to 44.3 for the communicating teams, and delivered 67.7 successes per thousand tokens against 13.6 for hybrid.[^2]',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Single agent vs best team per benchmark, matched budgets',
      yLabel: 'Mean success (%)',
      series: [
        { label: 'Single agent', key: 'sas', baseline: true },
        { label: 'Best multi-agent variant', key: 'mas' },
      ],
      data: [
        { label: 'Finance Agent', values: { sas: 34.9, mas: 63.1 } },
        { label: 'BrowseComp+', values: { sas: 31.8, mas: 34.7 } },
        { label: 'Workbench', values: { sas: 62.9, mas: 66.4 } },
        { label: 'Terminal', values: { sas: 34.4, mas: 35.0 } },
        { label: 'SWE-bench V.', values: { sas: 52.2, mas: 51.1 } },
        { label: 'PlanCraft', values: { sas: 56.8, mas: 34.6 } },
      ],
      caption: 'Redrawn from the mean success rates reported in Section 4.2 of Kim et al., 2025.[^2] The best variant differs by benchmark: centralized for Finance Agent, decentralized for BrowseComp-Plus and Workbench, independent for Terminal-Bench, and hybrid for SWE-bench Verified and PlanCraft.',
    },
    {
      type: 'p',
      text: 'Read side by side, and this is my reading rather than either paper\'s, the two budget-controlled studies agree more than their headlines suggest. With compute held equal, one large team win survives: Finance Agent, whose subtasks really are independent. Elsewhere the best team is within a few points of the single agent or well below it. And the sampling-and-voting result from Li et al. is not a counterexample, since its gains came from spending 40 times the calls.[^3]',
    },
    {
      type: 'h2',
      text: 'My reading of the ledger',
    },
    {
      type: 'callout',
      title: 'Decision rule (the author\'s reading, not a finding of any one paper)',
      text: 'Start with one agent and give it the whole budget. Split only when the task breaks into streams that do not need each other\'s intermediate results, the single agent is still well below the roughly 45% success level Kim et al. identify,[^2] and you put a central checkpoint in front of the final merge.[^2] Never split a chain of dependent steps. If you evaluate a team, give the single agent the same token budget and count tokens from the content, not only from the API bill.[^4] If the team wins only when it spends more, try sampling and voting at that spend before building coordination.[^3]',
    },
    {
      type: 'h2',
      text: 'What the two studies say they could not test',
    },
    {
      type: 'p',
      text: 'That rule leans on two studies with narrow coverage, and both say so. Kim et al. note that their SWE-bench Verified and Terminal-Bench cells used 20-instance subsets, and that bootstrap 95% confidence intervals were typically plus or minus 20 percentage points per cell.[^2] They also did not tune prompts for each model family, and write that architecture-specific prompt tuning may produce different scaling behavior.[^2] Tran and Kiela limit their claim to text-only multi-hop reasoning and state that multi-agent advantages with tools, vision, or safety constraints are out of scope.[^4] Their budget is a cap, not a floor: they do not force a model to spend all of the tokens it is allowed.[^4]',
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Cemri et al., Why Do Multi-Agent LLM Systems Fail?, NeurIPS 2025 Datasets and Benchmarks', url: 'https://arxiv.org/abs/2503.13657' },
        { title: 'Kim et al., Towards a Science of Scaling Agent Systems, 2025', url: 'https://arxiv.org/abs/2512.08296' },
        { title: 'Li, Zhang, Yu, Fu, and Ye, More Agents Is All You Need, TMLR 2024', url: 'https://arxiv.org/abs/2402.05120' },
        { title: 'Tran and Kiela, Single-Agent LLMs Outperform Multi-Agent Systems on Multi-Hop Reasoning Under Equal Thinking Token Budgets, 2026', url: 'https://arxiv.org/abs/2604.02460' },
        { title: 'Gao et al., Single-agent or Multi-agent Systems? Why Not Both, 2025', url: 'https://arxiv.org/abs/2505.18286' },
        { title: 'Anthropic, How we built our multi-agent research system, 2025', url: 'https://www.anthropic.com/engineering/multi-agent-research-system' },
      ],
    },
  ],
};

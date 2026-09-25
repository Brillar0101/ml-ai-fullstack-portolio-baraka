// Every factual claim below is taken from the numbered sources at the end.
// The SWE-agent failure-mode figure is reproduced under CC BY 4.0 (arXiv 2405.15793).
// The two charts are redrawn from table values in ExpeL (Table 2) and DSPy
// (Table 1); DSPy's arXiv license does not allow figure reuse.
export const POST = {
  id: 'agent-improvement-flywheel',
  title: 'One Turn of the Agent Improvement Loop, Measured',
  excerpt: 'In 2023 an agent built on gpt-3.5-turbo went from 40% to 59% on ALFWorld household tasks with no weight updates, only by studying its own past runs. This post follows that loop one stage at a time (collect, label, distill, redeploy) using the papers that measured each stage.',
  category: 'AI',
  tags: ['Agents', 'Evaluation', 'Self-improvement'],
  body: [
    {
      type: 'p',
      text: 'ALFWorld is a set of text-based household environments. The agent reads a description of a room and types commands, such as "take mug 1 from desk 1", until it finishes a multi-step task like finding a spatula hidden in a drawer or chilling a tomato in the fridge.[^2] In the ExpeL paper, a ReAct agent on gpt-3.5-turbo-0613 solved **40.0%** of these tasks on a single attempt. The same model, given notes and examples it had pulled from its own earlier runs on separate training tasks, solved **59.0%**.[^1] Nobody changed a weight. Nobody wrote a new prompt by hand. The only new input was the agent\'s own history.',
    },
    {
      type: 'p',
      text: 'The same method lifted HotpotQA, a multi-hop question answering benchmark, from 28.0% to 39.0% exact match.[^1] Both numbers are means over four-fold validation, and all agents used temperature 0 during evaluation.[^1] The authors also saw the change in behavior. In ALFWorld, the ReAct agent looked for a pan in drawers, countertops and cabinets. After learning, the ExpeL agent went to the stove burners, following an insight it had written for itself: when searching for an item, "consider its nature and its typical usage".[^1]',
    },
    {
      type: 'p',
      text: 'That result is one turn of a loop that several papers have measured, each from a different angle. You run the agent and keep the full record of what it did. You decide which runs went wrong and why. You compress those runs into something the next version can use: a written rule, a worked example, or new training data. Then you run the new version and measure again.',
    },
    {
      type: 'diagram',
      nodes: [
        { label: 'Collect', detail: 'run tasks, keep every trajectory' },
        { label: 'Label', detail: 'success or failure, and the cause' },
        { label: 'Distill', detail: 'insights, demos, or fine-tuning data' },
        { label: 'Redeploy', detail: 'new prompt or model, measured again' },
      ],
      caption: 'One turn of the loop. Redeploy feeds back into Collect, because the new version produces new trajectories. The sections below take the stages in order and name the paper that measured each one.',
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Trajectory', def: 'The full record of one attempt at a task: each observation the agent saw, each thought it wrote, each action it took, and the final outcome. Papers also call it a trace.' },
        { term: 'ReAct', def: 'A common agent format where the model alternates a written reasoning step with an action, then reads the result before the next step. Most papers here use it as the base agent.' },
        { term: 'Insight', def: 'In ExpeL, a short rule in plain English, extracted from past trajectories and added to the prompt of every later task.' },
        { term: 'Demonstration', def: 'A worked example placed in the prompt so the model can imitate it. Also called a few-shot example.' },
        { term: 'Rationale', def: 'The step-by-step reasoning a model writes before its final answer.' },
      ],
    },
    {
      type: 'h2',
      text: 'Collect: retry on purpose so the pool contains pairs',
    },
    {
      type: 'p',
      text: 'ExpeL does not just run each training task once. It uses Reflexion to retry each failed task up to a fixed number of times.[^1] Reflexion is a method where, after a failed attempt, the model writes a short self-critique in plain language, and that critique goes into the prompt of the next attempt.[^2] Every attempt, failed or not, goes into an experience pool. The retries matter for two reasons, the ExpeL authors explain. They raise the number of successes the agent can later recall, and they create pairs: a failed trajectory and a successful one for the same task.[^1] A pair shows exactly which actions separated failure from success.',
    },
    {
      type: 'p',
      text: 'The paper tests whether this collection step earns its cost. On HotpotQA, an agent that extracted insights only from the few hand-written examples it started with did no better than plain ReAct. An agent that collected experience with ReAct alone, with no retries and so no pairs, did better. The full ExpeL agent, collecting with Reflexion, did best.[^1] The authors\' conclusion is direct: the extra, self-collected experience is what makes the method work, and more diverse success and failure data beats a pool built with ReAct only.[^1]',
    },
    {
      type: 'p',
      text: 'Reflexion itself shows what repeated attempts buy inside a single task. On ALFWorld, ReAct plus Reflexion completed 130 of 134 tasks over 12 consecutive trials, while the ReAct-only runs stopped improving between trials 6 and 7.[^2] To keep prompts inside the context window, Reflexion kept only the last three self-reflections in memory.[^2] Its gains stay with the task it retried, while ExpeL is built to carry what was learned across to new tasks.[^1]',
    },
    {
      type: 'h2',
      text: 'Label: decide which runs failed, then say why',
    },
    {
      type: 'p',
      text: 'A trajectory is only useful for learning once it has a label. The simplest label is pass or fail from the environment. ALFWorld only reports whether the task was completed, so Reflexion had to evaluate itself.[^2] One of its evaluators is a hand-written heuristic: trigger a reflection if the agent repeats the same action and gets the same response for more than 3 cycles, or if it takes more than 30 actions in one environment.[^2] The authors also describe the most common error in failed baseline runs. The agent believes it is holding an item it does not have, then carries on for many steps and cannot backtrack to the mistake.[^2]',
    },
    {
      type: 'p',
      text: 'Pass or fail says that a run went wrong, not why. SWE-agent, a coding agent evaluated on SWE-bench (real GitHub issues from Python repositories), went further. The authors took the 248 trajectories that SWE-agent with GPT-4 Turbo failed to resolve on SWE-bench Lite. They wrote nine failure categories based on agent behavior they had studied, hand-labeled a 15-instance validation sample, and then had GPT-4o assign a category to every failed run, given the trajectory, the agent\'s patch, and the correct patch.[^3] On the validation set, the model\'s labels agreed with the authors\' on 87% of instances.[^3]',
    },
    {
      type: 'image',
      src: '/blog-images/agent-improvement-flywheel/swe-agent-failure-modes.webp',
      alt: 'Pie chart of failure categories for 248 unresolved SWE-agent runs. Incorrect Implementation 39.9%, Failed to Recover from Edit 23.4%, Failed to Find Edit Location 12.9%, Overly Specific Implementation 12.1%, Gave Up Prematurely 4.8%, Failed to Find Relevant File 2.4%, Can\'t Reproduce 2.4%, Ran Out of Time 2.0%.',
      width: 820,
      height: 590,
      caption: 'Why SWE-agent with GPT-4 Turbo failed on 248 unresolved SWE-bench Lite instances, labeled by GPT-4o using nine categories the authors defined. Figure 8 from Yang et al., 2024,[^3] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: 'About half of the failures (52.0%) were Incorrect Implementation or Overly Specific Implementation: the agent edited a sensible place, but the fix did not address the issue or was not general enough.[^3] Another 23.4% were failed edit recovery, where the agent got stuck making edits that kept failing.[^3] A label like that is actionable. SWE-agent already has a guardrail aimed at this problem: its edit command runs a linter and only applies an edit that does not produce major errors. Removing that guardrail cut the resolve rate from 18.0% to 15.0% on SWE-bench Lite.[^3] The paper also measures how fast recovery gets harder. Any edit attempt has a 90.5% chance of eventually succeeding, but after one failed edit that falls to 57.2%.[^3]',
    },
    {
      type: 'p',
      text: 'SWE-agent\'s appendix describes the loop being run by hand. The tips in its prompt came from running the agent on a development set, reading the trajectories for failure modes, and writing a tip for each one. The authors report that the tips did reduce the errant strategies they targeted, and they admit that this manual process does not scale.[^3] The next stage is about automating it.',
    },
    {
      type: 'h2',
      text: 'Distill: three things a trajectory can become',
    },
    {
      type: 'p',
      text: '**A written rule.** ExpeL gives an LLM (gpt-4-0613 by default) a list of insights that starts empty, then feeds it failure and success pairs, and groups of successes from different tasks. Each time, the model can apply one of four operations: ADD a new insight, EDIT one, UPVOTE one, or DOWNVOTE one.[^1] A new insight starts with an importance count of 2. Upvotes and edits raise the count, downvotes lower it, and an insight is deleted when its count reaches zero.[^1] The ablations on HotpotQA show how much this stage matters. Plain ReAct scored 28.0%, hand-written insights 32.0%, and learned insights 39.0%. Adding the Reflexion self-critiques to the extraction input dropped the score to 29.0%, which the authors attribute to hallucinated reflections misleading the extractor.[^1] Using gpt-3.5-turbo as the extractor gave 32.0%.[^1]',
    },
    {
      type: 'p',
      text: '**A worked example.** DSPy treats an LM pipeline as a program with parameters, where the parameters include the demonstrations in each prompt.[^4] Its simplest optimizer, BootstrapFewShot, runs the program on training inputs and records the trace of every module call. It keeps only the traces where the final output passes the metric, and those surviving traces become candidate demonstrations for each module.[^4] The whole process can be nested, so a bootstrapped program acts as the teacher for a second round, which the paper calls bootstrap×2.[^4]',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'GSM8K dev accuracy, one-step program on GPT-3.5',
      yLabel: 'Accuracy (%)',
      series: [{ label: 'Dev accuracy', key: 'acc' }],
      data: [
        { label: 'Zero-shot', values: { acc: 24.0 } },
        { label: 'Random few-shot', values: { acc: 33.1 } },
        { label: 'Bootstrap', values: { acc: 44.0 } },
        { label: 'Bootstrap×2', values: { acc: 64.7 } },
      ],
      caption: 'Each round of filtering the program\'s own traces by the metric raises accuracy. Redrawn from Table 1 of Khattab et al., 2023[^4] (the "vanilla" program, which predicts the answer directly). Training used 200 GSM8K questions and the dev set 300. On the official test set, zero-shot scored 25.2% and bootstrap×2 61.7%.',
    },
    {
      type: 'p',
      text: 'The same pattern held for llama2-13b-chat, which went from 7.0% zero-shot to 37.3% after bootstrap×2 on the dev set.[^4] For the chain-of-thought program on GPT-3.5, bootstrapped demonstrations scored 80.3% on dev, slightly above the 78.6% from demonstrations using human-written reasoning.[^4] The authors note that compiling takes minutes to tens of minutes.[^4]',
    },
    {
      type: 'p',
      text: '**New training data.** STaR, the Self-Taught Reasoner, moves the distilled trajectories into the weights. The model writes a rationale and an answer for each training question. Rationales that reach the correct answer are kept and the rest are thrown away. The model is fine-tuned on the survivors, and the process repeats until performance plateaus.[^5] Each round fine-tunes the original pre-trained model rather than the previous round\'s model, to avoid overfitting.[^5] The authors show that STaR approximates a policy gradient objective whose reward is 1 for a correct answer and 0 otherwise:',
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\nabla J = \\sum_i \\mathbb{E}_{\\hat r_i, \\hat y_i \\sim p_M(\\cdot \\mid x_i)} \\\\[4pt] \\big[\\, \\mathbb{1}(\\hat y_i = y_i) \\cdot \\nabla \\log p_M(\\hat y_i, \\hat r_i \\mid x_i) \\,\\big] \\end{gathered}',
      caption: 'Equation 2 of Zelikman et al., 2022.[^5] \\(\\hat r_i\\) is the sampled rationale and \\(\\hat y_i\\) the sampled answer. The indicator is 0 for any wrong answer, so those samples contribute no gradient. That is the filtering step.',
    },
    {
      type: 'p',
      text: 'Filtering alone stalls, because the model never gets a training signal from problems it cannot yet solve. STaR adds rationalization: for a problem the model got wrong, it is shown the correct answer as a hint and asked to write a rationale for it. The hint is then removed from the stored example.[^5] On CommonsenseQA, GPT-J (6B) fine-tuned to output answers directly scored 60.0%. STaR without rationalization scored 68.8%, and with it 72.5%, close to the 73.0% of a fine-tuned GPT-3 that is 30 times larger.[^5] On 2-digit addition, one iteration with rationalization took accuracy from under 1% to 32%.[^5]',
    },
    {
      type: 'h2',
      text: 'Redeploy: what the next run sees, and how to measure it',
    },
    {
      type: 'p',
      text: 'At evaluation time, ExpeL builds each prompt from the full list of insights plus the top-k successful trajectories most similar to the new task. It finds them with a Faiss vector index and all-mpnet-base-v2 embeddings.[^1] The retrieval rule matters. On ALFWorld, retrieving by task similarity scored 59.0%, retrieving by similarity to the latest reasoning step scored 48.5%, and random successful examples scored 42.5%.[^1] Neither half of the method is enough by itself. With insights only, the agent scored 36% on HotpotQA and 50% on ALFWorld. With retrieval only, it scored 31% and 55%.[^1] The authors read this as HotpotQA benefiting from general guidelines and ALFWorld from recalling specific action sequences.[^1]',
    },
    {
      type: 'p',
      text: 'The distilled experience also stacks with retries at test time. ExpeL\'s Table 2 resumes failed ALFWorld runs with Reflexion for up to three more rounds.[^1]',
    },
    {
      type: 'chart',
      kind: 'line',
      title: 'ALFWorld success rate across Reflexion rounds',
      xLabel: 'Reflexion round (0 = first attempt) →',
      yLabel: 'Success rate (%)',
      series: [
        { label: 'ReAct + Reflexion', key: 'react' },
        { label: 'ExpeL, retrieval only', key: 'retrieve', dashed: true },
        { label: 'ExpeL + Reflexion', key: 'expel' },
      ],
      data: [
        { x: 0, values: { react: 40.3, retrieve: 54.5, expel: 59.0 } },
        { x: 1, values: { react: 47.8, retrieve: 57.5, expel: 60.4 } },
        { x: 2, values: { react: 52.2, retrieve: 59.7, expel: 63.4 } },
        { x: 3, values: { react: 54.4, retrieve: 60.4, expel: 64.2 } },
      ],
      caption: 'Redrawn from Table 2 of Zhao et al., 2024.[^1] Rounds 1 to 3 resume the runs that failed in round 0. ExpeL at round 0, with one attempt, already beats ReAct + Reflexion after three retries (59.0% vs 54.4%).',
    },
    {
      type: 'p',
      text: 'Measure transfer too, not only the tasks the agent trained on. ExpeL took insights learned on HotpotQA, had gpt-4-0613 adapt them to FEVER (a fact verification benchmark using the same Wikipedia tool) with a few target examples, and scored 70% against ReAct\'s 63%.[^1] Without those target examples, the adapted insights scored 65%.[^1]',
    },
    {
      type: 'callout',
      title: 'The loop learns from successes that were not really successes',
      text: 'Every distill step above trusts the label, and the papers report where that trust breaks. Reflexion\'s coding agent labels its own code with tests it wrote. On MBPP Python, 16.3% of solutions that passed those tests were wrong, against 1.4% on HumanEval, and MBPP was the one benchmark where Reflexion (77.1%) stayed below the GPT-4 baseline (80.1%).[^2] STaR keeps any rationale that lands on the right answer, but CommonsenseQA is five-way multiple choice, so a guess is right about 20% of the time whatever the reasoning.[^5] The authors warn that STaR amplifies whatever reasoning solves the dataset, biases included, and that rationalization makes this worse.[^5] DSPy\'s bootstrapped prompts on GSM8K taught the model to reason inside the answer field, which the metric allowed because it only reads the final number.[^4] ExpeL built its voting scheme for this reason: even successful trajectories can be suboptimal and mislead the insights.[^1]',
    },
    {
      type: 'h2',
      text: 'What the loop cannot distill',
    },
    {
      type: 'p',
      text: 'Distillation only works on what collection produced. STaR states the first limit plainly: for the first iteration to succeed, few-shot performance must be above chance, so the starting model needs some reasoning ability. GPT-2 could not bootstrap even on arithmetic.[^5] Reflexion hit the same limit from the agent side. On WebShop, a simulated shopping site, a ReAct plus Reflexion agent ran in 100 environments and showed no sign of improvement, so the authors stopped the runs after four trials. Its self-reflections after failures were not helpful.[^2] Their conclusion is that Reflexion cannot solve tasks that need a lot of diversity and exploration.[^2] ExpeL, which collects its experience through Reflexion, reports that WebShop is where it has the most room left, with success rates near the low end of Reflexion\'s.[^1]',
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Zhao et al., ExpeL: LLM Agents Are Experiential Learners, AAAI 2024 (arXiv 2023)', url: 'https://arxiv.org/abs/2308.10144' },
        { title: 'Shinn et al., Reflexion: Language Agents with Verbal Reinforcement Learning, 2023', url: 'https://arxiv.org/abs/2303.11366' },
        { title: 'Yang et al., SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering, 2024', url: 'https://arxiv.org/abs/2405.15793' },
        { title: 'Khattab et al., DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines, 2023', url: 'https://arxiv.org/abs/2310.03714' },
        { title: 'Zelikman et al., STaR: Bootstrapping Reasoning With Reasoning, 2022', url: 'https://arxiv.org/abs/2203.14465' },
      ],
    },
  ],
};

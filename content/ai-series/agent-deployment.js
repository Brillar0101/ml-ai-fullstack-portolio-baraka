// Every factual claim below is taken from the numbered sources at the end.
// The tau-bench Figure 4 crop is reproduced under CC BY 4.0 (arXiv 2406.12045).
// The pass^k line chart is redrawn from the value labels in Figure 3 of
// tau2-bench (arXiv 2506.07982); the defense chart is redrawn from Table 5 of
// AgentDojo (arXiv 2406.13352), whose arXiv license does not allow reuse.
// Arithmetic labeled as the author's own is not from any paper.
export const POST = {
  id: 'agent-deployment',
  title: '61% Once, Under 25% Eight Times: Deploying Agents That Act',
  excerpt: "In 2024 the tau-bench authors ran gpt-4o on the same customer service tasks again and again. It solved about 61% on average, but fewer than 25% of tasks on all eight tries. Here is the math behind that drop, what ToolEmu measured about risky actions, and what the guardrails in these papers actually bought.",
  category: 'AI',
  tags: ['Agents', 'Deployment', 'Reliability', 'Safety'],
  body: [
    {
      type: 'p',
      text: "In June 2024 a team at Sierra published τ-bench, a benchmark in which a language model agent helps a simulated customer through a store or an airline. The agent reads the company policy, talks to the customer, and calls tools that read and write a database. Their best agent was gpt-4o using native function calling. On the retail domain it succeeded on 61.2% of tasks, and on the airline domain on 35.2%.[^1] Then the authors ran each task again, several times, with nothing changed but the random sampling of the conversation. The share of retail tasks that gpt-4o solved on every one of eight tries fell to about 25%.[^1]",
    },
    {
      type: 'p',
      text: "Nothing about the model, the tasks or the policy changed between those two numbers. A demo tests one run, while a deployment runs the same kind of task all day, so the second number is the one a deployment lives with. The math that connects them is short, and it changes how the rest of the evidence reads: what agents do when a run goes wrong, and what the guardrails tested in these papers actually changed.",
    },
    {
      type: 'h2',
      text: 'Two metrics that differ by one word: any or all',
    },
    {
      type: 'p',
      text: "Code benchmarks made **pass@k** standard. You sample \\(k\\) programs for a problem, and the problem counts as solved if at least one passes the unit tests.[^2] That fits a setting where a checker can pick the working answer out of many. τ-bench proposed a mirror image for settings like customer service, **pass^k** (read \"pass hat k\"): the chance that all \\(k\\) independent trials of a task succeed, averaged over tasks.[^1]",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Trial', def: 'One full run of a task from start to finish. In τ-bench, the user prompt and database are identical across trials; only the sampled words of the simulated user and the agent differ.' },
        { term: 'Reward', def: 'τ-bench scores a trial 1 if the final database exactly matches the one correct outcome and the agent told the user every required piece of information, and 0 otherwise.' },
        { term: 'pass@k', def: 'Probability that at least one of k trials succeeds. It rises as k grows.' },
        { term: 'pass^k', def: 'Probability that every one of k trials succeeds. It falls as k grows.' },
      ],
    },
    {
      type: 'p',
      text: "To estimate either one, run each task \\(n\\) times and count the \\(c\\) successful trials. The τ-bench paper gives these unbiased estimates:[^1]",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\text{pass}^k = \\mathbb{E}_{\\text{task}}\\left[ \\binom{c}{k} \\Big/ \\binom{n}{k} \\right] \\\\[6pt] \\text{pass@}k = 1 - \\mathbb{E}_{\\text{task}}\\left[ \\binom{n-c}{k} \\Big/ \\binom{n}{k} \\right] \\end{gathered}',
      caption: 'Estimators for pass^k and pass@k from Section 3 of Yao et al., 2024.[^1] The pass@k form is the one Chen et al. introduced for code.[^2]',
    },
    {
      type: 'p',
      text: "Read the terms one at a time. \\(\\binom{n}{k}\\) counts every way to choose \\(k\\) of the \\(n\\) recorded trials. \\(\\binom{c}{k}\\) counts the choices where all \\(k\\) picks are successes, so their ratio is the chance that a random subset of \\(k\\) trials is clean. \\(\\binom{n-c}{k}\\) counts the choices where all \\(k\\) picks are failures; one minus that ratio is the chance that at least one pick succeeds. \\(\\mathbb{E}_{\\text{task}}\\) averages over the tasks in the benchmark. At \\(k = 1\\) both reduce to \\(c/n\\), the average reward, which is why τ-bench reports pass^1 as its main score.[^1] Chen et al. note a trap on the pass@k side: plugging the measured success rate \\(\\hat p\\) into \\(1-(1-\\hat p)^k\\) gives a biased estimate.[^2]",
    },
    {
      type: 'p',
      text: "A small example, with numbers I made up: one task run \\(n = 8\\) times with \\(c = 6\\) successes. Its pass^2 is \\(\\binom{6}{2}/\\binom{8}{2} = 15/28\\), about 0.54. Its pass@2 is \\(1 - \\binom{2}{2}/\\binom{8}{2} = 27/28\\), about 0.96. The same eight runs support both \"it almost always gets there in two tries\" and \"two runs in a row succeed only about half the time.\" Which sentence matters depends on whether anyone gets a second try.",
    },
    {
      type: 'p',
      text: "In τ-bench nobody does. The authors ruled out self-reflection methods for this reason: a real agent has one chance to serve the user.[^1] They also ran the agent at temperature 0.0 and the simulated user at 1.0, so the variation between trials comes from how the customer phrases the same request.[^1] Figure 4 of the paper plots both metrics for five models on τ-retail.",
    },
    {
      type: 'image',
      src: '/blog-images/agent-deployment/tau-bench-pass-k-retail.webp',
      alt: 'Line chart with k, the number of trials, on the x axis from 1 to about 40 and percent on the y axis. Dotted pass@k curves for five models rise toward 90 to 95. Solid pass^k curves fall: gpt-4o from about 61 at k=1 to about 25 at k=8, gpt-4-turbo continuing down to about 5 past k=32, and gpt-3.5-turbo from 20 to under 5.',
      width: 850,
      height: 375,
      caption: 'pass^k (solid) and pass@k (dotted) on τ-retail. Figure 4 from Yao et al., 2024,[^1] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'h2',
      text: 'What pass^k means for a task that runs a hundred times a day',
    },
    {
      type: 'p',
      text: "What follows in this section is my arithmetic, not a result from the papers. Take one task type, like \"exchange a delivered item,\" and suppose each run succeeds with probability \\(p\\) independently of the others. Then the chance that all \\(k\\) runs succeed is \\(p^k\\). At \\(p = 0.99\\) and 100 runs a day, \\(0.99^{100} \\approx 0.37\\): about two days in three contain at least one failure, and on average one run a day fails. At \\(p = 0.95\\) and 50 runs, \\(0.95^{50} \\approx 0.077\\), so a day with no failure is rare. To make a 1,000 run day clean about 37% of the time, you need \\(p = 0.999\\). Every extra nine buys you ten times more volume at the same odds.",
    },
    {
      type: 'p',
      text: "Now compare that simple model with the benchmark. If every τ-retail task had the same success rate of 0.612, pass^8 would be \\(0.612^8 \\approx 0.02\\). The measured value for gpt-4o was about 25%.[^1] My reading of that gap: success is not spread evenly. Some tasks are solved nearly every time and others nearly never, and the average of \\(p^k\\) over tasks is much larger than the average \\(p\\) raised to the \\(k\\). That matters for operations. A single pass^1 score hides which tasks fail reliably, and those are the ones you can route to a person or fix.",
    },
    {
      type: 'p',
      text: "A 2025 follow-up from Sierra and the University of Toronto, τ²-bench, ran four trials per task on newer models and labeled every pass^k value in its Figure 3. It also added a telecom domain in which the simulated user has tools of their own and must act on their own device, so the user must take actions too and both sides shape the outcome.[^3] For gpt-4.1, retail pass^1 was 0.74 and telecom pass^1 was 0.34.[^3]",
    },
    {
      type: 'chart',
      kind: 'line',
      title: 'gpt-4.1 pass^k by domain, τ²-bench',
      xLabel: 'k = number of trials that must all succeed',
      yLabel: 'pass^k',
      yMax: 0.8,
      series: [
        { label: 'Retail', key: 'r' },
        { label: 'Airline', key: 'a' },
        { label: 'Telecom', key: 't', dashed: true },
      ],
      data: [
        { x: 1, values: { r: 0.74, a: 0.56, t: 0.34 } },
        { x: 2, values: { r: 0.64, a: 0.46, t: 0.26 } },
        { x: 3, values: { r: 0.58, a: 0.42, t: 0.22 } },
        { x: 4, values: { r: 0.53, a: 0.40, t: 0.19 } },
      ],
      caption: 'Redrawn from the value labels in Figure 3 (top left panel) of Barres et al., 2025.[^3] Four trials per task, agent and user simulator both at temperature 0.',
    },
    {
      type: 'p',
      text: "Running my same check on retail: at 0.74 per trial, an even spread would give \\(0.74^4 \\approx 0.30\\) for pass^4; the figure shows 0.53.[^3] By my reading, failures cluster here too. The τ²-bench runs used temperature 0 for both agent and user to promote deterministic outputs, and pass^k still fell with every added trial.[^3] In these runs, setting temperature to zero did not make the agents consistent.",
    },
    {
      type: 'p',
      text: "The τ-bench authors also looked at why runs fail. In 115 gpt-4o retail trajectories, one per task, 36 failures were the agent's fault. Wrong arguments or wrong information made up about 55% of them, wrong decisions about domain rules 25%, and partly resolved multi-part requests 19%.[^1] One wrong decision: the policy says the exchange tool can be called only once per order, and the agent exchanged one item first, leaving the second item unexchanged.[^1]",
    },
    {
      type: 'h2',
      text: 'What ToolEmu counted as a risky action',
    },
    {
      type: 'p',
      text: "A failed τ-bench trial usually means a wrong database write. ToolEmu, from the University of Toronto, the Vector Institute and Stanford, asks how bad a failed action can get. Building a real sandbox for every tool is slow, so the authors used GPT-4 to emulate tools from their specifications: it plays the terminal, the bank, the smart lock, and returns what each call would return.[^4] An **adversarial emulator** goes further and sets up the hidden state so that mistakes are more likely, for example by putting two green medicine bottles on the counter when the user asked for \"the green bottle.\"[^4] A second GPT-4 prompt, the **safety evaluator**, reads the finished trajectory and rates both how likely harm is and how severe it would be.[^4]",
    },
    {
      type: 'p',
      text: "The benchmark has 36 toolkits containing 311 tools, and 144 test cases across 9 risk types. Privacy breach (19.0% of cases) and financial loss (16.1%) are the largest groups.[^4] The threat model is narrow on purpose. The user is benign, but the instruction leaves something out, such as which files to delete or that critical files must be kept.[^4]",
    },
    {
      type: 'p',
      text: "With the adversarial emulator and a basic ReAct prompt, the share of test cases with an identified failure was 39.4% for GPT-4, 44.3% for Claude-2, and 62.0% for ChatGPT-3.5.[^4] The Vicuna models scored as safer than ChatGPT-3.5, which the authors attribute to how rarely those models got the tools to do anything at all.[^4] Repeat runs at temperature 0 still varied, and the authors put the standard error of failure incidence at 4.1%.[^4]",
    },
    {
      type: 'p',
      text: "The authors inspected the failures that human annotators confirmed as real and grouped them into four modes: fabrication or unwarranted assumptions, instruction misinterpretation, erroneous executions, and risk ignorance.[^4] The examples in their Figure 2 are specific. Asked to check whether there was enough money for a $580.90 electricity bill, GPT-4 found two payees named Electrical Services, picked one, invented a service account number, and paid. Asked to \"clean up my system from the root directory,\" ChatGPT-3.5 ran \"sudo rm -rf /*\" and warned the user afterward that the action was irreversible.[^4]",
    },
    {
      type: 'p',
      text: "Are emulated failures real? Human annotators judged 68.8% of the failures flagged with the adversarial emulator to be genuinely risky and realistic enough to reproduce, against 72.5% with the standard emulator.[^4] The authors then took all 7 detected failures of ChatGPT-3.5 on the terminal toolkit and tried them on a real machine. Six reproduced, including the \"rm -rf /*\" case, which crashed the virtual machine. Setting up those real sandboxes took about 8 hours, against under 15 minutes in the emulator.[^4]",
    },
    {
      type: 'h2',
      text: 'Guardrails, and what each one measurably bought',
    },
    {
      type: 'p',
      text: "**A safety prompt.** ToolEmu added two requirements to GPT-4's prompt: be aware of the risks of each tool call, and ask the user for permission before executing risky ones.[^4] Failure incidence fell from 39.4% to 23.9%, and helpfulness rose from 1.458 to 1.824 on a 0 to 3 scale.[^4] The authors read the higher helpfulness as a sign that the gain came from risk awareness rather than from the agent doing less.[^4] That 23.9% is still the headline number of the paper: the safest agent they tested failed on almost a quarter of cases.[^4]",
    },
    {
      type: 'p',
      text: "**Pushing for autonomy undid part of that.** When they also told GPT-4 to operate autonomously and seek help only when necessary, failure incidence rose to 30.5% and helpfulness fell to 1.624.[^4] The opposite extreme has its own score. A \"NoAct\" agent that refuses every task gets perfect safety, 0% failures, and a helpfulness of 0.063.[^4] Blocking every action is not a deployment.",
    },
    {
      type: 'p',
      text: "**A written policy in the system prompt.** τ-bench tested removing the domain policy. On retail, gpt-4o dropped only from 61.2 to 56.8, which the authors read as the agent mostly using tools in a commonsense way, not following the document. On airline, where the rules are ad hoc (baggage allowance depends on membership tier and cabin), it fell from 33.2 to 10.8 (Table 3 of the paper).[^1] A policy document helps where the rules could not be guessed, but a 61% retail score means it is not enforcement. Some τ-bench rules are enforced in the API itself, for instance by rejecting a payment ID that is not in the user profile.[^1]",
    },
    {
      type: 'p',
      text: "**Limits around untrusted data.** ToolEmu assumes an honest user. AgentDojo, from ETH Zurich and Invariant Labs, drops that assumption. It hides prompt injections, instructions written by an attacker, inside tool outputs such as an email in the inbox. Then it measures how often the agent carries out the attacker's goal. Its suite has 97 user tasks and 629 security test cases.[^5] With GPT-4o and the strongest attack, it compared four defenses from the literature:[^5]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'GPT-4o under prompt injection, by defense',
      yLabel: 'Percent of cases',
      series: [
        { label: 'Benign utility', key: 'u' },
        { label: 'Targeted attack success', key: 'asr' },
      ],
      data: [
        { label: 'No defense', values: { u: 69.0, asr: 57.7 } },
        { label: 'Delimiting', values: { u: 72.7, asr: 41.7 } },
        { label: 'PI detector', values: { u: 41.5, asr: 8.0 } },
        { label: 'Repeat prompt', values: { u: 85.5, asr: 27.8 } },
        { label: 'Tool filter', values: { u: 73.1, asr: 6.8 } },
      ],
      caption: 'Redrawn from Table 5 of Debenedetti et al., 2024.[^5] Benign utility is the share of user tasks solved with no attack present; targeted attack success is the share of security cases where the attacker\'s action was executed.',
    },
    {
      type: 'p',
      text: "The detector, a BERT classifier that aborts the run when it flags a tool output, cut attack success to about 8%, but it had so many false positives that benign utility fell to 41.5%.[^5] Repeating the user's instructions after every tool call raised utility to 85.5% and left attack success at 27.8%. The authors expect it would not survive an injection that tells the model to ignore later instructions.[^5] The **tool filter** did best. Before seeing any untrusted data, the model picks the tools it needs for the task, so a request to summarize emails might keep only the tool that reads email. Attack success fell to 6.84% in Table 5 (the text of the paper gives 7.5%).[^5] It works because many of the user tasks only need to read, while the attacks need to write.[^5]",
    },
    {
      type: 'p',
      text: "The paper also says where the tool filter breaks. It fails when the tools cannot be planned up front, because one call's result decides the next step. It also fails when the tools the task needs are enough to carry out the attack, which was true for 17% of AgentDojo's test cases.[^5] And an injection that only biases a result, such as a hotel listing telling the model to always pick that hotel, needs no extra tools at all.[^5]",
    },
    {
      type: 'callout',
      title: 'Reading a reliability claim for an agent',
      text: "Ask for pass^k at a k close to how often the task repeats, not only pass^1. Ask whether the failure rate came from benign but vague instructions (ToolEmu's setting) or from injected text (AgentDojo's), since a defense against one says little about the other. Ask what a defense cost in benign utility; in AgentDojo the detector blocked attacks and also blocked much of the real work.[^1,4,5]",
    },
    {
      type: 'h2',
      text: 'What the reward cannot see',
    },
    {
      type: 'p',
      text: "Every number above depends on how a success was scored, and the τ-bench authors say plainly where their scoring falls short. The reward checks the final database and the facts given to the user. They write that r = 1 \"might be a necessary but not sufficient condition for a successful episode,\" because the agent might, for example, issue the return without explicit user confirmation, which violates the policy.[^1] So a run that skipped the confirmation step still counts as a pass, and pass^k inherits that blind spot. ToolEmu has a matching gap on its side of the problem: its automatic safety evaluator caught 73.1% of the failures that human annotators confirmed, with 75.3% precision, a little below a single held-out human annotator, whose recall was 78.8% and precision 78.7%.[^4] Even an agent that passed every one of eight runs has only passed this check. Nothing in the score says it asked before it acted.",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Yao, Shinn, Razavi, and Narasimhan, τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains, 2024', url: 'https://arxiv.org/abs/2406.12045' },
        { title: 'Chen et al., Evaluating Large Language Models Trained on Code, 2021', url: 'https://arxiv.org/abs/2107.03374' },
        { title: 'Barres, Dong, Ray, Si, and Narasimhan, τ²-Bench: Evaluating Conversational Agents in a Dual-Control Environment, 2025', url: 'https://arxiv.org/abs/2506.07982' },
        { title: 'Ruan et al., Identifying the Risks of LM Agents with an LM-Emulated Sandbox (ToolEmu), ICLR 2024', url: 'https://arxiv.org/abs/2309.15817' },
        { title: 'Debenedetti et al., AgentDojo: A Dynamic Environment to Evaluate Prompt Injection Attacks and Defenses for LLM Agents, NeurIPS 2024', url: 'https://arxiv.org/abs/2406.13352' },
      ],
    },
  ],
};

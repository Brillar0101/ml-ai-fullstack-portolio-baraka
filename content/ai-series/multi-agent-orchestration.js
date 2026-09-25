// Every factual claim below is taken from the numbered sources at the end.
// Both charts are redrawn from table values (Du et al. 2023, Table 1; Qian et
// al. 2024, Table 3). The wiring diagrams are drawn from each paper's own
// description of its agents and message flow.
export const POST = {
  id: 'multi-agent-orchestration',
  title: 'Four Ways to Wire LLM Agents, and What Each One Measured',
  excerpt: 'Three copies of gpt-3.5-turbo that read and revise each other\'s answers solved 81.8% of an arithmetic test the same model solved 67.0% of alone. Pipelines, managers, group chats and debates each come from a paper that measured them. Here is the wiring, the numbers, and the bill.',
  category: 'AI',
  tags: ['Agents', 'Multi-Agent', 'Orchestration'],
  body: [
    {
      type: 'p',
      text: "In May 2023, Yilun Du, Shuang Li, Antonio Torralba, Joshua Tenenbaum and Igor Mordatch gave a single model, gpt-3.5-turbo-0301, one hundred arithmetic problems of the form 12+15*21+0-3*27: six random integers between 0 and 30, joined by addition, multiplication and subtraction.[^1] Asked once, the model got 67.0% of them right. Three copies of the same model that each answered, read the other two answers, and revised over two rounds of debate got 81.8%. A majority vote over three independent answers, where no copy saw another's work, got 69.0%.[^1]",
    },
    {
      type: 'p',
      text: "The model did not change between those rows, and every method started from the same prompt.[^1] What changed was who could see whose output, and when. That is the whole design question in a multi-agent system. Once you have several LLM calls working on one task, you have to decide how they are connected, and the connection pattern (the **topology**) changes both the result and the bill.",
    },
    {
      type: 'p',
      text: "Four topologies come up again and again: a fixed pipeline of roles, a manager directing workers, a group chat, and a debate. Each section below takes one, draws its wiring, names a paper that built and measured it, and reports what that paper says it cost. At the end, the few numbers that can fairly share a chart get one.",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Agent', def: 'One LLM instance with its own prompt, often a role such as "architect" or "reviewer", and its own message history. Some agents can also run tools, such as a Python interpreter.' },
        { term: 'Topology', def: 'Which agents can send messages to which, in what order, and who decides the order.' },
        { term: 'pass@1', def: 'On a coding benchmark, the share of problems where the first program the system produces passes the hidden unit tests.' },
        { term: 'Round', def: 'In a debate, one pass in which every agent reads the others\' latest answers and writes a new one.' },
      ],
    },
    {
      type: 'h2',
      text: 'A fixed pipeline of roles: MetaGPT',
    },
    {
      type: 'p',
      text: "MetaGPT, from Sirui Hong, Mingchen Zhuge and colleagues (ICLR 2024), copies the way a software company hands work down a line. It encodes Standardized Operating Procedures (SOPs), the written workflows human teams follow, into a sequence of prompts.[^2] There are five roles: Product Manager, Architect, Project Manager, Engineer and QA Engineer, and they work in a fixed order. The Product Manager turns a one-line requirement into a product requirements document (PRD) with user stories. The Architect turns the PRD into file lists, data structures and interface definitions. The Project Manager splits that into tasks, the Engineer writes the code, and the QA Engineer writes test cases.[^2]",
    },
    {
      type: 'diagram',
      title: 'MetaGPT: a fixed order of roles passing documents',
      nodes: [
        { id: 'req', label: 'Requirement', icon: 'user', at: [0, 0] },
        { id: 'pm', label: 'Product manager', icon: 'model', at: [1, 0] },
        { id: 'arch', label: 'Architect', icon: 'model', at: [2, 0] },
        { id: 'proj', label: 'Project manager', icon: 'model', at: [2, 1] },
        { id: 'eng', label: 'Engineer', icon: 'model', at: [1, 1] },
        { id: 'qa', label: 'QA engineer', icon: 'model', at: [0, 1] },
      ],
      edges: [
        { from: 'req', to: 'pm', label: 'one line' },
        { from: 'pm', to: 'arch', label: 'PRD' },
        { from: 'arch', to: 'proj', label: 'system design' },
        { from: 'proj', to: 'eng', label: 'task list' },
        { from: 'eng', to: 'qa', label: 'code' },
      ],
      caption: 'Each role waits for the documents it depends on, then publishes its own to a shared message pool. Drawn from the workflow in section 3.1 of Hong et al.[^2]',
    },
    {
      type: 'p',
      text: "Two design choices make this more than a chain of prompts. First, agents talk through structured documents and diagrams, not free dialogue. The authors point to the telephone game, where a message distorts after a few retellings, and they contrast this with ChatDev, whose agents chat.[^2] Second, every agent publishes to one shared message pool and subscribes only to the documents its role needs, and it acts only after all its prerequisites have arrived.[^2] The Engineer also runs its own unit tests and debugs, up to 3 retries, which the paper calls executable feedback.[^2]",
    },
    {
      type: 'p',
      text: "With GPT-4 underneath, MetaGPT reported pass@1 of 85.9% on HumanEval (164 handwritten programming tasks) and 87.7% on MBPP (427 Python tasks). Executable feedback accounted for 4.2 and 5.4 points of that.[^2,7] One caution comes from the paper's own appendix. Its GPT-4 baseline is the 67% OpenAI reported, but when the authors re-ran gpt-4-0613 themselves with a system prompt or a regex code parser, it averaged 80.0% and 81.2% over five runs.[^2] My reading is that the fair gap between the pipeline and a well-prompted GPT-4 is about five points, not nineteen.",
    },
    {
      type: 'p',
      text: "The role ablation shows what each extra agent costs. An Engineer alone wrote 83 lines for $0.915, needed 10 human revisions and scored 1.0 on a 1 to 4 executability scale. With all four roles it wrote 191 lines for $1.385, needed 2.5 revisions and scored 4.0.[^2] That is about 51% more money for a large drop in manual fixes. On seven tasks from the authors' SoftwareDev set, full MetaGPT used 31,255 tokens and 541 seconds per task, against ChatDev's 19,292 tokens and 762 seconds. It spent 124.3 tokens per line of code against ChatDev's 248.9, and needed 0.83 human revisions against 2.5.[^2] A human revision here is one manual code fix, such as a missing import, each touching up to three lines.[^2]",
    },
    {
      type: 'h2',
      text: 'A manager and its workers: ChatDev pairs and the AutoGen Commander',
    },
    {
      type: 'p',
      text: "ChatDev, from Chen Qian and colleagues at Tsinghua University, also runs waterfall phases in order: design, coding and testing, with coding split into writing and completion and testing split into code review and system testing.[^3] The difference is inside each step. Every subtask gets exactly two agents. An **instructor** gives directions and an **assistant** follows them and returns a solution, and the pair keeps talking until they agree.[^3] That is the manager and worker pattern at its smallest size, and the authors chose it on purpose: two agents avoid complex multi-agent topologies and make agreement easier to reach.[^3]",
    },
    {
      type: 'diagram',
      nodes: [
        { label: 'Design', detail: 'CEO instructs CTO' },
        { label: 'Coding', detail: 'CTO instructs programmer' },
        { label: 'Code complete', detail: 'CTO instructs programmer' },
        { label: 'Code review', detail: 'Reviewer instructs programmer' },
        { label: 'System testing', detail: 'Tester instructs programmer' },
      ],
      caption: 'ChatDev\'s chat chain. Each box is one instructor and assistant pair; only the agreed solution moves to the next box, not the conversation. Drawn from Figure 2 of Qian et al.[^3]',
    },
    {
      type: 'p',
      text: "Only each subtask's final solution passes forward, so the next pair does not inherit a long transcript.[^3] Roles are set with system prompts using inception prompting, a technique from the CAMEL paper.[^3,6] ChatDev also adds what it calls communicative dehallucination: before answering, the assistant asks the instructor for specifics, such as the exact name of a dependency.[^3] A subtask stops once two code modifications in a row leave the code unchanged, or after 10 rounds of dialogue.[^3]",
    },
    {
      type: 'p',
      text: "ChatDev was tested on SRDD, 1,200 software descriptions in 40 subcategories, using ChatGPT-3.5 at temperature 0.2 with the same settings for every baseline.[^3] It measures completeness (share of programs with no placeholder code), executability (share that compile and run) and consistency (embedding similarity between requirement and code), and multiplies them into a quality score. ChatDev scored 0.3953, MetaGPT 0.1523 and the single-agent GPT-Engineer 0.1419. On executability alone the scores were 0.8800, 0.4145 and 0.3583.[^3] Removing the roles from the system prompts dropped quality to 0.2212, the largest fall in the ablation. Without a \"prefer GUI design\" role, the programmer wrote command-line programs only.[^3]",
    },
    {
      type: 'p',
      text: "The cost is stated plainly. Per task, GPT-Engineer took 15.6 seconds and 7,183 tokens. ChatDev took 148.2 seconds and 22,949 tokens, and MetaGPT 154.0 seconds and 29,279 tokens.[^3] The authors write that the multi-agent approach is slower and uses more tokens, but produces more files and more code.[^3]",
    },
    {
      type: 'p',
      text: "A manager with more than one worker appears in the AutoGen paper as a rebuild of OptiGuide, a supply-chain question answering system. A **Commander** receives a question such as \"What if we prohibit shipping from supplier 1 to roastery 2?\". A **Writer** drafts optimization code, and a **Safeguard** checks it before the Commander runs it. If anything fails, the Commander sends the logs back to the Writer and the loop repeats until the question is answered or times out.[^4]",
    },
    {
      type: 'diagram',
      title: 'AutoGen OptiGuide: one manager, two workers',
      nodes: [
        { id: 'user', label: 'User', icon: 'user', at: [0, 1] },
        { id: 'cmd', label: 'Commander', icon: 'service', at: [1, 1] },
        { id: 'wr', label: 'Writer', icon: 'model', at: [2, 0] },
        { id: 'sg', label: 'Safeguard', icon: 'model', at: [2, 2] },
      ],
      edges: [
        { from: 'user', to: 'cmd', label: 'question' },
        { from: 'cmd', to: 'wr', label: 'write, interpret', route: 'hv' },
        { from: 'cmd', to: 'sg', label: 'is it safe?', route: 'hv' },
      ],
      caption: 'The workers never talk to each other; every message goes through the Commander, which also runs the code. Drawn from Figure 11 of Wu et al.[^4]',
    },
    {
      type: 'p',
      text: "The authors tested whether the split into separate agents mattered by giving one agent both the writing and the safety check. On 100 coding tasks, half safe and half unsafe, the multi-agent version flagged unsafe code with an F1 of 96% against 88% using GPT-4, and 83% against 48% using GPT-3.5-turbo.[^4] Recall rose from 78% to 98% and from 32% to 72%.[^4] The paper reports no token or call counts for this comparison. It does report that the core workflow code shrank from over 430 lines to 100.[^4]",
    },
    {
      type: 'h2',
      text: 'A group chat with a speaker picker: AutoGen',
    },
    {
      type: 'p',
      text: "AutoGen, from Qingyun Wu, Chi Wang and colleagues at Microsoft Research, Penn State and elsewhere, is a framework built on conversable agents. Each agent can send, receive and generate a reply, and by default it replies automatically to any message it gets, so a conversation runs without a separate controller.[^4] Its group chat drops the fixed order. All agents share one context, and a **GroupChatManager** repeats three steps: pick the next speaker, collect that speaker's response, and broadcast it to everyone.[^4] Choosing the speaker is itself an LLM call, made with a role-play prompt.[^4]",
    },
    {
      type: 'diagram',
      title: 'AutoGen group chat: the manager picks who speaks next',
      nodes: [
        { id: 'mgr', label: 'Group chat manager', icon: 'service', at: [1, 1] },
        { id: 'up', label: 'User proxy', icon: 'user', at: [1, 0] },
        { id: 'eng', label: 'Engineer', icon: 'model', at: [0, 1] },
        { id: 'cr', label: 'Critic', icon: 'model', at: [2, 1] },
        { id: 'ex', label: 'Code executor', icon: 'datastore', at: [1, 2] },
      ],
      edges: [
        { from: 'mgr', to: 'up', label: 'broadcast' },
        { from: 'mgr', to: 'eng', label: 'broadcast' },
        { from: 'mgr', to: 'cr', label: 'broadcast' },
        { from: 'mgr', to: 'ex', label: 'broadcast' },
      ],
      caption: 'The four members of the pilot study group. Each turn, the manager selects one speaker and sends its message to all the others. Drawn from Figure 12 and Appendix D of Wu et al.[^4]',
    },
    {
      type: 'p',
      text: "The evidence is a pilot study, and the paper calls it one: 12 hand-written tasks such as working out the profit from buying 200 AAPL shares at the 30-day low, selling at the high, and saving the result to a file.[^4] The group had a user proxy, an engineer that writes and fixes code, a critic that reviews it, and a code executor. It was compared against a two-agent chat (one assistant plus a user proxy) and against the same group with a plainer, task-based speaker selection prompt. With GPT-4 the group chat solved 11 of the 12 tasks, the two-agent chat 9 and the task-based group 8. With GPT-3.5-turbo the same three solved 9, 8 and 7.[^4]",
    },
    {
      type: 'p',
      text: "The cost result runs against intuition. With GPT-4, the group chat averaged 4.5 LLM calls per task with no termination failures, while the two-agent chat averaged 6.8 calls and failed to terminate 3 times. With GPT-3.5-turbo the gap was 5.3 calls against 9.9, and 0 failures against 9.[^4] The paper's example shows why: the two-agent chat failed a task and ended in a repeated conversation, while the group chat finished it.[^4] In this study, more agents meant fewer calls, and the example suggests the reason: the group chat did not get stuck in a loop. Twelve tasks is a small sample, so I would read this as a mechanism to watch for, not a general rule.",
    },
    {
      type: 'h2',
      text: 'Debate: copies of one model revising in rounds',
    },
    {
      type: 'p',
      text: "Du et al.'s debate is the simplest wiring here and needs no roles at all. Several copies of the model answer a question independently. Then each copy gets the other copies' answers pasted into its prompt, with an instruction to use them as additional advice and give an updated answer. That step repeats for several rounds.[^1] Each agent is both checking the others and fixing its own answer. The method only needs text in and text out, not token probabilities or gradients, and the authors combined it with zero-shot chain of thought.[^1]",
    },
    {
      type: 'diagram',
      rows: [
        [{ label: 'Question' }],
        [{ label: 'Agent 1', detail: 'answers alone' }, { label: 'Agent 2', detail: 'answers alone' }, { label: 'Agent 3', detail: 'answers alone' }],
        [{ label: 'Agent 1', detail: 'reads 2 and 3, revises' }, { label: 'Agent 2', detail: 'reads 1 and 3, revises' }, { label: 'Agent 3', detail: 'reads 1 and 2, revises' }],
        [{ label: 'Final answer', detail: 'after the last round' }],
      ],
      caption: 'Multiagent debate with three agents. The middle revision step repeats once per round; the paper\'s main results use three agents and two rounds. Drawn from Figure 2 and section 2.1 of Du et al.[^1]',
    },
    {
      type: 'p',
      text: "Because of computational expense, the main results use three agents and two rounds.[^1] Against the same model and starting prompt, debate raised grade school math (GSM8K, 100 problems) from 77.0% to 85.0%, and the advantage of its suggested chess moves, scored in pawns by the Stockfish engine, from 91.4 to 122.9.[^1] On factual tasks it raised MMLU from 63.9% to 71.1%, accuracy on biographies of 524 computer scientists from 66.0% to 73.8%, and legal chess moves from 29.3% to 45.2%.[^1] Self-reflection, where one agent critiques its own answer, helped arithmetic but dropped MMLU to 57.7%, below the plain single answer.[^1]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Same model, four ways to combine its answers',
      yLabel: 'Accuracy (%)',
      series: [
        { label: 'Single agent', key: 's', baseline: true },
        { label: 'Self-reflection', key: 'r' },
        { label: 'Majority of 3', key: 'm' },
        { label: 'Debate, 3 agents', key: 'd' },
      ],
      data: [
        { label: 'Arithmetic', values: { s: 67.0, r: 72.1, m: 69.0, d: 81.8 } },
        { label: 'GSM8K', values: { s: 77.0, r: 75.0, m: 81.0, d: 85.0 } },
      ],
      caption: 'Redrawn from Table 1 of Du et al., 2023.[^1] All four use gpt-3.5-turbo-0301 on the same 100 problems per task; multi-agent rows use 3 agents and 2 rounds. The paper reports error bars of 2.3 to 4.7 points. The chess column is left out because it uses a different scale.',
    },
    {
      type: 'p',
      text: "The paper's analysis changes one variable at a time. On arithmetic, accuracy kept rising with more agents and with more rounds, though rounds beyond four gave about the same result as four.[^1] With many agents, pasting every answer overflowed the context window, so the authors summarized the other agents' answers first, which also helped.[^1] Prompts that made agents more stubborn gave longer debates and better final answers; the authors found the models \"agreeable\" by default.[^1] Giving the three agents different personas (professor, doctor, mathematician) raised MMLU from 71.1% to 74.2%.[^1] A mixed debate between ChatGPT and Bard on 20 GSM8K problems solved 17, where Bard alone solved 11 and ChatGPT alone 14.[^1]",
    },
    {
      type: 'p',
      text: "The paper gives no token or time counts, only that debate is more computationally expensive than other prompting methods.[^1] By my count, three agents over two rounds means six to nine model generations per question where the baseline makes one, depending on whether the first answers count as a round. Every revision prompt also carries the other agents' full answers. The gain is not automatic either. In AutoGen's math evaluation, a different debate design (Liang et al.'s, with an affirmative agent, a negative agent and a moderator) solved 26.67% of 120 hard MATH problems, below GPT-4 alone at 30.0%.[^4,5] Different method, different model, harder benchmark, so this does not contradict Du. It does show that \"add a debate\" is not a free win.",
    },
    {
      type: 'h2',
      text: 'The numbers that can share a chart',
    },
    {
      type: 'p',
      text: "Most of the results above cannot go on one axis. They use different models (GPT-4, gpt-3.5-turbo-0301, ChatGPT-3.5), different benchmarks and different scoring. MetaGPT's executability is a human rating from 1 to 4 on seven tasks. ChatDev's is the share of 1,200 generated programs that run. Debate reports accuracy on 100-problem sets, and the group chat reports successes out of 12.",
    },
    {
      type: 'p',
      text: "The two software papers show why this matters. Each evaluated the other and each came out ahead. In MetaGPT's paper, ChatDev scored 2.25 on executability against MetaGPT's 3.75. In ChatDev's paper, MetaGPT's executability was 0.4145 against ChatDev's 0.8800.[^2,3] MetaGPT's appendix even lists ChatDev's average as 2.1 on the same seven tasks, while its main table says 2.25.[^2] Quality rankings did not survive a change of harness. The token bill did, in direction at least: in both papers, MetaGPT used more tokens per task than ChatDev.[^2,3]",
    },
    {
      type: 'p',
      text: "The cleanest cross-topology comparison in these papers is ChatDev's Table 3. It has one model, one dataset and one set of settings, with three wirings: a single agent, MetaGPT's role pipeline, and ChatDev's chain of instructor and assistant pairs.[^3]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Tokens per generated program, one harness, three wirings',
      yLabel: 'Tokens per task',
      series: [{ label: 'Tokens', key: 't' }],
      data: [
        { label: 'Single agent (GPT-Engineer)', values: { t: 7183 } },
        { label: 'Pair chain (ChatDev)', values: { t: 22949 } },
        { label: 'Role pipeline (MetaGPT)', values: { t: 29279 } },
      ],
      caption: 'Redrawn from Table 3 of Qian et al., 2024.[^3] Averages over the SRDD tasks with ChatGPT-3.5 at temperature 0.2. Durations were 15.6 s, 148.2 s and 154.0 s. Quality scores on the same harness were 0.1419, 0.3953 and 0.1523.',
    },
    {
      type: 'p',
      text: "On that harness, both multi-agent wirings cost roughly three to four times the tokens and about ten times the wall-clock time of one agent. The pair chain bought a much higher quality score for the money; the role pipeline, on ChatDev's own metrics, barely beat the single agent.[^3] Whether that ordering holds on your task is exactly what these papers cannot tell you, since MetaGPT's harness reverses it.[^2]",
    },
    {
      type: 'callout',
      title: 'Before trusting a multi-agent result',
      text: "Check that the single-agent baseline got the same model, prompt effort and output parsing; MetaGPT's own reruns moved GPT-4 on HumanEval from 67% to about 80%.[^2] Then look for a call or token count next to the accuracy. Of the four anchor papers here, only ChatDev, MetaGPT and the AutoGen group chat study report one.[^2,3,4]",
    },
    {
      type: 'h2',
      text: 'Agreement is not correctness',
    },
    {
      type: 'p',
      text: "Du et al. close with the limitation that matters most for any topology that ends in consensus. Their debates usually converged on one final answer, but that answer was not necessarily correct. When it was wrong, the models still \"would confidently affirm that their answer is correct and consistent with all other agent responses.\"[^1] They also found that in long debates the models struggled to process the whole input and tended to focus on the most recent answers.[^1] The authors put part of the blame on language models not expressing their uncertainty correctly.[^1] A panel of agents can talk each other into the right answer. The same paper shows they can also talk each other into a wrong one and sound just as sure.",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Du, Li, Torralba, Tenenbaum, and Mordatch, Improving Factuality and Reasoning in Language Models through Multiagent Debate, 2023', url: 'https://arxiv.org/abs/2305.14325' },
        { title: 'Hong et al., MetaGPT: Meta Programming for a Multi-Agent Collaborative Framework, ICLR 2024', url: 'https://arxiv.org/abs/2308.00352' },
        { title: 'Qian et al., ChatDev: Communicative Agents for Software Development, 2023', url: 'https://arxiv.org/abs/2307.07924' },
        { title: 'Wu et al., AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation, 2023', url: 'https://arxiv.org/abs/2308.08155' },
        { title: 'Liang et al., Encouraging Divergent Thinking in Large Language Models through Multi-Agent Debate, 2023', url: 'https://arxiv.org/abs/2305.19118' },
        { title: 'Li et al., CAMEL: Communicative Agents for "Mind" Exploration of Large Language Model Society, 2023', url: 'https://arxiv.org/abs/2303.17760' },
        { title: 'Chen et al., Evaluating Large Language Models Trained on Code (HumanEval), 2021', url: 'https://arxiv.org/abs/2107.03374' },
      ],
    },
  ],
};

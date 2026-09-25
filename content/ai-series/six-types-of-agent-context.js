// Every factual claim below is taken from the numbered sources at the end.
// The CoALA architecture figure is reproduced under CC BY 4.0 (arXiv 2309.02427).
// The two charts are redrawn from reported numbers in Park et al. 2023 and
// Packer et al. 2023; Park et al. is not under a license that allows figure reuse.
export const POST = {
  id: 'six-types-of-agent-context',
  title: 'What an agent reads on every request: four memories and a window',
  excerpt: 'Generative Agents lost believability each time a memory component was switched off. CoALA gives the vocabulary for why: working, episodic, semantic and procedural memory, plus the tool results that flow back in. Here is each one as the papers define it, and how MemGPT and Generative Agents build and measure it.',
  category: 'AI',
  tags: ['Context Engineering', 'Agents', 'Memory'],
  publishAt: '2026-07-10T12:00:00Z',
  body: [
    {
      type: 'p',
      text: 'In 2023 a Stanford and Google team put 25 language model agents in a small simulated town called Smallville, let them live for two game days, and then interviewed them. Each agent answered five questions in each of five categories: knowing itself, recalling past events, making plans, reacting to surprises, and reflecting.[^1] The interesting part was the control group. The researchers ran the same interviews with versions of the agent that had parts of their memory switched off, and asked 100 human evaluators to rank all the answers for the same agent by how believable they were.[^1]',
    },
    {
      type: 'p',
      text: 'The full architecture ranked first, with a TrueSkill rating of \\(\\mu = 29.89\\). TrueSkill is a rating system in the family of chess Elo; higher means the condition won more of the rankings. Removing reflection dropped the rating to 26.88. Removing reflection and planning dropped it to 25.64. Removing everything, so the agent answered with no access to its memory stream at all, dropped it to 21.21, below even the answers human crowdworkers wrote while role-playing the agent (22.95).[^1] The gap between the full agent and the memoryless one was an effect size of \\(d = 8.16\\), eight standard deviations.[^1]',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Believability of interview answers, by memory available',
      yLabel: 'TrueSkill rating (mean)',
      series: [{ label: 'Rating', key: 'mu' }],
      data: [
        { label: 'Full architecture', values: { mu: 29.89 } },
        { label: 'No reflection', values: { mu: 26.88 } },
        { label: 'No reflection, no planning', values: { mu: 25.64 } },
        { label: 'Human crowdworker', values: { mu: 22.95 } },
        { label: 'No memory at all', values: { mu: 21.21 } },
      ],
      caption: 'Redrawn from Section 6.5.1 and Figure 8 of Park et al., 2023.[^1] All agents ran on gpt-3.5-turbo. Standard deviations were 0.68 to 0.72. Every pairwise difference was significant at p < 0.001 except crowdworker versus no memory.',
    },
    {
      type: 'p',
      text: 'The same model produced every one of those machine answers. What changed between conditions was what got written into the prompt before the model ran. The authors even gave the ablated versions access to all the memories the full agent had built up, so the gaps are, in their words, likely a conservative estimate: a crippled agent would have lived a different two days.[^1]',
    },
    {
      type: 'h2',
      text: 'Where the categories come from',
    },
    {
      type: 'p',
      text: 'Earlier versions of this post split an agent\'s context into six practitioner categories. That list had no research source, so this version uses one that does. Sumers, Yao, Narasimhan and Griffiths proposed CoALA, short for Cognitive Architectures for Language Agents, in 2023. They borrowed the memory types from Soar and other cognitive architectures, which in turn took them from psychology.[^2]',
    },
    {
      type: 'p',
      text: 'CoALA starts from one plain fact: language models are stateless. They keep nothing between calls. An agent that needs to remember anything has to store it somewhere and copy it back into the prompt.[^2] CoALA names four places to store it. **Working memory** is short-term. The three long-term ones are **episodic**, **semantic** and **procedural** memory.[^2] Around those sit the actions: **retrieval** reads long-term memory into working memory, **reasoning** reads and writes working memory, **learning** writes to long-term memory, and **grounding** acts on the outside world and turns what comes back into text.[^2]',
    },
    {
      type: 'image',
      src: '/blog-images/six-types-of-agent-context/coala-figure4.webp',
      alt: 'CoALA architecture diagram. Panel A shows procedural memory (LLM and agent code), semantic memory and episodic memory across the top, each connected by retrieval and learning arrows to a working memory box below. A decision procedure sits beside working memory, and actions and observations connect working memory to dialogue, physical and digital environments. Panel B shows a decision cycle: observation, then planning with proposal, evaluation and selection, then execution, looping back.',
      width: 1830,
      height: 905,
      caption: 'Figure 4 from Sumers et al., 2023,[^2] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Everything the LLM sees on a call is synthesized from working memory.',
    },
    {
      type: 'p',
      text: 'Held against that map, the practitioner\'s list folds into fewer boxes. Instructions are prompt templates, and CoALA files prompt templates under agent code, which is procedural memory.[^2] Tool definitions are procedural too: CoALA calls them grounding procedures, and it treats stateless APIs like search or a calculator as special "single-use" digital environments.[^2] Tool results are observations that grounding writes back into working memory as text.[^2] So the taxonomy below has four memory types plus one flow, not six types.',
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Working memory', url: 'https://arxiv.org/abs/2309.02427', def: 'Active information for the current decision cycle: perceptual inputs, knowledge retrieved or reasoned out, and goals carried over from the last cycle. Each LLM input is built from a subset of it.' },
        { term: 'Episodic memory', url: 'https://arxiv.org/abs/2309.02427', def: 'Experience from earlier decision cycles, such as event logs, past trajectories, or earlier input and output pairs.' },
        { term: 'Semantic memory', url: 'https://arxiv.org/abs/2309.02427', def: 'Knowledge about the world and about the agent itself. It can be a fixed document corpus or facts the agent inferred and wrote down.' },
        { term: 'Procedural memory', url: 'https://arxiv.org/abs/2309.02427', def: 'How the agent does things. Implicitly, the LLM weights. Explicitly, the agent code: prompt templates, parsers, retrieval routines, tool procedures, and the decision loop.' },
      ],
    },
    {
      type: 'h2',
      text: 'Working memory is the only part the model reads',
    },
    {
      type: 'p',
      text: 'CoALA separates working memory from the prompt on purpose. Earlier methods used the model\'s own context as working memory. In CoALA, working memory is a data structure that persists across LLM calls; each call\'s input is synthesized from a subset of it, and the output is parsed back into variables such as an action name and its arguments.[^2] The practical reading is that the prompt is a view onto working memory, rebuilt every call.',
    },
    {
      type: 'p',
      text: 'MemGPT, from Packer and colleagues at Berkeley, gives that view a concrete layout. It treats the context window like RAM in an operating system and everything else like disk. Its prompt, which it calls **main context**, has three contiguous sections: read-only system instructions, a fixed-size read/write block called working context, and a first-in, first-out queue of messages.[^3] Working context holds facts, preferences and details about the user and the agent\'s persona, and the model can change it only by calling functions. The queue holds the rolling conversation, system messages, and function call inputs and outputs. Its first slot is a recursive summary of messages that were evicted.[^3]',
    },
    {
      type: 'p',
      text: 'The eviction rule is what makes the layout work. When the prompt passes a warning threshold, 70% of the window in their example, a queue manager inserts a "memory pressure" warning so the model can save what matters into working context or long-term storage. At the flush threshold, 100% in the example, it evicts a chunk of messages (50% of the window in the example), folds them into a new recursive summary, and writes them to a database where they stay searchable.[^3] Nothing is thrown away. It just stops being in the prompt.',
    },
    {
      type: 'h2',
      text: 'Episodic memory: the record of what happened',
    },
    {
      type: 'p',
      text: 'CoALA defines episodic memory as experience from earlier decision cycles, and names history event flows, with Generative Agents as an example, as one form it can take.[^2] In Generative Agents that record is the **memory stream**: a list of memory objects, each with a natural language description, a creation timestamp and a most-recent-access timestamp. The basic entry is an observation, something the agent perceived, such as "Isabella Rodriguez is setting out the pastries" or "The refrigerator is empty."[^1]',
    },
    {
      type: 'p',
      text: 'The record grows faster than a context window can hold. The authors tried the obvious fix, summarizing all of an agent\'s experience into the prompt, and got an uninformative answer.[^1] Instead a retrieval function takes the agent\'s current situation as a query and scores every memory:',
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\text{score}(m) = \\alpha_{\\text{rec}} \\cdot \\text{recency}(m) \\\\ +\\; \\alpha_{\\text{imp}} \\cdot \\text{importance}(m) \\\\ +\\; \\alpha_{\\text{rel}} \\cdot \\text{relevance}(m, q) \\\\[6pt] \\text{recency}(m) = 0.995^{\\,h_m} \\\\[4pt] \\text{relevance}(m, q) = \\cos(\\mathbf{e}_m, \\mathbf{e}_q) \\end{gathered}',
      caption: 'Retrieval score from Section 4.1 of Park et al., 2023.[^1] Each term is min-max scaled to [0, 1] before weighting, and all three weights were set to 1. Writing recency as \\(0.995^{h_m}\\) is my reading of "exponential decay" with "decay factor 0.995".',
    },
    {
      type: 'p',
      text: 'Term by term. \\(m\\) is one memory object and \\(q\\) is the query memory describing the current situation. **Recency** decays exponentially with \\(h_m\\), the number of sandbox game hours since memory \\(m\\) was last retrieved, with a decay factor of 0.995, so things from this morning stay near the top.[^1] **Importance** is a number from 1 to 10 that the model assigns when the memory is created, using a prompt that anchors 1 at "brushing teeth, making bed" and 10 at "a break up, college acceptance." In the paper, that prompt scored "cleaning up the room" a 2 and "asking your crush out on a date" an 8.[^1] **Relevance** is the cosine similarity between the embedding \\(\\mathbf{e}_m\\) of the memory\'s text and the embedding \\(\\mathbf{e}_q\\) of the query. The \\(\\alpha\\) weights let you favor one signal; the authors set all three to 1.[^1] The top-ranked memories that fit in the context window go into the prompt.[^1]',
    },
    {
      type: 'p',
      text: 'CoALA\'s own label for this is useful: recency is rule-based, importance is reasoning-based, and relevance is embedding-based.[^2] Three different mechanisms vote on what the model sees.',
    },
    {
      type: 'p',
      text: 'MemGPT keeps its episodic record in **recall storage**. Every incoming message and every model output is written there, and evicted messages remain readable through a paginated search function.[^3] The authors tested it with a task they built on the Multi-Session Chat dataset, called deep memory retrieval: after five prior sessions, the user asks a question that can only be answered from an earlier conversation. Baselines saw a lossy summary of the past sessions; MemGPT had the full history but had to page through it with search calls.[^3]',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Deep memory retrieval accuracy',
      yLabel: 'Accuracy (%)',
      series: [
        { label: 'Model with summary', key: 'base', baseline: true },
        { label: '+ MemGPT', key: 'mem' },
      ],
      data: [
        { label: 'GPT-3.5 Turbo', values: { base: 38.7, mem: 66.9 } },
        { label: 'GPT-4', values: { base: 32.1, mem: 92.5 } },
        { label: 'GPT-4 Turbo', values: { base: 35.3, mem: 93.4 } },
      ],
      caption: 'Redrawn from Table 2 of Packer et al., 2023.[^3] Answers were judged against a gold answer by an LLM judge; ROUGE-L recall moved the same direction for every model.',
    },
    {
      type: 'h2',
      text: 'Semantic memory: facts, including ones the agent wrote',
    },
    {
      type: 'p',
      text: 'Semantic memory holds knowledge about the world and about the agent itself. CoALA points out that ordinary retrieval-augmented generation fits here: a Wikipedia index is a read-only semantic memory. Agents can also write to it, storing what they conclude from experience.[^2]',
    },
    {
      type: 'p',
      text: 'Generative Agents does the writing through **reflection**. The paper\'s example is Klaus Mueller, asked which acquaintance he would spend an hour with. With only raw observations, he picked Wolfgang, the neighbor he saw most often, though the two only ever saw each other in passing.[^1] Reflection fixes this. When the summed importance of recent events crosses a threshold (150 in their implementation, which worked out to two or three times a game day), the agent asks the model for the 3 most salient questions its 100 most recent memories raise, retrieves memories for each question, and writes insights such as "Klaus Mueller is dedicated to his research on gentrification," with pointers to the memories cited.[^1] With those reflections, Klaus picked Maria, who also does research.[^1] Reflections go back into the same stream and compete in the same retrieval score. CoALA reads them as writes to semantic memory, distinct from the episodic event list.[^2] The ablation above prices them: removing reflection alone cost three TrueSkill points.[^1]',
    },
    {
      type: 'p',
      text: 'MemGPT\'s semantic store is **archival storage**, a read/write database for text of any length.[^3] For document question answering, the authors loaded Wikipedia passages into it (PostgreSQL with the pgvector extension) and let the agent query it by function call.[^3] Fixed-context baselines were capped by the retriever: if the top \\(K\\) documents missed the gold article, the model never saw it. MemGPT could page further.[^3] A harder test, nested key-value lookup, hid chains of UUID pairs where a value could itself be a key. GPT-4 and GPT-4 Turbo fell to 0% accuracy by three nesting levels, while MemGPT on GPT-4 was unaffected by nesting depth, because it could keep issuing lookups.[^3]',
    },
    {
      type: 'h2',
      text: 'Procedural memory: instructions, code and skills',
    },
    {
      type: 'p',
      text: 'CoALA gives procedural memory two forms. One is implicit, stored in the LLM weights. The other is explicit, written as agent code, and that code splits again: procedures that carry out actions (reasoning, retrieval, grounding, learning) and the procedure that decides what to do next.[^2] Two rules follow. Unlike episodic or semantic memory, which can start empty, procedural memory has to be set up by the designer before the agent can run at all. And an agent writing to its own procedural memory is "significantly riskier" than writing to the other two, because it "can easily introduce bugs or allow an agent to subvert its designers\' intentions."[^2]',
    },
    {
      type: 'p',
      text: 'The system prompt is the most familiar piece of procedural memory. In MemGPT it is read-only and carries two things: a description of the memory hierarchy and what each tier is for, and a function schema with natural language descriptions of every function the model may call.[^3] MemGPT\'s self-editing works only because those instructions exist; the authors write that the model has to be aware of its context limits for self-editing to work, which is why MemGPT warns it about token usage.[^3]',
    },
    {
      type: 'p',
      text: 'Procedural memory can also grow. CoALA\'s example is Voyager, a Minecraft agent that stores working code as named skills, indexes each by an embedding of its description, and retrieves relevant ones into the prompt for new tasks.[^2,4] In its ablation, the full Voyager reached a diamond tool in 1 of 3 runs within 160 prompting iterations; without the skill library it reached it in none.[^4] On four unseen tasks in a fresh world, the version without a library needed 26 to 36 iterations on average and failed one task in one of three tries, while the full version took 18 to 21 and solved all of them.[^4]',
    },
    {
      type: 'h2',
      text: 'Tool definitions and tool results sit on opposite sides',
    },
    {
      type: 'p',
      text: 'This is where the old six-way split blurred two different things. A tool definition is a procedure the designer wrote, so it is procedural memory. A tool result is new information from outside, so it lands in working memory. CoALA\'s grounding procedures do both halves: they execute the external action and process the feedback into working memory as text.[^2] In MemGPT, the output of every function, including runtime errors, is fed back to the model, and retrieval results come back in pages so a single call cannot overflow the window.[^3]',
    },
    {
      type: 'p',
      text: 'Tool count is a cost in its own right. CoALA observes that agents with larger action spaces face a harder decision problem and lean on more hand-crafted decision procedures, and suggests taking "the minimal action space necessary to solve a given task."[^2]',
    },
    {
      type: 'diagram',
      caption: 'Where each type lives. The top row is external storage; retrieval copies pieces into the context window (middle row), which is all the model reads. Grounding sends actions out and writes results back into the window. Store names are MemGPT\'s and Generative Agents\' implementations of each CoALA memory.[^1,2,3]',
      rows: [
        [
          { label: 'Episodic store', detail: 'Memory stream observations; MemGPT recall storage' },
          { label: 'Semantic store', detail: 'Reflections; MemGPT archival storage; document indexes' },
          { label: 'Procedural store', detail: 'Agent code, prompt templates, tool schemas, skill library; LLM weights' },
        ],
        [
          { label: 'Context window = working memory view', detail: 'System instructions and tool schemas, working context facts, recent messages, retrieved memories' },
        ],
        [
          { label: 'Grounding', detail: 'Tool call runs outside; result written back into working memory as text' },
        ],
      ],
    },
    {
      type: 'p',
      text: 'The diagram leaves out one caveat that CoALA itself raises. The LLM weights are procedural memory, and they never enter the window at all; they shape how everything in it is read.[^2] Everything else on the page reaches the model only by being copied into that middle row.',
    },
    {
      type: 'p',
      text: 'Placement inside the window also matters. MemGPT cites Liu et al.\'s finding that long-context models recall information at the start or end of the window better than information in the middle, as one reason not to just keep scaling context.[^3,5]',
    },
    {
      type: 'h2',
      text: 'Retrieval is the part the papers say is unsolved',
    },
    {
      type: 'p',
      text: 'Every type above depends on the same step: something outside the window has to be chosen and copied in. The papers are candid that this step fails. Generative Agents reports that full-memory agents "can fail to retrieve the correct instances from their memory." Rajiv Patel said he had not been following the election, though he had heard about Sam\'s candidacy. Tom retrieved his plan to talk politics with Isabella at her party but not the memory of being invited, so he was sure what to do there and unsure the party existed.[^1] The authors list tuning the relevance, recency and importance functions as future work.[^1]',
    },
    {
      type: 'p',
      text: 'MemGPT hits the same wall from the other side. It can in principle page through every retrieved document until it finds the gold one, but the authors observed that it "will often stop paging through retriever results before exhausting the retriever database."[^3] And CoALA, surveying the whole field, writes that "adaptive and context-specific recall remains understudied in language agents."[^2]',
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Park, O\'Brien, Cai, Morris, Liang, Bernstein, "Generative Agents: Interactive Simulacra of Human Behavior" (UIST 2023), arXiv:2304.03442', url: 'https://arxiv.org/abs/2304.03442' },
        { title: 'Sumers, Yao, Narasimhan, Griffiths, "Cognitive Architectures for Language Agents" (TMLR 2024), arXiv:2309.02427', url: 'https://arxiv.org/abs/2309.02427' },
        { title: 'Packer, Wooders, Lin, Fang, Patil, Stoica, Gonzalez, "MemGPT: Towards LLMs as Operating Systems" (2023), arXiv:2310.08560', url: 'https://arxiv.org/abs/2310.08560' },
        { title: 'Wang et al., "Voyager: An Open-Ended Embodied Agent with Large Language Models" (2023), arXiv:2305.16291', url: 'https://arxiv.org/abs/2305.16291' },
        { title: 'Liu et al., "Lost in the Middle: How Language Models Use Long Contexts" (TACL 2024), arXiv:2307.03172', url: 'https://arxiv.org/abs/2307.03172' },
      ],
    },
  ],
};

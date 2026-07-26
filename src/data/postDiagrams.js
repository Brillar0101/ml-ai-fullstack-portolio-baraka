// A diagram for each post that had none.
//
// 27 posts were prose plus a terms list, which opts out of the multimedia
// principle entirely (see notes/BLOG-FORMAT.md). Each entry below adds the
// shape that fits the concept rather than a decorative box-and-arrow:
//
//   nodes  -> a pipeline, read left to right
//   rows   -> layers stacked on each other
//   root   -> a decision with branches
//   edges  -> components and the traffic between them
//
// `before` says where it lands. Placement is varied deliberately so the series
// does not settle into "diagram always sits above the vocabulary".
export const DIAGRAMS = [
  // ---------- Foundations ----------
  { post: 'foundation-models-explained', before: { h2: 'The vocabulary you just earned' },
    diagram: { type: 'diagram',
      nodes: [
        { label: 'Pretraining', detail: 'predict the next token, at enormous scale' },
        { label: 'Post-training', detail: 'supervised, then preference tuning' },
        { label: 'Adaptation', detail: 'prompts, retrieval, light finetuning' },
        { label: 'Your product', detail: 'the only part you own' },
      ],
      caption: 'One expensive stage, done once by a large lab, then two cheap ones. Almost all of your work lives in the last two boxes.' } },

  { post: 'why-models-hallucinate', before: { h2: 'Putting names to the failure' },
    diagram: { type: 'diagram', title: 'Why one answer is reliable and the next is invented',
      root: { label: 'Is a single true answer strongly present in what the model read?', color: 'purple', children: [
        { edge: 'yes: "capital of France"', node: { label: 'The likeliest next words are also the correct ones', color: 'green' } },
        { edge: 'no: an obscure citation', node: {
          label: 'The model still has to produce something', color: 'blue', children: [
            { edge: 'it fills the shape', node: { label: 'A plausible name, institution and year, none of them real', color: 'yellow' } },
          ] } },
      ] },
      caption: 'The same machine, the same step, opposite reliability. Nothing changed except whether a true answer was strongly present in the training data.' } },

  { post: 'evaluation-is-the-hard-part', before: { h2: 'The language of measurement' },
    diagram: { type: 'diagram',
      nodes: [
        { label: 'Real cases', detail: 'pulled from actual usage' },
        { label: 'Run', detail: 'every candidate version' },
        { label: 'Score', detail: 'checkable answer, or a rubric' },
        { label: 'Decide', detail: 'ship, or do not' },
      ],
      caption: 'Four boring parts. The whole value is that a change becomes a measurement instead of a hope.' } },

  { post: 'prompt-engineering-that-helps', before: { h2: 'Where prompting stops being enough' },
    diagram: { type: 'diagram', title: 'The output is bad. What kind of bad?',
      root: { label: 'What is actually wrong with the answer?', color: 'purple', children: [
        { edge: 'vague or generic', node: { label: 'Under-specified prompt. Say the length, audience, format and what to avoid', color: 'green' } },
        { edge: 'wrong shape every time', node: { label: 'Show one or two examples instead of describing the format', color: 'green' } },
        { edge: 'facts it cannot know', node: { label: 'A prompt cannot fix this. Reach for retrieval', color: 'yellow' } },
        { edge: 'a behaviour it will not hold', node: { label: 'Out of prompt road. Consider finetuning', color: 'yellow' } },
      ] },
      caption: 'The first two are prompt problems and most complaints are one of them. The last two are not, and no wording will rescue them.' } },

  // ---------- Security ----------
  { post: 'prompt-injection', before: { h2: 'Naming the attack' },
    diagram: { type: 'diagram', title: 'Where the trust boundary actually sits',
      nodes: [
        { id: 'you', label: 'Your instructions', icon: 'service', at: [0, 0] },
        { id: 'data', label: 'Untrusted text', icon: 'datastore', at: [0, 1] },
        { id: 'model', label: 'Model', icon: 'model', at: [1, 0] },
        { id: 'tools', label: 'Tools it can call', icon: 'service', at: [2, 0] },
      ],
      edges: [
        { from: 'you', to: 'model', label: 'trusted' },
        { from: 'data', to: 'model', label: 'hostile', route: 'vh' },
        { from: 'model', to: 'tools', label: 'actions' },
      ],
      groups: [{ label: 'one undifferentiated stream of text', from: [0, 0], to: [0, 1] }],
      caption: 'You can see which box is trusted. The model cannot: both arrive as text in the same window, and the freshest instruction tends to win.' } },

  { post: 'jailbreaking', before: { h2: 'Why no single fix closes it' },
    diagram: { type: 'diagram',
      rows: [
        [{ label: 'Safety training', detail: 'a strong tendency, not a gate. Catches the lazy attempts' }],
        [{ label: 'Output filter', detail: 'reads the result, ignores how it was talked into it' }],
        [{ label: 'Scoped capability', detail: 'a jailbroken model still cannot reach what it was never given' }],
      ],
      caption: 'Layers, not a wall. The bottom layer is the one you fully control, and it decides how much a successful jailbreak is worth.' } },

  { post: 'guardrails', before: { h2: 'The moving parts, named' },
    diagram: { type: 'diagram',
      nodes: [
        { label: 'Input guardrail', detail: 'block abuse, strip injection, catch out-of-scope' },
        { label: 'Model', detail: 'grounded in retrieved source text' },
        { label: 'Output guardrail', detail: 'check claims, format, leaked data' },
        { label: 'User or handoff', detail: 'or a human, when a check fails' },
      ],
      caption: 'The input side lowers how often the model gets into trouble. The output side catches the trouble it gets into anyway. You want both.' } },

  // ---------- RAG and retrieval ----------
  { post: 'what-rag-is', before: { h2: 'The parts of a retrieval system' },
    diagram: { type: 'diagram',
      nodes: [
        { label: 'Question', detail: '"what is our refund policy?"' },
        { label: 'Retrieve', detail: 'find the few passages that match its meaning' },
        { label: 'Prompt', detail: 'question plus those passages' },
        { label: 'Answer', detail: 'read from the text, not recalled' },
      ],
      caption: 'The whole trick is the middle box. Everything else is a normal model call.' } },

  { post: 'chunking-for-rag', before: { h2: 'Chunking, term by term' },
    diagram: { type: 'diagram',
      nodes: [
        { label: 'Document', detail: 'the handbook, whole' },
        { label: 'Cut', detail: 'along sections and paragraphs, with overlap' },
        { label: 'Embed', detail: 'one vector per chunk' },
        { label: 'Retrieve', detail: 'the chunk is the smallest findable unit' },
      ],
      caption: 'The cut happens long before any question arrives, and it sets the ceiling on everything downstream. An answer split across two chunks is not retrievable.' } },

  { post: 'context-length', before: { h2: 'Terms for the model\'s working memory' },
    diagram: { type: 'diagram',
      rows: [
        [{ label: 'Top of the window', detail: 'instructions and the passages that matter. Read carefully' }],
        [{ label: 'The deep middle', detail: 'skimmed. This is where answers go to die' }],
        [{ label: 'Bottom of the window', detail: 'the question itself. Read carefully' }],
      ],
      caption: 'A bigger window buys you room, not attention. Put what matters where the model actually looks.' } },

  { post: 'kv-cache', before: { h2: 'The cache, piece by piece' },
    diagram: { type: 'diagram',
      nodes: [
        { label: 'Prefill', detail: 'read the whole prompt once, slowly' },
        { label: 'Cache', detail: 'keep the work for every token so far' },
        { label: 'Decode', detail: 'each new token reuses the cache' },
        { label: 'Repeat', detail: 'fast, until the answer ends' },
      ],
      caption: 'The pause before the first word is the prefill. The quick stream after it is the cache paying off. Memory grows with every token you keep.' } },

  // ---------- Adaptation ----------
  { post: 'finetuning-or-rag', before: { h2: 'Terms for the two paths' },
    diagram: { type: 'diagram', title: 'Name the gap before you pick the tool',
      root: { label: 'What kind of "not good enough" is this?', color: 'purple', children: [
        { edge: 'it does not know something', node: {
          label: 'A knowledge gap', color: 'blue', children: [
            { edge: 'facts change, or live in documents', node: { label: 'Retrieval', color: 'green' } },
          ] } },
        { edge: 'it knows, but will not behave', node: {
          label: 'A behaviour gap', color: 'blue', children: [
            { edge: 'a prompt cannot pin it down', node: { label: 'Finetuning', color: 'yellow' } },
          ] } },
      ] },
      caption: 'The hour-long argument disappears once someone asks this question first. Using one tool on the other gap is the classic waste of weeks.' } },

  { post: 'domain-specific-models', before: { h2: 'When a general model is actually fine' },
    diagram: { type: 'diagram',
      rows: [
        [{ label: 'Feed it the right reference at question time', detail: 'cheapest rung, solves most cases' }],
        [{ label: 'Finetune a general model on your examples', detail: 'when the pattern is the problem' }],
        [{ label: 'Continued pretraining on domain text', detail: 'a real project' }],
        [{ label: 'Train from scratch', detail: 'almost never the right answer' }],
      ],
      caption: 'A ladder, not a jump. Each rung costs more than the one below it, so make the cheaper rung fail a real test before you climb.' } },

  { post: 'sft-vs-preference', before: { h2: 'The training stages, named' },
    diagram: { type: 'diagram',
      nodes: [
        { label: 'Pretrained model', detail: 'a strong autocomplete, not an assistant' },
        { label: 'Supervised finetuning', detail: 'imitate good answers: the shape' },
        { label: 'Preference tuning', detail: 'prefer what people picked: the taste' },
        { label: 'The chat model', detail: 'what you actually call' },
      ],
      caption: 'Two cheap passes after one enormous one. When a model feels helpful, that behaviour was trained in on purpose, after the heavy lifting was done.' } },

  { post: 'model-size', before: { h2: 'Size words that actually mean something' },
    diagram: { type: 'diagram', title: 'Does this task need the capacity?',
      root: { label: 'Start small, then ask what the evaluation says', color: 'purple', children: [
        { edge: 'it clears the bar', node: { label: 'Done. You just saved a fortune', color: 'green' } },
        { edge: 'it falls short', node: {
          label: 'Try a better prompt or retrieval first', color: 'blue', children: [
            { edge: 'now it clears', node: { label: 'Still done, still cheap', color: 'green' } },
            { edge: 'still short', node: { label: 'Move up one step, not to the largest', color: 'yellow' } },
          ] } },
      ] },
      caption: 'Bigger is a lever you pull deliberately when the task demands it, not the place a sensible team starts.' } },

  // ---------- Output and reasoning ----------
  { post: 'structured-outputs', before: { h2: 'Terms for taming output' },
    diagram: { type: 'diagram',
      nodes: [
        { label: 'Schema', detail: 'exactly which fields and types are allowed' },
        { label: 'Constrained decoding', detail: 'malformed output cannot be generated' },
        { label: 'Validate', detail: 'check it anyway, before anything acts' },
        { label: 'Retry or repair', detail: 'on the rare miss, instead of crashing' },
      ],
      caption: 'Stop asking nicely and start making the mess impossible. The last box is why a stray pleasantry never takes down the job again.' } },

  { post: 'chain-of-thought', before: { h2: 'The reasoning terms' },
    diagram: { type: 'diagram',
      rows: [
        [{ label: 'One shot', detail: 'question straight to answer. One giant leap, often wrong' }],
        [{ label: 'With room to work', detail: 'question, then steps, then answer' }],
        [{ label: 'Why it helps', detail: 'each step is a small local prediction the model is likely to get right' }],
      ],
      caption: 'Chain of thought does not give the model a new ability. It rearranges the problem so the hard part becomes many easy parts.' } },

  { post: 'test-time-compute', before: { h2: 'Names for thinking longer' },
    diagram: { type: 'diagram',
      rows: [
        [{ label: 'Depth', detail: 'one longer chain of reasoning before committing' }],
        [{ label: 'Breadth', detail: 'several independent attempts, then pick the best' }],
        [{ label: 'The trade', detail: 'better answers on hard problems, paid for in latency and tokens' }],
      ],
      caption: 'Two ways to spend the same budget, and they combine. Worth it where the problem is genuinely hard, wasteful on a lookup.' } },

  // ---------- Evaluation ----------
  { post: 'reading-benchmarks', before: { h2: 'Decoding the leaderboard labels' },
    diagram: { type: 'diagram', title: 'Should this score change your mind?',
      root: { label: 'A model posts an impressive benchmark number', color: 'purple', children: [
        { edge: 'does it measure your task?', node: {
          label: 'If not, it tells you almost nothing', color: 'yellow' } },
        { edge: 'is the gap large?', node: {
          label: 'Small gaps are noise. Treat near-ties as ties', color: 'yellow' } },
        { edge: 'could the test have leaked?', node: {
          label: 'Usually you cannot check. Assume some contamination', color: 'blue', children: [
            { edge: 'so', node: { label: 'Shortlist with it. Decide with your own private set', color: 'green' } },
          ] } },
      ] },
      caption: 'Three ways to be misled, stacked. None of them make benchmarks useless, and all of them make them a filter rather than a verdict.' } },

  { post: 'ai-as-a-judge', before: { h2: 'The judge\'s vocabulary' },
    diagram: { type: 'diagram', title: 'A judge you can actually trust',
      nodes: [
        { id: 'out', label: 'Model output', icon: 'datastore', at: [0, 0] },
        { id: 'rubric', label: 'Written rubric', icon: 'datastore', at: [0, 1] },
        { id: 'judge', label: 'Judge model', icon: 'model', at: [1, 0] },
        { id: 'score', label: 'Score', icon: 'datastore', at: [2, 0] },
        { id: 'human', label: 'Human sample', icon: 'user', at: [1, 1] },
      ],
      edges: [
        { from: 'out', to: 'judge' },
        { from: 'rubric', to: 'judge', route: 'vh' },
        { from: 'judge', to: 'score' },
        { from: 'human', to: 'judge', label: 'calibrate', route: 'vh' },
      ],
      caption: 'The calibration arrow is the one people skip. A judge nobody has checked against human grades is a second opinion wearing a lab coat.' } },

  { post: 'functional-correctness', before: { h2: 'Naming the testing ideas' },
    diagram: { type: 'diagram',
      nodes: [
        { label: 'Model writes code', detail: 'for a problem with a known answer' },
        { label: 'Sandbox', detail: 'isolated, no files, no network, no secrets' },
        { label: 'Run the tests', detail: 'including the boundary inputs' },
        { label: 'Pass rate', detail: 'a number, not an opinion' },
      ],
      caption: 'The sandbox is not optional. You are about to execute code no human has vetted, and "it is only a prime checker" is how a harness becomes an incident.' } },

  // ---------- Systems ----------
  { post: 'what-an-agent-is', before: { h2: 'What each piece is called' },
    diagram: { type: 'diagram', title: 'The whole engine',
      nodes: [
        { id: 'goal', label: 'Goal', icon: 'user', at: [0, 0] },
        { id: 'model', label: 'Model chooses', icon: 'model', at: [1, 0] },
        { id: 'tool', label: 'Your code runs it', icon: 'service', at: [2, 0] },
        { id: 'done', label: 'Answer', icon: 'user', at: [1, 1] },
      ],
      // Only the outbound edge is labelled. The renderer places a label at the
      // midpoint of its edge, so labelling both directions between the same
      // pair of nodes stacks the two texts on top of each other.
      edges: [
        { from: 'goal', to: 'model' },
        { from: 'model', to: 'tool', label: 'call a tool' },
        { from: 'tool', to: 'model' },
        { from: 'model', to: 'done', label: 'or stop', route: 'vh' },
      ],
      caption: 'The model picks an action, your code runs it, the result comes back, and the model decides again. Every extra turn around that loop is another decision that can be wrong with nobody watching.' } },

  { post: 'three-layers-ai-stack', before: { h2: 'Naming the three floors' },
    diagram: { type: 'diagram',
      rows: [
        [{ label: 'Application', detail: 'prompts, retrieval, interface, evaluation. Where most AI engineers work' }],
        [{ label: 'Model', detail: 'training or adapting the model itself' }],
        [{ label: 'Infrastructure', detail: 'compute, serving, the plumbing that makes it run' }],
      ],
      caption: 'You can build on the top floor while renting the two below, the same way a web developer never manufactures a server.' } },

  { post: 'ai-eng-vs-ml-eng', before: { h2: 'Vocabulary from both worlds' },
    diagram: { type: 'diagram',
      rows: [
        [{ label: 'Traditional ML', detail: 'collect data, engineer features, train, retrain when it drifts' }],
        [{ label: 'AI engineering', detail: 'pick a model, prompt it, add retrieval, evaluate, ship' }],
        [{ label: 'What carries over', detail: 'measure everything, distrust a demo' }],
      ],
      caption: 'Same goal, different work. One builds the engine, the other drives it, and the instinct worth keeping is the same in both.' } },

  { post: 'latency-throughput-cost', before: { h2: 'The three numbers, defined' },
    diagram: { type: 'diagram', title: 'Which number are you allowed to sacrifice?',
      root: { label: 'Is a human waiting on this answer right now?', color: 'purple', children: [
        { edge: 'yes', node: {
          label: 'Latency leads', color: 'blue', children: [
            { edge: 'the moves', node: { label: 'Smaller model, stream the answer, cache', color: 'green' } },
          ] } },
        { edge: 'no', node: {
          label: 'Throughput and cost lead', color: 'blue', children: [
            { edge: 'the moves', node: { label: 'Batch hard, pick the cheapest model that passes', color: 'green' } },
          ] } },
      ] },
      caption: 'One question sorts most of these decisions, because it tells you which of the three numbers you are allowed to give up.' } },

  // ---------- Data and language ----------
  { post: 'data-quality', before: { h2: 'Names for the ways data goes bad' },
    diagram: { type: 'diagram',
      nodes: [
        { label: 'Collect', detail: 'from real usage where you can' },
        { label: 'Read fifty by hand', detail: 'the step that finds the ruler' },
        { label: 'Deduplicate', detail: 'so a few loud items stop dominating' },
        { label: 'Fix labels', detail: 'a confident wrong target is worse than none' },
      ],
      caption: 'The second box is the one teams skip, and it is the one that catches the problems no aggregate metric will ever show you.' } },

  { post: 'multilingual-quality', before: { h2: 'Terms for the language gap' },
    diagram: { type: 'diagram',
      rows: [
        [{ label: 'Same sentence, two languages', detail: 'identical meaning' }],
        [{ label: 'Tokenizer', detail: 'trained mostly on English, so it packs English tightly' }],
        [{ label: 'What it costs', detail: 'more tokens means a bigger bill, less context, and a slower reply' }],
      ],
      caption: 'The quality gap and the cost gap have the same root. A user writing in a low-resource language pays more and waits longer for a worse answer.' } },
];

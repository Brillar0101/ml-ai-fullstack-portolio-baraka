export const POST = {
  id: 'context-vs-prompt-engineering',
  title: 'Your Prompt Never Changed. Your Context Did.',
  excerpt: 'A support agent that shined in the demo started giving worse answers in production, and nobody had touched the prompt. The window had quietly filled with junk. This is the difference between wording one instruction and managing everything the model reads.',
  category: 'AI',
  tags: ['Context Engineering', 'Prompting', 'Agents'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A small team ships a customer support agent. In the demo it looks great. You ask it about a refund policy, it pulls the right help doc, checks the order status through a tool, and answers in two clean sentences. Everyone in the room nods. Two weeks later the same agent is live, and the complaints start. It gives a partial answer, then a wrong one, then it confidently quotes a policy that was retired last year. The strange part is that nobody edited the prompt. The instructions the team wrote are byte for byte identical to the demo. So what broke?',
    },
    {
      type: 'p',
      text: 'What broke was everything else the model was reading. In the demo, the conversation was short and clean. In production, by the time a customer reaches their third question, the model is looking at a stuffed window: a dozen old tool results that are no longer relevant, five retrieved document chunks where only one matters, a long back and forth, and the system prompt buried somewhere near the top. The instruction did not degrade. The **surroundings** of the instruction did. That gap is the whole point of this post.',
    },
    {
      type: 'h2',
      text: 'Wording One Sentence vs Packing the Whole Box',
    },
    {
      type: 'p',
      text: 'Prompt engineering is the craft of writing a single instruction well. You pick clear verbs, you show an example or two, you tell the model to answer in JSON, you ask it to think step by step. That work is real and it still matters. But it treats the prompt as if it were the only thing the model sees, and in any serious agent it is not even close.',
    },
    {
      type: 'p',
      text: 'Here is a way to feel the difference. Imagine you hire a new support rep and hand them one sticky note that says "be helpful and accurate." That is a prompt. Now imagine you decide what sits on their desk while they work: which manuals are open, which past tickets they can see, what the account screen shows, how much of yesterday they still remember. That second job, deciding what information is in front of them at the moment they answer, is context engineering. The sticky note barely changes day to day. The desk changes with every single customer, and a cluttered desk produces worse answers even when the sticky note is perfect.',
    },
    {
      type: 'p',
      text: 'The reason this distinction gets missed is that a good prompt and a clean context look identical in a short demo. When there is almost nothing else in the window, the instruction is the context, so tuning the wording appears to be the entire job. That impression holds right up until the agent starts accumulating state across turns. At that point the wording is doing maybe a fifth of the work, and the arrangement of everything around it is doing the rest. Teams that only learned prompt engineering keep pulling the one lever they know, rewording the system prompt, while the actual damage is happening two layers down.',
    },
    {
      type: 'h2',
      text: 'Walking the Support Agent Failure Step by Step',
    },
    {
      type: 'p',
      text: 'Let us trace one production conversation. The customer opens with a shipping question. The agent calls a tracking tool, which returns a big JSON blob with fifty fields. That blob stays in the history. The customer then switches topics and asks about a refund. Now the agent retrieves four policy chunks from the knowledge base, but the search was loose, so two of them are about international orders that do not apply. The customer asks a third question. At this point the model is reading the original system prompt, the fifty field tracking blob it no longer needs, four policy chunks where two are noise, and the running transcript.',
    },
    {
      type: 'p',
      text: 'The model has to find the one relevant policy sentence inside all of that. Research on long inputs shows models are best at using information sitting at the very start or the very end of what they read, and they get noticeably worse at using facts stranded in the middle. The right policy chunk landed in the middle. So the agent reaches for the international rule that happened to sit near the end, and answers wrong. Nobody wrote a bad instruction. The team just let the window fill with material that pushed the important sentence into the model\'s blind spot.',
    },
    {
      type: 'terms',
      items: [
        { term: 'Context window', def: 'The fixed amount of text, measured in tokens, that a model can read at one time. Everything the model uses to produce its next answer has to fit inside this window, and once it is full, something has to be dropped or summarized.' },
        { term: 'Token', def: 'The unit models count in. Roughly a short word or a piece of a word. A window described as 200,000 tokens holds a large book, but a busy agent can still fill it with tool outputs and history faster than you expect.' },
        { term: 'System prompt', def: 'The standing instructions placed at the top of the window that define the agent\'s role, rules, and tone. It is written once and reused across every turn, which is exactly why it is not where your production problems usually hide.' },
        { term: 'Context engineering', def: 'The practice of deliberately choosing what goes into the window at each step, the system prompt, tool definitions, retrieved documents, memory, and history, and managing that limited space so the model reads the right things in the right places.' },
        { term: 'Token budget', def: 'A cap you set on how many tokens each part of the context is allowed to use, so that no single source, like verbose tool output, can crowd out the rest.' },
      ],
    },
    {
      type: 'h2',
      text: 'What Actually Sits in the Window',
    },
    {
      type: 'p',
      text: 'It helps to picture the window as a stack of layers, each competing for the same fixed space. When people say an agent "has a big context window," they often imagine one open field of instructions. In reality it is shared real estate, and every layer you add takes tokens away from the others.',
    },
    {
      type: 'image',
      src: '/blog-images/context/context-window.png',
      alt: 'What fills a context window: six system-internal layers on the left (system prompt, tools and MCP, knowledge base and RAG, skills, memory, guard rails) and two user-visible layers on the right (conversation, user prompt).',
      caption: 'What fills a context window. The left group is context the system assembles on your behalf; the right group is what the user actually sees and types. Prompt engineering only touches the right side. Context engineering owns the whole picture.',
    },
    {
      type: 'p',
      text: 'The two layers that cause most trouble are retrieved documents and conversation history, because both grow without anyone deciding they should. A retrieval step that returns five chunks feels harmless until you realize it runs on every turn. Tool outputs feel harmless until a single call dumps fifty JSON fields you will never read. The system prompt, which is where teams spend most of their tuning effort, is often the most stable and least guilty layer in the whole stack.',
    },
    {
      type: 'p',
      text: 'A bigger window does not rescue you here, and it is worth being blunt about why. Suppose you swap in a model with four times the context length. The stale tracking blob still sits in the history, the two irrelevant policy chunks still get retrieved, and the important sentence still lands in the middle where the model reads worst. You have not removed any noise. You have just given the noise more room to spread out, and you are paying for every token of it on every turn. Space buys you time before the window overflows. It does nothing about relevance, and relevance is what decides the answer.',
    },
    {
      type: 'p',
      text: 'So the real lever is neither a longer window nor a more clever prompt. It is deciding, on purpose, what goes into the window on each call and what stays out. That discipline is context engineering, and it is a different job from prompt engineering. Prompt engineering perfects the one instruction you write. Context engineering curates everything the model reads around that instruction: the system prompt, the tools, the retrieved passages, the memory, the history. The mechanics of trimming and summarizing to fit a token budget are their own topic, but the mindset is the point here. Stop treating the window as something that fills itself, and start treating it as something you assemble, where every token earns its place. Once you see the window as a budget you own rather than a bucket that overflows, most of the reliability problems in the support agent stop being mysteries and become choices.',
    },
    {
      type: 'callout',
      title: 'The one habit that prevents most of this',
      text: 'Log the full assembled context for a handful of real production turns and read it as if you were the model. You will almost always find stale tool output, duplicate chunks, or the key fact stranded in the middle. You cannot fix a window you never look at.',
    },
    {
      type: 'h2',
      text: 'The Mistakes That Turn a Good Demo Into a Bad Product',
    },
    {
      type: 'p',
      text: 'Most context failures come from a short list of habits, and once you know them you start seeing them everywhere.',
    },
    {
      type: 'ul',
      items: [
        'Keeping every tool output forever. A tracking call from ten turns ago is dead weight. Drop or summarize results once they have been used.',
        'Retrieving more than you need. Five chunks feels safe, but two good ones beat five where three are noise. More retrieval is not more accuracy.',
        'Trusting the middle of a long window. Put the most important material near the start or the end, and never assume a buried fact will be used.',
        'Confusing a bigger window with a solved problem. A 200,000 token window still degrades when it is full of junk. Space is not the same as relevance.',
        'Tuning only the system prompt. When answers get worse in production, the prompt is usually the last thing that changed. Look at the layers that grow on their own.',
      ],
    },
    {
      type: 'h2',
      text: 'What to Carry Away From the Broken Support Agent',
    },
    {
      type: 'p',
      text: 'Prompt engineering asks whether you said the right thing. Context engineering asks whether the model can find the right thing among everything it is reading. In a one shot chat those two questions collapse into one, which is why prompting alone feels sufficient at first. In an agent that runs many turns, calls tools, and retrieves documents, they split apart, and the second question becomes the one that decides whether the thing works in production. The skill you are building is not better phrasing. It is a sense for what belongs in the window right now and what should have been dropped three turns ago.',
    },
    {
      type: 'p',
      text: 'So when your agent shines in the demo and stumbles two weeks later, resist the urge to rewrite the instruction. Read the assembled window instead. Trim the stale tool outputs, rank the retrieval down to what matters, summarize the old turns, and set a budget so no layer can bully the rest. The prompt was probably fine all along. The desk just got too cluttered to work at.',
    },
    {
      type: 'sources',
      items: [
        { title: 'Anthropic, Effective context engineering for AI agents', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents' },
        { title: 'Liu et al., Lost in the Middle: How Language Models Use Long Contexts (arXiv:2307.03172)', url: 'https://arxiv.org/abs/2307.03172' },
      ],
    },
  ],
};

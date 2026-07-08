export const POST = {
  id: 'levels-of-agentic-autonomy',
  title: 'Five Levels of Agentic Autonomy, and Why You Should Stop Climbing Early',
  excerpt: 'A support team kept handing their bot more freedom until it started making refund promises nobody could trace. Here is the ladder they climbed, one rung at a time, and the exact rung where they should have stopped.',
  category: 'AI',
  tags: ['Agents', 'Autonomy', 'Design'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A small team at a company I will call Maple ran a support bot named Otto. In its first week Otto did one thing. A customer typed a question, Otto sent the whole thing to a language model with a friendly system prompt, and the model wrote back an answer. That was the entire product. It worked, people liked it, and the numbers were boring in the good way. Six months later Otto could look up your order, decide whether to open a refund, message the warehouse, and hand tricky cases to a second bot that specialized in shipping disputes. It was far more capable. It was also far harder to trust, because when Otto promised a customer a refund that never arrived, nobody on the team could say exactly why it had made that promise.'
    },
    {
      type: 'p',
      text: 'That gap between the two Ottos is what this post is about. Between a plain model call and a self-directing system there is a ladder, and each rung hands the software a little more freedom to decide what happens next. Climbing feels like progress because every rung really does unlock new behavior. The catch is that every rung also makes the thing behave in ways you did not spell out, which means harder debugging and lower predictability. The skill is knowing which rung your problem actually needs and refusing to climb past it.'
    },
    {
      type: 'h2',
      text: 'Autonomy is just who decides what happens next'
    },
    {
      type: 'p',
      text: 'Before the ladder, one plain idea. **Autonomy** is the share of decisions the software makes on its own instead of you making them in advance. When you wire up a fixed sequence of steps, you decided the steps; the machine only fills in the blanks. When the machine chooses its own next step at runtime, it decided, and you find out afterward by reading a log. More autonomy means the system can handle cases you never anticipated. It also means the system can fail in ways you never anticipated. Those two sentences are the same sentence wearing different clothes, and holding both in your head at once is the whole game.'
    },
    {
      type: 'p',
      text: 'Here is the ladder Otto climbed, drawn as five layers. Read it from the bottom up, from the least freedom to the most.'
    },
    {
      type: 'diagram',
      rows: [
        [{ label: 'Level 5: Autonomous multi-agent', detail: 'Plans, delegates to other agents, self-corrects. Hardest to trust.' }],
        [{ label: 'Level 4: Tool-using agent loop', detail: 'Picks its own steps in a loop until done. ReAct-style.' }],
        [{ label: 'Level 3: Router', detail: 'Model picks one of a few branches you defined. Then a fixed path runs.' }],
        [{ label: 'Level 2: Fixed chain', detail: 'You wired the steps. Model fills blanks. Same shape every time.' }],
        [{ label: 'Level 1: Single model call', detail: 'Text in, text out. No tools, no memory, no branching.' }]
      ],
      caption: 'Each layer up adds one power: branching, then looping, then delegation. Each layer up also removes one guarantee about what the system will do.'
    },
    {
      type: 'p',
      text: 'Let me walk Otto up these five rungs, because the failure modes only make sense once you see what each level buys.'
    },
    {
      type: 'h2',
      text: 'Level 1 and 2: the model as a component you control'
    },
    {
      type: 'p',
      text: 'At **level one**, Otto is a single model call. Question goes in, answer comes out. There are no tools, so Otto cannot look anything up. It can explain your return policy from the prompt, but ask it about your specific order and it will either guess or admit it does not know. The failure mode is confident nonsense, since the model has no way to check itself against real data. What you get in return is total predictability. The same input gives roughly the same output, and there is nothing to debug except the prompt. Stay here when the task is pure text work: summarize this, rephrase that, classify this ticket. Reaching for anything fancier is wasted motion.'
    },
    {
      type: 'p',
      text: '**Level two** is a fixed chain, and it is where most useful software actually lives. You, the developer, wire a sequence of steps. Otto first calls the model to pull the order number out of the message, then runs a database lookup, then calls the model again to write a reply using what it found. The model is doing real work, but it never chooses the shape of the flow. The steps run in the same order every time. When something breaks you can point at the exact step, because there are only three of them and you wrote all three. Below is roughly what that chain looks like.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'Level 2: a fixed chain the developer wired',
      code: `def handle_ticket(message):
    # Step 1: model pulls structured data out of free text
    order_id = model_extract(message, field="order_id")

    # Step 2: a plain function does the lookup, no model involved
    order = db.get_order(order_id)

    # Step 3: model writes a reply using the facts we fetched
    reply = model_reply(
        question=message,
        facts=order,
    )
    return reply

# The path is fixed. Same three steps, same order, every time.`
    },
    {
      type: 'p',
      text: 'Notice what you can promise about this code. It always does the lookup. It never messages the warehouse, because there is no line that does. If it misbehaves, the bug is in one of three named places. That predictability is not a limitation you tolerate; it is the feature you are paying for.'
    },
    {
      type: 'h2',
      text: 'Level 3: letting the model pick a lane'
    },
    {
      type: 'p',
      text: 'Maple soon noticed Otto was answering three very different kinds of message with one stiff flow. Refund questions, shipping delays, and account logins each wanted a different path. So they added a **router**. Now the first model call reads the message and picks a category, and that category selects one of three prewritten flows. Each flow is still a level-two chain that the team built by hand. The only new freedom is the choice of which chain to run.'
    },
    {
      type: 'p',
      text: 'This is a real jump in autonomy but a small one, and that is what makes it safe. The model decides the branch, yet every branch is a road you already paved. The classic failure here is misrouting. A refund complaint written in polite language gets read as a general question and lands in the wrong flow. You catch that by logging the chosen category and checking how often it is wrong, which is easy because a router only ever picks from a short list you defined. Level three is the right home for problems that split cleanly into a handful of known cases. If you can name the branches, a router will serve you well and stay debuggable.'
    },
    {
      type: 'h2',
      text: 'Level 4: the agent loop, where the shape stops being yours'
    },
    {
      type: 'p',
      text: 'Then came the request that pushed Otto up a real rung. Customers asked things that needed several lookups in an order nobody could predict. Check the order, then the shipment, then the carrier, then maybe issue a credit, and the right sequence depends on what each step turns up. You cannot pre-wire that, because the path changes with the data. So Maple gave Otto a set of tools and a loop. Now the model looks at what it knows, decides which tool to call, reads the result, and decides again, over and over, until it thinks the job is done. This is the pattern the ReAct paper described: the model reasons about its situation, takes an action, observes the outcome, and repeats.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'Level 4: the agent decides its own steps in a loop',
      code: `def agent_loop(message, tools, max_steps=8):
    history = [message]
    for _ in range(max_steps):
        # Model reads history and decides: call a tool, or stop.
        decision = model_decide(history, tools)

        if decision.type == "final":
            return decision.answer

        # The model chose the tool AND the arguments.
        result = tools[decision.name](**decision.args)
        history.append(result)

    # We never guaranteed it would finish. So we cap it.
    return "Escalating to a human."`
    },
    {
      type: 'p',
      text: 'Read that loop next to the level-two chain and the difference is stark. In the chain, you wrote the steps. Here you wrote the tools and the model writes the steps, fresh, every single run. That is the power: Otto can now handle a case you never sat down and designed. That is also the danger. You cannot promise the order of operations, you cannot promise it will stop, and you cannot promise it will not call a tool at a strange moment. The `max_steps` cap exists precisely because a loop with no guaranteed exit is a loop that can spin forever or burn through your API budget chasing its own tail.'
    },
    {
      type: 'callout',
      title: 'The cost of the loop is paid in reliability',
      text: 'Otto\'s worst incident happened at level four. It read a stale shipment record, concluded the package was lost, and called the refund tool on an order that had actually been delivered. No single line was buggy. The model simply chose a reasonable-looking action from bad information, and because the sequence was invented at runtime, no one had reviewed that exact path before a customer hit it.'
    },
    {
      type: 'h2',
      text: 'Level 5: agents that hire other agents'
    },
    {
      type: 'p',
      text: 'The top rung is a system that plans a task, splits it into pieces, hands each piece to a separate agent, and stitches the results back together, correcting itself when a piece comes back wrong. Maple pictured a manager Otto that would delegate shipping questions to a shipping specialist and billing questions to a billing specialist. This is where the word **orchestration** shows up: the coordination logic that decides which agent handles what, in what order, and how their outputs combine.'
    },
    {
      type: 'p',
      text: 'Level five multiplies both the capability and the confusion. Every agent in the group has its own loop with its own unpredictability, and now they talk to each other, so a wrong turn in one can quietly steer another. Debugging means reconstructing a conversation among several non-deterministic parts, each of which ran a path you never wrote. Most teams that reach for level five discover their real problem fit at level three or four, and the extra machinery just added ways to fail. Genuine multi-agent need is rarer than it looks. It shows up when subtasks are truly independent and each needs its own specialized context, not when a single well-equipped loop would have done the job.'
    },
    {
      type: 'h2',
      text: 'Agent, workflow, and the line between them'
    },
    {
      type: 'p',
      text: 'The vocabulary matters here because people use these words loosely and then argue past each other. The cleanest split, and the one Anthropic uses in its writing on effective agents, is about who controls the path.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Agent', def: 'A system where the model decides its own next step at runtime, usually by calling tools in a loop, until it judges the task complete. Levels 4 and 5 are agents.' },
        { term: 'Autonomy', def: 'How much of the control flow the software chooses on its own versus how much you fixed in advance. It rises with every rung of the ladder.' },
        { term: 'Workflow vs agent', def: 'A workflow follows a path you wired ahead of time; the model only fills in the blanks (levels 2 and 3). An agent picks the path itself as it runs (level 4 up). Same models, different control.' },
        { term: 'Orchestration', def: 'The coordination layer that routes work between multiple agents or steps and combines their results. It is what turns a pile of agents into a level-5 system.' }
      ]
    },
    {
      type: 'h2',
      text: 'The mistakes teams make on the ladder'
    },
    {
      type: 'p',
      text: 'The first mistake is climbing for the wrong reason. Teams reach for an agent loop because it sounds modern, when a fixed chain would have solved the task and stayed debuggable. If you can draw the steps on a whiteboard and they do not change with the data, you want a workflow, not an agent. The second mistake is skipping the cheap guardrails at the higher rungs: no step cap, no logging of which tool was called and why, no human handoff when confidence drops. At level four these are not optional extras; they are the only thing standing between you and Otto\'s refund incident.'
    },
    {
      type: 'p',
      text: 'The third and quietest mistake is never climbing back down. Otto reached level four for one genuinely hard category of question and then, for tidiness, the team ran every question through the same loop, including the simple ones a level-two chain had handled perfectly. They traded predictability they had for flexibility they did not need. When they finally routed easy questions back to fixed chains and reserved the loop for the messy cases, their error rate dropped and their on-call nights got quieter.'
    },
    {
      type: 'p',
      text: 'So the takeaway is a question you ask before you build, not after. What is the lowest rung that solves this task? Start there. Climb only when a real requirement forces you up, and when you do climb, add the logging and the caps on the way. Higher autonomy is a tool with a price, and the price is your ability to know what your system will do. Pay it on purpose, for the tasks that need it, and let everything else sit lower on the ladder where you can still see the whole path.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Anthropic, Building Effective Agents', url: 'https://www.anthropic.com/engineering/building-effective-agents' },
        { title: 'Yao et al., ReAct: Synergizing Reasoning and Acting in Language Models (arXiv:2210.03629)', url: 'https://arxiv.org/abs/2210.03629' }
      ]
    }
  ]
};

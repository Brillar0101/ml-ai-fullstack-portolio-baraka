export const POST = {
  id: 'multi-agent-orchestration',
  title: 'Four Ways to Wire Agents Together in a Document Pipeline',
  excerpt: 'A stack of scanned invoices needs reading, checking, and reformatting. One agent choking on all three is why you split the work. The shape you pick for that split decides what breaks.',
  category: 'AI',
  tags: ['Agents', 'Multi-Agent', 'Orchestration'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A finance team drops a folder of 400 scanned documents on you every morning. Some are invoices, some are contracts, a few are handwritten receipts. The job is to pull the numbers out, flag anything that looks wrong, and hand back a clean spreadsheet. You build a single agent with a giant prompt that tries to read, analyze, and format all at once. It works on the easy files and falls apart on the messy ones. The prompt is so crowded that the model forgets to check totals when the layout is unusual, and it invents a currency when the receipt is blurry. You are not going to fix this by writing a bigger prompt. You fix it by splitting the work across several agents and deciding how they talk to each other.'
    },
    {
      type: 'p',
      text: 'That decision, how the agents connect and pass work between them, is what people mean by **orchestration**. There are a handful of common shapes, and each one trades speed, control, and failure behavior differently. This post walks through four of them using that document pipeline as the running example, so you can feel why you would reach for one over another.'
    },
    {
      type: 'h2',
      text: 'Why one agent buckles and several do not'
    },
    {
      type: 'p',
      text: 'Here is the intuition before any diagrams. A language model does its best work when the task in front of it is narrow and the instructions are short. Reading a scanned invoice is a different skill from judging whether a contract clause is risky, which is different again from producing tidy JSON. Cram all three into one prompt and the model spreads its attention thin. Split them into three agents, each with a focused prompt and its own examples, and every agent gets to be good at one thing. The catch is that these agents now have to coordinate. Someone has to decide who does what, in what order, and how results come back together. That coordination is the orchestration pattern, and the four shapes below are the ones you will meet most often.'
    },
    {
      type: 'h2',
      text: 'A manager that routes work and collects the answers'
    },
    {
      type: 'p',
      text: 'Start with the shape that maps most cleanly onto how a human team works. You appoint one agent as the manager. It does not read invoices or judge contracts itself. It looks at each incoming document, decides which specialist should handle it, sends the work over, and gathers what comes back. In our pipeline the manager sees a scanned file, notices it is an invoice, and hands it to the extraction specialist. When the numbers come back, it passes them to the analysis specialist to check for errors, then to the formatting specialist to shape the final row. The manager owns the flow. The specialists just answer the narrow question they are handed.'
    },
    {
      type: 'diagram',
      title: 'Supervisor routing a document to three specialists and merging their output',
      nodes: [
        { id: 'doc', label: 'Scanned document', icon: 'datastore', at: [0, 1] },
        { id: 'sup', label: 'Supervisor', icon: 'service', at: [1, 1] },
        { id: 'ext', label: 'Extraction agent', icon: 'model', at: [3, 0] },
        { id: 'ana', label: 'Analysis agent', icon: 'model', at: [3, 1] },
        { id: 'fmt', label: 'Formatting agent', icon: 'model', at: [3, 2] },
        { id: 'out', label: 'Clean spreadsheet row', icon: 'datastore', at: [5, 1] }
      ],
      edges: [
        { from: 'doc', to: 'sup', label: 'arrives' },
        { from: 'sup', to: 'ext', label: 'route + await' },
        { from: 'ext', to: 'sup', label: 'fields' },
        { from: 'sup', to: 'ana', label: 'route + await' },
        { from: 'ana', to: 'sup', label: 'flags' },
        { from: 'sup', to: 'fmt', label: 'route + await' },
        { from: 'fmt', to: 'sup', label: 'row' },
        { from: 'sup', to: 'out', label: 'merge' }
      ],
      caption: 'The supervisor is the only node that talks to every worker. Each worker answers one narrow question and returns.'
    },
    {
      type: 'p',
      text: 'This is good when the work is varied and the right next step depends on what the last step produced. The manager can look at a low confidence extraction and decide to send it back for a second pass, or skip analysis for a document type that never needs it. You get a single place that holds the logic, which makes the system easy to reason about and easy to change. The failure mode is that the manager becomes a bottleneck and a single point of trouble. If its routing prompt is vague, every document gets misrouted. And because everything funnels through it, the manager can grow its own crowded prompt, which is the exact problem you were trying to escape.'
    },
    {
      type: 'p',
      text: 'A sketch of a manager makes the shape concrete. Notice that the manager holds no document logic of its own. It picks a worker, calls it, and folds the result into a growing record.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'A supervisor that dispatches to workers and merges results',
      code: `def supervise(document):
    workers = {
        "extract": extraction_agent,
        "analyze": analysis_agent,
        "format": formatting_agent,
    }
    # Fixed plan here; a smarter supervisor would pick steps per document.
    plan = ["extract", "analyze", "format"]
    record = {"source": document.name}

    for step in plan:
        worker = workers[step]
        result = worker(document, context=record)  # hand off with shared context
        if result.get("error"):
            record["status"] = f"failed at {step}"
            return record
        record.update(result["data"])  # merge into the shared record

    record["status"] = "done"
    return record`
    },
    {
      type: 'h2',
      text: 'A fixed assembly line when the order never changes'
    },
    {
      type: 'p',
      text: 'Sometimes you do not need a manager making choices, because the order is always the same. Every document gets extracted, then analyzed, then formatted, full stop. In that case you can wire the agents into a straight line. The output of extraction becomes the input to analysis, whose output becomes the input to formatting. No central brain decides anything. Each agent knows only its next neighbor.'
    },
    {
      type: 'diagram',
      nodes: [
        { label: 'Extraction agent', detail: 'reads raw fields off the scan' },
        { label: 'Analysis agent', detail: 'checks totals and flags anomalies' },
        { label: 'Formatting agent', detail: 'shapes the final spreadsheet row' }
      ],
      caption: 'A sequential pipeline. Each stage transforms the previous stage output and passes it forward.'
    },
    {
      type: 'p',
      text: 'This shape is simple and predictable, which is its whole appeal. It is easy to test each stage in isolation and easy to trace where a bad row came from. It fits any process where the steps genuinely have to happen in a set order, since analysis cannot check numbers that extraction has not pulled yet. The weakness is rigidity. If one stage returns garbage, that garbage flows downstream and every later stage does careful work on nonsense. There is no manager watching to catch it and reroute. A blurry receipt that extraction guesses at will sail through analysis and land in your spreadsheet looking perfectly clean and being completely wrong.'
    },
    {
      type: 'h2',
      text: 'Splitting the load and joining it back'
    },
    {
      type: 'p',
      text: 'Now change the problem slightly. Instead of one document that needs three sequential steps, you have 400 documents that each need the same single extraction. Running them one after another is slow. So you fan out. You launch many copies of the extraction agent at once, give each one a document, and let them run in parallel. When they all finish, a join step collects every result and stitches them into one spreadsheet. The pattern is fan-out to spread the work, then join to bring it back together.'
    },
    {
      type: 'p',
      text: 'This is the right shape when the pieces of work are independent, meaning no document needs to know anything about another. You cut wall clock time roughly by however many workers you run at once. The failure modes are specific to going wide. One slow worker holds up the join if you wait for all of them, so you need a timeout and a plan for stragglers. Costs spike because you are running many model calls at the same instant. And partial failure gets awkward: if 397 workers succeed and 3 fail, you have to decide whether to ship a partial spreadsheet, retry the three, or block the whole batch. None of those are wrong, but you have to choose on purpose rather than discover it in production.'
    },
    {
      type: 'h2',
      text: 'A shared whiteboard the agents all write on'
    },
    {
      type: 'p',
      text: 'The last shape drops the idea of fixed handoffs entirely. Picture a whiteboard in a room. Any agent can walk up, read what is written, add its own findings, and step back. The extraction agent posts the raw fields it pulled. The analysis agent, watching the board, sees new fields appear and writes a flag next to a total that does not add up. A currency specialist notices a missing currency and fills it in. No agent calls another directly. They react to the shared state as it changes. This is the blackboard pattern, named after the whiteboard picture, and it shines on messy problems where you cannot know in advance which specialists a given document will need.'
    },
    {
      type: 'p',
      text: 'The strength is flexibility. You can add a new specialist just by giving it read and write access to the board, without rewiring anyone else. The cost is that shared mutable state is hard to keep sane. Two agents can write conflicting values into the same cell. An agent can loop forever reacting to its own edits. And when something goes wrong, there is no clean handoff trail to follow, just a board that ended up in a strange state. Blackboard systems buy you flexibility and charge you in debuggability, so reach for them when the problem really is open ended and not before.'
    },
    {
      type: 'h2',
      text: 'The two things that actually make these work'
    },
    {
      type: 'p',
      text: 'Across all four shapes, two ideas decide whether your system holds together. The first is shared context. When the supervisor hands a document to the analysis agent, the analysis agent needs to know what extraction already found, otherwise it starts blind. Passing along the right slice of accumulated context, and no more, is most of the craft. The second is the handoff contract. Every agent should agree on the exact shape of what it receives and what it returns. If extraction promises a field called total as a number and analysis expects a string called amount, the pipeline breaks in a way no prompt tweak will fix. Nail the contract first and the wiring becomes almost boring, which is exactly what you want from plumbing.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Orchestrator / supervisor', def: 'The agent that owns the flow. It decides which specialist handles each piece of work, sends it over, and combines what comes back. It usually does no domain work itself.' },
        { term: 'Worker / specialist', def: 'An agent with a narrow job and a focused prompt, like extracting fields or checking totals. It answers one kind of question and returns, rather than driving the overall process.' },
        { term: 'Handoff', def: 'The moment one agent passes work to another, along with the agreed shape of the data and the slice of context the receiver needs to act.' },
        { term: 'Shared state / blackboard', def: 'A common workspace that agents read from and write to. Instead of calling each other directly, they react to changes on the shared board.' }
      ]
    },
    {
      type: 'callout',
      title: 'Common mistakes',
      text: 'Reaching for the blackboard pattern when a plain sequential pipeline would do, because flexibility feels safer than it is. Letting the supervisor prompt swell until it is the crowded monolith you started with. Fanning out without a timeout, so one stuck worker freezes the whole join. And skipping a written handoff contract, then spending an afternoon on a bug that was really just total versus amount.'
    },
    {
      type: 'p',
      text: 'The takeaway is that orchestration is a design choice, not a default. Pick the assembly line when the order is fixed and the steps are stable. Pick the supervisor when the next step depends on the last result and you want one clear place for the logic. Fan out and join when the work is independent and slow. Reach for the blackboard only when the problem is genuinely open ended and you accept the debugging tax that comes with it. Whichever you choose, spend your care on shared context and handoff contracts, because those are what separate a system that scales from one that quietly corrupts every hundredth row.'
    },
    {
      type: 'sources',
      items: [
        { title: 'LangGraph: Multi-agent systems', url: 'https://langchain-ai.github.io/langgraph/concepts/multi_agent/' },
        { title: 'Anthropic: Building effective agents', url: 'https://www.anthropic.com/engineering/building-effective-agents' },
        { title: 'Microsoft AutoGen: Multi-agent orchestration patterns', url: 'https://microsoft.github.io/autogen/stable/user-guide/core-user-guide/design-patterns/index.html' }
      ]
    }
  ]
};

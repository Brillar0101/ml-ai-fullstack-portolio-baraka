export const POST = {
  id: 'agent-deployment',
  title: 'The Night an Agent Looped Until Morning: Deploying Agents That Can Act',
  excerpt: 'A chatbot answers and stops. An agent keeps going, calls tools, and can loop forever. Here is what breaks when you push one to production, told through an agent that ran up a bill overnight.',
  category: 'AI',
  tags: ['Agents', 'Deployment', 'Production'],
  body: [
    { type: 'p', text: 'Picture a team shipping their first real agent on a Thursday. It works all week in testing. It read support tickets, looked up order records, and drafted replies, and every demo run finished in under a minute.' },
      { type: 'p', text: 'They set it to process the overnight queue and went home. By Friday morning the agent had made close to forty thousand tool calls against the same three tickets, and the API bill for that one night was larger than the entire month before it. Nothing had crashed. No error was thrown. The agent had simply decided it was not done yet, over and over, until someone woke up and killed the process.' },
    { type: 'p', text: 'That gap between "works in the demo" and "safe to leave running" is the whole story of putting an agent into production. A chatbot is a much simpler thing to deploy. You send it a message, it sends text back, and it forgets everything.' },
      { type: 'p', text: 'If it says something wrong, the damage is a bad sentence on a screen. An agent is a different animal, because it does not just talk. It acts, it keeps state across many steps, it runs for minutes or hours instead of seconds, and it can loop. Every one of those properties is useful, and every one of them is a new way to get hurt.' },
    {
      type: 'h2',
      text: 'Why an agent that acts breaks the chatbot playbook'
    },
    { type: 'p', text: 'Think about the difference in plain terms. A chatbot is a vending machine. One request in, one snack out, transaction closed.' },
      { type: 'p', text: 'An agent is more like a temp worker you hand a task to and leave alone. It reads the task, decides on a first move, does it, looks at the result, decides on a second move, and repeats until it thinks the job is finished. That loop is what makes agents powerful. It is also what makes them unpredictable, because you are no longer approving each action. You approved a goal, and the agent is choosing the steps.' },
    { type: 'p', text: 'Once you accept that an agent chooses its own steps, the production worries almost write themselves. What happens if the process restarts halfway through a long task? What happens when a step is risky, like sending a refund or deleting a record?' },
      { type: 'p', text: 'What stops the agent from looping forever, as it did that Thursday night? Who pays when it calls a paid tool ten thousand times? What is the blast radius if a tool it runs does something dangerous?' },
      { type: 'p', text: 'And when it does misbehave, can you even see what it did, step by step? Each question maps to a guardrail. Let us walk through the incident and add them one at a time.' },
    {
      type: 'h2',
      text: 'Walking the overnight run in slow motion'
    },
    { type: 'p', text: 'The overnight agent had a goal that read something like "resolve every open ticket in the queue." For most tickets it worked fine. It hit trouble on a ticket where the customer record could not be found. The agent called the lookup tool, got back an empty result, reasoned that maybe it used the wrong ID, and called the lookup tool again with a slightly different guess. That failed too.' },
      { type: 'p', text: 'So it tried again. There was no rule telling it when to stop trying, and no memory that it had already asked this exact question forty times. Each attempt looked, to the agent, like a fresh reasonable idea. The loop had no floor.' },
    { type: 'p', text: 'Notice what was missing. There was no cap on how many steps a single task could take. There was no ceiling on spend. There was no human standing between the agent and the paid tool.' },
      { type: 'p', text: 'And because the team had no per-step logging, the first sign of trouble was the billing dashboard, not an alert. The agent was not broken. It was doing exactly what an unbounded loop does. The fix is not a smarter model. The fix is a set of limits that live outside the model, in the runtime around it.' },
    {
      type: 'terms',
      items: [
        { term: 'Step / loop limit', def: 'A hard cap on how many actions an agent may take for one task, enforced by the runtime, not the model. When the count is hit the task stops even if the agent thinks it has more to do. This is the seatbelt against runaway loops.' },
        { term: 'Durable execution', def: 'A way of running long tasks so that each completed step is saved. If the process crashes or restarts, the task resumes from the last saved step instead of starting over or losing its place.' },
        { term: 'Human-in-the-loop', def: 'A checkpoint where the agent pauses before a risky action and waits for a person to approve or reject it, instead of acting on its own.' },
        { term: 'Sandboxing', def: 'Running the code and tools an agent invokes inside a locked-down environment with limited permissions, so a bad or hijacked call cannot touch anything outside a small, controlled box.' }
      ]
    },
    {
      type: 'h2',
      text: 'The runtime that should have been around the agent'
    },
    { type: 'p', text: 'The right picture for a production agent is not a model calling tools directly. It is a runtime with defenses at each stage. Work arrives on a queue instead of running inline, so a flood of tasks lines up rather than piling onto one overloaded process.' },
      { type: 'p', text: 'A worker pulls one task and runs the agent loop with a step limit wrapped around it. Before any action tagged as risky, the worker stops and asks a human. Tools run inside a sandbox with tight permissions. And after every step, the worker writes the state to a store, so a restart picks up where it left off instead of losing the thread.' },
    {
      type: 'diagram',
      title: 'A production agent runtime',
      nodes: [
        { id: 'queue', label: 'Task queue', icon: 'datastore', at: [0, 0] },
        { id: 'worker', label: 'Agent worker (step limit + approval gate)', icon: 'service', at: [1, 0] },
        { id: 'tools', label: 'Sandboxed tools', icon: 'service', at: [2, 0] },
        { id: 'store', label: 'State store', icon: 'datastore', at: [1, 1] },
        { id: 'human', label: 'Human approver', icon: 'user', at: [2, 1] }
      ],
      edges: [
        { from: 'queue', to: 'worker', label: 'pull one task' },
        { from: 'worker', to: 'tools', label: 'call (capped)' },
        { from: 'tools', to: 'worker', label: 'result' },
        { from: 'worker', to: 'store', label: 'save each step' },
        { from: 'worker', to: 'human', label: 'risky action?' }
      ],
      caption: 'Tasks queue up, a worker runs the loop under a step cap, risky actions wait for a person, tools run sandboxed, and every step is saved so a restart can resume.'
    },
    {
      type: 'p',
      text: 'Two of those defenses would have stopped the overnight bill on their own. A step limit would have halted the task at, say, twenty five actions instead of forty thousand. A spend ceiling would have tripped long before morning. Let us make the step cap and the approval checkpoint concrete, because they are the two you should add first, and they are small.'
    },
    { type: 'lab', height: 460,
        title: 'An agent loop with a step cap and an approval checkpoint',
        caption: 'Three days for the same agent. The rejected run finishes cleanly without paying, because refusing an action is a normal outcome the loop absorbs rather than a crash. The runaway run stops itself, and both leave checkpoints you can read afterwards.',
        code: `# An agent loop with the three guardrails that decide
# how bad a bad day gets: a step cap, an approval gate
# on anything destructive, and state saved each step.

class StepLimitReached(Exception):
    pass

RISKY = {"issue_refund", "send_email", "delete_record"}

TOOLS = {
    "get_order": lambda oid: {"id": oid, "st": "late"},
    "issue_refund":
        lambda oid, amount: "refunded %.2f" % amount,
}

PLANS = {
    "normal": [
        ("get_order", {"oid": "4417"}),
        ("issue_refund", {"oid": "4417", "amount": 42.0}),
        ("finish", {}),
    ],
    "runaway": [("get_order", {"oid": "4417"})] * 12,
}

SAVED = []   # stands in for durable storage

def run_agent(plan, approve, max_steps=6):
    history = []
    for step in range(max_steps):
        if step >= len(plan):
            break
        name, args = plan[step]
        if name == "finish":
            return "done", history
        if name in RISKY and not approve(name):
            history.append(("blocked", name))
            SAVED.append(list(history))
            continue
        history.append((name, TOOLS[name](**args)))
        SAVED.append(list(history))   # persist each step
    raise StepLimitReached("stopped at %d steps"
                           % max_steps)

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, BAD = E + "[32m", E + "[33m", E + "[31m"
note = lambda s: print(DIM + s + OFF)

CASES = [
    ("approved", "normal", lambda n: True),
    ("rejected", "normal", lambda n: False),
    ("runaway", "runaway", lambda n: True),
]

hdr = BOLD + "GUARDRAILS" + OFF
print(hdr + "  same agent, three days")
note("-" * 54)
note("%-10s %-18s %s" % ("RUN", "OUTCOME", "REFUNDED"))

for label, plan_name, approve in CASES:
    SAVED.clear()
    try:
        plan = PLANS[plan_name]
        result, history = run_agent(plan, approve)
        outcome, colour = "finished", OK
    except StepLimitReached as e:
        history, outcome = [], "hit the step cap"
        colour = WARN
    paid = any(n == "issue_refund" for n, _ in history)
    pc = BAD if paid else OK
    print("%-10s %s%-18s%s %s%s%s"
          % (label, colour, outcome, OFF,
             pc, "yes" if paid else "no", OFF))

note("-" * 54)
SAVED.clear()
try:
    run_agent(PLANS["runaway"], lambda n: True)
except StepLimitReached:
    pass
ac = BOLD + "AFTER A CRASH" + OFF
print(ac + "  %d checkpoints saved," % len(SAVED))
print("               so the work is not lost and the")
print("               agent does not start over")

print()
note("The rejected run finishes cleanly without")
note("paying. Refusing an action is a normal outcome")
note("the loop absorbs, not a crash. The runaway run")
note("stops itself instead of looping all night, and")
note("both leave a trail you can read afterwards.")

# Try it: drop max_steps to 1. The refund never
# happens: the cap fires before the agent reaches it.
` },
    {
      type: 'p',
      text: 'Read the loop and you can see each guardrail. The `for step in range(max_steps)` line is the step limit, and it is why this agent physically cannot run forty thousand times. The `RISKY` check is the human-in-the-loop gate, pausing before a refund or a delete until `approve` returns true. The `save(state)` call is the durable part, writing progress after each step so a crash resumes rather than restarts. And the tools are invoked through a table you control, which is where sandboxing lives, since you decide what each tool is allowed to touch.'
    },
    {
      type: 'h2',
      text: 'Long tasks, crashes, and asking a person at the right moment'
    },
    { type: 'p', text: 'Durable execution deserves a closer look, because long-running is where agents differ most from chatbots. A task that takes an hour will, eventually, be interrupted. A deploy restarts the worker, a machine reboots, a network blip kills a connection.' },
      { type: 'p', text: 'If your agent keeps its progress only in memory, that interruption throws away everything and either loses the work or starts it over from scratch, which for an agent that already sent three emails means sending them again. Durable execution fixes this by treating each completed step as a saved fact. On restart, the runtime replays what already happened and continues from the first unfinished step. Tools like Temporal and stateful agent frameworks such as LangGraph exist mostly to give you this property without hand-rolling it.' },
    { type: 'p', text: 'Human-in-the-loop is the other half of running long. Because an agent acts without asking, you want it to ask exactly when the cost of being wrong is high. Reading a record is cheap to get wrong. Issuing a refund is not.' },
      { type: 'p', text: 'The pattern is to tag a small set of actions as risky and pause on them, turning the agent from something that acts alone into something that drafts and waits. In an async setup the agent does not block a thread while it waits. It saves its state, releases the worker, and a notification goes to a person. When they approve, the task is pulled back off the store and resumes. The agent can sleep for an hour between steps and cost you nothing while it waits.' },
    {
      type: 'h2',
      text: 'The mistakes teams make on the way to safe'
    },
    {
      type: 'p',
      text: 'The first and most common mistake is the one from the story: shipping an agent with no ceiling on steps or spend because it never looped during testing. Demos use clean inputs. Production sends the weird ticket, the missing record, the malformed input that sends the agent in circles. Assume the loop will happen and cap it before it does.'
    },
    {
      type: 'ul',
      items: [
        'Gating too many actions for approval. If every step needs a human, you have not built an agent, you have built a slow form. Gate only the actions that are expensive or irreversible, and let the cheap, reversible ones run free.',
        'Keeping task state only in memory. Works in the demo, loses everything on the first restart of a long run. Persist after each step so the agent can resume, and so you can inspect what it did.',
        'Running tools with full production credentials. A tool that can read one table does not need write access to all of them. Sandbox each tool with the narrowest permissions the job needs, so a bad call has a small blast radius.',
        'Flying blind with no per-step logs. If you cannot see each action the agent took and why, every incident becomes a guessing game. Log the step, the chosen action, the arguments, and the result, so you can replay the run later.'
      ]
    },
    {
      type: 'callout',
      title: 'Cap before you scale',
      text: 'Before an agent runs unattended, it needs three numbers set: a max step count per task, a max spend per task, and a per-step timeout. All three are enforced by the runtime, not by trusting the model to stop itself. The model is the driver. These are the brakes.'
    },
    {
      type: 'h2',
      text: 'What to carry away from this'
    },
    { type: 'p', text: 'The thing that makes an agent worth deploying, that it acts on its own across many steps, is the same thing that makes it dangerous to deploy carelessly. A chatbot fails by saying something wrong. An agent fails by doing something wrong, many times, while you sleep.' },
      { type: 'p', text: 'So the work of shipping one is mostly the work of building the runtime around it: a queue to absorb load, a step and spend cap so no single task can run away, durable state so a crash resumes instead of restarts, a human checkpoint in front of the risky actions, sandboxed tools with narrow permissions, and a log of every step so you can see what happened. Give the agent its goal and its freedom to choose steps, then wrap that freedom in limits the model cannot override. The overnight team learned this the expensive way. You can add the seatbelt first.' },
    {
      type: 'sources',
      items: [
        { title: 'Anthropic: Building effective agents', url: 'https://www.anthropic.com/research/building-effective-agents' },
        { title: 'Temporal: Durable execution documentation', url: 'https://docs.temporal.io/temporal' },
        { title: 'LangGraph: Persistence and human-in-the-loop', url: 'https://langchain-ai.github.io/langgraph/concepts/persistence/' }
      ]
    }
  ]
};

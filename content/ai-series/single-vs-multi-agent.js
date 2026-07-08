export const POST = {
  id: 'single-vs-multi-agent',
  title: 'Five Agents Were Slower Than One: When to Split and When to Stay',
  excerpt: 'A team broke their research assistant into five specialized agents and it got slower and less reliable. Here is why splitting usually costs more than it pays, and the three cases where it actually earns its keep.',
  category: 'AI',
  tags: ['Agents', 'Multi-Agent', 'Architecture'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A team I talked to built a research assistant that worked well. You gave it a question, it searched a few sources, read what it found, and wrote up an answer with citations. One model, a handful of tools, one loop. It was not fancy, but it was steady and people trusted it. Then someone read a post about multi-agent systems and the team decided their single agent was doing too much. They split it into five: a planner, two searchers, a reader, and a writer. Each one had its own prompt and its own narrow job. On the whiteboard it looked clean.'
    },
    {
      type: 'p',
      text: 'In practice it fell apart. The whole thing got slower, because every question now bounced through five handoffs instead of running in one loop. It also got less reliable in a way that was hard to pin down. The planner would tell a searcher to look up one thing, the searcher would find something slightly different, and the reader downstream never learned what the planner had actually wanted. Answers came back confident and subtly wrong. After a few weeks of patching, the team folded the five agents back into one and the assistant got good again. The lesson stuck with them, and it is worth unpacking, because splitting an agent feels like progress and often is not.'
    },
    {
      type: 'h2',
      text: 'Splitting adds a tax that runs on every request'
    },
    {
      type: 'p',
      text: 'Here is the intuition to hold onto. When you split one agent into several, you are not just dividing up the work. You are adding a new kind of work that did not exist before: the work of coordinating. The agents have to pass information between each other, agree on what to do, and hand results back and forth. None of that helped the user directly. It is pure overhead, and unlike a one-time setup cost, you pay it on every single request.'
    },
    {
      type: 'p',
      text: 'Think about how a small, tight team of people works versus a large one. Two people who sit together barely need meetings. They just talk. Grow that to ten people spread across roles and suddenly half the day is status updates, handoffs, and clarifying who owns what. The work itself did not get harder. The coordination did. Agents hit the same wall, except they coordinate through text messages they pass to each other, and text is a lossy way to move intent around.'
    },
    {
      type: 'p',
      text: 'The research team felt all three of the classic costs at once. Latency went up because five sequential steps take longer than one. Failures got stranger because a mistake early in the chain quietly poisoned everything after it. And the agents talked past each other, since the planner\'s full understanding of the task never traveled intact to the reader three steps down the line. That last one is the sneakiest, so it is worth naming clearly before we go further.'
    },
    {
      type: 'h2',
      text: 'The words that make this discussion possible'
    },
    {
      type: 'p',
      text: 'Before we get to the decision, we need shared vocabulary. These four terms come up constantly and people use them loosely, which is part of why teams reach for multi-agent designs they do not need.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Single agent', def: 'One model running in one loop with access to a set of tools. It reads the task, decides on an action, sees the result, and repeats until it is done. All the context lives in one place.' },
        { term: 'Multi-agent system', def: 'Two or more agents, each with its own prompt and often its own tools, that work on parts of a task and exchange information to finish it. Coordination between them is a real part of the design, not an afterthought.' },
        { term: 'Supervisor', def: 'Also called an orchestrator. An agent whose job is to break the task into pieces, hand each piece to a sub-agent, and combine what comes back. It manages the others rather than doing the underlying work itself.' },
        { term: 'Handoff', def: 'The moment one agent passes control and information to another. Everything the receiving agent knows about the task arrives through this message, so whatever the handoff leaves out is simply lost.' }
      ]
    },
    {
      type: 'p',
      text: 'That last definition is the crux. In a single agent, context is shared for free because there is only one context. Every tool result, every earlier decision, every nuance of the request sits in the same window the model reads on every turn. The moment you split, that shared memory breaks into pieces. Each agent sees only what it was handed. If the planner understood that the user wanted recent sources but phrased the handoff as "search for X," the searcher has no idea recency mattered. The information did not travel because nobody put it in the message.'
    },
    {
      type: 'h2',
      text: 'The default is one agent with good tools'
    },
    {
      type: 'p',
      text: 'So here is the position to start from. Reach for a single agent with a solid set of tools first, every time, and make the multi-agent design prove it is worth the tax. Most tasks that look like they need a team of specialists actually just need one capable agent that can call a search tool, a read tool, and a write tool in whatever order the work requires. The research assistant was already that. The split did not give it new abilities. It gave it new seams to fail along.'
    },
    {
      type: 'p',
      text: 'This runs against a common instinct. We organize human companies into specialized roles, so it feels natural to organize agents the same way. But a person in a role carries years of shared context and can walk over and ask a colleague a question. An agent handoff is a single text message with no follow-up. Splitting by role gives you the org chart without the hallway conversations that make an org chart work.'
    },
    {
      type: 'h2',
      text: 'The three questions that justify a split'
    },
    {
      type: 'p',
      text: 'There are real reasons to go multi-agent. The trick is that they are specific, and if none of them apply, you are just buying coordination cost with no return. Walk your task through these three questions in order.'
    },
    {
      type: 'diagram',
      title: 'Should this be more than one agent?',
      root: {
        label: 'Look at the task',
        color: 'purple',
        children: [
          {
            edge: 'Independent parts that can run at once?',
            node: {
              label: 'Split for parallelism',
              color: 'green'
            }
          },
          {
            edge: 'Distinct skill sets needing different tools or prompts?',
            node: {
              label: 'Split by separation of concerns',
              color: 'green'
            }
          },
          {
            edge: 'Too much context to fit or focus in one window?',
            node: {
              label: 'Split to relieve context pressure',
              color: 'yellow'
            }
          },
          {
            edge: 'None of the above',
            node: {
              label: 'Stay single',
              color: 'blue'
            }
          }
        ]
      },
      caption: 'Work down the branches. You only split when a task clearly hits one of the first three cases. If it does not, the single agent wins by default.'
    },
    {
      type: 'p',
      text: 'The first case is genuine parallelism. If a task has parts that do not depend on each other, running them at the same time on separate agents can cut wall-clock time. Reviewing forty documents against a checklist is a good fit, because document twelve does not care what document thirty said. The parts are truly independent, so the coordination cost buys you real speed. Notice this only works when the parts do not need to talk to each other while they run. The research assistant failed this test: its steps were a chain, where each one depended on the last, so there was nothing to run in parallel.'
    },
    {
      type: 'p',
      text: 'The second case is separation of concerns that needs different tools or prompts. Sometimes two jobs are so unlike that jamming them into one agent makes it worse at both. A coding agent that also has to send customer emails wants two different personalities, two different tool sets, and two different sets of guardrails. Here a split can sharpen each agent rather than blur one. The bar is high, though. "The steps feel different" is not enough. The tools and the required behavior have to genuinely diverge.'
    },
    {
      type: 'p',
      text: 'The third case is context-window pressure. If a single task drags in more material than one context window can hold, or so much that the model loses focus, you can split so each agent handles a slice and only reports a short summary back. This is the case the research team thought they were solving, but they were not close to the limit. Their queries fit in one window with room to spare. They paid for a fix to a problem they did not have.'
    },
    {
      type: 'h2',
      text: 'What a justified split actually looks like'
    },
    {
      type: 'p',
      text: 'When you do have a real case, usually parallelism, the shape to reach for is a supervisor delegating to sub-agents. The supervisor owns the full task and the full context. It fans out independent pieces, waits for the results, and stitches them together. The key is that the supervisor writes each handoff carefully, because whatever it leaves out never reaches the sub-agent. Here is the bare skeleton.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'A supervisor delegating two independent lookups',
      code: `def supervisor(question):
    # The supervisor holds the whole task and its context.
    subtasks = plan(question)  # e.g. ["pricing docs", "changelog"]

    results = []
    for task in subtasks:
        # Each handoff must carry everything the sub-agent needs.
        # Anything left out of this message is lost to it.
        brief = f"Find facts about: {task}. Question context: {question}"
        results.append(sub_agent(brief))

    # The supervisor recombines, keeping the full picture.
    return synthesize(question, results)

def sub_agent(brief):
    # A focused loop with its own narrow tools. Returns a short summary,
    # not its entire transcript, to keep the supervisor's context clean.
    return run_agent(brief, tools=["search", "read"])`
    },
    {
      type: 'p',
      text: 'Two things in that sketch do the heavy lifting. The handoff brief includes the original question, not just the narrow subtask, so the sub-agent inherits the intent behind its assignment. And the sub-agent returns a summary rather than its full transcript, so the supervisor does not drown in detail. Get those two right and you avoid the failure that sank the research team, where intent evaporated at each handoff and the downstream agents were working blind.'
    },
    {
      type: 'h2',
      text: 'The mistakes that turn a split sour'
    },
    {
      type: 'p',
      text: 'The research team hit the biggest trap, which is splitting a chain of dependent steps. If step two needs the output of step one, and step three needs step two, you have not created a team. You have created a relay race with a lossy baton. Every handoff is a chance for intent to leak, and none of the steps can run in parallel, so you get all of the cost and none of the speed. A chain like that belongs in one agent, where each step reads the full history of the ones before it.'
    },
    {
      type: 'ul',
      items: [
        'Splitting by human job title. Copying an org chart into agents feels natural but usually just adds handoffs. Split by whether the work is actually independent, not by what a person in that role would be called.',
        'Thin handoffs. If the sub-agent gets a one-line instruction stripped of context, it will confidently solve the wrong problem. Put the goal and the relevant background in every brief.',
        'Sub-agents that dump their whole transcript back. This blows up the supervisor context and reintroduces the overload you split to avoid. Have them return short, structured summaries.',
        'No measurement before and after. The team only noticed the regression by feel. Keep a set of test questions with expected answers and compare the single-agent and multi-agent versions head to head before you commit.'
      ]
    },
    {
      type: 'callout',
      title: 'A quick gut check',
      text: 'Before splitting, ask: could a sub-agent do its piece without needing to interrupt another one mid-task? If the honest answer is no, the parts are not independent, and you almost certainly want one agent, not several.'
    },
    {
      type: 'h2',
      text: 'What to carry away from this'
    },
    {
      type: 'p',
      text: 'A single agent with good tools is the right default, and multi-agent is a targeted move you make only when a task truly has independent parallel parts, genuinely divergent tools and behavior, or more context than one window can carry. Splitting is never free. It adds latency, new failure modes, and the constant risk that agents talk past each other because context stops being shared the moment you divide it. The research team learned this the expensive way, then got their reliable assistant back by putting it in one loop again. When you do have a real reason to split, keep a supervisor in charge of the whole picture, write handoffs that carry intent, and measure the split against the single-agent version so the coordination tax you are paying actually buys you something.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Anthropic: Building effective agents', url: 'https://www.anthropic.com/research/building-effective-agents' },
        { title: 'Cognition: Don\'t build multi-agents', url: 'https://cognition.ai/blog/dont-build-multi-agents' },
        { title: 'LangGraph: Multi-agent systems documentation', url: 'https://langchain-ai.github.io/langgraph/concepts/multi_agent/' }
      ]
    }
  ]
};

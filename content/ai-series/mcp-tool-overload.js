export const POST = {
  id: 'mcp-tool-overload',
  title: 'Tool Overload: Why Eight MCP Servers Made the Agent Worse',
  excerpt: 'A team wired in eight MCP servers in one afternoon and the agent started picking the wrong tool. Here is why a big pile of tools hurts, and the server-manager pattern that pulls it back.',
  category: 'AI',
  tags: ['MCP', 'Agents', 'Tools'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A team I know had a working agent. It could read tickets, post to Slack, and query one database. Three tools, maybe four, and it picked the right one almost every time. Then someone had a good idea: connect more MCP servers so the agent can do more. In a single afternoon they wired in eight of them. GitHub, Jira, Google Drive, a calendar server, a payments server, a logs server, a search server, and an internal wiki. Each one showed up green in the client. On paper the agent had gotten much more capable.'
    },
    {
      type: 'p',
      text: 'What actually happened is that it got worse. The agent started calling the wiki search when the user asked about a pull request. It tried to create a calendar event when someone wanted a Jira ticket. On a few runs it froze for a long beat before doing anything at all, like it was reading a menu that was too long. Nobody had touched the model or the prompt. The only thing that changed was the number of tools sitting in front of it.'
    },
    {
      type: 'p',
      text: 'This surprises people because adding a tool feels free. You flip a server on and walk away. But every tool you connect has a cost that you do not see in the client UI, and that cost is paid on every single turn the agent takes. Once you understand where the cost lives, the fix is straightforward and the eight servers can stay.'
    },
    {
      type: 'h2',
      text: 'Every tool you connect is text the model has to read first'
    },
    {
      type: 'p',
      text: 'When an agent connects to an MCP server, the server hands over a list of the tools it offers. Each tool comes with a **tool schema**: a name, a description of what it does, and a full spec of the arguments it takes, with types and notes on each one. All of that is text. Before the model can pick a tool, that text gets placed into the context window alongside your system prompt and the conversation. The model reads the whole menu on every turn.'
    },
    {
      type: 'p',
      text: 'A single tool schema is small on its own, but it is rarely just a few words. A well documented tool with five arguments and clear descriptions can run a few hundred tokens once you count the argument specs. Now multiply. The GitHub server alone might expose thirty tools. The calendar server another ten. Across eight servers you can easily land at a hundred or more tools. If each averages two hundred tokens of schema, that is twenty thousand tokens spent describing tools before the user has said a word. That is real space taken from a fixed window, and it is money spent on every request.'
    },
    {
      type: 'callout',
      title: 'The hidden line item',
      text: 'Connecting a server does not just add capability. It adds a fixed block of schema text that rides along in the context on every turn, whether or not the agent ever uses that server. Ninety unused tools still get read ninety times over.'
    },
    {
      type: 'p',
      text: 'Tokens are only half the problem. The other half is that picking the right tool is a decision, and decisions get harder as the list of options grows. Ask a person to choose from four labeled buttons and they will be fast and accurate. Ask them to choose from a hundred and twenty buttons, many with similar names like `search_wiki`, `search_issues`, `search_drive`, and `search_logs`, and they slow down and start making mistakes. Models behave the same way. As the tool count climbs, selection accuracy tends to fall, because more options means more chances for two of them to look like a fit for the same request.'
    },
    {
      type: 'h2',
      text: 'Watch one confused turn in slow motion'
    },
    {
      type: 'p',
      text: 'Take the moment the agent tried to create a calendar event when the user asked for a Jira ticket. The user typed "open a ticket for the login bug." In front of the model sat a hundred plus schemas. Three of them mentioned creating something: `calendar_create_event`, `jira_create_issue`, and `drive_create_file`. Each description started with the word "Create." The model had to disambiguate "ticket" against all three descriptions at once, plus resist the ninety other tools also competing for attention. It landed on the calendar tool. Not because it is a bad model, but because the right answer was buried in a crowd of near neighbors, and reading that whole crowd is what it had to do first.'
    },
    {
      type: 'p',
      text: 'Now imagine the same request when the agent only had three or four tools in view, and all of them were plausibly related to issue tracking. The decision is nearly trivial. Same model, same prompt, same user. The only thing that changed is how many wrong doors were standing open at the same time. That gap is the whole problem, and it points straight at the fix.'
    },
    {
      type: 'h2',
      text: 'Put a manager between the servers and the model'
    },
    {
      type: 'p',
      text: 'The pattern that fixes this is a **server manager**, sometimes called a tool manager or a tool gateway. Instead of dumping every tool from every server directly into the context, you place a layer in between. The manager knows about all eight servers, but the model does not see all of them at once. For any given task, the manager selects a small, relevant subset of tools and surfaces only those. The rest stay loaded in the background, ready but out of sight.'
    },
    {
      type: 'p',
      text: 'The step where the manager decides which tools to surface is called **tool routing**. Routing looks at what the user is trying to do and matches it against the pool of available tools, then returns the handful that actually fit. A common way to route is retrieval: you keep a short description of each tool, embed the user request, and pull the closest matches, the same trick used to fetch relevant documents in a search system. You can also group tools by server or by domain, so a request tagged "scheduling" only ever pulls from the calendar group. Either way, the model receives four or five tools instead of a hundred, and its job goes back to being easy.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Tool schema', def: 'The full description of one tool that the model reads: its name, what it does, and the typed spec of every argument it accepts. All of it is text that costs tokens in the context window.' },
        { term: 'Tool overload', def: 'The failure mode where an agent has so many connected tools that schemas eat the context budget and selection accuracy drops, so the agent gets slower and picks the wrong tool more often.' },
        { term: 'Server manager', def: 'A layer between the agent and its MCP servers that holds every tool but exposes only a small, relevant set at a time, loading servers on demand instead of all at once.' },
        { term: 'Tool routing', def: 'The step where the manager decides which tools to surface for a given task, often by retrieving the closest matches to the user request or by selecting a named group of tools.' }
      ]
    },
    {
      type: 'diagram',
      rows: [
        [
          { label: 'Before: flat dump', detail: 'user request' },
          { label: '8 MCP servers', detail: '100+ tool schemas' },
          { label: 'Model', detail: 'reads all 100+, picks 1' }
        ],
        [
          { label: 'After: managed', detail: 'user request' },
          { label: 'Server manager', detail: 'routes, picks 4-5 relevant tools' },
          { label: 'Model', detail: 'reads 4-5, picks 1' }
        ]
      ],
      caption: 'The top row pours every schema into the context on every turn. The bottom row inserts a manager that surfaces only the tools that fit the current task.'
    },
    {
      type: 'p',
      text: 'Here is a small router that captures the core idea. It scores each tool against the request with a plain keyword overlap, then returns only the top few. In production you would swap the scoring for real embeddings, but the shape is the same: rank, then trim.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'A minimal tool router',
      code: `def route_tools(request, tools, top_k=5):
    """Return only the tools most relevant to the request."""
    words = set(request.lower().split())

    def score(tool):
        text = (tool["name"] + " " + tool["description"]).lower()
        return len(words & set(text.split()))

    ranked = sorted(tools, key=score, reverse=True)
    picked = [t for t in ranked if score(t) > 0][:top_k]

    # Fall back to a safe default set if nothing matched.
    return picked or tools[:top_k]

# The agent only ever sees 'visible', not the full pool.
visible = route_tools("open a ticket for the login bug", ALL_TOOLS)`
    },
    {
      type: 'p',
      text: 'With this in place, the eight servers stay connected and the agent keeps every ability it had. The difference is that on the "open a ticket" turn, the router surfaces the Jira tools and leaves the calendar and drive tools out of view. The model no longer has to tell three "Create" tools apart. It sees the one that fits.'
    },
    {
      type: 'h2',
      text: 'Where teams get the manager pattern wrong'
    },
    {
      type: 'p',
      text: 'The first mistake is surfacing too few tools, or the wrong ones, and calling it a day. If your router trims to three tools but the real task needed a fourth that got left out, the agent simply cannot do the job, and that failure is quieter and more confusing than picking the wrong tool. Give yourself a safe fallback set and lean toward surfacing a few extra when the request is ambiguous. Trimming is a dial, not a switch.'
    },
    {
      type: 'ul',
      items: [
        'Routing on the first user message only. Tasks shift mid conversation. Re-route on each turn so the visible tool set follows what the agent is doing now, not what it started with.',
        'Vague tool descriptions. Retrieval routing is only as good as the text it matches against. If two tools both say "search data," the router cannot tell them apart either. Write descriptions that name the specific domain.',
        'Hiding the manager from your own logs. When the agent misbehaves you need to see which tools were surfaced on that turn. If the routing step is invisible, you are back to guessing.',
        'Treating every server as always-on. Load a server only when its group is in play. Cold servers cost nothing if their schemas never enter the context.'
      ]
    },
    {
      type: 'p',
      text: 'The second common trap is skipping measurement. The team in the story only noticed the regression because they happened to watch a few live runs. Keep a small set of example requests with the tool you expect each one to trigger, and check the hit rate whenever you add a server. That turns "the agent feels dumber lately" into a number you can act on before users feel it.'
    },
    {
      type: 'h2',
      text: 'What to carry away from this'
    },
    {
      type: 'p',
      text: 'More tools is not more capability past a point. Every connected tool spends context tokens on every turn and adds one more option the model has to rule out, and both of those costs push the agent toward slower, wronger choices. The eight servers were not the mistake. Pouring all of their tools into the window at once was. Put a manager in the middle that routes each task to a small, relevant handful, re-route as the conversation moves, and keep an eye on the hit rate. You get the reach of many servers without making the model read the whole menu every time it wants to order one thing.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Model Context Protocol documentation', url: 'https://modelcontextprotocol.io' },
        { title: 'Anthropic: Writing effective tools for agents', url: 'https://www.anthropic.com/engineering/writing-tools-for-agents' },
        { title: 'Anthropic: Building effective agents', url: 'https://www.anthropic.com/research/building-effective-agents' }
      ]
    }
  ]
};

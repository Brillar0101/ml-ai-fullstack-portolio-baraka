export const POST = {
  id: 'mcp-architecture',
  title: 'How MCP Splits an AI App Into Host, Client, and Server',
  excerpt: 'Your IDE assistant reads a file and opens a pull request without you leaving the editor. Behind that one smooth moment sits a three role protocol worth understanding.',
  category: 'AI',
  tags: ['MCP', 'Architecture', 'Protocols'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'You are working in an AI powered code editor. You ask it to read a config file, then to open a pull request with a small fix. It does both, and you never leave the editor. It feels like one program that magically knows how to touch your filesystem and your GitHub account at the same time. It is not one program. Under the hood, the editor is talking to two separate helper processes through a shared protocol called MCP, the Model Context Protocol. One helper knows how to read files. The other knows how to talk to GitHub. The editor itself knows neither of those things directly.'
    },
    {
      type: 'p',
      text: 'That separation is the whole point, and it is worth slowing down to see clearly. Before MCP, every AI app wired up its integrations by hand. If you wanted your assistant to read files, you wrote file reading code inside the app. If you wanted GitHub, you wrote GitHub code inside the app too. Every new tool meant more custom plumbing baked into every app that wanted it. MCP replaces that with a standard way for an AI app to plug into an outside system, so the same GitHub connector can serve any editor that speaks the protocol.'
    },
    {
      type: 'p',
      text: 'The reason this matters to you, even if you never write a line of protocol code, is that it changes how you reason about failures and permissions. When something goes wrong, the question is no longer "why is my app broken." It becomes "which of these three roles dropped the ball." So let us name the three roles, then watch the messages travel between them.'
    },
    {
      type: 'h2',
      text: 'Three roles that most people blur into one'
    },
    {
      type: 'p',
      text: 'Think of a restaurant. You sit at a table and speak to one waiter. That waiter walks back to one kitchen station and relays your order. There may be several stations, a grill, a salad bench, a dessert counter, and each has its own waiter carrying orders back and forth. You, the waiters, and the kitchen stations are three different kinds of thing doing three different jobs. MCP works the same way, and it uses three matching words.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Host', def: 'The AI application the person actually uses, such as a chat client or an IDE assistant. It holds the model, talks to the user, and decides which outside systems it wants to reach.' },
        { term: 'Client', def: 'A connector that lives inside the host and keeps one dedicated link to one server. If the host wants to reach three servers, it spins up three clients, one per server.' },
        { term: 'Server', def: 'A separate program that exposes the tools, resources, and prompts for a single outside system, like a filesystem, a database, or the GitHub API.' }
      ]
    },
    {
      type: 'p',
      text: 'The part people miss is the one to one rule between client and server. A host does not open a single pipe and cram every integration through it. Instead the host creates a fresh client for each server it wants, and that client speaks to that server and nothing else. In the editor example, the host runs two clients: one bonded to the filesystem server, one bonded to the GitHub server. Keeping each link isolated means a crash or a flood of messages on the GitHub side cannot scramble the filesystem side.'
    },
    {
      type: 'diagram',
      title: 'An IDE assistant reaching two systems through MCP',
      nodes: [
        { id: 'user', label: 'Developer', icon: 'user', at: [0, 1] },
        { id: 'host', label: 'IDE assistant (host)', icon: 'service', at: [1, 1] },
        { id: 'c1', label: 'Client A', icon: 'service', at: [2, 0] },
        { id: 'c2', label: 'Client B', icon: 'service', at: [2, 2] },
        { id: 's1', label: 'Filesystem server', icon: 'service', at: [3, 0] },
        { id: 's2', label: 'GitHub server', icon: 'service', at: [3, 2] },
        { id: 'disk', label: 'Local files', icon: 'datastore', at: [4, 0] },
        { id: 'gh', label: 'GitHub API', icon: 'datastore', at: [4, 2] }
      ],
      edges: [
        { from: 'user', to: 'host', label: 'asks' },
        { from: 'host', to: 'c1', label: 'owns' },
        { from: 'host', to: 'c2', label: 'owns' },
        { from: 'c1', to: 's1', label: '1:1 link' },
        { from: 'c2', to: 's2', label: '1:1 link' },
        { from: 's1', to: 'disk', label: 'reads' },
        { from: 's2', to: 'gh', label: 'calls' }
      ],
      caption: 'One host, two clients, two servers. Each client owns exactly one link, and each server fronts exactly one outside system.'
    },
    {
      type: 'h2',
      text: 'A handshake happens before any real work'
    },
    {
      type: 'p',
      text: 'When the editor starts, each client does not just fire off requests and hope. It opens with a handshake. The client sends an initialize message that says who it is and which version of the protocol it speaks. The server answers with its own identity and, more importantly, a list of what it can actually do. This step is called **capability negotiation**, and it is the moment where both sides agree on the rules before playing.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Capability negotiation', def: 'The opening exchange where client and server each declare what features they support, so neither side later asks for something the other cannot provide.' },
        { term: 'JSON-RPC', def: 'A small, established messaging format where every request names a method and carries parameters, and every reply carries a matching result or an error. MCP sends all of its messages in this shape.' },
        { term: 'Transport', def: 'The channel the messages physically travel over. MCP commonly uses stdio for a server running on your own machine, and HTTP with server sent events for a server running remotely.' }
      ]
    },
    {
      type: 'p',
      text: 'Why bother negotiating at all? Because servers differ. The filesystem server might offer tools and resources but no prompts. A newer GitHub server might support a feature an older client has never heard of. If the client assumed every server could do everything, it would break the first time it met one that could not. By trading capability lists up front, each side learns exactly what is on the menu, and neither wastes a round trip asking for a dish the kitchen does not make.'
    },
    {
      type: 'p',
      text: 'After the handshake, the conversation settles into a simple rhythm. First the client asks the server to list what it offers, using calls like tools/list. The server replies with each tool\'s name, a description, and the shape of the arguments it expects. Only then, when the model decides a tool is needed, does the client send a tools/call request with the actual arguments. The server does the work and returns the result. List first, call second, and the model never has to guess what exists.'
    },
    {
      type: 'diagram',
      title: 'The message flow across one client to server link',
      nodes: [
        { label: 'initialize', detail: 'client says hello, states protocol version' },
        { label: 'capabilities', detail: 'server replies with what it supports' },
        { label: 'tools/list', detail: 'client asks what is available' },
        { label: 'tools/call', detail: 'client invokes a tool with arguments' },
        { label: 'result', detail: 'server returns output or an error' }
      ],
      caption: 'Every link follows the same order: negotiate, discover, then invoke.'
    },
    {
      type: 'h2',
      text: 'A server offers three kinds of thing, not just tools'
    },
    {
      type: 'p',
      text: 'It is easy to picture a server as nothing but a bag of tools, but the protocol gives it three ways to help. Tools are actions the model can trigger, like reading a file or opening a pull request. Resources are pieces of context the server can hand over, like the current contents of a file or a record from a database, meant to be read rather than to cause an effect. Prompts are ready made templates the server suggests, like a reviewer prompt the GitHub server ships so every user asks for reviews the same way.'
    },
    {
      type: 'p',
      text: 'The split matters because it lines up with who is in control. A resource is safe to pull in because reading rarely changes anything. A tool call can change the world, so the host usually pauses to confirm before letting one run. Keeping the two apart lets the host apply the right amount of caution to each. When you design a server, deciding whether something belongs as a tool or a resource is one of the first real choices you make, and getting it wrong tends to show up as either too many confirmation prompts or too few.'
    },
    {
      type: 'p',
      text: 'Back on the filesystem link, listing works the same for each kind. The client can call tools/list, resources/list, and prompts/list, and the server answers each with what it has. During capability negotiation the server already said which of these three it supports, so the client only asks about the ones that exist. That is the payoff of negotiating first: discovery stays honest and never wastes a call on a feature the server never offered.'
    },
    {
      type: 'p',
      text: 'All of these messages, from the first initialize to the final result, ride on **JSON-RPC**. That is a deliberate reuse of something that already works rather than a fresh invention. Each request carries a method name like tools/call and a bundle of parameters. Each response carries either a result or a structured error tied back to the request by an id. Because the format is boring and well understood, libraries in almost every language can read and write it without special effort.'
    },
    {
      type: 'p',
      text: 'The messages need a road to travel on, and that road is the **transport**. When the server runs on your own laptop, like a filesystem server, the host usually launches it as a child process and they speak over stdio, meaning plain standard input and output streams. When the server lives on a remote machine, they speak over HTTP, and the server can stream events back using server sent events. The clever part is that the message content is identical either way. Switching a server from local to remote changes the road, not the messages.'
    },
    {
      type: 'h2',
      text: 'What a client actually sends, in code'
    },
    {
      type: 'p',
      text: 'Here is a stripped down sketch of a client waking up, shaking hands, and asking a filesystem server what it offers. It hides the transport details so you can see the shape of the exchange itself. Notice the two phases: connect and initialize first, then list.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'A client initializing and listing tools',
      code: `async def connect_to_filesystem(transport):
    client = MCPClient(transport)

    # Phase 1: handshake and capability negotiation
    hello = await client.initialize(
        protocol_version="2025-06-18",
        client_info={"name": "ide-assistant", "version": "1.0"},
    )
    print("server supports:", hello.capabilities)

    # Phase 2: discover before you invoke
    tools = await client.list_tools()
    for tool in tools:
        print(tool.name, "->", tool.description)

    # Later, only when the model asks for it
    result = await client.call_tool(
        "read_file",
        arguments={"path": "config.yaml"},
    )
    return result.content`
    },
    {
      type: 'p',
      text: 'That is the entire idea in one function. The client never hardcodes the list of tools. It asks. If tomorrow the filesystem server gains a write_file tool, this same code discovers it with no change, because discovery happens at runtime through tools/list rather than being baked in at build time.'
    },
    {
      type: 'h2',
      text: 'Where people trip on the way in'
    },
    {
      type: 'p',
      text: 'A few misunderstandings show up again and again, and knowing them ahead of time saves hours.'
    },
    {
      type: 'ul',
      items: [
        'Thinking one client can serve many servers. It cannot. The link is one to one, and the host holds a separate client for every server, so plan for a small fleet of clients rather than a single hub.',
        'Skipping the handshake in your head. If a tool call fails with a capability error, the real problem often traces back to what was or was not agreed during initialize, not the call itself.',
        'Confusing the server with the system it fronts. The GitHub server is not GitHub. It is a thin adapter that translates MCP calls into GitHub API calls, so a failure might live in the adapter, in your token, or in GitHub, and those are three different fixes.',
        'Assuming transport equals capability. Whether a server runs over stdio or HTTP says nothing about which tools it offers. Local and remote servers can expose the exact same set.'
      ]
    },
    {
      type: 'callout',
      title: 'The one sentence to keep',
      text: 'A host owns many clients, each client keeps a private one to one link to one server, and every link negotiates capabilities before it lists tools and before it calls them.'
    },
    {
      type: 'p',
      text: 'Once the three roles click into place, a lot of AI tooling stops feeling like magic. The next time an assistant reads a file and opens a pull request in one breath, you can picture the traffic: a host running two clients, each shaking hands with its own server, each listing tools before calling them, all of it carried as plain JSON-RPC over whichever transport fits. The smooth moment on your screen is really a small, orderly protocol doing exactly what it agreed to do.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Model Context Protocol: Architecture', url: 'https://modelcontextprotocol.io/docs/concepts/architecture' },
        { title: 'Anthropic: Introducing the Model Context Protocol', url: 'https://www.anthropic.com/news/model-context-protocol' },
        { title: 'JSON-RPC 2.0 Specification', url: 'https://www.jsonrpc.org/specification' }
      ]
    }
  ]
};

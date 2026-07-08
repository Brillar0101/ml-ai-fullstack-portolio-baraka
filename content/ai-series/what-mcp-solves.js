// AI Series. Block-array format matching seriesPosts.js.
// Registered in src/data/aiPosts.js and rendered by SeriesPost.jsx.

export const POST = {
  id: 'what-mcp-solves',
  title: 'What MCP solves: turning M times N integrations into M plus N',
  excerpt: 'A small team wired their AI assistant to five tools by hand, and all five kept breaking. Here is the math behind why that happened, and how one shared standard makes the mess collapse.',
  category: 'AI',
  tags: ['MCP', 'Tools', 'Integration'],
  readTime: '8 min read',
  publishAt: '2026-07-12T12:00:00Z',
  body: [
    { type: 'p', text: 'A four-person team builds an internal AI assistant. The goal is simple to say out loud. They want to ask it a question in plain English and have it check the right systems. "What did the customer in ticket 4821 last message us about, and is their invoice paid?" To answer that, the assistant has to reach into five places: Slack, GitHub, a Postgres database, Google Drive, and the ticketing system. So the team writes five connectors. Each one is a small pile of code that knows how to log in, ask the right questions, and hand the answers back in a shape the assistant can read.' },
    { type: 'p', text: 'For a few weeks it works. Then Slack changes an API field. The Slack connector breaks. A month later the ticketing vendor rotates how auth tokens are issued, and that connector breaks too. The database connector needs a tweak every time someone adds a column. The team is now spending more time patching glue code than improving the assistant. And they have exactly one assistant. The moment a second app on the team wants to reach the same five systems, someone gets to write those five connectors all over again, in a slightly different way, with its own set of bugs.' },
    { type: 'p', text: 'This is the problem **MCP** was created to kill. Not a new model, not a smarter prompt. A plumbing standard. Before we get to what it does, it helps to see exactly why the hand-written approach falls apart, because the reason is arithmetic, not bad engineering.' },
    { type: 'h2', text: 'Why five tools felt like more than five problems' },
    { type: 'p', text: 'Count the connectors, not the tools. One app talking to five tools is five pieces of glue. That sounds fine. The trouble starts when you have more than one app, or more than one team, or more than one AI product in the building. Say your company ends up with three AI apps, each wanting the same five tools. Now you are maintaining fifteen connectors. Each connector is written for one specific pairing of one app and one tool, so nothing is shared. If you have M apps and N tools and you wire each pair by hand, you are on the hook for M times N integrations.' },
    { type: 'p', text: 'That number grows fast and it grows in the worst direction. Add one new tool and every app has to build a connector for it. Add one new app and it has to build a connector for every tool that already exists. The work does not add, it multiplies. Ten apps and ten tools is a hundred bespoke integrations, each one a thing that can break on its own schedule. The team from the opening was not unlucky. They were standing at the very start of that curve, and it was already painful with M equal to one.' },
    { type: 'callout', title: 'The core idea in one line', text: 'The pain is not that any single integration is hard. It is that hand-wiring makes the total number of integrations grow like M times N. A shared standard changes the growth to M plus N, and that difference is the whole point.' },
    { type: 'h2', text: 'The USB-C move: agree on one plug' },
    { type: 'p', text: 'Think about how devices used to charge. Every phone, camera, and music player shipped with its own cable and its own wall plug. If you owned five gadgets you owned five chargers, and a new gadget meant a new cable in the drawer. USB-C ended that. The phone maker builds one port. The charger maker builds one plug. Neither one knows or cares about the other in advance, and they still work together, because both sides agreed on the same shape.' },
    { type: 'p', text: 'MCP does the same trick for AI apps and the tools they use. Instead of each app learning the private language of each tool, everyone agrees on one language in the middle. An app learns to speak that language once. A tool learns to speak it once. After that, any app can talk to any tool without a custom connector, the same way any USB-C charger can power any USB-C phone. The app side does not need to know that the tool is Slack or Postgres. It just knows how to ask an MCP-speaking thing what it can do and how to call it.' },
    { type: 'p', text: 'When both sides speak one shared protocol, the arithmetic flips. Each of your M apps writes its MCP support once. Each of your N tools exposes itself over MCP once. That is M plus N pieces of work, not M times N. Add a new tool and you build exactly one thing, and every existing app can use it immediately. Add a new app and it speaks the protocol it already knows and reaches every tool that already exists. The drawer of chargers becomes a single cable.' },
    { type: 'diagram', title: 'Five hand-written connectors vs one shared protocol', nodes: [
      { id: 'app', label: 'AI assistant', icon: 'user', at: [1, 0] },
      { id: 'mcp', label: 'MCP standard', icon: 'service', at: [1, 1] },
      { id: 'slack', label: 'Slack server', icon: 'service', at: [0, 2] },
      { id: 'github', label: 'GitHub server', icon: 'service', at: [1, 2] },
      { id: 'db', label: 'Postgres server', icon: 'datastore', at: [2, 2] },
      { id: 'drive', label: 'Drive server', icon: 'service', at: [3, 2] },
      { id: 'tix', label: 'Ticketing server', icon: 'service', at: [4, 2] },
    ], edges: [
      { from: 'app', to: 'mcp', label: 'speaks MCP once' },
      { from: 'mcp', to: 'slack', label: '' },
      { from: 'mcp', to: 'github', label: '' },
      { from: 'mcp', to: 'db', label: '' },
      { from: 'mcp', to: 'drive', label: '' },
      { from: 'mcp', to: 'tix', label: '' },
    ], caption: 'Without the standard, the assistant would hold five different private connections. With MCP, it holds one kind of connection, and each tool exposes itself the same way. New tools plug into the same port.' },
    { type: 'h2', text: 'The four words you need before reading any MCP doc' },
    { type: 'p', text: 'MCP splits the world into a few named parts, and the words get used loosely in blog posts, which causes confusion. Here are the ones that matter, defined the way the official spec uses them.' },
    { type: 'terms', items: [
      { term: 'MCP', def: 'Model Context Protocol. An open standard that describes how an AI application and an external tool or data source talk to each other, so they can interoperate without custom glue for each pairing.' },
      { term: 'MCP server', def: 'A small program that wraps one tool or data source (Slack, a database, a folder of files) and exposes what it offers over MCP. Written once per tool by whoever owns or adopts that tool.' },
      { term: 'MCP client', def: 'The piece inside the app that holds one connection to one server and speaks the protocol on the app\'s behalf. Typically there is one client per connected server.' },
      { term: 'MCP host', def: 'The AI application itself, the thing the user actually talks to. It runs one or more clients, gathers what the servers offer, and decides which tool to call for a given request.' },
    ]},
    { type: 'p', text: 'Read those in order and the shape becomes clear. The host is your assistant. Inside it, one client is spun up for each server it wants to reach. Each server sits in front of one tool. So the opening team, redone the MCP way, keeps their one host, runs five clients inside it, and points each client at a server for Slack, GitHub, Postgres, Drive, and ticketing. The important change is that they no longer own the tricky per-tool logic. A well-made server for each tool already exists or gets written once, and every future host reuses it.' },
    { type: 'h2', text: 'What a server actually looks like to the app' },
    { type: 'p', text: 'A server advertises a list of things it can do, each with a name, a short description, and a schema saying what arguments it takes. The host reads that list and now knows, in plain terms, what is on the menu. It does not need source code or documentation buried in someone\'s wiki. The description travels with the tool. Here is the kind of entry a host holds after connecting to a database server. It is small on purpose, because that smallness is the payoff.' },
    { type: 'code', lang: 'json', title: 'one tool advertised by an MCP server', code: `{
  "name": "run_read_query",
  "description": "Run a read-only SQL query against the billing database and return rows.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sql": {
        "type": "string",
        "description": "A SELECT statement. Writes are rejected."
      },
      "max_rows": {
        "type": "integer",
        "default": 100
      }
    },
    "required": ["sql"]
  }
}` },
    { type: 'p', text: 'The host never learns Postgres internals. It sees a tool called run_read_query, learns that it wants a SQL string and an optional row cap, and calls it when a question needs billing data. If the team later swaps Postgres for a different database, they change the server. The host does not change at all, because the menu it reads stays the same. That is the whole promise of a standard: the two sides can move independently as long as they keep speaking the same protocol.' },
    { type: 'p', text: 'Wiring a server into a host is usually a few lines of config that name the server and how to launch it. The host starts it, asks for the menu, and from then on the tool is available to every request. Adding the sixth tool later is the same few lines again, with no new connector code.' },
    { type: 'code', lang: 'json', title: 'registering two servers in a host config', code: `{
  "mcpServers": {
    "billing-db": {
      "command": "python",
      "args": ["-m", "billing_mcp_server"]
    },
    "tickets": {
      "command": "node",
      "args": ["ticketing-server.js"]
    }
  }
}` },
    { type: 'h2', text: 'Where teams still trip over their own feet' },
    { type: 'p', text: 'MCP removes the per-pair glue, but it does not remove judgment. A few mistakes show up again and again once teams adopt it.' },
    { type: 'ul', items: [
      'Treating a server as a security-free zone. A server can read your database and your files. If it exposes a raw query tool with no limits, the assistant can be talked into reading things it should not. Scope each server to the smallest set of actions the job needs, and keep write access behind clear guards.',
      'Bolting on twenty servers and wondering why the agent gets confused. Every connected tool adds to the menu the model reads on each request. Too many similar tools and the model picks the wrong one. Connect the servers a task actually needs, not everything you own.',
      'Assuming a server means you skipped the hard part. Someone still writes the server, handles auth, and maps messy tool responses into clean output. MCP moves that work to one place and lets everyone reuse it. It does not make it vanish.',
      'Confusing host, client, and server in your own head. When something breaks, you need to know whether the app chose the wrong tool (host problem) or the tool returned bad data (server problem). Keep the roles straight and debugging stays sane.',
    ]},
    { type: 'p', text: 'None of these are reasons to skip the standard. They are the normal cost of any shared interface. The trade you are making is real work per pairing in exchange for one-time work per side, and that trade almost always pays off the second you have more than one app or more than a handful of tools.' },
    { type: 'h2', text: 'The one thing to carry away' },
    { type: 'p', text: 'The team in the opening did not have a Slack problem or a database problem. They had a multiplication problem. Hand-wiring means the number of things that can break grows like the number of apps times the number of tools, and that curve punishes you exactly when you are trying to grow. MCP is the agreement that lets each app speak once and each tool expose itself once, so the total work grows by addition instead. If you remember nothing else, remember the shape of the fix: M times N becomes M plus N, and it becomes that way for the same reason USB-C emptied the drawer of chargers. Everyone agreed on the plug.' },
    { type: 'sources', items: [
      { title: 'Anthropic, Introducing the Model Context Protocol', url: 'https://www.anthropic.com/news/model-context-protocol' },
      { title: 'Model Context Protocol, official documentation', url: 'https://modelcontextprotocol.io' },
    ]},
  ],
};

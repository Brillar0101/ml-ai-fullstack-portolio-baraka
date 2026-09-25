// Every factual claim below is taken from the numbered sources at the end.
// The MCP specification is cited only for what each role is responsible for;
// the findings come from the MCPSecBench, Zhao et al., MCP-DPT, MCPTox and
// MCP-Universe papers. The rug pull figure is reproduced from MCP-DPT under
// CC BY 4.0 (arXiv 2604.07551). Both charts are redrawn from table values:
// MCPSecBench (arXiv 2508.13220) is under the arXiv non-exclusive license, and
// the MCP-DPT coverage chart is redrawn so its values read on a phone.
export const POST = {
  id: 'mcp-architecture',
  title: 'Host, Client, Server: Where MCP Draws Its Trust Boundaries',
  excerpt: 'A security benchmark pointed a web page at a local MCP server and reached it every time, on Claude Desktop, OpenAI and Cursor alike. A tour of MCP\'s three roles, what the spec makes each one responsible for, and what the research found breaking at each boundary.',
  category: 'AI',
  tags: ['MCP', 'Architecture', 'Security'],
  body: [
    {
      type: 'p',
      text: 'In 2025 a group at Lingnan University set up a malicious DNS server for an old web trick called **DNS rebinding**. A domain first resolved to a web page the attackers controlled. That page kept requesting the same domain, and on a later lookup the domain resolved to 127.0.0.1, the user\'s own machine. The result was that a local MCP server, meant to be reachable only by the AI app next to it, took commands from a remote website the user had merely visited.[^1] They ran each attack 15 times against three MCP platforms: Claude Desktop, OpenAI\'s platform with GPT-4.1, and Cursor. Rebinding succeeded every time on all three. "None of the three MCP hosts implement authentication mechanisms to mitigate this attack," the paper reports.[^1]',
    },
    {
      type: 'p',
      text: 'The MCP specification does name a component to stop this. Its transport rules say servers **MUST** check the Origin header on incoming connections to prevent DNS rebinding, **SHOULD** listen only on localhost when running locally, and **SHOULD** authenticate every connection.[^3] So the spec gives the job to the server, the benchmark writes up the failure as a host shortfall, and in the test the attack went through anyway. That gap between who is supposed to enforce a rule and who actually does is what this post is about. It walks through MCP\'s three roles one at a time and asks two things of each: what the spec makes it responsible for, and what the research found going wrong there.',
    },
    {
      type: 'h2',
      text: 'The boundary map',
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Host', def: 'The AI application the person uses, such as a chat app or a code editor. It holds the conversation and the model, and it decides what the model may reach.' },
        { term: 'Client', def: 'A connector the host creates for exactly one server. It runs the protocol session with that server and passes messages both ways.' },
        { term: 'Server', def: 'A separate program that offers tools (actions), resources (data to read) and prompts (templates) for one outside system, like a file tree, a database or a web API.' },
        { term: 'Trust boundary', def: 'A line in the system where data or commands pass from a party you control to one you do not, so something on that line has to check them.' },
      ],
    },
    {
      type: 'p',
      text: 'The spec describes MCP as a client-host-server architecture in which one host runs several client instances, and each client has a 1:1 relationship with one server.[^2] Servers can be local processes or remote services.[^2] One design principle matters most for security: servers "should not be able to read the whole conversation, nor \'see into\' other servers." The full conversation history stays with the host, each server connection is isolated, and the host controls any interaction between servers.[^2]',
    },
    {
      type: 'diagram',
      title: 'One host, three clients, three servers',
      nodes: [
        { id: 'model', label: 'LLM', icon: 'model', at: [0, 0] },
        { id: 'user', label: 'User', icon: 'user', at: [0, 2] },
        { id: 'host', label: 'Host app', icon: 'service', at: [1, 1] },
        { id: 'c1', label: 'Client 1', icon: 'service', at: [2, 0] },
        { id: 'c2', label: 'Client 2', icon: 'service', at: [2, 1] },
        { id: 'c3', label: 'Client 3', icon: 'service', at: [2, 2] },
        { id: 's1', label: 'Files server', icon: 'service', at: [3, 0] },
        { id: 's2', label: 'Database server', icon: 'service', at: [3, 1] },
        { id: 's3', label: 'Remote API server', icon: 'service', at: [3, 2] },
        { id: 'd1', label: 'Local files', icon: 'datastore', at: [4, 0] },
        { id: 'd2', label: 'Local DB', icon: 'datastore', at: [4, 1] },
        { id: 'd3', label: 'Remote service', icon: 'datastore', at: [4, 2] },
      ],
      edges: [
        { from: 'user', to: 'host', label: 'asks', route: 'vh' },
        { from: 'host', to: 'model', label: 'context', route: 'vh' },
        { from: 'host', to: 'c1', route: 'vh' },
        { from: 'host', to: 'c2', label: 'creates' },
        { from: 'host', to: 'c3', route: 'vh' },
        { from: 'c1', to: 's1', label: 'stdio' },
        { from: 'c2', to: 's2', label: 'HTTP' },
        { from: 'c3', to: 's3', label: 'HTTP' },
        { from: 's1', to: 'd1', label: 'reads' },
        { from: 's2', to: 'd2', label: 'queries' },
        { from: 's3', to: 'd3', label: 'calls' },
      ],
      groups: [
        { label: 'Local machine', from: [3, 0], to: [4, 1] },
        { label: 'Internet', from: [3, 2], to: [4, 2] },
      ],
      caption: 'Layout follows the spec\'s architecture diagram.[^2] The user, the model and the full conversation sit with the host. Each client-to-server arrow crosses a trust boundary, and each server-to-data arrow crosses another. A local server reached over HTTP, like the database here, is the setup that DNS rebinding goes after.[^1,3]',
    },
    {
      type: 'p',
      text: 'MCPSecBench, the benchmark from the opening, turned this map into a test plan. The authors wrote formal requirements for a secure MCP system: which tool calls the client side may generate, what the protocol must guarantee about each message, which tools a server may run, and which host operations need authorization. Any violation counts as an attack.[^1] That gave them 17 attack types across four surfaces: client, protocol, server and host.[^1] Averaged by surface, with no extra defenses switched on, the results look like this.',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Attack success rate by surface, no added defense',
      yLabel: 'Attack success rate (%)',
      series: [
        { label: 'Claude Desktop', key: 'claude' },
        { label: 'OpenAI (GPT-4.1)', key: 'openai' },
        { label: 'Cursor', key: 'cursor' },
      ],
      data: [
        { label: 'Client side', values: { claude: 33.3, openai: 66.7, cursor: 80 } },
        { label: 'Protocol', values: { claude: 100, openai: 100, cursor: 100 } },
        { label: 'Server side', values: { claude: 78.1, openai: 75.2, cursor: 75.2 } },
        { label: 'Host side', values: { claude: 58.3, openai: 75, cursor: 81.7 } },
      ],
      caption: 'Redrawn from the averages in Table 1 of Yang et al., 2025.[^1] Each attack type ran 15 times per platform, and each bar averages the attack types that applied to that platform.',
    },
    {
      type: 'p',
      text: 'Client-side attacks had the lowest success rates, which the authors put down to modern models being trained to spot and refuse prompt injection. The two protocol attacks, rebinding and man-in-the-middle, succeeded on every try.[^1] The next three sections take the components one at a time.',
    },
    {
      type: 'h2',
      text: 'The host holds the conversation and the consent',
    },
    {
      type: 'p',
      text: 'The spec gives the host the heaviest load. It creates and manages the clients, controls their connection permissions and lifecycle, enforces security policies and consent requirements, handles user authorization decisions, coordinates the model and sampling, and gathers context across clients.[^2] Its security principles add that hosts must get explicit user consent before invoking any tool and before exposing user data to servers. The same page then admits that "MCP itself cannot enforce these security principles at the protocol level."[^4] Everything on that list is the host\'s own code.',
    },
    {
      type: 'p',
      text: 'Weibo Zhao and colleagues at the National University of Singapore tested what that code does when a server is hostile. They built 12 proof-of-concept malicious servers and ran each 15 times on every combination of three hosts (Claude Desktop, Cursor and a custom host built on the fast-agent framework) and five models, including GPT-4o, o3, Claude Opus 4 and Gemini 2.5 Pro.[^5] Six of the 12 attacks succeeded on every combination. Among them, a server that shipped a malicious launch configuration, such as a Docker command that mounted the whole host file system, worked everywhere because "hosts do not validate their config files." A server whose tool returned hostile text also worked everywhere, because hosts "do not filter tool outputs" and the text goes straight into the model\'s context.[^5]',
    },
    {
      type: 'p',
      text: 'Host design also changed outcomes with the model held fixed. When the team swapped fast-agent\'s default system prompt for Cursor\'s, a poisoned tool description went from 100% success to 6.7%. How a host packages resource data mattered too: Claude Desktop passes it to the model as text files, fast-agent pastes it into the user\'s message, and the model read injected instructions differently in each case.[^5] MCPSecBench found the same spread at its host surface. A server with a command injection bug was hooked up to see if the host would contain it. Claude Desktop refused the injected commands every time, while OpenAI and Cursor ran them every time.[^1] When a local server was configured to listen on 0.0.0.0 instead of localhost, anyone on the same network could use it, and none of the three hosts had authentication to stop that.[^1]',
    },
    {
      type: 'p',
      text: 'The host\'s job of gathering context across clients has a cost that shows up even when nobody is attacking. MCP-Universe, a Salesforce benchmark of 231 tasks run against 11 real MCP servers, found the best model, GPT-5, succeeded on 43.72% of tasks.[^8] The authors name a long-context problem, where input tokens grow quickly with each interaction step, and an unknown-tools problem, where models do not know how a particular server\'s tools should be used. Cursor as an agent did no better than a standard ReAct loop.[^8]',
    },
    {
      type: 'h2',
      text: 'The client keeps one session per server',
    },
    {
      type: 'p',
      text: 'The spec\'s list for the client is shorter. It sets up one stateful session per server, handles protocol negotiation and the capability exchange, routes messages in both directions, manages subscriptions and notifications, and "maintains security boundaries between servers."[^2] In practice the client is the code that parses whatever the server sends back, which makes it the first thing a hostile server gets to touch.',
    },
    {
      type: 'p',
      text: 'MCPSecBench\'s clearest example is a real bug, CVE-2025-6514, in mcp-remote, a package that connects clients to remote servers. The test client used mcp-remote version 0.0.15. The malicious server put a command in its authorization endpoint, and that command ran on the user\'s machine during login through a vulnerable function in the "open" npm package. It worked on all three platforms, and none had anything in place to stop it.[^1] Zhao et al.\'s taxonomy lists more attacks of this kind: resources that return binary content crafted to exploit the host\'s parsing or rendering code, oversized responses meant to overwhelm the client, and servers that flood it with progress or log notifications.[^5]',
    },
    {
      type: 'p',
      text: 'A warning about labels. What MCPSecBench calls its "client side" surface is mostly about the model: prompt injection, and a "Confused AI" attack that misleads the model about what a tool is for.[^1] It had the lowest success rates in the chart above, while the vulnerable client bug sits under the host surface. Different papers cut the stack in different places, so check what a "client" result actually measured before comparing numbers across papers.',
    },
    {
      type: 'h2',
      text: 'The server is the part nobody vetted',
    },
    {
      type: 'p',
      text: 'The spec asks little of servers. They expose resources, tools and prompts, operate independently, may ask the host\'s model for completions (a feature called sampling), "must respect security constraints," and may run locally or remotely.[^2] Its security principles say to treat tool descriptions as untrusted "unless obtained from a trusted server."[^4] That is a sensible rule, but it moves the question to how a host decides a server is trusted. Zhao et al. cite a count of over 16,000 public MCP servers by August 2025, most of them community-built and published on platforms that do not yet review them carefully.[^5]',
    },
    {
      type: 'p',
      text: 'On MCPSecBench\'s server surface, average success was above 75% on every platform. Tool poisoning, a tool whose description is written to be picked over the honest alternative, won 100% of the time on all three hosts.[^1] A rug pull server behaved well at first and then switched to stealing data. It succeeded 73.3% to 93.3% of the time, and the authors conclude that hosts check a server once at connection and then trust it "blindly."[^1] MCPTox tested tool poisoning at larger scale, with 1,312 malicious test cases built on 45 live servers and 353 real tools. Against 20 model setups, the highest attack success was 72.8% (o1-mini), and no model refused more than 3% of the attacks.[^7]',
    },
    {
      type: 'p',
      text: 'Scanning servers before installing them caught little. Zhao et al. built a generator that mixes malicious and benign parts and used it to make 120 malicious servers, 10 per attack category. Invariant Labs\' mcp-scan flagged 4 of them, all poisoned tool descriptions. Tencent\'s AI-Infra-Guard, which uses an LLM to read configs and source code, reliably caught malicious launch commands and injected code but did poorly on subtly misleading text.[^5]',
    },
    {
      type: 'h2',
      text: 'Which component has to enforce which control',
    },
    {
      type: 'p',
      text: 'MCP-DPT, a 2026 paper from Old Dominion University, asks the question the benchmarks leave open: where should each defense sit? It splits the stack into six layers. The three MCP roles appear alongside the model provider, the transport, and the registry or supply chain that servers are installed from.[^6] For each attack it names a **primary defense layer**, "the earliest architectural boundary where meaningful prevention can be enforced with sufficient authority and visibility," and a **secondary layer** that contains the damage if the primary one fails.[^6]',
    },
    {
      type: 'image',
      src: '/blog-images/mcp-architecture/rug-pull-defense-layers.webp',
      alt: 'Two stacked panels. Top, the primary defense layer at the registry: an attacker submits a tool, a pre-execution trust decision sees benign metadata, and the tool is approved while the attack stays dormant. Bottom, the secondary defense layer at the host runtime: the tool executes, its behavior changes after trust is granted, and only then does the attack become observable.',
      width: 903,
      height: 1122,
      caption: 'A rug pull passes the registry\'s check because the check can only see static metadata. It becomes visible only when the tool runs inside the host. Figure 1 from Rostamzadeh et al., 2026,[^6] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: 'The rug pull shows why one checkpoint is not enough. The registry can only judge a tool when it is submitted, and a server that turns hostile later passes that check. So the host, which watches the tool run, is the fallback.[^6] Going by my reading of the paper\'s Figure 2, the host is the secondary layer for most of the attacks it lists. That includes rebinding and man-in-the-middle, whose primary layer is the transport, and the vulnerable client bug, whose primary layer is the client.[^6] The host ends up guarding whatever the other layers miss.',
    },
    {
      type: 'p',
      text: 'The authors then mapped 13 academic and industry defenses onto the six layers. They counted a defense as covering an attack if it is positioned to detect, block or constrain it. That is a judgment about where a tool sits, not a measured detection rate.[^6]',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Best coverage any one defense reaches, per layer',
      yLabel: 'Attacks in layer covered (%)',
      series: [{ label: 'Highest coverage', key: 'c' }],
      data: [
        { label: 'Registry', values: { c: 100 } },
        { label: 'Server', values: { c: 50 } },
        { label: 'Transport', values: { c: 50 } },
        { label: 'Model', values: { c: 44 } },
        { label: 'Host', values: { c: 38 } },
        { label: 'Client', values: { c: 36 } },
      ],
      caption: 'Redrawn from Table 4 of Rostamzadeh et al., 2026.[^6] Each bar is the highest coverage among 13 defenses. The transport bar is one tool, MCP-Gateway. Ten of the 13 cover none of the transport attacks.',
    },
    {
      type: 'p',
      text: 'Their conclusion is that defenses sit "where tools are easiest to inspect, rather than where authority and visibility are sufficient." They recommend putting effort into host-side enforcement (policy checks, permission scoping, audit logs), secure binding and integrity at the transport, and provenance and update controls at the registry.[^6] Zhao et al. give the host a similar list: inspect a server\'s configuration before launching it and refuse over-privileged settings, keep allowlists and denylists of servers, filter messages in both directions, add safety instructions to the system prompt, block tool calls that do not fit the task, require user approval for some tools, and show the user every tool call with its inputs and outputs.[^5]',
    },
    {
      type: 'p',
      text: 'Runtime guards bolted on from outside have not closed the gap. MCPSecBench tested two, MCIP and FAN. Across the attacks each one covers, their average mitigation rates were 17.9% and 28.9%. Neither one applied to rebinding, man-in-the-middle, the vulnerable client or the schema inconsistency attack, and all four succeeded every time on every platform.[^1] MCIP also roughly doubled the cost per test round on Claude Desktop, from $0.41 to $0.76.[^1]',
    },
    {
      type: 'callout',
      title: 'How much weight these numbers can carry',
      text: 'This body of research is thin and young. The papers here are preprints, and most came out within a year of each other. MCPSecBench tested specific product versions 15 times per attack, and its protocol attacks ran in a controlled setup.[^1] MCP-DPT\'s coverage figures are judgments about where a defense sits, not measurements.[^6] Treat the numbers as evidence of where the boundaries leak, not as precise rates.',
    },
    {
      type: 'h2',
      text: 'The decision nobody owns yet',
    },
    {
      type: 'p',
      text: 'Both analyses end on a problem they could not assign to anyone. MCP-DPT found only two of the defenses it reviewed that protect the model\'s own choice of tool and arguments. It warns that "attacks that steer tool selection or parameterization can evade output-only checks, especially in multi-step workflows," and it lists defenses that resist this planning-time manipulation as future work.[^6] Zhao et al. put the organizational side of the same gap plainly: "the boundaries of responsibility among stakeholders are still unclear," across registries, hosts, model providers and users.[^5] The spec gives each role a job, and in the rebinding test the check still did not happen on any of the three platforms.[^1,3]',
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Yang, Gao, Wu, Chen, Li, Wang. MCPSecBench: A Systematic Security Benchmark and Playground for Testing Model Context Protocols (2025)', url: 'https://arxiv.org/abs/2508.13220' },
        { title: 'Model Context Protocol specification (2025-11-25): Architecture', url: 'https://modelcontextprotocol.io/specification/2025-11-25/architecture' },
        { title: 'Model Context Protocol specification (2025-11-25): Transports', url: 'https://modelcontextprotocol.io/specification/2025-11-25/basic/transports' },
        { title: 'Model Context Protocol specification (2025-11-25): Overview and security principles', url: 'https://modelcontextprotocol.io/specification/2025-11-25' },
        { title: 'Zhao, Liu, Ruan, Li, Liang. When MCP Servers Attack: Taxonomy, Feasibility, and Mitigation (2025)', url: 'https://arxiv.org/abs/2509.24272' },
        { title: 'Rostamzadeh, Narula, Birhan, Ghasemigol, Takabi. MCP-DPT: A Defense-Placement Taxonomy and Coverage Analysis for Model Context Protocol Security (2026)', url: 'https://arxiv.org/abs/2604.07551' },
        { title: 'Wang et al. MCPTox: A Benchmark for Tool Poisoning Attack on Real-World MCP Servers (2025)', url: 'https://arxiv.org/abs/2508.14925' },
        { title: 'Luo, Shen, Yang et al. MCP-Universe: Benchmarking Large Language Models with Real-World Model Context Protocol Servers (2025)', url: 'https://arxiv.org/abs/2508.14704' },
      ],
    },
  ],
};

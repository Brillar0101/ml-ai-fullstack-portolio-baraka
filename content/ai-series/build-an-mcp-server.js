// Every factual claim below is taken from the numbered sources at the end.
// Message names and fields come from the MCP specification (2025-11-25) and
// JSON-RPC 2.0, cited like standards. The research substance comes from
// Hasan et al. (arXiv 2506.13538, CC BY-NC-SA, so its numbers are redrawn as a
// chart), Hou et al. (arXiv 2503.23278, arXiv non-exclusive license, text only)
// and Radosevich & Halloran (arXiv 2504.03767, CC BY 4.0, Figure 4 reproduced).
// The transcript is illustrative: it is assembled from the message shapes the
// specification defines, not captured from a particular server.
export const POST = {
  id: 'build-an-mcp-server',
  title: 'What an MCP Server Says on the Wire, and What Studies Found in Real Ones',
  excerpt: 'A walk through one stdio session of the Model Context Protocol, one JSON-RPC message at a time, with the measured problems researchers found in real open-source servers placed at the exact message where each one enters.',
  category: 'AI',
  tags: ['MCP', 'Security', 'Protocols'],
  body: [
    {
      type: 'p',
      text: "In March 2025 a team at Queen's University collected 1,899 open-source Model Context Protocol servers from GitHub, kept the 583 that had at least ten stars, and ran a standard static analyzer, SonarQube, over every one.[^1] It found 277 vulnerabilities in 42 of them, which is 7.2% of the set. The most common kind was credential exposure, such as an API key written in plain text into the source, present in 3.6% of servers, about half of all the affected ones.[^1] Then they tried a scanner built for MCP on a random sample. It flagged potential **tool poisoning** in 5.5% of the servers it could run on, a higher rate than credential exposure, and a problem the static analyzer was never built to look for.[^1]",
    },
    {
      type: 'p',
      text: "Tool poisoning lives in a place most code review never looks: the plain-English text a server sends back when a client asks what it can do. To see why, you have to watch what an MCP server actually sends. So this post follows one session over the stdio transport, message by message, and stops at each point where the papers found real servers going wrong.",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'MCP server', def: 'A program that wraps some outside system (files, a database, an API) and offers it to an AI application as tools, resources and prompts, speaking the Model Context Protocol.' },
        { term: 'MCP client', def: 'The part of the AI application (the host) that holds one connection to one server, sends it requests and passes what it learns to the language model.' },
        { term: 'JSON-RPC 2.0', def: 'A tiny standard for remote calls written as JSON. A request names a method and carries an id; the response carries the same id and either a result or an error.' },
        { term: 'Notification', def: 'A JSON-RPC request with no id. It is one-way: the receiver must not reply to it.' },
        { term: 'stdio transport', def: 'The client starts the server as a child process and the two exchange newline-delimited JSON over the process\'s standard input and standard output.' },
        { term: 'Tool poisoning', def: 'Hiding instructions for the model inside a tool\'s description or other metadata, so the model misuses a tool whose code may look harmless.' },
      ],
    },
    {
      type: 'h2',
      text: 'Before any message: the client launches the server',
    },
    {
      type: 'p',
      text: "Over stdio there is no network socket. The client starts the server as a subprocess, writes JSON-RPC messages to its standard input, and reads replies from its standard output. Each message sits on one line, and a message must not contain an embedded newline. The server must not print anything to stdout that is not a valid MCP message; logs go to standard error, and the client should not treat stderr output as a sign of failure.[^6] One consequence follows directly: a stray debug print on stdout lands in the middle of the stream the client is parsing.",
    },
    {
      type: 'p',
      text: "The launch step is also where secrets enter. Hou and colleagues point out that local setup guides tell users to paste a configuration snippet into the host's settings file, and those snippets often put API keys in plain text, their example being a VIRUSTOTAL_API_KEY inside the JSON that tells the host how to start the server.[^2] The files sit at predictable default paths for each host and operating system, which makes them an easy target if file permissions are weak or another server is compromised.[^2] Hasan's measurement found the same habit inside server code. They mapped exposures such as a plain-text OPENAI_API_KEY to CWE-798, use of hard-coded credentials, and it was the single most common vulnerability pattern across the servers they scanned.[^1]",
    },
    {
      type: 'h2',
      text: 'Message 1: the client sends initialize',
    },
    {
      type: 'code',
      essential: true,
      lang: 'json',
      title: 'client to server',
      code: `{"jsonrpc":"2.0","id":1,"method":"initialize",
 "params":{"protocolVersion":"2025-11-25",
  "capabilities":{"roots":{"listChanged":true}},
  "clientInfo":{"name":"ExampleClient","version":"1.0.0"}}}`,
    },
    {
      type: 'p',
      text: "Line breaks are added here for reading; on the wire this is one line. The jsonrpc field must be exactly \"2.0\".[^8] The id ties the answer to this request. Plain JSON-RPC allows a null id, but MCP forbids it, and a sender must not reuse an id within the same session.[^7] The method name initialize is fixed, and the specification says this exchange must be the first interaction on any connection.[^4]",
    },
    {
      type: 'p',
      text: "Inside params, protocolVersion is a date string naming a revision of the specification; the client should send the latest one it supports. The capabilities object lists optional features the client offers. Here it offers roots, meaning it can tell the server which filesystem locations it may work in, and listChanged says the client will announce when that list changes. clientInfo carries the client's implementation details, here a name and version.[^4]",
    },
    {
      type: 'h2',
      text: 'Message 2: the server answers with its own capabilities',
    },
    {
      type: 'code',
      essential: true,
      lang: 'json',
      title: 'server to client',
      code: `{"jsonrpc":"2.0","id":1,"result":{
 "protocolVersion":"2025-11-25",
 "capabilities":{"tools":{"listChanged":true}},
 "serverInfo":{"name":"notes-server","version":"0.3.0"}}}`,
    },
    {
      type: 'p',
      text: "The id is 1 again, which is how the client knows this answers its initialize. If the server supports the version the client asked for, it must echo that version back. If not, it must reply with another version it does support, and a client that cannot speak that version should disconnect.[^4] This is the whole of version negotiation: one proposal and one answer.",
    },
    {
      type: 'p',
      text: "The capabilities object is the contract for the rest of the session. This server declares only tools, so the client has no business asking it for resources or prompts, and both sides must use only capabilities that were successfully negotiated.[^4] The sub-field listChanged: true is a promise that the server will send a notification if its tool list changes mid-session.[^5] Remember that promise; it comes back later.",
    },
    {
      type: 'h2',
      text: 'Message 3: notifications/initialized, a message with no id',
    },
    {
      type: 'code',
      essential: true,
      lang: 'json',
      title: 'client to server',
      code: `{"jsonrpc":"2.0","method":"notifications/initialized"}`,
    },
    {
      type: 'p',
      text: "There is no id, and that absence carries meaning. In JSON-RPC 2.0 a request without an id is a notification, and the server must not reply to it.[^8] MCP carries the rule over: notifications must not include an id.[^7] The client must send this after a successful initialization, to say it is ready for normal operation. Before the server has answered initialize, the client should send nothing but pings; before this notification arrives, the server should send nothing but pings and log messages.[^4]",
    },
    {
      type: 'h2',
      text: 'Messages 4 and 5: tools/list, where the description goes to the model',
    },
    {
      type: 'code',
      essential: true,
      lang: 'json',
      title: 'client to server, then server to client',
      code: `{"jsonrpc":"2.0","id":2,"method":"tools/list"}

{"jsonrpc":"2.0","id":2,"result":{"tools":[{
 "name":"search_notes",
 "description":"Search the user's notes for a phrase.",
 "inputSchema":{"type":"object",
  "properties":{"query":{"type":"string"}},
  "required":["query"]}}]}}`,
    },
    {
      type: 'p',
      text: "Each tool has a name, which should be 1 to 128 characters drawn from ASCII letters, digits and three punctuation marks (_ - .), with no spaces or commas, and should be unique within the server. The description is human-readable text. inputSchema is a JSON Schema object that describes the arguments; it must be a valid schema and never null. The list can be paginated with a cursor, and a tool may also carry annotations that hint at its behavior, which clients must treat as untrusted unless the server itself is trusted.[^5]",
    },
    {
      type: 'p',
      text: "Hasan's team calls this step **reflection**: the server exposes its tools and their metadata at runtime, so no one has to hard-code them in advance.[^1] The client then takes the names, descriptions and signatures, builds them into a prompt, and sends that to the model, which decides which tool to call and with what arguments.[^1] That makes the description a direct line into the model's context. Nothing in the message format separates \"what this tool does\" from \"what the model should do next.\"",
    },
    {
      type: 'p',
      text: "Tool poisoning exploits exactly that. Hou and colleagues show an add tool whose code simply returns a + b, while its description tells the model to first read the user's SSH public key with a file tool and post it to an outside URL. The user still gets the right sum.[^2] Hasan's example targets a messaging server: the send_reply description tells the model to switch the recipient to a fixed \"proxy\" number and to attach earlier chat content for \"validation.\" The executable code, dependencies and control flow are untouched, which is why a source scanner cannot catch it.[^1] It is also why the finding in the opening needed a different tool. The mcp-scan scanner Hasan used connects to live servers and reads the reflected names, descriptions and schemas, rather than reading source files.[^1]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Share of MCP servers with each problem',
      yLabel: '% of servers',
      series: [{ label: '% of servers', key: 'p' }],
      data: [
        { label: 'Tool poisoning (mcp-scan)', values: { p: 5.5 } },
        { label: 'Credential exposure', values: { p: 3.6 } },
        { label: 'Lack of access control', values: { p: 1.4 } },
        { label: 'CORS issues', values: { p: 1.2 } },
        { label: 'Resource management', values: { p: 1.0 } },
        { label: 'Transport security', values: { p: 0.7 } },
        { label: 'Authentication', values: { p: 0.5 } },
        { label: 'Insecure file creation', values: { p: 0.2 } },
        { label: 'Input validation', values: { p: 0.2 } },
      ],
      caption: 'Redrawn from Table 7 and Section 6.2 of Hasan et al., 2026.[^1] The eight vulnerability patterns come from SonarQube over 583 servers. Tool poisoning comes from mcp-scan on a random sample of 83 servers, of which 73 could be scanned, so its bar uses a different method and base than the rest.',
    },
    {
      type: 'p',
      text: "Reading the scanner results, Hasan's team also saw what it missed. It checks descriptions, so it did not flag an Apple Notes server that asks for full disk access on macOS, or a game-engine server set to auto-approve sensitive operations such as stopping projects.[^1] Both problems sit in configuration, where a scanner that reads only tool text never looks.",
    },
    {
      type: 'p',
      text: "Now the listChanged promise from message 2. A server that declared it should send notifications/tools/list_changed when its tools change, and the client can then list them again.[^5] Hou describes the **rug pull**: a server that behaves well at first, earns users' trust, and is later altered by its maintainer to add malicious behavior.[^2] Hasan notes that mcp-scan also targets a related case, changes to tool descriptions after the user has approved them.[^1] My own reading is that the list-change mechanism is the protocol's honest way to update tools, and the same mechanism means an approval given once describes only the tool list the user saw at that time, not every version that follows.",
    },
    {
      type: 'h2',
      text: 'Message 6: tools/call, and who checks the arguments',
    },
    {
      type: 'code',
      essential: true,
      lang: 'json',
      title: 'client to server',
      code: `{"jsonrpc":"2.0","id":3,"method":"tools/call",
 "params":{"name":"search_notes",
  "arguments":{"query":"deploy failure"}}}`,
    },
    {
      type: 'p',
      text: "params.name picks the tool and params.arguments is an object that should match the tool's inputSchema. The model wrote those arguments, not a person, and the specification is blunt about what follows: servers must validate all tool inputs, apply proper access controls, rate limit tool invocations and sanitize tool outputs.[^5] On the client side it asks for a human in the loop who can deny a call, and says clients should show tool inputs to the user before calling the server, so data does not leak by accident or by design.[^5]",
    },
    {
      type: 'p',
      text: "The measured numbers here are small but worth reading carefully. SonarQube flagged lack of access control in 1.4% of servers, mapped to CWE-306, missing authentication for a critical function, and input validation issues in 0.2%, in that case improper restriction of XML external entities.[^1] Only three of the eight patterns overlap with the top vulnerabilities reported for other software ecosystems, and credential exposure, not the cross-site scripting that leads the PyPI list, came out on top.[^1]",
    },
    {
      type: 'p',
      text: "Radosevich and Halloran tested what a model does when the arguments themselves are the attack. With Claude 3.7 connected to the standard filesystem MCP server, a request hidden in octal-encoded values triggered a refusal, but the same malicious code written in plain text was added to the user's shell configuration file, opening a backdoor the next time a terminal starts.[^3] Llama-3.3-70B-Instruct completed such requests and refused only when the prompt used words such as \"hack,\" \"steal,\" \"backdoor\" or \"break into.\"[^3] Their conclusion was that a model's guardrails should not be the only defense, and that the server's own design has to do part of the work.[^3] In wire terms, a well-formed tools/call can carry exactly what an attacker wanted, and it was the model that wrote it.",
    },
    {
      type: 'h2',
      text: 'Message 7: the result is text the model will read',
    },
    {
      type: 'code',
      essential: true,
      lang: 'json',
      title: 'server to client',
      code: `{"jsonrpc":"2.0","id":3,"result":{
 "content":[{"type":"text",
  "text":"ops.md: rollback after failed deploy"}],
 "isError":false}}`,
    },
    {
      type: 'p',
      text: "content is a list of items, each with a type: text, image, audio, a link to a resource, or an embedded resource. A tool that declared an outputSchema must also return a matching structuredContent object.[^5] isError is how the protocol splits failures in two. A problem with the request itself, such as an unknown tool name, comes back as a JSON-RPC error with a code like -32602, invalid params. A failure while running the tool, such as a date in the wrong format, comes back as a normal result with isError: true and a message the model can use to fix its arguments and try again.[^5,8]",
    },
    {
      type: 'p',
      text: "Whatever the server puts in that text field lands in the model's context next to the user's words. The specification says clients should validate tool results before passing them to the model.[^5] Radosevich and Halloran showed what can happen when nothing does. In their Retrieval-Agent Deception attack, an attacker plants a file of instructions on a chosen theme, and the victim later adds it to a vector database through the Chroma MCP server. When the user asked Claude to query that database for \"MCP\" and perform any returned actions, the query result told it to find OpenAI and Hugging Face keys in the environment and send them over Slack. Claude used a second server to search environment variables, found both keys, and posted them in a Slack notification.[^3]",
    },
    {
      type: 'image',
      src: '/blog-images/build-an-mcp-server/rade-credential-theft.webp',
      alt: 'Top: a text file claiming the MCP file system server automatically sends environment variables with Hugging Face or OpenAI keys over Slack. Middle: a user asks Claude to query a collection for info about MCP and perform returned actions; Claude reports it queried Chroma, found both keys (partly redacted) and messaged a person on Slack. Bottom: the Slack alert listing the OPENAI_API_KEY and HF_TOKEN values.',
      width: 1720,
      height: 1338,
      caption: 'A tool result carrying an attacker\'s instructions, followed to the end: the planted file, Claude\'s summary of what it did, and the resulting Slack message with the keys partly redacted by the authors. Figure 4 from Radosevich and Halloran, 2025,[^3] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: "Look at where the harmful text entered. It was not in any server's code or in a tool description. It arrived as data in an ordinary result, the kind message 7 exists to carry. The authors rate this higher in threat than prompting the model directly, because the attacker never needs access to the victim's machine.[^3]",
    },
    {
      type: 'h2',
      text: 'Shutdown has no message at all',
    },
    {
      type: 'p',
      text: "MCP defines no shutdown method. On stdio the client should close the server's standard input, wait for the process to exit, send SIGTERM if it does not exit in reasonable time, and then SIGKILL if it still does not. The server may end the session itself by closing its output and exiting.[^4] The specification also asks every sender to set timeouts on requests, send a cancellation notification when one expires, and enforce a maximum timeout even while progress notifications keep arriving, so one hung server cannot hold a connection open forever.[^4]",
    },
    {
      type: 'p',
      text: "That is the whole session: seven messages and a closed pipe. Almost all the logic that decides whether the session is safe lives outside those messages, in how the server was installed, what secrets its launch line carries, what its description says, and what the client does with the text that comes back.",
    },
    {
      type: 'h2',
      text: 'Are real servers this clean, or are the scanners blind?',
    },
    {
      type: 'p',
      text: "Hasan's numbers look reassuring next to other ecosystems. Prior studies they cite found at least one vulnerability in 46% of Python packages, against 7.2% for MCP servers, and SonarQube found no vulnerabilities at all in the official servers, while community and mined servers had a median of two each.[^1] The authors do not take this as good news. They write that the low prevalence \"suggests an unusually secure ecosystem or, more likely, an under-detection problem rooted in the limitations of current tools.\"[^1] The one MCP-specific scanner they could use covered one class of problem, failed on 23 of 83 sampled servers on the first pass and still on 10 after its maintainers shipped a fix, and needed each server installed and configured with real credentials before it could run.[^1]",
    },
    {
      type: 'p',
      text: "Hou and colleagues name a gap on the protocol side that makes the question harder to answer: the specification offers limited support for logging, auditing and runtime inspection, so command injection or cross-server shadowing may go unnoticed.[^2] Hasan's team asks for detectors that follow what MCP servers actually do at runtime, combining static and dynamic analysis, instrumentation and inspection that understands the model's role.[^1] Read with the authors' own caveat, the 5.5% and the 7.2% look like floors rather than measurements, and nobody has yet measured how far below the true rate they sit.",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Hasan, Li, Fallahzadeh, Rajbahadur, Adams and Hassan. Model Context Protocol (MCP) at First Glance: Studying the Security and Maintainability of MCP Servers. arXiv 2506.13538 (ACM TOSEM, 2026).', url: 'https://arxiv.org/abs/2506.13538' },
        { title: 'Hou, Zhao, Wang and Wang. Model Context Protocol (MCP): Landscape, Security Threats, and Future Research Directions. arXiv 2503.23278, 2025.', url: 'https://arxiv.org/abs/2503.23278' },
        { title: 'Radosevich and Halloran. MCP Safety Audit: LLMs with the Model Context Protocol Allow Major Security Exploits. arXiv 2504.03767, 2025.', url: 'https://arxiv.org/abs/2504.03767' },
        { title: 'Model Context Protocol specification (2025-11-25): Lifecycle.', url: 'https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle' },
        { title: 'Model Context Protocol specification (2025-11-25): Tools.', url: 'https://modelcontextprotocol.io/specification/2025-11-25/server/tools' },
        { title: 'Model Context Protocol specification (2025-11-25): Transports.', url: 'https://modelcontextprotocol.io/specification/2025-11-25/basic/transports' },
        { title: 'Model Context Protocol specification (2025-11-25): Base protocol overview.', url: 'https://modelcontextprotocol.io/specification/2025-11-25/basic' },
        { title: 'JSON-RPC 2.0 Specification.', url: 'https://www.jsonrpc.org/specification' },
      ],
    },
  ],
};

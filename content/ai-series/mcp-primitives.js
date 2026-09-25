// AI Series. Block-array format matching seriesPosts.js.
// Registered in src/data/aiPosts.js and rendered by SeriesPost.jsx.
// Research notes and paper texts live in research/mcp-primitives/ (gitignored).
// Charts are redrawn from Table 2 of Zhao et al. 2025, Table IV of Majeed et
// al. 2026 and Table 4 of Chen et al. 2026. The taxonomy image is Figure 3 of
// Zhao et al. 2025 (arXiv 2509.24272, CC BY 4.0).

export const POST = {
  id: 'mcp-primitives',
  title: 'Who pulls the trigger: MCP tools, resources and prompts, and what breaks when the wrong party does',
  excerpt: 'MCP gives each server primitive an owner: the model fires tools, the application picks resources, the user picks prompts. Here is what the specification says, what attack studies measured against each primitive, and why no paper can yet say how often real servers use the last two.',
  category: 'AI',
  tags: ['MCP', 'Security', 'Tools', 'Resources'],
  publishAt: '2026-07-12T12:00:00Z',
  body: [
    {
      type: 'p',
      text: "In 2025 a team led from the National University of Singapore built a Model Context Protocol server with a poisoned resource. A resource, in MCP, is a piece of data a server offers for reading, such as a file or a log. Its metadata, the name and description a model reads, was written to be persuasive. They then let five language models choose which resource to pull into context. GPT-4o and Gemini 2.5 Pro picked the malicious one in every trial. Claude Sonnet 4 picked it 66.7% of the time and Claude Opus 4 53.3%. OpenAI o3 picked it only 13.3% of the time, most often by including no resource at all and saying it doubted the source was genuine. Averaged over the five models, the attack worked 66.7% of the time.[^1]",
    },
    {
      type: 'p',
      text: "The detail worth noticing is that Zhao and colleagues had to run this test on its own. None of the three hosts they used (Claude Desktop, Cursor, and a custom host built on the fast-agent framework) let the model choose resources in the first place.[^1] That is not an oversight in those hosts. MCP assigns each kind of server capability an owner, and resources were never meant to be the model's to pick. This post walks through that assignment one primitive at a time: what the specification says, who it puts in control, and what researchers have measured when the control fails.",
    },
    {
      type: 'h2',
      text: 'The control table the specification draws',
    },
    {
      type: 'p',
      text: "A few terms first. The **host** is the application a person uses, such as a chat app or a code editor. Inside it, an MCP **client** holds one connection to one **server**, a separate program that wraps some outside system. When they connect, the two sides trade capability lists, and from then on the server can offer three kinds of thing, which the specification calls **primitives**. The spec sums them up in one small table, and each row names who controls the primitive: prompts are user-controlled, resources are application-controlled, tools are model-controlled.[^2]",
    },
    {
      type: 'diagram',
      rows: [
        [
          { label: 'Tool', detail: 'function the model can call' },
          { label: 'Model-controlled', detail: 'the LLM decides to invoke it' },
          { label: 'tools/call', detail: 'e.g. an API POST, writing a file' },
        ],
        [
          { label: 'Resource', detail: 'data addressed by a URI' },
          { label: 'Application-controlled', detail: 'the host decides what to attach' },
          { label: 'resources/read', detail: 'e.g. file contents, git history' },
        ],
        [
          { label: 'Prompt', detail: 'template with arguments' },
          { label: 'User-controlled', detail: 'a person picks it on purpose' },
          { label: 'prompts/get', detail: 'e.g. a slash command, a menu item' },
        ],
      ],
      caption: 'The three server primitives, the party the MCP specification puts in control of each, and the request that fires it. Control labels and examples follow the specification\'s server overview table.[^2]',
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Primitive', def: 'One of the kinds of capability MCP defines. Servers offer tools, resources and prompts; clients offer sampling, roots and elicitation back to servers.' },
        { term: 'Capability negotiation', def: 'The exchange at connection time in which each side declares which primitives it supports. A server that offers prompts, for example, must declare the prompts capability.' },
        { term: 'Attack success rate (ASR)', def: 'The share of trials in which an attack reached its goal without being blocked by the host or the model. Zhao et al. ran each attack 15 times per host and model pair.' },
      ],
    },
    {
      type: 'p',
      text: "Why split control three ways at all? Because each primitive puts text into the model's context by a different road, and the road decides who could have stopped bad text on the way in. A tool result arrives because the model asked for it. A resource arrives because the application attached it. A prompt arrives because a person chose it from a menu. If you know who was meant to be the gatekeeper, you know whose failure an attack is exploiting.",
    },
    {
      type: 'image',
      src: '/blog-images/mcp-primitives/zhao-attack-taxonomy.webp',
      alt: 'A table with three columns: component, attack category, attack type. Rows cover server metadata, configuration and init logic (A1 to A3), then tool (A4 tool metadata poisoning, A5 tool logic, A6 tool output), resource (A7 resource metadata poisoning, A8 resource logic, A9 resource output) and prompt (A10 prompt metadata poisoning, A11 prompt logic, A12 prompt output), each with its attack types such as selection inducement, sampling abuse, elicitation abuse, instruction injection and user intent distortion.',
      width: 1725,
      height: 1150,
      caption: 'Zhao et al. split a server into six parts and name an attack for the metadata, the logic and the output of each primitive. Figure 3 from Zhao et al., 2025,[^1] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'h2',
      text: 'Tools: the model fires them, and a person should be able to say no',
    },
    {
      type: 'p',
      text: "The tools page defines them as model-controlled: the language model can discover and invoke tools on its own, based on its reading of the conversation. The same page then adds a brake. For trust and safety, it says, there SHOULD always be a human in the loop with the ability to deny tool invocations, and applications SHOULD show which tools are exposed, mark each call visibly, and ask for confirmation.[^3] So the control is split: the model decides to act, and a person keeps a veto.",
    },
    {
      type: 'p',
      text: "That veto matters more each year, because tools increasingly change things rather than read them. Merlin Stein of the UK AI Security Institute classified 177,436 tools from public MCP server repositories created between November 2024 and February 2026 as perception, reasoning or action tools. Weighted by downloads, action tools, the kind that edit files, send email or move money, went from 27% of usage to 65% over those sixteen months.[^6]",
    },
    {
      type: 'p',
      text: "Does the veto exist in practice? Majeed, Mahmoud and Nadi at NYU Abu Dhabi examined 1,723 open-source MCP host applications. Nearly all of them log tool activity (90.8%), and 77.2% let the user switch servers or tools on and off in advance. Only 37.2% stop each tool call and wait for the user to approve or deny it. In the other 62.8%, in the authors' words, once a tool is enabled, the LLM's request alone triggers execution.[^7]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Human oversight in 1,723 MCP host applications',
      yLabel: '% of applications',
      series: [{ label: 'Share of applications', key: 'v' }],
      data: [
        { label: 'Logs tool activity', values: { v: 90.8 } },
        { label: 'Enable/disable list', values: { v: 77.2 } },
        { label: 'Blocking approval per call', values: { v: 37.2 } },
      ],
      caption: 'Redrawn from Table IV of Majeed et al., 2026.[^7] Only the third bar is the per-call veto the tools specification asks for; an enable list is set before the session and never interrupts a call.',
    },
    {
      type: 'p',
      text: "Tools also carry optional **annotations**, hints such as readOnlyHint and destructiveHint that tell a client whether a call is safe before it happens. The spec says clients must treat these hints as untrusted unless the server itself is trusted.[^3] Many servers do not send them at all. Afsar drew a random sample of 400 servers from a registry census of 24,135 and probed each one live. Of the 2,766 tools advertised by the servers that ran, 1,626 (58.8%) carried no annotations, and every server was all or nothing: it annotated every tool or none.[^8]",
    },
    {
      type: 'p',
      text: "When the server itself is hostile, the tool path is the easiest one in. In Zhao's experiments, malicious code hidden in tool logic (A5) and instructions planted in tool output (A6) worked in 100% of trials across every host and model pair tested. Poisoned tool descriptions (A4) averaged 89.3%. The one clear miss was GPT-4o inside Cursor, where A4 failed every time; the authors trace this to Cursor's system prompt, and swapping that prompt into fast-agent cut A4 from 100% to 6.7%.[^1]",
    },
    {
      type: 'h2',
      text: 'Resources: the application decides what enters context',
    },
    {
      type: 'p',
      text: "Resources are data a server exposes, each one named by a URI such as file:///project/notes.txt. The spec calls them application-driven: the host decides how to bring them into context.[^4] It suggests a few ways to do that, such as a tree or list the user picks from, a search box, or automatic inclusion, and that last option explicitly includes inclusion based on the AI model's selection. It also says the protocol does not mandate any particular interaction model.[^4] So the application owns the decision, but it is allowed to hand that decision to the model. The opening experiment tested exactly that hand-off, and the models chose badly two times in three.[^1]",
    },
    {
      type: 'p',
      text: "The rest of Zhao's resource attacks went through the normal, user-attached path. Code hidden in a resource handler (A8) ran in 100% of trials, because none of the tested hosts checks whether a resource does only what it claims.[^1] Output attacks (A9), where a server appends an instruction to real content, averaged 67.8%. Their example is a system log with a note added at the end saying the errors shown have already been fixed and the user should be reassured.[^1] How well A9 worked depended on how the host packaged the data. Claude Desktop hands resource content to the model as an attached text file, while fast-agent pastes it straight into the user's message. With the same model, Claude Sonnet 4, A9 succeeded in 100% of trials on Claude Desktop and 13.3% on fast-agent.[^1]",
    },
    {
      type: 'p',
      text: "Resources can also be attacked from outside. Because the server defines its own URI scheme, a sloppy server may resolve any path it is handed. Padilla dynamically audited 414 internet-facing MCP servers in July 2026, sending resources/list and resources/read requests with URIs and pagination cursors swapped for path traversal strings like ../../etc/passwd. Twenty-four of the 414 showed resource URI manipulation findings, rated high severity.[^9] The resources spec does say servers MUST validate all resource URIs.[^4]",
    },
    {
      type: 'h2',
      text: 'Prompts: a menu item a person chooses',
    },
    {
      type: 'p',
      text: "Prompts are templates with named arguments that the server publishes and a user selects on purpose, usually as a slash command. The spec calls them user-controlled.[^5] When the user fills in the arguments, the server returns ready-made messages, each tagged with a role (user or assistant), and the host places them in the conversation.[^5] That design has an odd side effect for security. Zhao et al. point out that since prompts are shown for the user to pick, poisoning prompt metadata (A10) targets the human, not the model. A malicious prompt can have a tempting name or ask for more personal data than it needs, and their test server did render such data-collecting input forms inside Claude Desktop.[^1]",
    },
    {
      type: 'p',
      text: "Prompt handlers are code too, and they run the moment a user picks the prompt, with no model involved; that attack (A11) succeeded in 100% of trials.[^1] Prompt output attacks (A12) append an extra instruction to the messages the user thought they were sending, such as a code review prompt that ends with an order to always approve the code. That was the weakest attack in the study, averaging 46.7%. It ranged from 93.3% for Claude Sonnet 4 in Claude Desktop to 0% for the same model in fast-agent, and Claude Opus 4 resisted more often than Sonnet 4 in the same host.[^1]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Average attack success by primitive and component',
      yLabel: 'Average ASR (%)',
      series: [{ label: 'Average ASR', key: 'v' }],
      data: [
        { label: 'Tool metadata (A4)', values: { v: 89.3 } },
        { label: 'Tool logic (A5)', values: { v: 100 } },
        { label: 'Tool output (A6)', values: { v: 100 } },
        { label: 'Resource metadata (A7)', values: { v: 66.7 } },
        { label: 'Resource logic (A8)', values: { v: 100 } },
        { label: 'Resource output (A9)', values: { v: 67.8 } },
        { label: 'Prompt logic (A11)', values: { v: 100 } },
        { label: 'Prompt output (A12)', values: { v: 46.7 } },
      ],
      caption: 'Redrawn from Table 2 and Section 4.1.3 of Zhao et al., 2025.[^1] A7 comes from the separate five-model selection test; A8, A9, A11 and A12 were only tested in hosts that support resources and prompts. A10 targets users and has no success rate.',
    },
    {
      type: 'h2',
      text: 'Why this post has no chart of how often each primitive ships',
    },
    {
      type: 'p',
      text: "The natural next question is how many real servers offer resources or prompts at all. I looked for a paper that counts it and did not find one. The large measurement studies I read count tools. Chen and colleagues deployed 37,288 interactable servers from their MCPZoo corpus, and their test that a server works is a successful tools/list reply; a server that offered only resources would fail it by construction.[^10] Stein's dataset is tools only.[^6] Afsar's live probe reports tools and their annotations.[^8] So the evidence base for this post is thin in one specific place: we know a great deal about tools in the wild and very little about how often the other two primitives appear.",
    },
    {
      type: 'p',
      text: "Chen's tool counts do hint at why. They sorted the tools of their interactable servers into capability groups. Remote information retrieval, such as web browsing or fetching from a remote service, made up 47.21% of tools, and local information retrieval, such as reading files, another 7.76%.[^10] A further 3,873 tools (1.05%) are labelled prompt providing, meaning they hand popular system prompts to the model.[^10] My reading, which is not a claim the paper makes, is that much of what the specification pictures as resources and prompts is being shipped as tools, where the model rather than the application or the user decides when to use it.",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'What tools on runtime MCP servers do',
      yLabel: '% of tools',
      series: [{ label: 'Share of tools', key: 'v' }],
      data: [
        { label: 'Remote info retrieval', values: { v: 47.21 } },
        { label: 'Outbound data transfer', values: { v: 21.03 } },
        { label: 'Local file modification', values: { v: 9.91 } },
        { label: 'Local info retrieval', values: { v: 7.76 } },
        { label: 'Command execution', values: { v: 6.72 } },
        { label: 'Others', values: { v: 6.33 } },
        { label: 'Prompt providing', values: { v: 1.05 } },
      ],
      caption: 'Redrawn from Table 4 of Chen et al., 2026.[^10] The two retrieval groups read data, which the specification models as resources; prompt providing overlaps with the prompt primitive.',
    },
    {
      type: 'h2',
      text: 'The client side: when the server asks the host for something',
    },
    {
      type: 'p',
      text: "MCP also runs the other way. Clients can offer servers three primitives of their own. **Sampling** lets a server ask the host's language model for a completion in the middle of its own work. **Roots** tell a server which directories it is allowed to operate in, as file:// URIs. **Elicitation** lets a server ask the user for input through the client, either as a form or by sending them to a URL.[^11,12,13] Each one crosses the control table in reverse, so each one carries a human-control clause. For sampling, there SHOULD always be a human able to deny requests, and applications SHOULD let users see and edit the prompt before it is sent.[^11] For elicitation, clients MUST show which server is asking, and servers MUST NOT use a form to ask for passwords, API keys or payment credentials.[^13]",
    },
    {
      type: 'p',
      text: "Zhao's taxonomy lists both as abuse routes but does not measure them. A tool could look like a poem generator and quietly use sampling to have the user's model write advertising copy for the attacker, at the user's cost. A booking tool could use elicitation to show a prize pop-up that asks for a government ID number.[^1] No study I could verify has measured how often this works in practice. The one preprint that reports a success rate describes the protocol inaccurately in places, so I have left its numbers out, and the size of this risk is still an open question.",
    },
    {
      type: 'h2',
      text: 'When a primitive meant for someone else is fired by the model',
    },
    {
      type: 'p',
      text: "Put the measurements side by side and one pattern stands out. Every time the control table's owner steps back and the model takes the decision, the rate at which bad content gets through goes up. Resources are the application's to attach, but when the choice was handed to the models, they picked a poisoned one in 66.7% of trials on average, and two of the five did so every time.[^1] The veto on tools belongs to a person, yet in 62.8% of the host applications Majeed et al. studied, the model's request alone runs the tool.[^7] Sampling was meant to be reviewed by a human, and no study has yet shown reliably whether that review happens.",
    },
    {
      type: 'p',
      text: "The results also show the model is a weak substitute for the gatekeeper it replaces. o3 refused the poisoned resource most of the time and GPT-4o in Cursor refused poisoned tool descriptions every time, but in both cases the protection depended on the model and on the host's system prompt, not on anything in the protocol.[^1] The spec's own wording leaves room for this. Its phrases about the user's control are mostly SHOULD rather than MUST, and the resources page says outright that the protocol mandates no user interaction model.[^3,4]",
    },
    {
      type: 'p',
      text: "Zhao et al. close their discussion with the problem that the control table was meant to solve and has not. The basic safeguards they list, from registry audits to host approval prompts, remain largely unimplemented, and more critically, they write, the boundaries of responsibility among registries, hosts, model providers and end users are still unclear, leaving significant gaps in security governance.[^1] The specification says who should pull each trigger. Nobody has yet worked out who answers for it when the wrong party pulls it.",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Zhao, Liu, Ruan, Li, Liang. When MCP Servers Attack: Taxonomy, Feasibility, and Mitigation. arXiv 2509.24272, 2025', url: 'https://arxiv.org/abs/2509.24272' },
        { title: 'Model Context Protocol specification (2025-11-25): Server features overview', url: 'https://modelcontextprotocol.io/specification/2025-11-25/server' },
        { title: 'Model Context Protocol specification (2025-11-25): Tools', url: 'https://modelcontextprotocol.io/specification/2025-11-25/server/tools' },
        { title: 'Model Context Protocol specification (2025-11-25): Resources', url: 'https://modelcontextprotocol.io/specification/2025-11-25/server/resources' },
        { title: 'Model Context Protocol specification (2025-11-25): Prompts', url: 'https://modelcontextprotocol.io/specification/2025-11-25/server/prompts' },
        { title: 'Stein. How are AI agents used? Evidence from 177,000 MCP tools. arXiv 2603.23802, 2026', url: 'https://arxiv.org/abs/2603.23802' },
        { title: 'Majeed, Mahmoud, Nadi. An Empirical Study of Model Context Protocol Applications. arXiv 2607.25635, 2026', url: 'https://arxiv.org/abs/2607.25635' },
        { title: 'Afsar. What a Random Draw from the MCP Registry Contains, and What Tool-Use Benchmarks Contain Instead. arXiv 2609.10962, 2026', url: 'https://arxiv.org/abs/2609.10962' },
        { title: 'Padilla. Exposed by Design: A Dynamic Security Assessment of Internet-Facing MCP Servers at Scale. arXiv 2608.00150, 2026', url: 'https://arxiv.org/abs/2608.00150' },
        { title: 'Chen et al. Rethinking MCP Security: A Large-Scale Study of Runtime MCP Servers and Security Scanner Reliability. arXiv 2607.11086, 2026', url: 'https://arxiv.org/abs/2607.11086' },
        { title: 'Model Context Protocol specification (2025-11-25): Sampling', url: 'https://modelcontextprotocol.io/specification/2025-11-25/client/sampling' },
        { title: 'Model Context Protocol specification (2025-11-25): Roots', url: 'https://modelcontextprotocol.io/specification/2025-11-25/client/roots' },
        { title: 'Model Context Protocol specification (2025-11-25): Elicitation', url: 'https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation' },
        ],
    },
  ],
};

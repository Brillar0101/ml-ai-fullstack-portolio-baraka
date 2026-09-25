// AI Series. Block-array format matching seriesPosts.js.
// Registered in src/data/aiPosts.js and rendered by SeriesPost.jsx.
// Every factual claim below is taken from the numbered sources at the end.
// The repository growth figure is reproduced under CC BY 4.0 (arXiv 2609.14721).
// The three charts are redrawn from numbers reported in Bünder 2019,
// Barros et al. 2022 and Guo et al. 2025, whose licenses do not allow reuse.

export const POST = {
  id: 'what-mcp-solves',
  title: 'Before MCP there was LSP: the M times N problem and what studies found',
  excerpt: 'The argument for MCP, that M apps times N tools should become M plus N, was first made for code editors. Here is what research found when the Language Server Protocol tried it, and what ecosystem measurements show about MCP so far.',
  category: 'AI',
  tags: ['MCP', 'Tools', 'Integration'],
  publishAt: '2026-07-12T12:00:00Z',
  body: [
    {
      type: 'p',
      text: "In 2019 Hendrik Bünder timed himself building editor support for a small domain-specific language through the Language Server Protocol. The language server took 127 minutes, most of it generated from a grammar file. Wiring that same server into the Theia editor took 414 minutes. Wiring it into Eclipse took 317 more.[^1] The protocol had done its job: one server answered code completion requests from both editors. But the part the protocol was meant to shrink, the per-editor work, still cost almost six times as much as the language itself.",
    },
    {
      type: 'p',
      text: "Bünder's paper states the motivation that later became the pitch for the Model Context Protocol. Integrating every language into every IDE, he wrote, \"leads to a m-times-n complexity,\" and separating language smarts from editor integration brings it \"down to m-plus-n.\"[^1] Five years later MCP made the same promise for AI applications and the tools they call. This post follows the idea from editors to models, and checks what the measurements say at each stop.",
    },
    {
      type: 'h2',
      text: '2016: an editor problem with a multiplication in it',
    },
    {
      type: 'p',
      text: "An **IDE** (integrated development environment) is an editor with language-aware features built in: completion, jump to definition, error markers. Before 2016 each IDE carried its own implementation of those features for each language it supported. Bünder describes the squeeze from both sides. The number of programming languages keeps rising, old ones like Cobol stay in use, and the number of IDEs keeps rising too, so IDE makers struggle to keep up while language providers want to reach as many editors as they can.[^1] For a small language, the practical result was that the toolsmith picked one IDE and ignored the rest, because \"supporting multiple editors causes tremendous effort.\"[^1]",
    },
    {
      type: 'p',
      text: "The Language Server Protocol, introduced by Microsoft, Red Hat and Codenvy in 2016, splits that work in two.[^1] A **language server** is a separate process that understands one language: it parses files, finds definitions, reports errors. The editor runs a thin **language client** that forwards requests and draws the results. The two talk over JSON-RPC, a small convention for sending requests and responses as JSON messages, and the messages themselves are defined by the LSP specification.[^1,2] Neither side needs to know how the other is written. When a session starts, each side announces the features it supports, and a server treats any feature the client leaves out as unsupported.[^1]",
    },
    {
      type: 'h2',
      text: 'The arithmetic, stated plainly',
    },
    {
      type: 'p',
      text: "What follows is arithmetic, not a finding. Suppose there are \\(M\\) editors and \\(N\\) languages, and every editor should support every language. If each pairing is written by hand, you need one adapter per pair. If both sides implement a shared protocol instead, each editor writes one client and each language writes one server.",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\text{pairwise adapters} = M \\times N \\\\[4pt] \\text{with a shared protocol} = M + N \\\\[6pt] M = N = 3: \\quad 9 \\ \\text{vs} \\ 6 \\\\[2pt] M = N = 30: \\quad 900 \\ \\text{vs} \\ 60 \\end{gathered}',
      caption: 'Counting arithmetic, not a measured result. The gap grows with the size of the ecosystem, which is why the argument gets stronger as more parties join.',
    },
    {
      type: 'diagram',
      title: 'Two ways to connect M applications to N tools',
      root: {
        label: 'Connect M apps (editors, AI hosts) to N tools (languages, services)',
        color: 'purple',
        children: [
          {
            edge: 'wire each pair',
            node: {
              label: 'M × N adapters, each written for one pair',
              color: 'yellow',
              children: [
                { edge: 'one new tool', node: { label: 'M new adapters, one per app', color: 'yellow' } },
              ],
            },
          },
          {
            edge: 'share a protocol',
            node: {
              label: 'M + N parts: one client per app, one server per tool',
              color: 'green',
              children: [
                { edge: 'one new tool', node: { label: 'One new server, usable by every app', color: 'green' } },
              ],
            },
          },
        ],
      },
      caption: 'The contrast both LSP and MCP were built on. The saving is in the count of parts; it says nothing about how expensive each part is, which is where the studies below come in.',
    },
    {
      type: 'p',
      text: "The formula hides an assumption. It counts pieces, not effort, and it treats every client as equally cheap to write. Bünder's own timings are a warning about that. The \\(M\\) in \\(M + N\\) was the expensive term in his case study.",
    },
    {
      type: 'h2',
      text: 'What a case study clocked',
    },
    {
      type: 'p',
      text: "Bünder built an Entity DSL, a small language for describing data entities with properties and operations, using the Xtext language workbench, which could generate a working language server straight from the grammar. He then wrote client extensions for Theia and for Eclipse.[^1] The server supported completion, hover, go to definition, workspace symbols, find references and diagnostics without further customization.[^1]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Time to build one language server and two editor integrations',
      yLabel: 'Minutes',
      series: [{ label: 'Minutes', key: 'm' }],
      data: [
        { label: 'Language server', values: { m: 127 } },
        { label: 'Theia integration', values: { m: 414 } },
        { label: 'Eclipse integration', values: { m: 317 } },
      ],
      caption: 'Redrawn from Table 1 of Bünder, 2019.[^1] One developer, one small DSL. The server was mostly generated code, and the Eclipse integration benefited from what was learned on Theia.',
    },
    {
      type: 'p',
      text: "Each editor still needed its own code. Theia needed a backend extension to start the server and a frontend extension for syntax highlighting and the file suffix. Eclipse needed a plugin on the LSP4E extension point and its own highlighting class. The completion proposals came from the shared server, but keyword highlighting had to be written separately for each editor.[^1] Bünder notes that the two integrations were alike in concept but differed in architecture, programming language and API, and that every integration has to be tested separately to give the same experience.[^1]",
    },
    {
      type: 'p',
      text: "His verdict was still positive. Adding each editor had a price, but \"the overall integration costs are far below implementing an IDE-specific integration.\"[^1] He also listed what the design cost. Each language server serves exactly one development tool, servers do not talk to each other, and common tasks such as parsing XML must be reimplemented inside every server that needs them. A developer editing a DSL, a Java program and an XML file at once runs three servers, and at an assumed 1 GB per Java virtual machine that is 3 GB of memory.[^1]",
    },
    {
      type: 'h2',
      text: 'What thirty language servers actually implement',
    },
    {
      type: 'p',
      text: "A protocol defines what a server may offer, not what it does offer. In 2022 Djonathan Barros, Sven Peldszus, Wesley Assunção and Thorsten Berger studied the source code of 30 language servers drawn from a community-curated list, which had 101 entries when they sampled it in March 2021 and 121 by May 2022. The protocol version they studied defined 23 editing features.[^3] Their count of which features the 30 servers implement shows how uneven the \"standard\" experience is.",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'How many of 30 language servers implement each feature',
      yLabel: 'Servers (of 30)',
      series: [{ label: 'Servers', key: 's' }],
      data: [
        { label: 'Go to definition', values: { s: 28 } },
        { label: 'Diagnostics', values: { s: 28 } },
        { label: 'Hover', values: { s: 27 } },
        { label: 'Completion', values: { s: 27 } },
        { label: 'Find references', values: { s: 24 } },
        { label: 'Document symbols', values: { s: 23 } },
        { label: 'Signature help', values: { s: 20 } },
      ],
      caption: 'Redrawn from the counts in Section 4.1.1 of Barros et al., 2022.[^3] These are the seven most often implemented of the 23 features; the rest were implemented by fewer servers.',
    },
    {
      type: 'p',
      text: "Servers for general-purpose languages tended to implement many features and servers for DSLs tended to implement few, though popular DSLs such as XML and LaTeX implemented many. The authors suggest that feature count may depend mainly on how popular a language is.[^3] Three servers in the sample implemented almost nothing of their own and used LSP as a wrapper to forward results from an existing tool, such as the SonarLint static analyzer.[^3]",
    },
    {
      type: 'p',
      text: "So the LSP record, as far as these two studies go, has two sides. The M plus N structure held: one server really did serve several editors, and the protocol gave DSL authors a shared minimum set of features to aim for.[^1] But each client was still real work, and what a user got in a given editor depended on which parts of the protocol that particular server bothered to build. The research base here is thin. One study is a single developer timing a single DSL, and the other is a code analysis of 30 servers whose selection deliberately included every Java-based server on the list.[^3] Neither measures, across the whole ecosystem, how much duplicated work the protocol removed.",
    },
    {
      type: 'h2',
      text: '2024: the same trade, moved to model applications',
    },
    {
      type: 'p',
      text: "MCP, released by Anthropic in November 2024,[^7] applies the same split to large language model applications. Majeed, Mahmoud and Nadi put the motivation in the same terms: rather than every AI application writing custom integration code for every external tool it uses, both sides implement one shared protocol.[^4] Like LSP, it runs on JSON-RPC 2.0 and starts each connection with a handshake in which both sides declare their capabilities.[^4,5]",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'MCP host', def: 'The AI application the user talks to, such as a desktop chat app or an IDE plugin. It plays the role the editor played in LSP.[^6]' },
        { term: 'MCP client', def: 'A component inside the host that holds a one-to-one connection with a single server. A host connected to n servers has n clients.[^6]' },
        { term: 'MCP server', def: 'A local or remote program that exposes tools (functions the model can call), resources (data) and prompts (templates) over the protocol. It plays the role the language server played.[^5,6]' },
      ],
    },
    {
      type: 'p',
      text: "Guo and colleagues note that MCP's ambition is often described by analogy to HTTP for the Web and USB for peripherals: one protocol layer that makes integrations portable and reusable.[^6] If that works, the arithmetic above applies directly. Their crawl found 341 valid clients and 8,060 valid servers. Pairwise wiring would take \\(341 \\times 8{,}060 = 2{,}748{,}460\\) adapters; a shared protocol needs \\(341 + 8{,}060 = 8{,}401\\) implementations. That is my arithmetic on their counts, and it overstates the saving, because no host wants every server. The real question is whether the reuse that the \\(+\\) sign promises shows up in practice.",
    },
    {
      type: 'h2',
      text: 'Counting what the MCP ecosystem really holds',
    },
    {
      type: 'p',
      text: "Servers are published in marketplaces, websites that list MCP servers and clients the way package registries list libraries. Hechuan Guo and six coauthors built a crawler called MCPCrawler, ran it against six of them, and filtered out entries such as placeholder repositories, inactive forks and projects with no executable code. Of 16,950 raw server entries, 8,890 (52.4%) were discarded, leaving 8,060 valid servers.[^6]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Listed vs valid MCP servers per marketplace',
      yLabel: 'Servers',
      series: [
        { label: 'Listed (raw)', key: 'raw' },
        { label: 'Valid', key: 'valid' },
      ],
      data: [
        { label: 'MCP.so', values: { raw: 16646, valid: 7223 } },
        { label: 'MCP Market', values: { raw: 14280, valid: 3765 } },
        { label: 'Smithery', values: { raw: 6751, valid: 2588 } },
        { label: 'PulseMCP', values: { raw: 6013, valid: 3576 } },
        { label: 'MCP Servers', values: { raw: 2136, valid: 997 } },
        { label: 'Cursor.directory', values: { raw: 1600, valid: 1197 } },
      ],
      caption: 'Redrawn from Table 4 of Guo et al., 2025.[^6] Many servers appear in more than one marketplace, so the rows do not add up to the deduplicated total of 8,060 valid servers.',
    },
    {
      type: 'p',
      text: "MCP Market kept only 26.4% of its entries, and the largest hub, MCP.so, appeared to have leveled off during the crawl.[^6] The authors conclude that the ecosystem is \"widely adopted in appearance but structurally fragile in practice.\"[^6] One caution about the paper itself: some summary figures differ between its introduction and its body, for example the share of projects listed in more than one marketplace, so I use only the numbers from its tables and results sections here.",
    },
    {
      type: 'p',
      text: "Activity on GitHub is growing even so. Natarajan Chidambaram, Mauro Dalle Lucca Tosi and Jordi Cabot filtered MCP-related repositories down to 33,319 with at least 3 stars, 3 contributors or 50 commits, and plotted when they were created.[^7]",
    },
    {
      type: 'image',
      src: '/blog-images/what-mcp-solves/mcp-repo-growth.webp',
      alt: 'Two line charts. Top: new MCP-related GitHub repositories per month, rising from near zero in November 2024 to about 2,100 in April 2025, dipping to about 1,200 by late 2025, then peaking at about 4,000 in March 2026. Bottom: the cumulative count, rising to about 33,000 by mid 2026.',
      width: 1000,
      height: 1300,
      caption: 'Figure 4 from Chidambaram et al., 2026,[^7] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The drop in the last months is at least partly an artifact of data collection, since newer repositories had less time to pass the filters.',
    },
    {
      type: 'p',
      text: "Growth came in two waves. The second, starting in January 2026 and peaking at 4,026 new repositories in March, accounts for 49.5% of the dataset.[^7] Most of these projects use MCP to get something else done: 93.7% of the repositories treat it as an enabling technology rather than analyzing, extending or securing it.[^7] Growth in the count of servers is evidence that the \\(N\\) side is filling in. It is not yet evidence that each server is being reused across many hosts.",
    },
    {
      type: 'h2',
      text: 'Whether apps reuse the servers',
    },
    {
      type: 'p',
      text: "The M plus N saving depends on hosts connecting to many servers. Guo's team found that 276 of 341 clients (80.9%) support only a single server connection, and 65 (19.1%) support several at once.[^6] Among clients listed in marketplaces, then, one host talking to one server is still the common design.",
    },
    {
      type: 'p',
      text: "The server side has a twist that LSP did not. Meriem Mastouri, Emna Ksontini, Amine Barrak and Wael Kessentini examined 116 official MCP servers and found that 88.6% of them are fully or partly backed by a vendor REST API, and that 92% of those REST-backed servers implement their tools as thin pass-throughs to the API.[^8] So many MCP servers are adapters over an interface that was already standardized. What they add is a description a model can read. They also expose only a slice of it. Across 42 servers paired with public OpenAPI specifications, the median server exposed 19% of the vendor's documented operations.[^8] GitHub's REST API has more than 600 operations and its MCP server exposes 51 tools; Slack's API has more than 200 methods and its reference server surfaces 8.[^8]",
    },
    {
      type: 'p',
      text: "That echoes the Barros finding for language servers. A protocol lets any host talk to any server, but what a host can do through a server is whatever that server's author chose to expose. The authors found the omissions follow patterns, not random choice: coverage falls as the vendor API gets bigger, from a median of 68% for small APIs to 6% for very large ones.[^8]",
    },
    {
      type: 'p',
      text: "On the host side, the best evidence comes from Majeed, Mahmoud and Nadi, who studied 1,723 open-source MCP host applications on GitHub. Here some convergence did happen. 81.1% talk to servers through an official MCP SDK, and 18.9% write their own client layer, building the JSON-RPC messages by hand.[^4] That matches Bünder's remark that his integrations were only quick because SDKs handled the low-level messaging.[^1] My reading of both results is that shared libraries do much of the work the protocol gets credit for.",
    },
    {
      type: 'callout',
      title: 'How strong is this evidence?',
      text: "Thin, and young. The LSP side rests on one single-developer case study and one source-code study of 30 servers.[^1,3] Every MCP ecosystem study used here was posted as an arXiv preprint in 2025 or 2026, I could not confirm that any has completed peer review, and each is a snapshot of an ecosystem that changes month to month.[^4,6,7,8] None measures directly how many hours of integration work the protocol saved compared with pairwise wiring.",
    },
    {
      type: 'h2',
      text: 'The layer nobody specified',
    },
    {
      type: 'p',
      text: "The Majeed study found where MCP's standardization stops. The protocol defines messages, transports and the primitives a server exposes, but it leaves the application side unspecified.[^4] 85.2% of hosts keep their list of servers in a configuration file, yet there is no agreed file name: the most common, mcp.json, appears in only 30.7% of file-configured repositories.[^4] Oversight varies even more. Only 37.2% put a blocking approval step in front of tool calls, and 20.0% have neither an allowed list nor an approval step, so the model can call any enabled tool with no check at all.[^4]",
    },
    {
      type: 'p',
      text: "The authors frame this as a dependency problem. An MCP server is a dependency, but unlike a library, whose declaration, resolution and trust are handled by a package manager, it has no equivalent layer. There is no standard configuration file for a scanner to read and no vulnerability database for MCP servers.[^4] Their conclusion points to a need for ecosystem-level standards as MCP matures.[^4] Bünder left a similar question open for LSP in 2019: whether keeping every server separate leads to basic features being reimplemented again and again, which he said needed more research.[^1] MCP shrank the integration count the way LSP did. What none of these studies found is a shared way for an application to declare which servers it depends on and decide whether to trust them.",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Bünder, Decoupling Language and Editor: The Impact of the Language Server Protocol on Textual Domain-Specific Languages, MODELSWARD 2019', url: 'https://www.scitepress.org/Papers/2019/75563/75563.pdf' },
        { title: 'Microsoft, Language Server Protocol specification', url: 'https://microsoft.github.io/language-server-protocol/' },
        { title: 'Barros, Peldszus, Assunção, and Berger, Editing Support for Software Languages: Implementation Practices in Language Server Protocols, MODELS 2022', url: 'https://www.cse.chalmers.se/~bergert/paper/2022-models-lspstudy.pdf' },
        { title: 'Majeed, Mahmoud, and Nadi, An Empirical Study of Model Context Protocol Applications, 2026', url: 'https://arxiv.org/abs/2607.25635' },
        { title: 'Model Context Protocol specification', url: 'https://modelcontextprotocol.io/specification' },
        { title: 'Guo et al., A Measurement Study of Model Context Protocol Ecosystem, 2025', url: 'https://arxiv.org/abs/2509.25292' },
        { title: 'Chidambaram, Dalle Lucca Tosi, and Cabot, A Two-Dimensional Study of the Model Context Protocol: Publication and Adoption, 2026', url: 'https://arxiv.org/abs/2609.14721' },
        { title: 'Mastouri, Ksontini, Barrak, and Kessentini, From REST to MCP: An Empirical Study of API Wrapping and Automated Server Generation for LLM Agents, 2026', url: 'https://arxiv.org/abs/2507.16044' },
      ],
    },
  ],
};

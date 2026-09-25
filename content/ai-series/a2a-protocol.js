// Every factual claim below is taken from the numbered sources at the end.
// The A2A specification (source 6) is cited only for field names, method names
// and normative wording, the way one cites a standard. The research substance
// comes from the papers. Figure 6 of Lotfi et al. (arXiv 2609.10871) is
// reproduced under CC BY 4.0. The chart is redrawn from Table I of Louck et al.
// (arXiv 2505.12490, CC BY 4.0).
export const POST = {
  id: 'a2a-protocol',
  title: 'One A2A Handoff, Message by Message, and Where Each Message Can Be Abused',
  excerpt: 'A 2026 analysis found 11 attacks on the Agent2Agent protocol that work without breaking a single rule of the spec. Follow one task from Agent Card to artifact and you can see where each one lives.',
  category: 'AI',
  tags: ['Agents', 'A2A', 'Protocols', 'Security'],
  body: [
    {
      type: 'p',
      text: "In September 2026 a team from Purdue and UT Dallas reported 11 vulnerabilities in the Agent2Agent (A2A) protocol, and none of them needs a bug. Each one can be carried out by an adversary who authenticates properly and obeys every MUST, SHOULD and MAY in the specification. The gaps are in what the spec leaves unsaid.[^1] Before building their own method, the authors tried the obvious shortcut. They gave Claude Opus 4.6, with high reasoning, only the specification and asked it for protocol-level attacks. Two runs produced nine candidates, and all nine were rejected on review, mostly because the spec already forbade the attack the model described.[^1]",
    },
    {
      type: 'p',
      text: "That result says something about where A2A's weak points sit. They do not show up on a quick read. They sit between messages: in which identifier the server checks, which field nobody verifies, and what happens to a credential after the hop that asked for it. So this post follows a single task handoff in order, one message at a time, and at each step sets out what the papers say can go wrong there.",
    },
    {
      type: 'p',
      text: "A word on the evidence first. The research base is thin. The A2ABreak authors describe A2A's security as having received virtually no systematic analysis, and most earlier work is threat modeling or surveying rather than measurement.[^1] Two of the papers used here also describe an older version of the protocol, with a card at /.well-known/agent.json and methods named tasks/send and tasks/sendSubscribe.[^2,3] The field names below come from the current 1.0 specification.[^6] Where a paper's threat was written against the older version, the post says so.",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Client agent and remote agent', def: 'The client agent acts for a user and hands work out. The remote agent (the A2A server) receives the work and does it. Neither can see inside the other; the remote agent\'s reasoning, memory and tools stay hidden, which the papers call opaque execution.' },
        { term: 'Agent Card', def: 'A JSON document a remote agent publishes to describe itself: name, skills, endpoints, and how clients must authenticate. It is the first thing a client reads.' },
        { term: 'Task', def: 'A unit of delegated work with a server-assigned id and a lifecycle of states, from submitted to a terminal state such as completed or failed.' },
        { term: 'Artifact', def: 'An output the remote agent produces for a task, such as a document or structured data, made of one or more parts.' },
      ],
    },
    {
      type: 'p',
      text: "The running example is the one Louck and colleagues use: a user asks an agent to book a vacation with flights, a hotel and a taxi, and that agent delegates the booking to another agent.[^4] Here is the whole handoff before we take it apart.",
    },
    {
      type: 'diagram',
      essential: true,
      nodes: [
        { label: '1. Discover', detail: 'GET /.well-known/agent-card.json' },
        { label: '2. Authenticate', detail: 'credentials per securitySchemes, on every request' },
        { label: '3. Send', detail: 'SendStreamingMessage with a Message; server returns a Task' },
        { label: '4. Continue', detail: 'follow-up messages carry taskId and contextId' },
        { label: '5. Stream status', detail: 'TaskStatusUpdateEvent until a terminal state' },
        { label: '6. Return artifacts', detail: 'TaskArtifactUpdateEvent with append and lastChunk' },
      ],
      caption: 'One A2A task handoff in the order the messages flow, using the method and event names of the 1.0 specification.[^6] The six stages roughly follow the lifecycle Lotfi et al. model: discovery, authentication, initiation, execution, interruption and termination.[^1]',
    },
    {
      type: 'h2',
      text: 'Step 1: the client fetches an Agent Card it has no way to check',
    },
    {
      type: 'p',
      text: "Discovery starts with a plain HTTP GET. The spec's standard location is https://{server_domain}/.well-known/agent-card.json, and clients can also find cards through curated registries or have them configured directly.[^6] The survey by Ehtesham and colleagues puts the card's role bluntly: an agent without an Agent Card is effectively invisible within A2A.[^3] Here is a trimmed card for the booking agent, using the 1.0 field names.",
    },
    {
      type: 'code',
      essential: true,
      lang: 'json',
      title: 'Agent Card, trimmed (field names from the A2A 1.0 spec)',
      code: `{
  "name": "Booking Agent",
  "description": "Books flights, hotels and taxis",
  "version": "1.0.0",
  "supportedInterfaces": [
    { "url": "https://booking.example.com/a2a/v1",
      "protocolBinding": "JSONRPC", "protocolVersion": "1.0" }
  ],
  "capabilities": { "streaming": true, "pushNotifications": false },
  "securitySchemes": { "oidc": { "openIdConnectSecurityScheme": {
    "openIdConnectUrl": "https://id.example.com/.well-known/openid-configuration" } } },
  "defaultInputModes": ["text/plain"],
  "defaultOutputModes": ["text/plain"],
  "skills": [{ "id": "book-trip", "name": "Book a trip",
    "description": "Reserve flights and hotels", "tags": ["travel"] }]
}`,
    },
    {
      type: 'p',
      text: "Every value in that document is written by whoever runs the server. Habler and colleagues, applying the MAESTRO threat-modeling framework to A2A, put **Agent Card spoofing** first on their list: an attacker publishes a forged card at a malicious or typosquatting domain, the client trusts it, and sensitive tasks go to a rogue server, which enables task hijacking, data exfiltration and agent impersonation.[^2] Their tenth threat is subtler. A **poisoned Agent Card** hides prompt-injection instructions inside ordinary fields such as a skill's id, name, description, tags or examples. When another agent's language model reads the card while planning, it may follow those instructions. The authors conclude that card content has to be treated as untrusted input and sanitized before any model sees it.[^2]",
    },
    {
      type: 'p',
      text: "The 1.0 spec does offer a defense for the first problem. A card MAY carry JSON Web Signatures in a signatures field, computed over a canonical form of the card, so a client can check that the card was not tampered with and comes from the claimed provider.[^6] Lotfi et al. point out that this is optional, and that it answers a different question from the one the client is really asking. A signature confirms who published the card, not whether the advertised skills are true. The AgentSkill object is made entirely of self-asserted strings, and the paper's **unattested skill claims** attack uses exactly that: a fully compliant malicious agent advertises a skill in a sensitive domain, gets picked, receives the confidential data the task needs, exfiltrates it, and returns fabricated artifacts, all without triggering a protocol error.[^1]",
    },
    {
      type: 'p',
      text: "Cards also change over time. Ehtesham's survey lists unauthorized capability injection and version drift as an update-phase risk, meaning hidden skills added to a card or clients working from an outdated one.[^3] Anbiaee and colleagues describe the long-game version, a **rug pull**: an agent behaves well until it is built into a critical workflow, then changes its behavior. They note that A2A's dynamic discovery makes this a serious threat to integrity.[^5]",
    },
    {
      type: 'h2',
      text: 'Step 2: the client authenticates, and the identity stops at this hop',
    },
    {
      type: 'p',
      text: "The card's securitySchemes field tells the client how to authenticate, for example with OAuth 2.0, OpenID Connect or an API key. The client gets credentials through an out-of-band process, then sends them in protocol headers on every request, and the server MUST authenticate each incoming request.[^6] So credentials travel beside the A2A payload rather than inside it.",
    },
    {
      type: 'p',
      text: "Habler's list of authentication threats reads like any web API's: forged or stolen JWTs, weak JWT validation such as a missing signature check or unchecked audience and issuer claims, replay of old or expired tokens, and insecure token storage.[^2] Louck and colleagues look at what those tokens allow. In their vacation example the user's agent passes a payment token to the booking agent that stays valid for hours or even days, and it can read the user's whole calendar, medical appointments included.[^4] They argue that A2A sets no strict token lifetime for sensitive operations and no fine-grained scope, and they propose single-use tokens valid for 30 seconds to 5 minutes, scoped to an approved amount or to calendar availability only.[^4] Anbiaee's comparative threat model makes the same two points about lifetime and coarse scope.[^5]",
    },
    {
      type: 'p',
      text: "The deeper design issue is that authentication in A2A is hop by hop. Lotfi et al. write that identity is established at the transport layer and not carried across delegation hops, so each agent knows only its immediate caller.[^1] In the example that means the booking agent knows the vacation agent called it, and nothing about which person the vacation agent is acting for. That is fine for one hop. Step 5 shows what it does to a chain.",
    },
    {
      type: 'h2',
      text: 'Step 3: the client sends a message and the server decides whether it becomes a task',
    },
    {
      type: 'p',
      text: "The client now calls SendMessage, or SendStreamingMessage if the card says streaming is supported. The request carries a Message with a client-made messageId, a role of ROLE_USER, and a list of parts, each holding text, a file or structured data.[^6] The server can answer with a direct Message for something simple, or with a Task that it will keep working on. Task ids are always generated by the server; a client cannot pick the id of a new task.[^6]",
    },
    {
      type: 'code',
      essential: true,
      lang: 'json',
      title: 'SendStreamingMessage over JSON-RPC (shape from the A2A 1.0 spec)',
      code: `{
  "jsonrpc": "2.0", "id": 1,
  "method": "SendStreamingMessage",
  "params": { "message": {
    "messageId": "msg-1", "role": "ROLE_USER",
    "parts": [{ "text": "Book 2 nights in Lisbon, 3 to 5 May" }]
  } }
}`,
    },
    {
      type: 'p',
      text: "Two threats from Habler land on this message. **Task replay**: an attacker who captures a valid send request and replays it can get the same task executed again, so they recommend a nonce and a timestamp window on each request, message authentication codes, and idempotent task design.[^2] **Schema violation**: a malicious client crafts malformed messages or parts to exploit weak validation on the server.[^2] Both were written against the older tasks/send method, but the message they describe is the same one.",
    },
    {
      type: 'p',
      text: "The bigger question is what goes into the parts, because the remote agent is a language model that another agent can talk to. Louck and colleagues tested this with two Gemini 2.0 Flash agents. The baseline agent kept a simulated credit card and ID number in its conversational memory. The second agent never put the secrets in its prompt and used a direct user-to-service channel instead. They ran 9 prompt-injection prompts 5 times each against both.[^4]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Share of runs that leaked the secret, per injection prompt',
      yLabel: 'Leak rate (%)',
      series: [
        { label: 'Secret in agent memory', key: 'a', baseline: true },
        { label: 'Secret kept out of the prompt', key: 'b' },
      ],
      data: [
        { label: 'Say ID as words', values: { a: 80, b: 0 } },
        { label: 'Regex matching ID', values: { a: 60, b: 0 } },
        { label: 'Digit by digit', values: { a: 100, b: 0 } },
        { label: 'ID as digit words', values: { a: 100, b: 0 } },
        { label: 'Spoken to numeric', values: { a: 80, b: 0 } },
        { label: 'Spell digits', values: { a: 100, b: 0 } },
        { label: 'Understanding check', values: { a: 100, b: 0 } },
        { label: 'ASCII of card', values: { a: 100, b: 0 } },
        { label: 'Remind ID', values: { a: 80, b: 0 } },
      ],
      caption: 'Redrawn from Table I of Louck et al., 2025.[^4] Five runs per prompt per agent, both on Gemini 2.0 Flash. The second agent leaked nothing in 45 attempts.',
    },
    {
      type: 'p',
      text: "The baseline leaked in 60% to 100% of runs on every prompt; the other agent leaked in none of its 45 attempts, at a cost of somewhat higher response time on some prompts.[^4] Read the zero carefully. The second agent could not leak the secret because it never had it, and the authors' own model says leakage drops to zero precisely because the data is not in the prompt.[^4] So the experiment does not show a prompt-injection defense that works. It shows that the only reliable protection they tested was to keep sensitive data out of the delegated agent's context entirely. That is the argument behind their proposal to route payments and ID documents straight from user to service provider.[^4]",
    },
    {
      type: 'h2',
      text: 'Step 4: the conversation continues, and the context has no owner',
    },
    {
      type: 'p',
      text: "Delegation is rarely one message. The server's response carries a taskId and a contextId, and the contextId groups related tasks and messages into one conversational session. Agents MAY use it to keep conversational history or model context across interactions.[^6] The spec also lets a client send a contextId without a taskId to start a new task inside an existing context, and requires the server to reject a message whose contextId does not match the task it names.[^6]",
    },
    {
      type: 'image',
      src: '/blog-images/a2a-protocol/a2abreak-context-injection.webp',
      alt: 'Sequence diagram with three lifelines: Client A, Client B and the A2A server. Client A authenticates and sends a message, getting back task T1 in context X. Client B, the attacker, authenticates and sends a message with no taskId and contextId X. The server performs no ownership check and returns task T2 in context X, leaking the context. Later Client A sends another message in context X and gets a response from a poisoned context.',
      width: 1050,
      height: 620,
      caption: 'Cross-client context injection. Figure 6 from Lotfi et al., 2026,[^1] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: "Lotfi et al. found the gap in that design. Tasks are bound to the authenticated principal who created them, but a contextId has no creator field, no access token and no authorization requirement. The spec's authorization MUSTs cover task operations only.[^1] That matches the spec's own list, which names List Tasks, Get Task, Cancel, Subscribe and push-notification configuration.[^6] In the attack, Client B authenticates as a legitimate client and sends SendMessage with an empty taskId and the victim's contextId. The server checks only that the contextId and taskId are consistent, a check that passes, then creates a new task in the victim's context, and answers using the victim's accumulated history.[^1] The paper lists two harms: the attacker reads responses informed by the victim's state, and the victim's later tasks run on a history the attacker has poisoned.[^1]",
    },
    {
      type: 'p',
      text: "The attack needs the attacker to know a valid contextId. The paper states that condition and does not measure how hard it is to meet; the spec says only that clients should treat server-generated context ids as opaque.[^1,6]",
    },
    {
      type: 'h2',
      text: 'Step 5: status streams back, and a pause can travel up the chain',
    },
    {
      type: 'p',
      text: "With streaming, the server holds a Server-Sent Events connection open. The stream begins with the Task object, then carries TaskStatusUpdateEvent and TaskArtifactUpdateEvent objects, and must close when the task reaches a terminal state: completed, failed, canceled or rejected.[^6] Two non-terminal states are interruptions. TASK_STATE_INPUT_REQUIRED asks the client for more input. TASK_STATE_AUTH_REQUIRED asks the client to supply an authorization, and if the client is itself an agent working on a task, it may pass the request up to its own client by moving its task into the same state, which forms a chain of tasks in TASK_STATE_AUTH_REQUIRED.[^6]",
    },
    {
      type: 'p',
      text: "That chain is where the hop-by-hop identity from Step 2 breaks down. In Lotfi et al.'s **multi-hop identity loss** scenario, a user delegates to Agent A, which forwards the task to an adversary-controlled Agent B with its own credentials. B delegates to Agent C, which needs credentials for a third-party resource and returns TASK_STATE_AUTH_REQUIRED.[^1] The request propagates back with no principal identity, no chain identifier and no sign of which agent started it. The user sees an authorization request that seems to come from Agent A, and the credential provider has no protocol-level context to judge it by. An intermediary like B can keep and replay forwarded credentials beyond their intended scope.[^1] The spec says plainly that the protocol does not define the scope, validity or revocation semantics of a credential obtained through TASK_STATE_AUTH_REQUIRED.[^6]",
    },
    {
      type: 'p',
      text: "Louck and colleagues want a pause of a different kind. Their proposed TaskState, USER_CONSENT_REQUIRED, would stop execution until the end user explicitly approves an action such as a payment, which INPUT_REQUIRED does not guarantee because it only asks for more data.[^4] The A2ABreak table lists three more findings in the execution and interruption stages that the paper names without walking through: leakage over an SSE stream after revocation, no timeout out of interrupted states, and unverified webhook URLs for push notifications.[^1] On that last one the spec says agents SHOULD validate webhook URLs against server-side request forgery, for example by rejecting private IP ranges and localhost.[^6] Habler adds per-client connection quotas, idle timeouts and backpressure for long-lived streams.[^2]",
    },
    {
      type: 'h2',
      text: 'Step 6: artifacts come back, and the client cannot tell real work from fabrication',
    },
    {
      type: 'p',
      text: "Results arrive as artifacts. Each has an artifactId and a list of parts, and a TaskArtifactUpdateEvent can stream an artifact in chunks: append set to true means add this content to the artifact with the same id, and lastChunk marks the final piece.[^6] In the vacation example the confirmation codes come back this way, and the client agent folds them into what it tells the user.",
    },
    {
      type: 'p',
      text: "Habler lists **artifact tampering**, where an attacker intercepts or modifies artifacts in transit to inject content or corrupt results, and recommends digital signatures, hashes and checksums on artifacts.[^2] A2ABreak's table includes an artifact chunk integrity gap in the task execution stage.[^1] Signing would help against a party in the middle. It does nothing against the case Step 1 set up, where the remote agent itself is the adversary. The unattested-skill attack ends here, with fabricated artifacts that look like any other output, and the paper notes that in multi-agent chains those artifacts propagate downstream undetected.[^1] Because execution is opaque by design, a client has no mechanism to verify what a remote agent actually did with a task.[^1]",
    },
    {
      type: 'p',
      text: "There is one more hazard the papers raise at this boundary. Artifact text is untrusted content that the client's own model will read. Habler flags prompt injection embedded in message parts in their document-processing case study, and data poisoning in artifacts in their data-analysis case.[^2] The client agent is now in the position the remote agent was in at Step 3.",
    },
    {
      type: 'callout',
      title: 'Reading the six steps as a checklist',
      text: "Treat every card field as untrusted text before a model reads it. Verify card signatures where they exist, and remember they prove the publisher, not the skill.[^1,2] Keep secrets out of any agent context that does not need them.[^4] Check that your server ties contextId to its creator, since the spec does not require it.[^1] Decide your own rules for credentials obtained through TASK_STATE_AUTH_REQUIRED, because the protocol leaves them undefined.[^6]",
    },
    {
      type: 'h2',
      text: 'The claim nobody can verify yet',
    },
    {
      type: 'p',
      text: "Several of these problems have known fixes that the papers list: ownership checks on contexts, nonces against replay, short-lived scoped tokens, signed cards.[^1,2,4] The unattested skill is different. Lotfi et al. write that the AgentSkill object is a self-declared advertisement with no binding to actual capability, and that the specification introduces no planned mechanism to close this gap, so skill claims remain entirely trust-based.[^1] Ehtesham's survey places A2A in trusted organizational contexts and reserves open, decentralized agent markets for a different protocol.[^3] Habler's list of future work asks for robust mechanisms for agent identity verification and reputation management.[^2] Habler's mitigations mention registries and reputation systems for cards, but none of the papers here describes a mechanism that lets a client confirm, before it hands over the data, that an agent it has never met can actually do what its card says. The A2ABreak authors report that they disclosed all 11 findings to the A2A maintainers at the Linux Foundation and were awaiting a response when the paper was posted.[^1]",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Lotfi, Rahman, Karim, and Bertino, A2ABreak: Systematic Security Analysis of the A2A Protocol, ACSAC 2026 (arXiv 2609.10871)', url: 'https://arxiv.org/abs/2609.10871' },
        { title: 'Habler, Huang, Narajala, and Kulkarni, Building A Secure Agentic AI Application Leveraging A2A Protocol, 2025 (arXiv 2504.16902)', url: 'https://arxiv.org/abs/2504.16902' },
        { title: 'Ehtesham, Singh, Gupta, and Kumar, A Survey of Agent Interoperability Protocols: MCP, ACP, A2A, and ANP, 2025 (arXiv 2505.02279)', url: 'https://arxiv.org/abs/2505.02279' },
        { title: 'Louck, Stulman, and Dvir, Improving Google A2A Protocol: Protecting Sensitive Data and Mitigating Unintended Harms in Multi-Agent Systems, 2025 (arXiv 2505.12490)', url: 'https://arxiv.org/abs/2505.12490' },
        { title: 'Anbiaee et al., Security Threat Modeling for Emerging AI-Agent Protocols: A Comparative Analysis of MCP, A2A, Agora, and ANP, 2026 (arXiv 2602.11327)', url: 'https://arxiv.org/abs/2602.11327' },
        { title: 'A2A Protocol Specification, version 1.0 (Linux Foundation A2A project)', url: 'https://a2a-protocol.org/latest/specification/' },
      ],
    },
  ],
};

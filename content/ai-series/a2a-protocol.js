export const POST = {
  id: 'a2a-protocol',
  title: 'A2A: How One Agent Hands Work to an Agent It Never Met',
  excerpt: 'Your travel agent needs to book a flight, but the airline runs its own agent built by a different company. A2A is the handshake that lets the two work together without either team hardcoding the other.',
  category: 'AI',
  tags: ['Agents', 'A2A', 'Protocols'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'You tell your travel planning assistant to sort out a trip to Lisbon. It picks dates, suggests a hotel, and then reaches the part it cannot finish on its own. To actually book a seat, it needs the airline. The airline runs its own assistant, built by a different company, hosted somewhere you have never seen, with rules your travel app does not know. Your travel agent has never been told this airline agent exists. So how does it find it, ask it to do something, and get a confirmed booking back?'
    },
    {
      type: 'p',
      text: 'For a long time the honest answer was that it could not, at least not cleanly. Each company wrapped its agent in a private API, and every integration was a custom project. If your travel app wanted to work with four airlines, someone wrote four separate connectors by hand, and each one broke whenever an airline changed something. **A2A**, short for Agent2Agent, is an open protocol meant to end that. It gives agents a shared way to describe themselves, find each other, and pass work back and forth, even when they were built by teams that never spoke.'
    },
    {
      type: 'h2',
      text: 'A hotel concierge who knows other concierges'
    },
    {
      type: 'p',
      text: 'Picture a good hotel concierge. You ask for dinner and a show. The concierge does not cook or perform. What they do is know who to call. They have a rolodex of restaurants and box offices, they know what each one can do, and they know how to place a request in a form the other party will accept. You never talk to the restaurant directly. You state what you want, and the concierge routes it, waits for the answer, and comes back to you with a confirmed table.'
    },
    {
      type: 'p',
      text: 'A2A treats software agents the same way. An agent that needs something it cannot do itself looks for another agent that advertises the right skill, sends a request in an agreed format, and waits for the result. The value is that the two agents do not need a shared codebase or a prearranged contract written by hand. They need only to speak the same protocol. That is the shift worth holding onto before we get into parts.'
    },
    {
      type: 'h2',
      text: 'Watching the travel agent reach the airline'
    },
    {
      type: 'p',
      text: 'Let us walk the Lisbon booking one step at a time. Your travel agent has settled on a flight it wants: a specific route, date, and passenger. It knows the airline publishes an A2A agent, and it has the address. The first thing it does is fetch that agent\'s public description, a small document that lists what the airline agent can do and how to talk to it. Reading that document, the travel agent confirms the airline offers a "book flight" skill and learns which URL to send requests to.'
    },
    {
      type: 'p',
      text: 'Next the travel agent opens a task. It sends a message that says, in structured terms, "book this passenger on this flight" and includes the details. The airline agent accepts the task and starts working. It might need more from your side, say a frequent flyer number, so it can pause and ask. Your travel agent supplies the answer, the airline agent finishes, and it returns a result: a confirmation code, a seat, a receipt. That returned bundle is the payoff. Your travel agent folds it into the trip summary it shows you, and you never saw the two systems negotiate.'
    },
    {
      type: 'p',
      text: 'Notice how much of that flow depends on the task being a thing with a name and a state, not a single blocking call. Because the booking might take a while, the travel agent does not freeze waiting for a reply. It holds a task id and checks in on it, or receives updates as the state moves along. When the airline agent flips the task into an input-required state, the travel agent knows to gather one more detail rather than assume the whole thing failed. When the state reaches completed, it knows the artifact is ready to collect. This is the same pattern you would use with a slow human colleague. You give them the job, you get a ticket number, and you follow the ticket instead of standing over their desk.'
    },
    {
      type: 'diagram',
      title: 'Travel agent discovers and delegates to the airline agent',
      nodes: [
        { id: 'user', label: 'Traveler', icon: 'user', at: [0, 1] },
        { id: 'travel', label: 'Travel agent (Company A)', icon: 'service', at: [1, 1] },
        { id: 'card', label: 'Airline Agent Card', icon: 'datastore', at: [2, 0] },
        { id: 'airline', label: 'Booking agent (Company B)', icon: 'service', at: [3, 1] },
        { id: 'gds', label: 'Airline reservation system', icon: 'datastore', at: [4, 1] }
      ],
      edges: [
        { from: 'user', to: 'travel', label: 'plan my trip' },
        { from: 'travel', to: 'card', label: '1. fetch card' },
        { from: 'card', to: 'travel', label: 'skills + URL' },
        { from: 'travel', to: 'airline', label: '2. open task: book flight' },
        { from: 'airline', to: 'travel', label: '3. return confirmation' },
        { from: 'airline', to: 'gds', label: 'reserves seat' }
      ],
      caption: 'The travel agent had no prior knowledge of the airline agent. It learned everything it needed from the published Agent Card, then delegated the booking as a task.'
    },
    {
      type: 'h2',
      text: 'The four ideas that make the handoff work'
    },
    {
      type: 'p',
      text: 'That whole exchange rests on a few named concepts. Learn these four and the rest of A2A reads easily.'
    },
    {
      type: 'terms',
      items: [
        { term: 'A2A', def: 'An open protocol that standardizes how one autonomous agent talks to another over the network, so agents built by different teams or vendors can cooperate without custom, one-off integrations.' },
        { term: 'Agent Card', def: 'A published document, usually JSON at a well known URL, that describes an agent: its name, what skills it offers, where to send requests, and how to authenticate. It is how one agent learns another exists and what it can do.' },
        { term: 'Task lifecycle', def: 'A single unit of delegated work that moves through defined states, such as submitted, working, input-required, completed, or failed. Both agents track the same task by its id and watch its state change.' },
        { term: 'Capability discovery', def: 'The act of reading an agent\'s card to find out which skills it supports, so a client agent can pick the right partner at runtime instead of having one hardcoded.' }
      ]
    },
    {
      type: 'p',
      text: 'Inside a task, the two agents trade two kinds of content. **Messages** are the back and forth turns, the requests and clarifying questions. **Artifacts** are the finished outputs a task produces, like the booking confirmation. Keeping those separate matters: messages are the conversation, artifacts are the deliverables you keep.'
    },
    {
      type: 'h2',
      text: 'What an Agent Card actually looks like'
    },
    {
      type: 'p',
      text: 'The Agent Card is the piece that makes discovery possible, so it helps to see one. Here is a trimmed card the airline might publish. A client agent fetches this, reads the skills array, and now knows both that booking is on offer and where to send the request.'
    },
    {
      type: 'code',
      lang: 'json',
      title: 'airline agent card (simplified)',
      code: `{
  "name": "SkyRoute Booking Agent",
  "description": "Books and manages flight reservations",
  "url": "https://agents.skyroute.example/a2a",
  "version": "1.2.0",
  "capabilities": { "streaming": true },
  "defaultInputModes": ["text"],
  "defaultOutputModes": ["text"],
  "skills": [
    {
      "id": "book-flight",
      "name": "Book a flight",
      "description": "Reserve a seat on a specific flight for a passenger",
      "tags": ["booking", "flights"]
    }
  ]
}`
    },
    {
      type: 'p',
      text: 'Nothing here is airline specific in shape. Any A2A agent publishes a card in this same layout, which is exactly why a travel agent can read a card from an airline, a hotel, or a car rental service and treat them all the same way. The mechanism is a plain fetch of a document, a scan for the skill you need, and a request sent to the listed URL. The card also declares things like which input and output modes the agent accepts and whether it supports streaming, so the client knows how to shape the conversation before it starts one.'
    },
    {
      type: 'p',
      text: 'Capability discovery is the reason this scales. Your travel agent does not carry a hardcoded list of every airline it will ever work with. It resolves the right partner when the trip demands it, reads that partner\'s current card, and adapts. If SkyRoute adds a "change seat" skill next quarter, your agent sees it the moment it reads the updated card, with no code change on your side. That loose coupling is the same reason the web scaled: you link to an address and discover what is there at the moment you arrive, rather than compiling the other side into your program.'
    },
    {
      type: 'h2',
      text: 'Where A2A stops and MCP begins'
    },
    {
      type: 'p',
      text: 'People mix up A2A with MCP, the Model Context Protocol, because both are protocols for AI systems. They solve different problems and fit together. MCP connects a single agent to its tools and data: a database, a file store, a payments API. The thing on the other end of MCP is a resource that does what it is told and has no goals of its own. A2A connects an agent to another agent: a peer that can reason, ask you questions, and run its own multi step process. The thing on the other end of A2A has its own judgment.'
    },
    {
      type: 'p',
      text: 'A clean way to hold it: MCP is how your agent picks up a tool, A2A is how your agent calls a colleague. In the Lisbon trip, your travel agent might use MCP to read a weather API and query a hotel database, all tools it drives directly. Then it uses A2A to hand the booking to the airline agent, a peer it delegates to rather than controls. The two protocols stack. One gives an agent hands, the other gives it coworkers.'
    },
    {
      type: 'callout',
      title: 'One line to keep',
      text: 'MCP standardizes agent to tool. A2A standardizes agent to agent. If the other side follows orders, reach for MCP. If the other side makes its own decisions, reach for A2A.'
    },
    {
      type: 'h2',
      text: 'Mistakes people make when they first reach for A2A'
    },
    {
      type: 'p',
      text: 'The first trap is wrapping a plain tool as an agent. If a service just returns data on request and never reasons, exposing it over A2A adds ceremony you do not need. That is an MCP server. Reserve A2A for the case where the far side genuinely acts on its own.'
    },
    {
      type: 'ul',
      items: [
        'Treating a task as instant. Tasks can run long and pause for input. If your client fires a request and expects an answer in the same breath, it will break the first time the other agent needs a clarifying detail. Follow the task state instead.',
        'Confusing messages with artifacts. Do not dig the final confirmation out of chat turns. Read it from the artifact the task produces, which is the stable, structured output.',
        'Skipping the card and hardcoding the URL. The whole point is runtime discovery. If you paste the endpoint into your code, you lose the ability to swap partners and you break when the other team moves their agent.',
        'Ignoring authentication. The card tells you how the other agent expects to be authenticated. Sending unauthenticated requests, or assuming open access, fails in any real deployment.'
      ]
    },
    {
      type: 'h2',
      text: 'The takeaway'
    },
    {
      type: 'p',
      text: 'A2A exists so an agent can discover and delegate to another agent it never met, built by a team it never coordinated with. The parts are small: a card that advertises what an agent can do and where to reach it, capability discovery that reads that card at runtime, and tasks that carry the delegated work through a shared lifecycle while messages and artifacts flow between the two sides. Pair it with MCP, which handles the tools, and you have a full picture of how modern agents get things done. When you next see an assistant quietly book something on your behalf, you will know it probably did not do the booking itself. It found a peer that could, and asked.'
    },
    {
      type: 'sources',
      items: [
        { title: 'A2A Protocol specification and documentation', url: 'https://a2a-protocol.org/' },
        { title: 'A2A Project on GitHub (Linux Foundation)', url: 'https://github.com/a2aproject/A2A' },
        { title: 'Model Context Protocol documentation', url: 'https://modelcontextprotocol.io/' }
      ]
    }
  ]
};

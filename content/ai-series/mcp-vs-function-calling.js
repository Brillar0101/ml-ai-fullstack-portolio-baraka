export const POST = {
  id: 'mcp-vs-function-calling',
  title: 'MCP vs Function Calling vs a Plain API: Three Layers, Not Three Rivals',
  excerpt: 'A developer asks whether to reach for MCP or function calling. The honest answer is that they sit at different layers and usually work together. Here is how to tell them apart.',
  category: 'AI',
  tags: ['MCP', 'Function Calling', 'Tools'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A backend engineer I know spent an afternoon stuck on a single question before writing any code. She wanted her assistant to look up an order status from the company database. Every tutorial she opened seemed to answer a different question. One showed a JSON schema passed to a model. Another told her to stand up an **MCP server**. A third said to just call the REST endpoint she already had. She came away thinking these were three competing ways to do the same job, and that picking the wrong one meant rework later.'
    },
    {
      type: 'p',
      text: 'That framing is the trap. These are not three options on the same shelf. They live at different layers of the stack, and in most real systems two or three of them show up at once. Once you see where each one sits, the choice stops feeling like a fork in the road and starts feeling like plumbing that clicks together.'
    },
    {
      type: 'p',
      text: 'The reason the confusion is so common is that the three terms often appear in the same paragraph of a tutorial, doing different jobs, without anyone drawing the boundary between them. A blog post about MCP will show a function-calling schema in its first code block, because MCP leans on it. A guide to function calling will end by calling a REST endpoint, because that is where the real work lives. So a reader watching all three flash by can be forgiven for thinking they are interchangeable names for one idea. They are not, and the fastest way to prove it is to trace a single request and watch each piece take its turn.'
    },
    {
      type: 'h2',
      text: 'Picture a restaurant kitchen instead of a menu'
    },
    {
      type: 'p',
      text: 'Think about how food reaches a table. The stove does the actual cooking. That is your **plain API**, the raw machinery that does work: query a database, charge a card, fetch a weather reading. It does not care who asked or why. It just runs when called with the right inputs.'
    },
    {
      type: 'p',
      text: 'The waiter is the one who decides, based on what a guest said, that an order should go to the kitchen and writes down exactly what to make. That decision plus the written ticket is **function calling**. A model reads a request in plain language, decides a tool is needed, and produces a clean set of arguments for it.'
    },
    {
      type: 'p',
      text: 'Now imagine every restaurant in a city agreed on one standard ticket format and one standard way for any waiter to learn which dishes a kitchen offers. A new waiter could walk into any kitchen and get to work without a custom briefing. That shared agreement is **MCP**, the Model Context Protocol. It does not cook and it does not take the order. It standardizes how a kitchen advertises what it can make and how tickets travel between rooms.'
    },
    {
      type: 'p',
      text: 'Hold that picture. The stove, the waiter, and the citywide standard are not rivals. They are three parts of getting one plate served. Notice too that you could run a kitchen with no citywide standard at all. Plenty of restaurants do. The standard only pays off when the same waiter needs to serve many kitchens or many waiters need to read the same menu. Keep that condition in mind, because it is the whole reason MCP exists and the main signal for when to bother with it.'
    },
    {
      type: 'h2',
      text: 'Walking through one order-status lookup'
    },
    {
      type: 'p',
      text: 'Go back to the engineer with the order database. Follow a single request through all three layers and the boundaries become concrete.'
    },
    {
      type: 'p',
      text: 'A user types "where is order 4021?" The model sees that message along with a description of an available tool called getOrderStatus. It decides this tool fits and emits a small object like {"order_id": "4021"}. That step, deciding and filling in arguments, is function calling and nothing more. The model has not touched the database. It has only produced a structured request.'
    },
    {
      type: 'p',
      text: 'Your application code receives that object, then calls the actual endpoint, something like GET /orders/4021 against your service. That HTTP call is the plain API doing the real work and returning rows. The model was never in the room for that part.'
    },
    {
      type: 'p',
      text: 'So where does MCP come in? If getOrderStatus lives on an MCP server, then the description the model saw, the argument shape it filled, and the channel that carried the call all followed one shared spec. Any MCP-aware app could connect to that same server and discover getOrderStatus without you rewriting the wiring. Without MCP, you hand-code that tool definition inside one app and it stays there.'
    },
    {
      type: 'p',
      text: 'Read that sequence once more and count how many layers the model actually participated in. Exactly one, the function-calling step. It read a description, made a judgment, and wrote arguments. It did not open a socket, run a query, or read a config file. Everything after the arguments was ordinary application code and an ordinary HTTP call. This is worth dwelling on because a lot of anxiety about giving a model tools comes from imagining the model doing far more than it does. In practice the model is a decision maker handing tickets to code you already trust. The database credentials, the retry logic, and the error handling all stay on your side of the line.'
    },
    {
      type: 'diagram',
      nodes: [
        { label: 'User message', detail: '"where is order 4021?"' },
        { label: 'Function calling', detail: 'model picks tool, emits {order_id: 4021}' },
        { label: 'MCP layer', detail: 'standard discovery + transport of the call' },
        { label: 'Plain API', detail: 'GET /orders/4021 hits the database' },
        { label: 'Result back to model', detail: 'rows become a natural answer' }
      ],
      caption: 'One lookup passing through all three layers. Each does a separate job.'
    },
    {
      type: 'h2',
      text: 'The four words worth pinning down'
    },
    {
      type: 'terms',
      items: [
        { term: 'Function calling', def: 'The model behavior where an LLM decides a tool is needed and returns structured arguments for it. The model chooses and fills in; it does not run anything.' },
        { term: 'Tool schema', def: 'A machine-readable description of a tool: its name, what it does, and the shape of its inputs. This is what the model reads to know a tool exists and how to call it.' },
        { term: 'MCP', def: 'The Model Context Protocol, an open standard for how tools and data are discovered by and exposed to any model or app. It defines a common contract so servers and clients interoperate.' },
        { term: 'Transport', def: 'The channel an MCP client and server talk over. Two common ones are stdio, where a local process reads and writes standard streams, and HTTP for servers reached over a network.' }
      ]
    },
    {
      type: 'h2',
      text: 'What actually happens under the hood'
    },
    {
      type: 'p',
      text: 'Here is the part that clears up most of the confusion. MCP uses function calling; it does not replace it. When an MCP server exposes a tool, the client fetches that tool schema and hands it to the model. The model still does the same job it always did: read the schemas, decide, and emit arguments. MCP standardized the two things around that moment. First, discovery, meaning how the app learns which tools exist. Second, exposure, meaning the common format tools and their results are wrapped in so any client understands them.'
    },
    {
      type: 'p',
      text: 'The clearest way to feel the difference is to define the exact same tool twice. Once as a raw function-calling schema you paste into a single app, and once registered on an MCP server that any client can reach.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'The same tool, two layers',
      code: `# Layer 1: a raw function-calling schema.
# Lives inside one app. The model reads this and emits arguments.
order_tool = {
    "name": "get_order_status",
    "description": "Look up the current status of a customer order",
    "input_schema": {
        "type": "object",
        "properties": {"order_id": {"type": "string"}},
        "required": ["order_id"],
    },
}

# Layer 2: the same tool registered on an MCP server.
# Now ANY MCP client can discover it, no per-app rewiring.
from mcp.server.fastmcp import FastMCP

app = FastMCP("orders")

@app.tool()
def get_order_status(order_id: str) -> str:
    """Look up the current status of a customer order."""
    return db.fetch_status(order_id)  # your plain API call

app.run(transport="stdio")`
    },
    {
      type: 'p',
      text: 'Read those two halves side by side. The tool is identical in spirit. In layer one you own the schema and it stays glued to one codebase. In layer two the MCP decorator generates that same schema from the function signature and docstring, publishes it so clients can discover it, and carries calls over a transport. The model behavior in front of both is the same function calling either way.'
    },
    {
      type: 'p',
      text: 'The transport choice in that second block is easy to skip past, but it carries real weight. Setting transport to stdio means the server runs as a local process and talks over standard input and output, which suits a tool that lives on the same machine as the app, like a file reader for a desktop assistant. Switching to HTTP means the server listens on a network address and any authorized client can reach it, which suits a shared company tool that many apps hit. Same tool logic, very different deployment and security posture. Deciding the transport is really deciding who is allowed to reach the tool and from where, so it deserves a moment of thought rather than a copy-paste default.'
    },
    {
      type: 'diagram',
      title: 'Which layer do you actually need?',
      root: {
        label: 'Do you control both the app and the tool, one time only?',
        color: 'purple',
        children: [
          {
            edge: 'One app, one tool, no reuse',
            node: { label: 'Plain function calling: hand-write the schema', color: 'yellow' }
          },
          {
            edge: 'Same tool reused across many apps or clients',
            node: { label: 'Wrap it in an MCP server so any client discovers it', color: 'yellow' }
          },
          {
            edge: 'You just need work done, no model deciding',
            node: { label: 'Call the plain API directly, skip the model', color: 'yellow' }
          }
        ]
      },
      caption: 'The deciding factor is reuse and ownership, not which technology is newer.'
    },
    {
      type: 'h2',
      text: 'Where people trip themselves up'
    },
    {
      type: 'ul',
      items: [
        'Treating MCP as a replacement for function calling. It sits on top of function calling and still relies on it. If the model cannot pick tools well, MCP will not fix that.',
        'Reaching for an MCP server when a single app needs a single tool. That is extra moving parts for no payoff. A hand-written schema is fine when nothing else will ever connect to that tool.',
        'Letting the model call a plain API when no decision is involved. If your code already knows it must fetch order 4021, just call the endpoint. Routing it through a model wastes tokens and adds latency.',
        'Forgetting the transport question. A local stdio server and a networked HTTP server have different security and deployment stories. Pick deliberately.',
        'Assuming MCP means you no longer write tool logic. You still write the real function behind it. MCP standardizes the wrapper, not the work.'
      ]
    },
    {
      type: 'callout',
      title: 'The one-line test',
      text: 'Ask who is deciding and who is standardizing. If a model decides to call a tool, that is function calling. If the underlying HTTP work happens, that is the plain API. If many clients need to discover the same tools through one contract, that is MCP. A single request can touch all three.'
    },
    {
      type: 'h2',
      text: 'What to hold onto'
    },
    {
      type: 'p',
      text: 'The engineer with the order lookup was never really choosing between MCP and function calling. She was going to use function calling no matter what, because a model had to decide when to fetch an order. She was going to hit a plain API no matter what, because something had to touch the database. The only open question was whether to standardize the tool behind MCP, and that depended entirely on whether other apps would ever need the same tool.'
    },
    {
      type: 'p',
      text: 'So drop the versus framing. Function calling is the model deciding and filling in arguments. A plain API is the raw work getting done. MCP is the shared contract that lets any client find and reach your tools. Start with function calling and a plain API for a single app. Reach for MCP the moment you want that tool to be reused somewhere else without copying wiring around. Seen that way, they stack neatly, and the afternoon of confusion turns into a fifteen-minute decision.'
    },
    {
      type: 'sources',
      items: [
        { title: 'OpenAI: Function calling guide', url: 'https://platform.openai.com/docs/guides/function-calling' },
        { title: 'Anthropic: Tool use (function calling)', url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use' },
        { title: 'Model Context Protocol: Introduction', url: 'https://modelcontextprotocol.io/introduction' }
      ]
    }
  ]
};

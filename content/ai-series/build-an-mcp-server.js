export const POST = {
  id: 'build-an-mcp-server',
  title: 'Give Your Assistant Your Notes: Build a Minimal MCP Server Over Stdio',
  excerpt: 'Your AI assistant cannot read the notes folder on your laptop, and it never will unless you hand it a door. An MCP server is that door. Here is the smallest one that actually works.',
  category: 'AI',
  tags: ['MCP', 'Hands-on', 'Python'],
  readTime: '9 min read',
  body: [
    {
      type: 'p',
      text: 'You keep a folder of notes. Meeting jottings, half-formed ideas, the command you always forget, a running log of what broke last Tuesday. Your AI assistant has no idea any of it exists. You can paste a note into the chat and it will happily reason about it, but the moment you ask \'what did I write about the deploy failure,\' the model shrugs, because the folder lives on your machine and the model lives somewhere else. There is no wire between them. This post is about building that wire, and the smallest useful version of it takes maybe forty lines of Python.'
    },
    {
      type: 'p',
      text: 'The wire has a name. It is the **Model Context Protocol**, or MCP, an open standard for how an AI application asks an outside program for tools and data. Instead of every assistant inventing its own plugin format, MCP gives them one shared language. You write a small server that knows how to search your notes, and any MCP-aware host can talk to it. We are going to write exactly that server, run it, and watch a client discover the tool and call it.'
    },
    {
      type: 'h2',
      text: 'Why the model cannot just read your folder'
    },
    {
      type: 'p',
      text: 'Start with the intuition, because it explains every design choice that follows. A language model is a function that turns text into text. It has no hands. It cannot open a file, hit an API, or list a directory. When an assistant appears to do those things, something else is doing them on the model\'s behalf and feeding the results back in as more text. That something is the gap MCP fills. The model says \'I would like to call the tool named search_notes with the query deploy failure,\' and a separate program actually runs the search and returns the matching lines.'
    },
    {
      type: 'p',
      text: 'So there are always two sides. On one side is the thing that wants information: the host application, with the model inside it. On the other side is the thing that has information: your notes folder, wrapped in a small program. MCP is the agreement about how those two sides speak. Your job, when you build a server, is to describe what you can do in a way the model can understand, and to actually do it when asked.'
    },
    {
      type: 'p',
      text: 'Before we write code, here is the shape of the finished system, so you know where each piece sits.'
    },
    {
      type: 'diagram',
      title: 'The finished setup: host to client to your server to your notes',
      nodes: [
        { id: 'host', label: 'Host app (with model)', icon: 'model', at: [0, 0] },
        { id: 'client', label: 'MCP client', icon: 'service', at: [1, 0] },
        { id: 'server', label: 'Your notes server', icon: 'service', at: [2, 0] },
        { id: 'fn', label: 'search_notes()', icon: 'service', at: [3, 0] },
        { id: 'notes', label: 'notes/ folder', icon: 'datastore', at: [3, 1] }
      ],
      edges: [
        { from: 'host', to: 'client', label: 'asks for tools' },
        { from: 'client', to: 'server', label: 'stdio' },
        { from: 'server', to: 'fn', label: 'runs handler' },
        { from: 'fn', to: 'notes', label: 'reads files' }
      ],
      caption: 'The model never touches your files. It asks the client, the client speaks MCP to your server, and your server runs a plain Python function that reads the folder.'
    },
    {
      type: 'p',
      text: 'Read that left to right. The host holds the model and decides it needs help. The client is the host\'s mouthpiece for MCP; it knows the protocol so the host does not have to. It connects to your server. Your server exposes one tool. When the tool is called, a normal Python function reads the folder and hands back text. Nothing exotic happens at any step, which is the point.'
    },
    {
      type: 'h2',
      text: 'The four words you need before writing a line'
    },
    {
      type: 'p',
      text: 'A handful of terms carry the whole design. Get these straight and the code reads itself.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Tool handler', def: 'The actual function that runs when the tool is called. It takes the arguments the model supplied and returns a result. For us, it opens the notes folder and returns matching lines.' },
        { term: 'Input schema', def: 'A machine-readable description of what arguments the tool accepts, their types, and which are required. The model reads this to know how to call the tool correctly. In Python SDKs it is usually generated from your function\'s type hints.' },
        { term: 'Stdio transport', def: 'The channel the client and server talk over. With stdio, the host launches your server as a subprocess and they exchange messages through standard input and output. No network, no ports, just two pipes.' },
        { term: 'Capability', def: 'Something a server advertises that it can do, such as offering tools, resources, or prompts. When a client connects, the two sides compare capabilities so each knows what the other supports.' }
      ]
    },
    {
      type: 'p',
      text: 'Notice how these fit together. A **capability** says \'I offer tools.\' Each tool comes with an **input schema** so the model can call it right. When a call arrives, the **tool handler** runs. All of it travels over the **stdio transport**. Keep those four in mind and the rest is plumbing.'
    },
    {
      type: 'h2',
      text: 'Define and register the tool'
    },
    {
      type: 'p',
      text: 'We will use the Python SDK\'s FastMCP style, where a decorator turns a plain function into a registered tool. The decorator does three jobs at once: it names the tool, it reads your function\'s docstring as the description the model sees, and it builds the input schema from your type hints. That is why the function below looks almost ordinary. The MCP-specific part is the single line above it.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'server.py: one tool that searches your notes',
      code: `from pathlib import Path
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("notes")
NOTES_DIR = Path.home() / "notes"

@mcp.tool()
def search_notes(query: str, limit: int = 5) -> str:
    """Search the user's notes folder for lines containing the query.

    Returns matching lines with their file name, newest files first.
    Use this whenever the user asks about something they wrote down.
    """
    query_lower = query.lower()
    hits = []
    for path in sorted(NOTES_DIR.glob("*.md"), reverse=True):
        for n, line in enumerate(path.read_text().splitlines(), start=1):
            if query_lower in line.lower():
                hits.append(f"{path.name}:{n}: {line.strip()}")
                if len(hits) >= limit:
                    return "\\n".join(hits)
    return "\\n".join(hits) if hits else "No matching notes found."`
    },
    {
      type: 'p',
      text: 'Walk through what the decorator captured. The tool name is search_notes, taken from the function name. The description is the docstring, and it is written for the model, not for you; it says plainly when to reach for this tool. The input schema comes from the signature: query is a required string, limit is an optional integer that defaults to five. The model reads all of that and knows it can call search_notes with a query and, if it wants, a limit. The body is just Python. It globs the folder, scans each file for the query, collects matches, and stops once it has enough.'
    },
    {
      type: 'p',
      text: 'That single decorator is the registration step. There is no separate table you maintain, no list you have to remember to update. Decorate a function and it becomes part of the server\'s tools capability. Want a second tool that lists recent notes? Write another function, add the decorator, done.'
    },
    {
      type: 'h2',
      text: 'Start the server on stdio'
    },
    {
      type: 'p',
      text: 'A server that is defined but never started is furniture. Starting it means picking a transport and running the loop that waits for messages. Because we want the host to launch our server as a subprocess, we choose stdio. The whole thing is one call.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'The last two lines of server.py',
      code: `if __name__ == "__main__":
    # Talk over standard input and output so a host can
    # launch this file as a subprocess and pipe messages in.
    mcp.run(transport="stdio")`
    },
    {
      type: 'p',
      text: 'When this runs, the process sits quietly reading from standard input. It is not a web server; it does not open a port or print a URL. It waits for a client to write MCP messages to its input pipe and it writes replies to its output pipe. This is why stdio is the friendliest transport to start with. There is nothing to configure, no address to get wrong, and the host controls the server\'s whole lifetime by starting and stopping the subprocess.'
    },
    {
      type: 'callout',
      title: 'Do not print to stdout',
      text: 'On stdio, standard output is the message channel. A stray print() or a library that logs to stdout will inject garbage into the protocol stream and the client will fail to parse it. Send any logging to standard error instead. This trips up almost everyone the first time.'
    },
    {
      type: 'h2',
      text: 'How a host discovers the tool and calls it'
    },
    {
      type: 'p',
      text: 'Now the other side. A host does not magically know your server offers search_notes. It finds out through a short conversation that happens right after it connects. The client launches your server, the two exchange an initialize handshake where they compare capabilities, and then the client asks \'what tools do you have.\' Your server answers with the name, description, and input schema of every decorated function. Only after that does the model get to see the tool as an option and decide to call it.'
    },
    {
      type: 'diagram',
      title: 'What happens after the client connects',
      nodes: [
        { id: 'init', label: 'initialize', detail: 'compare capabilities' },
        { id: 'list', label: 'list tools', detail: 'server sends name + schema' },
        { id: 'pick', label: 'model chooses', detail: 'calls search_notes' },
        { id: 'run', label: 'handler runs', detail: 'reads folder, returns text' }
      ],
      caption: 'Discovery is a real step, not an assumption. The client asks what exists before the model ever calls anything.'
    },
    {
      type: 'p',
      text: 'You can drive this yourself without a full chat app. The SDK ships a client you can point at your script, which is the fastest way to prove the whole loop works before wiring it into a real assistant.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'client.py: connect, list tools, call one',
      code: `import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    params = StdioServerParameters(command="python", args=["server.py"])
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            tools = await session.list_tools()
            print("Discovered:", [t.name for t in tools.tools])

            result = await session.call_tool(
                "search_notes", {"query": "deploy failure"}
            )
            print(result.content[0].text)

asyncio.run(main())`
    },
    {
      type: 'p',
      text: 'Run python client.py and you will see the client launch your server, print Discovered: [\'search_notes\'], and then print the lines from your notes that mention the deploy failure. That output came the long way around: the client called the tool, your server ran the handler, the handler read the folder, and the text traveled back over the pipe. In a real assistant the model sits where your call_tool line is, choosing the query itself based on what you asked in plain language.'
    },
    {
      type: 'h2',
      text: 'The mistakes that cost people an afternoon'
    },
    {
      type: 'p',
      text: 'A few things go wrong often enough to name. The first is blocking the event loop. FastMCP runs on async underneath, and if your handler does something slow and synchronous, like reading a thousand large files or calling a slow API without awaiting, it freezes the whole server while it works. For our tiny folder it does not matter, but the moment a handler gets heavy, run the slow part in a thread or use async I/O so the server stays responsive.'
    },
    {
      type: 'ul',
      items: [
        'A vague tool description. The docstring is the model\'s only guide for when to use the tool. \'Searches stuff\' gives it nothing. \'Search the user\\\'s notes for lines containing the query, use when they ask about something they wrote down\' tells it exactly when to reach for you.',
        'A missing or sloppy schema. If you drop the type hints, the model has to guess what arguments to send, and it will guess wrong. Type every parameter, and mark optional ones with defaults so the schema knows what is required.',
        'Printing to stdout on the stdio transport, which corrupts the message stream. Log to standard error.',
        'Returning giant blobs. If your handler dumps an entire file, you flood the model\\\'s context. Return the matching lines and a file name, and let the model ask for more if it needs it.'
      ]
    },
    {
      type: 'p',
      text: 'Every one of these is really the same lesson wearing a different hat: the server is talking to a model, and the model only knows what you tell it. Clear names, honest schemas, tight results, and a clean channel. Get those right and the model uses your tool well.'
    },
    {
      type: 'h2',
      text: 'What you actually built'
    },
    {
      type: 'p',
      text: 'Step back and count the pieces, because there were fewer than it felt like. You wrote one function that searches a folder. You put a decorator on it, which named it, described it, and built its input schema. You started the server on the stdio transport with a single call. Then you watched a client connect, discover the tool through the capability handshake, and call it. That is a complete MCP server, and it is genuinely useful the moment you point a real assistant at it instead of the test client.'
    },
    {
      type: 'p',
      text: 'The reason this matters is that the pattern does not stop at notes. The exact same four moves, define a handler, let the decorator build the schema, register it, start the transport, expose anything you can write a Python function for. Your calendar, a database, the ticket system at work, the weather. Each one is another door you hand your assistant. Today you built the smallest one so the shape is clear. The next one is just a different function behind the same decorator.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Model Context Protocol: Quickstart and Python SDK', url: 'https://modelcontextprotocol.io/quickstart/server' },
        { title: 'Model Context Protocol: Core concepts and specification', url: 'https://modelcontextprotocol.io/docs/concepts/architecture' },
        { title: 'Anthropic: Introducing the Model Context Protocol', url: 'https://www.anthropic.com/news/model-context-protocol' }
      ]
    }
  ]
};

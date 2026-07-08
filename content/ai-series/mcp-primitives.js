// AI Series. Block-array format matching seriesPosts.js.
// Registered in src/data/aiPosts.js and rendered by SeriesPost.jsx.

export const POST = {
  id: 'mcp-primitives',
  title: 'Tools, resources, and prompts: the three MCP primitives and who gets to trigger each one',
  excerpt: 'An MCP server can expose three kinds of thing, and the difference that matters is not what they do but who is allowed to pull the trigger. Here is that boundary, built around one small notes app.',
  category: 'AI',
  tags: ['MCP', 'Tools', 'Resources'],
  readTime: '8 min read',
  publishAt: '2026-07-12T12:00:00Z',
  body: [
    { type: 'p', text: 'Say you keep all your notes as plain text files in one folder, and you want your AI assistant to help with them. You want three things. You want to ask it to find every note that mentions a client. You want it to read the full text of a specific note when you point at one. And you want a one-click "summarize my week" routine that pulls the last seven days and writes you a recap. Those three wishes look similar from the outside. They all touch your notes. But when you sit down to build the connector that exposes your notes to the assistant, you find they are not the same shape at all, and the thing that separates them is a question of control: who decides when each one runs.' },
    { type: 'p', text: 'That connector is an **MCP server**. MCP, the Model Context Protocol, is a standard way for an application like a chat client to talk to an outside system like your notes folder. The server you build can expose three distinct kinds of capability, called **primitives**: tools, resources, and prompts. Most people meet tools first and assume the other two are just variations on the theme. They are not. The clean way to hold all three in your head is to ask, for each one, whose hand is on the trigger. The answer is different every time, and once you see that, the whole protocol snaps into focus.' },
    { type: 'h2', text: 'Three primitives, three different hands on the trigger' },
    { type: 'p', text: 'Here is the intuition before any code. Think of three parties in the room. There is the **model**, the language model doing the reasoning. There is the **host application**, the client program the user actually clicks around in, like a desktop chat app. And there is the **user**, you, typing and choosing. Each MCP primitive is designed so that exactly one of those three parties is in charge of firing it. Tools are fired by the model. Resources are surfaced by the host application. Prompts are chosen by the user. Get that mapping right and you will never misplace a feature again.' },
    { type: 'p', text: 'Walk it through the notes app. The search feature is a **tool**. You never call it directly. You ask the assistant "which notes talk about the Rivera account," and the model decides on its own to call your search function with the query "Rivera," reads what comes back, and answers you. You did not press a search button. The model chose to act. That is the signature of a tool: the model is the one who decides to invoke it, in the middle of its reasoning, without waiting for a human to ask for that specific call.' },
    { type: 'p', text: 'The individual note files are **resources**. A resource is a piece of data the server makes available for reading, and the host application is the one that pulls it in. Picture the app showing a sidebar of your notes; when you attach "meeting-2026-07-01.txt" to the conversation, the app reads that resource and drops its contents into context. The model did not go fetch it. The app surfaced it because the interface let you pick it. Resources are addressed by a **URI**, a text address like `note:///meeting-2026-07-01.txt`, the same way a web page has a URL. The app uses that address to ask the server for the bytes.' },
    { type: 'p', text: 'The "summarize my week" routine is a **prompt**. In MCP a prompt is a prewritten, parameterized workflow that the server offers and the user deliberately picks, often from a menu or a slash command. When you choose it, the server fills in a template, maybe pulling the last seven days of notes, and hands the model a ready-made instruction to follow. Nothing runs until you select it. That is the mark of a prompt: the user is the one who reaches out and starts it.' },
    { type: 'p', text: 'So the same folder of notes is exposed three ways, and the split is entirely about who initiates. Let me pin the terms down before going deeper, because the rest leans on them.' },
    { type: 'terms', items: [
      { term: 'Tool', def: 'A function the server exposes that the model can call on its own during a turn. Model-controlled. Used for actions and lookups the assistant decides it needs, like running a search or writing a file.' },
      { term: 'Resource', def: 'A piece of readable data the server offers, surfaced by the host application into the conversation. Application-controlled. Used for context the app or user attaches, like a file or a database record.' },
      { term: 'Prompt', def: 'A templated, parameterized workflow the server publishes for the user to pick, often as a slash command or menu item. User-controlled. Used for repeatable routines the person starts on purpose.' },
      { term: 'URI resource', def: 'A resource identified by a URI, a text address such as note:///meeting-2026-07-01.txt. The address, not a numeric position, is how the host asks the server for that exact piece of data.' },
    ]},
    { type: 'h2', text: 'The same folder, wired three ways' },
    { type: 'p', text: 'A diagram makes the control boundary concrete. Each primitive sits between the notes folder and a different controller. Follow which party the arrow starts from.' },
    { type: 'diagram', title: 'Who triggers each primitive', rows: [
      [{ label: 'Notes folder', detail: 'plain text files on disk, the shared source' }],
      [{ label: 'search TOOL', detail: 'model calls it mid-reasoning' }, { label: 'note RESOURCES', detail: 'app surfaces them by URI' }, { label: 'summarize PROMPT', detail: 'user picks it from a menu' }],
      [{ label: 'Model', detail: 'decides to act' }, { label: 'Host application', detail: 'attaches the data' }, { label: 'User', detail: 'starts the routine' }],
    ], caption: 'One notes folder, three primitives, three controllers. The top row is the shared data. The middle row is what the MCP server exposes. The bottom row is who pulls the trigger for each.' },
    { type: 'p', text: 'Now the mechanism, which is simpler than it sounds. An MCP server is a small program that speaks the protocol over a channel, usually a local pipe or an HTTP stream. When the host connects, it asks the server three questions: what tools do you have, what resources can I read, and what prompts do you offer. The server answers with three lists. From then on, each primitive is invoked through its own request type. The model triggers a tool by sending a call-tool request with arguments. The host reads a resource by sending a read-resource request carrying the URI. The user launches a prompt by sending a get-prompt request with any parameters it needs, and the server returns the filled-in messages. Same server, three doorways, one per primitive.' },
    { type: 'p', text: 'Here is a stripped-down server for the notes app that registers one of each. The exact function names come from the Python SDK, but read it for the shape, not the syntax.' },
    { type: 'code', lang: 'python', title: 'notes_server.py', code: `from mcp.server.fastmcp import FastMCP
from pathlib import Path

mcp = FastMCP("notes")
NOTES = Path("./notes")

# TOOL: the model calls this on its own to search.
@mcp.tool()
def search_notes(query: str) -> list[str]:
    hits = []
    for f in NOTES.glob("*.txt"):
        if query.lower() in f.read_text().lower():
            hits.append(f.name)
    return hits

# RESOURCE: the app reads a note by its URI address.
@mcp.resource("note:///{name}")
def read_note(name: str) -> str:
    return (NOTES / name).read_text()

# PROMPT: the user picks this routine from a menu.
@mcp.prompt()
def summarize_my_week() -> str:
    files = sorted(NOTES.glob("*.txt"))[-7:]
    joined = "\\n\\n".join(f.read_text() for f in files)
    return f"Summarize these notes into a short weekly recap:\\n{joined}"

mcp.run()` },
    { type: 'p', text: 'Notice how the decorators declare the primitive, not the code inside. The body of `search_notes` and `read_note` is almost identical; both open files and return text. What makes one a tool and the other a resource is the promise you are making to the host about who calls it. `search_notes` is advertised as an action the model may take. `read_note` is advertised as data the app may pull by URI. The protocol treats them as different kinds of thing on purpose, so the host can present them differently in its interface.' },
    { type: 'h2', text: 'Where people wire it up wrong' },
    { type: 'p', text: 'The most common mistake is turning everything into a tool. It is tempting, because tools feel powerful and the model can reach them without help. So people expose "get_note" as a tool and let the model fetch any file it wants. That works, but it hands the model control over what enters context, which means it can read the wrong note, read too many, or burn tokens hunting around. When the data is something the user or app should choose, a resource is the honest fit. Reserve tools for genuine actions and decisions, and let resources carry the "here, look at this specific thing" cases.' },
    { type: 'p', text: 'The second mistake is the mirror image: cramming a fixed workflow into the system prompt instead of publishing it as a prompt. If "summarize my week" lives only in your instructions, the user cannot see it, cannot trigger it cleanly, and cannot pass a parameter like which week. A prompt primitive gives that routine a name, a slot in the menu, and arguments. It becomes a thing the user can point at, which is exactly what a user-controlled workflow should be.' },
    { type: 'p', text: 'A third and quieter mistake is treating resource addresses casually. Because resources are fetched by URI, the address is the contract. If you generate URIs that change between runs, or that collide, the host cannot reliably re-read the note you meant. Keep them stable and specific, the way you would keep a permalink stable, and the app can always ask for the exact record it showed the user a minute ago.' },
    { type: 'callout', title: 'The one question that sorts everything', text: 'When you are unsure which primitive a feature should be, do not ask what it does. Ask who should decide when it runs. Model decides, make it a tool. App or user attaches it as data, make it a resource. User launches it as a routine, make it a prompt. The control boundary is the design.' },
    { type: 'p', text: 'The takeaway is small and durable. MCP gives a server three ways to offer capability, and the difference between them is a difference in authority, not in mechanism. Tools put the model in charge, so use them for actions the assistant should take on its own. Resources put the application in charge, so use them for data the interface hands over, addressed by a stable URI. Prompts put the user in charge, so use them for the routines a person deliberately starts. Build your next server by first drawing that three-way boundary, and the pieces will fall where they belong.' },
    { type: 'sources', items: [
      { title: 'Model Context Protocol: Tools', url: 'https://modelcontextprotocol.io/docs/concepts/tools' },
      { title: 'Model Context Protocol: Resources', url: 'https://modelcontextprotocol.io/docs/concepts/resources' },
      { title: 'Model Context Protocol: Prompts', url: 'https://modelcontextprotocol.io/docs/concepts/prompts' },
      { title: 'Anthropic: Model Context Protocol overview', url: 'https://docs.anthropic.com/en/docs/mcp' },
    ]},
  ],
};

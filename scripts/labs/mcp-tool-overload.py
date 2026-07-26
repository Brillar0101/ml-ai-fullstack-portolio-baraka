# Wire in a few MCP servers and the tool list grows
# fast. The model reads every schema on every call and
# picks from every option. Routing narrows both.

TOOLS = [
    ("create_ticket", "open a support ticket", False),
    ("search_tickets", "search existing tickets", False),
    ("post_slack", "post a message to slack", False),
    ("query_database", "run a read only sql query", False),
    ("list_files", "list files in drive", False),
    ("create_event", "add a calendar event", False),
    ("issue_refund", "issue a payment refund", True),
    ("read_logs", "read application logs", False),
    ("search_wiki", "search the internal wiki", False),
    ("web_search", "search the public web", False),
    ("send_email", "send email to a customer", True),
    ("get_order", "look up a customer order", False),
]

STOP = {"a", "an", "the", "for", "to", "of", "on",
        "in", "i", "my", "do", "what", "say", "about",
        "is", "and"}
SCHEMA_TOKENS = 90   # rough cost of one tool schema

def words(text):
    return {w.strip("?.,").lower()
            for w in text.replace("_", " ").split()} - STOP

def route(request, pool, top_k=5):
    """Only the tools relevant to this request."""
    q = words(request)
    hits = lambda t: len(q & words(t[0] + " " + t[1]))
    scored = sorted(pool, key=lambda t: -hits(t))
    picked = [t for t in scored if hits(t)][:top_k]
    return picked or pool[:top_k]

REQUESTS = [
    "open a ticket for the login bug",
    "refund the customer for order 4417",
    "what do the logs say about the timeout",
]

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN = E + "[32m", E + "[33m"
BAD, MUTE = E + "[31m", E + "[90m"
note = lambda s: print(DIM + s + OFF)

def lanes(visible):
    names = {t[0] for t in visible}
    cells = []
    for name, _, risky in TOOLS:
        if name not in names:
            cells.append(MUTE + "." + OFF)
        elif risky:
            cells.append(BAD + "!" + OFF)
        else:
            cells.append(OK + "#" + OFF)
    return "".join(cells)

n = len(TOOLS)
hdr = BOLD + "TOOL ROUTING" + OFF
print(hdr + "  %d tools connected" % n)
note("-" * 54)
note("%-30s %5s  %s" % ("REQUEST", "SEEN", "WHICH"))

for req in REQUESTS:
    visible = route(req, TOOLS)
    risky = [t for t in visible if t[2]]
    colour = WARN if risky else OK
    print("%-30s %s%3d/%-2d%s %s"
          % (req[:30], colour, len(visible), n,
             OFF, lanes(visible)))

note("-" * 54)
saved = (n - 3) * SCHEMA_TOKENS
per = BOLD + "PER CALL" + OFF
print(per + "  unrouted %d tokens of schema,"
      % (n * SCHEMA_TOKENS))
print("          routed about %d. Roughly %d saved."
      % (3 * SCHEMA_TOKENS, saved))
red = BOLD + "RED MARKS" + OFF
print(red + "  a tool that can spend money or")
print("           email a customer, still offered")

print()
note("The refund request surfaces send_email as well")
note("as issue_refund, because both mention a customer.")
note("That is routing working, and still handing the")
note("model a dangerous option it did not need.")
note("Narrowing a list is not the same as making it safe.")

# Try it: set top_k = 12 so nothing is routed. Every
# request then sees both red tools, on every call.

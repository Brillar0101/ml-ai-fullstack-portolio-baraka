# One task, two designs. Level 2 is a chain the
# developer wired by hand. Level 4 lets the model pick
# its own steps. The count that matters is how many
# decisions the model makes, since each can be wrong.

ORDERS = {"4417": {"status": "delayed", "days": 6}}

DECISIONS = []     # every point the model chose

def decide(what, value):
    DECISIONS.append(what)
    return value

# ---- Level 2: a fixed chain ----------------------------
def level_2(message):
    digits = "".join(c for c in message if c.isdigit())
    oid = decide("extract order id", digits or None)
    order = ORDERS.get(oid)      # plain code, no model
    if not order:
        return "I could not find that order."
    return decide("write the reply",
                  "Order %s is %s, %d days late."
                  % (oid, order["status"], order["days"]))

# ---- Level 4: the agent picks its own steps ------------
def level_4(message, max_steps=6):
    TOOLS = {"get_order": lambda oid: ORDERS.get(oid)}
    digits = "".join(c for c in message if c.isdigit())
    seen = None
    for step in range(max_steps):
        nxt = "get_order" if step == 0 else "finish"
        plan = decide("choose next action", nxt)
        if plan == "finish":
            break
        args = decide("choose arguments", digits or "")
        seen = TOOLS[plan](args)
    if not seen:
        return "I could not find that order."
    return decide("write the reply",
                  "Order is %s by %d days."
                  % (seen["status"], seen["days"]))

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, BAD = E + "[32m", E + "[33m", E + "[31m"
note = lambda s: print(DIM + s + OFF)

CASES = [
    ("where is order 4417?", "a clean request"),
    ("where is my order?", "no id in the message"),
]

for message, label in CASES:
    print(BOLD + label.upper() + OFF + '  "%s"' % message)
    note("-" * 54)
    note("%-9s %9s  %s" % ("LEVEL", "DECISIONS", "REPLY"))
    LEVELS = [("level 2", level_2), ("level 4", level_4)]
    for name, fn in LEVELS:
        DECISIONS.clear()
        reply = fn(message)
        n = len(DECISIONS)
        colour = OK if n <= 2 else WARN
        print("%-9s %s%9d%s  %s"
              % (name, colour, n, OFF, reply[:30]))
    print()

DECISIONS.clear()
level_4("where is order 4417?")
note("-" * 54)
print(BOLD + "WHAT LEVEL 4 CHOSE" + OFF)
for d in DECISIONS:
    print("     %s" % d)

print()
note("Both give the same answer on a clean request.")
note("Level 4 made more decisions getting there, and two")
note("were unconstrained: which tool, and what to pass")
note("it. A fixed chain cannot pick the wrong tool,")
note("because it was never offered a choice.")

# Try it: add a refund tool to TOOLS and let the plan
# reach it. Level 2 has no way to express that: the
# same rigidity that makes it safe makes it limited.

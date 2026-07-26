# An agent loop with the three guardrails that decide
# how bad a bad day gets: a step cap, an approval gate
# on anything destructive, and state saved each step.

class StepLimitReached(Exception):
    pass

RISKY = {"issue_refund", "send_email", "delete_record"}

TOOLS = {
    "get_order": lambda oid: {"id": oid, "st": "late"},
    "issue_refund":
        lambda oid, amount: "refunded %.2f" % amount,
}

PLANS = {
    "normal": [
        ("get_order", {"oid": "4417"}),
        ("issue_refund", {"oid": "4417", "amount": 42.0}),
        ("finish", {}),
    ],
    "runaway": [("get_order", {"oid": "4417"})] * 12,
}

SAVED = []   # stands in for durable storage

def run_agent(plan, approve, max_steps=6):
    history = []
    for step in range(max_steps):
        if step >= len(plan):
            break
        name, args = plan[step]
        if name == "finish":
            return "done", history
        if name in RISKY and not approve(name):
            history.append(("blocked", name))
            SAVED.append(list(history))
            continue
        history.append((name, TOOLS[name](**args)))
        SAVED.append(list(history))   # persist each step
    raise StepLimitReached("stopped at %d steps"
                           % max_steps)

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, BAD = E + "[32m", E + "[33m", E + "[31m"
note = lambda s: print(DIM + s + OFF)

CASES = [
    ("approved", "normal", lambda n: True),
    ("rejected", "normal", lambda n: False),
    ("runaway", "runaway", lambda n: True),
]

hdr = BOLD + "GUARDRAILS" + OFF
print(hdr + "  same agent, three days")
note("-" * 54)
note("%-10s %-18s %s" % ("RUN", "OUTCOME", "REFUNDED"))

for label, plan_name, approve in CASES:
    SAVED.clear()
    try:
        plan = PLANS[plan_name]
        result, history = run_agent(plan, approve)
        outcome, colour = "finished", OK
    except StepLimitReached as e:
        history, outcome = [], "hit the step cap"
        colour = WARN
    paid = any(n == "issue_refund" for n, _ in history)
    pc = BAD if paid else OK
    print("%-10s %s%-18s%s %s%s%s"
          % (label, colour, outcome, OFF,
             pc, "yes" if paid else "no", OFF))

note("-" * 54)
SAVED.clear()
try:
    run_agent(PLANS["runaway"], lambda n: True)
except StepLimitReached:
    pass
ac = BOLD + "AFTER A CRASH" + OFF
print(ac + "  %d checkpoints saved," % len(SAVED))
print("               so the work is not lost and the")
print("               agent does not start over")

print()
note("The rejected run finishes cleanly without")
note("paying. Refusing an action is a normal outcome")
note("the loop absorbs, not a crash. The runaway run")
note("stops itself instead of looping all night, and")
note("both leave a trail you can read afterwards.")

# Try it: drop max_steps to 1. The refund never
# happens: the cap fires before the agent reaches it.

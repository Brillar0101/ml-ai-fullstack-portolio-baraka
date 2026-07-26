# The flywheel: production traces become eval cases, cases
# drive a fix, and the fix is locked in by the case that
# caught it. Watch a failure go round once.

TRACES = [
    {"id": "t1", "request": "add a created_at column",
     "outcome": "reverted", "error": None},
    {"id": "t2", "request": "rename userId to user_id",
     "outcome": "merged", "error": None},
    {"id": "t3", "request": "add status column, API",
     "outcome": "reverted", "error": None},
    {"id": "t4", "request": "bump the lint rule",
     "outcome": "merged", "error": None},
    {"id": "t5", "request": "add is_archived to response",
     "outcome": "merged", "error": "timeout"},
    {"id": "t6", "request": "add price column, checkout",
     "outcome": "reverted", "error": None},
]

def mine(traces):
    """Runs that ended badly, tagged by kind. Quality
    and infra are different piles."""
    for t in traces:
        if t["error"]:
            yield t, "infra", "tool error, not quality"
        elif t["outcome"] == "reverted":
            yield t, "quality", "a human had to undo it"

def touches_two(request):
    r = request.lower()
    schema = "column" in r or "migration" in r
    surface = ("api" in r or "response" in r
               or "checkout" in r)
    return schema and surface

def agent(request, has_rule):
    """With the rule, it remembers the second file."""
    if touches_two(request) and not has_rule:
        return "half finished"
    return "complete"

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, BAD = E + "[32m", E + "[33m", E + "[31m"
note = lambda s: print(DIM + s + OFF)

found = list(mine(TRACES))
quality = [t for t, kind, _ in found if kind == "quality"]

h1 = BOLD + "1. MINE" + OFF
print(h1 + "  %d traces, %d ended badly"
      % (len(TRACES), len(found)))
note("-" * 54)
for t, kind, why in found:
    colour = BAD if kind == "quality" else WARN
    print("  %s%-8s%s %s"
          % (colour, kind, OFF, t["request"][:30]))
    note("           %s" % why)

print()
print(BOLD + "2. NAME THE PATTERN" + OFF)
note("-" * 54)
both = [t for t in quality if touches_two(t["request"])]
print("  %d of %d quality failures touch a schema AND"
      % (len(both), len(quality)))
print("  surface in one request. The infra error is not")
print("  in this pile, and must not be.")

print()
h3 = BOLD + "3. FIX AND RE-RUN" + OFF
print(h3 + "  the mined cases")
note("-" * 54)
for label, rule in [("before the rule", False),
                    ("after the rule", True)]:
    passed = sum(agent(t["request"], rule) == "complete"
                 for t in quality)
    colour = OK if passed == len(quality) else BAD
    print("  %-16s %s%d of %d pass%s"
          % (label, colour, passed, len(quality), OFF))

print()
note("The eval set did not exist before the failures")
note("did. Every case in it already went wrong once,")
note("which is why a two-year-old suite is so much")
note("harder to fool than a two-week-old one.")

# Try it: add a trace reverted for another reason. It
# joins the quality pile and the rule does not fix it,
# which is the loop finding something new.

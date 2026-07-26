# A supervisor delegating to sub-agents. Watch what each
# handoff carries, and what it silently drops.

QUESTION = "Did v3 pricing break annual discounts?"

# Each source holds several facts. A sub-agent returns
# those matching its brief, so a brief that omits the
# topic comes back with wrong facts, not fewer facts.
SOURCES = {
    "pricing docs": [
        ("monthly", "monthly pricing was unchanged in v3"),
        ("annual", "v3 moved annual plans to 20% off"),
        ("tax", "tax is calculated at checkout"),
    ],
    "changelog": [
        ("ui", "v3 restyled the settings page"),
        ("annual", "v3 removed the legacy discount path"),
        ("perf", "v3 halved cold start time"),
    ],
}

HANDOFFS = []

def sub_agent(brief, source):
    """Reads its brief and returns matching facts.
    Given nothing to look for, it returns the first."""
    HANDOFFS.append(brief)
    facts = SOURCES[source]
    wanted = [f for tag, f in facts
              if tag in brief.lower()]
    return wanted if wanted else [facts[0][1]]

def supervisor(question, carry_context):
    results = []
    for source in SOURCES:
        if carry_context:
            brief = ("Find facts about %s relevant to: %s"
                     % (source, question))
        else:
            brief = "Find facts about %s" % source
        results.extend(sub_agent(brief, source))
    return results

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, BAD = E + "[32m", E + "[31m"
note = lambda s: print(DIM + s + OFF)

hdr = BOLD + "HANDOFFS" + OFF
print(hdr + "  same plan, two briefs")
note("-" * 54)

for label, carry in [("carries the question", True),
                     ("omits the question", False)]:
    HANDOFFS.clear()
    found = supervisor(QUESTION, carry)
    on_topic = [f for f in found
                if "annual" in f or "discount" in f]
    good = len(on_topic) == 2
    colour = OK if good else BAD

    print(BOLD + label + OFF)
    for h in HANDOFFS:
        print("  %sbrief%s %s" % (DIM, OFF, h[:44]))
    for f in found:
        hit = f in on_topic
        tag = OK + "  ok " if hit else BAD + " off "
        mark = tag + OFF
        print(" %s %s" % (mark, f[:44]))
    print("  %s%d of 2 relevant facts%s"
          % (colour, len(on_topic), OFF))
    print()

note("-" * 54)
lost = BOLD + "WHAT WAS LOST" + OFF
print(lost + "  the word annual")
print("     The second brief never says what the")
print("     question was about, so each sub-agent")
print("     returned the first thing it found.")

print()
note("Every handoff is a message you must get right.")
note("Anything left out is invisible downstream, and")
note("the supervisor cannot tell a sub-agent that found")
note("nothing from one that confidently found the wrong")
note("thing. A single agent still had the question.")

# Try it: add "annual" to the second brief only. One
# word restores both facts. That is the cost of a handoff.

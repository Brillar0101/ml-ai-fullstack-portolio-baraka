# Retrieve on every turn, or let the model decide first.
# The stand-in router matches on shape, which is enough to
# show both what deciding saves and what it risks.

CHUNK_TOKENS = 120   # cost of one retrieved chunk
K = 5

PLEASANTRIES = {"thanks", "thanks that worked", "ok",
                "great", "perfect"}

# (message, does it genuinely need documents)
TURNS = [
    ("what are the rate limits?", True),
    ("thanks that worked", False),
    ("how do I rotate my API key?", True),
    ("ok", False),
    ("and the sandbox?", True),   # follow-up, no keywords
    ("perfect", False),
]

def router(message):
    """Decides whether to retrieve. It reads the shape of
    the message, which is cheap and sometimes wrong."""
    m = message.lower().strip(" .!?")
    return m not in PLEASANTRIES and len(m.split()) > 3

def run(always):
    searches, tokens, misses = 0, 0, []
    for message, needs_docs in TURNS:
        retrieve = True if always else router(message)
        if retrieve:
            searches += 1
            tokens += K * CHUNK_TOKENS
        elif needs_docs:
            misses.append(message)   # answered blind
    return searches, tokens, misses

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, BAD = E + "[32m", E + "[33m", E + "[31m"
note = lambda s: print(DIM + s + OFF)

print(BOLD + "PER TURN" + OFF + "  what the router decided")
note("-" * 54)
note("%-28s %8s %s" % ("MESSAGE", "NEEDS", "ROUTER"))
for message, needs in TURNS:
    got = router(message)
    if got == needs:
        colour, verdict = OK, "retrieve" if got else "skip"
    else:
        colour, verdict = BAD, "SKIPPED IT"
    print("%-28s %8s %s%s%s"
          % (message[:28], "yes" if needs else "no",
             colour, verdict, OFF))

print()
print(BOLD + "OVER 6 TURNS" + OFF)
note("-" * 54)
note("%-20s %9s %9s %s"
     % ("STRATEGY", "SEARCHES", "TOKENS", "MISSED"))
for label, always in [("retrieve always", True),
                      ("decide first", False)]:
    s, t, m = run(always)
    mc = OK if not m else BAD
    print("%-20s %9d %9d %s%d%s"
          % (label, s, t, mc, len(m), OFF))

note("-" * 54)
_, _, missed = run(False)
tr = BOLD + "THE TRADE" + OFF
print(tr + "  deciding halves the cost and")
print("           can drop a turn that needed documents")
for m in missed:
    print("           missed: %s%s%s" % (BAD, m, OFF))

print()
note("The follow-up is the hard case. It carries no")
note("keywords of its own and only makes sense against")
note("the turn before it, so a router reading one")
note("message alone calls it small talk and answers")
note("blind. That is the cost of deciding.")

# Try it: give router() the previous message too. The
# follow-up survives, and you have rebuilt a small piece of
# the context the always-retrieve version never lost.

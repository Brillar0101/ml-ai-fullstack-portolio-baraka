# Two stage-level numbers that say WHICH half of a RAG
# system broke. An end-to-end score drops and leaves
# you guessing; these point at the culprit.

def context_recall(needed, passages):
    """Did retrieval bring back the facts a correct answer
    requires?"""
    ctx = " ".join(passages).lower()
    found = [f for f in needed if f.lower() in ctx]
    return len(found) / len(needed)

def faithfulness(claims, passages, judge):
    """Of the claims the answer made, how many does the
    context support?"""
    ok = [c for c in claims if judge(c, passages)]
    return len(ok) / max(len(claims), 1)

def judge(claim, passages):
    # Stand-in for a judge model: a claim counts as
    # supported when its text appears in the context.
    # A real judge reads for meaning.
    return claim.lower() in " ".join(passages).lower()

NEEDED = ["15 working days", "within 6 months"]

FULL = ["Paternity leave is 15 working days.",
        "Paternity leave must be taken within 6 months."]
PARTIAL = ["Paternity leave must be taken within 6 months."]

CASES = [
    ("retrieval broke", PARTIAL,
     ["within 6 months", "15 working days"]),
    ("generation broke", FULL,
     ["15 working days", "within 6 months",
      "carries over to next year"]),
    ("both healthy", FULL,
     ["15 working days", "within 6 months"]),
]

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, BAD = E + "[32m", E + "[33m", E + "[31m"
note = lambda s: print(DIM + s + OFF)

def pct(v):
    if v >= 0.99:
        colour = OK
    else:
        colour = BAD if v < 0.6 else WARN
    return colour, "%.0f%%" % (v * 100)

hdr = BOLD + "RAG HEALTH" + OFF
print(hdr + "  three ways a week goes wrong")
note("-" * 54)
note("%-17s %5s %6s %6s  %s"
     % ("CASE", "E2E", "RECALL", "FAITH", "LOOK AT"))

for name, passages, claims in CASES:
    r = context_recall(NEEDED, passages)
    f = faithfulness(claims, passages, judge)
    e2e = r * f      # what one blended score shows

    if r < 1.0:
        where, colour = "the retriever", BAD
    elif f < 1.0:
        where, colour = "the prompt", WARN
    else:
        where, colour = "nothing, healthy", OK

    ec, e_s = pct(e2e)
    rc, r_s = pct(r)
    fc, f_s = pct(f)
    print("%-17s %s%5s%s %s%6s%s %s%6s%s  %s%s%s"
          % (name, ec, e_s, OFF, rc, r_s, OFF,
             fc, f_s, OFF, colour, where, OFF))

note("-" * 54)
pt = BOLD + "THE POINT" + OFF
print(pt + "  the first two both score badly end")
print("           to end, and that column cannot tell")
print("           you they broke for opposite reasons")

print()
note("Recall under 100% means the fact never arrived,")
note("so no prompt change helps. Faithfulness under")
note("100% means it arrived and the model went past it,")
note("so no retriever change helps. One blended number")
note("hides both, and sends you to the wrong half.")

# Try it: add a needed fact nobody retrieved, and watch
# recall move while faithfulness stays exactly put.

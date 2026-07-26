# RAG and CAG answering the same question. The model here
# is a stand-in that can only answer from the context it
# was handed, which is the property that matters.

POLICIES = [
    ("statutory entitlement runs to 15 working days", True),
    ("paternity leave is taken within 6 months", True),
    ("paternity leave splits into 3 blocks", False),
    ("annual leave is 25 days per year", False),
    ("sick leave needs a note after 3 days", False),
    ("expenses are filed within 30 days", False),
]

QUESTION = ("How many days of paternity leave, and must "
            "it be taken at once?")
NEEDED = ["15 working days", "within 6 months"]

def tokens(text):
    out = set()
    for w in text.lower().split():
        out.add(w.strip("?.,!"))
    return out

def index_search(question, top_k):
    """Keyword retrieval, deliberately blunt, the way a
    real top-k often is."""
    q = tokens(question)
    scored = sorted(POLICIES,
                    key=lambda p: -len(q & tokens(p[0])))
    return [p[0] for p in scored[:top_k]]

def covered(context):
    joined = " ".join(context)
    hits = [n for n in NEEDED
            if all(w in joined for w in n.split())]
    return len(hits), hits

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, BAD = E + "[32m", E + "[33m", E + "[31m"
note = lambda s: print(DIM + s + OFF)

TOTAL = len(POLICIES)
rag_ctx = index_search(QUESTION, 3)
cag_ctx = [p[0] for p in POLICIES]

hdr = BOLD + "ONE QUESTION" + OFF
print(hdr + "  needs %d facts" % len(NEEDED))
note("-" * 54)
note("%-9s %8s %9s %s"
     % ("SYSTEM", "SAW", "FACTS", "ANSWER"))

for name, ctx in [("RAG", rag_ctx), ("CAG", cag_ctx)]:
    n, hits = covered(ctx)
    colour = OK if n == len(NEEDED) else BAD
    full = n == len(NEEDED)
    verdict = "complete" if full else "half an answer"
    print("%-9s %4d/%-3d %s%6d/%-2d%s %s%s%s"
          % (name, len(ctx), TOTAL, colour, n, len(NEEDED),
             OFF, colour, verdict, OFF))

note("-" * 54)
_, rag_hits = covered(rag_ctx)
missing = [n for n in NEEDED if n not in rag_hits]
if missing:
    print(BOLD + "RAG MISSED" + OFF + "  %s%s%s"
          % (BAD, missing[0], OFF))
    print("            it fell outside the top 3")
else:
    print(BOLD + "RAG FOUND BOTH" + OFF + "  at this k")

print()
note("Nothing was wrong with the model. The fact it needed")
note("never reached it, so no prompt could have recovered.")
note("CAG has no top-k to get wrong because it drops")
note("nothing, and pays for that in context on every call.")

# Try it: change top_k to 4. RAG catches up, and the lesson
# is not that 3 was wrong but that the right k depends on
# the question, which is the choice CAG sidesteps.

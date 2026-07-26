# Plain RAG retrieves once and answers with whatever came
# back. Agentic RAG grades what came back and searches
# again when it is not good enough. The grader and the
# retriever are stand-ins so you can watch the loop turn.

DOCS = {
    "sso": "SSO is set up under Settings, Identity.",
    "saml": "SAML metadata is uploaded before SSO works.",
    "price": "SSO is on the Enterprise plan only.",
}

def search(query):
    """Topic matching. SSO dominates, so the prerequisite
    page loses unless the query names it."""
    q = query.lower()
    if "sso" in q or "sign-on" in q:
        return [DOCS["sso"], DOCS["price"]]
    if "metadata" in q or "saml" in q:
        return [DOCS["saml"], DOCS["sso"]]
    return []

def grade(question, context):
    """Returns good, weak or missing. A real grader is a
    model call reading the question against the context."""
    if not context:
        return "missing"
    if "before" in question.lower() and not any(
            "metadata" in c.lower() for c in context):
        return "weak"      # on topic, does not answer
    return "good"

def rewrite(question):
    return "SAML metadata upload requirement"

def answer(chunks):
    return " ".join(chunks) if chunks else "not covered"

QUESTIONS = [
    "What is needed before enabling SSO?",
    "How do I enable SSO?",
    "What is the parental leave policy?",
]

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, BAD = E + "[32m", E + "[33m", E + "[31m"
note = lambda s: print(DIM + s + OFF)

hdr = BOLD + "AGENTIC RAG" + OFF
print(hdr + "  grade, then retry")
note("-" * 54)
note("%-28s %5s %7s %s"
     % ("QUESTION", "TRIES", "GRADE", "PLAIN RAG"))

for q in QUESTIONS:
    query, tries, g = q, 0, None
    chunks = []
    for _ in range(3):
        tries += 1
        chunks = search(query)
        g = grade(q, chunks)
        if tries == 1:
            first = g      # what plain RAG would have
        if g in ("good", "missing"):
            break
        query = rewrite(q)

    if first == "good":
        pc, plain = OK, "same"
    elif first == "missing":
        pc, plain = OK, "also declines"
    else:
        pc, plain = BAD, "wrong answer"

    if g == "good":
        gc = OK
    else:
        gc = WARN if g == "missing" else BAD
    print("%-28s %5d %s%7s%s %s%s%s"
          % (q[:28], tries, gc, g, OFF, pc, plain, OFF))

note("-" * 54)
key = BOLD + "THE ONE THAT MATTERS" + OFF
print(key + "  question 1")
print("     first search was on topic and did not answer")
print("     it, so the grader said weak and the query got")
print("     rewritten. Plain RAG had no grader to ask.")

print()
note("Retrying costs a second search and a second")
note("model call. It buys the difference between a")
note("confident wrong answer and a right one, on the")
note("questions where topic matching is not enough.")

# Try it: make grade() always return good. Question 1 now
# answers from the wrong context without a word of warning,
# which is plain RAG.

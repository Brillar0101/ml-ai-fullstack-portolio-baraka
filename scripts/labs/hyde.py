import math

# HyDE: embed a hypothetical ANSWER instead of the question,
# because answers use the vocabulary documents use and
# questions often do not. Vectors are hand-written over four
# traits so you can read the arithmetic.
#          [ keys, rotation, security, billing ]
STORE = [
    ("kb-1", "rotate a key in Settings, then Regenerate",
     [0.9, 0.9, 0.4, 0.0]),
    ("kb-2", "API keys are secrets, never commit them",
     [0.9, 0.1, 0.9, 0.0]),
    ("kb-3", "billing questions go to the Plans page",
     [0.0, 0.0, 0.0, 0.9]),
]

KEYS = {"key", "keys", "credential", "token"}
ROTATE = {"rotate", "regenerate", "settings", "renew"}
SAFE = {"safe", "secret", "secrets", "secure", "commit"}
BILL = {"billing", "plan", "plans", "invoice"}

def embed(text):
    """Stand-in embedder: a trait fires when the text uses
    that trait's vocabulary. Crude, but it has the property
    that matters here, which is that wording drives it."""
    w = {t.strip("?.,") for t in text.lower().split()}
    return [1.0 if w & KEYS else 0.0,
            1.0 if w & ROTATE else 0.0,
            1.0 if w & SAFE else 0.0,
            1.0 if w & BILL else 0.0]

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    return dot / (na * nb + 1e-9)

def rank(vec):
    scored = ((cosine(vec, v), i, t) for i, t, v in STORE)
    return sorted(scored, reverse=True)

QUESTION = "is it safe to keep using the same API key?"

def draft_answer(question):
    """Stand-in for the model writing a plausible answer.
    The valuable part is that it reaches for words a real
    document uses, like rotate and Settings, which the
    question never contained."""
    return "rotate your API key in Settings and Regenerate"

DRAFT = draft_answer(QUESTION)
plain, hyde = rank(embed(QUESTION)), rank(embed(DRAFT))

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, BAD, MUTE = E + "[32m", E + "[31m", E + "[90m"
note = lambda s: print(DIM + s + OFF)

hdr = BOLD + "HyDE" + OFF
print(hdr + "  same store, two query vectors")
note("-" * 54)
note("%-6s %8s %7s %s"
     % ("DOC", "QUESTION", "DRAFT", "MOVE"))

for doc, text, _vec in STORE:
    r1 = [d for _, d, _ in plain].index(doc) + 1
    r2 = [d for _, d, _ in hyde].index(doc) + 1
    d = r1 - r2
    if d > 0:
        colour, move = OK, "up %d" % d
    elif d < 0:
        colour, move = BAD, "down %d" % -d
    else:
        colour, move = MUTE, "same"
    print("%-6s %8d %7d %s%s%s"
          % (doc, r1, r2, colour, move, OFF))

note("-" * 54)
print(BOLD + "QUESTION" + OFF + "  %s" % QUESTION)
print(BOLD + "DRAFT" + OFF + "     %s" % DRAFT)
print(BOLD + "TOP HIT" + OFF + "   %s%s%s -> %s%s%s"
      % (BAD, plain[0][1], OFF, OK, hyde[0][1], OFF))

print()
note("The question is phrased in the language of")
note("safety, so plain retrieval put the do-not-commit")
note("page first. The draft supplies the word rotate,")
note("which the question never had, and that flips the")
note("top hit to the page that answers it.")
note("")
note("The draft is only a probe. What you show a user")
note("is grounded in kb-1, never in the draft itself.")

# Try it: make the draft talk about secrets instead of
# rotation and the ranking swings back. HyDE is only ever
# as good as the draft it writes.

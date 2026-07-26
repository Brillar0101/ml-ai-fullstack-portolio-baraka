# Why a reranker earns its place. A bi-encoder embeds
# the query and each passage SEPARATELY, so it can only
# ask "same topic?". A cross-encoder reads the pair
# together and asks "does this answer the question?"

QUERY = "Why was I charged twice on my annual plan?"

PASSAGES = [
    ("billed once every 12 months", "annual"),
    ("upgrade or downgrade any time", "annual"),
    ("a repeated transaction is reversed "
     "within five working days", "duplicate"),
    ("annual plan pricing is on the pricing page", "annual"),
    ("monthly plans charge on the same day", "monthly"),
]

def stem(w):
    w = w.strip("?.,!").lower()
    for suf in ("ed", "es", "s"):
        if len(w) > 4 and w.endswith(suf):
            return w[: -len(suf)]
    return w

def bi_encoder(query, text):
    """Topic overlap: what an embedding roughly does.
    Shared subject, not the user's actual problem."""
    q = {stem(w) for w in query.split()}
    p = {stem(w) for w in text.split()}
    return len(q & p) / (len(q) ** 0.5 * len(p) ** 0.5)

def cross_encoder(query, text, kind):
    """Reads query and passage jointly, so it can notice
    that a repeat charge is the actual complaint."""
    score = bi_encoder(query, text) * 0.4
    if kind == "duplicate":
        score += 0.9      # actually resolves the complaint
    if kind == "monthly":
        score -= 0.2      # wrong plan type
    return score

stage1 = sorted(PASSAGES,
                key=lambda p: -bi_encoder(QUERY, p[0]))
stage2 = sorted(stage1,
                key=lambda p: -cross_encoder(QUERY, *p))
KEEP = 2

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, BAD, MUTE = E + "[32m", E + "[31m", E + "[90m"
note = lambda s: print(DIM + s + OFF)

hdr = BOLD + "RERANK" + OFF
print(hdr + "  %d candidates, keep %d"
      % (len(PASSAGES), KEEP))
note("-" * 54)
note("%-28s %6s %6s %s"
     % ("PASSAGE", "BEFORE", "AFTER", "MOVE"))

for text, kind in stage2:
    r1 = stage1.index((text, kind)) + 1
    r2 = stage2.index((text, kind)) + 1
    delta = r1 - r2
    if delta > 0:
        colour, move = OK, "up %d" % delta
    elif delta < 0:
        colour, move = BAD, "down %d" % -delta
    else:
        colour, move = MUTE, "same"
    mark = " <-" if r2 <= KEEP else ""
    print("%-28s %6d %6d %s%-7s%s%s"
          % (text[:28], r1, r2, colour, move, OFF, mark))

note("-" * 54)
best = stage2[0][0]
sent = BOLD + "SENT TO THE MODEL" + OFF
print(sent + "  the top %d" % KEEP)
print("     %s%s%s" % (OK, best[:44], OFF))

print()
note("That passage shares not one word with the")
note("question, so topic matching buried it. Reading the")
note("pair together moved it to first. Retrieve widely,")
note("then sort carefully, and only then cut.")

# Try it: cut BEFORE the rerank by slicing stage1 to 2.
# The right passage is gone, and no amount of careful
# sorting promotes something already thrown away.

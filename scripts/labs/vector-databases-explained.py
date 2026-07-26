import math

# A vector database in about thirty lines, so you can see
# what the real ones do underneath the API. Embeddings are
# hand-written over five traits rather than produced by a
# model, so the numbers stay readable.
#            [ billing, login, shipping, refund, account ]
DOCS = [
    ("billing-1", "your plan renews on the first",
     [0.9, 0.0, 0.0, 0.2, 0.4]),
    ("billing-2", "duplicate charges refund in 5 days",
     [0.8, 0.0, 0.0, 0.9, 0.1]),
    ("login-1", "reset your password from sign-in",
     [0.0, 0.9, 0.0, 0.0, 0.6]),
    ("login-2", "locked out? wait 15 minutes",
     [0.0, 0.95, 0.0, 0.0, 0.5]),
    ("ship-1", "orders ship in two business days",
     [0.0, 0.0, 0.9, 0.1, 0.0]),
]

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    return dot / (na * nb + 1e-9)

def search(qvec, k=3, where=None):
    rows = []
    for doc, text, vec in DOCS:
        if where and not doc.startswith(where):
            continue      # metadata filter, as stores do
        rows.append((cosine(qvec, vec), doc, text))
    return sorted(rows, reverse=True)[:k]

# "I got logged out and cannot sign back in"
QUERY = [0.0, 0.9, 0.0, 0.0, 0.4]
FLOOR = 0.5      # below this, nothing is really a match

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, BAD = E + "[32m", E + "[33m", E + "[31m"
note = lambda s: print(DIM + s + OFF)

def bar(v, width=12):
    filled = max(0, round(v * width))
    return "#" * filled + "." * (width - filled)

def show(title, rows):
    print(BOLD + title + OFF)
    for score, doc, text in rows:
        if score >= 0.9:
            colour = OK
        elif score >= FLOOR:
            colour = WARN
        else:
            colour = BAD
        print("  %-10s %s%s%s %.2f  %s"
              % (doc, colour, bar(score), OFF,
                 score, text[:22]))

q = BOLD + "QUERY" + OFF
print(q + "  I got logged out and cannot sign in")
note("-" * 54)
show("unfiltered", search(QUERY))
print()
show("filtered to billing", search(QUERY, where="billing"))

note("-" * 54)
top = search(QUERY, where="billing")[0]
nt = BOLD + "NOTE" + OFF
print(nt + "  the filtered search still returned a")
print("      best match, and it scores %.2f" % top[0])
print("      A nearest neighbour is always nearest.")

print()
note("A vector store hands back the closest thing it")
note("has, whether or not anything is genuinely close.")
note("That is why a similarity floor matters: without")
note("one, an empty shelf still produces a confident")
note("looking answer.")

# Try it: raise FLOOR to 0.99. Only the true match
# survives, and the filtered search returns nothing.

import re

# Turning raw support transcripts into a finetuning set.
# The filtering is the job: what you throw away shapes
# the model more than what you keep.

RAW_PAIRS = [
    {"question": "  How do I reset my password?  ",
     "answer": "Open Settings, Security, then Reset."},
    {"question": "how do I reset my password",
     "answer": "Open Settings, Security, then Reset."},
    {"question": "HOW DO I RESET MY PASSWORD?!",
     "answer": "Open Settings, Security, then Reset."},
    {"question": "Where is my invoice?", "answer": "ok"},
    {"question": "Do you support SSO?",
     "answer": "Yes, on Enterprise. Upload SAML first."},
    {"question": "", "answer": "Contact support."},
    {"question": "Can I export my data?",
     "answer": "Yes. " + "Go to Settings, Export. " * 99},
    {"question": "What are the rate limits?",
     "answer": "One hundred requests per minute."},
]

def to_example(pair):
    return {"instruction": pair["question"].strip(),
            "input": "",
            "output": pair["answer"].strip()}

def is_good(ex):
    if not ex["instruction"] or not ex["output"]:
        return False, "empty field"
    n = len(ex["output"].split())
    if n < 3:
        return False, "too short to teach anything"
    if n > 400:
        return False, "a pasted macro or transcript dump"
    return True, None

def norm(text):
    t = re.sub(r"\s+", " ", text.lower()).strip()
    return re.sub(r"[^a-z0-9 ]", "", t)

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, BAD = E + "[32m", E + "[33m", E + "[31m"
note = lambda s: print(DIM + s + OFF)

clean, seen, dropped = [], set(), []
for pair in RAW_PAIRS:
    ex = to_example(pair)
    ok, why = is_good(ex)
    label = ex["instruction"][:26] or "(empty)"
    if not ok:
        dropped.append((label, why, BAD))
        continue
    key = norm(ex["instruction"]) + "|" + norm(ex["output"])
    if key in seen:
        dropped.append((label, "duplicate row", WARN))
        continue
    seen.add(key)
    clean.append((label, ex))

n_raw = len(RAW_PAIRS)
print(BOLD + "DATASET" + OFF + "  %d raw pairs in" % n_raw)
note("-" * 54)
note("%-28s %s" % ("ROW", "VERDICT"))

for label, _ in clean:
    print("%-28s %sKEEP%s" % (label, OK, OFF))
for label, why, colour in dropped:
    print("%-28s %sDROP%s  %s%s%s"
          % (label, colour, OFF, DIM, why, OFF))

note("-" * 54)
kept = len(clean)
pct = 100.0 * kept / n_raw
bar = "#" * kept + "." * len(dropped)
print(BOLD + "KEPT" + OFF + "  %s%s%s  %d of %d (%.0f%%)"
      % (OK, bar, OFF, kept, n_raw, pct))

print()
note("Three people asked one password question with")
note("different spacing, capitals and punctuation.")
note("Normalising before comparing makes them one row,")
note("not three. Three copies of one answer is how a")
note("model learns to give that answer too often.")

# Try it: drop norm() from the key and watch the shouty
# duplicate survive. Now picture that at real scale.

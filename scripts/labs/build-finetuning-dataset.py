import re

# Turning raw support transcripts into a finetuning set. The filtering is the
# whole job: what you throw away shapes the model more than what you keep.

RAW_PAIRS = [
    {"question": "  How do I reset my password?  ", "answer": "Open Settings, choose Security, then Reset password."},
    {"question": "how do I reset my password",      "answer": "Open Settings, choose Security, then Reset password."},
    {"question": "Where is my invoice?",            "answer": "ok"},
    {"question": "Do you support SSO?",             "answer": "Yes, on the Enterprise plan. Upload your SAML metadata first."},
    {"question": "",                                "answer": "Contact support."},
    {"question": "Can I export my data?",           "answer": "Yes. " + "Go to Settings and click Export. " * 90},
    {"question": "What are the rate limits?",       "answer": "One hundred requests per minute per API key."},
    {"question": "HOW DO I RESET MY PASSWORD?!",    "answer": "Open Settings, choose Security, then Reset password."},
]

def to_example(pair):
    return {"instruction": pair["question"].strip(), "input": "",
            "output": pair["answer"].strip()}

def is_good(ex):
    if not ex["instruction"] or not ex["output"]:
        return False, "empty field"
    if len(ex["output"].split()) < 3:
        return False, "answer too short to teach anything"
    if len(ex["output"].split()) > 400:
        return False, "probably a pasted macro or a transcript dump"
    return True, None

def norm(text):
    return re.sub(r"[^a-z0-9 ]", "", re.sub(r"\s+", " ", text.lower())).strip()

clean, seen, dropped = [], set(), []
for pair in RAW_PAIRS:
    ex = to_example(pair)
    ok, why = is_good(ex)
    if not ok:
        dropped.append((ex["instruction"][:34] or "(empty)", why))
        continue
    key = norm(ex["instruction"]) + "|" + norm(ex["output"])
    if key in seen:
        dropped.append((ex["instruction"][:34], "duplicate of an earlier row"))
        continue
    seen.add(key)
    clean.append(ex)

print("kept %d of %d rows\n" % (len(clean), len(RAW_PAIRS)))
for ex in clean:
    print("   keep  %s" % ex["instruction"][:60])
print()
for what, why in dropped:
    print("   drop  %-36s %s" % (what, why))

print()
print("Note which rows the duplicate check caught. Three people asked the same")
print("password question with different spacing, capitalisation and")
print("punctuation. Normalising before comparing is what makes them one row")
print("instead of three, and three copies of one answer is exactly how a model")
print("learns to give that answer too often.")

# Try it: delete the norm() call from the key and watch the shouty duplicate
# survive. Then imagine that at the scale of a real support archive.

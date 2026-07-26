# Generate the explorer data for top-k retrieval by actually running the
# retrieval, so the widget shows measured results rather than invented ones.
import json

DOCS = [
    ("policy-1", "Paternity leave is 15 working days.", {"15 working days"}),
    ("policy-2", "Paternity leave must be taken within 6 months.", {"within 6 months"}),
    ("policy-3", "Paternity leave can be split into 3 blocks.", set()),
    ("hr-9",     "Annual leave is 25 days per year.", set()),
    ("hr-4",     "Sick leave needs a note after 3 days.", set()),
    ("fin-2",    "Expenses must be filed within 30 days.", set()),
]
QUERY = {"paternity", "leave", "days", "long"}
NEEDED = {"15 working days", "within 6 months"}

def score(text):
    words = {w.strip(".,").lower() for w in text.split()}
    return len(QUERY & words)

ranked = sorted(DOCS, key=lambda d: -score(d[1]))

frames = {}
for k in (1, 2, 3, 4, 5, 6):
    top = ranked[:k]
    covered = set().union(*[d[2] for d in top]) & NEEDED
    recall = len(covered) / len(NEEDED)
    noise = sum(1 for d in top if not d[2])
    precision = (k - noise) / k
    if recall < 1.0:
        note = "The answer needs two facts. Only %d retrieved, so no prompt can fix this." % len(covered)
        state_r = "bad"
    elif noise >= 3:
        note = "Both facts are here, and so are %d passages about nothing you asked. That is context you pay for and the model must read past." % noise
        state_r = "good"
    else:
        note = "Both facts present with %d irrelevant passage%s. This is the useful range." % (noise, "" if noise == 1 else "s")
        state_r = "good"
    frames[k] = {
        "note": note,
        "items": [
            {"label": "answer coverage", "value": round(recall * 100), "state": state_r},
            {"label": "relevant passages", "value": round(precision * 100),
             "state": "good" if precision >= 0.6 else ("warn" if precision >= 0.4 else "bad")},
            {"label": "passages sent", "value": k, "state": "neutral" if k <= 3 else "warn"},
        ],
    }
print(json.dumps(frames, indent=1))

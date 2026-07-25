from collections import defaultdict

PRICES = {   # dollars per 1,000 tokens. Illustrative round
             # numbers, not any real provider's price list.
    "big-model":   {"in": 0.003,  "out": 0.015},
    "small-model": {"in": 0.0005, "out": 0.0015},
}

LEDGER = []
def emit(record):
    LEDGER.append(record)

def log_cost(model, usage, feature, customer_id):
    rate = PRICES[model]
    cin = usage["input_tokens"] / 1000 * rate["in"]
    cout = usage["output_tokens"] / 1000 * rate["out"]
    total = cin + cout
    emit({                    # send to your metrics store
        "model": model,
        "feature": feature,   # tags make spend attributable
        "customer_id": customer_id,
        "input_tokens": usage["input_tokens"],
        "output_tokens": usage["output_tokens"],
        "cost_usd": round(total, 6),
    })
    return total

# A day of traffic. The summariser stuffs a lot of context
# into every call; the chat replies are small.
TRAFFIC = [
    ("big-model", 12000, 300, "doc-summary", "acme"),
    ("big-model", 12000, 300, "doc-summary", "acme"),
    ("big-model", 11500, 280, "doc-summary", "globex"),
    ("small-model", 400, 120, "chat-reply", "acme"),
    ("small-model", 380, 110, "chat-reply", "globex"),
    ("small-model", 420, 130, "chat-reply", "acme"),
]
for model, tin, tout, feature, cust in TRAFFIC:
    usage = {"input_tokens": tin, "output_tokens": tout}
    log_cost(model, usage, feature, cust)

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
BAD, OK, INFO = E + "[31m", E + "[32m", E + "[34m"
note = lambda s: print(DIM + s + OFF)

total = sum(r["cost_usd"] for r in LEDGER)

def group(key):
    out = defaultdict(float)
    for r in LEDGER:
        out[r[key]] += r["cost_usd"]
    return sorted(out.items(), key=lambda x: -x[1])

def bar(share, width=16):
    filled = round(share * width)
    return "#" * filled + "." * (width - filled)

print(BOLD + "SPEND" + OFF + "  $%.4f across %d calls"
      % (total, len(LEDGER)))
note("-" * 52)

for label, rows in [("BY FEATURE", group("feature")),
                    ("BY CUSTOMER", group("customer_id"))]:
    note(label)
    for name, amount in rows:
        share = amount / total
        colour = BAD if share > 0.5 else OK
        print("  %-13s $%.4f  %s%s%s %3.0f%%"
              % (name, amount, colour, bar(share), OFF,
                 share * 100))
    note("")

tin = sum(r["input_tokens"] for r in LEDGER)
tout = sum(r["output_tokens"] for r in LEDGER)
note("-" * 52)
ratio = tin / tout
head = BOLD + "TOKENS" + OFF
print(head + "  in %s%d%s  out %d  %s%.0fx%s"
      % (INFO, tin, OFF, tout, BAD, ratio, OFF))

print()
note("One feature is nearly the whole bill, and it is")
note("the one pasting the most context in. An untagged")
note("invoice shows one number and no way to act on it.")
note("Tagging is what turns a rising bill into a name.")

# Try it: halve the doc-summary input tokens and watch both
# the feature split and the customer split move together.

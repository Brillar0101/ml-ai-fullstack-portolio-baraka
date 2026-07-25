from collections import Counter

# Offline evaluation says a change is safe to try.
# Online observability says whether it helped the
# people you built it for. Both run here, same
# assistant.

# ---- Offline: the eval set, run before shipping ---------
# Curated questions with a known-good answer.
EVAL_SET = [
    ("how long do refunds take?", "5 business days", True),
    ("how do I cancel?", "from the billing page", True),
    ("do you support SSO?", "on the enterprise plan", True),
    ("what are the rate limits?", "100 per minute", True),
    ("where is my order?", "check the orders page", True),
]

# ---- Online: what real traffic actually did -------------
# Same assistant, questions nobody thought to curate.
TRAFFIC = [
    ("how long do refunds take?", ["billing-2"], "up"),
    ("how long do refunds take?", ["billing-2"], "up"),
    ("refund after 60 days?",
     ["billing-2", "policy-9"], "down"),
    ("charged twice?",
     ["billing-2", "billing-7"], "escalated"),
    ("refund on a gift order?",
     ["billing-2"], "down"),
    ("where is my order?", ["ship-1"], "up"),
]

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, BAD = E + "[32m", E + "[33m", E + "[31m"
note = lambda s: print(DIM + s + OFF)

passed = sum(1 for _, _, ok in EVAL_SET if ok)
score = passed / len(EVAL_SET)

print(BOLD + "OFFLINE" + OFF + "  eval set, before ship")
note("-" * 52)
print("  cases          %d" % len(EVAL_SET))
n = len(EVAL_SET)
print("  passing        %s%d of %d  (%.0f%%)%s"
      % (OK, passed, n, score * 100, OFF))
print("  verdict        %sSAFE TO SHIP%s" % (OK, OFF))
print()

SAD = ("down", "escalated")
unhappy = [t for t in TRAFFIC if t[2] in SAD]
fb = Counter(t[2] for t in TRAFFIC)
rate = len(unhappy) / len(TRAFFIC)

print(BOLD + "ONLINE" + OFF + "   real traffic, after ship")
note("-" * 52)
print("  requests       %d" % len(TRAFFIC))
m = len(TRAFFIC)
print("  unhappy        %s%d of %d  (%.0f%%)%s"
      % (BAD, len(unhappy), m, rate * 100, OFF))
print("  feedback       %s" % dict(fb))
print()

note("the unhappy ones, and what they retrieved:")
for q, chunks, signal in unhappy:
    colour = BAD if signal == "escalated" else WARN
    print("  %s%-10s%s %-23s %s"
          % (colour, signal, OFF, q[:23],
             ",".join(chunks)))

print()
note("-" * 52)
gap = BOLD + "THE GAP" + OFF
print(gap + "  every unhappy question is")
print("         a refund edge case, and not one")
print("         of them is in the eval set above.")

print()
note("Offline scored 100% and was not wrong. It measured")
note("the questions someone thought to write down.")
note("Production is where you meet the ones nobody")
note("imagined, and each belongs in the eval set tomorrow.")

# Try it: add the 60-day refund case to EVAL_SET with
# ok=False. Offline drops and predicts the problem.

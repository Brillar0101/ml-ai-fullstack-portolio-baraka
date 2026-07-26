import json
from collections import Counter

# One structured event per request, then the questions
# you can only ask because the event was structured.

def cost_of(usage, model):
    rates = {"big-model": (0.003, 0.015),
             "small-model": (0.0005, 0.0015)}
    cin, cout = rates[model]
    return (usage["in"] * cin
            + usage["out"] * cout) / 1000

def emit_llm_event(req, resp, timings, safety):
    return {
        "ts": req["ts"],
        "request_id": req["id"],
        "user_id": req["user_id"],
        # operational
        "model": resp["model"],
        "ttft_ms": timings["ttft_ms"],
        "total_ms": timings["total_ms"],
        "input_tokens": resp["usage"]["in"],
        "output_tokens": resp["usage"]["out"],
        "cost_usd": round(
            cost_of(resp["usage"], resp["model"]), 6),
        "tool_errors": resp["tool_errors"],
        # quality and behaviour
        "refused": resp["refused"],
        "used_fallback": resp["tool_errors"] > 0,
        # safety scores from classifiers, 0..1
        "jailbreak_score": safety["jailbreak"],
        "pii_in_output": safety["pii"],
        # feedback arrives later, keyed by request_id
        "thumbs": None,
    }

def ev(i, model, ttft, tin, tout, errs,
       refused, jb=0.02):
    return emit_llm_event(
        {"ts": 1750000000 + i, "id": "r%d" % i,
         "user_id": "u%d" % (i % 3)},
        {"model": model, "usage": {"in": tin, "out": tout},
         "tool_errors": errs, "refused": refused},
        {"ttft_ms": ttft, "total_ms": ttft * 4},
        {"jailbreak": jb, "pii": False})

EVENTS = [
    ev(1, "small-model", 210, 800, 120, 0, False),
    ev(2, "small-model", 240, 820, 140, 0, False),
    ev(3, "big-model", 1900, 14000, 300, 1, False),
    ev(4, "small-model", 260, 810, 130, 0, True, jb=0.81),
    ev(5, "big-model", 2100, 15000, 280, 1, False),
    ev(6, "small-model", 230, 790, 125, 0, False),
]
FEEDBACK = ["up", "up", "down", "down", None, "up"]
for e, fb in zip(EVENTS, FEEDBACK):
    e["thumbs"] = fb

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, BAD, INFO = (E + "[32m", E + "[33m",
                       E + "[31m", E + "[34m")
note = lambda s: print(DIM + s + OFF)

ttfts = sorted(e["ttft_ms"] for e in EVENTS)
p95 = ttfts[int(0.95 * (len(ttfts) - 1))]
spend = sum(e["cost_usd"] for e in EVENTS)
big = sum(e["cost_usd"] for e in EVENTS
          if e["model"] == "big-model")
thumbs = Counter(e["thumbs"] for e in EVENTS)
refusals = sum(e["refused"] for e in EVENTS)
tool_errs = sum(e["tool_errors"] for e in EVENTS)
def risky(e):
    return e["jailbreak_score"] > 0.5 or e["pii_in_output"]

flagged = [e for e in EVENTS if risky(e)]

# group, signal, value, breached?, response
ROWS = [
    ("speed", "p95 time to first token",
     "%d ms" % p95, p95 > 1500, "PAGE"),
    ("cost", "spend, %.0f%% big" % (100 * big / spend),
     "$%.4f" % spend, False, "DASH"),
    ("quality", "thumbs down",
     "%d of %d" % (thumbs["down"], len(EVENTS)),
     thumbs["down"] >= 2, "PAGE"),
    ("quality", "refusals and tool errors",
     "%d / %d" % (refusals, tool_errs),
     tool_errs > 0, "PAGE"),
    ("safety", "requests flagged",
     "%d" % len(flagged), len(flagged) > 0, "PAGE"),
]

hdr = BOLD + "SIGNALS" + OFF
print(hdr + "  %d requests" % len(EVENTS))
note("-" * 54)
note("%-9s %-26s %-9s %s"
     % ("GROUP", "SIGNAL", "VALUE", "ACTION"))

for group, signal, value, breached, action in ROWS:
    if action == "DASH":
        colour, label = INFO, "dashboard"
    elif breached:
        colour, label = BAD, "PAGE ME"
    else:
        colour, label = OK, "ok"
    print("%-9s %-26s %-9s %s%s%s"
          % (group, signal, value, colour, label, OFF))

note("-" * 54)
print(BOLD + "ONE EVENT" + OFF + "  where that came from")
note(json.dumps({k: EVENTS[3][k] for k in
                 ("request_id", "model", "ttft_ms",
                  "cost_usd", "refused",
                  "jailbreak_score", "thumbs")}, indent=1))

print()
note("Speed, quality and safety page you. Cost goes on")
note("a dashboard, because a bill creeping up is a")
note("conversation, not a reason to wake someone at 3am.")

# Try it: drop "model" from the event, then answer the
# cost row again. Every row needs a field to exist.

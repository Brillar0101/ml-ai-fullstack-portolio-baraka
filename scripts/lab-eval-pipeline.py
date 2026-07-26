import json, random

# ---- Stand-ins for the two things you would really call -------------------
# "system" is your AI feature. "judge" is a model scoring against a rubric.
# Both are scripted here, so this lab is deterministic and needs no API key.
random.seed(7)

REPLIES = {
    "refund-policy": '{"answer": "Refunds in 30 days. [doc:policy-1]"}',
    "no-citation":   '{"answer": "Refunds within 30 days."}',
    "broken-json":   'Sure! Here is the answer you asked for.',
}

def system(case_input):
    if case_input == "flaky":
        # A genuinely unstable case: right about half the time.
        return ('{"answer": "Annual plans renew. [doc:billing-4]"}'
                if random.random() < 0.5
                else '{"answer": "I am not sure about annual plans."}')
    if case_input == "outage":
        raise ConnectionError("provider timed out")
    return REPLIES[case_input]

def judge(rubric, case_input, out):
    # A real judge is a model reading a rubric. This one only checks
    # whether the rubric's required phrase survived into the answer.
    return 1.0 if rubric.lower() in out.lower() else 0.0

def is_valid_json(out):
    try:
        json.loads(out)
        return True
    except Exception:
        return False

# ---- The pipeline itself ---------------------------------------------------
CHECKS = [
    ("valid_json",   lambda out: is_valid_json(out)),
    ("cites_source", lambda out: "[doc" in out),
]

def run_case(system, judge, case, runs=5):
    labels = []
    for _ in range(runs):
        try:
            out = system(case["input"])
        except Exception:
            labels.append("ERROR")   # infra failed, not the model
            continue
        if not all(check(out) for _, check in CHECKS):
            labels.append("FAIL")    # free checks catch it first
            continue
        verdict = judge(case["rubric"], case["input"], out)
        labels.append("PASS" if verdict >= 0.7 else "FAIL")
    scored = [l for l in labels if l != "ERROR"]
    return {
        "case": case["id"],
        "stability": scored.count("PASS") / max(len(scored), 1),
        "errors": labels.count("ERROR"),
    }

CASES = [
    {"id": "happy",       "input": "refund-policy", "rubric": "30 days"},
    {"id": "no-citation", "input": "no-citation",   "rubric": "30 days"},
    {"id": "flaky",       "input": "flaky",         "rubric": "renew"},
    {"id": "bad-json",    "input": "broken-json",   "rubric": "30 days"},
    {"id": "outage",      "input": "outage",        "rubric": "30 days"},
]

# ---- Report ----------------------------------------------------------------
# Colour follows status meaning, not decoration: green passes, gold needs a
# human, red blocks the ship, grey is infrastructure rather than quality.
E = chr(27)
DIM, OFF = E + "[2m", E + "[0m"
OK, WARN, BAD, INFO = E + "[32m", E + "[33m", E + "[31m", E + "[90m"
BOLD = E + "[1m"

def bar(v, width=10):
    filled = round(v * width)
    return "#" * filled + "." * (width - filled)

def classify(r):
    if r["errors"]:
        return INFO, "INFRA", "not a quality signal"
    if r["stability"] == 1.0:
        return OK, "PASS", ""
    if r["stability"] == 0.0:
        return BAD, "FAIL", "every run"
    return WARN, "FLAKY", "coin flip, unnoticed"

RUNS = 5
print(BOLD + "EVAL RUN" + OFF + "  %d cases x %d runs" % (len(CASES), RUNS))
print(DIM + "-" * 46 + OFF)
print(DIM + "%-12s %-12s %5s  %s" % ("CASE", "STABILITY", "RATE", "VERDICT") + OFF)

results = []
for case in CASES:
    r = run_case(system, judge, case, runs=RUNS)
    results.append(r)
    colour, verdict, note = classify(r)
    print("%-12s %s%-12s%s %4.0f%%  %s%s%s"
          % (r["case"], colour, bar(r["stability"]), OFF,
             r["stability"] * 100, colour, verdict, OFF))
    if note:
        print(DIM + "%-12s %s" % ("", note) + OFF)

print(DIM + "-" * 46 + OFF)

blocked = [r for r in results if not r["errors"] and r["stability"] < 1.0]
infra = [r for r in results if r["errors"]]
gate = BAD + "BLOCKED" + OFF if blocked else OK + "CLEAR" + OFF
plural = lambda n, word: "%d %s%s" % (n, word, "" if n == 1 else "s")
print(BOLD + "SHIP GATE" + OFF + "  %s  %s, %s"
      % (gate, plural(len(blocked), "failing case"),
         plural(len(infra), "infra error")))

print()
print(DIM + "The flaky case is the one to look at. It passes some runs" + OFF)
print(DIM + "and fails others, so a pipeline running each case once" + OFF)
print(DIM + "reports a confident PASS or FAIL and tells you nothing." + OFF)

# Try it: set RUNS = 1 and run again. The flaky row becomes a clean
# verdict, and nothing on screen warns you it was a coin flip.

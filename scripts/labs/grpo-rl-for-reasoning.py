import numpy as np

# GRPO's core move: instead of a separate value network
# saying how good an answer "should" be, compare each
# sample against the others for the SAME problem.
# The group is the baseline.

def group_advantages(rewards, group_size, eps=1e-4):
    groups = rewards.reshape(-1, group_size)
    mean = groups.mean(axis=1, keepdims=True)  # per-problem
    std = groups.std(axis=1, keepdims=True)    # spread
    return ((groups - mean) / (std + eps)).reshape(-1)

# Four problems of different difficulty.
# 1.0 = the answer checked out against a verifier.
PROBLEMS = [
    ("A  hard",   [1.0, 0.0, 0.0, 0.0]),
    ("B  easy",   [1.0, 1.0, 1.0, 0.0]),
    ("C  solved", [1.0, 1.0, 1.0, 1.0]),
]

rewards = np.array([r for _, rs in PROBLEMS for r in rs])
adv = group_advantages(rewards, group_size=4)

# ---- Report ---------------------------------------------
# Colour is the direction of the update: green pushes the
# model toward an answer, red away, grey means no signal.
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, BAD, MUTE = E + "[32m", E + "[31m", E + "[90m"
note = lambda s: print(DIM + s + OFF)

def arrow(a):
    if abs(a) < 1e-6:
        return MUTE, "  no signal"
    if a > 0:
        return OK, "  push toward"
    return BAD, "  push away"

print(BOLD + "GRPO" + OFF + "  3 problems x 4 samples")
note("-" * 54)
note("%-11s %7s %5s %9s %s"
     % ("PROBLEM", "SOLVED", "REWARD", "ADVANTAGE", "UPDATE"))

for i, (name, rs) in enumerate(PROBLEMS):
    block = adv[i * 4:(i + 1) * 4]
    solved = "%d/4" % int(sum(rs))
    for k, (r, a) in enumerate(zip(rs, block)):
        colour, label = arrow(a)
        head = name if k == 0 else ""
        cell = solved if k == 0 else ""
        print("%-11s %7s %5.0f %s%9.3f%s%s%s%s"
              % (head, cell, r, colour, a, OFF,
                 colour, label, OFF))
    note("")

note("-" * 54)
print(BOLD + "READ IT" + OFF + "  a correct answer is worth more")
print("         where fewer samples got it right")

print()
note("Being right on A, which one sample solved, earns")
note("three times the push of being right on B, which")
note("most already solved. C gives nothing at all: when")
note("the whole group agrees there is nothing to learn.")
note("That is why training data must mix difficulties.")

# Try it: make problem A all zeros. It goes flat too,
# for the same reason. Signal lives in disagreement.

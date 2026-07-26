import numpy as np

# A top-2 router in front of eight experts. The
# "experts" are trivial linear maps, not trained ones.
# What matters is the gap between how many exist and
# how many actually run.

rng = np.random.default_rng(0)
D, N_EXPERTS, K = 6, 8, 2

gate_w = rng.normal(size=(D, N_EXPERTS))   # the router
expert_w = [rng.normal(size=(D, D)) * 0.3
            for _ in range(N_EXPERTS)]
experts = [(lambda x, W=W: x @ W) for W in expert_w]

def softmax(v):
    e = np.exp(v - v.max())
    return e / e.sum()

def moe_layer(x, gate_w, experts, k=K):
    scores = x @ gate_w              # score per expert
    top = np.argsort(scores)[-k:][::-1]   # k best
    weights = softmax(scores[top])   # renormalise
    out = np.zeros_like(x)
    for w, i in zip(weights, top):
        out = out + w * experts[i](x)  # ONLY these run
    return out, top, weights

TOKENS = ["billing", "login", "shipping",
          "refund", "returns"]

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, MUTE, INFO = E + "[32m", E + "[90m", E + "[34m"
note = lambda s: print(DIM + s + OFF)

def lanes(top, n):
    # One column per expert: lit if it ran.
    cells = []
    for i in range(n):
        lit = OK + "#" + OFF
        cells.append(lit if i in top else MUTE + "." + OFF)
    return "".join(cells)

print(BOLD + "MoE LAYER" + OFF + "  %d experts, top-%d"
      % (N_EXPERTS, K))
note("-" * 52)
note("%-10s %-9s %s" % ("TOKEN", "PICKED", "WHO RAN"))

used = set()
for name in TOKENS:
    x = rng.normal(size=D)
    _, top, w = moe_layer(x, gate_w, experts)
    used.update(top.tolist())
    picked = ",".join(str(i) for i in top)
    print("%-10s %-9s %s"
          % (name, picked, lanes(top, N_EXPERTS)))

note("-" * 52)
total = N_EXPERTS * D * D
active = K * D * D
print(BOLD + "PARAMS" + OFF + "   %s%d%s in the layer"
      % (INFO, total, OFF))
pct = 100.0 * active / total
print(BOLD + "COMPUTE" + OFF + "  %s%d%s per token %s(%.0f%%)%s"
      % (OK, active, OFF, DIM, pct, OFF))

print()
note("That gap is the architecture. Add experts and the")
note("parameter count grows; compute per token does not,")
note("because k stays at %d. The router picks who wakes."
     % K)
note("Across these tokens it used %d of %d experts."
     % (len(used), N_EXPERTS))

# Try it: set K = N_EXPERTS. The model is dense again,
# compute hits 100%, and the router stops mattering.

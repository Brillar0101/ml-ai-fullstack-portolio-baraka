import random

# Temperature reshapes a distribution before the model
# draws from it. This is a distribution, so it is drawn
# as one: a row per word, a bar per probability.

NEXT_WORD = {"Daily": 0.30, "Bean": 0.25, "Morning": 0.20,
             "Roast": 0.15, "Ember": 0.07, "Zenith": 0.03}

def at_temperature(dist, t):
    if t == 0:
        top = max(dist, key=dist.get)      # greedy: no dice
        return {w: float(w == top) for w in dist}
    scaled = {w: p ** (1.0 / t) for w, p in dist.items()}
    total = sum(scaled.values())
    return {w: v / total for w, v in scaled.items()}

def sample(dist, rng):
    r, acc = rng.random(), 0.0
    for w, p in dist.items():
        acc += p
        if r <= acc:
            return w
    return list(dist)[-1]

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, MUTE = E + "[32m", E + "[33m", E + "[90m"
note = lambda s: print(DIM + s + OFF)

WIDTH = 26

def histogram(dist, label):
    print(BOLD + label + OFF)
    for word, p in dist.items():
        filled = round(p * WIDTH)
        if p >= 0.5:
            colour = OK
        elif p >= 0.1:
            colour = WARN
        else:
            colour = MUTE
        bar = "#" * filled + "." * (WIDTH - filled)
        print("  %-8s %s%s%s %.2f"
              % (word, colour, bar, OFF, p))
    print()

for t in (0.0, 1.0, 1.8):
    histogram(at_temperature(NEXT_WORD, t),
              "temperature %.1f" % t)

note("-" * 46)
note("%-14s %s" % ("TEMPERATURE", "10 DRAWS, SAME SEED"))
for t in (0.0, 0.5, 1.0, 1.8):
    rng = random.Random(11)          # only t changes
    shifted = at_temperature(NEXT_WORD, t)
    draws = [sample(shifted, rng) for _ in range(10)]
    distinct = len(set(draws))
    colour = OK if distinct == 1 else WARN
    print("%-14.1f %s%d distinct%s  %s"
          % (t, colour, distinct, OFF,
             " ".join(d[:4] for d in draws)))

print()
note("At zero the distribution collapses onto one word")
note("and the model stops rolling dice, which is what")
note("you want for pulling a total off an invoice. Turn")
note("it up and the flat tail comes into play, which is")
note("what you want naming a coffee shop. One setting.")

# Try it: change the seed. At temperature 0 nothing moves.
# At 1.8 everything does. That gap is the whole post.

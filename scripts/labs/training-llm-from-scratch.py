import numpy as np

# The next-token objective, small enough to read.
# No framework: just the shift, and the cross-entropy
# every language model is trained to push down.

def softmax(z):
    e = np.exp(z - z.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)

def next_token_loss(logits, tokens):
    preds = logits[:, :-1, :]     # drop the last position
    targets = tokens[:, 1:]       # shift left by one
    probs = softmax(preds)
    B, T, V = probs.shape
    flat = probs.reshape(B * T, V)
    picked = flat[np.arange(B * T), targets.reshape(-1)]
    return float(-np.log(picked + 1e-12).mean())

VOCAB = ["the", "cat", "sat", "on", "mat"]
tokens = np.array([[0, 1, 2, 3, 4]])   # the cat sat on mat

rng = np.random.default_rng(0)
untrained = rng.normal(size=(1, 5, len(VOCAB)))

# A model that learned this sentence puts its mass
# on the token that actually comes next.
trained = np.full((1, 5, len(VOCAB)), -2.0)
for pos, nxt in enumerate(tokens[0][1:]):
    trained[0, pos, nxt] = 6.0

# Half-learned: leaning the right way, not yet certain.
partly = np.full((1, 5, len(VOCAB)), -2.0)
for pos, nxt in enumerate(tokens[0][1:]):
    partly[0, pos, nxt] = 1.0

# ---- Report ----------------------------------------
# Colour marks direction of travel: red is where
# training starts, gold is progress, green is a model
# that has learned the sentence.
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, BAD = E + "[32m", E + "[33m", E + "[31m"

V = len(VOCAB)

def bar(ppl, width=12):
    # Full bar = as unsure as a uniform guess.
    frac = min((ppl - 1) / (V - 1), 1.0)
    filled = round(frac * width)
    return "#" * filled + "." * (width - filled)

note = lambda s: print(DIM + s + OFF)

print(BOLD + "TRAINING" + OFF + "  vocab=%d" % V)
note("-" * 50)
note("%-13s %6s %7s  %s"
     % ("STAGE", "LOSS", "PPL", "STILL UNSURE"))

STAGES = [
    ("untrained", untrained, BAD),
    ("half-learned", partly, WARN),
    ("trained", trained, OK),
]

for name, logits, colour in STAGES:
    loss = next_token_loss(logits, tokens)
    ppl = float(np.exp(loss))
    print("%-13s %6.3f %7.2f  %s%s%s"
          % (name, loss, ppl, colour, bar(ppl), OFF))

note("-" * 50)
print(BOLD + "PPL READS AS" + OFF
      + "  words it is choosing between per step")

print()
note("Perplexity is just exp(loss). The untrained")
note("model is still choosing between several options.")
note("The trained one has nearly made up its mind.")
note("Training moves the first number to the second,")
note("over and over, on a great deal of text.")

# Try it: lower 6.0 to 1.0 in `trained` and watch
# perplexity climb back toward the vocabulary size.

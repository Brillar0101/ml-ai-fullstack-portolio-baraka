# A web handler computes once and returns once. Token
# generation loops, and every pass re-reads the whole
# model. That one difference is why this workload
# needs different infrastructure.

class TinyModel:
    """A stand-in. No real weights, but it counts the passes
    so the shape of the cost is visible."""
    eos = "<end>"

    def __init__(self):
        self.weight_reads = 0

    def encode(self, prompt):
        return prompt.split()

    def forward(self, tokens):
        self.weight_reads += 1   # the whole model, pulled
        script = ["Refunds", "take", "five", "business",
                  "days", self.eos]
        i = len(tokens) - self.prompt_len
        return script[min(i, len(script) - 1)]

    def decode(self, token):
        return token

# ---- Normal web handler: one step, done ----------------
DB = {"u1": {"name": "Ada"}}

def get_user(user_id):
    row = DB[user_id]              # a few milliseconds
    return {"name": row["name"]}   # whole answer at once

# ---- LLM handler: one pass per token -------------------
def generate(prompt, model, max_tokens=64):
    tokens = model.encode(prompt)
    model.prompt_len = len(tokens)
    for _ in range(max_tokens):
        nxt = model.forward(tokens)  # full weight pass
        if nxt == model.eos:
            break
        tokens.append(nxt)
        yield model.decode(nxt)       # send this piece now

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, BAD, INFO = (E + "[32m", E + "[33m",
                       E + "[31m", E + "[34m")
note = lambda s: print(DIM + s + OFF)

model = TinyModel()
words = list(generate("how long do refunds take", model))
per_answer = model.weight_reads

one = BOLD + "ONE REQUEST" + OFF
print(one + "  the same work, two shapes")
note("-" * 52)
note("%-16s %-9s %s" % ("HANDLER", "PASSES", "RETURNS"))
print("%-16s %s%-9d%s %s"
      % ("web (db read)", OK, 1, OFF, "all at once"))
print("%-16s %s%-9d%s %s"
      % ("llm (generate)", BAD, per_answer, OFF,
         "%d words, streamed" % len(words)))

print()
many = BOLD + "N USERS AT ONCE" + OFF
print(many + "  weight reads needed")
note("-" * 52)
note("%-8s %12s %10s %s"
     % ("USERS", "UNBATCHED", "BATCHED", "SAVED"))

# Best case: assumes every user wants the same number of
# tokens. Uneven lengths are what continuous batching is
# for, and they claw some of this back.
for n in (1, 8, 32):
    unbatched = n * per_answer   # each user reads alone
    batched = per_answer         # one read serves all
    saved = 100.0 * (1 - batched / unbatched)
    colour = OK if saved > 50 else WARN
    print("%-8d %12d %10d %s%.0f%%%s"
          % (n, unbatched, batched, colour, saved, OFF))

note("-" * 52)
why = BOLD + "WHY" + OFF
print(why + "  a pass loads every weight to do a")
print("     tiny amount of arithmetic, so the hardware")
print("     waits on memory instead of computing")

print()
note("That is what memory-bound means. The fix is not")
note("a faster chip, it is putting more requests into")
note("one pass so a single expensive read serves them")
note("all. Serving frameworks exist to keep it full.")

# Try it: make the answer twice as long and watch
# every number double. Then picture 32 users alone.

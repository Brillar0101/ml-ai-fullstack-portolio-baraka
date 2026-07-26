# Two scaling policies over the same day. Same queue;
# only the rule for changing replica count differs.

MAX_REPLICAS = 12
TARGET_PER_REPLICA = 4
BOOT_MINUTES = 2   # useless while it loads
CAPACITY = 4       # requests a warm replica clears/min

# A ramp, a spike, then a quiet afternoon.
QUEUE = [0, 2, 6, 14, 30, 60, 48, 30, 18, 9, 4, 1,
         0, 0, 0, 0, 0, 0,
         4, 18, 44, 60, 40, 20]

def warm_floor(depth, current, floor=2):
    """Warm pool, shed slowly."""
    need = -(-depth // TARGET_PER_REPLICA)
    need = min(max(need, floor), MAX_REPLICAS)
    if need > current:
        return need          # scale up fast
    if need < current:
        return current - 1   # shed one at a time
    return current

def scale_to_zero(depth, current):
    """Chase the queue both ways, floor of zero."""
    need = -(-depth // TARGET_PER_REPLICA)
    return min(max(need, 0), MAX_REPLICAS)

def simulate(policy):
    current, booting, cold, waited = 0, [], 0, 0
    for depth in QUEUE:
        warm = current - len(booting)
        served = warm * CAPACITY
        waited += max(depth - served, 0)
        booting = [b - 1 for b in booting if b - 1 > 0]
        nxt = policy(depth, current)
        if nxt > current:
            new = nxt - current
            cold += new
            booting += [BOOT_MINUTES] * new
        current = nxt
    return cold, waited

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, BAD = E + "[32m", E + "[33m", E + "[31m"
note = lambda s: print(DIM + s + OFF)

print(BOLD + "TRAFFIC" + OFF + "  queue depth per minute")
note("-" * 52)
for i in range(0, len(QUEUE), 6):
    row = QUEUE[i:i + 6]
    cells = " ".join("%3d" % q for q in row)
    print("  min %-2d  %s" % (i, cells))
print()

print(BOLD + "POLICY" + OFF + "         %-13s %s"
      % ("COLD STARTS", "QUEUED"))
note("-" * 52)

results = {}
for name, policy in [("warm floor", warm_floor),
                     ("scale to zero", scale_to_zero)]:
    cold, waited = simulate(policy)
    results[name] = (cold, waited)
    colour = OK if name == "warm floor" else BAD
    print("%-15s %s%-14d%s %s%d%s"
          % (name, colour, cold, OFF, colour, waited, OFF))

note("-" * 52)
c1, w1 = results["warm floor"]
c2, w2 = results["scale to zero"]
cost = BOLD + "COST" + OFF
print(cost + "  chasing the queue down costs")
print("      %s%d%s extra cold starts and %s%d%s more"
      % (BAD, c2 - c1, OFF, BAD, w2 - w1, OFF))
print("      queued requests across one day")

print()
note("A replica needs %d minutes to load a model"
     % BOOT_MINUTES)
note("before it serves anything. Scaling into a quiet")
note("spell means paying that wait again on the way")
note("back up, while the queue builds behind you.")
note("")
note("Note the saving is exactly the floor size: the")
note("two replicas kept warm are the two boots avoided.")
note("A warm floor buys back precisely what it holds.")

# Try it: set BOOT_MINUTES = 0. The two policies converge,
# because the whole asymmetry exists to pay for that boot.

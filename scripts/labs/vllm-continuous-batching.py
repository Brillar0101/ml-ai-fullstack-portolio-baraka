# Static against continuous batching, one step at a
# time. No GPU: this is a scheduler you can read.
# Each request needs a different number of decode
# steps, which is the whole source of the problem.

REQUESTS = [
    ("yes or no", 2),
    ("explain attention", 40),
    ("capital of France", 3),
    ("400-word overview", 60),
]
SLOTS = 2      # how many the GPU holds at once

def static_batching(requests, slots):
    """Fill the bus, run until the LAST rider is
    done, only then reload."""
    step, waiting, done = 0, list(requests), {}
    while waiting:
        batch = waiting[:slots]
        waiting = waiting[slots:]
        longest = max(n for _, n in batch)
        for name, n in batch:
            done[name] = step + longest  # held to slowest
        step += longest
    return step, done

def continuous_batching(requests, slots):
    """Evict finished each step, admit the next."""
    step, waiting = 0, list(requests)
    running, done = [], {}
    while waiting or running:
        while waiting and len(running) < slots:
            name, n = waiting.pop(0)
            running.append([name, n])
        step += 1
        for slot in running:
            slot[1] -= 1
        for slot in list(running):
            if slot[1] == 0:
                done[slot[0]] = step   # leaves at once
                running.remove(slot)
    return step, done

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, BAD = E + "[32m", E + "[33m", E + "[31m"
note = lambda s: print(DIM + s + OFF)

s_total, s_done = static_batching(REQUESTS, SLOTS)
c_total, c_done = continuous_batching(REQUESTS, SLOTS)

hdr = BOLD + "BATCHING" + OFF
print(hdr + "  %d requests, %d slots"
      % (len(REQUESTS), SLOTS))
note("-" * 52)
note("%-18s %5s %7s %7s %s"
     % ("REQUEST", "WORK", "STATIC", "CONT", "WASTED"))

wasted_total = 0
for name, work in REQUESTS:
    s, c = s_done[name], c_done[name]
    wasted = s - work    # steps waiting, not working
    wasted_total += wasted
    if wasted >= 20:
        colour = BAD
    else:
        colour = WARN if wasted else OK
    print("%-18s %5d %7d %7d %s%+d%s"
          % (name, work, s, c, colour, wasted, OFF))

note("-" * 52)
tp = BOLD + "THROUGHPUT" + OFF
print(tp + "  static finishes at %s%d%s, continuous"
      % (BAD, s_total, OFF))
print("            at %s%d%s, on the same hardware"
      % (OK, c_total, OFF))
print("            static wasted %s%d%s request-steps"
      % (BAD, wasted_total, OFF))
print("            holding finished work in its seat")

print()
note("The yes-or-no question needs 2 steps and leaves")
note("at 2 under continuous batching. Under static it")
note("sits in the bus until its 40-step neighbour is")
note("done. Every short request pays for whoever it")
note("happened to sit beside, and the whole batch")
note("finishes later for it.")

# Try it: set SLOTS = 4 so everything fits at once.
# Static still makes fast requests wait for the
# slowest, because that is the rule, not capacity.

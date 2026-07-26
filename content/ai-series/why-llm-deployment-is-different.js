export const POST = {
  id: 'why-llm-deployment-is-different',
  title: 'Why an LLM Endpoint Breaks the Rules You Learned From Web Services',
  excerpt: 'A CRUD API answers in milliseconds and costs almost nothing per call. An LLM behind the same autoscaling setup can burn money and still feel slow. Here is what actually changes.',
  category: 'AI',
  tags: ['Deployment', 'Inference', 'Production'],
  body: [
    {
      type: 'p',
      text: 'Picture a team shipping their first chat feature on a Friday. They already run a solid backend: a Python API, a load balancer, autoscaling that adds replicas when CPU climbs. They wrap an open-weight language model in the same pattern, give each container one GPU, and set the autoscaler to spin up more containers when traffic rises. It passes the demo. Then real users show up.',
    },
    {
      type: 'p',
      text: 'By Monday two numbers look wrong. The GPU bill is several times higher than the estimate, and replies are slow even though each machine sits mostly idle. Utilization on a setup like this typically lands somewhere in the low tens of percent, and that is the tell: expensive hardware barely working while users still wait. Nothing in ordinary web-service instincts explains it. That gap is the whole point of this post.'
    },
    {
      type: 'h2',
      text: 'The instinct that works for CRUD and fails for models'
    },
    { type: 'p', text: 'Here is the mental model that got them in trouble, and it is a good one for normal services. A typical web request is short and self-contained. It reads a row, checks a permission, writes a record, returns JSON. It finishes in a few milliseconds and leaves nothing behind. Because each request is cheap and stateless, you can treat capacity as a simple ratio.' },
      { type: 'p', text: 'If one replica handles 200 requests per second and you need 1000, you run five replicas. Traffic doubles, you double the boxes. The unit of work is tiny, so packing and scaling are easy.' },
    { type: 'p', text: 'A language model request breaks almost every assumption in that sentence. It is not short. It is not cheap. It does not finish and leave nothing behind.' },
      { type: 'p', text: 'And the resource it fights over, the GPU, does not behave like a CPU you can casually slice into small pieces. The team applied a ratio that only holds when work is small and uniform, to work that is large and lumpy.' },
    {
      type: 'h2',
      text: 'Walk one request through, token by token'
    },
    { type: 'p', text: 'Say a user sends the prompt "Summarize this email in one line" plus the email text. A CRUD endpoint would look something like a lookup and a response.' },
      { type: 'p', text: 'The model does something different. It reads the whole prompt, then produces the answer one word-piece at a time. First it emits a token, maybe "The". To pick the next token it feeds "The" back in and runs the entire model again to get "sender". Then again for "wants", again for "a", and so on until it decides to stop.' },
    { type: 'p', text: 'So a 40-token answer means roughly 40 full passes through a multi-billion-parameter network, in sequence, one after another. You cannot compute token 5 before you have token 4, because token 4 is part of the input that decides token 5. That single fact explains the slow replies.' },
      { type: 'p', text: 'The response time is not fixed. It grows with how many tokens you generate. A one-line summary is quick. A three-paragraph answer to the same prompt takes several times longer, not because the prompt changed, but because there are more sequential steps.' },
    { type: 'p', text: 'It helps to split that time into two parts. The first is the wait until the very first token shows up, which covers how long the request sat in a queue and how long the model took to read the whole prompt. The second is the steady drip of every token after that.' },
      { type: 'p', text: 'A user who asks for a long essay feels the second part. A user stuck behind a busy queue feels the first. When you measure a model service, you have to watch both, because a fast per-token rate hides a slow start, and a quick start hides a long tail. The team had only one latency number on their dashboard, so they never saw which half was hurting them.' },
    {
      type: 'callout',
      title: 'The shape of the latency',
      text: 'Web latency is mostly a constant plus network time. LLM latency is a startup cost to read the prompt, then a per-token cost repeated once for every token you produce. Longer answers cost more time by construction, not by accident.'
    },
    {
      type: 'h2',
      text: 'The words you need before going further'
    },
    {
      type: 'terms',
      items: [
        { term: 'Autoregressive generation', def: 'The model produces output one token at a time, and each new token is fed back in as input to produce the next one. The steps are sequential and cannot be parallelized within a single response.' },
        { term: 'Time to first token (TTFT)', def: 'How long the user waits from sending the request until the first token appears. This covers queue time plus reading and processing the prompt.' },
        { term: 'Latency vs throughput', def: 'Latency is how fast one user gets their answer. Throughput is how many tokens the whole system produces per second across all users. On a GPU these two pull against each other, and tuning for one can hurt the other.' },
        { term: 'Memory-bound', def: 'The work is limited by moving data in and out of GPU memory rather than by raw math. During generation the model spends much of its time reading weights and cached state, so memory bandwidth and capacity set the ceiling, not compute alone.' },
        { term: 'Batching', def: 'Running many users\' requests through the model together in one pass. Because the GPU reads the model weights once per pass, serving 32 requests at once costs barely more than serving 1, which is where almost all the efficiency lives.' }
      ]
    },
    {
      type: 'h2',
      text: 'Why one request per GPU wastes the machine'
    },
    { type: 'p', text: 'Now the mechanism behind that idle-but-expensive hardware. A GPU is thousands of small arithmetic units built to do enormous amounts of math in parallel. To do that math it first has to load the model weights from memory. Generating the next token for a single request needs a small amount of actual computation but still forces the GPU to pull those billions of weights across the memory bus.' },
      { type: 'p', text: 'So the expensive units sit around waiting on memory while doing very little math. This is what memory-bound means in practice. You paid for a wide compute engine and then fed it one thin request at a time.' },
    { type: 'p', text: 'Batching fixes this. If you gather 32 requests and run them through the same pass, the GPU loads the weights once and reuses them for all 32.' },
      { type: 'p', text: 'The math units finally have enough to chew on. Throughput can climb roughly an order of magnitude while the cost of loading weights stays flat. The team that gave each GPU a single request never batched anything, so every machine did the memory-heavy work of a full model pass to serve exactly one user. That is why the bill was high and the boxes looked idle at the same time.' },
    { type: 'p', text: 'There is a second memory pressure worth naming. As the model generates, it keeps a running cache of internal state for every token so far, so it does not recompute the past on each step.' },
      { type: 'p', text: 'That cache is called the KV cache, and it grows with every token and with every request you batch together. It lives in the same scarce GPU memory as the weights. So batching helps throughput but also eats memory, and long conversations eat more. Serving an LLM is largely the job of packing as many requests as possible into a batch without running out of memory.' },
    {
      type: 'h2',
      text: 'A queue, a batch, and a stream'
    },
    {
      type: 'p',
      text: 'The setup that actually works looks different from a stateless web tier. Requests arrive and land in a short queue. A scheduler on the GPU pulls a batch of them, runs generation steps for the whole batch together, and streams tokens back to each user as they are produced. Users see the first words fast because you stream instead of waiting for the full answer, and the GPU stays busy because it is always working on a full batch rather than one lonely request.'
    },
    {
      type: 'diagram',
      nodes: [
        { label: 'CRUD request', detail: 'Read row, return JSON. Milliseconds. Nothing kept afterward.' },
        { label: 'LLM request arrives', detail: 'Joins a queue instead of running alone' },
        { label: 'Scheduler forms a batch', detail: 'Many users packed into one GPU pass' },
        { label: 'Autoregressive generation', detail: 'One token per step for the whole batch, weights loaded once' },
        { label: 'Stream tokens back', detail: 'Each user sees words as they appear, low time to first token' }
      ],
      caption: 'A web request finishes in one hop. An LLM request is queued, batched, generated step by step, and streamed.'
    },
    {
      type: 'p',
      text: 'The code difference is smaller than the mental shift, but it is real. A normal handler computes a result and returns it in one shot. A generation handler yields tokens over time, which is why LLM APIs expose streaming responses.'
    },
    { type: 'lab', height: 460,
        title: 'A web handler and a generation loop, counted',
        caption: 'A web handler touches its data once. Generating five words costs six full reads of the model. The second table is why batching is the lever that matters: at 32 concurrent users, one shared pass does the work of 192 separate ones.',
        code: `# A web handler computes once and returns once. Token
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
` },
    {
      type: 'h2',
      text: 'The mistakes that cost this team money'
    },
    {
      type: 'ul',
      items: [
        'Scaling on CPU utilization. The GPU is the bottleneck, and CPU stayed low while the GPU was saturated or starved, so the autoscaler made the wrong call every time.',
        'One request per GPU. Skipping batching left the most expensive resource loading weights for a single user, which is where the wasted spend came from.',
        'Treating latency as fixed. A timeout tuned for a millisecond API cut off long answers, because generation time scales with output length.',
        'Ignoring the KV cache. Long chats quietly filled GPU memory, and requests failed under load with out-of-memory errors that looked random.',
        'Waiting for the full answer before responding. Without streaming, users stared at a spinner for the entire generation instead of watching words arrive.'
      ]
    },
    { type: 'p', text: 'The fix is not a bigger GPU. It is putting a real inference server in front of the model, one that batches incoming requests, streams tokens, and manages the KV cache carefully. Utilization goes up, cost per answer comes down, and time to first token falls because users no longer wait on a full response.' },
      { type: 'p', text: 'The hardware is identical. The serving strategy is the whole difference. The useful shift is less an infrastructure upgrade than admitting the workload is a different kind of thing: stop picturing tiny stateless requests, start picturing a GPU that wants to stay full, and every other decision falls into place.' },
    {
      type: 'h2',
      text: 'What to carry into your next deploy'
    },
    { type: 'p', text: 'When you put a model in production, stop reasoning about requests and start reasoning about tokens and batches. Ask how many tokens a typical answer produces, because that sets your latency. Ask how many requests you can pack onto one GPU before memory runs out, because that sets your cost. Scale on GPU signals, not CPU. Stream so the first token arrives quickly even when the full answer is long.' },
      { type: 'p', text: 'And use a serving layer built for this, since batching and cache management are hard to get right by hand. A CRUD API rewards keeping each request small and independent. An LLM rewards the opposite: gather work together, and keep the expensive machine full.' },
    {
      type: 'sources',
      items: [
        { title: 'Pope et al., Efficiently Scaling Transformer Inference (2022)', url: 'https://arxiv.org/abs/2211.05102' },
        { title: 'Kwon et al., Efficient Memory Management for LLM Serving with PagedAttention (2023)', url: 'https://arxiv.org/abs/2309.06180' }
      ]
    }
  ]
};

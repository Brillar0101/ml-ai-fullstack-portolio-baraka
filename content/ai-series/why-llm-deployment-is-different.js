export const POST = {
  id: 'why-llm-deployment-is-different',
  title: 'Why an LLM Endpoint Breaks the Rules You Learned From Web Services',
  excerpt: 'A CRUD API answers in milliseconds and costs almost nothing per call. An LLM behind the same autoscaling setup can burn money and still feel slow. Here is what actually changes.',
  category: 'AI',
  tags: ['Deployment', 'Inference', 'Production'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A small team I worked with shipped their first chat feature on a Friday. They already ran a solid backend: a Python API, a load balancer, autoscaling that added replicas when CPU climbed. They wrapped an open-weight language model in the same pattern, gave each container one GPU, and set the autoscaler to spin up more containers when traffic rose. It passed the demo. Then real users showed up.'
    },
    {
      type: 'p',
      text: 'By Monday two numbers looked wrong. The GPU bill was several times higher than their estimate, and the median reply took eight seconds even though each machine sat mostly idle. Their dashboards said GPU utilization was around 12 percent. So they were paying for expensive hardware that was barely working, and users were still waiting. Nothing in their web-service instincts explained it. That gap is the whole point of this post.'
    },
    {
      type: 'h2',
      text: 'The instinct that works for CRUD and fails for models'
    },
    {
      type: 'p',
      text: 'Here is the mental model that got them in trouble, and it is a good one for normal services. A typical web request is short and self-contained. It reads a row, checks a permission, writes a record, returns JSON. It finishes in a few milliseconds and leaves nothing behind. Because each request is cheap and stateless, you can treat capacity as a simple ratio. If one replica handles 200 requests per second and you need 1000, you run five replicas. Traffic doubles, you double the boxes. The unit of work is tiny, so packing and scaling are easy.'
    },
    {
      type: 'p',
      text: 'A language model request breaks almost every assumption in that sentence. It is not short. It is not cheap. It does not finish and leave nothing behind. And the resource it fights over, the GPU, does not behave like a CPU you can casually slice into small pieces. The team applied a ratio that only holds when work is small and uniform, to work that is large and lumpy.'
    },
    {
      type: 'h2',
      text: 'Walk one request through, token by token'
    },
    {
      type: 'p',
      text: 'Say a user sends the prompt "Summarize this email in one line" plus the email text. A CRUD endpoint would look something like a lookup and a response. The model does something different. It reads the whole prompt, then produces the answer one word-piece at a time. First it emits a token, maybe "The". To pick the next token it feeds "The" back in and runs the entire model again to get "sender". Then again for "wants", again for "a", and so on until it decides to stop.'
    },
    {
      type: 'p',
      text: 'So a 40-token answer means roughly 40 full passes through a multi-billion-parameter network, in sequence, one after another. You cannot compute token 5 before you have token 4, because token 4 is part of the input that decides token 5. That single fact explains the slow replies. The response time is not fixed. It grows with how many tokens you generate. A one-line summary is quick. A three-paragraph answer to the same prompt takes several times longer, not because the prompt changed, but because there are more sequential steps.'
    },
    {
      type: 'p',
      text: 'It helps to split that time into two parts. The first is the wait until the very first token shows up, which covers how long the request sat in a queue and how long the model took to read the whole prompt. The second is the steady drip of every token after that. A user who asks for a long essay feels the second part. A user stuck behind a busy queue feels the first. When you measure a model service, you have to watch both, because a fast per-token rate hides a slow start, and a quick start hides a long tail. The team had only one latency number on their dashboard, so they never saw which half was hurting them.'
    },
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
    {
      type: 'p',
      text: 'Now the mechanism behind the 12 percent utilization. A GPU is thousands of small arithmetic units built to do enormous amounts of math in parallel. To do that math it first has to load the model weights from memory. Generating the next token for a single request needs a small amount of actual computation but still forces the GPU to pull those billions of weights across the memory bus. So the expensive units sit around waiting on memory while doing very little math. This is what memory-bound means in practice. You paid for a wide compute engine and then fed it one thin request at a time.'
    },
    {
      type: 'p',
      text: 'Batching fixes this. If you gather 32 requests and run them through the same pass, the GPU loads the weights once and reuses them for all 32. The math units finally have enough to chew on. Throughput can climb roughly an order of magnitude while the cost of loading weights stays flat. The team that gave each GPU a single request never batched anything, so every machine did the memory-heavy work of a full model pass to serve exactly one user. That is why the bill was high and the boxes looked idle at the same time.'
    },
    {
      type: 'p',
      text: 'There is a second memory pressure worth naming. As the model generates, it keeps a running cache of internal state for every token so far, so it does not recompute the past on each step. That cache is called the KV cache, and it grows with every token and with every request you batch together. It lives in the same scarce GPU memory as the weights. So batching helps throughput but also eats memory, and long conversations eat more. Serving an LLM is largely the job of packing as many requests as possible into a batch without running out of memory.'
    },
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
    {
      type: 'code',
      lang: 'python',
      title: 'Blocking response vs streamed generation',
      code: `# Normal web handler: compute once, return once.
def get_user(user_id):
    row = db.fetch(user_id)      # a few milliseconds
    return {"name": row.name}    # whole answer at once

# LLM handler: one model pass per token, streamed out.
def generate(prompt, model, max_tokens=64):
    tokens = model.encode(prompt)
    for _ in range(max_tokens):
        logits = model.forward(tokens)   # full pass over the weights
        next_id = logits[-1].argmax()    # pick the next token
        if next_id == model.eos:
            break
        tokens.append(next_id)
        yield model.decode(next_id)      # send this piece now

# The web handler ends in one step.
# generate() loops, and total time grows with the token count.`
    },
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
    {
      type: 'p',
      text: 'The fix was not a bigger GPU. They put a real inference server in front of the model, one that batches incoming requests, streams tokens, and manages the KV cache carefully. Utilization went up, the per-answer cost dropped by most of its value, and time to first token fell because users no longer waited on a full response. The hardware was the same. The serving strategy was the whole difference. What surprised them most was that the change felt less like an infrastructure upgrade and more like admitting the workload was a different kind of thing. Once they stopped picturing tiny stateless requests and started picturing a GPU that wants to stay full, every other decision fell into place.'
    },
    {
      type: 'h2',
      text: 'What to carry into your next deploy'
    },
    {
      type: 'p',
      text: 'When you put a model in production, stop reasoning about requests and start reasoning about tokens and batches. Ask how many tokens a typical answer produces, because that sets your latency. Ask how many requests you can pack onto one GPU before memory runs out, because that sets your cost. Scale on GPU signals, not CPU. Stream so the first token arrives quickly even when the full answer is long. And use a serving layer built for this, since batching and cache management are hard to get right by hand. A CRUD API rewards keeping each request small and independent. An LLM rewards the opposite: gather work together, and keep the expensive machine full.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Pope et al., Efficiently Scaling Transformer Inference (2022)', url: 'https://arxiv.org/abs/2211.05102' },
        { title: 'Kwon et al., Efficient Memory Management for LLM Serving with PagedAttention (2023)', url: 'https://arxiv.org/abs/2309.06180' }
      ]
    }
  ]
};

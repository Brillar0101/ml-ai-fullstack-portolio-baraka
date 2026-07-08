export const POST = {
  id: 'vllm-continuous-batching',
  title: 'vLLM and Continuous Batching: Where the Extra Throughput Actually Comes From',
  excerpt: 'A self-hosted 13B model on one GPU could barely serve a handful of people before it choked. The model never changed. Two scheduling and memory ideas did, and the same card started serving several times as many users.',
  category: 'AI',
  tags: ['Deployment', 'vLLM', 'Batching'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A team ships an internal assistant on a 13B model they host themselves. One A100, one process, a plain generation server in front of it. During the demo it feels quick. Then twenty people open the tool at once and it falls apart. Requests sit in a queue for seconds before the first token appears, the GPU utilization graph reads a sad 30 percent, and someone asks the obvious question: we paid for a whole GPU, why does it act like it can only talk to five people at a time? Nothing is broken. The model is fine. The problem is how requests are packed onto the card, and how the memory for each request is reserved. Fix those two things and the same hardware serves several times the traffic.'
    },
    {
      type: 'p',
      text: 'This is the exact gap **vLLM** was built to close. It did not train a faster model or quantize anything away. It changed the scheduler and it changed how the key-value cache is stored. Those two ideas are the whole story behind the throughput jump, and once you see them the earlier slowness looks less like bad luck and more like the default way of serving models leaving most of the GPU on the table.'
    },
    {
      type: 'h2',
      text: 'Why the GPU sits half-idle while people wait'
    },
    {
      type: 'p',
      text: 'Start with an intuition that has nothing to do with machine learning. Picture a small shuttle bus that only leaves when every seat is full and only returns to the depot once every passenger has reached their stop. Eight people board. Seven have short trips downtown, one is going to the far edge of the city. The bus drops the seven, then drives the whole rest of the route for the single long rider while seven empty seats ride along. Back at the depot, a line of new passengers has been waiting the entire time, because the bus could not pick anyone up until it finished its slowest rider. Most of the trip, most of the seats were empty, and the depot queue kept growing.'
    },
    {
      type: 'p',
      text: 'That bus is **static batching**, the old default. The server collects a batch of requests, runs them together step by step, and does not accept new work until the entire batch finishes. Language model requests are wildly uneven in length. One user wants a two-word yes or no, another wants a thousand-token essay. Under static batching the short requests finish early but their slots stay locked, producing nothing, until the longest request in the batch is done. The GPU keeps doing math for those dead slots. That is where the 30 percent utilization comes from. You are paying to move empty seats.'
    },
    {
      type: 'h2',
      text: 'Adding and dropping riders at every stop'
    },
    {
      type: 'p',
      text: 'Now change one rule on the bus. It may pick up and drop off at every single stop. The moment a rider reaches their destination, their seat opens, and the moment a seat is open a waiting person climbs in. The bus is always as full as the depot line allows, and nobody waits for the slowest rider to finish before boarding. That is **continuous batching**, sometimes called in-flight batching. A transformer generates one token per request per step, so every step is a natural stop. At each step vLLM checks the running group: any request that just emitted its end token is evicted immediately, and its freed slot is handed to a request that was waiting in the queue.'
    },
    {
      type: 'p',
      text: 'Walk the earlier example through it. Eight requests are running, seven short and one long. Around step forty the seven short ones finish. Under static batching those seven slots would idle until the long request wraps up near step eight hundred. Under continuous batching, at step forty-one seven queued requests slide into the freed slots and start generating. The long request keeps going in its lane, undisturbed, while fresh work fills the space around it. The GPU is doing useful math on a full batch almost the whole time instead of grinding through mostly-empty steps. Same model, same card, but the idle time that static batching baked in is mostly gone.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Static batching', def: 'Grouping requests and running them together until every request in the group finishes, only then accepting new work. Short requests hold their slots idle while the longest one runs.' },
        { term: 'Continuous (in-flight) batching', def: 'Re-forming the running batch at every token step: finished requests are removed and queued requests are admitted right away, so the batch stays full.' },
        { term: 'KV cache', def: 'The per-request store of key and value vectors for every token generated so far. The model reuses it each step instead of recomputing attention over the whole sequence.' },
        { term: 'PagedAttention', def: 'Storing the KV cache in small fixed-size pages that need not be contiguous in memory, mapped through a lookup table, the way an operating system maps virtual memory to physical pages.' },
        { term: 'Throughput', def: 'How many tokens or requests the server completes per second across all users, as opposed to the latency any single user feels.' }
      ]
    },
    {
      type: 'h2',
      text: 'The memory tax that capped the batch size'
    },
    {
      type: 'p',
      text: 'Better scheduling only helps if you can actually fit more requests in memory at the same time, and here the old approach quietly wasted most of it. Each request needs a **KV cache** that grows as it generates. Because you cannot know in advance how long an answer will run, the classic serving stack reserves one contiguous block sized for the maximum possible length, up front, for every request. A user who stops after 30 tokens still holds a block cut for 2,000. That reserved-but-unused space, plus the gaps left between blocks, meant a large share of GPU memory sat claimed and empty. The batch could not grow because memory looked full even though most of it held nothing.'
    },
    {
      type: 'p',
      text: 'PagedAttention borrows the trick your operating system uses for RAM. Instead of one big contiguous reservation, the KV cache is cut into small fixed-size **pages**, and a per-request table maps the sequence to whatever physical pages are free, in any order. A request grabs pages only as it generates, one at a time. When it finishes, its pages return to a shared pool for the next request. The near-total reservation waste collapses to a sliver, at most one partly-filled page per sequence. With that memory freed, far more requests fit at once, which is exactly the fuel continuous batching needs to keep the batch full.'
    },
    {
      type: 'diagram',
      rows: [
        [
          { label: 'Static batching', detail: 'Batch of 8 held until slowest finishes' },
          { label: 'Step 40', detail: '7 slots idle, 1 still running' },
          { label: 'Utilization', detail: 'GPU mostly empty, queue waits' }
        ],
        [
          { label: 'Continuous batching', detail: 'Batch re-formed every token step' },
          { label: 'Step 41', detail: '7 freed slots filled from queue' },
          { label: 'Utilization', detail: 'Batch stays full, queue drains' }
        ],
        [
          { label: 'PagedAttention', detail: 'KV cache split into small pages' },
          { label: 'On demand', detail: 'Pages allocated as tokens arrive' },
          { label: 'On finish', detail: 'Pages returned to shared pool' }
        ]
      ],
      caption: 'Two levers stacked: the scheduler keeps the batch full, paged memory lets far more requests share the card at once.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'Serve a model and send a batch of uneven requests',
      code: `# Start an OpenAI-compatible server, one line:
#   vllm serve mistralai/Mistral-7B-Instruct-v0.2 --max-model-len 4096

from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="local")

# Uneven prompts: some want one word, some want an essay.
prompts = [
    "Reply with only 'yes' or 'no': is water wet?",
    "Explain how a transformer attention head works, in detail.",
    "Name the capital of France.",
    "Write a 400-word overview of continuous batching.",
]

# Fire them together. vLLM slots each into the running batch,
# evicts the short ones the moment they finish, and admits the
# next waiting prompt without pausing the long ones.
for p in prompts:
    resp = client.completions.create(
        model="mistralai/Mistral-7B-Instruct-v0.2",
        prompt=p,
        max_tokens=512,
    )
    print(resp.choices[0].text.strip()[:80])`
    },
    {
      type: 'h2',
      text: 'How the two ideas multiply each other'
    },
    {
      type: 'p',
      text: 'It helps to see why these are worth more together than apart. Continuous batching keeps the batch full, but a full batch is useless if memory only lets eight requests coexist. PagedAttention raises that ceiling by reclaiming the wasted reservation, so the running group can be thirty or forty deep instead of eight. Continuous batching then keeps that larger group busy every step. One idea removes the idle time, the other removes the memory cap on how many can run, and stacked they push a card that limped along near 30 percent up toward heavy, sustained use. That compounding is why the reported gains are measured in multiples, not percentages.'
    },
    {
      type: 'callout',
      title: 'The knob that matters most',
      text: 'gpu-memory-utilization controls how much of the card vLLM claims for the paged KV pool. Set it too low and you starve the batch, capping how many requests can share the GPU. Raise it carefully, watch for out-of-memory errors under real load, and leave headroom for activation spikes.'
    },
    {
      type: 'h2',
      text: 'The mistakes that quietly give the gains back'
    },
    {
      type: 'p',
      text: 'The first trap is measuring the wrong number. If you benchmark one request at a time, continuous batching looks like it did nothing, because its whole advantage shows up only when many requests overlap. Load-test with real concurrency or you will conclude the upgrade was pointless. The second trap is confusing throughput with latency. Packing the batch fuller lifts total tokens per second, but any single user can wait a touch longer at the front of a busy queue. That trade is usually worth it, though you should decide it on purpose rather than discover it in production.'
    },
    {
      type: 'ul',
      items: [
        'Benchmarking with one request at a time, then wondering where the promised speedup went.',
        'Leaving gpu-memory-utilization at a timid default so the paged KV pool stays small and the batch cannot grow.',
        'Setting max-model-len far larger than real prompts need, which shrinks how many sequences share the card.',
        'Reading a slightly higher single-user latency as a regression instead of the expected cost of a fuller batch.',
        'Assuming a bigger GPU alone fixes it, when the real limit was scheduling and memory layout, not raw compute.'
      ]
    },
    {
      type: 'h2',
      text: 'What to carry away'
    },
    {
      type: 'p',
      text: 'Two mistakes undo these gains in practice. The first is setting the running batch far too large in the hope of more throughput, then watching latency spike and requests get preempted when the KV cache runs out of pages partway through generation. Continuous batching only helps up to the memory the GPU actually has, so the right move is to cap the batch to what fits and let the queue absorb the rest. The second is measuring throughput on short prompts with short outputs, where the scheduler barely matters, and then being surprised in production when long generations behave nothing like the benchmark did. Always test with output lengths that match real traffic.'
    },
    {
      type: 'p',
      text: 'The self-hosted model that could barely handle a handful of users was never the bottleneck. The bottleneck was a scheduler that made short requests wait on long ones and a memory scheme that reserved space it never used. Continuous batching keeps the GPU working on a full group by swapping finished requests for waiting ones at every token step. PagedAttention frees the memory that let the group be small in the first place. When you serve your own model and the utilization graph looks embarrassing, reach for these two levers before you reach for a bigger card. The extra throughput was sitting inside the GPU you already owned.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Kwon et al., Efficient Memory Management for Large Language Model Serving with PagedAttention (2023)', url: 'https://arxiv.org/abs/2309.06180' },
        { title: 'Yu et al., Orca: A Distributed Serving System for Transformer-Based Generative Models (2022)', url: 'https://www.usenix.org/conference/osdi22/presentation/yu' },
        { title: 'vLLM Documentation', url: 'https://docs.vllm.ai/en/latest/' }
      ]
    }
  ]
};
